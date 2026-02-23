import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  timeout: 300_000, // 5 min for large uploads
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const projectId = localStorage.getItem("speechlyt-project-id");
    if (projectId) {
      config.headers["X-Project-Id"] = projectId;
    }
  }
  return config;
});

export interface CallUploadResponse {
  id: string;
  status: string;
  message?: string;
}

export interface CallBatchUploadResponse {
  uploaded: number;
  failed: number;
  calls: CallUploadResponse[];
  errors: string[];
}

export interface CallResponse {
  id: string;
  organization_id: string;
  agent_id: string | null;
  external_id: string | null;
  original_filename: string;
  audio_format: string;
  file_size_bytes: number;
  duration_seconds: number | null;
  direction: string;
  phone_number: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CallListResponse {
  items: CallResponse[];
  total: number;
  page: number;
  page_size: number;
}

export async function uploadCall(
  file: File,
  direction: string = "unknown",
  onProgress?: (percent: number) => void,
): Promise<CallUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("direction", direction);

  const { data } = await api.post<CallUploadResponse>("/calls/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (e.total && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  return data;
}

export async function uploadCallsBatch(
  files: File[],
  direction: string = "unknown",
  onProgress?: (percent: number) => void,
): Promise<CallBatchUploadResponse> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  formData.append("direction", direction);

  const { data } = await api.post<CallBatchUploadResponse>("/calls/upload/batch", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (e.total && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });
  return data;
}

export interface CallFilters {
  status?: string;
  direction?: string;
  agent_id?: string;
  sentiment?: string;
  category?: string;
  outcome?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export async function listCalls(
  page: number = 1,
  pageSize: number = 20,
  filters: CallFilters = {},
): Promise<CallListResponse> {
  const params: Record<string, string | number> = { page, page_size: pageSize };
  for (const [k, v] of Object.entries(filters)) {
    if (v) params[k] = v;
  }
  const { data } = await api.get<CallListResponse>("/calls", { params });
  return data;
}

export async function getCall(callId: string): Promise<CallResponse> {
  const { data } = await api.get<CallResponse>(`/calls/${callId}`);
  return data;
}

export async function deleteCall(callId: string): Promise<void> {
  await api.delete(`/calls/${callId}`);
}

// --- KPI API ---

export interface KPIMetric {
  name: string;
  label: string;
  value: number;
  unit: string;
  threshold_min: number | null;
  threshold_max: number | null;
  status: "normal" | "warning" | "critical";
}

export interface AgentKPI {
  agent_id: string | null;
  agent_label: string;
  total_calls: number;
  metrics: KPIMetric[];
}

export interface KPIDashboardResponse {
  period_start: string;
  period_end: string;
  total_calls: number;
  completed_calls: number;
  failed_calls: number;
  metrics: KPIMetric[];
  agents: AgentKPI[];
  sentiment_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
}

export interface KPITrendPoint {
  date: string;
  value: number;
}

export interface KPITrendResponse {
  metric_name: string;
  label: string;
  unit: string;
  period_start: string;
  period_end: string;
  data: KPITrendPoint[];
}

export interface KPIAlert {
  metric_name: string;
  label: string;
  current_value: number;
  threshold: number;
  direction: string;
  severity: string;
  message: string;
}

export interface KPIAlertsResponse {
  alerts: KPIAlert[];
  total: number;
}

// --- Analytics API ---

export interface EmotionAnalysisResponse {
  id: string;
  call_id: string;
  overall_sentiment: string;
  agent_sentiment: string;
  client_sentiment: string;
  emotion_timeline: { time: number; sentiment: string; intensity: number }[];
  critical_moments: { time: number; type: string; description: string }[];
  created_at: string;
  updated_at: string;
}

export interface CallSummaryResponse {
  id: string;
  call_id: string;
  short_summary: string;
  topic: string;
  problem: string | null;
  solution: string | null;
  outcome: string;
  next_steps: string | null;
  entities: { name: string; type: string; value: string }[];
  tags: string[];
  category: string | null;
  created_at: string;
  updated_at: string;
}

export async function getKPIDashboard(
  periodStart?: string,
  periodEnd?: string,
  agentId?: string,
): Promise<KPIDashboardResponse> {
  const params: Record<string, string> = {};
  if (periodStart) params.period_start = periodStart;
  if (periodEnd) params.period_end = periodEnd;
  if (agentId) params.agent_id = agentId;
  const { data } = await api.get<KPIDashboardResponse>("/kpi/dashboard", { params });
  return data;
}

export async function getKPITrend(
  metricName: string,
  periodStart?: string,
  periodEnd?: string,
  granularity: string = "day",
): Promise<KPITrendResponse> {
  const params: Record<string, string> = { granularity };
  if (periodStart) params.period_start = periodStart;
  if (periodEnd) params.period_end = periodEnd;
  const { data } = await api.get<KPITrendResponse>(`/kpi/trend/${metricName}`, { params });
  return data;
}

export async function getKPIAlerts(
  periodStart?: string,
  periodEnd?: string,
): Promise<KPIAlertsResponse> {
  const params: Record<string, string> = {};
  if (periodStart) params.period_start = periodStart;
  if (periodEnd) params.period_end = periodEnd;
  const { data } = await api.get<KPIAlertsResponse>("/kpi/alerts", { params });
  return data;
}

export async function getCallEmotions(callId: string): Promise<EmotionAnalysisResponse> {
  const { data } = await api.get<EmotionAnalysisResponse>(`/calls/${callId}/emotions`);
  return data;
}

export async function getCallSummary(callId: string): Promise<CallSummaryResponse> {
  const { data } = await api.get<CallSummaryResponse>(`/calls/${callId}/summary`);
  return data;
}

// --- Scripts API ---

export interface ScriptStage {
  id?: string;
  script_id?: string;
  order: number;
  name: string;
  required_phrases: string[];
  forbidden_words: string[];
  is_required: boolean;
  max_duration_seconds: number | null;
}

export interface ScriptResponse {
  id: string;
  organization_id: string;
  name: string;
  type: string;
  description: string | null;
  is_active: boolean;
  stages: ScriptStage[];
  created_at: string;
  updated_at: string;
}

export interface ScriptListResponse {
  items: ScriptResponse[];
  total: number;
  page: number;
  page_size: number;
}

export async function listScripts(page = 1, pageSize = 20): Promise<ScriptListResponse> {
  const { data } = await api.get<ScriptListResponse>("/scripts", {
    params: { page, page_size: pageSize },
  });
  return data;
}

export async function getScript(scriptId: string): Promise<ScriptResponse> {
  const { data } = await api.get<ScriptResponse>(`/scripts/${scriptId}`);
  return data;
}

export async function createScript(payload: {
  name: string;
  type: string;
  description?: string;
  stages: Omit<ScriptStage, "id" | "script_id">[];
}): Promise<ScriptResponse> {
  const { data } = await api.post<ScriptResponse>("/scripts", payload);
  return data;
}

export async function deleteScript(scriptId: string): Promise<void> {
  await api.delete(`/scripts/${scriptId}`);
}

export async function updateScript(
  scriptId: string,
  payload: { name?: string; type?: string; description?: string; is_active?: boolean },
): Promise<ScriptResponse> {
  const { data } = await api.put<ScriptResponse>(`/scripts/${scriptId}`, payload);
  return data;
}

// --- Script Analysis ---

export interface StageResultItem {
  stage_id: string;
  stage_name: string;
  passed: boolean;
  score: number;
  matched_phrases: string[];
  missing_phrases: string[];
  found_forbidden_words: string[];
  notes: string;
}

export interface ViolationItem {
  stage_name: string;
  type: string;
  description: string;
  severity: string;
}

export interface ScriptAnalysisResponse {
  id: string;
  call_id: string;
  script_id: string;
  overall_score: number;
  stage_results: StageResultItem[];
  violations: ViolationItem[];
  created_at: string;
  updated_at: string;
}

export async function getCallScriptAnalysis(callId: string): Promise<ScriptAnalysisResponse> {
  const { data } = await api.get<ScriptAnalysisResponse>(`/calls/${callId}/script-analysis`);
  return data;
}

// --- Agent Info (lightweight) ---

export async function getAgentInfo(agentId: string): Promise<AgentResponse> {
  const { data } = await api.get<AgentResponse>(`/agents/${agentId}/info`);
  return data;
}

// --- Projects API ---

export interface ProjectResponse {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectListResponse {
  items: ProjectResponse[];
  total: number;
  page: number;
  page_size: number;
}

export async function listProjects(
  page: number = 1,
  pageSize: number = 100,
): Promise<ProjectListResponse> {
  const { data } = await api.get<ProjectListResponse>("/projects", {
    params: { page, page_size: pageSize },
  });
  return data;
}

export async function createProject(payload: {
  name: string;
  description?: string;
  color?: string;
}): Promise<ProjectResponse> {
  const { data } = await api.post<ProjectResponse>("/projects", payload);
  return data;
}

// --- Agents API ---

export interface AgentResponse {
  id: string;
  organization_id: string;
  name: string;
  email: string | null;
  team: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentListResponse {
  items: AgentResponse[];
  total: number;
}

export interface AgentLeaderboardEntry {
  agent_id: string;
  name: string;
  team: string | null;
  total_calls: number;
  avg_handle_time: number;
  avg_script_score: number | null;
  resolution_rate: number;
  positive_sentiment_pct: number;
  rank: number;
}

export interface AgentLeaderboardResponse {
  period_start: string;
  period_end: string;
  entries: AgentLeaderboardEntry[];
}

export interface AgentStatsResponse {
  agent: AgentResponse;
  total_calls: number;
  completed_calls: number;
  avg_handle_time: number;
  avg_script_score: number | null;
  resolution_rate: number;
  sentiment_distribution: Record<string, number>;
  category_distribution: Record<string, number>;
}

export async function listAgents(): Promise<AgentListResponse> {
  const { data } = await api.get<AgentListResponse>("/agents");
  return data;
}

export async function getAgentLeaderboard(days = 30): Promise<AgentLeaderboardResponse> {
  const { data } = await api.get<AgentLeaderboardResponse>("/agents/leaderboard", { params: { days } });
  return data;
}

export async function getAgentStats(agentId: string, days = 30): Promise<AgentStatsResponse> {
  const { data } = await api.get<AgentStatsResponse>(`/agents/${agentId}`, { params: { days } });
  return data;
}

// --- Conversation Stats API ---

export interface ConversationStatsResponse {
  agent_talk_time: number;
  client_talk_time: number;
  silence_time: number;
  total_duration: number;
  talk_listen_ratio: number;
  interruption_count: number;
  agent_wpm: number;
  client_wpm: number;
  longest_monologue_duration: number;
  longest_monologue_speaker: string | null;
  agent_talk_pct: number;
  client_talk_pct: number;
  silence_pct: number;
}

export interface TranscriptionResponse {
  call_id: string;
  full_text: string;
  language: string;
  segments: { speaker: string; text: string; start_time: number; end_time: number; confidence: number }[];
}

export async function getConversationStats(callId: string): Promise<ConversationStatsResponse> {
  const { data } = await api.get<ConversationStatsResponse>(`/calls/${callId}/conversation-stats`);
  return data;
}

export async function getCallTranscription(callId: string): Promise<TranscriptionResponse> {
  const { data } = await api.get<TranscriptionResponse>(`/calls/${callId}/transcription`);
  return data;
}

// --- Enhanced KPI API ---

export interface HeatmapCell {
  day: number;
  hour: number;
  count: number;
}

export interface HeatmapResponse {
  period_start: string;
  period_end: string;
  cells: HeatmapCell[];
  max_count: number;
}

export interface WordCloudItem {
  word: string;
  count: number;
}

export interface WordCloudResponse {
  period_start: string;
  period_end: string;
  items: WordCloudItem[];
}

export interface PeriodMetricComparison {
  name: string;
  label: string;
  current: number;
  previous: number;
  delta: number;
  pct_change: number | null;
}

export interface PeriodComparisonResponse {
  current_start: string;
  current_end: string;
  previous_start: string;
  previous_end: string;
  metrics: PeriodMetricComparison[];
}

export async function getHeatmap(
  periodStart?: string,
  periodEnd?: string,
): Promise<HeatmapResponse> {
  const params: Record<string, string> = {};
  if (periodStart) params.period_start = periodStart;
  if (periodEnd) params.period_end = periodEnd;
  const { data } = await api.get<HeatmapResponse>("/kpi/heatmap", { params });
  return data;
}

export async function getWordCloud(
  periodStart?: string,
  periodEnd?: string,
  limit = 50,
): Promise<WordCloudResponse> {
  const params: Record<string, string | number> = { limit };
  if (periodStart) params.period_start = periodStart;
  if (periodEnd) params.period_end = periodEnd;
  const { data } = await api.get<WordCloudResponse>("/kpi/word-cloud", { params });
  return data;
}

export async function getPeriodComparison(
  periodStart?: string,
  periodEnd?: string,
): Promise<PeriodComparisonResponse> {
  const params: Record<string, string> = {};
  if (periodStart) params.period_start = periodStart;
  if (periodEnd) params.period_end = periodEnd;
  const { data } = await api.get<PeriodComparisonResponse>("/kpi/comparison", { params });
  return data;
}

// --- Audio Player ---

export function getCallAudioUrl(callId: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  const projectId =
    typeof window !== "undefined" ? localStorage.getItem("speechlyt-project-id") : null;
  return `${base}/calls/${callId}/audio${projectId ? `?project_id=${projectId}` : ""}`;
}

// --- Auth API ---

export interface UserResponse {
  id: string;
  organization_id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  agent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export async function registerUser(payload: {
  email: string;
  password: string;
  name: string;
}): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/auth/register", payload);
  return data;
}

export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/auth/login", payload);
  return data;
}

export async function getCurrentUser(): Promise<UserResponse> {
  const { data } = await api.get<UserResponse>("/auth/me");
  return data;
}

export async function updateProfile(payload: {
  name?: string;
  email?: string;
  password?: string;
}): Promise<UserResponse> {
  const { data } = await api.put<UserResponse>("/auth/me", payload);
  return data;
}

// --- QA API ---

export interface QACriterionDef {
  id: string;
  name: string;
  category: string;
  weight: number;
  description: string;
  auto_source: string;
}

export interface QAScorecardResponse {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  criteria: QACriterionDef[];
  created_at: string;
  updated_at: string;
}

export interface QAScorecardListResponse {
  items: QAScorecardResponse[];
  total: number;
}

export interface QAResultItem {
  criterion_id: string;
  score: number;
  max_score: number;
  passed: boolean;
  auto_evaluated: boolean;
  notes: string;
}

export interface QAEvaluationResponse {
  id: string;
  call_id: string;
  scorecard_id: string;
  evaluator_id: string | null;
  total_score: number;
  max_possible_score: number;
  results: QAResultItem[];
  comments: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface QAEvaluationListResponse {
  items: QAEvaluationResponse[];
  total: number;
}

export async function listScorecards(): Promise<QAScorecardListResponse> {
  const { data } = await api.get<QAScorecardListResponse>("/qa/scorecards");
  return data;
}

export async function createScorecard(payload: {
  name: string;
  description?: string;
  criteria: QACriterionDef[];
}): Promise<QAScorecardResponse> {
  const { data } = await api.post<QAScorecardResponse>("/qa/scorecards", payload);
  return data;
}

export async function getScorecard(id: string): Promise<QAScorecardResponse> {
  const { data } = await api.get<QAScorecardResponse>(`/qa/scorecards/${id}`);
  return data;
}

export async function updateScorecard(
  id: string,
  payload: { name?: string; description?: string; is_active?: boolean; criteria?: QACriterionDef[] },
): Promise<QAScorecardResponse> {
  const { data } = await api.put<QAScorecardResponse>(`/qa/scorecards/${id}`, payload);
  return data;
}

export async function deleteScorecard(id: string): Promise<void> {
  await api.delete(`/qa/scorecards/${id}`);
}

export async function evaluateCall(
  callId: string,
  scorecardId: string,
): Promise<QAEvaluationResponse> {
  const { data } = await api.post<QAEvaluationResponse>(`/qa/evaluate/${callId}`, {
    scorecard_id: scorecardId,
  });
  return data;
}

export async function getCallEvaluations(callId: string): Promise<QAEvaluationListResponse> {
  const { data } = await api.get<QAEvaluationListResponse>(`/qa/evaluations/${callId}`);
  return data;
}

// --- Alerts API ---

export interface AlertRuleResponse {
  id: string;
  organization_id: string;
  created_by: string | null;
  name: string;
  metric_name: string;
  condition: string;
  threshold: number;
  severity: string;
  is_active: boolean;
  notify_email: boolean;
  notify_webhook: boolean;
  cooldown_minutes: number;
  last_triggered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlertRuleListResponse {
  items: AlertRuleResponse[];
  total: number;
}

export interface AlertHistoryResponse {
  id: string;
  rule_id: string;
  organization_id: string;
  metric_name: string;
  metric_value: number;
  threshold: number;
  severity: string;
  message: string;
  acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  created_at: string;
}

export interface AlertHistoryListResponse {
  items: AlertHistoryResponse[];
  total: number;
}

export async function listAlertRules(): Promise<AlertRuleListResponse> {
  const { data } = await api.get<AlertRuleListResponse>("/alerts/rules");
  return data;
}

export async function createAlertRule(payload: {
  name: string;
  metric_name: string;
  condition: string;
  threshold: number;
  severity?: string;
  notify_email?: boolean;
  notify_webhook?: boolean;
  cooldown_minutes?: number;
}): Promise<AlertRuleResponse> {
  const { data } = await api.post<AlertRuleResponse>("/alerts/rules", payload);
  return data;
}

export async function updateAlertRule(
  id: string,
  payload: Record<string, unknown>,
): Promise<AlertRuleResponse> {
  const { data } = await api.put<AlertRuleResponse>(`/alerts/rules/${id}`, payload);
  return data;
}

export async function deleteAlertRule(id: string): Promise<void> {
  await api.delete(`/alerts/rules/${id}`);
}

export async function getAlertHistory(params?: {
  severity?: string;
  acknowledged?: boolean;
  page?: number;
  page_size?: number;
}): Promise<AlertHistoryListResponse> {
  const { data } = await api.get<AlertHistoryListResponse>("/alerts/history", { params });
  return data;
}

export async function acknowledgeAlert(id: string): Promise<AlertHistoryResponse> {
  const { data } = await api.put<AlertHistoryResponse>(`/alerts/history/${id}/acknowledge`);
  return data;
}

export async function checkAlerts(): Promise<{ triggered: number; alerts: AlertHistoryResponse[] }> {
  const { data } = await api.post<{ triggered: number; alerts: AlertHistoryResponse[] }>("/alerts/check");
  return data;
}

export default api;
