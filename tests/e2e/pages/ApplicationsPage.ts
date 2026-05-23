// tests/e2e/pages/ApplicationsPage.ts
import { type Locator, type Page, expect } from '@playwright/test'

export class ApplicationsPage {
  readonly page: Page

  // Header
  readonly addButton: Locator

  // Filters
  readonly searchInput: Locator
  readonly clearFiltersLink: Locator
  readonly resultCount: Locator

  // Table
  readonly table: Locator
  readonly emptyState: Locator

  // Stats cards (by label text)
  readonly statsSection: Locator

  constructor(page: Page) {
    this.page = page
    this.addButton = page.getByRole('button', { name: /add application/i })
    this.searchInput = page.getByPlaceholder(/search company or role/i)
    this.clearFiltersLink = page.getByText(/clear/i)
    this.resultCount = page.locator('span').filter({ hasText: /application/ }).last()
    this.table = page.locator('table')
    this.emptyState = page.getByText(/no applications yet/i)
    this.statsSection = page.locator('main > div').first()
  }

  async goto() {
    await this.page.goto('/')
    await expect(this.addButton).toBeVisible()
  }

  // ── Stats ────────────────────────────────────────────────────────────────

  async getStatValue(label: string): Promise<string> {
    const card = this.page.locator('div').filter({ hasText: label }).first()
    // The value is the large number — second text node inside the card
    return (await card.locator('p').nth(1).textContent()) ?? ''
  }

  // ── Filters ──────────────────────────────────────────────────────────────

  async search(term: string) {
    await this.searchInput.fill(term)
    await this.page.waitForTimeout(300) // debounce
  }

  async clickStatusChip(status: string) {
    const chip = this.page.getByRole('button', {
      name: new RegExp(status, 'i'),
    })
    await chip.first().click()
    await this.page.waitForTimeout(200)
  }

  async clearFilters() {
    await this.clearFiltersLink.click()
    await this.page.waitForTimeout(200)
  }

  // ── Table ────────────────────────────────────────────────────────────────

  async getRowByCompany(company: string): Promise<Locator> {
    return this.table.locator('tr').filter({ hasText: company })
  }

  async rowExists(company: string): Promise<boolean> {
    const row = await this.getRowByCompany(company)
    return row.isVisible()
  }

  async clickEdit(company: string) {
    const row = await this.getRowByCompany(company)
    await row.getByRole('button', { name: /edit/i }).click()
  }

  async clickDelete(company: string) {
    const row = await this.getRowByCompany(company)
    await row.getByRole('button', { name: /delete/i }).click()
  }

  async getStatusBadge(company: string): Promise<string> {
    const row = await this.getRowByCompany(company)
    return (await row.locator('span[class*="rounded-full"]').textContent()) ?? ''
  }

  // ── Add button ───────────────────────────────────────────────────────────

  async openAddModal() {
    await this.addButton.click()
  }
}
