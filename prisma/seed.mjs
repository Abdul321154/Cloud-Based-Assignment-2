import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.phoneme.deleteMany();
  await prisma.word.deleteMany();
  await prisma.activityConfig.deleteMany();

  await prisma.activityConfig.create({
    data: {
      name: "Wordle — chat",
      activityType: "wordle",
      difficulty: "easy",
      showHints: true,
      numGuesses: 6,
      words: {
        create: [
          {
            position: 0,
            english: "chat",
            phonemes: {
              create: [
                { symbol: "tʃ", position: 0 },
                { symbol: "æ", position: 1 },
                { symbol: "t", position: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.activityConfig.create({
    data: {
      name: "Wordle — ship",
      activityType: "wordle",
      difficulty: "medium",
      showHints: true,
      numGuesses: 5,
      words: {
        create: [
          {
            position: 0,
            english: "ship",
            phonemes: {
              create: [
                { symbol: "ʃ", position: 0 },
                { symbol: "ɪ", position: 1 },
                { symbol: "p", position: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.activityConfig.create({
    data: {
      name: "Word Search — initial consonants",
      activityType: "wordsearch",
      difficulty: "medium",
      showHints: true,
      rows: 12,
      cols: 12,
      words: {
        create: [
          {
            position: 0,
            english: "chair",
            phonemes: {
              create: [
                { symbol: "tʃ", position: 0 },
                { symbol: "ɛ", position: 1 },
                { symbol: "ɹ", position: 2 },
              ],
            },
          },
          {
            position: 1,
            english: "shake",
            phonemes: {
              create: [
                { symbol: "ʃ", position: 0 },
                { symbol: "eɪ", position: 1 },
                { symbol: "k", position: 2 },
              ],
            },
          },
          {
            position: 2,
            english: "bait",
            phonemes: {
              create: [
                { symbol: "b", position: 0 },
                { symbol: "eɪ", position: 1 },
                { symbol: "t", position: 2 },
              ],
            },
          },
          {
            position: 3,
            english: "boot",
            phonemes: {
              create: [
                { symbol: "b", position: 0 },
                { symbol: "ʉː", position: 1 },
                { symbol: "t", position: 2 },
              ],
            },
          },
          {
            position: 4,
            english: "ring",
            phonemes: {
              create: [
                { symbol: "ɹ", position: 0 },
                { symbol: "ɪ", position: 1 },
                { symbol: "ŋ", position: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seeded 3 activities.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
