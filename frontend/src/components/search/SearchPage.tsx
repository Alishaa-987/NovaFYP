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
  const [page, setPage] = useState(1);

  const pageSize = 6;

  const filters = useMemo<ProjectFilters>(
    () => ({ technology: selectedFilters[0] }),
    [selectedFilters]
  );

  const loadProjects = async (nextFilters?: ProjectFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects(nextFilters);
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
      const trimmedQuery = query.trim();
      if (trimmedQuery) {
        const data = await searchProjects(trimmedQuery, filters, 24);
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
    const trimmedQuery = query.trim();
    setLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      if (trimmedQuery) {
        searchProjects(trimmedQuery, filters, 24)
          .then((data) => setProjects(Array.isArray(data) ? data : []))
          .catch(() => {
            setError("Search failed. Try again.");
            setProjects([]);
          })
          .finally(() => setLoading(false));
      } else {
        loadProjects(filters);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, filters]);

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter) ? prev.filter((item) => item !== filter) : [filter]
    );
  };

  const totalPages = Math.max(1, Math.ceil(projects.length / pageSize));
  const pagedProjects = projects.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    setPage(1);
  }, [query, selectedFilters]);

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
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: pageSize }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="glass-card rounded-2xl p-6 h-44 animate-pulse"
              >
                <div className="h-4 w-2/3 bg-white/10 rounded" />
                <div className="mt-4 h-3 w-full bg-white/5 rounded" />
                <div className="mt-2 h-3 w-5/6 bg-white/5 rounded" />
                <div className="mt-6 h-3 w-1/3 bg-white/5 rounded" />
              </div>
            ))}
          </div>
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
            {pagedProjects.map((project) => (
              <ProjectCard key={String(project.id)} project={project} />
            ))}
          </motion.div>
        )}

        {!loading && projects.length > pageSize ? (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-full text-xs bg-white/5 text-text-200 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-xs text-text-200">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="px-3 py-2 rounded-full text-xs bg-white/5 text-text-200 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
