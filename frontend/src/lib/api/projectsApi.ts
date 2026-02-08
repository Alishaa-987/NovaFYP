import api from "@/lib/api/http";

export interface Project {
  id?: string | number;
  title: string;
  abstract?: string;
  domain?: string;
  technologies?: string[];
  year?: number;
  difficulty?: string;
  hardware?: boolean;
  source_url?: string;
  uniqueness_score?: number;
  similarity_score?: number;
}

export interface ProjectFilters {
  domain?: string;
  technology?: string;
  year?: number | string;
  difficulty?: string;
  hardware?: boolean;
}

export async function getProjects(filters?: ProjectFilters) {
  const { data } = await api.get("/projects", { params: filters });
  return data?.projects ?? data;
}

export async function getProjectById(id: string | number) {
  const { data } = await api.get(`/projects/${id}`);
  return data?.project ?? data;
}
