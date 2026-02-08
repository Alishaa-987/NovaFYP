import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import type { Project } from "@/lib/api/projectsApi";
import { getRecommendations } from "@/lib/api/recommendApi";
import { searchProjectsRaw } from "@/lib/api/searchApi";
import ProjectCard from "@/components/projects/ProjectCard";
import LoadingState from "@/components/common/LoadingState";
import EmptyState from "@/components/common/EmptyState";

const tabs = ["Overview", "Skills & Tools", "Architecture", "Modules"];

export default function ProjectDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [similarProjects, setSimilarProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadProject = async () => {
      setLoading(true);
      try {
        const query = decodeURIComponent(String(id));
        const searchData = await searchProjectsRaw(query, 1);
        const match = Array.isArray(searchData?.results)
          ? searchData.results[0]
          : null;
        setProject(match ?? null);
        if (match?.title) {
          const recommendations = await getRecommendations({
            project_title: match.title,
            top_k: 4
          });
          setSimilarProjects(
            Array.isArray(recommendations) ? recommendations : []
          );
        } else {
          setSimilarProjects([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [id]);

  if (loading) {
    return <LoadingState message="Loading project details..." />;
  }

  if (!project) {
    return <EmptyState title="Project not found" description="Try another idea." />;
  }

  return (
    <div className="space-y-8">
      <div className="glass-card rounded-2xl p-8">
        <h1 className="text-3xl font-display text-text-100">{project.title}</h1>
        <p className="text-text-200 mt-3 max-w-2xl">
          {project.abstract ||
            "Detailed overview, scope, and outcomes for this project idea."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="px-3 py-1 rounded-full bg-white/5 text-text-200">
            {project.domain || "General"}
          </span>
          {project.year ? (
            <span className="px-3 py-1 rounded-full bg-white/5 text-text-200">
              {project.year}
            </span>
          ) : null}
          {(project.technologies || []).slice(0, 5).map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 rounded-full bg-white/5 text-text-200"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`px-4 py-2 rounded-full text-sm transition ${
                tab === activeTab
                  ? "bg-brand-500 text-white"
                  : "bg-white/5 text-text-200"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <motion.div
          key={activeTab}
          className="mt-6 text-text-200"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {activeTab === "Overview" && (
            <p>
              Explore objectives, datasets, and expected impact for this project
              scope. Refine your approach with the NovaFYP Advisor.
            </p>
          )}
          {activeTab === "Skills & Tools" && (
            <p>
              Suggested stack: {project.technologies?.join(", ") || "TBD"}.
            </p>
          )}
          {activeTab === "Architecture" && (
            <p>
              Suggested architecture: client app, ML services, and analytics
              dashboard modules.
            </p>
          )}
          {activeTab === "Modules" && (
            <p>
              Key modules include data ingestion, recommendation engine, and
              evaluation pipeline.
            </p>
          )}
        </motion.div>
      </div>

      <div>
        <h2 className="text-2xl font-display text-text-100 mb-4">
          Similar Projects
        </h2>
        {similarProjects.length ? (
          <div className="grid gap-6 md:grid-cols-2">
            {similarProjects.map((item) => (
              <ProjectCard key={String(item.id)} project={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No similar projects found"
            description="Try adjusting your preferences."
          />
        )}
      </div>
    </div>
  );
}
