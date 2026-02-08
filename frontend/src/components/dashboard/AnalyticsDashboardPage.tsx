import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LoadingState from "@/components/common/LoadingState";
import { getTrends } from "@/lib/api/trendsApi";

interface TrendData {
  domains?: Record<string, number>;
  technologies?: Record<string, number>;
  years?: Record<string, number>;
}

const fallbackTrends: TrendData = {
  domains: {
    AI: 320,
    IoT: 210,
    Web: 185,
    Security: 140,
    Data: 120,
    Mobile: 95
  },
  technologies: {
    Python: 360,
    React: 230,
    FastAPI: 170,
    TensorFlow: 150,
    Node: 120,
    Flutter: 90
  },
  years: {
    2019: 6,
    2020: 8,
    2021: 10,
    2022: 12,
    2023: 1,
    2024: 4
  }
};

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

  const hasTrendsData = Boolean(
    trends &&
      (Object.keys(trends.domains ?? {}).length ||
        Object.keys(trends.technologies ?? {}).length ||
        Object.keys(trends.years ?? {}).length)
  );
  const displayTrends = hasTrendsData ? trends : fallbackTrends;

  const effectiveDomains =
    trends?.domains && Object.keys(trends.domains).length
      ? trends.domains
      : fallbackTrends.domains;
  const effectiveTechnologies =
    trends?.technologies && Object.keys(trends.technologies).length
      ? trends.technologies
      : fallbackTrends.technologies;
  const effectiveYears =
    trends?.years && Object.keys(trends.years).length
      ? trends.years
      : fallbackTrends.years;

  const domainEntries = Object.entries(effectiveDomains).sort((a, b) => b[1] - a[1]);
  const techEntries = Object.entries(effectiveTechnologies).sort((a, b) => b[1] - a[1]);
  const yearEntries = Object.entries(effectiveYears).sort(
    (a, b) => Number(a[0]) - Number(b[0])
  );
  const maxDomain = domainEntries[0]?.[1] ?? 0;
  const maxTech = techEntries[0]?.[1] ?? 0;
  const maxYear = yearEntries.reduce((max, [, value]) => Math.max(max, value), 0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-display text-text-100">Analytics Overview</h1>
      <a
        href="https://www.kaggle.com/datasets/nabeelqureshitiii/past-fyp-data"
        target="_blank"
        rel="noreferrer"
        className="text-sm text-accent-500 hover:text-accent-400"
      >
        Dataset source (Kaggle)
      </a>
      {offline ? (
        <div className="glass-card rounded-2xl p-4 text-sm text-text-200">
          Backend is offline. Showing cached/demo insights for now.
        </div>
      ) : !hasTrendsData ? (
        <div className="glass-card rounded-2xl p-4 text-sm text-text-200">
          No live analytics yet. Showing demo insights.
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
          <div className="flex-1 mt-4 space-y-3 overflow-y-auto pr-1">
            {domainEntries.slice(0, 6).map(([label, value]) => (
              <div key={label} className="text-xs text-text-200">
                <div className="flex items-center justify-between">
                  <span className="text-text-100">{label}</span>
                  <span>{value}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-white/5">
                  <div
                    className="h-2 rounded-full bg-brand-500"
                    style={{ width: maxDomain ? `${(value / maxDomain) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6 h-64 flex flex-col">
          <p className="text-sm text-text-200">Technology Adoption</p>
          <div className="flex-1 mt-4 space-y-3 overflow-y-auto pr-1">
            {techEntries.slice(0, 6).map(([label, value]) => (
              <div key={label} className="text-xs text-text-200">
                <div className="flex items-center justify-between">
                  <span className="text-text-100">{label}</span>
                  <span>{value}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-white/5">
                  <div
                    className="h-2 rounded-full bg-accent-500"
                    style={{ width: maxTech ? `${(value / maxTech) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="glass-card rounded-2xl p-6">
        <p className="text-sm text-text-200">Yearly Submissions</p>
        <div className="mt-5 flex items-end gap-3 h-32">
          {yearEntries.map(([year, value]) => (
            <div key={year} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-full bg-gradient-to-t from-brand-500/80 to-brand-300/80"
                style={{ height: maxYear ? `${Math.max((value / maxYear) * 100, 18)}%` : "18%" }}
              />
              <span className="text-[11px] text-text-200">{year}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
