import { fallbackAchievements } from "@/data/fallback-achievements";
import { fallbackSpots } from "@/data/fallback-spots";
import type { Achievement, CollectionSummary, Spot, User } from "@/types/domain";

function resolveApiBaseUrl() {
  const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const isRenderBrowser = typeof window !== "undefined" && window.location.hostname.endsWith(".onrender.com");

  if (configuredApiBaseUrl && !(isRenderBrowser && configuredApiBaseUrl.includes("localhost"))) {
    return configuredApiBaseUrl;
  }

  const configuredApiOriginUrl = process.env.NEXT_PUBLIC_API_ORIGIN_URL;

  if (configuredApiOriginUrl) {
    return `${configuredApiOriginUrl}/api`;
  }

  if (isRenderBrowser) {
    return `${window.location.origin.replace("-web.onrender.com", "-api.onrender.com")}/api`;
  }

  return "http://localhost:8000/api";
}

const apiBaseUrl = resolveApiBaseUrl();

type JsonApiResponse<T> = {
  data: T;
};

async function request<T>(path: string, token?: string | null, init?: RequestInit): Promise<T> {
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
  return request<{
    collection: { spot_id: number; unlocked_at: string };
    gained_points: number;
    new_achievements: Array<{ id: number; title: string }>;
    already_unlocked: boolean;
  }>(`/spots/${id}/unlock`, token, {
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
  return request<{ answer: string; spot_id: number; model: string }>("/ai/guide", token, {
    method: "POST",
    body: JSON.stringify({
      spot_id: spotId,
      message,
    }),
  });
}
