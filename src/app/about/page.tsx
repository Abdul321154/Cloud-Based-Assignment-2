"use client";

import { useUiStateBridge } from "@/hooks/useUiStateBridge";
import { pickOuterSpacing, pickReadingWidth } from "@/utils/viewportTokens";

const INFO_BLOCKS = [
  {
    title: "Project Overview",
    paragraphs: [
      "This project is a web application developed as part of CSE3CWA. It allows teachers to create interactive phoneme-based learning activities for Speech Pathology students. The application provides tools for generating activities such as Phoneme Wordle and Phoneme Word Search, with a simple and user-friendly interface.",
      "Teachers can store phoneme-based word lists, activity settings and hints in a database, then generate downloadable HTML activities from the stored data.",
    ],
  },
  {
    title: "Assessment 1 — Frontend",
    paragraphs: [
      "Assessment 1 focused on the frontend of the application using Next.js and React, demonstrating responsive page design, reusable components, navigation, and user interface development.",
    ],
  },
  {
    title: "Assessment 2 — Backend & Database",
    paragraphs: [
      "Assessment 2 introduces the backend and database layer. It uses Next.js route handlers to expose CRUD APIs, Prisma as the ORM with a SQLite database, and a normalised schema that stores activity configurations, words and individual phonemes (including multi-character phoneme symbols).",
      "The application is dockerised so it runs consistently across environments, and a /health endpoint reports the service and database status.",
    ],
  },
];

export default function ProjectOverview() {
  const { uiState } = useUiStateBridge();
  const sectionWidthClass = pickReadingWidth(uiState.layoutWidth);
  const pagePaddingClass = pickOuterSpacing(uiState.compactSpacing);

  return (
    <div
      className={`mx-auto flex min-h-screen w-full items-center justify-center ${pagePaddingClass}`}
    >
      <section
        className={`w-full ${sectionWidthClass} space-y-12 rounded-[2rem] border border-slate-200 bg-white/90 p-10 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-slate-700 dark:bg-slate-950/80`}
      >
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
          About This Project
        </h1>
        {INFO_BLOCKS.map((block) => (
          <div key={block.title} className="text-start">
            <h2 className="text-2xl mb-4 font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
              {block.title}
            </h2>
            {block.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-lg mb-2 leading-8 text-slate-600 dark:text-slate-300"
              >
                {paragraph}
              </p>
            ))}
          </div>
        ))}

        <div className="text-start">
          <h2 className="text-2xl mb-4 font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Student Information
          </h2>

          <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
            <strong>Student Name:</strong> Abdullah Adnan Yakoob Al-Mashhadani
          </p>
          <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
            <strong>Student Number:</strong> 21991414
          </p>
        </div>
        <div className="text-start">
          <h2 className="text-2xl mb-4 font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Demonstration Video
          </h2>
          <iframe
            className="mt-6 w-full aspect-video rounded-lg border border-slate-200 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-950/80"
            src="https://www.youtube.com/embed/pKgzFLj-u_A"
            title="Demonstration Video"
            allowFullScreen
          ></iframe>
        </div>
      </section>
    </div>
  );
}
