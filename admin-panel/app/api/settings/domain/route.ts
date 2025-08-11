import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

interface DomainSettings {
  id: string
  primaryDomain: string
  subdomain: string
  sslEnabled: boolean
  customDNS: string[]
  redirectOldDomain: boolean
  status: 'pending' | 'active' | 'error'
  sslStatus: 'pending' | 'active' | 'error'
  lastChecked: Date
  createdAt: Date
  updatedAt: Date
}

// Mock database for domain settings
let domainSettings: DomainSettings = {
  id: '1',
  primaryDomain: '',
  subdomain: 'order',
  sslEnabled: true,
  customDNS: [],
  redirectOldDomain: false,
  status: 'pending',
  sslStatus: 'pending',
  lastChecked: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
}

// Verify JWT token
async function verifyToken(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    return decoded
  } catch (error) {
    return null
  }
}

// Validate domain format
function isValidDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/
  return domainRegex.test(domain)
}

// Check domain status (mock function)
async function checkDomainStatus(domain: string): Promise<'active' | 'pending' | 'error'> {
  // In real implementation, this would check DNS records and domain status
  try {
    // Simulate domain check
    await new Promise(resolve => setTimeout(resolve, 1000))
    return Math.random() > 0.3 ? 'active' : 'pending'
  } catch {
    return 'error'
  }
}

// Check SSL status (mock function)
async function checkSSLStatus(domain: string): Promise<'active' | 'pending' | 'error'> {
  // In real implementation, this would check SSL certificate status
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
    return Math.random() > 0.2 ? 'active' : 'pending'
  } catch {
    return 'error'
  }
}

// GET - دریافت تنظیمات دامنه
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const public_access = searchParams.get('public')
    const check_status = searchParams.get('check_status')

    // For public access (customer app)
    if (public_access === 'true') {
      const publicData = {
        primaryDomain: domainSettings.primaryDomain,
        subdomain: domainSettings.subdomain,
        sslEnabled: domainSettings.sslEnabled,
        status: domainSettings.status
      }
      
      return NextResponse.json({
        success: true,
        data: publicData
      })
    }

    // For admin access
    const user = await verifyToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    // Check domain and SSL status if requested
    if (check_status === 'true' && domainSettings.primaryDomain) {
      const domainStatus = await checkDomainStatus(domainSettings.primaryDomain)
      const sslStatus = domainSettings.sslEnabled 
        ? await checkSSLStatus(domainSettings.primaryDomain)
        : 'pending'

      domainSettings = {
        ...domainSettings,
        status: domainStatus,
        sslStatus: sslStatus,
        lastChecked: new Date(),
        updatedAt: new Date()
      }
    }

    return NextResponse.json({
      success: true,
      data: domainSettings,
      instructions: {
        dns_records: [
          {
            type: 'A',
            name: '@',
            value: 'YOUR_SERVER_IP',
            ttl: 3600
          },
          {
            type: 'CNAME',
            name: domainSettings.subdomain || 'order',
            value: domainSettings.primaryDomain || 'your-domain.com',
            ttl: 3600
          },
          {
            type: 'TXT',
            name: '_acme-challenge',
            value: 'SSL_VERIFICATION_TOKEN',
            ttl: 300
          }
        ]
      }
    })
  } catch (error) {
    console.error('خطا در دریافت تنظیمات دامنه:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// POST - ذخیره تنظیمات دامنه
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    const {
      primaryDomain,
      subdomain,
      sslEnabled,
      customDNS,
      redirectOldDomain
    } = body

    // اعتبارسنجی
    if (!primaryDomain) {
      return NextResponse.json({ 
        error: 'دامنه اصلی الزامی است' 
      }, { status: 400 })
    }

    if (!isValidDomain(primaryDomain)) {
      return NextResponse.json({ 
        error: 'فرمت دامنه صحیح نیست' 
      }, { status: 400 })
    }

    // Validate subdomain
    if (subdomain && !/^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/.test(subdomain)) {
      return NextResponse.json({ 
        error: 'فرمت ساب‌دامنه صحیح نیست' 
      }, { status: 400 })
    }

    // Parse custom DNS records
    let parsedDNS: string[] = []
    if (customDNS) {
      if (typeof customDNS === 'string') {
        parsedDNS = customDNS.split('\n').filter(line => line.trim())
      } else if (Array.isArray(customDNS)) {
        parsedDNS = customDNS.filter(record => typeof record === 'string')
      }
    }

    // Check if domain is different from current
    const domainChanged = domainSettings.primaryDomain !== primaryDomain
    
    // Update domain settings
    domainSettings = {
      ...domainSettings,
      primaryDomain,
      subdomain: subdomain || 'order',
      sslEnabled: Boolean(sslEnabled),
      customDNS: parsedDNS,
      redirectOldDomain: Boolean(redirectOldDomain),
      status: domainChanged ? 'pending' : domainSettings.status,
      sslStatus: domainChanged || sslEnabled !== domainSettings.sslEnabled ? 'pending' : domainSettings.sslStatus,
      updatedAt: new Date()
    }

    // If domain changed, start verification process
    if (domainChanged) {
      // In real implementation, this would:
      // 1. Add domain to server configuration
      // 2. Start SSL certificate generation
      // 3. Update DNS records
      // 4. Schedule domain verification
      
      setTimeout(async () => {
        // Simulate domain verification process
        const status = await checkDomainStatus(primaryDomain)
        const sslStatus = sslEnabled ? await checkSSLStatus(primaryDomain) : 'pending'
        
        domainSettings.status = status
        domainSettings.sslStatus = sslStatus
        domainSettings.lastChecked = new Date()
      }, 5000)
    }

    return NextResponse.json({
      success: true,
      message: domainChanged 
        ? 'تنظیمات دامنه ذخیره شد. فرآیند راستی‌آزمایی آغاز شده است.' 
        : 'تنظیمات دامنه به‌روزرسانی شد',
      data: domainSettings,
      nextSteps: domainChanged ? [
        'DNS رکوردهای ارائه شده را در پنل دامنه خود تنظیم کنید',
        'منتظر تایید دامنه باشید (معمولاً 5-15 دقیقه)',
        'پس از تایید، گواهی SSL به طور خودکار صادر می‌شود'
      ] : []
    })
  } catch (error) {
    console.error('خطا در ذخیره تنظیمات دامنه:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// PUT - ویرایش تنظیمات دامنه
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    
    // Partial update
    domainSettings = {
      ...domainSettings,
      ...body,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      message: 'تنظیمات دامنه به‌روزرسانی شد',
      data: domainSettings
    })
  } catch (error) {
    console.error('خطا در ویرایش تنظیمات دامنه:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// DELETE - حذف تنظیمات دامنه
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    // Reset to default values
    domainSettings = {
      id: '1',
      primaryDomain: '',
      subdomain: 'order',
      sslEnabled: true,
      customDNS: [],
      redirectOldDomain: false,
      status: 'pending',
      sslStatus: 'pending',
      lastChecked: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      message: 'تنظیمات دامنه حذف شد',
      data: domainSettings
    })
  } catch (error) {
    console.error('خطا در حذف تنظیمات دامنه:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// PATCH - عملیات‌های ویژه
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'verify_domain':
        if (!domainSettings.primaryDomain) {
          return NextResponse.json({ error: 'دامنه تنظیم نشده است' }, { status: 400 })
        }
        
        const domainStatus = await checkDomainStatus(domainSettings.primaryDomain)
        domainSettings.status = domainStatus
        domainSettings.lastChecked = new Date()
        
        return NextResponse.json({
          success: true,
          message: 'وضعیت دامنه بررسی شد',
          data: { status: domainStatus }
        })

      case 'renew_ssl':
        if (!domainSettings.primaryDomain || !domainSettings.sslEnabled) {
          return NextResponse.json({ error: 'SSL فعال نیست' }, { status: 400 })
        }
        
        domainSettings.sslStatus = 'pending'
        // Simulate SSL renewal
        setTimeout(async () => {
          const sslStatus = await checkSSLStatus(domainSettings.primaryDomain)
          domainSettings.sslStatus = sslStatus
        }, 3000)
        
        return NextResponse.json({
          success: true,
          message: 'فرآیند تجدید SSL آغاز شد',
          data: { sslStatus: 'pending' }
        })

      case 'test_configuration':
        const testResults = {
          domain_reachable: domainSettings.status === 'active',
          ssl_valid: domainSettings.sslStatus === 'active',
          dns_configured: domainSettings.customDNS.length > 0,
          subdomain_working: Boolean(domainSettings.subdomain)
        }
        
        return NextResponse.json({
          success: true,
          message: 'تست پیکربندی انجام شد',
          data: testResults
        })

      default:
        return NextResponse.json({ error: 'عملیات نامعتبر' }, { status: 400 })
    }
  } catch (error) {
    console.error('خطا در عملیات دامنه:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
