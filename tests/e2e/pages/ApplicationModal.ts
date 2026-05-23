// tests/e2e/pages/ApplicationModal.ts
import { type Locator, type Page, expect } from '@playwright/test'
import type { TestApplication } from '../../fixtures/test-data'

export class ApplicationModal {
  readonly page: Page
  readonly modal: Locator
  readonly submitButton: Locator
  readonly cancelButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    // Unique data-testid — no ambiguity with other page elements
    this.modal = page.locator('[data-testid="app-modal"]')
    // Scoped to the modal submit button specifically
    this.submitButton = page.locator('[data-testid="modal-submit"]')
    this.cancelButton = this.modal.getByRole('button', { name: /cancel/i })
    this.errorMessage = this.modal.locator('p.text-red-600')
  }

  async isVisible(): Promise<boolean> {
    return this.modal.isVisible()
  }

  async waitForOpen() {
    await expect(this.modal).toBeVisible({ timeout: 5000 })
  }

  async fill(app: TestApplication) {
    // Use field ids (htmlFor connected) — Playwright resolves getByLabel via for/id
    if (app.company !== undefined) {
      await this.page.locator('#field-company').fill(app.company)
    }
    if (app.role !== undefined) {
      await this.page.locator('#field-role').fill(app.role)
    }
    if (app.location !== undefined) {
      await this.page.locator('#field-location').fill(app.location)
    }
    if (app.status !== undefined) {
      await this.page.locator('#field-status').selectOption(app.status)
    }
    if (app.dateApplied !== undefined) {
      await this.page.locator('#field-date').fill(app.dateApplied)
    }
    if (app.url !== undefined) {
      await this.page.locator('#field-url').fill(app.url)
    }
    if (app.salaryMin !== undefined) {
      await this.page.locator('#field-salary-min').fill(app.salaryMin)
    }
    if (app.salaryMax !== undefined) {
      await this.page.locator('#field-salary-max').fill(app.salaryMax)
    }
    if (app.notes !== undefined) {
      await this.page.locator('#field-notes').fill(app.notes)
    }
  }

  async submit() {
    await this.submitButton.click()
    await expect(this.modal).not.toBeVisible({ timeout: 8000 })
  }

  async cancel() {
    await this.cancelButton.click()
    await expect(this.modal).not.toBeVisible()
  }
}
