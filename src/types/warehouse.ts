export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  capacity: number;
  currentUtilization: number;
  zones: WarehouseZone[];
  manager: string;
  contactInfo: {
    phone: string;
    email: string;
  };
  operatingHours: {
    open: string;
    close: string;
    timezone: string;
  };
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

export interface WarehouseZone {
  id: string;
  warehouseId: string;
  name: string;
  code: string;
  type: 'receiving' | 'storage' | 'picking' | 'packing' | 'shipping' | 'returns';
  capacity: number;
  currentUtilization: number;
  temperature?: {
    min: number;
    max: number;
    current: number;
  };
  humidity?: {
    min: number;
    max: number;
    current: number;
  };
  status: 'active' | 'inactive' | 'maintenance';
  restrictions?: string[];
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  location: InventoryLocation;
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  cost: number;
  sellingPrice: number;
  supplier?: string;
  expiryDate?: Date;
  batchNumber?: string;
  serialNumbers?: string[];
  status: 'active' | 'discontinued' | 'out_of_stock';
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryLocation {
  warehouseId: string;
  zoneId: string;
  aisle: string;
  rack: string;
  shelf: string;
  bin: string;
  fullLocation: string; // e.g., "WH01-A-01-02-03"
}

export interface StockMovement {
  id: string;
  itemId: string;
  type: 'inbound' | 'outbound' | 'transfer' | 'adjustment' | 'return';
  quantity: number;
  fromLocation?: InventoryLocation;
  toLocation?: InventoryLocation;
  orderId?: string;
  reason: string;
  notes?: string;
  performedBy: string;
  timestamp: Date;
  batchNumber?: string;
  serialNumbers?: string[];
}

export interface PickingTask {
  id: string;
  orderId: string;
  warehouseId: string;
  assignedTo?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  items: PickingItem[];
  estimatedTime: number; // in minutes
  actualTime?: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
}

export interface PickingItem {
  id: string;
  itemId: string;
  sku: string;
  name: string;
  quantityRequested: number;
  quantityPicked: number;
  location: InventoryLocation;
  status: 'pending' | 'picked' | 'short' | 'damaged';
  notes?: string;
}

export interface ReceivingTask {
  id: string;
  purchaseOrderId?: string;
  returnOrderId?: string;
  warehouseId: string;
  supplier?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'discrepancy';
  expectedItems: ReceivingItem[];
  actualItems: ReceivingItem[];
  assignedTo?: string;
  scheduledDate: Date;
  receivedDate?: Date;
  notes?: string;
  discrepancies?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ReceivingItem {
  id: string;
  itemId: string;
  sku: string;
  name: string;
  expectedQuantity: number;
  receivedQuantity: number;
  condition: 'good' | 'damaged' | 'expired';
  batchNumber?: string;
  expiryDate?: Date;
  notes?: string;
}

export interface ReceivingFormData {
  purchaseOrderId?: string;
  warehouseId: string;
  supplier: string;
  scheduledDate: Date;
  expectedItems: {
    sku: string;
    name: string;
    expectedQuantity: number;
    batchNumber?: string;
    expiryDate?: Date;
  }[];
  notes?: string;
}
export interface WarehouseFormData {
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  capacity: number;
  manager: string;
  contactInfo: {
    phone: string;
    email: string;
  };
  operatingHours: {
    open: string;
    close: string;
    timezone: string;
  };
}

export interface InventoryFormData {
  sku: string;
  name: string;
  description?: string;
  category: string;
  brand?: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  location: {
    warehouseId: string;
    zoneId: string;
    aisle: string;
    rack: string;
    shelf: string;
    bin: string;
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  cost: number;
  sellingPrice: number;
  supplier?: string;
  expiryDate?: Date;
  batchNumber?: string;
}