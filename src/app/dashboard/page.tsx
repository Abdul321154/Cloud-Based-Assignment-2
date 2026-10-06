"use client";

import { useEffect, useState } from "react";
import { pickOuterSpacing, pickReadingWidth } from "@/utils/viewportTokens";
import { useUiStateBridge } from "@/hooks/useUiStateBridge";
import { fetchActivities } from "@/lib/api-client";
import type { ActivityConfig } from "@/types";

// Simple health check component
const HealthIndicator = () => {
  const [status, setStatus] = useState<"loading" | "healthy" | "unhealthy">("loading");
  
  useEffect(() => {
    let cancelled = false;
    
    async function checkHealth() {
      try {
        const response = await fetch("/health");
        if (!cancelled) {
          setStatus(response.ok ? "healthy" : "unhealthy");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("unhealthy");
        }
      }
    }
    
    checkHealth();
    
    // Set up polling every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);
  
  const statusText = status === "loading" ? "Checking..." : 
                    status === "healthy" ? "Healthy" : "Unhealthy";
  const statusColor = status === "loading" ? "bg-yellow-500" : 
                      status === "healthy" ? "bg-green-500" : "bg-red-500";
  
  return (
    <div className="flex items-center gap-2">
      <div className={`h-3 w-3 rounded-full ${statusColor}`}></div>
      <span className="text-sm font-medium">{statusText}</span>
    </div>
  );
};

export default function Dashboard() {
  const { uiState } = useUiStateBridge();
  const sectionWidthClass = pickReadingWidth(uiState.layoutWidth);
  const pagePaddingClass = pickOuterSpacing(uiState.compactSpacing);

  const [activities, setActivities] = useState<ActivityConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchActivities();
        if (!cancelled) setActivities(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load activities.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate statistics
  const totalActivities = activities.length;
  const wordleCount = activities.filter(a => a.activityType === "wordle").length;
  const wordSearchCount = activities.filter(a => a.activityType === "wordsearch").length;
  
  // Difficulty distribution
  const difficultyCounts = activities.reduce((acc, activity) => {
    acc[activity.difficulty] = (acc[activity.difficulty] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Hints usage
  const hintsEnabledCount = activities.filter(a => a.showHints).length;
  
  // Calculate creation dates for activity timeline
  const activityDates = activities.map(a => new Date(a.createdAt));
  const earliestDate = activityDates.length > 0 ? new Date(Math.min(...activityDates)) : new Date();
  const latestDate = activityDates.length > 0 ? new Date(Math.max(...activityDates)) : new Date();
  
  // Activity type distribution
  const activityTypeCounts = activities.reduce((acc, activity) => {
    acc[activity.activityType] = (acc[activity.activityType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={`mx-auto flex min-h-screen w-full flex-col items-center gap-8 ${pagePaddingClass}`}>
      <section className={`w-full ${sectionWidthClass}`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
              Dashboard
            </h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
              Activity statistics and system health overview
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/80">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">System Status:</span>
              <HealthIndicator />
            </div>
          </div>
        </div>
      </section>

      {error && (
        <section className={`w-full ${sectionWidthClass}`}>
          <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </p>
        </section>
      )}

      <section className={`w-full ${sectionWidthClass}`}>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Overview Statistics
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/80">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Total Activities</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{totalActivities}</p>
          </div>
          
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/80">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Wordle Activities</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{wordleCount}</p>
          </div>
          
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/80">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Word Search Activities</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{wordSearchCount}</p>
          </div>
          
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/80">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Hints Enabled</h3>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{hintsEnabledCount}</p>
          </div>
        </div>
      </section>

      <section className={`w-full ${sectionWidthClass}`}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Difficulty Distribution
            </h2>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/80">
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(difficultyCounts).map(([difficulty, count]) => (
                  <div key={difficulty} className="text-center">
                    <p className="text-lg font-medium text-slate-900 dark:text-slate-100 capitalize">
                      {difficulty}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
              Activity Type Distribution
            </h2>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/80">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(activityTypeCounts).map(([type, count]) => (
                  <div key={type} className="text-center">
                    <p className="text-lg font-medium text-slate-900 dark:text-slate-100 capitalize">
                      {type}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`w-full ${sectionWidthClass}`}>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Recent Activities
        </h2>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/80">
          {loading ? (
            <p className="text-slate-600 dark:text-slate-300">Loading activities...</p>
          ) : activities.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-300">No activities found.</p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {activities.slice(0, 5).map((activity) => (
                <li key={activity.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        {activity.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {activity.activityType} • {activity.words.length} words • {activity.difficulty}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                      {activity.showHints ? "Hints On" : "Hints Off"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      
      <section className={`w-full ${sectionWidthClass}`}>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Activity Timeline
        </h2>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/80">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
            <span>Earliest Activity: {earliestDate.toLocaleDateString()}</span>
            <span>Latest Activity: {latestDate.toLocaleDateString()}</span>
          </div>
        </div>
      </section>
    </div>
  );
}