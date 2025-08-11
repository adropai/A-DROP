import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/branches/menu - دریافت منوی شعبه
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const categoryId = searchParams.get('categoryId');
    const isAvailable = searchParams.get('isAvailable');

    console.log('دریافت منوی شعبه:', { branchId, categoryId, isAvailable });

    if (!branchId) {
      return NextResponse.json(
        { success: false, error: 'شناسه شعبه اجباری است' },
        { status: 400 }
      );
    }

    // بررسی وجود شعبه
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      select: { id: true, name: true, isActive: true }
    });

    if (!branch) {
      return NextResponse.json(
        { success: false, error: 'شعبه یافت نشد' },
        { status: 404 }
      );
    }

    // ساخت شرط‌های جستجو
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (isAvailable !== null) where.isAvailable = isAvailable === 'true';

    // دریافت دسته‌بندی‌ها با آیتم‌ها
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        menuItems: {
          some: {
            isAvailable: true
          }
        }
      },
      include: {
        menuItems: {
          where: {
            ...where,
            isAvailable: true
          },
          orderBy: {
            priority: 'desc'
          }
        }
      },
      orderBy: {
        priority: 'desc'
      }
    });

    // پردازش داده‌ها
    const processedCategories = categories.map(category => ({
      ...category,
      menuItems: category.menuItems.map(item => ({
        ...item,
        images: JSON.parse(item.images || '[]'),
        ingredients: JSON.parse(item.ingredients || '[]'),
        allergens: JSON.parse(item.allergens || '[]'),
        customizations: JSON.parse(item.customizations || '[]')
      }))
    }));

    // دریافت پیشنهادات ویژه شعبه (از کمپین‌های فعال)
    const specialOffers = await prisma.campaign.findMany({
      where: {
        type: 'SPECIAL_OFFER',
        status: 'ACTIVE',
        startDate: { lte: new Date() },
        endDate: { gte: new Date() }
      },
      select: {
        id: true,
        name: true,
        description: true,
        discountValue: true,
        discountType: true,
        targetType: true,
        targetValue: true
      },
      take: 10
    });

    return NextResponse.json({
      success: true,
      data: {
        branch: branch,
        categories: processedCategories,
        specialOffers: specialOffers,
        totalItems: processedCategories.reduce((sum, cat) => sum + cat.menuItems.length, 0),
        totalCategories: processedCategories.length
      }
    });

  } catch (error) {
    console.error('خطا در دریافت منوی شعبه:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت منوی شعبه',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// POST /api/branches/menu - تنظیم دسترسی آیتم منو برای شعبه
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    console.log('تنظیم منوی شعبه:', data);

    // اعتبارسنجی
    if (!data.branchId) {
      return NextResponse.json(
        { success: false, error: 'شناسه شعبه اجباری است' },
        { status: 400 }
      );
    }

    // بررسی وجود شعبه
    const branch = await prisma.branch.findUnique({
      where: { id: data.branchId }
    });

    if (!branch) {
      return NextResponse.json(
        { success: false, error: 'شعبه یافت نشد' },
        { status: 404 }
      );
    }

    let result: any = {};

    // اگر تنظیم دسترسی آیتم‌های خاص درخواست شده
    if (data.menuItemIds && Array.isArray(data.menuItemIds)) {
      const { menuItemIds, isAvailable = true } = data;

      // بروزرسانی دسترسی آیتم‌ها
      const updateResult = await prisma.menuItem.updateMany({
        where: {
          id: { in: menuItemIds }
        },
        data: {
          isAvailable: isAvailable,
          updatedAt: new Date()
        }
      });

      result.menuItemsUpdated = updateResult.count;
    }

    // اگر تنظیم دسترسی دسته‌بندی درخواست شده
    if (data.categoryIds && Array.isArray(data.categoryIds)) {
      const { categoryIds, isAvailable = true } = data;

      // بروزرسانی دسترسی دسته‌بندی‌ها
      const categoryUpdateResult = await prisma.category.updateMany({
        where: {
          id: { in: categoryIds }
        },
        data: {
          isActive: isAvailable,
          updatedAt: new Date()
        }
      });

      // بروزرسانی آیتم‌های داخل دسته‌بندی‌ها
      const itemsUpdateResult = await prisma.menuItem.updateMany({
        where: {
          categoryId: { in: categoryIds }
        },
        data: {
          isAvailable: isAvailable,
          updatedAt: new Date()
        }
      });

      result.categoriesUpdated = categoryUpdateResult.count;
      result.menuItemsInCategoriesUpdated = itemsUpdateResult.count;
    }

    // اگر تنظیم قیمت ویژه شعبه درخواست شده
    if (data.menuItemId && data.specialPrice !== undefined) {
      const menuItem = await prisma.menuItem.findUnique({
        where: { id: data.menuItemId }
      });

      if (menuItem) {
        await prisma.menuItem.update({
          where: { id: data.menuItemId },
          data: {
            discountPrice: data.specialPrice > 0 ? data.specialPrice : null,
            updatedAt: new Date()
          }
        });

        result.specialPriceSet = true;
        result.menuItemId = data.menuItemId;
        result.specialPrice = data.specialPrice;
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'تنظیمات منوی شعبه با موفقیت بروزرسانی شد'
    });

  } catch (error) {
    console.error('خطا در تنظیم منوی شعبه:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در تنظیم منوی شعبه',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}

// PUT /api/branches/menu - بروزرسانی تنظیمات منوی شعبه
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { branchId, bulkUpdate } = data;

    console.log('بروزرسانی دسته‌ای منوی شعبه:', { branchId, bulkUpdate });

    if (!branchId) {
      return NextResponse.json(
        { success: false, error: 'شناسه شعبه اجباری است' },
        { status: 400 }
      );
    }

    // بررسی وجود شعبه
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    });

    if (!branch) {
      return NextResponse.json(
        { success: false, error: 'شعبه یافت نشد' },
        { status: 404 }
      );
    }

    let results: any = {};

    if (bulkUpdate && Array.isArray(bulkUpdate)) {
      // بروزرسانی دسته‌ای
      for (const update of bulkUpdate) {
        if (update.type === 'menuItem' && update.id) {
          await prisma.menuItem.update({
            where: { id: update.id },
            data: {
              isAvailable: update.isAvailable,
              discountPrice: update.specialPrice || null,
              updatedAt: new Date()
            }
          });
        } else if (update.type === 'category' && update.id) {
          await prisma.category.update({
            where: { id: update.id },
            data: {
              isActive: update.isAvailable,
              updatedAt: new Date()
            }
          });
        }
      }

      results.bulkUpdateCount = bulkUpdate.length;
    }

    // اگر فعال/غیرفعال کردن کل منو درخواست شده
    if (data.enableAllItems !== undefined) {
      const allItemsResult = await prisma.menuItem.updateMany({
        data: {
          isAvailable: data.enableAllItems,
          updatedAt: new Date()
        }
      });

      results.allItemsUpdated = allItemsResult.count;
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: 'منوی شعبه با موفقیت بروزرسانی شد'
    });

  } catch (error) {
    console.error('خطا در بروزرسانی منوی شعبه:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در بروزرسانی منوی شعبه',
        details: error instanceof Error ? error.message : 'خطای نامشخص'
      },
      { status: 500 }
    );
  }
}
