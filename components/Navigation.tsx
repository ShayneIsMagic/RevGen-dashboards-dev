'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileDown, Download, Upload } from './icons';

interface NavigationProps {
  onExportJSON?: () => void;
  onExportMarkdown?: () => void;
  onImportJSON?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUploadPDF?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  showFinancialActions?: boolean;
}

export default function Navigation({
  onExportJSON,
  onExportMarkdown,
  onImportJSON,
  onUploadPDF,
  showFinancialActions = false,
}: NavigationProps) {
  const pathname = usePathname();
  const isFinancial = pathname === '/financial' || pathname === '/financial/';

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Zero Barriers Branding */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ZB</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Zero Barriers</h1>
          </div>

          {/* Dashboard Navigation */}
          <div className="flex gap-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !isFinancial
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              📊 Pipeline Manager
            </Link>
            <Link
              href="/financial"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isFinancial
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              💰 Financial Dashboard
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          {showFinancialActions ? (
            <>
              {onUploadPDF && (
                <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors">
                  <Upload size={16} /> Upload PDF
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={onUploadPDF}
                    className="hidden"
                  />
                </label>
              )}
            </>
          ) : (
            <>
              {onExportJSON && (
                <button
                  onClick={onExportJSON}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Export all data as JSON"
                >
                  <Download size={16} /> Export
                </button>
              )}
              {onImportJSON && (
                <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors">
                  <Upload size={16} /> Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={onImportJSON}
                    className="hidden"
                  />
                </label>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

