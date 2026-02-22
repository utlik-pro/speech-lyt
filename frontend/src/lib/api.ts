import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  timeout: 300_000, // 5 min for large uploads
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

export async function listCalls(
  page: number = 1,
  pageSize: number = 20,
  status?: string,
  direction?: string,
): Promise<CallListResponse> {
  const params: Record<string, string | number> = { page, page_size: pageSize };
  if (status) params.status = status;
  if (direction) params.direction = direction;

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

export default api;
