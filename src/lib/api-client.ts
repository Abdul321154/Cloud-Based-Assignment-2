import type {
  ActivityConfig,
  ActivityPayload,
  WordleConfig,
  WordSearchConfig,
  WordSearchWord,
} from "@/types";

const STUDENT_STAMP = Object.freeze({
  name: "Abdullah Adnan Yakoob Al-Mashhadani",
  number: "21991414",
  downloadKey: "21991414",
});

export { STUDENT_STAMP };

async function parseResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      (body as { error?: string }).error ??
      `Request failed (${response.status})`;
    throw new Error(message);
  }
  return (body as { data: T }).data;
}

export async function fetchActivities(
  type?: string,
): Promise<ActivityConfig[]> {
  const url = type
    ? `/api/activities?activityType=${encodeURIComponent(type)}`
    : "/api/activities";
  const res = await fetch(url, { cache: "no-store" });
  return parseResponse<ActivityConfig[]>(res);
}

export async function fetchActivity(id: string): Promise<ActivityConfig> {
  const res = await fetch(`/api/activities/${id}`, { cache: "no-store" });
  return parseResponse<ActivityConfig>(res);
}

export async function createActivity(
  payload: ActivityPayload,
): Promise<ActivityConfig> {
  const res = await fetch("/api/activities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<ActivityConfig>(res);
}

export async function updateActivity(
  id: string,
  payload: ActivityPayload,
): Promise<ActivityConfig> {
  const res = await fetch(`/api/activities/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<ActivityConfig>(res);
}

export async function deleteActivity(id: string): Promise<void> {
  const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
  await parseResponse<{ id: string }>(res);
}

export function activityToWordleConfig(activity: ActivityConfig): WordleConfig {
  const word = activity.words[0];
  return {
    studentName: STUDENT_STAMP.name,
    studentNumber: STUDENT_STAMP.number,
    targetPhonemes: word?.phonemes.map((p) => p.symbol) ?? [],
    targetEnglish: word?.english ?? "",
    numGuesses: activity.numGuesses ?? 6,
    showHints: activity.showHints,
  };
}

export function activityToWordSearchConfig(
  activity: ActivityConfig,
): WordSearchConfig {
  const words: WordSearchWord[] = activity.words.map((w) => ({
    phonemes: w.phonemes.map((p) => p.symbol),
    english: w.english ?? undefined,
  }));
  return {
    studentName: STUDENT_STAMP.name,
    studentNumber: STUDENT_STAMP.number,
    words,
    rows: activity.rows ?? 10,
    cols: activity.cols ?? 10,
    showHints: activity.showHints,
  };
}
