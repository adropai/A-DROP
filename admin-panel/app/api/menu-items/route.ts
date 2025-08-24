import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const menuItems = await prisma.menuItem.findMany({
      include: {
        category: {
          include: {
            parent: {
              include: {
                parent: {
                  include: {
                    parent: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(menuItems)
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      nameEn,
      description,
      categoryId,
      price,
      preparationTime,
      isAvailable,
      isSpecial,
      priority,
      image,
      allergens,
      tags
    } = body

    if (!name || !categoryId || !price) {
      return NextResponse.json(
        { error: 'Name, category and price are required' },
        { status: 400 }
      )
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        name,
        nameEn,
        description,
        categoryId,
        price: parseFloat(price),
        preparationTime: preparationTime || 0,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
        isSpecial: isSpecial || false,
        priority: priority || 0,
        image,
        allergens,
        tags
      },
      include: {
        category: {
          include: {
            parent: true
          }
        }
      }
    })

    return NextResponse.json(menuItem, { status: 201 })
  } catch (error) {
    console.error('Error creating menu item:', error)
    return NextResponse.json(
      { error: 'Failed to create menu item' },
      { status: 500 }
    )
  }
}
