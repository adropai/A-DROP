import { NextRequest, NextResponse } from 'next/server';
import { Department } from '@/types/kitchen';

// GET - دریافت لیست بخش‌های آشپزخانه
export async function GET(request: NextRequest) {
  try {
    console.log('🏪 Kitchen Departments GET API called');

    const departments = [
      {
        id: 'KITCHEN',
        name: 'آشپزخانه',
        nameEn: 'Kitchen',
        description: 'غذاهای گرم و اصلی',
        color: '#ff6b35',
        icon: '🍳',
        enabled: true
      },
      {
        id: 'COFFEE_SHOP',
        name: 'کافی شاپ',
        nameEn: 'Coffee Shop',
        description: 'نوشیدنی‌های گرم و سرد',
        color: '#8b4513',
        icon: '☕',
        enabled: true
      },
      {
        id: 'GRILL',
        name: 'کباب‌پزی',
        nameEn: 'Grill',
        description: 'کباب و غذاهای کبابی',
        color: '#dc143c',
        icon: '🔥',
        enabled: true
      },
      {
        id: 'DESSERT',
        name: 'شیرینی‌پزی',
        nameEn: 'Dessert',
        description: 'دسرها و شیرینی‌ها',
        color: '#ff69b4',
        icon: '🍰',
        enabled: true
      },
      {
        id: 'HOOKAH',
        name: 'قلیون‌سرا',
        nameEn: 'Hookah',
        description: 'قلیون و تنباکو',
        color: '#9370db',
        icon: '🌪️',
        enabled: true
      },
      {
        id: 'BAR',
        name: 'بار',
        nameEn: 'Bar',
        description: 'نوشیدنی‌های الکلی',
        color: '#4169e1',
        icon: '🍺',
        enabled: false // غیرفعال در ایران
      },
      {
        id: 'BAKERY',
        name: 'نانوایی',
        nameEn: 'Bakery',
        description: 'نان و محصولات نانوایی',
        color: '#daa520',
        icon: '🥖',
        enabled: true
      },
      {
        id: 'SALAD_BAR',
        name: 'سالاد بار',
        nameEn: 'Salad Bar',
        description: 'سالادها و غذاهای سرد',
        color: '#32cd32',
        icon: '🥗',
        enabled: true
      }
    ];

    // فیلتر بخش‌های فعال
    const enabledDepartments = departments.filter(dept => dept.enabled);

    console.log(`🏪 Found ${enabledDepartments.length} enabled departments`);

    return NextResponse.json({
      success: true,
      data: enabledDepartments
    });

  } catch (error) {
    console.error('❌ Kitchen Departments GET error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت بخش‌های آشپزخانه',
      data: []
    }, { status: 500 });
  }
}
