'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, FileDown, Calendar, DollarSign, TrendingUp, TrendingDown, X } from './icons';
import { parseFinancialDataFromText } from '@/lib/pdfParser';
import { storage } from '@/lib/storage';
import type { PipelineItem } from '@/types';

interface FinancialData {
  period: 'month' | 'quarter' | 'year';
  periodDate: string;
  income: {
    total: number;
    categories: Array<{ name: string; amount: number }>;
  };
  grossProfit: {
    total: number;
    margin: number; // percentage
  };
  expenses: {
    total: number;
    categories: Array<{ name: string; amount: number }>;
  };
  runRate?: {
    calculated: number; // Total Expenses / Days in Period
    manual?: number; // Manual override
    daysInPeriod: number;
  };
  receivables: Array<{
    client: string;
    amount: number;
    invoiceDate: string;
    dueDate: string;
    daysOutstanding: number;
    status: 'current' | '30-60' | '60-90' | '90+';
  }>;
}

// Helper function to calculate days in period
function getDaysInPeriod(period: 'month' | 'quarter' | 'year', date: string): number {
  const d = new Date(date);
  if (period === 'month') {
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  } else if (period === 'quarter') {
    return 90; // Approximate
  } else {
    return 365; // Could adjust for leap years
  }
}

// Helper function to calculate run rate
function calculateRunRate(expenses: number, period: 'month' | 'quarter' | 'year', date: string, manualOverride?: number) {
  const daysInPeriod = getDaysInPeriod(period, date);
  return {
    calculated: expenses / daysInPeriod,
    manual: manualOverride,
    daysInPeriod,
  };
}

export default function FinancialDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [periodDate, setPeriodDate] = useState(new Date().toISOString().split('T')[0]);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [showPDFUpload, setShowPDFUpload] = useState(false);
  const [pdfText, setPdfText] = useState('');
  const [loading, setLoading] = useState(false);

  const loadFinancialData = useCallback(async () => {
    try {
      const saved = await storage.getFinancialData(selectedPeriod, periodDate);
      if (saved) {
        setFinancialData(saved);
      }
    } catch (error) {
      // Silent fail - no data saved yet
    }
  }, [selectedPeriod, periodDate]);

  useEffect(() => {
    loadFinancialData();
  }, [loadFinancialData]);

  const saveFinancialData = async (data: FinancialData) => {
    try {
      // Calculate run rate if not already set
      if (!data.runRate) {
        data.runRate = calculateRunRate(data.expenses.total, selectedPeriod, periodDate);
      }
      
      await storage.saveFinancialData(selectedPeriod, periodDate, data);
      setFinancialData(data);
    } catch (error) {
      alert('Error saving financial data. Please try again.');
    }
  };

  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setLoading(true);
    setShowPDFUpload(true);
    
    try {
      // Use PDF.js to extract text from PDF
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source - use jsdelivr CDN (most reliable)
      // For version 4.4.168, use the correct path
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useSystemFonts: true,
        verbosity: 0,
      }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      setPdfText(fullText);
      
      // Automatically parse after extraction
      setTimeout(() => {
        handlePDFTextParse(fullText);
      }, 200);
    } catch (error) {
      
      // Fall back to manual text entry
      alert(
        'Automatic PDF reading failed. Please paste the PDF text manually.\n\n' +
        'To paste manually:\n' +
        '1. Open your PDF\n' +
        '2. Select All (Cmd/Ctrl+A)\n' +
        '3. Copy (Cmd/Ctrl+C)\n' +
        '4. Paste in the text area below'
      );
      setShowPDFUpload(true); // Keep modal open for manual paste
      setPdfText('');
      setLoading(false);
    } finally {
      if (!loading) {
        event.target.value = ''; // Reset input only if not loading
      }
    }
  };

  const handlePDFTextParse = (textOverride?: string) => {
    const textToParse = (textOverride || pdfText).trim();
    if (!textToParse) {
      alert('Please upload a PDF file or paste PDF text content');
      return;
    }

    setLoading(true);
    
    try {
      const financialData = parseFinancialReport(textToParse, {});
      
      saveFinancialData(financialData);
      setShowPDFUpload(false);
      setPdfText('');
      setLoading(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Error parsing PDF: ' + errorMessage + '\n\nPlease ensure the PDF format is correct and try again.');
      setLoading(false);
    }
  };

  const parseFinancialReport = (text: string, parsed: any): FinancialData => {
    // Parse income categories
    const incomeCategories = parseIncomeCategories(text);
    
    // Calculate total - exclude "Total Income" category from sum if it exists
    // The "Total Income" category is just for display, the actual total should come from the line
    const categoriesWithoutTotal = incomeCategories.filter(cat => cat.name !== 'Total Income');
    const incomeTotal = categoriesWithoutTotal.length > 0
      ? categoriesWithoutTotal.reduce((sum, cat) => sum + cat.amount, 0)
      : (incomeCategories.find(cat => cat.name === 'Total Income')?.amount || 0);
    
    // If we have a "Total Income" category, use its value as the total (it comes from the PDF line)
    // Don't sum categories if we have Total Income - use Total Income value instead
    const totalIncomeCategory = incomeCategories.find(cat => cat.name === 'Total Income');
    const finalIncomeTotal = totalIncomeCategory 
      ? totalIncomeCategory.amount  // Use Total Income from PDF line
      : incomeTotal;  // Otherwise sum the categories
    
    // Remove "Total Income" from categories list for display (to avoid showing it twice)
    // But keep individual categories for breakdown
    const categoriesForDisplay = incomeCategories.filter(cat => cat.name !== 'Total Income');

    // Parse expenses
    const expenseCategories = parseExpenseCategories(text);
    // Exclude "Total Expenses" from sum if it exists, use its value as the total
    const expenseCategoriesWithoutTotal = expenseCategories.filter(cat => cat.name !== 'Total Expenses');
    const expensesTotal = expenseCategoriesWithoutTotal.length > 0
      ? expenseCategoriesWithoutTotal.reduce((sum, cat) => sum + cat.amount, 0)
      : (expenseCategories.find(cat => cat.name === 'Total Expenses')?.amount || 0);
    
    // If we have a "Total Expenses" category, use its value
    const totalExpensesCategory = expenseCategories.find(cat => cat.name === 'Total Expenses');
    const finalExpensesTotal = totalExpensesCategory && totalExpensesCategory.amount > expensesTotal
      ? totalExpensesCategory.amount
      : expensesTotal;

    // Calculate gross profit (can be negative for losses)
    const grossProfit = incomeTotal - finalExpensesTotal;
    // Handle margin calculation for negative profits
    let grossProfitMargin = 0;
    if (finalIncomeTotal > 0) {
      grossProfitMargin = (grossProfit / finalIncomeTotal) * 100;
    } else if (finalIncomeTotal < 0 && grossProfit < 0) {
      // If both income and profit are negative, calculate margin based on expenses
      grossProfitMargin = finalExpensesTotal > 0 ? (grossProfit / finalExpensesTotal) * 100 : 0;
    }

    // Parse receivables
    const receivables = parseReceivables(text);

    return {
      period: selectedPeriod,
      periodDate,
      income: {
        total: finalIncomeTotal,  // Use the Total Income from PDF, not sum of categories
        categories: categoriesForDisplay,  // Show individual categories, not Total Income
      },
      grossProfit: {
        total: grossProfit,
        margin: grossProfitMargin,
      },
        expenses: {
          total: finalExpensesTotal,
          categories: expenseCategories,
        },
      receivables: receivables || [],
    };
  };

  const parseIncomeCategories = (text: string): Array<{ name: string; amount: number }> => {
    const categories: Array<{ name: string; amount: number }> = [];
    
    console.log('=== PARSING INCOME ===');
    console.log('Text length:', text.length);
    console.log('First 1000 chars:', text.substring(0, 1000));
    
    let totalIncomeFound = false;
    let totalIncomeAmount = 0;
    
    // STEP 1: Try to find "Total Income" in the continuous text
    // Format: "Total Income   34,040.00" (can be on same line as other content)
    const totalIncomePatterns = [
      /Total\s+Income\s+([\d,]+\.\d{2})/i,
      /Total\s+Income\.?\s+\$?\s*([\d,]+\.\d{2})/i,
    ];
    
    for (const pattern of totalIncomePatterns) {
      const match = text.match(pattern);
      if (match) {
        const amountStr = match[1]?.trim();
        if (amountStr) {
          const cleanAmount = amountStr.replace(/[\$,]/g, '');
          const amount = parseFloat(cleanAmount) || 0;
          const digitsOnly = cleanAmount.replace(/[^\d]/g, '');
          const isAccountNumber = digitsOnly.length === 4 && amount >= 1000 && amount < 10000;
          
          if (amount >= 1000 && !isAccountNumber) {
            totalIncomeAmount = amount;
            totalIncomeFound = true;
            break;
          }
        }
      }
    }
    
    // STEP 2: Parse individual income categories from continuous text
    // Format: "5120 Consulting Revenue   4,680.00  5130 Software Revenue   10,760.00  5150 Education/Training   18,600.00"
    // Pattern: AccountNumber CategoryName Amount (repeated)
    
    // Look for patterns like: "Consulting Revenue   4,680.00" or "Software Revenue   10,760.00"
    const categoryPattern = /(\d{4})\s+(Consulting|Software|Education\/Training|Education|Training|Services|Products|Other)\s+(?:Revenue|Income)?\s+([\d,]+\.\d{2})/gi;
    
    let match;
    const knownCategories: { [key: string]: string } = {
      'consulting': 'Consulting',
      'software': 'Software',
      'education/training': 'Education/Training',
      'education': 'Education/Training',
      'training': 'Education/Training',
      'services': 'Services',
      'products': 'Products',
      'other': 'Other',
    };
    
    while ((match = categoryPattern.exec(text)) !== null) {
      const accountNumber = match[1];
      const categoryName = match[2]?.trim();
      const amountStr = match[3]?.trim();
      
      // Skip account numbers that look like amounts (4-digit numbers 1000-9999)
      const accountNum = parseInt(accountNumber);
      if (accountNum >= 1000 && accountNum < 10000) {
        // This is a real account number, continue
        if (amountStr) {
          const cleanAmount = amountStr.replace(/[\$,]/g, '');
          const amount = parseFloat(cleanAmount) || 0;
          
          if (amount >= 100) {
            // Normalize category name
            let displayName = categoryName.toLowerCase();
            
            // Handle Education/Training
            if (displayName.includes('education') || displayName.includes('training')) {
              displayName = 'Education/Training';
            } else {
              // Capitalize first letter
              displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase();
            }
            
            // Check for duplicates
            const existingIndex = categories.findIndex(cat => 
              cat.name.toLowerCase() === displayName.toLowerCase()
            );
            
            if (existingIndex < 0) {
              console.log('✓ Found income category:', displayName, '→ Amount:', amount);
              categories.push({
                name: displayName,
                amount: amount,
              });
            }
          }
        }
      }
    }
    
    // Also try a simpler pattern without account numbers: "Consulting Revenue   4,680.00"
    const simplePattern = /(Consulting|Software|Education\/Training|Education|Training)\s+(?:Revenue|Income)?\s+([\d,]+\.\d{2})/gi;
    while ((match = simplePattern.exec(text)) !== null) {
      const categoryName = match[1]?.trim();
      const amountStr = match[2]?.trim();
      
      if (amountStr && !text.substring(Math.max(0, match.index - 10), match.index).match(/\d{4}\s+$/)) {
        // Make sure this isn't preceded by an account number
        const cleanAmount = amountStr.replace(/[\$,]/g, '');
        const amount = parseFloat(cleanAmount) || 0;
        
        if (amount >= 100) {
          let displayName = categoryName.toLowerCase();
          if (displayName.includes('education') || displayName.includes('training')) {
            displayName = 'Education/Training';
          } else {
            displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1).toLowerCase();
          }
          
          const existingIndex = categories.findIndex(cat => 
            cat.name.toLowerCase() === displayName.toLowerCase()
          );
          
          if (existingIndex < 0) {
            console.log('✓ Found income category (simple):', displayName, '→ Amount:', amount);
            categories.push({
              name: displayName,
              amount: amount,
            });
          }
        }
      }
    }
    
    // STEP 3: If we found Total Income, add it as a category for display
    // The parseFinancialReport will use this value as the total (not sum categories)
    if (totalIncomeFound && totalIncomeAmount > 0) {
      console.log('✓ Using Total Income from line:', totalIncomeAmount);
      // Add Total Income as a category - parseFinancialReport will use it as the total
      categories.push({
        name: 'Total Income',
        amount: totalIncomeAmount,
      });
    } else if (categories.length > 0) {
      // Sum categories and add as Total Income
      const calculatedTotal = categories.reduce((sum, cat) => sum + cat.amount, 0);
      console.log('✓ Calculated Total Income from categories:', calculatedTotal);
      categories.push({
        name: 'Total Income',
        amount: calculatedTotal,
      });
    } else {
      console.warn('✗ Could not find Total Income or income categories');
    }
    
    console.log('Final income categories:', categories);
    return categories;
  };

  const parseExpenseCategories = (text: string): Array<{ name: string; amount: number }> => {
    const categories: Array<{ name: string; amount: number }> = [];
    
    console.log('=== PARSING EXPENSES ===');
    
    // FIRST: Look for "Total Expenses" in continuous text (like income)
    // Format: "Total Expenses   60,675.29" (can be on same line as other content)
    const totalExpensePatterns = [
      /Total\s+Expenses?\s+([\d,]+\.\d{2})/i,
      /Total\s+Expenses?\.?\s+\$?\s*([\d,]+\.\d{2})/i,
    ];
    
    let totalExpenseFound = false;
    let totalExpenseAmount = 0;
    
    for (const pattern of totalExpensePatterns) {
      const match = text.match(pattern);
      if (match) {
        const amountStr = match[1]?.trim();
        if (amountStr) {
          const cleanAmount = amountStr.replace(/[\$,]/g, '');
          const amount = parseFloat(cleanAmount) || 0;
          const digitsOnly = cleanAmount.replace(/[^\d]/g, '');
          const isAccountNumber = digitsOnly.length === 4 && amount >= 1000 && amount < 10000;
          
          if (amount >= 1000 && !isAccountNumber) {
            totalExpenseAmount = amount;
            totalExpenseFound = true;
            console.log('✓ Found Total Expenses:', amount);
            break;
          }
        }
      }
    }
    
    if (totalExpenseFound && totalExpenseAmount > 0) {
      categories.push({
        name: 'Total Expenses',
        amount: totalExpenseAmount,
      });
      console.log('Final expense categories:', categories);
      return categories;
    }
    
    if (!totalExpenseFound) {
      console.warn('⚠ Could not find "Total Expenses" in PDF text');
    }
    
    // FALLBACK: If no "Total Expenses" found, try to parse individual expense categories
    const expenseSection = text.match(/expenses?|costs?/i)?.[0];
    if (expenseSection) {
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.match(/expense|cost|operating/i) && !line.match(/total|gross|net/i)) {
          // Handle both positive and negative amounts
          const amountMatch = line.match(/\$?\s*([\(-]?[\d,]+\.?\d*\)?)/);
          if (amountMatch) {
            let amountStr = amountMatch[1].trim();
            let isNegative = false;
            if (amountStr.startsWith('(') && amountStr.endsWith(')')) {
              amountStr = amountStr.slice(1, -1);
              isNegative = true;
            } else if (amountStr.startsWith('-')) {
              isNegative = true;
              amountStr = amountStr.slice(1);
            }
            const amount = parseFloat(amountStr.replace(/,/g, '')) || 0;
            const finalAmount = isNegative ? -amount : amount;
            
            const categoryName = line.replace(/\$?\s*[\(-]?[\d,]+\.?\d*\)?/g, '').trim();
            if (categoryName && categoryName.length < 50) {
              categories.push({
                name: categoryName,
                amount: finalAmount,
              });
            }
          }
        }
      }
    }

    return categories;
  };

  const parseReceivables = (text: string): FinancialData['receivables'] => {
    const receivables: FinancialData['receivables'] = [];
    
    // Extract "As of" date from the report (e.g., "As of November 3, 2025")
    const asOfMatch = text.match(/as\s+of\s+([a-z]+)\s+(\d{1,2}),\s+(\d{4})/i);
    let reportDate: Date;
    if (asOfMatch) {
      const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                         'july', 'august', 'september', 'october', 'november', 'december'];
      const month = monthNames.findIndex(m => m.toLowerCase() === asOfMatch[1].toLowerCase());
      const day = parseInt(asOfMatch[2]);
      const year = parseInt(asOfMatch[3]);
      reportDate = new Date(year, month, day);
    } else {
      // Fallback to period end date
      reportDate = new Date(periodDate);
      if (selectedPeriod === 'month') {
        reportDate.setMonth(reportDate.getMonth() + 1);
        reportDate.setDate(0); // Last day of the month
      } else if (selectedPeriod === 'quarter') {
        const quarter = Math.floor(reportDate.getMonth() / 3);
        reportDate.setMonth((quarter + 1) * 3, 0); // Last day of quarter
      } else if (selectedPeriod === 'year') {
        reportDate.setMonth(11, 31); // Last day of year
      }
    }
    
    console.log('=== PARSING RECEIVABLES ===');
    
    // Parse A/R Aging Detail format from continuous text
    // Look for invoice patterns: Date Invoice Num Customer Due Date Amount
    // Format: "01/01/2025 Invoice 1258 Arlen Runolfson 01/01/2025 600.00 600.00"
    
    // Helper function to parse dates
    const parseDate = (dateStr: string): Date => {
      const parts = dateStr.split(/[\/\-]/);
      if (parts.length === 3) {
        const month = parseInt(parts[0]) - 1;
        const day = parseInt(parts[1]);
        const year = parts[2].length === 2 ? 2000 + parseInt(parts[2]) : parseInt(parts[2]);
        return new Date(year, month, day);
      }
      return new Date(dateStr);
    };
    
    // Search for invoice patterns in continuous text using regex with global flag
    // Pattern: Date Invoice Num Customer Due Date Amount
    const invoicePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+invoice\s+(\d+)\s+(.+?)\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+([\d,]+\.?\d{2})\s+([\d,]+\.?\d{2})/gi;
    
    let match;
    while ((match = invoicePattern.exec(text)) !== null) {
      const invoiceDateStr = match[1];
      const invoiceNum = match[2];
      const customer = match[3]?.trim();
      const dueDateStr = match[4];
      const amountStr = match[5];
      
      if (customer && amountStr) {
        const invoiceDate = parseDate(invoiceDateStr);
        const dueDate = parseDate(dueDateStr);
        const amount = parseFloat(amountStr.replace(/,/g, ''));
        
        // Calculate days outstanding from due date to report date
        const daysOutstanding = Math.floor((reportDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Determine status based on days outstanding
        let status: 'current' | '30-60' | '60-90' | '90+' = 'current';
        if (daysOutstanding > 90) status = '90+';
        else if (daysOutstanding > 60) status = '60-90';
        else if (daysOutstanding > 30) status = '30-60';
        else if (daysOutstanding <= 0) status = 'current';
        
        // Clean up customer name (remove extra whitespace)
        const cleanCustomer = customer.trim().replace(/\s+/g, ' ');
        
        receivables.push({
          client: cleanCustomer || 'Unknown Client',
          amount,
          invoiceDate: invoiceDate.toISOString().split('T')[0],
          dueDate: dueDate.toISOString().split('T')[0],
          daysOutstanding: Math.max(0, daysOutstanding),
          status,
        });
        
        console.log('✓ Found receivable:', cleanCustomer, '→ Amount:', amount, 'Days:', daysOutstanding);
      }
    }
    
    // Also try a simpler pattern if the above didn't work
    if (receivables.length === 0) {
      console.log('Trying alternative receivables pattern...');
      const altPattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+invoice\s+\d+\s+([A-Za-z\s,\.:]+?)\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+([\d,]+\.?\d{2})/gi;
      let altMatch;
      while ((altMatch = altPattern.exec(text)) !== null) {
        const invoiceDateStr = altMatch[1];
        const customer = altMatch[2]?.trim();
        const dueDateStr = altMatch[3];
        const amountStr = altMatch[4];
        
        if (customer && amountStr && customer.length < 200) {  // Sanity check for customer name
          const invoiceDate = parseDate(invoiceDateStr);
          const dueDate = parseDate(dueDateStr);
          const amount = parseFloat(amountStr.replace(/,/g, ''));
          
          if (amount > 0) {
            const daysOutstanding = Math.floor((reportDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            
            let status: 'current' | '30-60' | '60-90' | '90+' = 'current';
            if (daysOutstanding > 90) status = '90+';
            else if (daysOutstanding > 60) status = '60-90';
            else if (daysOutstanding > 30) status = '30-60';
            else if (daysOutstanding <= 0) status = 'current';
            
            receivables.push({
              client: customer.replace(/\s+/g, ' '),
              amount,
              invoiceDate: invoiceDate.toISOString().split('T')[0],
              dueDate: dueDate.toISOString().split('T')[0],
              daysOutstanding: Math.max(0, daysOutstanding),
              status,
            });
          }
        }
      }
    }
    
    console.log('Total receivables found:', receivables.length);
    return receivables;
  };

  const getPeriodLabel = () => {
    const date = new Date(periodDate);
    switch (selectedPeriod) {
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
      case 'year':
        return date.getFullYear().toString();
      default:
        return periodDate;
    }
  };

  const getPreviousPeriod = () => {
    const date = new Date(periodDate);
    switch (selectedPeriod) {
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'quarter':
        date.setMonth(date.getMonth() - 3);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() - 1);
        break;
    }
    setPeriodDate(date.toISOString().split('T')[0]);
  };

  const getNextPeriod = () => {
    const date = new Date(periodDate);
    switch (selectedPeriod) {
      case 'month':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarter':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    setPeriodDate(date.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Dashboard</h1>
              <p className="text-gray-600">View income, expenses, and receivables by period</p>
            </div>
            <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">
              <Upload size={16} /> Upload PDF Report
              <input
                type="file"
                accept=".pdf"
                onChange={handlePDFUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Period Selector */}
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPeriod('month')}
                className={`px-4 py-2 rounded-lg ${selectedPeriod === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Month
              </button>
              <button
                onClick={() => setSelectedPeriod('quarter')}
                className={`px-4 py-2 rounded-lg ${selectedPeriod === 'quarter' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Quarter
              </button>
              <button
                onClick={() => setSelectedPeriod('year')}
                className={`px-4 py-2 rounded-lg ${selectedPeriod === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                Year
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={getPreviousPeriod}
                className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                ←
              </button>
              <input
                type="date"
                value={periodDate}
                onChange={(e) => setPeriodDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={getNextPeriod}
                className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                →
              </button>
              <span className="ml-4 font-semibold">{getPeriodLabel()}</span>
            </div>
          </div>
        </div>

        {/* PDF Upload Modal */}
        {showPDFUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Upload Financial Report</h2>
                  <button
                    onClick={() => {
                      setShowPDFUpload(false);
                      setPdfText('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Upload PDF File:
                  </label>
                  <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer w-fit mb-4">
                    <Upload size={16} /> Choose PDF File
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePDFUpload}
                      className="hidden"
                      disabled={loading}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mb-4">
                    Or paste PDF text content below if automatic extraction doesn't work
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Paste PDF Text Content:
                  </label>
                  <textarea
                    value={pdfText}
                    onChange={(e) => setPdfText(e.target.value)}
                    placeholder="Paste PDF text content here...&#10;&#10;The system will extract:&#10;- Income categories&#10;- Total expenses&#10;- Accounts Receivable with aging"
                    className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm text-gray-900 placeholder-gray-500"
                  />
                </div>

                {loading && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">Extracting text from PDF...</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                    <button
                      onClick={() => handlePDFTextParse()}
                      disabled={!pdfText.trim() || loading}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                      !pdfText.trim() || loading
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {loading ? 'Processing...' : pdfText.trim() ? 'Parse & Import' : 'Upload PDF First'}
                  </button>
                  <button
                    onClick={() => {
                      setShowPDFUpload(false);
                      setPdfText('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {financialData ? (
          <>
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {/* Gross Revenue */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-700">Gross Revenue</h3>
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <p className={`text-3xl font-bold ${financialData.income.total >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                  {financialData.income.total >= 0 ? '$' : '-$'}
                  {Math.abs(financialData.income.total).toLocaleString()}
                </p>
                {financialData.income.categories.length > 0 && (
                  <div className="mt-4 space-y-1">
                    {financialData.income.categories.slice(0, 3).map((cat, idx) => (
                      <div key={idx} className={`text-sm ${cat.amount >= 0 ? 'text-gray-600' : 'text-red-600'}`}>
                        {cat.name}: {cat.amount >= 0 ? '$' : '-$'}
                        {Math.abs(cat.amount).toLocaleString()}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Expenses */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-700">Total Expenses</h3>
                  <TrendingDown className="text-red-600" size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${financialData.expenses.total.toLocaleString()}
                </p>
                {financialData.runRate && (
                  <p className="text-sm text-gray-600 mt-2">
                    Run Rate: <span className="font-semibold">${(financialData.runRate.manual ?? financialData.runRate.calculated).toFixed(2)}/day</span>
                    {financialData.runRate.manual && <span className="text-xs text-blue-600"> (manual)</span>}
                  </p>
                )}
                {financialData.expenses.categories.length > 0 && (
                  <div className="mt-4 space-y-1">
                    {financialData.expenses.categories.slice(0, 3).map((cat, idx) => (
                      <div key={idx} className={`text-sm ${cat.amount >= 0 ? 'text-gray-600' : 'text-green-600'}`}>
                        {cat.name}: {cat.amount >= 0 ? '$' : '-$'}
                        {Math.abs(cat.amount).toLocaleString()}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Net Income */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-700">Net Income</h3>
                  {(financialData.income.total - financialData.expenses.total) >= 0 ? (
                    <TrendingUp className="text-green-600" size={24} />
                  ) : (
                    <TrendingDown className="text-red-600" size={24} />
                  )}
                </div>
                <p className={`text-3xl font-bold ${(financialData.income.total - financialData.expenses.total) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(financialData.income.total - financialData.expenses.total) >= 0 ? '$' : '-$'}
                  {Math.abs(financialData.income.total - financialData.expenses.total).toLocaleString()}
                </p>
                <p className={`text-sm mt-2 ${(financialData.income.total - financialData.expenses.total) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Margin: {financialData.income.total !== 0 ? ((financialData.income.total - financialData.expenses.total) / financialData.income.total * 100).toFixed(1) : '0.0'}%
                </p>
              </div>

              {/* Accounts Receivable Total */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-700">Accounts Receivable</h3>
                  <DollarSign className="text-purple-600" size={24} />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  $
                  {financialData.receivables
                    .reduce((sum, rec) => sum + rec.amount, 0)
                    .toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  {financialData.receivables.length} {financialData.receivables.length === 1 ? 'invoice' : 'invoices'}
                </p>
              </div>
            </div>

            {/* Accounts Receivable Aging Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Accounts Receivable Aging Summary - {getPeriodLabel()}
              </h2>
              {financialData.receivables && financialData.receivables.length > 0 ? (() => {
                const aging = {
                  '1-30': { count: 0, total: 0 },
                  '31-60': { count: 0, total: 0 },
                  '61-90': { count: 0, total: 0 },
                  '90+': { count: 0, total: 0 },
                };

                financialData.receivables.forEach((rec) => {
                  if (rec.daysOutstanding <= 30) {
                    aging['1-30'].count++;
                    aging['1-30'].total += rec.amount;
                  } else if (rec.daysOutstanding <= 60) {
                    aging['31-60'].count++;
                    aging['31-60'].total += rec.amount;
                  } else if (rec.daysOutstanding <= 90) {
                    aging['61-90'].count++;
                    aging['61-90'].total += rec.amount;
                  } else {
                    aging['90+'].count++;
                    aging['90+'].total += rec.amount;
                  }
                });

                const grandTotal = Object.values(aging).reduce((sum, bucket) => sum + bucket.total, 0);
                const grandCount = Object.values(aging).reduce((sum, bucket) => sum + bucket.count, 0);

                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      {/* 1-30 Days */}
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h3 className="text-sm font-semibold text-green-800 mb-2">1-30 Days</h3>
                        <p className="text-2xl font-bold text-green-900">
                          ${aging['1-30'].total.toLocaleString()}
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          {aging['1-30'].count} {aging['1-30'].count === 1 ? 'invoice' : 'invoices'}
                        </p>
                      </div>

                      {/* 31-60 Days */}
                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <h3 className="text-sm font-semibold text-yellow-800 mb-2">31-60 Days</h3>
                        <p className="text-2xl font-bold text-yellow-900">
                          ${aging['31-60'].total.toLocaleString()}
                        </p>
                        <p className="text-sm text-yellow-700 mt-1">
                          {aging['31-60'].count} {aging['31-60'].count === 1 ? 'invoice' : 'invoices'}
                        </p>
                      </div>

                      {/* 61-90 Days */}
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <h3 className="text-sm font-semibold text-orange-800 mb-2">61-90 Days</h3>
                        <p className="text-2xl font-bold text-orange-900">
                          ${aging['61-90'].total.toLocaleString()}
                        </p>
                        <p className="text-sm text-orange-700 mt-1">
                          {aging['61-90'].count} {aging['61-90'].count === 1 ? 'invoice' : 'invoices'}
                        </p>
                      </div>

                      {/* 90+ Days */}
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <h3 className="text-sm font-semibold text-red-800 mb-2">90+ Days</h3>
                        <p className="text-2xl font-bold text-red-900">
                          ${aging['90+'].total.toLocaleString()}
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                          {aging['90+'].count} {aging['90+'].count === 1 ? 'invoice' : 'invoices'}
                        </p>
                      </div>
                    </div>

                    {/* Grand Total */}
                    <div className="bg-gray-50 rounded-lg p-4 border-t-2 border-gray-300">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">Total Accounts Receivable</h3>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-gray-900">
                            ${grandTotal.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {grandCount} total {grandCount === 1 ? 'invoice' : 'invoices'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })() : (
                <div className="text-center py-8 text-gray-500">
                  <p>No receivables data for this period.</p>
                  <p className="text-sm mt-2">Upload a PDF report to import receivables data.</p>
                </div>
              )}
            </div>

            {/* Income Categories */}
            {financialData.income.categories.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Income by Category</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                          {financialData.income.categories.map((cat, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                              <td className={`px-4 py-3 font-semibold ${cat.amount >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                                {cat.amount >= 0 ? '$' : '-$'}
                                {Math.abs(cat.amount).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {Math.abs(financialData.income.total) > 0
                                  ? ((cat.amount / Math.abs(financialData.income.total)) * 100).toFixed(1)
                                  : 0}%
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Expenses Categories */}
            {financialData.expenses.categories.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Expenses by Category</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">% of Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                          {financialData.expenses.categories.map((cat, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                              <td className={`px-4 py-3 font-semibold ${cat.amount >= 0 ? 'text-gray-900' : 'text-green-600'}`}>
                                {cat.amount >= 0 ? '$' : '-$'}
                                {Math.abs(cat.amount).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {Math.abs(financialData.expenses.total) > 0
                                  ? ((cat.amount / Math.abs(financialData.expenses.total)) * 100).toFixed(1)
                                  : 0}%
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Detailed Receivables Table */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Detailed Receivables</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Outstanding</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {financialData.receivables && financialData.receivables.length > 0 ? (
                      financialData.receivables.map((rec, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{rec.client}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            ${rec.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {new Date(rec.invoiceDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-gray-900">
                            {new Date(rec.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">{rec.daysOutstanding}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-medium ${
                                rec.status === 'current' || rec.daysOutstanding <= 30
                                  ? 'bg-green-100 text-green-800'
                                  : rec.status === '30-60' || (rec.daysOutstanding > 30 && rec.daysOutstanding <= 60)
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : rec.status === '60-90' || (rec.daysOutstanding > 60 && rec.daysOutstanding <= 90)
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {rec.daysOutstanding <= 30
                                ? '1-30 days'
                                : rec.daysOutstanding <= 60
                                ? '31-60 days'
                                : rec.daysOutstanding <= 90
                                ? '61-90 days'
                                : '90+ days'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          <p className="mb-2">No receivables data found for this period.</p>
                          <p className="text-sm">Upload a PDF report to import receivables data.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileDown className="mx-auto text-gray-400 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Financial Data</h2>
            <p className="text-gray-600 mb-6">
              Upload a PDF financial report to get started
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">
              <Upload size={16} /> Upload PDF Report
              <input
                type="file"
                accept=".pdf"
                onChange={handlePDFUpload}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}

