import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Order } from '../types';
import { format } from 'date-fns';

export const exportOrdersToPDF = (orders: Order[], title: string = 'Orders Report') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  
  // Add generation date
  doc.setFontSize(12);
  doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 32);
  
  // Prepare table data
  const tableData = orders.map(order => [
    order.orderNumber,
    order.customer.name,
    order.status,
    order.priority,
    `$${order.totalAmount.toLocaleString()}`,
    format(order.createdAt, 'MMM dd, yyyy'),
    order.trackingNumber,
  ]);
  
  // Add table
  autoTable(doc, {
    head: [['Order #', 'Customer', 'Status', 'Priority', 'Amount', 'Date', 'Tracking']],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [37, 99, 235], // Blue color
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Light gray
    },
  });
  
  // Add summary
  const finalY = (doc as any).lastAutoTable.finalY || 40;
  doc.setFontSize(12);
  doc.text(`Total Orders: ${orders.length}`, 14, finalY + 20);
  
  const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  doc.text(`Total Amount: $${totalAmount.toLocaleString()}`, 14, finalY + 30);
  
  // Save the PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const exportOrdersToExcel = (orders: Order[], filename: string = 'orders-export') => {
  // Prepare data for Excel
  const excelData = orders.map(order => ({
    'Order Number': order.orderNumber,
    'Customer Name': order.customer.name,
    'Customer Email': order.customer.email,
    'Customer Phone': order.customer.phone,
    'Company': order.customer.company || '',
    'Status': order.status,
    'Priority': order.priority,
    'Payment Method': order.paymentMethod,
    'Total Amount': order.totalAmount,
    'Delivery Fee': order.deliveryFee,
    'Tax': order.tax,
    'Discount': order.discount,
    'Tracking Number': order.trackingNumber,
    'Created Date': format(order.createdAt, 'yyyy-MM-dd HH:mm:ss'),
    'Delivery Date': order.deliveryDate ? format(order.deliveryDate, 'yyyy-MM-dd HH:mm:ss') : '',
    'Delivery Address': `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}`,
    'Pickup Address': `${order.pickupAddress.street}, ${order.pickupAddress.city}, ${order.pickupAddress.state} ${order.pickupAddress.zipCode}`,
    'Items': order.items.map(item => `${item.name} (${item.quantity}x)`).join('; '),
    'Special Instructions': order.specialInstructions || '',
    'Notes': order.notes || '',
  }));
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths
  const colWidths = [
    { wch: 15 }, // Order Number
    { wch: 20 }, // Customer Name
    { wch: 25 }, // Customer Email
    { wch: 15 }, // Customer Phone
    { wch: 20 }, // Company
    { wch: 12 }, // Status
    { wch: 10 }, // Priority
    { wch: 15 }, // Payment Method
    { wch: 12 }, // Total Amount
    { wch: 12 }, // Delivery Fee
    { wch: 8 },  // Tax
    { wch: 10 }, // Discount
    { wch: 15 }, // Tracking Number
    { wch: 20 }, // Created Date
    { wch: 20 }, // Delivery Date
    { wch: 40 }, // Delivery Address
    { wch: 40 }, // Pickup Address
    { wch: 30 }, // Items
    { wch: 30 }, // Special Instructions
    { wch: 30 }, // Notes
  ];
  ws['!cols'] = colWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  
  // Save the file
  XLSX.writeFile(wb, `${filename}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

export const exportOrdersToCSV = (orders: Order[], filename: string = 'orders-export') => {
  // Prepare CSV data
  const csvData = orders.map(order => ({
    'Order Number': order.orderNumber,
    'Customer Name': order.customer.name,
    'Customer Email': order.customer.email,
    'Status': order.status,
    'Priority': order.priority,
    'Total Amount': order.totalAmount,
    'Tracking Number': order.trackingNumber,
    'Created Date': format(order.createdAt, 'yyyy-MM-dd'),
    'Delivery Address': `"${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}"`,
  }));
  
  // Convert to CSV string
  const headers = Object.keys(csvData[0]);
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => headers.map(header => row[header as keyof typeof row]).join(','))
  ].join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};