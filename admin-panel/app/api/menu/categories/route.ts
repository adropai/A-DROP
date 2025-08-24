import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    console.log("📂 Categories GET called")
    
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true },
              include: {
                children: {
                  where: { isActive: true }
                }
              }
            }
          }
        },
        _count: {
          select: { 
            menuItems: true,
            children: true
          }
        }
      },
      orderBy: { priority: "desc" }
    })
    
    return NextResponse.json({
      success: true,
      categories,
      total: categories.length
    })
  } catch (error) {
    console.error("Categories GET error:", error)
    return NextResponse.json({
      success: false,
      categories: [],
      message: "خطا در دریافت دسته‌بندی‌ها"
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    console.log("📝 Categories POST called")
    const body = await request.json()
    
    const category = await prisma.category.create({
      data: {
        name: body.name,
        nameEn: body.nameEn,
        nameAr: body.nameAr,
        description: body.description,
        parentId: body.parentId,
        priority: body.priority || 0,
        isActive: true
      },
      include: {
        _count: {
          select: { menuItems: true }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: "دسته‌بندی ایجاد شد",
      category
    })
  } catch (error) {
    console.error("Categories POST error:", error)
    return NextResponse.json({
      success: false,
      message: "خطا در ایجاد دسته‌بندی"
    }, { status: 500 })
  }
}
