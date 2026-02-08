import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LoadingState from "@/components/common/LoadingState";
import { getTrends } from "@/lib/api/trendsApi";

interface TrendData {
  domains?: Record<string, number>;
  technologies?: Record<string, number>;
  years?: Record<string, number>;
}

export default function AnalyticsDashboardPage() {
  const [trends, setTrends] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const loadTrends = async () => {
      setLoading(true);
      setOffline(false);
      try {
        const data = await getTrends();
        setTrends(data);
      } catch {
        setOffline(true);
        setTrends(null);
      } finally {
        setLoading(false);
      }
    };

    loadTrends();
  }, []);

  if (loading) {
    return <LoadingState message="Loading trend analytics..." />;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-display text-text-100">Analytics Overview</h1>
      {offline ? (
        <div className="glass-card rounded-2xl p-4 text-sm text-text-200">
          Backend is offline. Showing cached/demo insights for now.
        </div>
      ) : null}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            label: "Total Projects",
            value:
              trends?.years
                ? Object.values(trends.years).reduce((sum, value) => sum + value, 0)
                : 1300
          },
          {
            label: "Top Domains",
            value: trends?.domains
              ? Object.entries(trends.domains)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([key]) => key)
                  .join(", ")
              : "AI, IoT, Web"
          },
          {
            label: "Popular Tech",
            value: trends?.technologies
              ? Object.entries(trends.technologies)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([key]) => key)
                  .join(", ")
              : "Python, React, FastAPI"
          }
        ].map((card) => (
          <motion.div
            key={card.label}
            className="glass-card rounded-2xl p-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-text-200">{card.label}</p>
            <p className="text-2xl font-semibold text-text-100 mt-2">
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card rounded-2xl p-6 h-64 flex flex-col">
          <p className="text-sm text-text-200">Domain Trends</p>
          <div className="flex-1 mt-4 bg-white/5 rounded-xl" />
        </div>
        <div className="glass-card rounded-2xl p-6 h-64 flex flex-col">
          <p className="text-sm text-text-200">Technology Adoption</p>
          <div className="flex-1 mt-4 bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
