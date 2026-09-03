export type ThemeMode = "light" | "dark";

export type LayoutWidth = "regular" | "wide";

export interface UiPrefs {
  theme: ThemeMode;
  layoutWidth: LayoutWidth;
  compactSpacing: boolean;
}

export interface SharedPageProps {
  compactSpacing: boolean;
  layoutWidth: LayoutWidth;
}

export interface WordleConfig {
  studentName?: string;
  studentNumber?: string;
  targetPhonemes: string[];
  targetEnglish?: string;
  numGuesses?: number;
  showHints?: boolean;
  keyboardPhonemes?: string[];
  phonemeHints?: Record<string, string>;
}

export interface WordSearchWord {
  phonemes: string[];
  english?: string;
}

export interface WordSearchConfig {
  studentName?: string;
  studentNumber?: string;
  words: WordSearchWord[];
  rows?: number;
  cols?: number;
  showHints?: boolean;
  phonemeHints?: Record<string, string>;
}

export type ActivityType = "wordle" | "wordsearch";
export type DifficultyLevel = "easy" | "medium" | "hard";

export interface PhonemeRecord {
  id: string;
  symbol: string;
  position: number;
}

export interface WordRecord {
  id: string;
  english: string | null;
  position: number;
  phonemes: PhonemeRecord[];
}

export interface ActivityConfig {
  id: string;
  name: string;
  activityType: ActivityType;
  difficulty: DifficultyLevel;
  showHints: boolean;
  numGuesses: number | null;
  rows: number | null;
  cols: number | null;
  words: WordRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityPayload {
  name: string;
  activityType: ActivityType;
  difficulty: DifficultyLevel;
  showHints: boolean;
  numGuesses?: number | null;
  rows?: number | null;
  cols?: number | null;
  words: { english?: string; phonemes: { symbol: string }[] }[];
}
