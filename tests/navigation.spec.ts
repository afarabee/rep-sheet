import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('home page loads with greeting', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=Seeing your six-pack yet')).toBeVisible()
  })

  test('can navigate to History page', async ({ page }) => {
    await page.goto('/')
    await page.click('a[href="/history"]')
    await expect(page).toHaveURL('/history')
  })

  test('can navigate to Calendar page', async ({ page }) => {
    await page.goto('/')
    await page.click('a[href="/calendar"]')
    await expect(page).toHaveURL('/calendar')
  })

  test('can navigate to Exercises page', async ({ page }) => {
    await page.goto('/')
    await page.click('a[href="/library"]')
    await expect(page).toHaveURL('/library')
  })

  test('can navigate to Settings page', async ({ page }) => {
    await page.goto('/')
    await page.click('a[href="/settings"]')
    await expect(page).toHaveURL('/settings')
  })

  test('unknown routes redirect to home', async ({ page }) => {
    await page.goto('/nonexistent')
    await expect(page).toHaveURL('/')
  })
})
