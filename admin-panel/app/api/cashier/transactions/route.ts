import { NextRequest, NextResponse } from 'next/server'
import type { CashierTransaction } from '@/types/cashier'

// Sample data storage (replace with actual database)
let transactions: CashierTransaction[] = [
  {
    id: '1',
    type: 'sale',
    amount: 125000,
    paymentMethod: 'cash',
    orderId: '1001',
    description: 'فروش سفارش غذا',
    registerId: '1',
    cashierId: 'cashier_1',
    receiptNumber: 'RCP001',
    status: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2', 
    type: 'refund',
    amount: 45000,
    paymentMethod: 'card',
    orderId: '1002',
    description: 'برگشت سفارش',
    registerId: '1',
    cashierId: 'cashier_1',
    receiptNumber: 'RCP002',
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '3',
    type: 'expense',
    amount: 25000,
    paymentMethod: 'cash',
    description: 'خرید مواد اولیه',
    registerId: '1',
    cashierId: 'cashier_1',
    status: 'completed',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString()
  }
]

// GET /api/cashier/transactions
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const registerId = url.searchParams.get('registerId')
    const type = url.searchParams.get('type')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    let filteredTransactions = [...transactions]

    // Filter by register ID
    if (registerId) {
      filteredTransactions = filteredTransactions.filter(t => t.registerId === registerId)
    }

    // Filter by type
    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type)
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      filteredTransactions = filteredTransactions.filter(t => {
        const transactionDate = new Date(t.createdAt)
        return transactionDate >= start && transactionDate <= end
      })
    }

    // Sort by creation date (newest first)
    filteredTransactions.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json(filteredTransactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// POST /api/cashier/transactions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['type', 'amount', 'paymentMethod', 'description', 'registerId']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create new transaction
    const newTransaction: CashierTransaction = {
      id: (transactions.length + 1).toString(),
      type: body.type,
      amount: parseFloat(body.amount),
      paymentMethod: body.paymentMethod,
      orderId: body.orderId,
      description: body.description,
      registerId: body.registerId,
      cashierId: body.cashierId || 'default_cashier',
      receiptNumber: `RCP${String(transactions.length + 1).padStart(3, '0')}`,
      taxAmount: body.taxAmount || 0,
      discountAmount: body.discountAmount || 0,
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    transactions.push(newTransaction)

    return NextResponse.json(newTransaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
