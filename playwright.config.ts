import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e', fullyParallel: true, forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0, workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:8787', colorScheme: 'light', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
  ],
  webServer: { command: 'npm run preview:worker', url: 'http://127.0.0.1:8787', reuseExistingServer: !process.env.CI, timeout: 120000 },
});
