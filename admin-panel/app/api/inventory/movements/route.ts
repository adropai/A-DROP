import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MovementType } from '@prisma/client';

// GET - دریافت تمام حرکت‌های انبار
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Inventory Movements GET API called');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const itemId = searchParams.get('itemId') || '';
    const type = searchParams.get('type') || '';

    const skip = (page - 1) * limit;
    const where: any = {};

    if (itemId && itemId !== 'all') {
      where.itemId = itemId;
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
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
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.stockMovement.count({ where })
    ]);

    console.log(`📋 Found ${movements.length} inventory movements`);

    return NextResponse.json({
      success: true,
      data: movements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Inventory Movements GET error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت حرکت‌های انبار',
      data: []
    }, { status: 500 });
  }
}

// POST - اضافه کردن حرکت جدید (ورود/خروج کالا)
export async function POST(request: NextRequest) {
  try {
    console.log('📋 Inventory Movements POST API called');
    const body = await request.json();
    console.log('📋 Request body:', body);

    // پردازش پارامترهای مختلف از frontend
    const itemId = body.itemId;
    const type = body.type;
    const quantity = body.quantity || body.amount || 0; // امکان دریافت quantity یا amount
    const unitPrice = body.unitPrice || 0;
    const reference = body.reference || body.description || '';
    const notes = body.notes || body.description || '';
    const userId = body.userId || 'system';

    // دریافت موجودی فعلی آیتم
    const currentItem = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
      select: { currentStock: true, name: true }
    });

    if (!currentItem) {
      return NextResponse.json({
        success: false,
        message: 'آیتم یافت نشد'
      }, { status: 404 });
    }

    const previousStock = currentItem.currentStock;
    let newStock = previousStock;

    // محاسبه موجودی جدید
    if (type === 'IN') {
      newStock = previousStock + quantity;
    } else if (type === 'OUT') {
      newStock = previousStock - quantity;
      
      // بررسی موجودی منفی
      if (newStock < 0) {
        return NextResponse.json({
          success: false,
          message: `موجودی کافی نیست. موجودی فعلی: ${previousStock}`
        }, { status: 400 });
      }
    } else if (type === 'WASTE') {
      // تلفات - کاهش موجودی
      newStock = previousStock - quantity;
      
      // بررسی موجودی منفی
      if (newStock < 0) {
        return NextResponse.json({
          success: false,
          message: `موجودی کافی نیست. موجودی فعلی: ${previousStock}`
        }, { status: 400 });
      }
    } else if (type === 'ADJUSTMENT') {
      // تعدیل موجودی - تنظیم مستقیم موجودی
      newStock = quantity; // quantity در این حالت موجودی جدید است
    }

    // ایجاد حرکت جدید
    const newMovement = await prisma.stockMovement.create({
      data: {
        itemId: itemId,
        type: type,
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: quantity * unitPrice,
        reference: reference,
        notes: notes,
        userId: userId,
        previousStock: previousStock,
        newStock: newStock
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
        status: newStock === 0 ? 'OUT_OF_STOCK' : 
               newStock <= (await prisma.inventoryItem.findUnique({ 
                 where: { id: itemId }, 
                 select: { minStock: true } 
               }))?.minStock ? 'LOW_STOCK' : 'IN_STOCK'
      }
    });

    console.log('📋 Created inventory movement:', newMovement.id);
    console.log(`📋 Stock updated: ${previousStock} → ${newStock}`);

    return NextResponse.json({
      success: true,
      message: 'حرکت انبار با موفقیت ثبت شد',
      data: newMovement
    });

  } catch (error) {
    console.error('❌ Inventory Movements POST error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در ثبت حرکت انبار'
    }, { status: 500 });
  }
}

// DELETE - حذف حرکت انبار
export async function DELETE(request: NextRequest) {
  try {
    console.log('📋 Inventory Movements DELETE API called');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'شناسه حرکت الزامی است'
      }, { status: 400 });
    }

    // دریافت اطلاعات حرکت قبل از حذف
    const movement = await prisma.stockMovement.findUnique({
      where: { id }
    });

    if (!movement) {
      return NextResponse.json({
        success: false,
        message: 'حرکت یافت نشد'
      }, { status: 404 });
    }

    // برگرداندن موجودی (عکس عمل حرکت)
    if (movement.type === 'IN') {
      // اگر ورودی بود، باید کم کنیم
      await prisma.inventoryItem.update({
        where: { id: movement.itemId },
        data: {
          currentStock: {
            decrement: movement.quantity
          }
        }
      });
    } else if (movement.type === 'OUT' || movement.type === 'WASTE') {
      // اگر خروجی یا تلفات بود، باید اضافه کنیم
      await prisma.inventoryItem.update({
        where: { id: movement.itemId },
        data: {
          currentStock: {
            increment: movement.quantity
          }
        }
      });
    } else if (movement.type === 'ADJUSTMENT') {
      // برای تعدیل، باید موجودی قبلی را برگردانیم
      await prisma.inventoryItem.update({
        where: { id: movement.itemId },
        data: {
          currentStock: movement.previousStock
        }
      });
    }

    // حذف حرکت
    await prisma.stockMovement.delete({
      where: { id }
    });

    console.log('📋 Deleted inventory movement:', id);

    return NextResponse.json({
      success: true,
      message: 'حرکت انبار با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('❌ Inventory Movements DELETE error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در حذف حرکت انبار'
    }, { status: 500 });
  }
}
