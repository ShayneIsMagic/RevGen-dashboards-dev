/**
 * PDF Financial Data Parser
 * Extracts Accounts Receivable, MRR, and Aging Receivables from PDF reports
 */

export interface FinancialData {
  accountsReceivable: number;
  mrr: number;
  agingReceivables?: {
    current: number;
    days30: number;
    days60: number;
    days90: number;
    days90Plus: number;
  };
  date: string;
  period: 'monthly' | 'quarterly' | 'annual';
}

/**
 * Parse text extracted from PDF
 * This function expects the PDF to be converted to text first
 */
export function parseFinancialDataFromText(text: string): Partial<FinancialData> {
  const data: Partial<FinancialData> = {};

  // Common patterns for financial data
  const patterns = {
    accountsReceivable: [
      /accounts?\s*receivable[:\s]*\$?([\d,]+\.?\d*)/i,
      /AR[:\s]*\$?([\d,]+\.?\d*)/i,
      /receivables[:\s]*\$?([\d,]+\.?\d*)/i,
    ],
    mrr: [
      /MRR[:\s]*\$?([\d,]+\.?\d*)/i,
      /monthly\s*recurring\s*revenue[:\s]*\$?([\d,]+\.?\d*)/i,
      /recurring\s*revenue[:\s]*\$?([\d,]+\.?\d*)/i,
    ],
    aging30: [
      /0-30\s*days?[:\s]*\$?([\d,]+\.?\d*)/i,
      /current[:\s]*\$?([\d,]+\.?\d*)/i,
    ],
    aging60: [
      /31-60\s*days?[:\s]*\$?([\d,]+\.?\d*)/i,
      /60\s*days?[:\s]*\$?([\d,]+\.?\d*)/i,
    ],
    aging90: [
      /61-90\s*days?[:\s]*\$?([\d,]+\.?\d*)/i,
      /90\s*days?[:\s]*\$?([\d,]+\.?\d*)/i,
    ],
    aging90Plus: [
      /90\+\s*days?[:\s]*\$?([\d,]+\.?\d*)/i,
      /over\s*90[:\s]*\$?([\d,]+\.?\d*)/i,
    ],
  };

  // Extract Accounts Receivable
  for (const pattern of patterns.accountsReceivable) {
    const match = text.match(pattern);
    if (match) {
      data.accountsReceivable = parseCurrency(match[1]);
      break;
    }
  }

  // Extract MRR
  for (const pattern of patterns.mrr) {
    const match = text.match(pattern);
    if (match) {
      data.mrr = parseCurrency(match[1]);
      break;
    }
  }

  // Extract Aging Receivables
  const aging: FinancialData['agingReceivables'] = {
    current: 0,
    days30: 0,
    days60: 0,
    days90: 0,
    days90Plus: 0,
  };

  for (const pattern of patterns.aging30) {
    const match = text.match(pattern);
    if (match) {
      aging.days30 = parseCurrency(match[1]);
      break;
    }
  }

  for (const pattern of patterns.aging60) {
    const match = text.match(pattern);
    if (match) {
      aging.days60 = parseCurrency(match[1]);
      break;
    }
  }

  for (const pattern of patterns.aging90) {
    const match = text.match(pattern);
    if (match) {
      aging.days90 = parseCurrency(match[1]);
      break;
    }
  }

  for (const pattern of patterns.aging90Plus) {
    const match = text.match(pattern);
    if (match) {
      aging.days90Plus = parseCurrency(match[1]);
      break;
    }
  }

  if (aging.days30 || aging.days60 || aging.days90 || aging.days90Plus) {
    data.agingReceivables = aging;
  }

  return data;
}

/**
 * Parse currency string to number
 */
function parseCurrency(value: string): number {
  return parseFloat(value.replace(/,/g, '')) || 0;
}

/**
 * Create goals from financial data
 */
export function createGoalsFromFinancialData(
  data: FinancialData,
  period: 'monthly' | 'quarterly' | 'annual',
  targetDate: string
): Array<{
  name: string;
  category: 'Revenue' | 'MRR' | 'Cash Flow' | 'Custom';
  startingValue: number;
  currentValue: number;
  targetValue: number;
  targetDate: string;
  unit: string;
}> {
  const goals = [];
  const today = new Date().toISOString().split('T')[0];

  // Calculate target values (example: 10% growth)
  const arTarget = data.accountsReceivable * 1.1;
  const mrrTarget = data.mrr * 1.1;

  // Accounts Receivable Goal
  if (data.accountsReceivable) {
    goals.push({
      name: `${period === 'monthly' ? 'Monthly' : period === 'quarterly' ? 'Quarterly' : 'Annual'} Accounts Receivable`,
      category: 'Cash Flow' as const,
      startingValue: data.accountsReceivable,
      currentValue: data.accountsReceivable, // Will be updated manually
      targetValue: arTarget,
      targetDate,
      unit: '$',
    });
  }

  // MRR Goal
  if (data.mrr) {
    goals.push({
      name: `${period === 'monthly' ? 'Monthly' : period === 'quarterly' ? 'Quarterly' : 'Annual'} MRR`,
      category: 'MRR' as const,
      startingValue: data.mrr,
      currentValue: data.mrr, // Will be updated manually
      targetValue: mrrTarget,
      targetDate,
      unit: '$',
    });
  }

  // Aging Receivables Goals
  if (data.agingReceivables) {
    const totalAging = 
      data.agingReceivables.days30 +
      data.agingReceivables.days60 +
      data.agingReceivables.days90 +
      data.agingReceivables.days90Plus;

    if (totalAging > 0) {
      goals.push({
        name: 'Reduce 90+ Day Aging Receivables',
        category: 'Custom' as const,
        startingValue: data.agingReceivables.days90Plus,
        currentValue: data.agingReceivables.days90Plus,
        targetValue: data.agingReceivables.days90Plus * 0.5, // 50% reduction
        targetDate,
        unit: '$',
      });
    }
  }

  return goals;
}

