"use client";

import { useEffect, useState } from "react";

import { ActivityEditor } from "@/components/ActivityEditor";
import { createWordleMarkup } from "@/utils/buildWordleDocument";
import { createWordSearchMarkup } from "@/utils/buildWordSearchDocument";
import { triggerMarkupExport } from "@/utils/exportMarkupFile";
import { pickOuterSpacing, pickReadingWidth } from "@/utils/viewportTokens";
import { useUiStateBridge } from "@/hooks/useUiStateBridge";
import {
  activityToWordleConfig,
  activityToWordSearchConfig,
  deleteActivity,
  fetchActivities,
  STUDENT_STAMP,
} from "@/lib/api-client";
import type { ActivityConfig } from "@/types";

const TYPE_BADGE: Record<string, string> = {
  wordle: "Wordle",
  wordsearch: "Word Search",
};

export default function ActivityLibrary() {
  const { uiState } = useUiStateBridge();
  const sectionWidthClass = pickReadingWidth(uiState.layoutWidth);
  const pagePaddingClass = pickOuterSpacing(uiState.compactSpacing);

  const [activities, setActivities] = useState<ActivityConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ActivityConfig | null>(null);
  const [creating, setCreating] = useState(false);

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

  function handleGenerate(activity: ActivityConfig) {
    try {
      const markup =
        activity.activityType === "wordle"
          ? createWordleMarkup(activityToWordleConfig(activity))
          : createWordSearchMarkup(activityToWordSearchConfig(activity));
      triggerMarkupExport(
        `phoneme-${activity.activityType}-${STUDENT_STAMP.downloadKey}-${activity.id.slice(-6)}.html`,
        markup,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate HTML.");
    }
  }

  async function handleDelete(activity: ActivityConfig) {
    if (!confirm(`Delete "${activity.name}"? This cannot be undone.`)) return;
    try {
      await deleteActivity(activity.id);
      setActivities((current) => current.filter((a) => a.id !== activity.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete activity.");
    }
  }

  function handleSaved(saved: ActivityConfig) {
    setActivities((current) => {
      const exists = current.some((a) => a.id === saved.id);
      return exists
        ? current.map((a) => (a.id === saved.id ? saved : a))
        : [saved, ...current];
    });
    setEditing(null);
    setCreating(false);
  }

  const showEditor = creating || editing !== null;

  return (
    <div className={`mx-auto flex min-h-screen w-full flex-col items-center gap-8 ${pagePaddingClass}`}>
      <section className={`w-full ${sectionWidthClass}`}>
        <div className="flex flex-wrap items-end justify-center gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
              Activity Library
            </h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-300">
              Create, edit and delete saved phoneme activities. Generate downloadable HTML from
              stored data.
            </p>
          </div>
          {!showEditor && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setCreating(true);
              }}
              className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              + New activity
            </button>
          )}
        </div>
      </section>

      {error && (
        <section className={`w-full ${sectionWidthClass}`}>
          <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
            {error}
          </p>
        </section>
      )}

      {showEditor && (
        <section className={`w-full ${sectionWidthClass}`}>
          <ActivityEditor
            activity={editing}
            onSaved={handleSaved}
            onCancel={() => {
              setEditing(null);
              setCreating(false);
            }}
          />
        </section>
      )}

      <section className={`w-full ${sectionWidthClass}`}>
        {loading ? (
          <p className="text-slate-600 dark:text-slate-300">Loading saved activities…</p>
        ) : activities.length === 0 && !showEditor ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
            No saved activities yet. Click “New activity” to create one.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/80"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {activity.name}
                  </h2>
                  <span className="shrink-0 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white dark:bg-slate-100 dark:text-slate-900">
                    {TYPE_BADGE[activity.activityType] ?? activity.activityType}
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <div>
                    <dt className="font-medium">Difficulty</dt>
                    <dd className="capitalize">{activity.difficulty}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Words</dt>
                    <dd>{activity.words.length}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Hints</dt>
                    <dd>{activity.showHints ? "On" : "Off"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Updated</dt>
                    <dd>{new Date(activity.updatedAt).toLocaleDateString()}</dd>
                  </div>
                </dl>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCreating(false);
                      setEditing(activity);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerate(activity)}
                    className="rounded-lg bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300"
                  >
                    Generate HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(activity)}
                    className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-950/50 dark:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
