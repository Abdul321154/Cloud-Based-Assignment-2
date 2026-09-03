"use client";

import { useEffect, useState } from "react";

import { createWordSearchMarkup } from "@/utils/buildWordSearchDocument";
import { triggerMarkupExport } from "@/utils/exportMarkupFile";
import { pickBuilderWidth, pickOuterSpacing } from "@/utils/viewportTokens";
import { useMarkupBuffer } from "@/hooks/useMarkupBuffer";
import { useUiStateBridge } from "@/hooks/useUiStateBridge";
import {
  activityToWordSearchConfig,
  createActivity,
  fetchActivities,
  STUDENT_STAMP,
} from "@/lib/api-client";
import type { ActivityConfig, WordSearchWord } from "@/types";

export default function PhonemeSearchBuilder() {
  const { uiState } = useUiStateBridge();
  const { markup, setMarkup } = useMarkupBuffer();
  const sectionWidthClass = pickBuilderWidth(uiState.layoutWidth);
  const pagePaddingClass = pickOuterSpacing(uiState.compactSpacing);

  const [phonemeWord, setPhonemeWord] = useState("");
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [showHints, setShowHints] = useState(false);

  const [saved, setSaved] = useState<ActivityConfig[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchActivities("wordsearch");
        if (!cancelled) setSaved(data);
      } catch {
        if (!cancelled) setSaved([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function parseWords(value: string): WordSearchWord[] {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({ phonemes: line.split(/\s+/) }));
  }

  function generateFromFields() {
    const words = parseWords(phonemeWord);
    if (words.length === 0) {
      setNotice("Enter at least one phoneme word before generating.");
      return;
    }
    setNotice(null);
    setMarkup(
      createWordSearchMarkup({
        studentName: STUDENT_STAMP.name,
        studentNumber: STUDENT_STAMP.number,
        words,
        rows,
        cols,
        showHints,
      }),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    generateFromFields();
  }

  function loadSelected(id: string) {
    setSelectedId(id);
    const activity = saved.find((a) => a.id === id);
    if (!activity) return;
    const config = activityToWordSearchConfig(activity);
    setPhonemeWord(config.words.map((w) => w.phonemes.join(" ")).join("\n"));
    setRows(config.rows ?? 10);
    setCols(config.cols ?? 10);
    setShowHints(Boolean(config.showHints));
    setNotice(null);
    setMarkup(createWordSearchMarkup(config));
  }

  async function saveCurrent() {
    const words = parseWords(phonemeWord);
    if (words.length === 0) {
      setNotice("Enter at least one phoneme word before saving.");
      return;
    }
    setNotice(null);
    try {
      const created = await createActivity({
        name: `Word Search — ${words.length} words`,
        activityType: "wordsearch",
        difficulty: "medium",
        showHints,
        numGuesses: null,
        rows,
        cols,
        words: words.map((w) => ({
          phonemes: w.phonemes.map((symbol) => ({ symbol })),
        })),
      });
      setSaved((current) => [created, ...current]);
      setSelectedId(created.id);
      setNotice(`Saved “${created.name}” to the library.`);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Failed to save activity.");
    }
  }

  const inputClass =
    "border border-gray-300 rounded px-2 py-1 ml-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

  return (
    <div
      className={`mx-auto flex min-h-screen w-full flex-col items-stretch justify-center gap-6 ${pagePaddingClass} lg:flex-row`}
    >
      <section
        className={`w-full ${sectionWidthClass} rounded-[2rem] border border-slate-200 bg-white/90 p-10 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-slate-700 dark:bg-slate-950/80`}
      >
        <h2 className="text-2xl mb-4 font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Word Search Game generator
        </h2>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Load saved:
            <select
              value={selectedId}
              onChange={(e) => loadSelected(e.target.value)}
              className={inputClass}
            >
              <option value="">— select an activity —</option>
              {saved.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col text-start space-y-4">
          <label>Phoneme Words:</label>
          <textarea
            name="phonemeWord"
            value={phonemeWord}
            onChange={(e) => setPhonemeWord(e.target.value)}
            placeholder="Enter phoneme words, one per line (e.g. tʃ ɛɹ)"
            className={`${inputClass} w-full`}
            rows={5}
          />
          <label>Rows:</label>
          <input
            name="rows"
            type="number"
            min={2}
            max={40}
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            placeholder="Enter number of rows"
            className={inputClass}
          />
          <label>Columns:</label>
          <input
            name="columns"
            type="number"
            min={2}
            max={40}
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            placeholder="Enter number of columns"
            className={inputClass}
          />
          <label>Hints:</label>
          <select
            name="showHints"
            value={showHints ? "first-letter" : "none"}
            onChange={(e) => setShowHints(e.target.value === "first-letter")}
            className={inputClass}
          >
            <option value="none">No</option>
            <option value="first-letter">Yes</option>
          </select>

          {notice && (
            <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              {notice}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              Generate Preview
            </button>
            <button
              type="button"
              onClick={saveCurrent}
              className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Save to Library
            </button>
            {markup && (
              <button
                type="button"
                onClick={() =>
                  triggerMarkupExport(
                    `phoneme-word-search-${STUDENT_STAMP.downloadKey}.html`,
                    markup,
                  )
                }
                className="rounded-lg bg-emerald-100 px-4 py-2 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300"
              >
                Download HTML File
              </button>
            )}
          </div>
        </form>
      </section>
      <section
        className={`flex w-full ${sectionWidthClass} flex-col rounded-[2rem] border border-slate-200 bg-white/90 p-10 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-slate-700 dark:bg-slate-950/80`}
      >
        <h2 className="text-2xl mb-4 font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          Preview
        </h2>
        <iframe
          srcDoc={markup}
          title="Word Search Preview"
          className="w-full flex-1 border border-gray-300 rounded"
        />
      </section>
    </div>
  );
}
