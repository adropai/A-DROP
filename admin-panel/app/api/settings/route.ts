import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// تنظیمات پیش‌فرض سیستم
const DEFAULT_SETTINGS = {
  general: {
    restaurantName: 'رستوران A-DROP',
    currency: 'IRR',
    timezone: 'Asia/Tehran',
    dateFormat: 'persian',
    language: 'fa',
    autoBackup: true,
    maintenanceMode: false,
    workingHours: {
      open: '08:00',
      close: '23:00',
      daysOff: []
    }
  },
  financial: {
    taxRate: 9,
    serviceCharge: 10,
    defaultPaymentMethods: ['cash', 'card', 'online'],
    currencySymbol: '﷼',
    decimalPlaces: 0
  },
  notification: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderConfirmation: true,
    lowStockAlert: true,
    systemAlerts: true,
    marketingEmails: false
  },
  security: {
    passwordMinLength: 8,
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    twoFactorAuth: false,
    requirePasswordChange: false,
    logRetentionDays: 90
  },
  integrations: {
    paymentGateways: {
      zarinpal: { enabled: false, merchantId: '' },
      parsian: { enabled: false, pin: '' },
      pasargad: { enabled: false, terminalId: '' }
    },
    deliveryServices: {
      tapsi: { enabled: false, apiKey: '' },
      snapp: { enabled: false, apiKey: '' }
    },
    analytics: {
      googleAnalytics: { enabled: false, trackingId: '' },
      facebook: { enabled: false, pixelId: '' }
    }
  }
};

// GET /api/settings - دریافت تنظیمات
export async function GET(request: NextRequest) {
  try {
    console.log('⚙️ Settings GET API called');
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category'); // general, financial, notification, security, integrations

    // اگر دسته خاصی درخواست شده
    if (category && DEFAULT_SETTINGS[category as keyof typeof DEFAULT_SETTINGS]) {
      return NextResponse.json({
        success: true,
        category,
        settings: DEFAULT_SETTINGS[category as keyof typeof DEFAULT_SETTINGS]
      });
    }

    // بازگشت تمام تنظیمات
    return NextResponse.json({
      success: true,
      settings: DEFAULT_SETTINGS
    });

  } catch (error) {
    console.error('❌ Settings GET Error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در دریافت تنظیمات'
    }, { status: 500 });
  }
}

// POST /api/settings - بروزرسانی تنظیمات
export async function POST(request: NextRequest) {
  try {
    console.log('⚙️ Settings POST API called');
    
    const body = await request.json();
    const { category, settings } = body;

    if (!category || !settings) {
      return NextResponse.json({
        success: false,
        error: 'دسته و تنظیمات الزامی است'
      }, { status: 400 });
    }

    // اعتبارسنجی دسته
    if (!DEFAULT_SETTINGS[category as keyof typeof DEFAULT_SETTINGS]) {
      return NextResponse.json({
        success: false,
        error: 'دسته تنظیمات نامعتبر است'
      }, { status: 400 });
    }

    // بروزرسانی تنظیمات (در حال حاضر فقط در حافظه)
    // در آینده می‌توان در دیتابیس ذخیره کرد
    Object.assign(DEFAULT_SETTINGS[category as keyof typeof DEFAULT_SETTINGS], settings);

    console.log(`✅ Settings updated for category: ${category}`, settings);

    return NextResponse.json({
      success: true,
      message: 'تنظیمات با موفقیت بروزرسانی شد',
      category,
      settings: DEFAULT_SETTINGS[category as keyof typeof DEFAULT_SETTINGS]
    });

  } catch (error) {
    console.error('❌ Settings POST Error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در بروزرسانی تنظیمات'
    }, { status: 500 });
  }
}

// PUT /api/settings - تنظیم کامل سیستم
export async function PUT(request: NextRequest) {
  try {
    console.log('⚙️ Settings PUT API called');
    
    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json({
        success: false,
        error: 'تنظیمات الزامی است'
      }, { status: 400 });
    }

    // بروزرسانی کامل تنظیمات
    Object.keys(settings).forEach(category => {
      if (DEFAULT_SETTINGS[category as keyof typeof DEFAULT_SETTINGS]) {
        Object.assign(DEFAULT_SETTINGS[category as keyof typeof DEFAULT_SETTINGS], settings[category]);
      }
    });

    console.log('✅ All settings updated', settings);

    return NextResponse.json({
      success: true,
      message: 'تمام تنظیمات با موفقیت بروزرسانی شد',
      settings: DEFAULT_SETTINGS
    });

  } catch (error) {
    console.error('❌ Settings PUT Error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در بروزرسانی کامل تنظیمات'
    }, { status: 500 });
  }
}

// PATCH /api/settings - بروزرسانی جزئی تنظیمات
export async function PATCH(request: NextRequest) {
  try {
    console.log('⚙️ Settings PATCH API called');
    
    const body = await request.json();
    const { key, value, category } = body;

    if (!key || value === undefined) {
      return NextResponse.json({
        success: false,
        error: 'کلید و مقدار الزامی است'
      }, { status: 400 });
    }

    if (category && DEFAULT_SETTINGS[category as keyof typeof DEFAULT_SETTINGS]) {
      // بروزرسانی یک تنظیم خاص در دسته مشخص
      (DEFAULT_SETTINGS[category as keyof typeof DEFAULT_SETTINGS] as any)[key] = value;
      
      return NextResponse.json({
        success: true,
        message: 'تنظیم با موفقیت بروزرسانی شد',
        category,
        key,
        value,
        settings: DEFAULT_SETTINGS[category as keyof typeof DEFAULT_SETTINGS]
      });
    }

    return NextResponse.json({
      success: false,
      error: 'دسته تنظیمات نامعتبر است'
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Settings PATCH Error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در بروزرسانی تنظیم'
    }, { status: 500 });
  }
}
