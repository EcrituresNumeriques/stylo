// @ts-check
import { expect, test } from '@playwright/test'

test('login', async ({ page }) => {
  await page.goto('/login')
  await page.getByTestId('local-login-username-field').fill('teste2e')
  await page.getByTestId('local-login-password-field').fill('teste2e')
  await page.getByTestId('local-login-form').getByRole('button').click()

  await expect(page).toHaveURL('/articles')
  await expect(page.getByTestId('create-article-button')).toBeVisible()
})
