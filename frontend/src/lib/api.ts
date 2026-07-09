import { fallbackAchievements } from "@/data/fallback-achievements";
import { fallbackSpots } from "@/data/fallback-spots";
import type { JsonApiResponse, RetrySpotQuizzesResponse, UnlockSpotResponse, VisitSpotResponse } from "@/types/api";
import type { Achievement, CollectionSummary, Quiz, QuizAnswerResult, QuizOption, Spot, Stamp, User } from "@/types/domain";

function resolveApiBaseUrl() {
  // ローカル・Render・明示指定のどれでも同じAPI関数を使えるよう、実行環境から接続先を決めます。
  const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const isRenderBrowser = typeof window !== "undefined" && window.location.hostname.endsWith(".onrender.com");

  if (configuredApiBaseUrl && !(isRenderBrowser && configuredApiBaseUrl.includes("localhost"))) {
    // 環境変数でAPI URLが指定されていれば、それを最優先にします。
    return configuredApiBaseUrl;
  }

  const configuredApiOriginUrl = process.env.NEXT_PUBLIC_API_ORIGIN_URL;

  if (configuredApiOriginUrl) {
    return `${configuredApiOriginUrl}/api`;
  }

  if (isRenderBrowser) {
    // Renderでは web/api のサービス名規則からAPI URLを推定します。
    return `${window.location.origin.replace("-web.onrender.com", "-api.onrender.com")}/api`;
  }

  return "http://localhost:8000/api";
}

const apiBaseUrl = resolveApiBaseUrl();

async function request<T>(path: string, token?: string | null, init?: RequestInit): Promise<T> {
  // 認証が必要なAPIにはBearerトークンを付与し、全APIのエラー処理をここに集約します。
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getSpots(token?: string | null): Promise<Spot[]> {
  try {
    const response = await request<JsonApiResponse<Spot[]>>("/spots", token);
    return response.data;
  } catch {
    // APIが起きていない開発中でも画面確認できるよう、最低限のフォールバックを返します。
    return fallbackSpots;
  }
}

export async function getSpot(id: number, token?: string | null): Promise<Spot> {
  try {
    const response = await request<JsonApiResponse<Spot>>(`/spots/${id}`, token);
    return response.data;
  } catch {
    const spot = fallbackSpots.find((item) => item.id === id);

    if (!spot) {
      throw new Error("Spot not found.");
    }

    return spot;
  }
}

export async function unlockSpot(id: number, token: string) {
  return request<UnlockSpotResponse>(`/spots/${id}/unlock`, token, {
    method: "POST",
  });
}

export async function visitSpot(id: number, token: string) {
  return request<VisitSpotResponse>(`/spots/${id}/visit`, token, {
    method: "POST",
  });
}

export async function getStamps(token?: string | null): Promise<Stamp[]> {
  try {
    const response = await request<JsonApiResponse<Stamp[]>>(token ? "/me/stamps" : "/stamps", token);
    return response.data;
  } catch {
    return [];
  }
}

export async function getSpotQuizzes(spotId: number, token?: string | null): Promise<Quiz[]> {
  try {
    const response = await request<JsonApiResponse<Quiz[]>>(`/spots/${spotId}/quizzes`, token);
    return response.data;
  } catch {
    return [];
  }
}

export async function answerQuiz(quizId: number, selectedOption: QuizOption, token: string): Promise<QuizAnswerResult> {
  // クイズ回答はサーバー側で採点し、ポイント・御朱印・解放状態をまとめて返します。
  return request<QuizAnswerResult>(`/quizzes/${quizId}/answer`, token, {
    method: "POST",
    body: JSON.stringify({ selected_option: selectedOption }),
  });
}

export async function retrySpotQuizzes(spotId: number, token: string): Promise<RetrySpotQuizzesResponse> {
  // 御朱印未獲得で条件未達の時だけ、サーバー側で回答履歴をリセットします。
  return request<RetrySpotQuizzesResponse>(`/spots/${spotId}/quizzes/retry`, token, {
    method: "POST",
  });
}

export async function getCollection(token?: string | null): Promise<{
  summary: CollectionSummary;
  data: Spot[];
}> {
  if (!token) {
    const unlocked = fallbackSpots.filter((spot) => spot.is_unlocked);

    return {
      summary: {
        unlocked_count: unlocked.length,
        total_spots: fallbackSpots.length,
        completion_rate: 0,
        mystic_points: unlocked.reduce((sum, spot) => sum + spot.mystic_points, 0),
      },
      data: unlocked,
    };
  }

  try {
    return request<{ summary: CollectionSummary; data: Spot[] }>("/collections", token);
  } catch {
    return {
      summary: {
        unlocked_count: 0,
        total_spots: fallbackSpots.length,
        completion_rate: 0,
        mystic_points: 0,
      },
      data: [],
    };
  }
}

export async function getAchievements(token?: string | null): Promise<Achievement[]> {
  if (!token) {
    return fallbackAchievements;
  }

  try {
    const response = await request<JsonApiResponse<Achievement[]>>("/achievements", token);
    return response.data;
  } catch {
    return fallbackAchievements;
  }
}

export async function login(email: string, password: string) {
  return request<{ user: User; token: string }>("/login", null, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(name: string, email: string, password: string) {
  return request<{ user: User; token: string }>("/register", null, {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: password,
    }),
  });
}

export async function askAiGuide(spotId: number, message: string, token: string) {
  // AIへの直接通信は行わず、スポット文脈を付けるためLaravel APIを経由します。
  return request<{ answer: string; spot_id: number; model: string }>("/ai/guide", token, {
    method: "POST",
    body: JSON.stringify({
      spot_id: spotId,
      message,
    }),
  });
}
