import api from "@/lib/api/http";
import type { ProjectFilters } from "@/lib/api/projectsApi";

export async function searchProjects(
  query: string,
  filters?: ProjectFilters,
  topK = 5
) {
  const params = { query, top_k: topK, ...filters };
  const { data } = await api.post("/search", null, { params });
  return data?.results ?? data?.projects ?? data?.items ?? data;
}

export async function searchProjectsRaw(query: string, topK = 5) {
  const { data } = await api.post("/search", null, {
    params: { query, top_k: topK }
  });
  return data;
}
