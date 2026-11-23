export type RoleName = 'Super Admin' | 'Admin' | 'Manager' | 'Staff';

export type OccasionType =
  'birthday' | 'anniversary' | 'parents' | 'romantic' | 'congratulations' | 'festivals';

export type OrderStatus =
  'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

export type DeliveryStatus =
  | 'UNASSIGNED'
  | 'ASSIGNED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'CANCELLED';

export interface PackageAddon {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface PackageFeature {
  title: string;
  included: boolean;
}

export interface OrderItemAddon {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  packageId: string;
  title: string;
  slug: string;
  price: number;
  quantity: number;
  selectedAddons: OrderItemAddon[];
  customMessage?: string;
  recipientName?: string;
  totalPrice: number;
}

export interface OrderTimelineEntry {
  id: string;
  status: OrderStatus;
  note: string;
  updatedBy: string;
  timestamp: string;
}
