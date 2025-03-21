
import * as XLSX from 'xlsx';
import { CollectionItem, Category } from '@/types';

interface ExportOptions {
  fileName?: string;
  sheetName?: string;
}

export const exportCollectionToExcel = (
  items: CollectionItem[],
  categories: Category[],
  options: ExportOptions = {}
) => {
  const { fileName = 'collection-report', sheetName = 'Collection Items' } = options;

  // Transform data to a format suitable for Excel
  const data = items.map(item => {
    const category = categories.find(cat => cat.id === item.categoryId);
    return {
      'Name': item.name,
      'Category': category?.name || 'Unknown',
      'Description': item.description,
      'Condition': formatCondition(item.condition),
      'Price/Value': item.price,
      'Acquisition Date': new Date(item.acquisitionDate).toLocaleDateString(),
      'Notes': item.notes || '',
    };
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-size columns
  const colWidths = calculateColumnWidths(data);
  worksheet['!cols'] = Object.keys(colWidths).map(key => ({ wch: colWidths[key] }));

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

const formatCondition = (condition: string): string => {
  return condition
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const calculateColumnWidths = (data: any[]): { [key: number]: number } => {
  const widths: { [key: number]: number } = {};
  
  if (data.length === 0) return widths;
  
  // Get all possible keys from the first row
  const keys = Object.keys(data[0]);
  
  // Initialize widths with headers
  keys.forEach((key, i) => {
    widths[i] = key.length;
  });
  
  // Calculate max width for each column
  data.forEach(row => {
    keys.forEach((key, i) => {
      const value = String(row[key] || '');
      widths[i] = Math.max(widths[i], value.length);
    });
  });
  
  // Add some padding
  Object.keys(widths).forEach(key => {
    widths[parseInt(key)] = Math.min(50, widths[parseInt(key)] + 2);
  });
  
  return widths;
};
