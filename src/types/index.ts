export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'dispatcher' | 'agent' | 'warehouse' | 'accounting' | 'customer';
  phone?: string;
  avatar?: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: User['role'];
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  createdAt: Date;
  updatedAt: Date;
  deliveryAddress: Address;
  pickupAddress: Address;
  assignedAgent?: DeliveryAgent;
  trackingNumber: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deliveryDate?: Date;
  totalAmount: number;
  paymentMethod: 'cod' | 'prepaid' | 'credit';
  specialInstructions?: string;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  deliveryFee: number;
  tax: number;
  discount: number;
  notes?: string;
  warehouseId?: string;
  pickingTaskId?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  value: number;
  category: string;
  sku?: string;
  description?: string;
  warehouseLocation?: string;
  reservedQuantity?: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  company?: string;
  taxId?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DeliveryAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle: Vehicle;
  status: 'available' | 'busy' | 'offline';
  rating: number;
  completedDeliveries: number;
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  type: 'bike' | 'car' | 'van' | 'truck';
  capacity: number;
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  maintenanceStatus: 'good' | 'needs_attention' | 'maintenance';
  lastMaintenance?: Date;
  nextMaintenance?: Date;
}

export interface Warehouse {
  id: string;
  name: string;
  address: Address;
  capacity: number;
  currentStock: number;
  zones: WarehouseZone[];
  manager: string;
}

export interface WarehouseZone {
  id: string;
  name: string;
  type: 'receiving' | 'storage' | 'picking' | 'packing' | 'shipping';
  capacity: number;
  currentUtilization: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  location: string;
  expiryDate?: Date;
  cost: number;
  sellingPrice: number;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  orderNumber: string;
  customer: Customer;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  items: ReturnItem[];
  refundAmount: number;
  disposition: 'restock' | 'damage' | 'discard';
  notes?: string;
  processedBy?: string;
  processedAt?: Date;
}

export interface ReturnItem {
  id: string;
  itemId: string;
  name: string;
  quantity: number;
  reason: string;
  condition: 'new' | 'used' | 'damaged';
  refundAmount: number;
}

export interface ReturnFormData {
  orderId: string;
  reason: string;
  items: {
    itemId: string;
    name: string;
    quantity: number;
    reason: string;
    condition: 'new' | 'used' | 'damaged';
    refundAmount: number;
  }[];
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  orderId: string;
  amount: number;
  tax: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  createdAt: Date;
  paymentDate?: Date;
}

export interface Analytics {
  totalOrders: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  revenue: number;
  averageDeliveryTime: number;
  customerSatisfaction: number;
  onTimeDeliveryRate: number;
  returnRate: number;
}

export interface OrderFormData {
  customer: {
    name: string;
    email: string;
    phone: string;
    company?: string;
  };
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  pickupAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  items: {
    name: string;
    quantity: number;
    weight: number;
    value: number;
    category: string;
    description?: string;
  }[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  paymentMethod: 'cod' | 'prepaid' | 'credit';
  deliveryDate?: Date;
  specialInstructions?: string;
  deliveryFee: number;
  discount: number;
}