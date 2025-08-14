/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { POST } from '../auth/login/route'

// Mock external dependencies
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}))

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 400 for missing credentials', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toBe('ایمیل و رمز عبور الزامی است')
  })

  it('should return 400 for invalid input format', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: '', password: '' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toBe('ایمیل و رمز عبور الزامی است')
  })

  it('should return 401 for non-existent user', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'nonexistent@example.com',
        password: 'password123'
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.message).toBe('نام کاربری یا رمز عبور اشتباه است')
  })

  it('should return 401 for incorrect password', async () => {
    // Mock bcrypt to return false (password doesn't match)
    bcrypt.compare.mockResolvedValue(false)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin@admin.com',
        password: 'wrongpassword'
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.message).toBe('نام کاربری یا رمز عبور اشتباه است')
  })

  it('should return 200 and token for valid credentials', async () => {
    // Mock bcrypt to return true (password matches)
    bcrypt.compare.mockResolvedValue(true)
    
    // Mock JWT to return a token
    jwt.sign.mockReturnValue('mock-jwt-token')

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin@admin.com',
        password: 'admin123'
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.token).toBe('mock-jwt-token')
    expect(data.user).toBeDefined()
    expect(data.user.username).toBe('admin@admin.com')
  })

  it('should handle server errors gracefully', async () => {
    // Mock bcrypt to throw an error
    bcrypt.compare.mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin@admin.com',
        password: 'admin123'
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.message).toBe('خطای سرور')
  })

  it('should validate email format when username is email', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'invalid-email',
        password: 'password123'
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.message).toBe('نام کاربری یا رمز عبور اشتباه است')
  })

  it('should set secure cookie headers in production', async () => {
    const originalEnv = process.env.NODE_ENV
    
    // Mock process.env properly
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      configurable: true
    })

    bcrypt.compare.mockResolvedValue(true)
    jwt.sign.mockReturnValue('mock-jwt-token')

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: 'admin@admin.com',
        password: 'admin123'
      }),
    })

    const response = await POST(request)
    
    expect(response.status).toBe(200)
    
    // Check if secure headers are set
    const cookies = response.headers.get('set-cookie')
    if (cookies) {
      expect(cookies).toContain('HttpOnly')
      expect(cookies).toContain('Secure')
    }

    // Restore original value
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      configurable: true
    })
  })
})
