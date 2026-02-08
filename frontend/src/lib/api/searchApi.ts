import api from "@/lib/api/http";
import type { ProjectFilters } from "@/lib/api/projectsApi";

export async function searchProjects(
  query: string,
  filters?: ProjectFilters,
  topK = 5
) {
  const { data } = await api.post("/search", { query, top_k: topK });
  return data?.results ?? data;
}

export async function searchProjectsRaw(query: string, topK = 5) {
  const { data } = await api.post("/search", { query, top_k: topK });
  return data;
}
