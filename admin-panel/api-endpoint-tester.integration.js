#!/usr/bin/env node

/**
 * 🌐 تست کامل API Endpoints
 * بررسی همه API هاو پاسخ‌دهی آنها
 */

const http = require('http')
const https = require('https')
const { URL } = require('url')

class APIEndpointTester {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      endpoints: []
    }
    
    this.endpoints = [
      // Authentication APIs
      { method: 'POST', path: '/api/auth/login', category: 'Auth', testData: { email: 'test@test.com', password: 'password' } },
      { method: 'POST', path: '/api/auth/register', category: 'Auth', testData: { name: 'Test User', email: 'test@test.com', password: 'password' } },
      
      // Menu APIs
      { method: 'GET', path: '/api/menu', category: 'Menu' },
      { method: 'POST', path: '/api/menu', category: 'Menu', testData: { name: 'تست منو', price: 25000, category: 'test' } },
      { method: 'PUT', path: '/api/menu', category: 'Menu', testData: { id: 'test-id', name: 'تست منو بروز' } },
      { method: 'DELETE', path: '/api/menu?id=test-id', category: 'Menu' },
      
      // Order APIs  
      { method: 'GET', path: '/api/orders', category: 'Orders' },
      { method: 'POST', path: '/api/orders', category: 'Orders', testData: { customerId: 'test', items: [], total: 0 } },
      { method: 'PUT', path: '/api/orders', category: 'Orders', testData: { id: 'test-id', status: 'completed' } },
      
      // Customer APIs
      { method: 'GET', path: '/api/customers', category: 'Customers' },
      { method: 'POST', path: '/api/customers', category: 'Customers', testData: { name: 'مشتری تست', phone: '09123456789' } },
      { method: 'PUT', path: '/api/customers', category: 'Customers', testData: { id: 'test-id', name: 'مشتری بروز' } },
      
      // Tables APIs
      { method: 'GET', path: '/api/tables', category: 'Tables' },
      { method: 'POST', path: '/api/tables', category: 'Tables', testData: { number: 1, seats: 4, status: 'available' } },
      { method: 'PUT', path: '/api/tables', category: 'Tables', testData: { id: 'test-id', status: 'occupied' } },
      
      // Staff APIs
      { method: 'GET', path: '/api/staff', category: 'Staff' },
      { method: 'POST', path: '/api/staff', category: 'Staff', testData: { name: 'کارمند تست', role: 'waiter' } },
      { method: 'PUT', path: '/api/staff', category: 'Staff', testData: { id: 'test-id', role: 'manager' } },
      
      // Inventory APIs
      { method: 'GET', path: '/api/inventory', category: 'Inventory' },
      { method: 'POST', path: '/api/inventory', category: 'Inventory', testData: { name: 'ماده اولیه', quantity: 100 } },
      { method: 'PUT', path: '/api/inventory', category: 'Inventory', testData: { id: 'test-id', quantity: 150 } },
      
      // Reservation APIs
      { method: 'GET', path: '/api/reservations', category: 'Reservations' },
      { method: 'POST', path: '/api/reservations', category: 'Reservations', testData: { tableId: 'test', date: '2025-08-15', time: '19:00' } },
      
      // Analytics APIs
      { method: 'GET', path: '/api/analytics/sales', category: 'Analytics' },
      { method: 'GET', path: '/api/analytics/customers', category: 'Analytics' },
      { method: 'GET', path: '/api/analytics/orders', category: 'Analytics' }
    ]
  }

  async runAllTests() {
    console.log('🌐 شروع تست کامل API Endpoints...\n')
    console.log(`🎯 Base URL: ${this.baseUrl}`)
    console.log(`📊 تعداد کل Endpoints: ${this.endpoints.length}\n`)

    for (const endpoint of this.endpoints) {
      await this.testEndpoint(endpoint)
      this.results.total++
    }

    this.generateReport()
  }

  async testEndpoint(endpoint) {
    const startTime = Date.now()
    
    try {
      console.log(`🔄 تست ${endpoint.method} ${endpoint.path}...`)
      
      const response = await this.makeRequest(endpoint)
      const responseTime = Date.now() - startTime
      
      const result = {
        ...endpoint,
        status: response.statusCode,
        responseTime,
        success: response.statusCode < 500, // 4xx acceptable for testing, 5xx not
        error: response.statusCode >= 500 ? `HTTP ${response.statusCode}` : null,
        body: response.body ? response.body.substring(0, 200) : null
      }

      if (result.success) {
        console.log(`   ✅ ${endpoint.method} ${endpoint.path} - ${response.statusCode} (${responseTime}ms)`)
        this.results.passed++
      } else {
        console.log(`   ❌ ${endpoint.method} ${endpoint.path} - ${response.statusCode} (${responseTime}ms)`)
        this.results.failed++
      }

      this.results.endpoints.push(result)

    } catch (error) {
      console.log(`   ❌ ${endpoint.method} ${endpoint.path} - خطا: ${error.message}`)
      
      this.results.endpoints.push({
        ...endpoint,
        status: 0,
        responseTime: Date.now() - startTime,
        success: false,
        error: error.message
      })
      
      this.results.failed++
    }
  }

  makeRequest(endpoint) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint.path, this.baseUrl)
      const options = {
        method: endpoint.method,
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'A-DROP API Tester'
        },
        timeout: 10000 // 10 second timeout
      }

      const client = url.protocol === 'https:' ? https : http
      
      const req = client.request(options, (res) => {
        let body = ''
        
        res.on('data', (chunk) => {
          body += chunk
        })
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body
          })
        })
      })

      req.on('error', (error) => {
        reject(error)
      })

      req.on('timeout', () => {
        req.destroy()
        reject(new Error('Request timeout'))
      })

      // Send test data for POST/PUT requests
      if (endpoint.testData && (endpoint.method === 'POST' || endpoint.method === 'PUT')) {
        req.write(JSON.stringify(endpoint.testData))
      }

      req.end()
    })
  }

  generateReport() {
    console.log('\n' + '='.repeat(80))
    console.log('📊 گزارش تست API Endpoints')
    console.log('='.repeat(80))
    
    console.log(`\n📈 خلاصه کلی:`)
    console.log(`   ✅ موفق: ${this.results.passed}`)
    console.log(`   ❌ ناموفق: ${this.results.failed}`)
    console.log(`   📊 کل: ${this.results.total}`)
    
    const successRate = this.results.total > 0 ? (this.results.passed / this.results.total * 100).toFixed(2) : 0
    console.log(`   📈 نرخ موفقیت: ${successRate}%`)

    // گزارش بر اساس دسته‌بندی
    const categories = [...new Set(this.endpoints.map(e => e.category))]
    
    console.log(`\n📋 گزارش بر اساس دسته‌بندی:`)
    categories.forEach(category => {
      const categoryEndpoints = this.results.endpoints.filter(e => e.category === category)
      const categoryPassed = categoryEndpoints.filter(e => e.success).length
      const categoryTotal = categoryEndpoints.length
      const categoryRate = categoryTotal > 0 ? (categoryPassed / categoryTotal * 100).toFixed(1) : 0
      
      console.log(`   📁 ${category}: ${categoryPassed}/${categoryTotal} (${categoryRate}%)`)
    })

    // گزارش خطاها
    const errors = this.results.endpoints.filter(e => !e.success)
    if (errors.length > 0) {
      console.log(`\n❌ خطاهای یافت شده:`)
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.method} ${error.path} - ${error.error || `HTTP ${error.status}`}`)
      })
    }

    // گزارش Performance
    const responseTimes = this.results.endpoints
      .filter(e => e.success && e.responseTime)
      .map(e => e.responseTime)
    
    if (responseTimes.length > 0) {
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      const maxResponseTime = Math.max(...responseTimes)
      const minResponseTime = Math.min(...responseTimes)
      
      console.log(`\n⚡ آمار Performance:`)
      console.log(`   📊 میانگین پاسخ: ${avgResponseTime.toFixed(2)}ms`)
      console.log(`   ⬆️ حداکثر: ${maxResponseTime}ms`)
      console.log(`   ⬇️ حداقل: ${minResponseTime}ms`)
    }

    // توصیه‌ها
    console.log(`\n💡 توصیه‌ها:`)
    
    if (this.results.failed > 0) {
      console.log(`   🔧 ${this.results.failed} endpoint نیاز به رفع مشکل دارد`)
    }
    
    if (responseTimes.some(rt => rt > 2000)) {
      console.log(`   ⚡ برخی endpoints کند هستند (>2s)`)
    }
    
    if (this.results.passed === this.results.total) {
      console.log(`   🎉 همه API endpoints کار می‌کنند!`)
    } else {
      console.log(`   🔍 بررسی و رفع مشکلات API لازم است`)
    }

    // ذخیره گزارش JSON
    this.saveJSONReport()

    console.log(`\n📄 گزارش کامل در: api-test-report.json`)
  }

  saveJSONReport() {
    const fs = require('fs')
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: this.baseUrl,
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: this.results.total > 0 ? (this.results.passed / this.results.total * 100) : 0
      },
      endpoints: this.results.endpoints,
      categories: this.getCategoryStats(),
      performance: this.getPerformanceStats()
    }

    fs.writeFileSync('api-test-report.json', JSON.stringify(report, null, 2))
  }

  getCategoryStats() {
    const categories = [...new Set(this.endpoints.map(e => e.category))]
    return categories.map(category => {
      const categoryEndpoints = this.results.endpoints.filter(e => e.category === category)
      const passed = categoryEndpoints.filter(e => e.success).length
      const total = categoryEndpoints.length
      
      return {
        name: category,
        total,
        passed,
        failed: total - passed,
        successRate: total > 0 ? (passed / total * 100) : 0
      }
    })
  }

  getPerformanceStats() {
    const responseTimes = this.results.endpoints
      .filter(e => e.success && e.responseTime)
      .map(e => e.responseTime)
    
    if (responseTimes.length === 0) return null

    return {
      count: responseTimes.length,
      average: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      min: Math.min(...responseTimes),
      max: Math.max(...responseTimes),
      slowEndpoints: this.results.endpoints
        .filter(e => e.responseTime > 1000)
        .map(e => ({ path: e.path, method: e.method, responseTime: e.responseTime }))
    }
  }

  // تست with server check
  async checkServerStatus() {
    console.log('🔍 بررسی وضعیت سرور...')
    
    try {
      const response = await this.makeRequest({ method: 'GET', path: '/', category: 'Health' })
      
      if (response.statusCode < 500) {
        console.log(`✅ سرور در دسترس است (HTTP ${response.statusCode})`)
        return true
      } else {
        console.log(`❌ سرور مشکل دارد (HTTP ${response.statusCode})`)
        return false
      }
    } catch (error) {
      console.log(`❌ سرور در دسترس نیست: ${error.message}`)
      console.log('💡 آیا سرور روشن است؟ npm run dev')
      return false
    }
  }

  async runTestsWithHealthCheck() {
    const serverOK = await this.checkServerStatus()
    
    if (!serverOK) {
      console.log('\n⚠️  تست‌ها متوقف شد زیرا سرور در دسترس نیست')
      console.log('🛠️  لطفاً سرور را روشن کنید: npm run dev')
      return
    }

    await this.runAllTests()
  }
}

// اجرای تست
if (require.main === module) {
  const baseUrl = process.argv[2] || 'http://localhost:3000'
  const tester = new APIEndpointTester(baseUrl)
  
  tester.runTestsWithHealthCheck().catch(console.error)
}

module.exports = APIEndpointTester
