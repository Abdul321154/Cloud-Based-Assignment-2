import type { ThemeMode, LayoutWidth, UiPrefs } from "@/types";

export const BASE_UI_PREFS: Readonly<UiPrefs> = Object.freeze({
  theme: "light",
  layoutWidth: "regular",
  compactSpacing: false,
});

const PREFS_COOKIE_KEY = "phoneme_builder_preferences";
const PREFS_COOKIE_TTL = 60 * 60 * 24 * 365;

function canAccessDocument(): boolean {
  return typeof document !== "undefined";
}

function parseDecodedJsonSafely(encodedValue: string): Record<string, unknown> | null {
  try {
    return JSON.parse(decodeURIComponent(encodedValue)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function sanitizeUiPrefs(rawPreferences: Record<string, unknown> = {}): UiPrefs {
  return {
    theme: rawPreferences.theme === "dark" ? "dark" : "light",
    layoutWidth: rawPreferences.layoutWidth === "wide" ? "wide" : "regular",
    compactSpacing: Boolean(rawPreferences.compactSpacing),
  };
}

function readCookieMap(): Map<string, string> {
  if (!canAccessDocument()) return new Map();

  const tuples = (document.cookie ? document.cookie.split(";") : []).map((cookie) => {
    const [cookieName, ...valueParts] = cookie.trim().split("=");
    return [cookieName, valueParts.join("=")] as [string, string];
  });

  return new Map(tuples);
}

function encodeUiPrefs(uiPrefs: UiPrefs): string {
  const sanitized = sanitizeUiPrefs(uiPrefs as unknown as Record<string, unknown>);
  return encodeURIComponent(JSON.stringify(sanitized));
}

function readStoredUiPrefs(): UiPrefs | null {
  const cookieValue = readCookieMap().get(PREFS_COOKIE_KEY);
  if (!cookieValue) return null;

  const parsed = parseDecodedJsonSafely(cookieValue);
  if (!parsed) return null;

  return sanitizeUiPrefs(parsed);
}

function withDefaultUiPrefs(raw: UiPrefs | null): UiPrefs {
  if (!raw) return { ...BASE_UI_PREFS };

  return {
    ...BASE_UI_PREFS,
    ...raw,
  };
}

function composeCookieLine(encodedPrefs: string): string {
  return [
    `${PREFS_COOKIE_KEY}=${encodedPrefs}`,
    `max-age=${PREFS_COOKIE_TTL}`,
    "path=/",
    "samesite=lax",
  ].join("; ");
}

export function loadUiPrefs(): UiPrefs {
  return withDefaultUiPrefs(readStoredUiPrefs());
}

export function persistUiPrefs(uiPrefs: UiPrefs): void {
  if (!canAccessDocument()) {
    return;
  }

  document.cookie = composeCookieLine(encodeUiPrefs(uiPrefs));
}

export type { ThemeMode, LayoutWidth };
