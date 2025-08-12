import { NextRequest, NextResponse } from 'next/server';

// Department configuration interface
interface DepartmentConfig {
  id: string;
  name: string;
  nameEn?: string;
  icon: string;
  color: string;
  enabled: boolean;
  workingHours: {
    start: string;
    end: string;
  };
  maxConcurrentTickets: number;
  defaultPreparationTime: number;
  description?: string;
  order: number;
}

// Default department configurations
const DEFAULT_DEPARTMENTS: DepartmentConfig[] = [
  {
    id: 'KITCHEN',
    name: 'آشپزخانه اصلی',
    nameEn: 'Main Kitchen',
    icon: '🍳',
    color: '#ff6b35',
    enabled: true,
    workingHours: { start: '06:00', end: '23:00' },
    maxConcurrentTickets: 20,
    defaultPreparationTime: 15,
    description: 'آماده‌سازی غذاهای اصلی و پیش‌غذا',
    order: 1
  },
  {
    id: 'GRILL',
    name: 'کباب‌پزی',
    nameEn: 'Grill Station',
    icon: '🔥',
    color: '#dc143c',
    enabled: true,
    workingHours: { start: '11:00', end: '23:00' },
    maxConcurrentTickets: 15,
    defaultPreparationTime: 20,
    description: 'کباب‌ها و غذاهای کبابی',
    order: 2
  },
  {
    id: 'COFFEE_SHOP',
    name: 'کافی شاپ',
    nameEn: 'Coffee Shop',
    icon: '☕',
    color: '#8b4513',
    enabled: true,
    workingHours: { start: '07:00', end: '22:00' },
    maxConcurrentTickets: 10,
    defaultPreparationTime: 5,
    description: 'نوشیدنی‌های گرم و سرد',
    order: 3
  },
  {
    id: 'DESSERT',
    name: 'شیرینی‌پزی',
    nameEn: 'Dessert Station',
    icon: '🍰',
    color: '#ff69b4',
    enabled: true,
    workingHours: { start: '10:00', end: '23:00' },
    maxConcurrentTickets: 8,
    defaultPreparationTime: 10,
    description: 'دسرها و شیرینی‌ها',
    order: 4
  },
  {
    id: 'SALAD_BAR',
    name: 'سالاد بار',
    nameEn: 'Salad Bar',
    icon: '🥗',
    color: '#32cd32',
    enabled: true,
    workingHours: { start: '10:00', end: '22:00' },
    maxConcurrentTickets: 12,
    defaultPreparationTime: 8,
    description: 'سالادها و پیش‌غذاهای سبز',
    order: 5
  },
  {
    id: 'HOOKAH',
    name: 'قلیون‌سرا',
    nameEn: 'Hookah Lounge',
    icon: '🌪️',
    color: '#9370db',
    enabled: false,
    workingHours: { start: '18:00', end: '02:00' },
    maxConcurrentTickets: 5,
    defaultPreparationTime: 10,
    description: 'آماده‌سازی و سرویس قلیون',
    order: 6
  },
  {
    id: 'BAKERY',
    name: 'نانوایی',
    nameEn: 'Bakery',
    icon: '🥖',
    color: '#daa520',
    enabled: false,
    workingHours: { start: '05:00', end: '20:00' },
    maxConcurrentTickets: 6,
    defaultPreparationTime: 25,
    description: 'نان‌ها و محصولات پخت',
    order: 7
  }
];

export async function GET(request: NextRequest) {
  try {
    console.log('🏪 Department Config GET API called');

    // In a real app, this would come from database
    // For now, return the default configurations
    const enabledDepartments = DEFAULT_DEPARTMENTS.filter(dept => dept.enabled);
    const allDepartments = DEFAULT_DEPARTMENTS;

    const { searchParams } = new URL(request.url);
    const includeDisabled = searchParams.get('includeDisabled') === 'true';

    const departments = includeDisabled ? allDepartments : enabledDepartments;

    console.log(`✅ Found ${departments.length} departments`);
    return NextResponse.json({
      success: true,
      data: departments.sort((a, b) => a.order - b.order)
    });

  } catch (error) {
    console.error('❌ Department Config GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch department configurations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 Department Config PUT API called');
    
    const body = await request.json();
    console.log('📝 Update departments data:', body);

    // In a real app, this would update the database
    // For now, we'll just return success
    // You would validate and save the configuration here

    return NextResponse.json({
      success: true,
      data: body,
      message: 'Department configurations updated successfully'
    });

  } catch (error) {
    console.error('❌ Department Config PUT error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update department configurations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
