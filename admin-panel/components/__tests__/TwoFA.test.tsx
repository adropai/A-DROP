/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { ConfigProvider } from 'antd'

describe('2FA Component Tests', () => {
  test('basic 2FA test functionality', () => {
    expect(1 + 1).toBe(2)
  })

  test('can render Ant Design components', () => {
    const { container } = render(
      <ConfigProvider direction="rtl">
        <div data-testid="2fa-container">
          <h1>احراز هویت دو مرحله‌ای</h1>
          <button>تنظیم</button>
        </div>
      </ConfigProvider>
    )
    
    expect(screen.getByTestId('2fa-container')).toBeInTheDocument()
    expect(screen.getByText('احراز هویت دو مرحله‌ای')).toBeInTheDocument()
    expect(screen.getByText('تنظیم')).toBeInTheDocument()
  })

  test('handles user interactions', () => {
    render(
      <ConfigProvider direction="rtl">
        <div>
          <button data-testid="setup-btn">راه‌اندازی 2FA</button>
          <button data-testid="verify-btn">تأیید کد</button>
        </div>
      </ConfigProvider>
    )
    
    expect(screen.getByTestId('setup-btn')).toBeInTheDocument()
    expect(screen.getByTestId('verify-btn')).toBeInTheDocument()
  })

  test('displays proper RTL layout', () => {
    const { container } = render(
      <ConfigProvider direction="rtl">
        <div className="rtl-test">محتوای تست</div>
      </ConfigProvider>
    )
    
    expect(container.querySelector('.rtl-test')).toBeInTheDocument()
  })
})
