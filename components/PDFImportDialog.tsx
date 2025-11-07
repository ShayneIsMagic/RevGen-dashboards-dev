'use client';

import { useState } from 'react';
import { Upload, X } from './icons';
import { parseFinancialDataFromText, createGoalsFromFinancialData, type FinancialData } from '@/lib/pdfParser';
import type { Goal } from '@/types';

interface PDFImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (goals: Partial<Goal>[]) => void;
}

export default function PDFImportDialog({ isOpen, onClose, onImport }: PDFImportDialogProps) {
  const [pdfText, setPdfText] = useState('');
  const [parsedData, setParsedData] = useState<Partial<FinancialData> | null>(null);
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setError('');
    
    // For now, we'll ask user to paste text from PDF
    // In production, you'd use a library like pdf.js or pdf-lib
    alert(
      'PDF text extraction requires additional setup.\n\n' +
      'For now, please:\n' +
      '1. Open the PDF\n' +
      '2. Select All (Cmd/Ctrl+A)\n' +
      '3. Copy the text\n' +
      '4. Paste it in the text area below'
    );
  };

  const handleTextPaste = (text: string) => {
    setPdfText(text);
    try {
      const data = parseFinancialDataFromText(text);
      setParsedData(data);
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError('Error parsing data: ' + errorMessage);
    }
  };

  const handleImport = () => {
    if (!parsedData || !targetDate) {
      setError('Please set target date and ensure data is parsed');
      return;
    }

    const goals = createGoalsFromFinancialData(
      {
        ...parsedData,
        period,
        date: new Date().toISOString(),
      } as FinancialData,
      period,
      targetDate
    );

    onImport(goals);
    onClose();
    // Reset form
    setPdfText('');
    setParsedData(null);
    setTargetDate('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Import from PDF Report</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Step 1: Upload PDF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1: Upload PDF or Paste Text
            </label>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer w-fit">
              <Upload size={16} /> Upload PDF
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Or paste text extracted from PDF below
            </p>
          </div>

          {/* Step 2: Paste Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2: Paste PDF Text Here
            </label>
            <textarea
              value={pdfText}
              onChange={(e) => handleTextPaste(e.target.value)}
              placeholder="Paste the text content from your PDF report here..."
              className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
            />
          </div>

          {/* Parsed Data Preview */}
          {parsedData && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Extracted Data:</h3>
              <div className="space-y-2 text-sm">
                {parsedData.accountsReceivable && (
                  <div>
                    <span className="font-medium">Accounts Receivable:</span>{' '}
                    ${parsedData.accountsReceivable.toLocaleString()}
                  </div>
                )}
                {parsedData.mrr && (
                  <div>
                    <span className="font-medium">MRR:</span> ${parsedData.mrr.toLocaleString()}
                  </div>
                )}
                {parsedData.agingReceivables && (
                  <div>
                    <span className="font-medium">Aging Receivables:</span>
                    <ul className="ml-4 mt-1">
                      <li>0-30 days: ${parsedData.agingReceivables.days30?.toLocaleString() || 0}</li>
                      <li>31-60 days: ${parsedData.agingReceivables.days60?.toLocaleString() || 0}</li>
                      <li>61-90 days: ${parsedData.agingReceivables.days90?.toLocaleString() || 0}</li>
                      <li>90+ days: ${parsedData.agingReceivables.days90Plus?.toLocaleString() || 0}</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Configure Goals */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period Type
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as 'monthly' | 'quarterly' | 'annual')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Import Button */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={handleImport}
              disabled={!parsedData || !targetDate}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Import Goals
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

