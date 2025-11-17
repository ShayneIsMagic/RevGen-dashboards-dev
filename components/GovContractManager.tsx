'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useGovContracts } from '@/hooks/useLocalForage';
import { storage } from '@/lib/storage';
import { parseBidMatchJSON, isBidMatchFormat } from '@/lib/bidMatchParser';
import type { GovContractItem, GovContractType } from '@/types';
import { Download, Plus, AlertCircle, Upload, FileDown, Trash } from './icons';

const opportunityTypes: Array<'Federal' | 'State' | 'Local' | 'Emergency'> = ['Federal', 'State', 'Local', 'Emergency'];
const priorityLevels: Array<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'> = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const statusOptions: Array<'new' | 'registered' | 'reviewing' | 'preparing' | 'submitted' | 'awarded' | 'declined' | 'lost'> = 
  ['new', 'registered', 'reviewing', 'preparing', 'submitted', 'awarded', 'declined', 'lost'];

export default function GovContractManager() {
  const { contracts, setContracts, loading } = useGovContracts();
  const [currentView, setCurrentView] = useState<GovContractType>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  const [newContract, setNewContract] = useState<Partial<GovContractItem>>({
    opportunityNumber: '',
    title: '',
    agency: '',
    opportunityType: 'Federal',
    portalUrl: '',
    solicitationNumber: '',
    status: 'new',
    priority: 'MEDIUM',
    capabilityMatch: 50,
    estimatedValue: 0,
    estimatedValueMax: undefined,
    dueDate: '',
    releaseDate: '',
    prebidDate: '',
    prebidLocation: '',
    qaDeadline: '',
    naicsCode: '',
    setState: '',
    registrationRequired: false,
    registrationStatus: 'not_started',
    portalRegistrationUrl: '',
    teamingRequired: false,
    teamingPartners: [],
    technicalRequirements: '',
    certifications: [],
    notes: '',
    actionItems: [],
    documents: [],
    interactions: [],
  });

  // Add Contract
  const addContract = async () => {
    if (!newContract.title || !newContract.agency || !newContract.opportunityNumber) {
      alert('Please fill in required fields: Opportunity Number, Title, and Agency');
      return;
    }

    const contract: GovContractItem = {
      id: Date.now(),
      opportunityNumber: newContract.opportunityNumber!,
      title: newContract.title!,
      agency: newContract.agency!,
      opportunityType: newContract.opportunityType || 'Federal',
      portalUrl: newContract.portalUrl,
      solicitationNumber: newContract.solicitationNumber,
      status: newContract.status || 'new',
      priority: newContract.priority || 'MEDIUM',
      capabilityMatch: newContract.capabilityMatch || 50,
      estimatedValue: newContract.estimatedValue || 0,
      estimatedValueMax: newContract.estimatedValueMax,
      dueDate: newContract.dueDate,
      releaseDate: newContract.releaseDate,
      prebidDate: newContract.prebidDate,
      prebidLocation: newContract.prebidLocation,
      qaDeadline: newContract.qaDeadline,
      naicsCode: newContract.naicsCode,
      setState: newContract.setState,
      registrationRequired: newContract.registrationRequired || false,
      registrationStatus: newContract.registrationStatus || 'not_started',
      portalRegistrationUrl: newContract.portalRegistrationUrl,
      teamingRequired: newContract.teamingRequired || false,
      teamingPartners: newContract.teamingPartners || [],
      technicalRequirements: newContract.technicalRequirements,
      certifications: newContract.certifications || [],
      notes: newContract.notes,
      actionItems: newContract.actionItems || [],
      documents: newContract.documents || [],
      interactions: newContract.interactions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [...contracts, contract];
    setContracts(updated);
    await storage.saveGovContracts(updated);

    // Reset form
    setNewContract({
      opportunityNumber: '',
      title: '',
      agency: '',
      opportunityType: 'Federal',
      portalUrl: '',
      solicitationNumber: '',
      status: 'new',
      priority: 'MEDIUM',
      capabilityMatch: 50,
      estimatedValue: 0,
      registrationRequired: false,
      teamingRequired: false,
      actionItems: [],
      documents: [],
      interactions: [],
    });
    setShowAddForm(false);
  };

  // Update Contract
  const updateContract = async <K extends keyof GovContractItem>(
    contractId: number,
    field: K,
    value: GovContractItem[K]
  ) => {
    const updated = contracts.map((contract) =>
      contract.id === contractId ? { ...contract, [field]: value, updatedAt: new Date().toISOString() } : contract
    );
    setContracts(updated);
    await storage.saveGovContracts(updated);
  };

  // Delete Contract
  const deleteContract = async (contractId: number) => {
    if (confirm('Are you sure you want to delete this contract opportunity?')) {
      const updated = contracts.filter((c) => c.id !== contractId);
      setContracts(updated);
      await storage.saveGovContracts(updated);
    }
  };

  // Add Action Item
  const addActionItem = async (contractId: number) => {
    const description = prompt('Action Item Description:');
    if (!description) return;

    const dueDate = prompt('Due Date (YYYY-MM-DD) - Optional:');

    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return;

    const newActionItem = {
      id: Date.now(),
      description,
      dueDate: dueDate || undefined,
      completed: false,
    };

    const updatedActionItems = [...(contract.actionItems || []), newActionItem];
    await updateContract(contractId, 'actionItems', updatedActionItems);
  };

  // Export Functions
  const exportToJSON = () => {
    const exportData = {
      govContracts: contracts,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gov-contracts-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToMarkdown = () => {
    let markdown = `# Government Contracts Report\n\n`;
    markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    markdown += `**Total Opportunities:** ${contracts.length}\n\n`;

    const groupedByStatus = contracts.reduce((acc, contract) => {
      if (!acc[contract.status]) acc[contract.status] = [];
      acc[contract.status].push(contract);
      return acc;
    }, {} as Record<string, GovContractItem[]>);

    Object.entries(groupedByStatus).forEach(([status, items]) => {
      markdown += `## ${status.toUpperCase()} (${items.length})\n\n`;
      items.forEach((contract) => {
        markdown += `### ${contract.opportunityNumber} - ${contract.title}\n\n`;
        markdown += `- **Agency:** ${contract.agency}\n`;
        markdown += `- **Type:** ${contract.opportunityType}\n`;
        markdown += `- **Priority:** ${contract.priority}\n`;
        markdown += `- **Capability Match:** ${contract.capabilityMatch}%\n`;
        markdown += `- **Estimated Value:** $${contract.estimatedValue.toLocaleString()}`;
        if (contract.estimatedValueMax) {
          markdown += ` - $${contract.estimatedValueMax.toLocaleString()}`;
        }
        markdown += `\n`;
        if (contract.dueDate) markdown += `- **Due Date:** ${contract.dueDate}\n`;
        if (contract.portalUrl) markdown += `- **Portal:** ${contract.portalUrl}\n`;
        if (contract.solicitationNumber) markdown += `- **Solicitation #:** ${contract.solicitationNumber}\n`;
        if (contract.qaDeadline) markdown += `- **Q&A Deadline:** ${contract.qaDeadline}\n`;
        
        if (contract.actionItems && contract.actionItems.length > 0) {
          markdown += `\n**Action Items:**\n`;
          contract.actionItems.forEach(item => {
            const checkbox = item.completed ? '[x]' : '[ ]';
            markdown += `  ${checkbox} ${item.description}`;
            if (item.dueDate) markdown += ` (Due: ${item.dueDate})`;
            markdown += `\n`;
          });
        }
        markdown += `\n`;
      });
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gov-contracts-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importFromJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = '';

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse((e.target?.result as string) || '{}');

        // Check if this is BidMatch format
        if (isBidMatchFormat(data)) {
          const oppCount = data.opportunities?.length || 0;
          const confirmMsg = `🎯 BidMatch JSON Detected!\n\n` +
            `Found ${oppCount} opportunities to import.\n\n` +
            `This will ADD these opportunities to your existing data.\n` +
            `Duplicates (same Opp # AND Title) will be skipped.\n\n` +
            `Continue?`;
          
          if (confirm(confirmMsg)) {
            try {
              const parsedContracts = parseBidMatchJSON(data);
              
              // Filter out duplicates: check both opportunityNumber AND title
              const newContracts = parsedContracts.filter(newContract => {
                return !contracts.some(existing => 
                  existing.opportunityNumber === newContract.opportunityNumber &&
                  existing.title === newContract.title
                );
              });
              
              const duplicateCount = parsedContracts.length - newContracts.length;
              const updated = [...contracts, ...newContracts];
              
              setContracts(updated);
              await storage.saveGovContracts(updated);
              
              let message = `✅ Import Complete!\n\n`;
              message += `• New opportunities imported: ${newContracts.length}\n`;
              if (duplicateCount > 0) {
                message += `• Duplicates skipped: ${duplicateCount}\n`;
              }
              message += `• Total opportunities: ${updated.length}`;
              
              alert(message);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              alert(`Error parsing BidMatch data: ${errorMessage}`);
            }
          }
        } else if (data.govContracts) {
          // Standard dashboard format
          if (confirm('This will REPLACE all current government contract data. Continue?')) {
            setContracts(data.govContracts || []);
            await storage.saveGovContracts(data.govContracts || []);
            alert('Data imported successfully!');
          }
        } else {
          alert('❌ Unrecognized format\n\nPlease import either:\n- BidMatch JSON (with "opportunities" array)\n- Dashboard export JSON (with "govContracts" array)');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(`Error importing file: ${errorMessage}\n\nPlease ensure the file format is correct.`);
      }
    };

    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };

    reader.readAsText(file);
  };

  // Get filtered contracts
  const getFilteredContracts = () => {
    switch (currentView) {
      case 'active':
        return contracts.filter(c => ['new', 'registered', 'reviewing', 'preparing'].includes(c.status));
      case 'submitted':
        return contracts.filter(c => c.status === 'submitted');
      case 'awarded':
        return contracts.filter(c => c.status === 'awarded');
      case 'declined':
        return contracts.filter(c => ['declined', 'lost'].includes(c.status));
      default:
        return contracts;
    }
  };

  // Calculate days until due date
  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filteredContracts = getFilteredContracts();
  const totalValue = filteredContracts.reduce((sum, c) => sum + c.estimatedValue, 0);
  
  // Critical alerts
  const criticalContracts = contracts.filter(c => c.priority === 'CRITICAL' && ['new', 'registered', 'reviewing', 'preparing'].includes(c.status));
  const dueSoonContracts = contracts.filter(c => {
    const days = getDaysUntilDue(c.dueDate);
    return days !== null && days <= 7 && days >= 0 && ['new', 'registered', 'reviewing', 'preparing'].includes(c.status);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Government Contracts Tracker</h1>
              <p className="text-gray-600">Track and manage government contract opportunities</p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Pipeline Manager
              </Link>
              <Link
                href="/financial"
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <FileDown size={16} /> Financial Dashboard
              </Link>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportToJSON}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download size={16} /> Export JSON
            </button>
            <button
              onClick={exportToMarkdown}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <FileDown size={16} /> Export Markdown
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">
              <Upload size={16} /> Import JSON (BidMatch/Dashboard)
              <input
                type="file"
                accept=".json"
                onChange={importFromJSON}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Alerts */}
        {criticalContracts.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 mr-3" size={24} />
              <div>
                <p className="font-bold text-red-800">🚨 CRITICAL OPPORTUNITIES</p>
                <p className="text-red-700">
                  {criticalContracts.length} critical opportunit{criticalContracts.length === 1 ? 'y' : 'ies'} requiring immediate attention
                </p>
              </div>
            </div>
          </div>
        )}

        {dueSoonContracts.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="text-yellow-400 mr-3" size={24} />
              <div>
                <p className="font-bold text-yellow-800">⏰ DUE WITHIN 7 DAYS</p>
                <p className="text-yellow-700">
                  {dueSoonContracts.length} opportunit{dueSoonContracts.length === 1 ? 'y' : 'ies'} with upcoming deadlines
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500 mb-1">Total Opportunities</p>
            <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500 mb-1">Active Pursuits</p>
            <p className="text-2xl font-bold text-blue-600">
              {contracts.filter(c => ['new', 'registered', 'reviewing', 'preparing'].includes(c.status)).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500 mb-1">Submitted</p>
            <p className="text-2xl font-bold text-purple-600">
              {contracts.filter(c => c.status === 'submitted').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <p className="text-sm text-gray-500 mb-1">Total Estimated Value</p>
            <p className="text-2xl font-bold text-green-600">${(totalValue / 1000000).toFixed(1)}M</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Contract Opportunities</h2>
              <p className="text-sm text-gray-500">
                Showing {filteredContracts.length} opportunit{filteredContracts.length === 1 ? 'y' : 'ies'}
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus size={16} /> Add Opportunity
            </button>
          </div>

          {/* View Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setCurrentView('all')}
              className={`px-4 py-2 font-medium ${currentView === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              📋 All ({contracts.length})
            </button>
            <button
              onClick={() => setCurrentView('active')}
              className={`px-4 py-2 font-medium ${currentView === 'active' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              🎯 Active ({contracts.filter(c => ['new', 'registered', 'reviewing', 'preparing'].includes(c.status)).length})
            </button>
            <button
              onClick={() => setCurrentView('submitted')}
              className={`px-4 py-2 font-medium ${currentView === 'submitted' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              📤 Submitted ({contracts.filter(c => c.status === 'submitted').length})
            </button>
            <button
              onClick={() => setCurrentView('awarded')}
              className={`px-4 py-2 font-medium ${currentView === 'awarded' ? 'border-b-2 border-yellow-600 text-yellow-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              🏆 Awarded ({contracts.filter(c => c.status === 'awarded').length})
            </button>
            <button
              onClick={() => setCurrentView('declined')}
              className={`px-4 py-2 font-medium ${currentView === 'declined' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ❌ Declined/Lost ({contracts.filter(c => ['declined', 'lost'].includes(c.status)).length})
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-3">New Contract Opportunity</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Opportunity Number (e.g., #16) *"
                  value={newContract.opportunityNumber}
                  onChange={(e) => setNewContract({ ...newContract, opportunityNumber: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <input
                  type="text"
                  placeholder="Title *"
                  value={newContract.title}
                  onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <input
                  type="text"
                  placeholder="Agency/Department *"
                  value={newContract.agency}
                  onChange={(e) => setNewContract({ ...newContract, agency: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <select
                  value={newContract.opportunityType}
                  onChange={(e) =>
                    setNewContract({
                      ...newContract,
                      opportunityType: e.target.value as GovContractItem['opportunityType'],
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  {opportunityTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select
                  value={newContract.priority}
                  onChange={(e) =>
                    setNewContract({
                      ...newContract,
                      priority: e.target.value as GovContractItem['priority'],
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  {priorityLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Capability Match (%)"
                  value={newContract.capabilityMatch}
                  onChange={(e) => setNewContract({ ...newContract, capabilityMatch: parseInt(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  min="0"
                  max="100"
                />
                <input
                  type="number"
                  placeholder="Estimated Value ($)"
                  value={newContract.estimatedValue}
                  onChange={(e) => setNewContract({ ...newContract, estimatedValue: parseFloat(e.target.value) || 0 })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <input
                  type="number"
                  placeholder="Max Value ($ - Optional)"
                  value={newContract.estimatedValueMax || ''}
                  onChange={(e) => setNewContract({ ...newContract, estimatedValueMax: parseFloat(e.target.value) || undefined })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <input
                  type="date"
                  placeholder="Due Date"
                  value={newContract.dueDate}
                  onChange={(e) => setNewContract({ ...newContract, dueDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <input
                  type="date"
                  placeholder="Q&A Deadline"
                  value={newContract.qaDeadline}
                  onChange={(e) => setNewContract({ ...newContract, qaDeadline: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <input
                  type="url"
                  placeholder="Portal URL"
                  value={newContract.portalUrl}
                  onChange={(e) => setNewContract({ ...newContract, portalUrl: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 col-span-2"
                />
                <input
                  type="text"
                  placeholder="Solicitation Number"
                  value={newContract.solicitationNumber}
                  onChange={(e) => setNewContract({ ...newContract, solicitationNumber: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <input
                  type="text"
                  placeholder="NAICS Code"
                  value={newContract.naicsCode}
                  onChange={(e) => setNewContract({ ...newContract, naicsCode: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <textarea
                  placeholder="Notes"
                  value={newContract.notes}
                  onChange={(e) => setNewContract({ ...newContract, notes: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg col-span-2 text-gray-900 placeholder-gray-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addContract}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Opportunity
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Contracts Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Opp #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agency</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Match</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContracts.map((contract) => {
                  const daysUntilDue = getDaysUntilDue(contract.dueDate);
                  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
                  const isDueSoon = daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 7;
                  const pendingActions = contract.actionItems?.filter(a => !a.completed).length || 0;

                  return (
                    <tr 
                      key={contract.id} 
                      className={`hover:bg-gray-50 ${contract.priority === 'CRITICAL' ? 'bg-red-50 border-l-4 border-l-red-500' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{contract.opportunityNumber}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-900">{contract.title}</span>
                        {contract.portalUrl && (
                          <a 
                            href={contract.portalUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            🔗
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{contract.agency}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          contract.opportunityType === 'Emergency' ? 'bg-red-100 text-red-800' :
                          contract.opportunityType === 'Federal' ? 'bg-blue-100 text-blue-800' :
                          contract.opportunityType === 'State' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {contract.opportunityType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${
                          contract.priority === 'CRITICAL' ? 'bg-red-600 text-white' :
                          contract.priority === 'HIGH' ? 'bg-orange-500 text-white' :
                          contract.priority === 'MEDIUM' ? 'bg-yellow-500 text-white' :
                          'bg-gray-400 text-white'
                        }`}>
                          {contract.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{contract.capabilityMatch}%</span>
                          <div className="w-12 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                contract.capabilityMatch >= 90 ? 'bg-green-600' :
                                contract.capabilityMatch >= 70 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${contract.capabilityMatch}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900">
                          ${(contract.estimatedValue / 1000).toFixed(0)}K
                          {contract.estimatedValueMax && ` - ${(contract.estimatedValueMax / 1000).toFixed(0)}K`}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {contract.dueDate ? (
                          <div>
                            <span className={`text-sm ${
                              isOverdue ? 'text-red-600 font-bold' :
                              isDueSoon ? 'text-yellow-600 font-bold' :
                              'text-gray-600'
                            }`}>
                              {new Date(contract.dueDate).toLocaleDateString()}
                            </span>
                            {daysUntilDue !== null && (
                              <div className={`text-xs ${
                                isOverdue ? 'text-red-600' :
                                isDueSoon ? 'text-yellow-600' :
                                'text-gray-500'
                              }`}>
                                {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` :
                                 isDueSoon ? `${daysUntilDue} days left` :
                                 `${daysUntilDue} days`}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={contract.status}
                          onChange={(e) => updateContract(contract.id, 'status', e.target.value as GovContractItem['status'])}
                          className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-900 bg-white"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              let info = `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                              info += `📋 ${contract.opportunityNumber} - ${contract.title}\n`;
                              info += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                              info += `🏛️ Agency: ${contract.agency}\n`;
                              info += `📊 Type: ${contract.opportunityType}\n`;
                              info += `⚠️ Priority: ${contract.priority}\n`;
                              info += `✅ Capability Match: ${contract.capabilityMatch}%\n`;
                              info += `💰 Estimated Value: $${contract.estimatedValue.toLocaleString()}`;
                              if (contract.estimatedValueMax) info += ` - $${contract.estimatedValueMax.toLocaleString()}`;
                              info += `\n`;
                              if (contract.dueDate) info += `📅 Due Date: ${contract.dueDate}\n`;
                              if (contract.qaDeadline) info += `❓ Q&A Deadline: ${contract.qaDeadline}\n`;
                              if (contract.portalUrl) info += `🔗 Portal: ${contract.portalUrl}\n`;
                              if (contract.solicitationNumber) info += `📄 Solicitation #: ${contract.solicitationNumber}\n`;
                              if (contract.naicsCode) info += `🏷️ NAICS: ${contract.naicsCode}\n`;
                              if (contract.notes) info += `\n📝 Notes: ${contract.notes}\n`;
                              
                              if (contract.actionItems && contract.actionItems.length > 0) {
                                info += `\n━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                                info += `✅ ACTION ITEMS (${pendingActions} pending):\n\n`;
                                contract.actionItems.forEach(item => {
                                  const checkbox = item.completed ? '[✓]' : '[ ]';
                                  info += `${checkbox} ${item.description}`;
                                  if (item.dueDate) info += ` (Due: ${item.dueDate})`;
                                  info += `\n`;
                                });
                              }
                              
                              alert(info);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => addActionItem(contract.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Add Action Item"
                          >
                            <Plus size={14} />
                          </button>
                          {pendingActions > 0 && (
                            <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full font-semibold">
                              {pendingActions}
                            </span>
                          )}
                          <button
                            onClick={() => deleteContract(contract.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredContracts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No contract opportunities yet. Click &quot;Add Opportunity&quot; to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

