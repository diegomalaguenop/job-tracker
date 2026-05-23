// tests/e2e/applications.spec.ts
import { expect, test } from '@playwright/test'
import { fullApplication, minimalApplication, uid } from '../fixtures/test-data'
import { ApplicationModal } from './pages/ApplicationModal'
import { ApplicationsPage } from './pages/ApplicationsPage'

test.describe('Job Application Tracker', () => {
  let page_: ApplicationsPage
  let modal: ApplicationModal

  test.beforeEach(async ({ page }) => {
    page_ = new ApplicationsPage(page)
    modal = new ApplicationModal(page)
    await page_.goto()
  })

  // ── 1. Create with all fields ─────────────────────────────────────────────

  test('should create an application with all fields', async () => {
    const app = fullApplication()

    await page_.openAddModal()
    await modal.waitForOpen()
    await modal.fill(app)
    await modal.submit()

    expect(await page_.rowExists(app.company)).toBeTruthy()

    const row = await page_.getRowByCompany(app.company)
    await expect(row).toContainText(app.role)
    await expect(row).toContainText(app.location)
    await expect(row).toContainText('$90,000')
  })

  // ── 2. Create with minimum required fields ────────────────────────────────

  test('should create an application with minimum required fields', async () => {
    const app = minimalApplication()

    await page_.openAddModal()
    await modal.waitForOpen()
    await modal.fill(app)
    await modal.submit()

    expect(await page_.rowExists(app.company)).toBeTruthy()
    const row = await page_.getRowByCompany(app.company)
    await expect(row).toContainText('—') // no salary
  })

  // ── 3. Edit an existing application ──────────────────────────────────────

  test('should edit an existing application', async ({ page }) => {
    const id = uid()
    const app = fullApplication(id)
    const updatedRole = `Senior QA Engineer [EDITED-${id}]`

    // Create first
    await page_.openAddModal()
    await modal.waitForOpen()
    await modal.fill(app)
    await modal.submit()

    // Edit
    await page_.clickEdit(app.company)
    await modal.waitForOpen()
    await page.getByLabel(/role/i).fill(updatedRole)
    await modal.submit()

    const row = await page_.getRowByCompany(app.company)
    await expect(row).toContainText(updatedRole)
  })

  // ── 4. Change application status ─────────────────────────────────────────

  test('should change application status from applied to interview', async ({ page }) => {
    const app = minimalApplication()

    await page_.openAddModal()
    await modal.waitForOpen()
    await modal.fill(app)
    await modal.submit()

    // Verify initial status badge
    let badge = await page_.getStatusBadge(app.company)
    expect(badge.toLowerCase()).toContain('applied')

    // Edit → change status
    await page_.clickEdit(app.company)
    await modal.waitForOpen()
    await page.getByLabel(/status/i).selectOption('interview')
    await modal.submit()

    badge = await page_.getStatusBadge(app.company)
    expect(badge.toLowerCase()).toContain('interview')
  })

  // ── 5. Filter by status chip ──────────────────────────────────────────────

  test('should filter applications by status chip', async () => {
    const id = uid()
    const offerApp = { ...fullApplication(id), status: 'offer', company: `Stripe-${id}` }
    const appliedApp = { ...minimalApplication(id), company: `GitHub-${id}` }

    // Create both
    for (const app of [offerApp, appliedApp]) {
      await page_.openAddModal()
      await modal.waitForOpen()
      await modal.fill(app)
      await modal.submit()
    }

    // Filter by "Offer"
    await page_.clickStatusChip('offer')

    expect(await page_.rowExists(offerApp.company)).toBeTruthy()
    // Applied app should not be visible
    const appliedRow = await page_.getRowByCompany(appliedApp.company)
    await expect(appliedRow).not.toBeVisible()

    // Clear filter → both visible
    await page_.clearFilters()
    expect(await page_.rowExists(appliedApp.company)).toBeTruthy()
  })

  // ── 6. Search by company name ─────────────────────────────────────────────

  test('should search and find application by company name', async () => {
    const id = uid()
    const app = { ...fullApplication(id), company: `Tobi-Corp-${id}` }

    await page_.openAddModal()
    await modal.waitForOpen()
    await modal.fill(app)
    await modal.submit()

    await page_.search(app.company)

    expect(await page_.rowExists(app.company)).toBeTruthy()
  })

  // ── 7. Search by role ─────────────────────────────────────────────────────

  test('should search and find application by role', async () => {
    const id = uid()
    const uniqueRole = `SDET-Automation-${id}`
    const app = { ...minimalApplication(id), role: uniqueRole }

    await page_.openAddModal()
    await modal.waitForOpen()
    await modal.fill(app)
    await modal.submit()

    await page_.search(uniqueRole)

    const row = await page_.getRowByCompany(app.company)
    await expect(row).toBeVisible()
    await expect(row).toContainText(uniqueRole)
  })

  // ── 8. Delete with confirmation ───────────────────────────────────────────

  test('should delete an application after confirmation', async ({ page }) => {
    const app = minimalApplication()

    await page_.openAddModal()
    await modal.waitForOpen()
    await modal.fill(app)
    await modal.submit()

    expect(await page_.rowExists(app.company)).toBeTruthy()

    // Accept the confirm() dialog
    page.on('dialog', dialog => dialog.accept())
    await page_.clickDelete(app.company)

    // Row should be gone
    const row = await page_.getRowByCompany(app.company)
    await expect(row).not.toBeVisible()
  })

  // ── 9. Dashboard metrics update after adding ──────────────────────────────

  test('should update total metric after adding an application', async ({ page }) => {
    // Read current total
    const beforeText = await page.locator('p.text-2xl').first().textContent()
    const before = parseInt(beforeText ?? '0', 10)

    const app = minimalApplication()
    await page_.openAddModal()
    await modal.waitForOpen()
    await modal.fill(app)
    await modal.submit()

    // Total should have incremented
    const afterText = await page.locator('p.text-2xl').first().textContent()
    const after = parseInt(afterText ?? '0', 10)
    expect(after).toBe(before + 1)
  })

  // ── 10. Form validates required fields ────────────────────────────────────

  test('should not submit when required fields are empty', async ({ page }) => {
    await page_.openAddModal()
    await modal.waitForOpen()

    // Try submitting empty form via HTML5 validation
    await modal.submitButton.click()

    // Modal should still be open (browser blocked submit)
    await expect(modal.modal).toBeVisible()

    // Company field should be invalid (HTML5 required validation)
    const companyInput = page.locator('#field-company')
    const validity = await companyInput.evaluate(
      (el) => (el as HTMLInputElement).validity.valid
    )
    expect(validity).toBe(false)
  })

  // ── 11. API rejects invalid payload ──────────────────────────────────────

  test('API should return 422 for missing required fields', async ({ request }) => {
    const response = await request.post('http://localhost:8000/applications', {
      data: {
        // Missing: company, role, location, date_applied
        status: 'applied',
      },
    })
    expect(response.status()).toBe(422)

    const body = await response.json()
    expect(body).toHaveProperty('detail')
  })
})
