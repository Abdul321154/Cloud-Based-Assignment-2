import { test, expect } from '@playwright/test';

test('should create a new Wordle activity', async ({ page }) => {
  await page.goto('/');
  
  // Navigate to library
  await page.click('text=Open Library');
  
  // Click "New activity" button
  await page.click('text=+ New activity');
  
  // Fill in activity details
  await page.fill('input[name="name"]', 'Test Wordle Activity');
  await page.selectOption('select[name="activityType"]', 'wordle');
  await page.selectOption('select[name="difficulty"]', 'medium');
  
  // Add a word
  await page.click('text=Add Word');
  await page.fill('input[placeholder="English word (optional)"]', 'test');
  await page.fill('input[placeholder="Phoneme symbols"]', 't,e,s,t');
  
  // Save the activity
  await page.click('text=Save Activity');
  
  // Verify the activity was saved
  await expect(page.locator('text=Test Wordle Activity')).toBeVisible();
});

test('should generate HTML for a Wordle activity', async ({ page }) => {
  await page.goto('/library');
  
  // Find the first activity and click "Generate HTML"
  const generateButton = page.locator('button:has-text("Generate HTML")').first();
  await generateButton.click();
  
  // Wait for download
  const download = await page.waitForEvent('download');
  const suggestedFilename = download.suggestedFilename();
  
  // Verify filename
  expect(suggestedFilename).toContain('.html');
  expect(suggestedFilename).toContain('phoneme-wordle');
});