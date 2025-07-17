import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const exportVehiclesToPDF = (vehicles: any[], title: string = 'Fleet Report') => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 14, 22);
  
  // Add generation date
  doc.setFontSize(12);
  doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 32);
  
  // Prepare table data
  const tableData = vehicles.map(vehicle => [
    `${vehicle.make} ${vehicle.model}`,
    vehicle.licensePlate,
    vehicle.year.toString(),
    vehicle.type,
    vehicle.fuelType,
    `${vehicle.capacity}kg`,
    vehicle.status,
    `${vehicle.utilizationRate || 0}%`,
    `${(vehicle.mileage || 0).toLocaleString()} km`,
    `$${vehicle.maintenanceCost || 0}`,
  ]);
  
  // Add table
  autoTable(doc, {
    head: [['Vehicle', 'License', 'Year', 'Type', 'Fuel', 'Capacity', 'Status', 'Utilization', 'Mileage', 'Maintenance Cost']],
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
  doc.text(`Total Vehicles: ${vehicles.length}`, 14, finalY + 20);
  
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  doc.text(`Active Vehicles: ${activeVehicles}`, 14, finalY + 30);
  
  const totalMaintenance = vehicles.reduce((sum, v) => sum + (v.maintenanceCost || 0), 0);
  doc.text(`Total Maintenance Cost: $${totalMaintenance.toLocaleString()}`, 14, finalY + 40);
  
  // Save the PDF
  doc.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const exportVehiclesToExcel = (vehicles: any[], filename: string = 'fleet-export') => {
  // Prepare data for Excel
  const excelData = vehicles.map(vehicle => ({
    'Vehicle': `${vehicle.make} ${vehicle.model}`,
    'License Plate': vehicle.licensePlate,
    'Year': vehicle.year,
    'Type': vehicle.type,
    'Fuel Type': vehicle.fuelType,
    'Capacity (kg)': vehicle.capacity,
    'Status': vehicle.status,
    'Utilization Rate (%)': vehicle.utilizationRate || 0,
    'Mileage (km)': vehicle.mileage || 0,
    'Fuel Level (%)': vehicle.fuelLevel || 0,
    'Maintenance Status': vehicle.maintenanceStatus,
    'Maintenance Cost ($)': vehicle.maintenanceCost || 0,
    'Daily Rate ($)': vehicle.dailyRate || 0,
    'Total Trips': vehicle.totalTrips || 0,
    'Total Distance (km)': vehicle.totalDistance || 0,
    'Fuel Consumption (L/100km)': vehicle.fuelConsumption || 0,
    'Last Service': vehicle.lastService ? format(vehicle.lastService, 'yyyy-MM-dd') : '',
    'Next Service': vehicle.nextService ? format(vehicle.nextService, 'yyyy-MM-dd') : '',
    'Insurance Expiry': vehicle.insuranceExpiry ? format(vehicle.insuranceExpiry, 'yyyy-MM-dd') : '',
    'Registration Expiry': vehicle.registrationExpiry ? format(vehicle.registrationExpiry, 'yyyy-MM-dd') : '',
  }));
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths
  const colWidths = [
    { wch: 20 }, // Vehicle
    { wch: 15 }, // License Plate
    { wch: 8 },  // Year
    { wch: 10 }, // Type
    { wch: 12 }, // Fuel Type
    { wch: 12 }, // Capacity
    { wch: 12 }, // Status
    { wch: 15 }, // Utilization Rate
    { wch: 12 }, // Mileage
    { wch: 12 }, // Fuel Level
    { wch: 18 }, // Maintenance Status
    { wch: 18 }, // Maintenance Cost
    { wch: 12 }, // Daily Rate
    { wch: 12 }, // Total Trips
    { wch: 15 }, // Total Distance
    { wch: 20 }, // Fuel Consumption
    { wch: 15 }, // Last Service
    { wch: 15 }, // Next Service
    { wch: 15 }, // Insurance Expiry
    { wch: 18 }, // Registration Expiry
  ];
  ws['!cols'] = colWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Fleet');
  
  // Save the file
  XLSX.writeFile(wb, `${filename}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

export const exportVehiclesToCSV = (vehicles: any[], filename: string = 'fleet-export') => {
  // Prepare CSV data
  const csvData = vehicles.map(vehicle => ({
    'Vehicle': `${vehicle.make} ${vehicle.model}`,
    'License Plate': vehicle.licensePlate,
    'Year': vehicle.year,
    'Type': vehicle.type,
    'Status': vehicle.status,
    'Utilization Rate': `${vehicle.utilizationRate || 0}%`,
    'Mileage': `${(vehicle.mileage || 0).toLocaleString()} km`,
    'Maintenance Cost': `$${vehicle.maintenanceCost || 0}`,
  }));
  
  // Convert to CSV string
  const headers = Object.keys(csvData[0]);
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
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