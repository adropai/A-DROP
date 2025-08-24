// Kitchen System Types
export type KitchenStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';
export type KitchenPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type Department = 'KITCHEN' | 'BAKERY' | 'BAR' | 'SALAD_BAR' | 'PASTRY';
export type KitchenDepartment = Department;

// Cashier System Types  
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
export type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE' | 'LOYALTY_POINTS' | 'FREE';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface KitchenTicket {
  id: string;
  ticketNumber: string;
  orderId: string;
  department: Department;
  status: KitchenStatus;
  priority: KitchenPriority;
  tableNumber?: string;
  estimatedTime: number;
  assignedChef?: string;
  notes?: string;
  startedAt?: Date;
  readyAt?: Date;
  servedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  order: {
    id: string;
    orderNumber: string;
    customerName?: string;
    customerPhone?: string;
    type: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
    tableNumber?: number;
  };
  items: KitchenTicketItem[];
}

export interface KitchenTicketItem {
  id: string;
  kitchenTicketId: string;
  orderItemId: string;
  quantity: number;
  status: KitchenStatus;
  notes?: string;
  preparationTime: number;
  orderItem: {
    id: string;
    menuItem: {
      id: string;
      name: string;
      category: string;
      preparationTime: number;
    };
  };
}

export interface KitchenStats {
  totalTickets: number;
  pendingTickets: number;
  preparingTickets: number;
  readyTickets: number;
  servedToday: number;
  averageTime: number;
  averagePreparationTime: number;
  activeChefs: number;
  departmentStats: {
    [key: string]: {
      active: number;
      total: number;
    };
  };
}

export interface CashierOrder {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  type: OrderType;
  tableNumber?: number;
  address?: string; // for delivery orders
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    menuItemId: string;
    menuItemName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
    menuItem: {
      id: string;
      name: string;
      price: number;
      category: string;
    };
  }[];
}

export interface CashierStats {
  todaySales: number;
  totalOrders: number;
  cashSales: number;
  cardSales: number;
  onlineSales: number;
  pendingPayments: number;
  averageOrderValue: number;
  hourlyStats: {
    hour: number;
    sales: number;
    orders: number;
  }[];
}
