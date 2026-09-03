"use client";

import { useUiStateBridge } from "@/hooks/useUiStateBridge";
import { pickOuterSpacing, pickReadingWidth } from "@/utils/viewportTokens";
import type { ThemeMode, LayoutWidth } from "@/types";

const COLOR_MODE_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function ControlGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white/60 p-6 dark:border-slate-700 dark:bg-slate-900/40">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function InterfaceControls() {
  const { uiState, patchUiState, resetUiState } = useUiStateBridge();
  const pagePaddingClass = pickOuterSpacing(uiState.compactSpacing);
  const sectionWidthClass = pickReadingWidth(uiState.layoutWidth);

  return (
    <div
      className={`mx-auto flex min-h-screen w-full items-center justify-center ${pagePaddingClass}`}
    >
      <section
        className={`w-full ${sectionWidthClass} space-y-8 rounded-[2rem] border border-slate-200 bg-white/90 p-10 text-start shadow-xl shadow-slate-900/5 backdrop-blur dark:border-slate-700 dark:bg-slate-950/80`}
      >
        <header className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
            Interface Settings
          </h1>
          <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
            Choose your theme and layout preferences. Changes are saved in a
            cookie and restored automatically.
          </p>
        </header>

        <div className="space-y-8">
          <ControlGroup title="Theme">
            <div className="flex flex-wrap gap-3">
              {COLOR_MODE_OPTIONS.map((modeOption) => (
                <label
                  key={modeOption.value}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <input
                    type="radio"
                    name="theme"
                    value={modeOption.value}
                    checked={uiState.theme === modeOption.value}
                    onChange={() => patchUiState({ theme: modeOption.value })}
                  />
                  {modeOption.label}
                </label>
              ))}
            </div>
          </ControlGroup>

          <ControlGroup title="Layout">
            <label className="flex flex-col gap-2">
              <span className="text-slate-700 dark:text-slate-200">
                Content width
              </span>
              <select
                value={uiState.layoutWidth}
                onChange={(event) =>
                  patchUiState({ layoutWidth: event.target.value as LayoutWidth })
                }
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="regular">Regular</option>
                <option value="wide">Wide</option>
              </select>
            </label>

            <label className="inline-flex cursor-pointer items-center gap-3 rounded-lg border border-slate-300 px-4 py-3 text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
              <input
                type="checkbox"
                checked={uiState.compactSpacing}
                onChange={(event) =>
                  patchUiState({ compactSpacing: event.target.checked })
                }
              />
              Use compact page spacing
            </label>
          </ControlGroup>
        </div>

        <div>
          <button
            type="button"
            onClick={resetUiState}
            className="rounded-lg bg-slate-900 px-4 py-2 text-white transition-colors hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            Reset to Defaults
          </button>
        </div>
      </section>
    </div>
  );
}
