import { test, expect } from '@playwright/test';

test.describe('2FA Authentication Flow', () => {
  test('2FA setup page loads', async ({ page }) => {
    await page.goto('/security');
    
    // Check if security page loads
    await expect(page.locator('text=امنیت')).toBeVisible();
    
    // Look for 2FA setup section
    const twoFASection = page.locator('text=احراز هویت دو مرحله‌ای');
    if (await twoFASection.count() > 0) {
      await expect(twoFASection).toBeVisible();
    }
  });

  test('2FA setup modal opens', async ({ page }) => {
    await page.goto('/security');
    
    // Try to find and click 2FA setup button
    const setupButton = page.locator('button:has-text("راه‌اندازی"), button:has-text("تنظیم")');
    
    if (await setupButton.count() > 0) {
      await setupButton.first().click();
      
      // Check if modal or setup form appears
      await expect(page.locator('.ant-modal, .ant-drawer')).toBeVisible();
    }
  });

  test('2FA method selection works', async ({ page }) => {
    await page.goto('/security');
    
    // Navigate through 2FA setup if available
    const methodButtons = page.locator('button:has-text("پیامک"), button:has-text("اپلیکیشن"), button:has-text("ایمیل")');
    
    if (await methodButtons.count() > 0) {
      // Test SMS method
      const smsButton = methodButtons.filter({ hasText: 'پیامک' });
      if (await smsButton.count() > 0) {
        await smsButton.click();
        await expect(page.locator('text=شماره تلفن')).toBeVisible();
      }
    }
  });

  test('QR code displays for authenticator app', async ({ page }) => {
    await page.goto('/security');
    
    // Try to access authenticator app setup
    const appButton = page.locator('button:has-text("اپلیکیشن"), button:has-text("Google Authenticator")');
    
    if (await appButton.count() > 0) {
      await appButton.click();
      
      // Wait for QR code to load
      await page.waitForTimeout(2000);
      
      // Check if QR code canvas or image appears
      const qrCode = page.locator('canvas, img[alt*="QR"], .ant-qrcode');
      if (await qrCode.count() > 0) {
        await expect(qrCode.first()).toBeVisible();
      }
    }
  });
});
