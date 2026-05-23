// tests/fixtures/test-data.ts
// Each test uses a unique suffix so runs don't collide in the shared SQLite DB.

export function uid(): string {
  return Date.now().toString(36).toUpperCase()
}

export interface TestApplication {
  company: string
  role: string
  location: string
  status?: string
  dateApplied?: string
  salaryMin?: string
  salaryMax?: string
  url?: string
  notes?: string
}

export function fullApplication(id = uid()): TestApplication {
  return {
    company: `Shopify-${id}`,
    role: `Full Stack Developer`,
    location: `Ottawa, ON`,
    status: 'screening',
    dateApplied: '2026-05-01',
    salaryMin: '90000',
    salaryMax: '120000',
    url: 'https://shopify.com/careers',
    notes: `Test note ${id}`,
  }
}

export function minimalApplication(id = uid()): TestApplication {
  return {
    company: `Wealthsimple-${id}`,
    role: `QA Automation Engineer`,
    location: `Remote`,
    dateApplied: '2026-05-10',
  }
}
