import { useEffect, useState } from "react";
import ProjectCard from "@/components/projects/ProjectCard";
import type { Project } from "@/lib/api/projectsApi";
import EmptyState from "@/components/common/EmptyState";

export default function BookmarksList() {
  const [bookmarks, setBookmarks] = useState<Project[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const loadBookmarks = () => {
      const saved = localStorage.getItem("novafyp_bookmarks");
      if (saved) {
        try {
          setBookmarks(JSON.parse(saved));
        } catch {
          setBookmarks([]);
        }
      } else {
        setBookmarks([]);
      }
    };

    loadBookmarks();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "novafyp_bookmarks") {
        loadBookmarks();
      }
    };

    const handleBookmarkUpdate = () => {
      loadBookmarks();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("novafyp_bookmarks_updated", handleBookmarkUpdate);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("novafyp_bookmarks_updated", handleBookmarkUpdate);
    };
  }, []);

  const removeBookmark = (id?: string | number) => {
    if (!id) {
      return;
    }
    const next = bookmarks.filter((item) => item.id !== id);
    setBookmarks(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("novafyp_bookmarks", JSON.stringify(next));
    }
  };

  if (bookmarks.length === 0) {
    return (
      <EmptyState
        title="No bookmarks yet"
        description="Save your favorite project ideas for quick access."
      />
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {bookmarks.map((project) => (
        <div key={String(project.id)}>
          <ProjectCard project={project} />
          <button
            type="button"
            onClick={() => removeBookmark(project.id)}
            className="mt-2 text-xs text-accent-500 hover:text-accent-400"
          >
            Remove bookmark
          </button>
        </div>
      ))}
    </div>
  );
}
