import { Order, DeliveryAgent, Vehicle, Warehouse, InventoryItem, ReturnRequest, Invoice, Analytics, User, Customer } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@24ex.com',
    role: 'admin',
    phone: '+1234567890',
    permissions: [{ id: '1', name: 'All Access', resource: '*', action: 'read' }],
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: new Date(),
  },
  {
    id: '2',
    name: 'John Dispatcher',
    email: 'dispatcher@24ex.com',
    role: 'dispatcher',
    phone: '+1234567891',
    permissions: [
      { id: '2', name: 'Orders Read', resource: 'orders', action: 'read' },
      { id: '3', name: 'Orders Update', resource: 'orders', action: 'update' },
    ],
    isActive: true,
    createdAt: new Date('2024-01-02'),
    lastLogin: new Date(),
  },
];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001'
    },
    tier: 'gold',
    company: 'Tech Corp'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1987654321',
    address: {
      street: '789 Pine St',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      zipCode: '90210'
    },
    tier: 'silver',
    company: 'Design Studio'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@example.com',
    phone: '+1555123456',
    address: {
      street: '456 Oak Ave',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      zipCode: '60601'
    },
    tier: 'platinum',
    company: 'Wilson Industries'
  }
];

export const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    customer: mockCustomers[0],
    items: [
      {
        id: '1',
        name: 'Laptop Computer',
        quantity: 1,
        weight: 2.5,
        dimensions: { length: 35, width: 25, height: 3 },
        value: 1200,
        category: 'Electronics',
        sku: 'ELEC-001',
        description: 'High-performance laptop for business use'
      }
    ],
    status: 'shipped',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    deliveryAddress: {
      street: '456 Oak Ave',
      city: 'Brooklyn',
      state: 'NY',
      country: 'USA',
      zipCode: '11201'
    },
    pickupAddress: {
      street: '789 Warehouse Rd',
      city: 'Queens',
      state: 'NY',
      country: 'USA',
      zipCode: '11101'
    },
    trackingNumber: 'TR-001-2024',
    priority: 'high',
    deliveryDate: new Date('2024-01-17'),
    totalAmount: 1200,
    paymentMethod: 'prepaid',
    deliveryFee: 25,
    tax: 96,
    discount: 0,
    estimatedDeliveryTime: new Date('2024-01-17T14:00:00'),
    notes: 'Handle with care - fragile electronics'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    customer: mockCustomers[1],
    items: [
      {
        id: '2',
        name: 'Smartphone',
        quantity: 2,
        weight: 0.3,
        dimensions: { length: 15, width: 7, height: 1 },
        value: 800,
        category: 'Electronics',
        sku: 'ELEC-002',
        description: 'Latest model smartphone with advanced features'
      }
    ],
    status: 'delivered',
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-15'),
    deliveryAddress: {
      street: '321 Sunset Blvd',
      city: 'Hollywood',
      state: 'CA',
      country: 'USA',
      zipCode: '90028'
    },
    pickupAddress: {
      street: '654 Warehouse St',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      zipCode: '90001'
    },
    trackingNumber: 'TR-002-2024',
    priority: 'medium',
    deliveryDate: new Date('2024-01-15'),
    totalAmount: 1600,
    paymentMethod: 'cod',
    deliveryFee: 30,
    tax: 128,
    discount: 50,
    estimatedDeliveryTime: new Date('2024-01-15T16:30:00'),
    actualDeliveryTime: new Date('2024-01-15T16:15:00'),
    notes: 'Customer requested evening delivery'
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    customer: mockCustomers[2],
    items: [
      {
        id: '3',
        name: 'Office Chair',
        quantity: 1,
        weight: 15,
        dimensions: { length: 70, width: 70, height: 120 },
        value: 350,
        category: 'Furniture',
        sku: 'FURN-001',
        description: 'Ergonomic office chair with lumbar support'
      }
    ],
    status: 'processing',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    deliveryAddress: {
      street: '789 Business Park',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      zipCode: '60602'
    },
    pickupAddress: {
      street: '123 Furniture Warehouse',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      zipCode: '60601'
    },
    trackingNumber: 'TR-003-2024',
    priority: 'low',
    deliveryDate: new Date('2024-01-18'),
    totalAmount: 350,
    paymentMethod: 'credit',
    deliveryFee: 40,
    tax: 28,
    discount: 0,
    estimatedDeliveryTime: new Date('2024-01-18T10:00:00'),
    notes: 'Assembly required - customer has tools'
  }
];

export const mockAgents: DeliveryAgent[] = [
  {
    id: '1',
    name: 'Mike Wilson',
    email: 'mike@24ex.com',
    phone: '+1555123456',
    vehicle: {
      id: '1',
      make: 'Honda',
      model: 'Civic',
      year: 2022,
      licensePlate: 'ABC-123',
      type: 'car',
      capacity: 500,
      fuelType: 'petrol',
      maintenanceStatus: 'good'
    },
    status: 'available',
    rating: 4.8,
    completedDeliveries: 1247,
    currentLocation: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: '2',
    name: 'Lisa Chen',
    email: 'lisa@24ex.com',
    phone: '+1555234567',
    vehicle: {
      id: '2',
      make: 'Toyota',
      model: 'Prius',
      year: 2023,
      licensePlate: 'XYZ-789',
      type: 'car',
      capacity: 400,
      fuelType: 'hybrid',
      maintenanceStatus: 'good'
    },
    status: 'busy',
    rating: 4.9,
    completedDeliveries: 892,
    currentLocation: { lat: 34.0522, lng: -118.2437 }
  }
];

export const mockWarehouses: Warehouse[] = [
  {
    id: '1',
    name: 'Main Distribution Center',
    address: {
      street: '1000 Industrial Blvd',
      city: 'Newark',
      state: 'NJ',
      country: 'USA',
      zipCode: '07102'
    },
    capacity: 50000,
    currentStock: 35000,
    zones: [
      { id: '1', name: 'Receiving', type: 'receiving', capacity: 5000, currentUtilization: 3200 },
      { id: '2', name: 'Storage A', type: 'storage', capacity: 20000, currentUtilization: 15000 },
      { id: '3', name: 'Picking', type: 'picking', capacity: 10000, currentUtilization: 8000 },
      { id: '4', name: 'Packing', type: 'packing', capacity: 8000, currentUtilization: 5000 },
      { id: '5', name: 'Shipping', type: 'shipping', capacity: 7000, currentUtilization: 3800 }
    ],
    manager: 'Robert Davis'
  }
];

export const mockInventory: InventoryItem[] = [
  {
    id: '1',
    sku: 'ELEC-001',
    name: 'Laptop Computer',
    category: 'Electronics',
    quantity: 150,
    minStock: 20,
    maxStock: 200,
    location: 'A-01-15',
    cost: 800,
    sellingPrice: 1200
  },
  {
    id: '2',
    sku: 'ELEC-002',
    name: 'Smartphone',
    category: 'Electronics',
    quantity: 75,
    minStock: 50,
    maxStock: 300,
    location: 'A-02-08',
    cost: 400,
    sellingPrice: 800
  }
];

export const mockReturns: ReturnRequest[] = [
  {
    id: '1',
    orderId: '1',
    reason: 'Damaged during shipping',
    status: 'pending',
    createdAt: new Date('2024-01-16'),
    items: [
      {
        itemId: '1',
        quantity: 1,
        reason: 'Screen cracked',
        condition: 'damaged'
      }
    ],
    refundAmount: 1200,
    disposition: 'damage'
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    customerId: '1',
    orderId: '1',
    amount: 1200,
    tax: 96,
    totalAmount: 1296,
    status: 'paid',
    dueDate: new Date('2024-01-30'),
    createdAt: new Date('2024-01-15'),
    paymentDate: new Date('2024-01-16')
  }
];

export const mockAnalytics: Analytics = {
  totalOrders: 1247,
  completedDeliveries: 1189,
  pendingDeliveries: 58,
  revenue: 2847500,
  averageDeliveryTime: 2.3,
  customerSatisfaction: 4.6,
  onTimeDeliveryRate: 94.2,
  returnRate: 2.1
};