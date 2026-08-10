const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ---- Token storage helpers --------------------------------------------------

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("truthlens-token");
}

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("truthlens-token", token);
  }
}

export function removeAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("truthlens-token");
  }
}

// ---- Shared response types --------------------------------------------------

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ScoreBreakdown {
  baseline: number;
  style: number;
  distilbert: number;
}

export interface ExplanationToken {
  text: string;
  score: number;
}

export interface PredictResponse {
  submission_id: number;
  status: "pending" | "done" | "error";
  verdict?: "Real" | "Fake";
  confidence?: number;
  scores?: ScoreBreakdown;
  explanation?: ExplanationToken[];
  cached?: boolean;
}

export interface SubmissionItem {
  id: number;
  input_type: "text" | "url";
  raw_url?: string;
  text_content?: string;
  verdict?: "Real" | "Fake";
  confidence?: number;
  scores?: ScoreBreakdown;
  explanation?: ExplanationToken[];
  status: string;
  created_at: string;
}

export interface HistoryResponse {
  items: SubmissionItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface DailyVolume {
  date: string;
  count: number;
}

export interface TopDomain {
  domain: string;
  count: number;
}

export interface AdminStats {
  total_submissions: number;
  total_users: number;
  total_feedback: number;
  positive_feedback_pct: number;
  daily_volume: DailyVolume[];
  top_flagged_domains: TopDomain[];
}

// ---- Core fetch wrapper -----------------------------------------------------

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "An unexpected error occurred." }));
    throw new ApiError(res.status, errorData.detail || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ---- Typed API surface -------------------------------------------------------

interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export const api = {
  register: (data: RegisterPayload) =>
    request<TokenPair>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: LoginPayload) =>
    request<TokenPair>("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  predict: (data: { text?: string; url?: string }) =>
    request<PredictResponse>("/predict", { method: "POST", body: JSON.stringify(data) }),

  getHistory: (page = 1, pageSize = 20) =>
    request<HistoryResponse>(`/history?page=${page}&page_size=${pageSize}`),

  getSubmission: (id: number) => request<SubmissionItem>(`/history/${id}`),

  submitFeedback: (submissionId: number, verdictCorrect: boolean) =>
    request<{ message: string }>(`/history/${submissionId}/feedback`, {
      method: "POST",
      body: JSON.stringify({ verdict_correct: verdictCorrect }),
    }),

  getAdminStats: () => request<AdminStats>("/admin/stats"),
};
