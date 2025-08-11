import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import { InventoryStatus } from '@prisma/client'; // Commented out for now

// GET - دریافت تمام حرکات انبار
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const itemId = searchParams.get('itemId') || '';
    const type = searchParams.get('type') || '';
    const user = searchParams.get('user') || '';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const skip = (page - 1) * limit;

    // ساخت شرایط جستجو
    const where: any = {};

    if (itemId && itemId !== 'all') {
      where.itemId = itemId;
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    if (user && user !== 'all') {
      where.user = { contains: user, mode: 'insensitive' };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        include: {
          item: {
            select: {
              id: true,
              name: true,
              sku: true,
              unit: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockMovement.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: movements,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching stock movements:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در دریافت حرکات انبار',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - ایجاد حرکت جدید انبار
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      itemId,
      type,
      quantity,
      unitPrice,
      reason,
      reference,
      batchNumber,
      expiryDate,
      supplier,
      notes,
      user = 'System'
    } = body;

    if (!itemId || !type || !quantity) {
      return NextResponse.json(
        { success: false, error: 'فیلدهای الزامی را پر کنید' },
        { status: 400 }
      );
    }

    // دریافت آیتم فعلی
    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'آیتم انبار یافت نشد' },
        { status: 404 }
      );
    }

    const previousStock = item.currentStock;
    let newStock = previousStock;

    // محاسبه موجودی جدید بر اساس نوع حرکت
    switch (type) {
      case 'IN':
        newStock = previousStock + quantity;
        break;
      case 'OUT':
        newStock = previousStock - quantity;
        break;
      case 'ADJUSTMENT':
        newStock = quantity; // در تعدیل، quantity همان موجودی جدید است
        break;
      case 'TRANSFER':
        newStock = previousStock - quantity;
        break;
      case 'RETURN':
        newStock = previousStock + quantity;
        break;
      case 'WASTE':
      case 'EXPIRED':
        newStock = previousStock - quantity;
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'نوع حرکت نامعتبر است' },
          { status: 400 }
        );
    }

    // جلوگیری از موجودی منفی
    if (newStock < 0) {
      return NextResponse.json(
        { success: false, error: 'موجودی کافی وجود ندارد' },
        { status: 400 }
      );
    }

    // تعیین وضعیت جدید
    let newStatus: string = 'IN_STOCK';
    if (newStock <= 0) {
      newStatus = 'OUT_OF_STOCK';
    } else if (newStock <= item.minStock) {
      newStatus = 'LOW_STOCK';
    }

    // بررسی انقضا
    const expiry = expiryDate ? new Date(expiryDate) : item.expiryDate;
    if (expiry && expiry <= new Date()) {
      newStatus = 'EXPIRED';
    }

    // محاسبه ارزش کل
    const calculatedUnitPrice = unitPrice || item.price;
    const totalValue = Math.abs(quantity) * calculatedUnitPrice;

    // ایجاد حرکت و به‌روزرسانی آیتم در تراکنش
    const result = await prisma.$transaction(async (prisma) => {
      // ایجاد حرکت
      const movement = await prisma.stockMovement.create({
        data: {
          itemId,
          type,
          quantity: Math.abs(quantity),
          previousStock,
          newStock,
          unitPrice: calculatedUnitPrice,
          totalValue,
          reason,
          reference,
          batchNumber,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          supplier,
          user,
          notes
        },
        include: {
          item: {
            select: {
              id: true,
              name: true,
              sku: true,
              unit: true
            }
          }
        }
      });

      // به‌روزرسانی موجودی آیتم
      await prisma.inventoryItem.update({
        where: { id: itemId },
        data: {
          currentStock: newStock,
          status: newStatus,
          ...(type === 'IN' && { lastRestockDate: new Date() }),
          ...(unitPrice && { price: calculatedUnitPrice })
        }
      });

      return movement;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'حرکت انبار با موفقیت ثبت شد'
    });

  } catch (error) {
    console.error('Error creating stock movement:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطا در ثبت حرکت انبار',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
