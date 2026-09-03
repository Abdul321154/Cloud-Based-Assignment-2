import type { Metadata } from "next";

import { BottomSignature } from "@/components/BottomSignature";
import { TopNavBar } from "@/components/TopNavBar";
import { UiStateBridgeProvider } from "@/hooks/useUiStateBridge";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phoneme Activity Builder",
  description: "Build phoneme-based learning activities: Wordle and Word Search.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UiStateBridgeProvider>
          <TopNavBar />
          <main className="min-h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            {children}
          </main>
          <BottomSignature />
        </UiStateBridgeProvider>
      </body>
    </html>
  );
}
