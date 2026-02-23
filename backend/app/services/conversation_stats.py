"""Conversation statistics computed from transcription segments.

Computes talk/listen ratio, silence time, interruptions, speech speed, etc.
No additional DB tables needed — everything derived from Transcription.segments.
"""


def calculate_conversation_stats(segments: list[dict], total_duration: float) -> dict:
    """Calculate conversation statistics from transcription segments.

    Args:
        segments: List of segment dicts with speaker, start_time, end_time, text.
        total_duration: Total call duration in seconds.

    Returns:
        Dict with all conversation metrics.
    """
    if not segments or total_duration <= 0:
        return _empty_stats(total_duration)

    agent_time = 0.0
    client_time = 0.0
    agent_words = 0
    client_words = 0
    longest_monologue_duration = 0.0
    longest_monologue_speaker = None

    for seg in segments:
        speaker = seg.get("speaker", "")
        start = seg.get("start_time", 0)
        end = seg.get("end_time", 0)
        text = seg.get("text", "")
        dur = max(end - start, 0)
        word_count = len(text.split()) if text else 0

        if speaker == "agent":
            agent_time += dur
            agent_words += word_count
        elif speaker == "client":
            client_time += dur
            client_words += word_count

        if dur > longest_monologue_duration:
            longest_monologue_duration = dur
            longest_monologue_speaker = speaker

    # Silence: total duration minus all speech
    total_speech = agent_time + client_time
    silence_time = max(total_duration - total_speech, 0)

    # Talk/listen ratio
    talk_listen_ratio = (agent_time / client_time) if client_time > 0 else 0.0

    # Interruptions: overlapping segments from different speakers
    interruption_count = 0
    sorted_segs = sorted(segments, key=lambda s: s.get("start_time", 0))
    for i in range(1, len(sorted_segs)):
        prev = sorted_segs[i - 1]
        curr = sorted_segs[i]
        if prev.get("speaker") != curr.get("speaker"):
            if curr.get("start_time", 0) < prev.get("end_time", 0):
                interruption_count += 1

    # Words per minute
    agent_minutes = agent_time / 60 if agent_time > 0 else 1
    client_minutes = client_time / 60 if client_time > 0 else 1
    agent_wpm = round(agent_words / agent_minutes, 1)
    client_wpm = round(client_words / client_minutes, 1)

    return {
        "agent_talk_time": round(agent_time, 1),
        "client_talk_time": round(client_time, 1),
        "silence_time": round(silence_time, 1),
        "total_duration": round(total_duration, 1),
        "talk_listen_ratio": round(talk_listen_ratio, 2),
        "interruption_count": interruption_count,
        "agent_wpm": agent_wpm,
        "client_wpm": client_wpm,
        "longest_monologue_duration": round(longest_monologue_duration, 1),
        "longest_monologue_speaker": longest_monologue_speaker,
        "agent_talk_pct": round(agent_time / total_duration * 100, 1) if total_duration > 0 else 0,
        "client_talk_pct": round(client_time / total_duration * 100, 1) if total_duration > 0 else 0,
        "silence_pct": round(silence_time / total_duration * 100, 1) if total_duration > 0 else 0,
    }


def _empty_stats(total_duration: float) -> dict:
    return {
        "agent_talk_time": 0,
        "client_talk_time": 0,
        "silence_time": round(total_duration, 1),
        "total_duration": round(total_duration, 1),
        "talk_listen_ratio": 0,
        "interruption_count": 0,
        "agent_wpm": 0,
        "client_wpm": 0,
        "longest_monologue_duration": 0,
        "longest_monologue_speaker": None,
        "agent_talk_pct": 0,
        "client_talk_pct": 0,
        "silence_pct": 100,
    }
