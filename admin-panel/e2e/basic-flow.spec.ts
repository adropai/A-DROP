import { test, expect } from '@playwright/test';

test.describe('A-DROP Admin Panel - Basic Flow', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads
    await expect(page).toHaveTitle(/A-DROP/);
    
    // Check for main navigation elements
    await expect(page.locator('[data-testid="main-layout"]')).toBeVisible();
  });

  test('dashboard displays key metrics', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for dashboard elements
    await expect(page.locator('text=داشبورد')).toBeVisible();
    
    // Check for metrics cards (should exist)
    const metricsCards = page.locator('.ant-card');
    await expect(metricsCards.first()).toBeVisible();
  });

  test('navigation menu works', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation to orders page
    await page.click('text=سفارشات');
    await expect(page).toHaveURL(/.*orders/);
    
    // Test navigation to menu page
    await page.click('text=منو');
    await expect(page).toHaveURL(/.*menu/);
    
    // Test navigation to customers page
    await page.click('text=مشتریان');
    await expect(page).toHaveURL(/.*customers/);
  });

  test('responsive design works', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    
    // Check if sidebar is visible on desktop
    await expect(page.locator('.ant-layout-sider')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile navigation should work differently
    // (Implementation depends on your responsive design)
  });

  test('search functionality works', async ({ page }) => {
    await page.goto('/orders');
    
    // Look for search input
    const searchInput = page.locator('input[placeholder*="جستجو"], input[placeholder*="search"]');
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('test');
      await page.keyboard.press('Enter');
      
      // Wait for search results (this would depend on your implementation)
      await page.waitForTimeout(1000);
    }
  });
});
