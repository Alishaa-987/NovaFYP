import api from "@/lib/api/http";

export async function getRecommendations(payload?: Record<string, unknown>) {
  const { data } = await api.post("/recommendations", payload ?? {});
  return data?.recommended_projects ?? data;
}
