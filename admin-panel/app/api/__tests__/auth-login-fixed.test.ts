/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server'
import { POST } from '../auth/login/route'

// Mock all external dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}))

jest.mock('@/lib/rate-limiter', () => ({
  loginRateLimiter: {
    isAllowed: jest.fn().mockReturnValue(true),
    getRemainingAttempts: jest.fn().mockReturnValue(5),
    getResetTime: jest.fn().mockReturnValue(Date.now() + 300000)
  },
  getClientIdentifier: jest.fn().mockReturnValue('test-client')
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn()
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token')
}))

const { prisma } = require('@/lib/prisma')
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

  it('should return 400 for invalid email format', async () => {
    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email', password: 'password123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.message).toBe('فرمت ایمیل صحیح نیست')
  })

  it('should return 401 for non-existent user', async () => {
    prisma.user.findUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.message).toBe('کاربر یافت نشد')
  })

  it('should return 401 for incorrect password', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashedpassword'
    })
    bcrypt.compare.mockResolvedValue(false)

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.message).toBe('رمز عبور اشتباه است')
  })

  it('should return 200 and token for valid credentials', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashedpassword',
      name: 'Test User'
    })
    bcrypt.compare.mockResolvedValue(true)
    jwt.sign.mockReturnValue('mock-jwt-token')

    const request = new NextRequest('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'correctpassword' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.token).toBe('mock-jwt-token')
    expect(data.user).toBeDefined()
  })
})
