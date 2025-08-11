export type OrderStatus = 'New' | 'Confirmed' | 'Preparing' | 'Ready' | 'Delivering' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customer: {
    id: string;
    name: string;
    phone: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  amount: number;
  status: OrderStatus;
  createdAt: string;
}
