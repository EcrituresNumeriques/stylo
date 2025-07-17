// @ts-check
import { expect, test } from '@playwright/test'

test('has title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Stylo/)
})

test('go to login page', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('login').click()
  await expect(page.getByTestId('local-login-form')).toBeVisible()
})
