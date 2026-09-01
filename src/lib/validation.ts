import { z } from "zod";

export const ACTIVITY_TYPES = ["wordle", "wordsearch"] as const;
export const DIFFICULTY_LEVELS = ["easy", "medium", "hard"] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export const phonemeSchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(1, "Phoneme symbol cannot be empty")
    .max(8, "Phoneme symbol is too long"),
});

// A word is made up of one or more ordered phonemes.
export const wordSchema = z.object({
  id: z.string().optional(),
  english: z.string().trim().max(64).optional().or(z.literal("")),
  phonemes: z
    .array(phonemeSchema)
    .min(1, "Each word must have at least one phoneme"),
});

// Payload used when creating or updating a full activity configuration.
export const activitySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Activity name is required")
      .max(100, "Activity name is too long"),
    activityType: z.enum(ACTIVITY_TYPES, {
      message: "Activity type must be 'wordle' or 'wordsearch'",
    }),
    difficulty: z.enum(DIFFICULTY_LEVELS, {
      message: "Difficulty must be 'easy', 'medium' or 'hard'",
    }),
    showHints: z.boolean().default(true),
    numGuesses: z
      .number()
      .int("Number of guesses must be a whole number")
      .min(1, "Number of guesses must be at least 1")
      .max(20, "Number of guesses cannot exceed 20")
      .optional()
      .nullable(),
    rows: z
      .number()
      .int("Rows must be a whole number")
      .min(2, "Rows must be at least 2")
      .max(40, "Rows cannot exceed 40")
      .optional()
      .nullable(),
    cols: z
      .number()
      .int("Columns must be a whole number")
      .min(2, "Columns must be at least 2")
      .max(40, "Columns cannot exceed 40")
      .optional()
      .nullable(),
    words: z.array(wordSchema).min(1, "At least one word is required"),
  })
  .superRefine((data, ctx) => {
    if (data.activityType === "wordle") {
      if (data.words.length !== 1) {
        ctx.addIssue({
          code: "custom",
          message: "A Wordle activity must have exactly one target word",
          path: ["words"],
        });
      }
      if (data.numGuesses == null) {
        ctx.addIssue({
          code: "custom",
          message: "Number of guesses is required for a Wordle activity",
          path: ["numGuesses"],
        });
      }
    }
    if (data.activityType === "wordsearch") {
      if (data.rows == null) {
        ctx.addIssue({
          code: "custom",
          message: "Rows are required for a Word Search activity",
          path: ["rows"],
        });
      }
      if (data.cols == null) {
        ctx.addIssue({
          code: "custom",
          message: "Columns are required for a Word Search activity",
          path: ["cols"],
        });
      }
    }
  });

// Payload for adding or updating a single word within an activity.
export const singleWordSchema = wordSchema;

export type ActivityInput = z.infer<typeof activitySchema>;
export type WordInput = z.infer<typeof singleWordSchema>;
