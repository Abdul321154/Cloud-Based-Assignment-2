"use client";

import Link from "next/link";
import { useUiStateBridge } from "@/hooks/useUiStateBridge";
import { pickOuterSpacing, pickReadingWidth } from "@/utils/viewportTokens";

const PROMO_SECTIONS = [
  {
    heading: "Activity Library",
    description:
      "Create, edit and delete saved phoneme activities. All word lists and settings are stored in a database and can be reused to generate downloadable HTML.",
    to: "/library",
    actionText: "Open Library",
  },
  {
    heading: "Wordle",
    description:
      "This is a Wordle activity that allows students to practice their phoneme skills. Students will be given a set of letters and must create as many words as possible using those letters.",
    to: "/wordle",
    actionText: "Start Wordle",
  },
  {
    heading: "Word Search",
    description:
      "This is a Word Search activity that allows students to practice their phoneme skills. Students will be given a set of letters and must find as many words as possible using those letters.",
    to: "/wordsearch",
    actionText: "Start Word Search",
  },
];

const SIGNATURE_ITEMS = [
  { label: "Student Name", value: "Abdullah Adnan Yakoob Al-Mashhadani" },
  { label: "Student Number", value: "21991414" },
];

const promoCardClass =
  "w-full rounded-[2rem] bg-white/90 p-10 shadow-xl shadow-slate-900/5 backdrop-blur dark:bg-slate-950/80";

export default function LandingPanel() {
  const { uiState } = useUiStateBridge();
  const sectionWidthClass = pickReadingWidth(uiState.layoutWidth);
  const pagePaddingClass = pickOuterSpacing(uiState.compactSpacing);

  return (
    <div
      className={`mx-auto flex min-h-screen w-full flex-col items-center justify-center space-y-12 ${pagePaddingClass}`}
    >
      <section
        className={`w-full ${sectionWidthClass} rounded-[2rem] border border-slate-200 bg-white/90 p-10 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-slate-700 dark:bg-slate-950/80`}
      >
        <h1 className="text-4xl mb-4 font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
          Phoneme Activity Builder
        </h1>
        {SIGNATURE_ITEMS.map((item) => (
          <p
            key={item.label}
            className="mt-2 text-lg leading-8 text-slate-600 dark:text-slate-300"
          >
            {item.label}: {item.value}
          </p>
        ))}
      </section>

      {PROMO_SECTIONS.map((item) => (
        <section
          key={item.to}
          className={`${promoCardClass} ${sectionWidthClass}`}
        >
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            {item.heading}
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-300">
            {item.description}
          </p>
          <Link
            href={item.to}
            className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            {item.actionText}
          </Link>
        </section>
      ))}
    </div>
  );
}
