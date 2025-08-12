import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - دریافت یک آیتم منو خاص
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🍽️ GET request for menu item ID: ${params.id}`)
    
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        _count: {
          select: { orderItems: true }
        }
      }
    })
    
    if (!menuItem) {
      return NextResponse.json({
        success: false,
        message: "آیتم منو پیدا نشد"
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      menuItem: {
        ...menuItem,
        soldCount: menuItem._count.orderItems
      }
    })
  } catch (error) {
    console.error("Menu item GET error:", error)
    return NextResponse.json({
      success: false,
      message: "خطا در دریافت آیتم منو"
    }, { status: 500 })
  }
}

// PUT - بروزرسانی آیتم منو
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔄 PUT request for menu item ID: ${params.id}`)
    const body = await request.json()
    
    const menuItem = await prisma.menuItem.update({
      where: { id: params.id },
      data: {
        name: body.name,
        nameEn: body.nameEn,
        nameAr: body.nameAr,
        description: body.description,
        price: body.price,
        discountPrice: body.discountPrice,
        categoryId: body.categoryId,
        images: body.images,
        isAvailable: body.isAvailable,
        isSpecial: body.isSpecial,
        preparationTime: body.preparationTime,
        calories: body.calories,
        ingredients: body.ingredients,
        tags: body.tags,
        priority: body.priority,
        updatedAt: new Date()
      },
      include: {
        category: true,
        _count: {
          select: { orderItems: true }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: "آیتم منو بروزرسانی شد",
      menuItem: {
        ...menuItem,
        soldCount: menuItem._count.orderItems
      }
    })
  } catch (error) {
    console.error("Menu item PUT error:", error)
    return NextResponse.json({
      success: false,
      message: "خطا در بروزرسانی آیتم منو"
    }, { status: 500 })
  }
}

// DELETE - حذف آیتم منو
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🗑️ DELETE request for menu item ID: ${params.id}`)
    
    await prisma.menuItem.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({
      success: true,
      message: "آیتم منو حذف شد"
    })
  } catch (error) {
    console.error("Menu item DELETE error:", error)
    return NextResponse.json({
      success: false,
      message: "خطا در حذف آیتم منو"
    }, { status: 500 })
  }
}
