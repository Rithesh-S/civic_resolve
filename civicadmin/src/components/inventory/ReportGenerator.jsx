// src/components/inventory/ReportGenerator.jsx
import React, { useState } from 'react';
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const ReportGenerator = ({ isOpen, onClose, inventory, inventoryRequests, totalExpenses }) => {
  const [reportType, setReportType] = useState('expenses');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [format, setFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  // Calculate report data based on selected type and date range
  const generateReportData = () => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);

    const filteredRequests = inventoryRequests.filter(req => {
      const requestDate = new Date(req.requestedAt);
      return requestDate >= startDate && requestDate <= endDate;
    });

    const approvedRequests = filteredRequests.filter(req => req.status === 'approved');
    const pendingRequests = filteredRequests.filter(req => req.status === 'requested');
    const rejectedRequests = filteredRequests.filter(req => req.status === 'rejected');

    const expensesByCategory = {};
    const expensesByDate = {};
    
    approvedRequests.forEach(req => {
      const requestDate = new Date(req.requestedAt).toISOString().split('T')[0];
      req.items.forEach(item => {
        const inventoryItem = inventory.find(inv => inv._id === item.inventoryId);
        const category = inventoryItem?.category || 'Unknown';
        
        // Category expenses
        expensesByCategory[category] = (expensesByCategory[category] || 0) + item.totalCost;
        
        // Date expenses
        expensesByDate[requestDate] = (expensesByDate[requestDate] || 0) + item.totalCost;
      });
    });

    return {
      dateRange,
      totalRequests: filteredRequests.length,
      approvedRequests: approvedRequests.length,
      pendingRequests: pendingRequests.length,
      rejectedRequests: rejectedRequests.length,
      totalExpenses: approvedRequests.reduce((sum, req) => 
        sum + req.items.reduce((itemSum, item) => itemSum + item.totalCost, 0), 0
      ),
      expensesByCategory,
      expensesByDate,
      requests: filteredRequests,
      inventorySnapshot: inventory
    };
  };

  const reportData = generateReportData();

  // Generate CSV content
  const generateCSV = () => {
    let csvContent = '';
    
    if (reportType === 'expenses') {
      csvContent = 'Inventory Expenses Report\n';
      csvContent += `Period,${dateRange.start} to ${dateRange.end}\n\n`;
      csvContent += 'Category,Amount (INR)\n';
      
      Object.entries(reportData.expensesByCategory).forEach(([category, amount]) => {
        csvContent += `${category},${amount}\n`;
      });
      
      csvContent += '\nDaily Expenses\n';
      csvContent += 'Date,Amount (INR)\n';
      Object.entries(reportData.expensesByDate).forEach(([date, amount]) => {
        csvContent += `${date},${amount}\n`;
      });
      
    } else if (reportType === 'inventory') {
      csvContent = 'Inventory Status Report\n';
      csvContent += `Generated on,${new Date().toISOString().split('T')[0]}\n\n`;
      csvContent += 'Item Name,Category,Quantity,Unit Price (INR),Total Value (INR),Status\n';
      
      inventory.forEach(item => {
        const totalValue = item.quantity * item.unitPrice;
        const status = item.quantity <= item.reorderLevel ? 'Low Stock' : 'In Stock';
        csvContent += `${item.name},${item.category},${item.quantity},${item.unitPrice},${totalValue},${status}\n`;
      });
      
    } else if (reportType === 'requests') {
      csvContent = 'Requests Analysis Report\n';
      csvContent += `Period,${dateRange.start} to ${dateRange.end}\n\n`;
      csvContent += 'Date,Requester,Status,Items,Total Cost (INR)\n';
      
      reportData.requests.forEach(req => {
        const itemCount = req.items.length;
        const totalCost = req.items.reduce((sum, item) => sum + item.totalCost, 0);
        csvContent += `${new Date(req.requestedAt).toISOString().split('T')[0]},${req.requesterName},${req.status},${itemCount},${totalCost}\n`;
      });
    }
    
    return csvContent;
  };

  // Generate Excel-like HTML content
  const generateExcelHTML = () => {
    let htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>Inventory Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            h2 { color: #666; margin-top: 30px; }
            table { border-collapse: collapse; width: 100%; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .summary { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .total { font-weight: bold; color: #28a745; }
          </style>
        </head>
        <body>
    `;

    if (reportType === 'expenses') {
      htmlContent += `
        <h1>Expenses Report</h1>
        <div class="summary">
          <p><strong>Period:</strong> ${dateRange.start} to ${dateRange.end}</p>
          <p><strong>Total Expenses:</strong> <span class="total">₹${reportData.totalExpenses.toLocaleString()}</span></p>
          <p><strong>Approved Requests:</strong> ${reportData.approvedRequests}</p>
          <p><strong>Pending Requests:</strong> ${reportData.pendingRequests}</p>
        </div>

        <h2>Expenses by Category</h2>
        <table>
          <tr><th>Category</th><th>Amount (₹)</th><th>Percentage</th></tr>
      `;
      
      Object.entries(reportData.expensesByCategory).forEach(([category, amount]) => {
        const percentage = ((amount / reportData.totalExpenses) * 100).toFixed(1);
        htmlContent += `<tr><td>${category}</td><td>₹${amount.toLocaleString()}</td><td>${percentage}%</td></tr>`;
      });
      
      htmlContent += `</table>`;
      
    } else if (reportType === 'inventory') {
      const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel).length;
      
      htmlContent += `
        <h1>Inventory Status Report</h1>
        <div class="summary">
          <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Total Items:</strong> ${inventory.length}</p>
          <p><strong>Total Value:</strong> <span class="total">₹${totalValue.toLocaleString()}</span></p>
          <p><strong>Low Stock Items:</strong> ${lowStockItems}</p>
        </div>

        <h2>Inventory Details</h2>
        <table>
          <tr><th>Item Name</th><th>Category</th><th>Quantity</th><th>Unit Price (₹)</th><th>Total Value (₹)</th><th>Status</th></tr>
      `;
      
      inventory.forEach(item => {
        const totalItemValue = item.quantity * item.unitPrice;
        const status = item.quantity <= item.reorderLevel ? 'Low Stock' : 'In Stock';
        const statusClass = item.quantity <= item.reorderLevel ? 'style="color: #dc3545; font-weight: bold;"' : '';
        htmlContent += `
          <tr>
            <td>${item.name}</td>
            <td>${item.category}</td>
            <td>${item.quantity}</td>
            <td>₹${item.unitPrice.toLocaleString()}</td>
            <td>₹${totalItemValue.toLocaleString()}</td>
            <td ${statusClass}>${status}</td>
          </tr>
        `;
      });
      
      htmlContent += `</table>`;
      
    } else if (reportType === 'requests') {
      htmlContent += `
        <h1>Requests Analysis Report</h1>
        <div class="summary">
          <p><strong>Period:</strong> ${dateRange.start} to ${dateRange.end}</p>
          <p><strong>Total Requests:</strong> ${reportData.totalRequests}</p>
          <p><strong>Approved:</strong> ${reportData.approvedRequests}</p>
          <p><strong>Pending:</strong> ${reportData.pendingRequests}</p>
          <p><strong>Rejected:</strong> ${reportData.rejectedRequests}</p>
        </div>

        <h2>Request Details</h2>
        <table>
          <tr><th>Date</th><th>Requester</th><th>Status</th><th>Items</th><th>Total Cost (₹)</th></tr>
      `;
      
      reportData.requests.forEach(req => {
        const itemCount = req.items.length;
        const totalCost = req.items.reduce((sum, item) => sum + item.totalCost, 0);
        const statusClass = req.status === 'approved' ? 'style="color: #28a745;"' : 
                          req.status === 'rejected' ? 'style="color: #dc3545;"' : 
                          'style="color: #ffc107;"';
        
        htmlContent += `
          <tr>
            <td>${new Date(req.requestedAt).toLocaleDateString()}</td>
            <td>${req.requesterName}</td>
            <td ${statusClass}>${req.status.charAt(0).toUpperCase() + req.status.slice(1)}</td>
            <td>${itemCount}</td>
            <td>₹${totalCost.toLocaleString()}</td>
          </tr>
        `;
      });
      
      htmlContent += `</table>`;
    }

    htmlContent += `
        </body>
      </html>
    `;
    
    return htmlContent;
  };

  // Generate PDF content (HTML that can be printed to PDF)
  const generatePDFContent = () => {
    return generateExcelHTML(); // Same content, but optimized for PDF printing
  };

  // Download file function
  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const baseFilename = `inventory_${reportType}_report_${timestamp}`;
      
      if (format === 'csv') {
        const csvContent = generateCSV();
        downloadFile(csvContent, `${baseFilename}.csv`, 'text/csv');
        
      } else if (format === 'excel') {
        const htmlContent = generateExcelHTML();
        downloadFile(htmlContent, `${baseFilename}.html`, 'text/html');
        
      } else if (format === 'pdf') {
        const pdfContent = generatePDFContent();
        // Create a new window for PDF generation
        const printWindow = window.open('', '_blank');
        printWindow.document.write(pdfContent);
        printWindow.document.close();
        
        // Wait for content to load then trigger print
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 250);
        };
      }
      
      // Show success message
      setTimeout(() => {
        alert(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully in ${format.toUpperCase()} format!`);
        onClose();
      }, format === 'pdf' ? 1000 : 0);
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Generate Inventory Report
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Create detailed reports for inventory management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Report Configuration */}
        <div className="p-6 space-y-6">
          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Report Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setReportType('expenses')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  reportType === 'expenses'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <ChartBarIcon className="w-6 h-6 mb-2" />
                <span className="font-medium">Expenses Report</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Financial overview and spending analysis
                </p>
              </button>

              <button
                onClick={() => setReportType('inventory')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  reportType === 'inventory'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                }`}
              >
                <DocumentTextIcon className="w-6 h-6 mb-2" />
                <span className="font-medium">Inventory Status</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Current stock levels and valuations
                </p>
              </button>

              <button
                onClick={() => setReportType('requests')}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  reportType === 'requests'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <CalendarIcon className="w-6 h-6 mb-2" />
                <span className="font-medium">Requests Analysis</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Request trends and approval rates
                </p>
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Export Format
            </label>
            <div className="flex space-x-3">
              {[
                { value: 'pdf', label: 'PDF', description: 'Print-ready format' },
                { value: 'excel', label: 'EXCEL', description: 'HTML table format' },
                { value: 'csv', label: 'CSV', description: 'Spreadsheet data' }
              ].map((fmt) => (
                <button
                  key={fmt.value}
                  onClick={() => setFormat(fmt.value)}
                  className={`flex-1 p-3 rounded-lg border transition-all duration-200 ${
                    format === fmt.value
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="font-medium">{fmt.label}</div>
                  <div className={`text-xs mt-1 ${format === fmt.value ? 'text-blue-100' : 'text-gray-500'}`}>
                    {fmt.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Report Preview */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Report Preview</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Period:</span>
                <span className="font-medium">
                  {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Expenses:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(reportData.totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Approved Requests:</span>
                <span className="font-medium">{reportData.approvedRequests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Pending Requests:</span>
                <span className="font-medium text-yellow-600 dark:text-yellow-400">
                  {reportData.pendingRequests}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Reports include detailed analytics and data
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;