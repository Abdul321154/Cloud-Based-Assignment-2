import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test('should create a new Word Search activity', async ({ page }) => {
  await page.goto('/');
  
  await page.click('text=Open Library');
  
  await page.click('text=+ New activity');
  
  await page.fill('input[name="name"]', 'Test Word Search Activity');
  await page.selectOption('select[name="activityType"]', 'wordsearch');
  await page.selectOption('select[name="difficulty"]', 'medium');

  await page.click('text=+ Add word', { clickCount: 3 });

  const englishInputs = page.locator('input[name="english"]');
  const phonemeInputs = page.locator('input[name="phonemes"]');

  console.log(englishInputs);

  const englishWords = ['test', 'exam', 'quiz'];
  const phonemeWords = ["t ɛ s t", "ɪ ɡ z æ m", "k w ɪ z"];

  for (let i = 0; i < englishWords.length; i++) {
    await englishInputs.nth(i).fill(englishWords[i]);
    await phonemeInputs.nth(i).fill(phonemeWords[i]);
  }

  await page.click('text=Create activity');
  
  await expect(page.locator('text=Test Word Search Activity')).toBeVisible();
});

test('should generate HTML for a Word Search activity', async ({ page }) => {
  await page.goto('/library');

  const card = page.locator('ul > li').filter({ hasText: 'Test Word Search Activity' });
  const generateButton = card.getByRole('button', { name: 'Generate HTML' });

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    generateButton.click(),
  ]);

  const suggestedFilename = download.suggestedFilename();
  expect(suggestedFilename).toContain('.html');
});