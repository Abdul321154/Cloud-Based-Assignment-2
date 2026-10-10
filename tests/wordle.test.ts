import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test('should create a new Wordle activity', async ({ page }) => {
  await page.goto('/');
  
  await page.click('text=Open Library');
  
  await page.click('text=+ New activity');
  
  await page.fill('input[name="name"]', 'Test Wordle Activity');
  await page.selectOption('select[name="activityType"]', 'wordle');
  await page.selectOption('select[name="difficulty"]', 'medium');
  
  await page.fill('input[name="english"]', 'test');
  await page.fill('input[name="phonemes"]', 't ɛ s t');
  
  await page.click('text=Create activity');
  
  await expect(page.locator('text=Test Wordle Activity')).toBeVisible();
});

test('should generate HTML for a Wordle activity', async ({ page }) => {
  await page.goto('/library');

  const card = page.locator('ul > li').filter({ hasText: 'Test Wordle Activity' });
  const generateButton = card.getByRole('button', { name: 'Generate HTML' });

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    generateButton.click(),
  ]);

  const suggestedFilename = download.suggestedFilename();
  expect(suggestedFilename).toContain('.html');
});