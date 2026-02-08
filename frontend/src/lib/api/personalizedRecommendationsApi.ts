import api from "@/lib/api/http";

export async function getPersonalizedRecommendations(
  profile: Record<string, unknown>
) {
  const { data } = await api.post("/personalized_recommendations", profile);
  return data?.recommended_projects ?? data;
}
