import json
import logging
import uuid
from dataclasses import dataclass, field

from openai import AsyncOpenAI

from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class StageResult:
    stage_id: str
    stage_name: str
    passed: bool
    score: float
    matched_phrases: list[str] = field(default_factory=list)
    missing_phrases: list[str] = field(default_factory=list)
    found_forbidden_words: list[str] = field(default_factory=list)
    notes: str = ""


@dataclass
class Violation:
    stage_name: str
    type: str  # missing_phrase, forbidden_word, stage_skipped, duration_exceeded
    description: str
    severity: str = "medium"  # low, medium, high, critical


@dataclass
class ScriptAnalysisResult:
    overall_score: float
    stage_results: list[StageResult]
    violations: list[Violation]


class ScriptComplianceService:
    """Analyzes call transcriptions against script compliance rules using OpenAI."""

    def __init__(self):
        self._client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def analyze(
        self,
        transcription_text: str,
        segments: list[dict],
        script_id: uuid.UUID,
        stages: list[dict],
    ) -> ScriptAnalysisResult:
        """
        Analyze a call transcription against a script's stages.

        Args:
            transcription_text: Full transcription text of the call.
            segments: List of transcription segments with timing info.
            script_id: ID of the script being checked.
            stages: List of stage dicts with keys:
                id, name, order, required_phrases, forbidden_words, is_required, max_duration_seconds

        Returns:
            ScriptAnalysisResult with overall_score, stage_results, and violations.
        """
        if not stages:
            return ScriptAnalysisResult(overall_score=100.0, stage_results=[], violations=[])

        if not transcription_text.strip():
            # No transcription at all - all required stages fail
            stage_results = []
            violations = []
            for stage in stages:
                stage_results.append(StageResult(
                    stage_id=str(stage["id"]),
                    stage_name=stage["name"],
                    passed=not stage.get("is_required", True),
                    score=0.0 if stage.get("is_required", True) else 100.0,
                    missing_phrases=stage.get("required_phrases", []),
                    notes="No transcription available",
                ))
                if stage.get("is_required", True):
                    violations.append(Violation(
                        stage_name=stage["name"],
                        type="stage_skipped",
                        description=f"Required stage '{stage['name']}' could not be evaluated - no transcription",
                        severity="high",
                    ))
            return ScriptAnalysisResult(overall_score=0.0, stage_results=stage_results, violations=violations)

        # Step 1: Check forbidden words (exact match, case-insensitive) locally
        forbidden_word_violations = self._check_forbidden_words(transcription_text, stages)

        # Step 2: Use LLM for semantic analysis of required phrases and stage compliance
        llm_result = await self._llm_analyze(transcription_text, segments, stages)

        # Step 3: Merge forbidden word results into LLM results
        return self._merge_results(llm_result, forbidden_word_violations, stages)

    def _check_forbidden_words(
        self, transcription_text: str, stages: list[dict]
    ) -> dict[str, list[str]]:
        """Check for forbidden words in the transcription (exact, case-insensitive)."""
        text_lower = transcription_text.lower()
        results: dict[str, list[str]] = {}

        for stage in stages:
            found = []
            for word in stage.get("forbidden_words", []):
                if word.lower() in text_lower:
                    found.append(word)
            if found:
                results[str(stage["id"])] = found

        return results

    async def _llm_analyze(
        self,
        transcription_text: str,
        segments: list[dict],
        stages: list[dict],
    ) -> dict:
        """Use OpenAI GPT to semantically analyze script compliance."""
        stages_description = []
        for stage in stages:
            stage_info = {
                "stage_id": str(stage["id"]),
                "stage_name": stage["name"],
                "order": stage["order"],
                "required_phrases": stage.get("required_phrases", []),
                "is_required": stage.get("is_required", True),
                "max_duration_seconds": stage.get("max_duration_seconds"),
            }
            stages_description.append(stage_info)

        # Build segment text with timestamps for duration analysis
        segments_text = ""
        if segments:
            for seg in segments[:200]:  # Limit to avoid token overflow
                start = seg.get("start_time", seg.get("start", "?"))
                end = seg.get("end_time", seg.get("end", "?"))
                speaker = seg.get("speaker", "unknown")
                text = seg.get("text", "")
                segments_text += f"[{start}s - {end}s] ({speaker}): {text}\n"

        system_prompt = """You are a call center script compliance analyzer. Your job is to analyze a call transcription and determine how well the agent followed a prescribed script.

You will receive:
1. The full transcription of a call
2. Transcription segments with timestamps
3. A list of script stages with their required phrases

For each stage, you must:
- Determine if the stage was covered in the conversation (semantic match, not exact wording)
- Check which required phrases were semantically matched (the agent said something with the same meaning)
- Check which required phrases were missed
- Estimate a compliance score (0-100) for that stage
- Provide brief notes explaining your assessment

IMPORTANT: Use semantic matching for required phrases. The agent doesn't need to say the exact words - they need to convey the same meaning or cover the same topic.

Return your analysis as a JSON object with this exact structure:
{
  "stage_results": [
    {
      "stage_id": "stage-uuid",
      "stage_name": "Stage Name",
      "passed": true/false,
      "score": 85,
      "matched_phrases": ["phrase that was semantically matched"],
      "missing_phrases": ["phrase that was not covered"],
      "notes": "Brief explanation"
    }
  ],
  "overall_notes": "Brief overall assessment"
}

Return ONLY valid JSON, no markdown formatting or code blocks."""

        user_prompt = f"""Analyze this call transcription against the following script stages.

## Script Stages:
{json.dumps(stages_description, ensure_ascii=False, indent=2)}

## Full Transcription:
{transcription_text[:8000]}

## Transcription Segments (with timestamps):
{segments_text[:4000]}

Analyze compliance for each stage and return the JSON result."""

        try:
            response = await self._client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.1,
                max_tokens=4000,
                response_format={"type": "json_object"},
            )

            result_text = response.choices[0].message.content
            result = json.loads(result_text)
            logger.info(f"LLM script compliance analysis completed successfully")
            return result

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response as JSON: {e}")
            # Return a default structure so we can still produce results
            return {"stage_results": [], "overall_notes": "LLM analysis failed - could not parse response"}
        except Exception as e:
            logger.error(f"LLM script compliance analysis failed: {e}")
            return {"stage_results": [], "overall_notes": f"LLM analysis failed: {str(e)}"}

    def _merge_results(
        self,
        llm_result: dict,
        forbidden_word_violations: dict[str, list[str]],
        stages: list[dict],
    ) -> ScriptAnalysisResult:
        """Merge LLM analysis with forbidden word checks into a final result."""
        stage_results: list[StageResult] = []
        violations: list[Violation] = []
        llm_stages = {sr["stage_id"]: sr for sr in llm_result.get("stage_results", [])}

        # Build a stage lookup
        stage_lookup = {str(s["id"]): s for s in stages}

        for stage in stages:
            stage_id = str(stage["id"])
            stage_name = stage["name"]

            # Get LLM result for this stage, or create a default
            llm_stage = llm_stages.get(stage_id, {
                "stage_id": stage_id,
                "stage_name": stage_name,
                "passed": False,
                "score": 0,
                "matched_phrases": [],
                "missing_phrases": stage.get("required_phrases", []),
                "notes": "Stage not analyzed by LLM",
            })

            found_forbidden = forbidden_word_violations.get(stage_id, [])
            score = float(llm_stage.get("score", 0))

            # Penalize score for forbidden words
            if found_forbidden:
                penalty = min(len(found_forbidden) * 15, 50)  # Up to 50 point penalty
                score = max(0, score - penalty)

            passed = llm_stage.get("passed", False) and not found_forbidden

            stage_result = StageResult(
                stage_id=stage_id,
                stage_name=stage_name,
                passed=passed,
                score=score,
                matched_phrases=llm_stage.get("matched_phrases", []),
                missing_phrases=llm_stage.get("missing_phrases", []),
                found_forbidden_words=found_forbidden,
                notes=llm_stage.get("notes", ""),
            )
            stage_results.append(stage_result)

            # Generate violations
            for phrase in llm_stage.get("missing_phrases", []):
                if stage.get("is_required", True):
                    violations.append(Violation(
                        stage_name=stage_name,
                        type="missing_phrase",
                        description=f"Required phrase not found: '{phrase}'",
                        severity="medium",
                    ))

            for word in found_forbidden:
                violations.append(Violation(
                    stage_name=stage_name,
                    type="forbidden_word",
                    description=f"Forbidden word used: '{word}'",
                    severity="high",
                ))

            if not llm_stage.get("passed", False) and stage.get("is_required", True):
                violations.append(Violation(
                    stage_name=stage_name,
                    type="stage_skipped",
                    description=f"Required stage '{stage_name}' was not adequately covered",
                    severity="high",
                ))

        # Calculate overall score
        if stage_results:
            # Weighted: required stages count double
            total_weight = 0
            weighted_score = 0.0
            for sr, stage in zip(stage_results, stages):
                weight = 2.0 if stage.get("is_required", True) else 1.0
                weighted_score += sr.score * weight
                total_weight += weight
            overall_score = round(weighted_score / total_weight, 1) if total_weight > 0 else 0.0
        else:
            overall_score = 0.0

        return ScriptAnalysisResult(
            overall_score=overall_score,
            stage_results=stage_results,
            violations=violations,
        )


# Module-level singleton
script_compliance_service = ScriptComplianceService()
