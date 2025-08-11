import { NextRequest, NextResponse } from 'next/server'
import type { CashRegister } from '@/types/cashier'

// Sample data storage (replace with actual database)
let registers: CashRegister[] = [
  {
    id: '1',
    name: 'صندوق اصلی',
    location: 'طبقه همکف',
    status: 'open',
    cashBalance: 2500000,
    openedAt: new Date(Date.now() - 28800000).toISOString(), // 8 hours ago
    openedBy: 'admin',
    lastActivity: new Date().toISOString(),
    dailyTransactions: 45,
    createdAt: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'صندوق فودکورت',
    location: 'فودکورت',
    status: 'closed',
    cashBalance: 0,
    closedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    closedBy: 'cashier_2',
    lastActivity: new Date(Date.now() - 3600000).toISOString(),
    dailyTransactions: 12,
    createdAt: new Date(Date.now() - 1296000000).toISOString(), // 15 days ago
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '3',
    name: 'صندوق تیک‌اوی',
    location: 'تیک‌اوی',
    status: 'open',
    cashBalance: 850000,
    openedAt: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
    openedBy: 'cashier_3',
    lastActivity: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
    dailyTransactions: 28,
    createdAt: new Date(Date.now() - 1728000000).toISOString(), // 20 days ago
    updatedAt: new Date(Date.now() - 1800000).toISOString()
  }
]

// GET /api/cashier/registers
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')

    let filteredRegisters = [...registers]

    // Filter by status if provided
    if (status && (status === 'open' || status === 'closed')) {
      filteredRegisters = filteredRegisters.filter(r => r.status === status)
    }

    // Sort by status (open first) then by name
    filteredRegisters.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'open' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json(filteredRegisters)
  } catch (error) {
    console.error('Error fetching registers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch registers' },
      { status: 500 }
    )
  }
}

// POST /api/cashier/registers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['name']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create new register
    const newRegister: CashRegister = {
      id: (registers.length + 1).toString(),
      name: body.name,
      location: body.location || '',
      status: 'closed',
      cashBalance: 0,
      lastActivity: new Date().toISOString(),
      dailyTransactions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    registers.push(newRegister)

    return NextResponse.json(newRegister, { status: 201 })
  } catch (error) {
    console.error('Error creating register:', error)
    return NextResponse.json(
      { error: 'Failed to create register' },
      { status: 500 }
    )
  }
}
