// Shared data storage for delivery system (موقتاً تا زمان اتصال به دیتابیس)

export let couriers: any[] = [
  {
    id: '1',
    name: 'علی احمدی',
    phone: '09123456789',
    email: 'ali@example.com',
    vehicleType: 'MOTORCYCLE',
    vehicleNumber: '123-ایران-45',
    status: 'BUSY',
    rating: 4.5,
    totalDeliveries: 145,
    currentLocation: {
      latitude: 35.7219,
      longitude: 51.3347,
      lastUpdated: new Date()
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'محمد رضایی',
    phone: '09187654321',
    email: 'mohammad@example.com',
    vehicleType: 'BIKE',
    vehicleNumber: '456-ایران-78',
    status: 'AVAILABLE',
    rating: 4.8,
    totalDeliveries: 98,
    currentLocation: {
      latitude: 35.6892,
      longitude: 51.3890,
      lastUpdated: new Date()
    },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'فرید کریمی',
    phone: '09191234567',
    vehicleType: 'CAR',
    vehicleNumber: '789-ایران-12',
    status: 'OFFLINE',
    rating: 4.2,
    totalDeliveries: 67,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export let deliveries: any[] = [
  {
    id: '1',
    trackingCode: 'DEL-001',
    customerName: 'احمد محمدی',
    customerPhone: '09123456789',
    pickupAddress: 'تهران، خیابان ولیعصر، پلاک 123',
    deliveryAddress: 'تهران، خیابان آزادی، پلاک 456',
    status: 'PENDING',
    courierId: null,
    orderValue: 250000,
    deliveryFee: 15000,
    items: [
      { name: 'پیتزا پپرونی', quantity: 2, price: 120000 },
      { name: 'نوشابه', quantity: 2, price: 10000 }
    ],
    estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    trackingCode: 'DEL-002',
    customerName: 'فاطمه رضایی',
    customerPhone: '09187654321',
    pickupAddress: 'تهران، خیابان انقلاب، پلاک 789',
    deliveryAddress: 'تهران، خیابان کریمخان، پلاک 123',
    status: 'ASSIGNED',
    courierId: '1',
    orderValue: 180000,
    deliveryFee: 12000,
    items: [
      { name: 'برگر چیکن', quantity: 1, price: 85000 },
      { name: 'سیب زمینی', quantity: 1, price: 25000 }
    ],
    estimatedDeliveryTime: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

// Helper functions to get next ID
export function getNextCourierId(): string {
  const maxId = Math.max(...couriers.map(c => parseInt(c.id, 10)))
  return (maxId + 1).toString()
}

export function getNextDeliveryId(): string {
  const maxId = Math.max(...deliveries.map(d => parseInt(d.id, 10)))
  return (maxId + 1).toString()
}
