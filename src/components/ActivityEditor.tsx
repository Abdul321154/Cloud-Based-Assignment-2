"use client";

import { useState } from "react";

import { createActivity, updateActivity, STUDENT_STAMP } from "@/lib/api-client";
import type { ActivityConfig, ActivityPayload, ActivityType, DifficultyLevel } from "@/types";

const TYPE_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: "wordle", label: "Wordle" },
  { value: "wordsearch", label: "Word Search" },
];

const DIFFICULTY_OPTIONS: DifficultyLevel[] = ["easy", "medium", "hard"];

interface EditorWord {
  english: string;
  phonemes: string;
}

function emptyWord(): EditorWord {
  return { english: "", phonemes: "" };
}

function toEditorWords(activity?: ActivityConfig | null): EditorWord[] {
  if (!activity) return [emptyWord()];
  const words = activity.words.map((w) => ({
    english: w.english ?? "",
    phonemes: w.phonemes.map((p) => p.symbol).join(" "),
  }));
  return words.length > 0 ? words : [emptyWord()];
}

interface ActivityEditorProps {
  activity: ActivityConfig | null;
  onSaved: (activity: ActivityConfig) => void;
  onCancel: () => void;
}

export function ActivityEditor({ activity, onSaved, onCancel }: ActivityEditorProps) {
  const isEditing = Boolean(activity);
  const [name, setName] = useState(activity?.name ?? "");
  const [activityType, setActivityType] = useState<ActivityType>(
    (activity?.activityType as ActivityType) ?? "wordle",
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(
    (activity?.difficulty as DifficultyLevel) ?? "medium",
  );
  const [showHints, setShowHints] = useState(activity?.showHints ?? true);
  const [numGuesses, setNumGuesses] = useState(activity?.numGuesses ?? 6);
  const [rows, setRows] = useState(activity?.rows ?? 10);
  const [cols, setCols] = useState(activity?.cols ?? 10);
  const [words, setWords] = useState<EditorWord[]>(toEditorWords(activity));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function updateWord(index: number, patch: Partial<EditorWord>) {
    setWords((current) => current.map((w, i) => (i === index ? { ...w, ...patch } : w)));
  }

  function addWord() {
    setWords((current) => [...current, emptyWord()]);
  }

  function removeWord(index: number) {
    setWords((current) =>
      current.length === 1 ? [emptyWord()] : current.filter((_, i) => i !== index),
    );
  }

  function buildPayload(): ActivityPayload | { error: string } {
    if (!name.trim()) return { error: "Activity name is required." };

    const cleanedWords = words
      .map((w) => ({
        english: w.english.trim(),
        phonemes: w.phonemes
          .split(/\s+/)
          .map((s) => s.trim())
          .filter(Boolean),
      }))
      .filter((w) => w.phonemes.length > 0);

    if (cleanedWords.length === 0) {
      return { error: "At least one word with phonemes is required." };
    }

    if (activityType === "wordle" && cleanedWords.length !== 1) {
      return { error: "A Wordle activity must have exactly one target word." };
    }

    if (activityType === "wordle" && (!numGuesses || numGuesses < 1)) {
      return { error: "Number of guesses must be at least 1." };
    }

    if (activityType === "wordsearch" && (!rows || !cols || rows < 2 || cols < 2)) {
      return { error: "Word Search rows and columns must be at least 2." };
    }

    return {
      name: name.trim(),
      activityType,
      difficulty,
      showHints,
      numGuesses: activityType === "wordle" ? numGuesses : null,
      rows: activityType === "wordsearch" ? rows : null,
      cols: activityType === "wordsearch" ? cols : null,
      words: cleanedWords.map((w) => ({
        english: w.english || undefined,
        phonemes: w.phonemes.map((symbol) => ({ symbol })),
      })),
    };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const result = buildPayload();
    if ("error" in result) {
      setError(result.error);
      return;
    }

    setSaving(true);
    try {
      const saved = isEditing && activity
        ? await updateActivity(activity.id, result)
        : await createActivity(result);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save activity.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "border border-gray-300 rounded px-2 py-1 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-slate-700 dark:bg-slate-950/80"
    >
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {isEditing ? "Edit activity" : "New activity"}
      </h2>

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className={labelClass}>Activity name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputClass} w-full`}
            placeholder="e.g. Wordle — chat"
          />
        </label>

        <label>
          <span className={labelClass}>Activity type</span>
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as ActivityType)}
            className={`${inputClass} w-full`}
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className={labelClass}>Difficulty</span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
            className={`${inputClass} w-full`}
          >
            {DIFFICULTY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt[0].toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-end gap-2">
          <input
            type="checkbox"
            checked={showHints}
            onChange={(e) => setShowHints(e.target.checked)}
          />
          <span className="text-sm text-slate-700 dark:text-slate-200">Show phoneme hints</span>
        </label>

        {activityType === "wordle" && (
          <label>
            <span className={labelClass}>Number of guesses</span>
            <input
              type="number"
              min={1}
              max={20}
              value={numGuesses}
              onChange={(e) => setNumGuesses(Number(e.target.value))}
              className={`${inputClass} w-full`}
            />
          </label>
        )}

        {activityType === "wordsearch" && (
          <>
            <label>
              <span className={labelClass}>Rows</span>
              <input
                type="number"
                min={2}
                max={40}
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                className={`${inputClass} w-full`}
              />
            </label>
            <label>
              <span className={labelClass}>Columns</span>
              <input
                type="number"
                min={2}
                max={40}
                value={cols}
                onChange={(e) => setCols(Number(e.target.value))}
                className={`${inputClass} w-full`}
              />
            </label>
          </>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Words {activityType === "wordle" ? "(single target)" : ""}
          </h3>
          {activityType === "wordsearch" && (
            <button
              type="button"
              onClick={addWord}
              className="rounded-lg bg-slate-200 px-3 py-1 text-sm font-medium text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              + Add word
            </button>
          )}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter phonemes separated by spaces. Multi-character phonemes such as
          <code className="mx-1 rounded bg-slate-100 px-1 dark:bg-slate-800">tʃ</code>,
          <code className="mx-1 rounded bg-slate-100 px-1 dark:bg-slate-800">eɪ</code> and
          <code className="mx-1 rounded bg-slate-100 px-1 dark:bg-slate-800">ʉː</code> are supported.
        </p>

        {words.map((word, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700 sm:flex-row sm:items-center"
          >
            <input
              value={word.phonemes}
              onChange={(e) => updateWord(index, { phonemes: e.target.value })}
              className={`${inputClass} flex-1`}
              placeholder="phonemes e.g. tʃ æ t"
            />
            <input
              value={word.english}
              onChange={(e) => updateWord(index, { english: e.target.value })}
              className={`${inputClass} sm:w-40`}
              placeholder="English (optional)"
            />
            {activityType === "wordsearch" && (
              <button
                type="button"
                onClick={() => removeWord(index)}
                className="rounded-lg bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-950/50 dark:text-red-300"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
        >
          {saving ? "Saving…" : isEditing ? "Save changes" : "Create activity"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <span className="ml-auto text-xs text-slate-400">
          {STUDENT_STAMP.name} — {STUDENT_STAMP.number}
        </span>
      </div>
    </form>
  );
}

export default ActivityEditor;
