import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ProjectCard from "@/components/projects/ProjectCard";
import LoadingState from "@/components/common/LoadingState";
import EmptyState from "@/components/common/EmptyState";
import type { Project, ProjectFilters } from "@/lib/api/projectsApi";
import { getProjects } from "@/lib/api/projectsApi";
import { searchProjects } from "@/lib/api/searchApi";

const filterOptions = [
  "AI",
  "IoT",
  "Mobile",
  "Web",
  "Cybersecurity",
  "Data Science"
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filters = useMemo<ProjectFilters>(
    () => ({ technology: selectedFilters[0] }),
    [selectedFilters]
  );

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Unable to load projects.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (query.trim()) {
        const data = await searchProjects(query, filters, 6);
        setProjects(Array.isArray(data) ? data : []);
      } else {
        const data = await getProjects(filters);
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError("Search failed. Try again.");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((item) => item !== filter) : [...prev, filter]
    );
  };

  return (
    <section>
      <div className="flex flex-col gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-2xl font-display text-text-100">
            Discover projects tailored to you
          </h2>
          <p className="text-text-200 mt-2">
            Search by domain, technology, or natural language prompt.
          </p>
          <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-4">
            <input
              type="text"
              placeholder="Search FYP ideas by domain, technology, or natural language..."
              className="w-full px-4 py-3 rounded-xl input-surface text-text-100"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => {
                const isActive = selectedFilters.includes(filter);
                return (
                  <button
                    type="button"
                    key={filter}
                    onClick={() => toggleFilter(filter)}
                    className={`px-3 py-1 rounded-full text-xs transition ${
                      isActive
                        ? "bg-brand-500 text-white"
                        : "bg-white/5 text-text-200 hover:text-text-100"
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
            <button
              type="submit"
              className="self-start bg-accent-500 hover:bg-accent-400 text-white px-6 py-3 rounded-xl transition"
            >
              Search
            </button>
          </form>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-text-100">Latest Matches</h3>
          {selectedFilters.length ? (
            <span className="text-sm text-text-200">
              Filters: {selectedFilters.join(", ")}
            </span>
          ) : null}
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <EmptyState title="Something went wrong" description={error} />
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            className="grid gap-6 md:grid-cols-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {projects.map((project) => (
              <ProjectCard key={String(project.id)} project={project} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
