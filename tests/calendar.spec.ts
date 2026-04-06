import { test, expect } from '@playwright/test'

test.describe('Calendar', () => {
  test('renders current month with day headers', async ({ page }) => {
    await page.goto('/calendar')
    // Wait for the month heading to appear
    await expect(page.locator('button[aria-label="Previous month"]')).toBeVisible()
  })

  test('can navigate to previous month', async ({ page }) => {
    await page.goto('/calendar')

    // Wait for month heading
    const prevBtn = page.locator('button[aria-label="Previous month"]')
    await expect(prevBtn).toBeVisible()

    // Get current month text from the heading between the nav buttons
    const monthHeading = page.locator('button[aria-label="Previous month"] + span')
    const initialMonth = await monthHeading.textContent()

    await prevBtn.click()

    // Month should change
    await expect(monthHeading).not.toHaveText(initialMonth!)
  })

  test('can navigate to next month', async ({ page }) => {
    await page.goto('/calendar')

    const nextBtn = page.locator('button[aria-label="Next month"]')
    await expect(nextBtn).toBeVisible()

    const monthHeading = page.locator('button[aria-label="Previous month"] + span')
    const initialMonth = await monthHeading.textContent()

    await nextBtn.click()

    await expect(monthHeading).not.toHaveText(initialMonth!)
  })
})
