import { supabase } from '../lib/supabase';
import { Warehouse, InventoryItem, StockMovement, PickingTask, ReceivingTask, WarehouseFormData, InventoryFormData } from '../types/warehouse';

export class WarehouseService {
  // Warehouse Management
  static async getAllWarehouses(): Promise<Warehouse[]> {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .order('name');

      if (error) throw error;
      return data.map(this.transformWarehouse);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      throw error;
    }
  }

  static async getWarehouseById(id: string): Promise<Warehouse | null> {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? this.transformWarehouse(data) : null;
    } catch (error) {
      console.error('Error fetching warehouse:', error);
      throw error;
    }
  }

  static async createWarehouse(warehouseData: WarehouseFormData): Promise<Warehouse> {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .insert({
          name: warehouseData.name,
          code: warehouseData.code,
          address: warehouseData.address,
          capacity: warehouseData.capacity,
          current_utilization: 0,
          manager: warehouseData.manager,
          contact_info: warehouseData.contactInfo,
          operating_hours: warehouseData.operatingHours,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return this.transformWarehouse(data);
    } catch (error) {
      console.error('Error creating warehouse:', error);
      throw error;
    }
  }

  static async updateWarehouse(id: string, warehouseData: Partial<WarehouseFormData>): Promise<Warehouse> {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .update({
          name: warehouseData.name,
          code: warehouseData.code,
          address: warehouseData.address,
          capacity: warehouseData.capacity,
          manager: warehouseData.manager,
          contact_info: warehouseData.contactInfo,
          operating_hours: warehouseData.operatingHours,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.transformWarehouse(data);
    } catch (error) {
      console.error('Error updating warehouse:', error);
      throw error;
    }
  }

  static async deleteWarehouse(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      throw error;
    }
  }

  // Inventory Management
  static async getAllInventoryItems(warehouseId?: string): Promise<InventoryItem[]> {
    try {
      let query = supabase
        .from('inventory_items')
        .select('*')
        .order('name');

      if (warehouseId) {
        query = query.eq('warehouse_id', warehouseId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data.map(this.transformInventoryItem);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }
  }

  static async getInventoryItemById(id: string): Promise<InventoryItem | null> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? this.transformInventoryItem(data) : null;
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      throw error;
    }
  }

  static async createInventoryItem(itemData: InventoryFormData): Promise<InventoryItem> {
    try {
      const fullLocation = `${itemData.location.warehouseId}-${itemData.location.aisle}-${itemData.location.rack}-${itemData.location.shelf}-${itemData.location.bin}`;
      
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          sku: itemData.sku,
          name: itemData.name,
          description: itemData.description,
          category: itemData.category,
          brand: itemData.brand,
          quantity: itemData.quantity,
          reserved_quantity: 0,
          available_quantity: itemData.quantity,
          min_stock: itemData.minStock,
          max_stock: itemData.maxStock,
          reorder_point: itemData.reorderPoint,
          reorder_quantity: itemData.reorderQuantity,
          location: {
            ...itemData.location,
            fullLocation
          },
          dimensions: itemData.dimensions,
          cost: itemData.cost,
          selling_price: itemData.sellingPrice,
          supplier: itemData.supplier,
          expiry_date: itemData.expiryDate,
          batch_number: itemData.batchNumber,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return this.transformInventoryItem(data);
    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
  }

  static async updateInventoryItem(id: string, itemData: Partial<InventoryFormData>): Promise<InventoryItem> {
    try {
      const updateData: any = { ...itemData };
      
      if (itemData.location) {
        updateData.location = {
          ...itemData.location,
          fullLocation: `${itemData.location.warehouseId}-${itemData.location.aisle}-${itemData.location.rack}-${itemData.location.shelf}-${itemData.location.bin}`
        };
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.transformInventoryItem(data);
    } catch (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }
  }

  static async deleteInventoryItem(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }
  }

  // Stock Movement
  static async createStockMovement(movement: Omit<StockMovement, 'id' | 'timestamp'>): Promise<StockMovement> {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .insert({
          item_id: movement.itemId,
          type: movement.type,
          quantity: movement.quantity,
          from_location: movement.fromLocation,
          to_location: movement.toLocation,
          order_id: movement.orderId,
          reason: movement.reason,
          notes: movement.notes,
          performed_by: movement.performedBy,
          batch_number: movement.batchNumber,
          serial_numbers: movement.serialNumbers,
        })
        .select()
        .single();

      if (error) throw error;

      // Update inventory quantities
      await this.updateInventoryQuantities(movement);

      return this.transformStockMovement(data);
    } catch (error) {
      console.error('Error creating stock movement:', error);
      throw error;
    }
  }

  static async getStockMovements(itemId?: string, orderId?: string): Promise<StockMovement[]> {
    try {
      let query = supabase
        .from('stock_movements')
        .select('*')
        .order('timestamp', { ascending: false });

      if (itemId) {
        query = query.eq('item_id', itemId);
      }

      if (orderId) {
        query = query.eq('order_id', orderId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data.map(this.transformStockMovement);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      throw error;
    }
  }

  // Picking Tasks
  static async createPickingTask(orderId: string, warehouseId: string): Promise<PickingTask> {
    try {
      // Get order items and create picking task
      const { data: order } = await supabase
        .from('orders')
        .select('*, customers(*)')
        .eq('id', orderId)
        .single();

      if (!order) throw new Error('Order not found');

      const pickingItems = order.items.map((item: any, index: number) => ({
        id: `pick_${orderId}_${index}`,
        itemId: item.id || `item_${index}`,
        sku: item.sku || `SKU_${index}`,
        name: item.name,
        quantityRequested: item.quantity,
        quantityPicked: 0,
        location: {
          warehouseId,
          zoneId: 'storage',
          aisle: 'A',
          rack: '01',
          shelf: '01',
          bin: '01',
          fullLocation: `${warehouseId}-A-01-01-01`
        },
        status: 'pending' as const
      }));

      const { data, error } = await supabase
        .from('picking_tasks')
        .insert({
          order_id: orderId,
          warehouse_id: warehouseId,
          status: 'pending',
          priority: order.priority || 'medium',
          items: pickingItems,
          estimated_time: pickingItems.length * 5, // 5 minutes per item
        })
        .select()
        .single();

      if (error) throw error;
      return this.transformPickingTask(data);
    } catch (error) {
      console.error('Error creating picking task:', error);
      throw error;
    }
  }

  static async getPickingTasks(warehouseId?: string, status?: string): Promise<PickingTask[]> {
    try {
      let query = supabase
        .from('picking_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (warehouseId) {
        query = query.eq('warehouse_id', warehouseId);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data.map(this.transformPickingTask);
    } catch (error) {
      console.error('Error fetching picking tasks:', error);
      throw error;
    }
  }

  static async updatePickingTask(id: string, updates: Partial<PickingTask>): Promise<PickingTask> {
    try {
      const { data, error } = await supabase
        .from('picking_tasks')
        .update({
          assigned_to: updates.assignedTo,
          status: updates.status,
          items: updates.items,
          actual_time: updates.actualTime,
          started_at: updates.startedAt,
          completed_at: updates.completedAt,
          notes: updates.notes,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return this.transformPickingTask(data);
    } catch (error) {
      console.error('Error updating picking task:', error);
      throw error;
    }
  }

  // Helper methods
  private static transformWarehouse(data: any): Warehouse {
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      address: data.address,
      capacity: data.capacity,
      currentUtilization: data.current_utilization,
      zones: data.zones || [],
      manager: data.manager,
      contactInfo: data.contact_info,
      operatingHours: data.operating_hours,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  // Receiving Tasks
  static async getReceivingTasks(warehouseId?: string, status?: string): Promise<ReceivingTask[]> {
    // Mock data for receiving tasks
    const mockReceivingTasks: ReceivingTask[] = [
      {
        id: '1',
        purchaseOrderId: 'PO-2024-001',
        warehouseId: '1',
        supplier: 'Tech Supplier Inc',
        status: 'pending',
        expectedItems: [
          {
            id: '1',
            itemId: '1',
            sku: 'ELEC-001',
            name: 'Laptop Computer',
            expectedQuantity: 50,
            receivedQuantity: 0,
            condition: 'good'
          }
        ],
        actualItems: [],
        scheduledDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        returnOrderId: 'RET-2024-001',
        warehouseId: '1',
        supplier: 'Customer Return',
        status: 'in_progress',
        expectedItems: [
          {
            id: '2',
            itemId: '2',
            sku: 'ELEC-002',
            name: 'Smartphone',
            expectedQuantity: 2,
            receivedQuantity: 1,
            condition: 'damaged'
          }
        ],
        actualItems: [
          {
            id: '2',
            itemId: '2',
            sku: 'ELEC-002',
            name: 'Smartphone',
            expectedQuantity: 2,
            receivedQuantity: 1,
            condition: 'damaged',
            notes: 'Screen cracked'
          }
        ],
        assignedTo: 'John Receiver',
        scheduledDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    let filtered = mockReceivingTasks;
    
    if (warehouseId) {
      filtered = filtered.filter(task => task.warehouseId === warehouseId);
    }
    
    if (status) {
      filtered = filtered.filter(task => task.status === status);
    }
    
    return filtered;
  }

  static async createReceivingTask(data: ReceivingFormData): Promise<ReceivingTask> {
    const newTask: ReceivingTask = {
      id: Date.now().toString(),
      purchaseOrderId: data.purchaseOrderId,
      warehouseId: data.warehouseId,
      supplier: data.supplier,
      status: 'pending',
      expectedItems: data.expectedItems.map((item, index) => ({
        id: `item_${index}`,
        itemId: `item_${index}`,
        sku: item.sku,
        name: item.name,
        expectedQuantity: item.expectedQuantity,
        receivedQuantity: 0,
        condition: 'good',
        batchNumber: item.batchNumber,
        expiryDate: item.expiryDate
      })),
      actualItems: [],
      scheduledDate: data.scheduledDate,
      notes: data.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return newTask;
  }

  static async updateReceivingTask(id: string, updates: Partial<ReceivingTask>): Promise<ReceivingTask> {
    // Mock update - in real implementation, this would update the database
    const existingTask = await this.getReceivingTasks().then(tasks => 
      tasks.find(task => task.id === id)
    );
    
    if (!existingTask) {
      throw new Error('Receiving task not found');
    }
    
    return {
      ...existingTask,
      ...updates,
      updatedAt: new Date()
    };
  }
  private static transformInventoryItem(data: any): InventoryItem {
    return {
      id: data.id,
      sku: data.sku,
      name: data.name,
      description: data.description,
      category: data.category,
      brand: data.brand,
      quantity: data.quantity,
      reservedQuantity: data.reserved_quantity,
      availableQuantity: data.available_quantity,
      minStock: data.min_stock,
      maxStock: data.max_stock,
      reorderPoint: data.reorder_point,
      reorderQuantity: data.reorder_quantity,
      location: data.location,
      dimensions: data.dimensions,
      cost: data.cost,
      sellingPrice: data.selling_price,
      supplier: data.supplier,
      expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
      batchNumber: data.batch_number,
      serialNumbers: data.serial_numbers,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private static transformStockMovement(data: any): StockMovement {
    return {
      id: data.id,
      itemId: data.item_id,
      type: data.type,
      quantity: data.quantity,
      fromLocation: data.from_location,
      toLocation: data.to_location,
      orderId: data.order_id,
      reason: data.reason,
      notes: data.notes,
      performedBy: data.performed_by,
      timestamp: new Date(data.timestamp),
      batchNumber: data.batch_number,
      serialNumbers: data.serial_numbers,
    };
  }

  private static transformPickingTask(data: any): PickingTask {
    return {
      id: data.id,
      orderId: data.order_id,
      warehouseId: data.warehouse_id,
      assignedTo: data.assigned_to,
      status: data.status,
      priority: data.priority,
      items: data.items,
      estimatedTime: data.estimated_time,
      actualTime: data.actual_time,
      createdAt: new Date(data.created_at),
      startedAt: data.started_at ? new Date(data.started_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      notes: data.notes,
    };
  }

  private static async updateInventoryQuantities(movement: Omit<StockMovement, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { data: item } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', movement.itemId)
        .single();

      if (!item) return;

      let newQuantity = item.quantity;
      let newReservedQuantity = item.reserved_quantity;

      switch (movement.type) {
        case 'inbound':
          newQuantity += movement.quantity;
          break;
        case 'outbound':
          newQuantity -= movement.quantity;
          newReservedQuantity = Math.max(0, newReservedQuantity - movement.quantity);
          break;
        case 'adjustment':
          newQuantity = movement.quantity;
          break;
      }

      const newAvailableQuantity = Math.max(0, newQuantity - newReservedQuantity);

      await supabase
        .from('inventory_items')
        .update({
          quantity: newQuantity,
          reserved_quantity: newReservedQuantity,
          available_quantity: newAvailableQuantity,
        })
        .eq('id', movement.itemId);
    } catch (error) {
      console.error('Error updating inventory quantities:', error);
    }
  }

  // Integration with Orders
  static async reserveInventoryForOrder(orderId: string): Promise<boolean> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (!order) return false;

      for (const item of order.items) {
        const { data: inventoryItem } = await supabase
          .from('inventory_items')
          .select('*')
          .eq('sku', item.sku || item.name)
          .single();

        if (inventoryItem && inventoryItem.available_quantity >= item.quantity) {
          await supabase
            .from('inventory_items')
            .update({
              reserved_quantity: inventoryItem.reserved_quantity + item.quantity,
              available_quantity: inventoryItem.available_quantity - item.quantity,
            })
            .eq('id', inventoryItem.id);
        } else {
          return false; // Insufficient stock
        }
      }

      return true;
    } catch (error) {
      console.error('Error reserving inventory:', error);
      return false;
    }
  }

  static async releaseInventoryReservation(orderId: string): Promise<void> {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (!order) return;

      for (const item of order.items) {
        const { data: inventoryItem } = await supabase
          .from('inventory_items')
          .select('*')
          .eq('sku', item.sku || item.name)
          .single();

        if (inventoryItem) {
          await supabase
            .from('inventory_items')
            .update({
              reserved_quantity: Math.max(0, inventoryItem.reserved_quantity - item.quantity),
              available_quantity: inventoryItem.available_quantity + item.quantity,
            })
            .eq('id', inventoryItem.id);
        }
      }
    } catch (error) {
      console.error('Error releasing inventory reservation:', error);
    }
  }
}