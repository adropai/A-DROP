import { NextRequest, NextResponse } from 'next/server'
// import { prisma } from '@/lib/prisma' // موقتاً غیرفعال

// In-memory storage (موقتاً تا زمان اتصال به دیتابیس)
let deliveries: any[] = [
  {
    id: '1',
    orderId: '1',
    customerId: '1',
    courierId: '1',
    type: 'DELIVERY',
    status: 'IN_TRANSIT',
    pickupAddress: {
      id: '1',
      street: 'خیابان ولیعصر، نرسیده به میدان ونک',
      city: 'تهران',
      state: 'تهران',
      postalCode: '1234567890',
      country: 'ایران'
    },
    deliveryAddress: {
      id: '2',
      street: 'خیابان آزادی، کوچه شهیدان',
      city: 'تهران',
      state: 'تهران',
      postalCode: '0987654321',
      country: 'ایران'
    },
    distance: 8.5,
    estimatedTime: 25,
    deliveryFee: 25000,
    totalAmount: 250000,
    priority: 2,
    trackingCode: 'ADR-001',
    customer: {
      id: '1',
      name: 'احمد محمدی',
      phone: '09121234567'
    },
    courier: {
      id: '1',
      name: 'علی احمدی',
      phone: '09123456789',
      vehicleType: 'MOTORCYCLE',
      status: 'BUSY'
    },
    order: {
      id: '1',
      totalAmount: 225000,
      items: [
        { name: 'چلو کباب کوبیده', quantity: 2, price: 120000 },
        { name: 'نوشابه', quantity: 2, price: 30000 }
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    orderId: '2',
    customerId: '2',
    courierId: '2',
    type: 'DELIVERY',
    status: 'PENDING',
    pickupAddress: {
      id: '1',
      street: 'خیابان ولیعصر، نرسیده به میدان ونک',
      city: 'تهران',
      state: 'تهران',
      postalCode: '1234567890',
      country: 'ایران'
    },
    deliveryAddress: {
      id: '3',
      street: 'خیابان انقلاب، نزدیک دانشگاه تهران',
      city: 'تهران',
      state: 'تهران',
      postalCode: '1122334455',
      country: 'ایران'
    },
    distance: 12.3,
    estimatedTime: 35,
    deliveryFee: 35000,
    totalAmount: 180000,
    priority: 1,
    trackingCode: 'ADR-002',
    customer: {
      id: '2',
      name: 'فاطمه حسینی',
      phone: '09123456789'
    },
    order: {
      id: '2',
      totalAmount: 145000,
      items: [
        { name: 'پیتزا مخصوص', quantity: 1, price: 145000 }
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// GET /api/delivery - دریافت لیست تحویلات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const courierId = searchParams.get('courierId')
    const customerId = searchParams.get('customerId')

    // Apply filters
    let filteredDeliveries = deliveries
    if (status) {
      filteredDeliveries = filteredDeliveries.filter(d => d.status === status)
    }
    if (courierId) {
      filteredDeliveries = filteredDeliveries.filter(d => d.courierId === courierId)
    }
    if (customerId) {
      filteredDeliveries = filteredDeliveries.filter(d => d.customerId === customerId)
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedDeliveries = filteredDeliveries.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedDeliveries,
      pagination: {
        total: filteredDeliveries.length,
        page,
        limit,
        pages: Math.ceil(filteredDeliveries.length / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching deliveries:', error)
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت تحویلات' },
      { status: 500 }
    )
  }
}

// POST /api/delivery - ایجاد تحویل جدید
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      orderId, 
      customerId, 
      type, 
      deliveryAddress,
      scheduledAt,
      instructions,
      priority = 1,
      deliveryFee
    } = body

    // Validation
    if (!orderId || !customerId || !type || !deliveryFee) {
      return NextResponse.json(
        { success: false, error: 'فیلدهای ضروری کامل نیست' },
        { status: 400 }
      )
    }

    const newDelivery = {
      id: (deliveries.length + 1).toString(),
      orderId,
      customerId,
      type,
      status: 'PENDING',
      pickupAddress: {
        id: '1',
        street: 'آدرس رستوران A-DROP',
        city: 'تهران',
        state: 'تهران',
        postalCode: '1234567890',
        country: 'ایران'
      },
      deliveryAddress,
      deliveryFee,
      totalAmount: deliveryFee,
      priority,
      trackingCode: `ADR-${String(deliveries.length + 1).padStart(3, '0')}`,
      instructions,
      scheduledAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    deliveries.push(newDelivery)

    return NextResponse.json({
      success: true,
      message: 'تحویل با موفقیت ایجاد شد',
      data: newDelivery
    })
  } catch (error) {
    console.error('Error creating delivery:', error)
    return NextResponse.json(
      { success: false, error: 'خطا در ایجاد تحویل' },
      { status: 500 }
    )
  }
}
