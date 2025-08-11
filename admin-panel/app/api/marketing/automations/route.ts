import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

interface AutomationRule {
  id: string
  name: string
  trigger: {
    type: 'order_placed' | 'birthday' | 'inactive_days' | 'first_order' | 'cart_abandoned'
    conditions: any
  }
  actions: {
    type: 'send_email' | 'send_sms' | 'send_push' | 'add_to_segment'
    template: string
    delay?: number
  }[]
  isActive: boolean
  stats: {
    triggered: number
    completed: number
    conversion_rate: number
  }
  createdAt: Date
  updatedAt: Date
}

// Mock database for automation rules
let automationRules: AutomationRule[] = [
  {
    id: '1',
    name: 'خوش‌آمدگویی مشتریان جدید',
    trigger: {
      type: 'first_order',
      conditions: {
        order_status: 'completed'
      }
    },
    actions: [
      {
        type: 'send_email',
        template: 'welcome_email',
        delay: 0
      },
      {
        type: 'send_sms',
        template: 'welcome_sms', 
        delay: 3600 // 1 hour later
      }
    ],
    isActive: true,
    stats: {
      triggered: 245,
      completed: 238,
      conversion_rate: 15.8
    },
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'تخفیف تولد مشتریان',
    trigger: {
      type: 'birthday',
      conditions: {
        days_before: 1
      }
    },
    actions: [
      {
        type: 'send_email',
        template: 'birthday_discount',
        delay: 0
      }
    ],
    isActive: true,
    stats: {
      triggered: 89,
      completed: 85,
      conversion_rate: 42.3
    },
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'بازگشت مشتریان غیرفعال',
    trigger: {
      type: 'inactive_days',
      conditions: {
        days: 30
      }
    },
    actions: [
      {
        type: 'send_push',
        template: 'comeback_offer',
        delay: 0
      },
      {
        type: 'send_email',
        template: 'special_offer',
        delay: 86400 // 1 day later
      }
    ],
    isActive: true,
    stats: {
      triggered: 156,
      completed: 142,
      conversion_rate: 8.9
    },
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: 'سبد خرید رها شده',
    trigger: {
      type: 'cart_abandoned',
      conditions: {
        minutes: 60
      }
    },
    actions: [
      {
        type: 'send_push',
        template: 'cart_reminder',
        delay: 0
      },
      {
        type: 'send_email',
        template: 'cart_recovery',
        delay: 3600 // 1 hour later
      }
    ],
    isActive: false,
    stats: {
      triggered: 78,
      completed: 65,
      conversion_rate: 23.1
    },
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date()
  }
]

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

// GET - دریافت قوانین اتوماسیون
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const active_only = searchParams.get('active')

    let filteredRules = automationRules

    if (active_only === 'true') {
      filteredRules = filteredRules.filter(rule => rule.isActive)
    }

    return NextResponse.json({
      success: true,
      data: filteredRules,
      stats: {
        total: automationRules.length,
        active: automationRules.filter(r => r.isActive).length,
        totalTriggered: automationRules.reduce((sum, r) => sum + r.stats.triggered, 0),
        averageConversionRate: Math.round(
          automationRules.reduce((sum, r) => sum + r.stats.conversion_rate, 0) / automationRules.length * 100
        ) / 100
      }
    })
  } catch (error) {
    console.error('خطا در دریافت قوانین اتوماسیون:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// POST - ایجاد قانون اتوماسیون جدید
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      trigger,
      actions,
      isActive
    } = body

    // اعتبارسنجی
    if (!name || !trigger || !actions || !Array.isArray(actions)) {
      return NextResponse.json({ 
        error: 'نام، تریگر و اکشن‌ها الزامی است' 
      }, { status: 400 })
    }

    // Validate trigger type
    const validTriggers = ['order_placed', 'birthday', 'inactive_days', 'first_order', 'cart_abandoned']
    if (!validTriggers.includes(trigger.type)) {
      return NextResponse.json({ 
        error: 'نوع تریگر نامعتبر است' 
      }, { status: 400 })
    }

    // Validate actions
    const validActions = ['send_email', 'send_sms', 'send_push', 'add_to_segment']
    for (const action of actions) {
      if (!validActions.includes(action.type)) {
        return NextResponse.json({ 
          error: `نوع اکشن ${action.type} نامعتبر است` 
        }, { status: 400 })
      }
    }

    const newRule: AutomationRule = {
      id: String(Date.now()),
      name,
      trigger,
      actions,
      isActive: isActive !== false,
      stats: {
        triggered: 0,
        completed: 0,
        conversion_rate: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    automationRules.push(newRule)

    return NextResponse.json({
      success: true,
      message: 'قانون اتوماسیون با موفقیت ایجاد شد',
      data: newRule
    })
  } catch (error) {
    console.error('خطا در ایجاد قانون اتوماسیون:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// PUT - ویرایش قانون اتوماسیون
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ 
        error: 'شناسه قانون الزامی است' 
      }, { status: 400 })
    }

    const ruleIndex = automationRules.findIndex(rule => rule.id === id)
    if (ruleIndex === -1) {
      return NextResponse.json({ error: 'قانون یافت نشد' }, { status: 404 })
    }

    // ویرایش قانون
    automationRules[ruleIndex] = {
      ...automationRules[ruleIndex],
      ...updates,
      updatedAt: new Date()
    }

    return NextResponse.json({
      success: true,
      message: 'قانون اتوماسیون با موفقیت ویرایش شد',
      data: automationRules[ruleIndex]
    })
  } catch (error) {
    console.error('خطا در ویرایش قانون:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// DELETE - حذف قانون اتوماسیون
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ 
        error: 'شناسه قانون الزامی است' 
      }, { status: 400 })
    }

    const ruleIndex = automationRules.findIndex(rule => rule.id === id)
    if (ruleIndex === -1) {
      return NextResponse.json({ error: 'قانون یافت نشد' }, { status: 404 })
    }

    // حذف قانون
    automationRules.splice(ruleIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'قانون اتوماسیون با موفقیت حذف شد'
    })
  } catch (error) {
    console.error('خطا در حذف قانون:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}

// PATCH - تغییر وضعیت قانون
export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غیر مجاز' }, { status: 401 })
    }

    const body = await request.json()
    const { id, action } = body

    if (!id || !action) {
      return NextResponse.json({ 
        error: 'شناسه و نوع عملیات الزامی است' 
      }, { status: 400 })
    }

    const ruleIndex = automationRules.findIndex(rule => rule.id === id)
    if (ruleIndex === -1) {
      return NextResponse.json({ error: 'قانون یافت نشد' }, { status: 404 })
    }

    switch (action) {
      case 'toggle_active':
        automationRules[ruleIndex].isActive = !automationRules[ruleIndex].isActive
        break
      case 'reset_stats':
        automationRules[ruleIndex].stats = {
          triggered: 0,
          completed: 0,
          conversion_rate: 0
        }
        break
      default:
        return NextResponse.json({ error: 'عملیات نامعتبر' }, { status: 400 })
    }

    automationRules[ruleIndex].updatedAt = new Date()

    return NextResponse.json({
      success: true,
      message: 'قانون اتوماسیون به‌روزرسانی شد',
      data: automationRules[ruleIndex]
    })
  } catch (error) {
    console.error('خطا در به‌روزرسانی قانون:', error)
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 })
  }
}
