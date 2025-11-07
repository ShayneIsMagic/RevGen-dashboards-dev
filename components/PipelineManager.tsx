'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePipelineData } from '@/hooks/useLocalForage';
import { storage } from '@/lib/storage';
import { calculateGoalMetrics } from '@/lib/utils';
import type { Goal, PipelineItem, PipelineType } from '@/types';
import { Download, Plus, Edit2, Save, X, AlertCircle, Upload, FileDown, Trash } from './icons';
import PDFImportDialog from './PDFImportDialog';
import type { LeadItem } from '@/types';

const salesStages = [
  'Mutual Discovery',
  'Proposal',
  'Realign',
  'Overcome',
  'Closed Won',
  'Closed Lost',
];

const salesStageInitials: Record<string, string> = {
  'Mutual Discovery': 'M',
  'Proposal': 'P',
  'Realign': 'R',
  'Overcome': 'O',
  'Closed Won': 'W',
  'Closed Lost': 'L',
};

const paymentTypes: Array<'MRR' | 'Project' | 'Hybrid'> = ['MRR', 'Project', 'Hybrid'];
const interactionTypes: Array<'text' | 'phone' | 'email' | 'in-person' | 'video'> = ['text', 'phone', 'email', 'in-person', 'video'];
const leadSources = [
  'Website',
  'Referral',
  'Social Media',
  'Cold Outreach',
  'Trade Show',
  'Partner',
  'Other',
];

export default function PipelineManager() {
  const {
    goals,
    leadsPipeline,
    salesPipeline,
    activeClients,
    lostDeals,
    formerClients,
    setGoals,
    setLeadsPipeline,
    setSalesPipeline,
    setActiveClients,
    setLostDeals,
    setFormerClients,
    loading,
  } = usePipelineData();

  const [currentView, setCurrentView] = useState<PipelineType>('sales');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showPDFImport, setShowPDFImport] = useState(false);

  const [newItem, setNewItem] = useState({
    prospect: '',
    proposedProject: '',
    amount: '',
    nextStep: '',
    nextStepDate: '',
    salesStage: 'Mutual Discovery',
    notes: '',
    paymentType: 'Project' as 'MRR' | 'Project' | 'Hybrid',
    mrrAmount: '',
    taskWizeLink: '',
    defaultMeetingLink: '',
    actionItems: [] as Array<{ id: number; description: string; dueDate?: string; completed: boolean; }>,
    interactions: [] as Array<{ type: 'text' | 'phone' | 'email' | 'in-person' | 'video'; date: string; notes: string; meetingLink?: string; actionItems?: Array<{ id: number; description: string; dueDate?: string; completed: boolean; }> }>,
  });

  const [newLead, setNewLead] = useState({
    prospect: '',
    company: '',
    source: 'Website',
    projectedOpportunity: '',
    defaultMeetingLink: '',
    actionItems: [] as Array<{ id: number; description: string; dueDate?: string; completed: boolean; }>,
    interactions: [] as Array<{ type: 'text' | 'phone' | 'email' | 'in-person' | 'video'; date: string; notes: string; meetingLink?: string; actionItems?: Array<{ id: number; description: string; dueDate?: string; completed: boolean; }> }>,
    notes: {
      solution: '',
      budget: '',
      people: '',
      timing: '',
      general: '',
    },
    status: 'new' as 'new' | 'contacted' | 'qualified' | 'converted' | 'lost',
  });

  const [newGoal, setNewGoal] = useState({
    name: '',
    category: 'Revenue' as Goal['category'],
    startingValue: '',
    currentValue: '',
    targetValue: '',
    targetDate: '',
    unit: '$',
  });

  // Compute alert state directly from salesPipeline length
  const shouldShowAlert = salesPipeline.length < 15;

  // Goal Management
  const addGoal = async () => {
    if (!newGoal.name || !newGoal.targetValue || !newGoal.targetDate) {
      alert('Please fill in required goal fields');
      return;
    }

    const startingValue = parseFloat(newGoal.startingValue) || 0;
    const currentValue = parseFloat(newGoal.currentValue) || startingValue;
    const targetValue = parseFloat(newGoal.targetValue);

    // Validation - ALL values can be negative, and Current can even be BELOW Starting (regression)
    if (targetValue <= startingValue) {
      alert('Target Value must be different from (and progress beyond) Starting Value\n\nExamples:\n- Growth: $0 → $10k → $50k\n- Loss Reduction: -$50k → -$30k → -$10k');
      return;
    }

    if (currentValue > targetValue) {
      alert('Current Value cannot exceed Target (you\'ve already achieved your goal!)');
      return;
    }

    // Warning when regressing (Current < Starting)
    if (currentValue < startingValue) {
      const regression = startingValue - currentValue;
      const originalGoal = targetValue - startingValue;
      const totalNeeded = targetValue - currentValue;
      const extra = totalNeeded - originalGoal;
      
      const confirmed = confirm(
        `⚠️ REGRESSION DETECTED\n\n` +
        `You've gone BACKWARD by ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(regression)}\n\n` +
        `Original goal: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(originalGoal)} improvement\n` +
        `Current position: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(regression)} behind starting point\n` +
        `Total climb needed: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalNeeded)} from current position\n` +
        `Extra recovery needed: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(extra)}\n\n` +
        `Continue creating this goal?`
      );
      
      if (!confirmed) return;
    }

    const goal: Goal = {
      id: Date.now(),
      ...newGoal,
      startingValue,
      currentValue,
      targetValue,
      createdAt: new Date().toISOString(),
    };

    const updatedGoals = [...goals, goal];
    setGoals(updatedGoals);
    await storage.saveGoals(updatedGoals);
    setNewGoal({
      name: '',
      category: 'Revenue',
      startingValue: '',
      currentValue: '',
      targetValue: '',
      targetDate: '',
      unit: '$',
    });
    setShowGoalForm(false);
  };

  const updateGoal = async (goalId: number, field: keyof Goal, value: Goal[keyof Goal]) => {
    const updatedGoals = goals.map((goal) =>
      goal.id === goalId ? { ...goal, [field]: value } : goal
    );
    setGoals(updatedGoals);
    await storage.saveGoals(updatedGoals);
  };

  const deleteGoal = async (goalId: number) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      const updatedGoals = goals.filter((g) => g.id !== goalId);
      setGoals(updatedGoals);
      await storage.saveGoals(updatedGoals);
    }
  };

  // Lead Management
  const addLead = async () => {
    if (!newLead.prospect) {
      alert('Please fill in Prospect name');
      return;
    }

    const lead: LeadItem = {
      id: Date.now(),
      ...newLead,
      projectedOpportunity: parseFloat(newLead.projectedOpportunity) || 0,
      createdAt: new Date().toISOString(),
    };

    const updated = [...leadsPipeline, lead];
    setLeadsPipeline(updated);
    await storage.saveLeadsPipeline(updated);

    setNewLead({
      prospect: '',
      company: '',
      source: 'Website',
      projectedOpportunity: '',
      defaultMeetingLink: '',
      actionItems: [],
      interactions: [],
      notes: {
        solution: '',
        budget: '',
        people: '',
        timing: '',
        general: '',
      },
      status: 'new',
    });
    setShowAddForm(false);
  };

  const addInteraction = (leadId: number) => {
    const lead = leadsPipeline.find(l => l.id === leadId);
    if (!lead) return;

    const interactionType = prompt('Interaction type (text/phone/email/in-person):');
    if (!interactionType || !interactionTypes.includes(interactionType as typeof interactionTypes[number])) {
      alert('Invalid interaction type');
      return;
    }

    const notes = prompt('Interaction notes:');
    if (notes === null) return;

    const updated = leadsPipeline.map(l =>
      l.id === leadId
        ? {
            ...l,
            interactions: [
              ...l.interactions,
              {
                type: interactionType as typeof interactionTypes[number],
                date: new Date().toISOString().split('T')[0],
                notes: notes || '',
              },
            ],
          }
        : l
    );
    setLeadsPipeline(updated);
    storage.saveLeadsPipeline(updated);
  };

  // Pipeline Item Management (Sales Pipeline)
  const addItem = async () => {
    if (!newItem.prospect || !newItem.proposedProject) {
      alert('Please fill in Prospect and Proposed Project');
      return;
    }

    const item: PipelineItem = {
      id: Date.now(),
      ...newItem,
      amount: parseFloat(newItem.amount) || 0,
      mrrAmount: newItem.mrrAmount ? parseFloat(newItem.mrrAmount) : undefined,
      createdAt: new Date().toISOString(),
    };

    if (currentView === 'sales') {
      const updated = [...salesPipeline, item];
      setSalesPipeline(updated);
      await storage.saveSalesPipeline(updated);
    } else if (currentView === 'active') {
      const updated = [...activeClients, item];
      setActiveClients(updated);
      await storage.saveActiveClients(updated);
    }

    setNewItem({
      prospect: '',
      proposedProject: '',
      amount: '',
      nextStep: '',
      nextStepDate: '',
      salesStage: 'Mutual Discovery',
      notes: '',
      paymentType: 'Project',
      mrrAmount: '',
      taskWizeLink: '',
      defaultMeetingLink: '',
      actionItems: [],
      interactions: [],
    });
    setShowAddForm(false);
  };

  const updateItem = async (itemId: number, field: keyof PipelineItem, value: PipelineItem[keyof PipelineItem]) => {
    const updatePipeline = (pipeline: PipelineItem[]) => {
      return pipeline.map((item) => (item.id === itemId ? { ...item, [field]: value } : item));
    };

    if (currentView === 'sales') {
      const updated = updatePipeline(salesPipeline);
      setSalesPipeline(updated);
      await storage.saveSalesPipeline(updated);
    } else if (currentView === 'active') {
      const updated = updatePipeline(activeClients);
      setActiveClients(updated);
      await storage.saveActiveClients(updated);
    } else if (currentView === 'lost') {
      const updated = updatePipeline(lostDeals);
      setLostDeals(updated);
      await storage.saveLostDeals(updated);
    } else if (currentView === 'former') {
      const updated = updatePipeline(formerClients);
      setFormerClients(updated);
      await storage.saveFormerClients(updated);
    }
  };

  const moveToLost = async (item: PipelineItem) => {
    if (confirm(`Move "${item.prospect}" to Lost Deals?`)) {
      const lostItem = { ...item, lostDate: new Date().toISOString() };
      const updatedLost = [...lostDeals, lostItem];
      setLostDeals(updatedLost);
      await storage.saveLostDeals(updatedLost);

      if (currentView === 'sales') {
        const updated = salesPipeline.filter((i) => i.id !== item.id);
        setSalesPipeline(updated);
        await storage.saveSalesPipeline(updated);
      }
    }
  };

  const handleClosedWon = async (item: PipelineItem) => {
    const duplicate = confirm(
      `Move "${item.prospect}" to Active Clients?\n\n` +
      `Would you like to duplicate this deal to Active Clients?`
    );

    if (!duplicate) return;

    // Prompt for payment type
    const paymentType = prompt(
      'Payment Type:\n1. MRR (Monthly Recurring Revenue)\n2. Project (One-time payment)\n3. Hybrid\n\nEnter: MRR, Project, or Hybrid'
    )?.trim() as 'MRR' | 'Project' | 'Hybrid' | undefined;

    if (!paymentType || !['MRR', 'Project', 'Hybrid'].includes(paymentType)) {
      alert('Invalid payment type. Deal not moved.');
      return;
    }

    let mrrAmount: number | undefined;
    if (paymentType === 'MRR' || paymentType === 'Hybrid') {
      const mrrInput = prompt('Enter Monthly Recurring Revenue amount:');
      mrrAmount = mrrInput ? parseFloat(mrrInput) : undefined;
    }

    const activeItem: PipelineItem = {
      ...item,
      paymentType,
      mrrAmount,
      startDate: new Date().toISOString(),
      salesStage: undefined, // Remove stage from active clients
    };

    const updatedActive = [...activeClients, activeItem];
    setActiveClients(updatedActive);
    await storage.saveActiveClients(updatedActive);

    // Remove from sales pipeline
    const updated = salesPipeline.filter((i) => i.id !== item.id);
    setSalesPipeline(updated);
    await storage.saveSalesPipeline(updated);
  };

  const moveToFormer = async (item: PipelineItem) => {
    if (confirm(`Move "${item.prospect}" to Former Clients?`)) {
      const formerItem = { ...item, endDate: new Date().toISOString() };
      const updatedFormer = [...formerClients, formerItem];
      setFormerClients(updatedFormer);
      await storage.saveFormerClients(updatedFormer);

      const updated = activeClients.filter((i) => i.id !== item.id);
      setActiveClients(updated);
      await storage.saveActiveClients(updated);
    }
  };

  const deleteItem = async (itemId: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      if (currentView === 'sales') {
        const updated = salesPipeline.filter((i) => i.id !== itemId);
        setSalesPipeline(updated);
        await storage.saveSalesPipeline(updated);
      } else if (currentView === 'active') {
        const updated = activeClients.filter((i) => i.id !== itemId);
        setActiveClients(updated);
        await storage.saveActiveClients(updated);
      } else if (currentView === 'lost') {
        const updated = lostDeals.filter((i) => i.id !== itemId);
        setLostDeals(updated);
        await storage.saveLostDeals(updated);
      } else if (currentView === 'former') {
        const updated = formerClients.filter((i) => i.id !== itemId);
        setFormerClients(updated);
        await storage.saveFormerClients(updated);
      }
    }
  };

  const deleteLead = async (leadId: number) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      const updated = leadsPipeline.filter((l) => l.id !== leadId);
      setLeadsPipeline(updated);
      await storage.saveLeadsPipeline(updated);
    }
  };

  // Export Functions
  const exportToJSON = () => {
    const exportData = {
      goals,
      leadsPipeline,
      salesPipeline,
      activeClientPipeline: activeClients,
      lostDeals,
      formerClients,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportToMarkdown = () => {
    let markdown = `# Pipeline Report\n\n`;
    markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;

    // Goals Section
    markdown += `## 📊 Goals\n\n`;
    goals.forEach((goal) => {
      const starting = goal.startingValue ?? 0;
      const current = goal.currentValue ?? 0;
      const target = goal.targetValue ?? 0;
      const total = target - starting;
      const progress = total !== 0 ? ((current - starting) / total * 100).toFixed(1) : '0.0';
      markdown += `### ${goal.name}\n`;
      markdown += `- **FROM** ${goal.unit}${starting.toLocaleString()} → **CURRENT** ${goal.unit}${current.toLocaleString()} → **TO** ${goal.unit}${target.toLocaleString()}\n`;
      markdown += `- **Target Date:** ${goal.targetDate}\n`;
      markdown += `- **Progress:** ${progress}%\n\n`;
    });

    // Leads Pipeline
    markdown += `## 🎯 Leads Pipeline (${leadsPipeline.length} items)\n\n`;
    leadsPipeline.forEach((lead) => {
      markdown += `### ${lead.prospect}\n`;
      markdown += `- **Company:** ${lead.company || 'N/A'}\n`;
      markdown += `- **Source:** ${lead.source}\n`;
      markdown += `- **Projected Opportunity:** $${lead.projectedOpportunity.toLocaleString()}\n`;
      markdown += `- **Status:** ${lead.status}\n`;
      if (lead.interactions.length > 0) {
        markdown += `- **Interactions:** ${lead.interactions.length}\n`;
      }
      markdown += `\n`;
    });

    // Sales Pipeline
    markdown += `## 💼 Sales Pipeline (${salesPipeline.length} items)\n\n`;
    if (salesPipeline.length < 15) {
      markdown += `⚠️ **ALERT:** Pipeline below 15 deals. Current: ${salesPipeline.length}\n\n`;
    }
    salesPipeline.forEach((item) => {
      markdown += `### ${item.prospect}\n`;
      markdown += `- **Project:** ${item.proposedProject}\n`;
      markdown += `- **Amount:** $${(item.amount ?? 0).toLocaleString()}\n`;
      markdown += `- **Stage:** ${item.salesStage}\n`;
      markdown += `- **Next Step:** ${item.nextStep}${item.nextStepDate ? ` (${item.nextStepDate})` : ''}\n\n`;
    });

    // Active Clients
    markdown += `## 💼 Active Client Pipeline (${activeClients.length} items)\n\n`;
    activeClients.forEach((item) => {
      markdown += `### ${item.prospect}\n`;
      markdown += `- **Project:** ${item.proposedProject}\n`;
      markdown += `- **Amount:** $${(item.amount ?? 0).toLocaleString()}\n`;
      markdown += `- **Next Step:** ${item.nextStep}${item.nextStepDate ? ` (${item.nextStepDate})` : ''}\n\n`;
    });

    // Lost Deals
    markdown += `## ❌ Lost Deals (${lostDeals.length} items)\n\n`;
    lostDeals.forEach((item) => {
      markdown += `- **${item.prospect}** - ${item.proposedProject} ($${(item.amount ?? 0).toLocaleString()})\n`;
    });

    // Former Clients
    markdown += `\n## 📦 Former Clients (${formerClients.length} items)\n\n`;
    formerClients.forEach((item) => {
      markdown += `- **${item.prospect}** - ${item.proposedProject} ($${(item.amount ?? 0).toLocaleString()})\n`;
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importFromJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    event.target.value = '';

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse((e.target?.result as string) || '{}');

        // Sanitize data: convert null startingValue to 0 for goals
        if (data.goals) {
          data.goals = data.goals.map((goal: Goal) => ({
            ...goal,
            startingValue: goal.startingValue === null || goal.startingValue === undefined ? 0 : goal.startingValue,
            currentValue: goal.currentValue === null || goal.currentValue === undefined ? 0 : goal.currentValue,
            targetValue: goal.targetValue === null || goal.targetValue === undefined ? 0 : goal.targetValue,
          }));
        }

        if (confirm('This will replace all current data. Continue?')) {
          setGoals(data.goals || []);
          setLeadsPipeline(data.leadsPipeline || []);
          setSalesPipeline(data.salesPipeline || data.leadPipeline || []); // Backward compatibility
          setActiveClients(data.activeClientPipeline || []);
          setLostDeals(data.lostDeals || []);
          setFormerClients(data.formerClients || []);

          await Promise.all([
            storage.saveGoals(data.goals || []),
            storage.saveLeadsPipeline(data.leadsPipeline || []),
            storage.saveSalesPipeline(data.salesPipeline || data.leadPipeline || []),
            storage.saveActiveClients(data.activeClientPipeline || []),
            storage.saveLostDeals(data.lostDeals || []),
            storage.saveFormerClients(data.formerClients || []),
          ]);

          alert('Data imported successfully! Refresh the page to see changes.');
          window.location.reload();
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

  // Helper: Calculate business days between two dates
  const getBusinessDaysDiff = (date1: Date, date2: Date): number => {
    let count = 0;
    const current = new Date(date1);
    const end = new Date(date2);
    
    while (current < end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };

  // Get current pipeline based on view
  const getCurrentPipeline = () => {
    switch (currentView) {
      case 'leads':
        return leadsPipeline.map((lead) => ({
          id: lead.id,
          prospect: lead.prospect,
          proposedProject: lead.company || 'Lead',
          amount: lead.projectedOpportunity,
          salesStage: lead.status,
          nextStep: lead.notes.general || '',
          notes: `Source: ${lead.source}`,
          createdAt: lead.createdAt,
        })) as PipelineItem[];
      case 'sales':
        // Sort by nextStepDate (nearest to today first, nulls last)
        return [...salesPipeline].sort((a, b) => {
          if (!a.nextStepDate && !b.nextStepDate) return 0;
          if (!a.nextStepDate) return 1;
          if (!b.nextStepDate) return -1;
          
          const dateA = new Date(a.nextStepDate).getTime();
          const dateB = new Date(b.nextStepDate).getTime();
          const today = new Date().getTime();
          
          const diffA = Math.abs(dateA - today);
          const diffB = Math.abs(dateB - today);
          
          return diffA - diffB;
        });
      case 'active':
        // Group by customer (prospect field) - sort alphabetically by client name, then by project
        return [...activeClients].sort((a, b) => {
          const clientCompare = a.prospect.localeCompare(b.prospect);
          if (clientCompare !== 0) return clientCompare;
          return a.proposedProject.localeCompare(b.proposedProject);
        });
      case 'lost':
        return lostDeals;
      case 'former':
        return formerClients;
      default:
        return [];
    }
  };

  const currentPipeline = getCurrentPipeline();
  const totalPipelineValue = currentPipeline.reduce((sum, item) => sum + (parseFloat(String(item.amount)) || 0), 0);

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pipeline Manager</h1>
              <p className="text-gray-600">Track goals, leads, and client relationships</p>
            </div>
            <Link
              href="/financial"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <FileDown size={16} /> Financial Dashboard
            </Link>
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
                <Upload size={16} /> Import JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={importFromJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Alert for low pipeline */}
        {shouldShowAlert && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="text-yellow-400 mr-3" size={24} />
              <div>
                <p className="font-bold text-yellow-800">Pipeline Below Minimum</p>
                <p className="text-yellow-700">
                  Current deals: {salesPipeline.length} / Minimum: 15. Contact leads and set up
                  discoveries to grow your pipeline.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Goals Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">📊 Goals</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPDFImport(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <FileDown size={16} /> Import from PDF
              </button>
              <button
                onClick={() => setShowGoalForm(!showGoalForm)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Plus size={16} /> Add Goal
              </button>
            </div>
          </div>

          {showGoalForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-3">New Goal</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Goal Name"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as Goal['category'] })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  <option>Revenue</option>
                  <option>MRR</option>
                  <option>Cash Flow</option>
                  <option>Custom</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Starting Value (e.g., -$50k loss, $0, $10k)"
                  value={newGoal.startingValue}
                  onChange={(e) => setNewGoal({ ...newGoal, startingValue: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  title="Starting value (can be negative for losses)"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Current Value (e.g., -$30k, $5k, $20k)"
                  value={newGoal.currentValue}
                  onChange={(e) => setNewGoal({ ...newGoal, currentValue: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  title="Current value (can be negative if still operating at a loss)"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Target Value (e.g., -$10k, $0, $50k)"
                  value={newGoal.targetValue}
                  onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  title="Target value (can be negative if goal is loss reduction)"
                  required
                />
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addGoal}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Goal
                </button>
                <button
                  onClick={() => setShowGoalForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {goals.map((goal) => {
              const metrics = calculateGoalMetrics(goal);
              return (
                <div key={goal.id} className="border border-gray-200 rounded-lg p-4">
                  {editingGoalId === goal.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={goal.name}
                        onChange={(e) => updateGoal(goal.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-semibold"
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Starting</label>
                          <input
                            type="number"
                            value={goal.startingValue}
                            onChange={(e) => updateGoal(goal.id, 'startingValue', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Current</label>
                          <input
                            type="number"
                            value={goal.currentValue}
                            onChange={(e) => updateGoal(goal.id, 'currentValue', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Target</label>
                          <input
                            type="number"
                            value={goal.targetValue}
                            onChange={(e) => updateGoal(goal.id, 'targetValue', parseFloat(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                          />
                        </div>
                      </div>
                      <input
                        type="date"
                        value={goal.targetDate}
                        onChange={(e) => updateGoal(goal.id, 'targetDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingGoalId(null)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Done
                        </button>
                        <button
                          onClick={() => deleteGoal(goal.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                          <p className="text-sm text-gray-500">{goal.category}</p>
                        </div>
                        <button
                          onClick={() => setEditingGoalId(goal.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg mb-3">
                        <p className="text-xl font-bold text-gray-900">
                          FROM {goal.unit}
                          {(goal.startingValue ?? 0).toLocaleString()} → CURRENT {goal.unit}
                          {(goal.currentValue ?? 0).toLocaleString()} → TO {goal.unit}
                          {(goal.targetValue ?? 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          By {new Date(goal.targetDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Progress</p>
                          <p className="font-semibold text-lg">{metrics.progress}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Remaining</p>
                          <p className="font-semibold text-lg">
                            {goal.unit}
                            {(metrics.remaining ?? 0).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Days Left</p>
                          <p className="font-semibold text-lg">{metrics.daysRemaining}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Status</p>
                          <p
                            className={`font-semibold text-lg ${metrics.onTrack ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {metrics.onTrack ? '✓ On Track' : '⚠ Behind'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          Current run rate:{' '}
                          <span className="font-semibold">
                            {goal.unit}
                            {(metrics.currentRunRate ?? 0).toFixed(2)}/day
                          </span>
                          {' | '}
                          Required:{' '}
                          <span className="font-semibold">
                            {goal.unit}
                            {(metrics.requiredRunRate ?? 0).toFixed(2)}/day
                          </span>
                        </p>
                        
                        {/* Regression Info */}
                        {(goal.currentValue ?? 0) < (goal.startingValue ?? 0) && (
                          <p className="text-xs text-yellow-700 mt-2 bg-yellow-50 px-2 py-1 rounded">
                            ⚠️ Regression: Need{' '}
                            <span className="font-semibold">
                              {goal.unit}
                              {((goal.startingValue ?? 0) - (goal.currentValue ?? 0)).toLocaleString()}
                            </span>{' '}
                            to recover back to starting point ({goal.unit}{(goal.startingValue ?? 0).toLocaleString()}).
                            Total to reach {goal.unit}{(goal.targetValue ?? 0).toLocaleString()}:{' '}
                            <span className="font-semibold">
                              {goal.unit}
                              {((goal.targetValue ?? 0) - (goal.currentValue ?? 0)).toLocaleString()}
                            </span>
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
            {goals.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No goals yet. Click &quot;Add Goal&quot; to get started.
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pipeline Management</h2>
              <p className="text-sm text-gray-500">
                Total Value: ${(totalPipelineValue ?? 0).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Plus size={16} /> Add{' '}
              {currentView === 'leads'
                ? 'Lead'
                : currentView === 'sales'
                ? 'Sales Deal'
                : 'Client'}
            </button>
          </div>

          {/* View Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setCurrentView('leads')}
              className={`px-4 py-2 font-medium ${currentView === 'leads' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              🎯 Leads Pipeline ({leadsPipeline.length})
            </button>
            <button
              onClick={() => setCurrentView('sales')}
              className={`px-4 py-2 font-medium ${currentView === 'sales' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              💼 Sales Pipeline ({salesPipeline.length})
            </button>
            <button
              onClick={() => setCurrentView('active')}
              className={`px-4 py-2 font-medium ${currentView === 'active' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ✅ Active Clients ({activeClients.length})
            </button>
            <button
              onClick={() => setCurrentView('lost')}
              className={`px-4 py-2 font-medium ${currentView === 'lost' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              ❌ Lost Deals ({lostDeals.length})
            </button>
            <button
              onClick={() => setCurrentView('former')}
              className={`px-4 py-2 font-medium ${currentView === 'former' ? 'border-b-2 border-gray-600 text-gray-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              📦 Former Clients ({formerClients.length})
            </button>
          </div>

          {/* Add Lead Form */}
          {showAddForm && currentView === 'leads' && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-3">New Lead</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Prospect Name"
                  value={newLead.prospect}
                  onChange={(e) => setNewLead({ ...newLead, prospect: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={newLead.company}
                  onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <select
                  value={newLead.source}
                  onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-white"
                >
                  {leadSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Projected Opportunity ($)"
                  value={newLead.projectedOpportunity}
                  onChange={(e) => setNewLead({ ...newLead, projectedOpportunity: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium text-gray-900">Notes</label>
                  <input
                    type="text"
                    placeholder="Solution?"
                    value={newLead.notes.solution}
                    onChange={(e) =>
                      setNewLead({
                        ...newLead,
                        notes: { ...newLead.notes, solution: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Budget?"
                    value={newLead.notes.budget}
                    onChange={(e) =>
                      setNewLead({
                        ...newLead,
                        notes: { ...newLead.notes, budget: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="People?"
                    value={newLead.notes.people}
                    onChange={(e) =>
                      setNewLead({
                        ...newLead,
                        notes: { ...newLead.notes, people: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                  <input
                    type="text"
                    placeholder="Timing?"
                    value={newLead.notes.timing}
                    onChange={(e) =>
                      setNewLead({
                        ...newLead,
                        notes: { ...newLead.notes, timing: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                  <textarea
                    placeholder="General Notes"
                    value={newLead.notes.general}
                    onChange={(e) =>
                      setNewLead({
                        ...newLead,
                        notes: { ...newLead.notes, general: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                    rows={2}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-900">Meeting Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="Zoom/Google Meet link (e.g., https://zoom.us/j/123456789)"
                    value={newLead.defaultMeetingLink || ''}
                    onChange={(e) => setNewLead({ ...newLead, defaultMeetingLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addLead}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Lead
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

          {/* Add Sales Deal Form */}
          {showAddForm && (currentView === 'sales' || currentView === 'active') && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-3">New {currentView === 'sales' ? 'Sales Deal' : 'Client'}</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Prospect Name"
                  value={newItem.prospect}
                  onChange={(e) => setNewItem({ ...newItem, prospect: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <input
                  type="text"
                  placeholder="Proposed Project"
                  value={newItem.proposedProject}
                  onChange={(e) => setNewItem({ ...newItem, proposedProject: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <input
                  type="number"
                  placeholder="Amount ($)"
                  value={newItem.amount}
                  onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
                {currentView === 'sales' && (
                  <select
                    value={newItem.salesStage}
                    onChange={(e) => setNewItem({ ...newItem, salesStage: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  >
                    {salesStages.filter(s => s !== 'Closed Won' && s !== 'Closed Lost').map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                )}
                {currentView === 'active' && (
                  <select
                    value={newItem.paymentType}
                    onChange={(e) => setNewItem({ ...newItem, paymentType: e.target.value as 'MRR' | 'Project' | 'Hybrid' })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                  >
                    {paymentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                )}
                {(newItem.paymentType === 'MRR' || newItem.paymentType === 'Hybrid') && (
                  <input
                    type="number"
                    placeholder="MRR Amount ($/month)"
                    value={newItem.mrrAmount}
                    onChange={(e) => setNewItem({ ...newItem, mrrAmount: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                  />
                )}
                <input
                  type="text"
                  placeholder="Next Step"
                  value={newItem.nextStep}
                  onChange={(e) => setNewItem({ ...newItem, nextStep: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <input
                  type="date"
                  value={newItem.nextStepDate}
                  onChange={(e) => setNewItem({ ...newItem, nextStepDate: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <textarea
                  placeholder="Notes"
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg col-span-2 text-gray-900 placeholder-gray-500"
                  rows={2}
                />
                <input
                  type="url"
                  placeholder="Meeting Link (Zoom/Google Meet - Optional)"
                  value={newItem.defaultMeetingLink || ''}
                  onChange={(e) => setNewItem({ ...newItem, defaultMeetingLink: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg col-span-2 text-gray-900 placeholder-gray-500"
                />
                {currentView === 'active' && (
                  <input
                    type="url"
                    placeholder="TaskWize Project Link (Optional)"
                    value={newItem.taskWizeLink || ''}
                    onChange={(e) => setNewItem({ ...newItem, taskWizeLink: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg col-span-2 text-gray-900 placeholder-gray-500"
                  />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save
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

          {/* Leads Pipeline Table */}
          {currentView === 'leads' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prospect</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projected Opportunity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interactions</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leadsPipeline.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-900">{lead.prospect}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-600">{lead.company || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-600 text-sm">{lead.source}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-gray-900">
                          ${lead.projectedOpportunity.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            lead.status === 'new'
                              ? 'bg-blue-100 text-blue-800'
                              : lead.status === 'contacted'
                              ? 'bg-yellow-100 text-yellow-800'
                              : lead.status === 'qualified'
                              ? 'bg-green-100 text-green-800'
                              : lead.status === 'converted'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-700">{lead.interactions.length}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              // Combined view: Notes + Meetings + Action Items + Interactions
                              let info = `━━━━━━━━━━━━━━━━━━━━━━━━\n📋 LEAD: ${lead.prospect}${lead.company ? ` (${lead.company})` : ''}\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                              
                              // Meeting Link
                              if (lead.defaultMeetingLink) {
                                info += `🔗 DEFAULT MEETING: ${lead.defaultMeetingLink}\n\n`;
                              }
                              
                              // Lead Notes
                              info += `💡 LEAD NOTES:\n`;
                              info += `Solution: ${lead.notes.solution || 'N/A'}\n`;
                              info += `Budget: ${lead.notes.budget || 'N/A'}\n`;
                              info += `People: ${lead.notes.people || 'N/A'}\n`;
                              info += `Timing: ${lead.notes.timing || 'N/A'}\n`;
                              if (lead.notes.general) info += `General: ${lead.notes.general}\n`;
                              
                              // Action Items
                              const allActions = lead.actionItems || [];
                              if (allActions.length > 0) {
                                info += `\n━━━━━━━━━━━━━━━━━━━━━━━━\n✅ ACTION ITEMS (${allActions.filter(a => !a.completed).length} pending):\n\n`;
                                allActions.forEach(action => {
                                  const checkbox = action.completed ? '[✓]' : '[ ]';
                                  const dueDateStr = action.dueDate ? ` - Due: ${action.dueDate}` : '';
                                  const status = action.completed ? ' (✓ Completed)' : '';
                                  info += `${checkbox} ${action.description}${dueDateStr}${status}\n`;
                                });
                              }
                              
                              // Interactions
                              if (lead.interactions.length > 0) {
                                info += `\n━━━━━━━━━━━━━━━━━━━━━━━━\n📞 INTERACTION HISTORY (${lead.interactions.length}):\n\n`;
                                lead.interactions.forEach((int, idx) => {
                                  const icon = int.type === 'text' ? '📱' : int.type === 'phone' ? '📞' : int.type === 'email' ? '✉️' : int.type === 'video' ? '📹' : '👤';
                                  info += `${idx + 1}. ${icon} ${int.type.toUpperCase()} (${int.date})\n`;
                                  if (int.meetingLink) info += `   🔗 ${int.meetingLink}\n`;
                                  info += `   ${int.notes || 'No notes'}\n`;
                                  if (int.actionItems && int.actionItems.length > 0) {
                                    info += `   → Actions:\n`;
                                    int.actionItems.forEach(a => {
                                      const checkbox = a.completed ? '[✓]' : '[ ]';
                                      info += `     ${checkbox} ${a.description}\n`;
                                    });
                                  }
                                  info += `\n`;
                                });
                              }
                              
                              alert(info);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="View All Info"
                          >
                            📋
                          </button>
                          <button
                            onClick={() => addInteraction(lead.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Add Interaction"
                          >
                            +
                          </button>
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Lead"
                        >
                          <Trash size={16} />
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {leadsPipeline.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No leads yet. Click &quot;Add Lead&quot; to get started.
                </div>
              )}
            </div>
          )}

          {/* Sales Pipeline & Active Clients Table */}
          {(currentView === 'sales' || currentView === 'active' || currentView === 'lost' || currentView === 'former') && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {currentView === 'active' ? 'Client' : 'Prospect'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {currentView === 'active' ? 'Project' : 'Proposed Project'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    {currentView === 'sales' && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                    )}
                    {currentView === 'active' && (
                      <>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TaskWize</th>
                      </>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Step</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentPipeline.map((item) => {
                    // Check if past due by >3 business days (Sales Pipeline only)
                    const isPastDue = currentView === 'sales' && item.nextStepDate && (() => {
                      const dueDate = new Date(item.nextStepDate);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      dueDate.setHours(0, 0, 0, 0);
                      
                      if (dueDate >= today) return false; // Not past due
                      
                      const businessDaysPast = getBusinessDaysDiff(dueDate, today);
                      return businessDaysPast > 3;
                    })();
                    
                    return (
                    <tr key={item.id} className={`hover:bg-gray-50 ${isPastDue ? 'bg-red-50 border-l-4 border-l-red-500' : ''}`}>
                      <td className="px-4 py-3">
                        {editingId === item.id ? (
                          <input
                            type="text"
                            value={item.prospect}
                            onChange={(e) => updateItem(item.id, 'prospect', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded w-full text-gray-900"
                          />
                        ) : (
                          <span className="font-medium text-gray-900">{item.prospect}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === item.id ? (
                          <input
                            type="text"
                            value={item.proposedProject}
                            onChange={(e) => updateItem(item.id, 'proposedProject', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded w-full text-gray-900"
                          />
                        ) : (
                          <span className="text-gray-600">{item.proposedProject}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === item.id ? (
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => updateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                            className="px-2 py-1 border border-gray-300 rounded w-full text-gray-900"
                          />
                        ) : (
                          <span className="font-semibold text-gray-900">
                            ${(item.amount ?? 0).toLocaleString()}
                            {item.mrrAmount && (
                              <span className="text-xs text-gray-500 ml-1">
                                (MRR: ${item.mrrAmount.toLocaleString()}/mo)
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                      {currentView === 'sales' && (
                        <td className="px-4 py-3">
                          {editingId === item.id ? (
                            <select
                              value={item.salesStage}
                              onChange={(e) => updateItem(item.id, 'salesStage', e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded w-full text-gray-900 bg-white"
                            >
                              {salesStages.filter(s => s !== 'Closed Won' && s !== 'Closed Lost').map((stage) => (
                                <option key={stage} value={stage}>
                                  {stage}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 cursor-help"
                              title={item.salesStage || 'No stage'}
                            >
                              {item.salesStage ? salesStageInitials[item.salesStage] || item.salesStage[0] : '-'}
                            </span>
                          )}
                        </td>
                      )}
                      {currentView === 'active' && (
                        <>
                          <td className="px-4 py-3">
                            {editingId === item.id ? (
                              <select
                                value={item.paymentType}
                                onChange={(e) => updateItem(item.id, 'paymentType', e.target.value)}
                                className="px-2 py-1 border border-gray-300 rounded w-full text-gray-900 bg-white"
                              >
                                {paymentTypes.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-gray-600 text-sm">{item.paymentType || 'Project'}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {editingId === item.id ? (
                              <input
                                type="url"
                                value={item.taskWizeLink || ''}
                                onChange={(e) => updateItem(item.id, 'taskWizeLink', e.target.value)}
                                placeholder="TaskWize URL"
                                className="px-2 py-1 border border-gray-300 rounded w-full text-gray-900"
                              />
                            ) : item.taskWizeLink ? (
                              <a
                                href={item.taskWizeLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm underline"
                              >
                                🔗
                              </a>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                        </>
                      )}
                      <td className="px-4 py-3">
                        {editingId === item.id ? (
                          <input
                            type="text"
                            value={item.nextStep}
                            onChange={(e) => updateItem(item.id, 'nextStep', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded w-full text-gray-900"
                          />
                        ) : (
                          <span className="text-gray-600 text-sm">{item.nextStep}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === item.id ? (
                          <input
                            type="date"
                            value={item.nextStepDate}
                            onChange={(e) => updateItem(item.id, 'nextStepDate', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded w-full text-gray-900"
                          />
                        ) : (
                          <span className="text-gray-600 text-sm">
                            {item.nextStepDate ? new Date(item.nextStepDate).toLocaleDateString() : '-'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {editingId === item.id ? (
                            <>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  // Combined view for Sales/Active/Lost/Former
                                  let info = `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                                  info += `📋 ${currentView === 'sales' ? 'DEAL' : currentView === 'active' ? 'CLIENT' : currentView === 'lost' ? 'LOST DEAL' : 'FORMER CLIENT'}: ${item.prospect}\n`;
                                  info += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                                  
                                  // Meeting Link
                                  if (item.defaultMeetingLink) {
                                    info += `🔗 DEFAULT MEETING: ${item.defaultMeetingLink}\n\n`;
                                  }
                                  
                                  // Deal/Client Info
                                  info += `💼 ${currentView === 'active' ? 'CLIENT' : 'DEAL'} INFO:\n`;
                                  info += `Project: ${item.proposedProject}\n`;
                                  info += `Amount: $${(item.amount ?? 0).toLocaleString()}\n`;
                                  if (item.mrrAmount) info += `MRR: $${item.mrrAmount.toLocaleString()}/mo\n`;
                                  if (item.salesStage) info += `Stage: ${item.salesStage}\n`;
                                  if (item.paymentType) info += `Payment Type: ${item.paymentType}\n`;
                                  if (currentView === 'active' && item.taskWizeLink) info += `🔗 TaskWize: ${item.taskWizeLink}\n`;
                                  if (item.nextStep) info += `Next Step: ${item.nextStep}${item.nextStepDate ? ` (${item.nextStepDate})` : ''}\n`;
                                  if (item.notes) info += `Notes: ${item.notes}\n`;
                                  
                                  // Action Items
                                  const allActions = item.actionItems || [];
                                  if (allActions.length > 0) {
                                    info += `\n━━━━━━━━━━━━━━━━━━━━━━━━\n✅ ACTION ITEMS (${allActions.filter(a => !a.completed).length} pending):\n\n`;
                                    allActions.forEach(action => {
                                      const checkbox = action.completed ? '[✓]' : '[ ]';
                                      const dueDateStr = action.dueDate ? ` - Due: ${action.dueDate}` : '';
                                      const status = action.completed ? ' (✓ Completed)' : '';
                                      info += `${checkbox} ${action.description}${dueDateStr}${status}\n`;
                                    });
                                  }
                                  
                                  // Interactions
                                  const interactions = item.interactions || [];
                                  if (interactions.length > 0) {
                                    info += `\n━━━━━━━━━━━━━━━━━━━━━━━━\n📞 INTERACTION HISTORY (${interactions.length}):\n\n`;
                                    interactions.forEach((int, idx) => {
                                      const icon = int.type === 'text' ? '📱' : int.type === 'phone' ? '📞' : int.type === 'email' ? '✉️' : int.type === 'video' ? '📹' : '👤';
                                      info += `${idx + 1}. ${icon} ${int.type.toUpperCase()} (${int.date})\n`;
                                      if (int.meetingLink) info += `   🔗 ${int.meetingLink}\n`;
                                      info += `   ${int.notes || 'No notes'}\n`;
                                      if (int.actionItems && int.actionItems.length > 0) {
                                        info += `   → Actions:\n`;
                                        int.actionItems.forEach(a => {
                                          const checkbox = a.completed ? '[✓]' : '[ ]';
                                          info += `     ${checkbox} ${a.description}\n`;
                                        });
                                      }
                                      info += `\n`;
                                    });
                                  }
                                  
                                  alert(info);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                                title="View All Info"
                              >
                                📋
                              </button>
                              <button
                                onClick={() => setEditingId(item.id)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit2 size={16} />
                              </button>
                              {currentView === 'sales' && (
                                <>
                                  {item.salesStage === 'Overcome' && (
                                    <button
                                      onClick={() => handleClosedWon(item)}
                                      className="text-green-600 hover:text-green-800 text-xs font-bold"
                                      title="Move to Active Clients (Closed Won)"
                                    >
                                      ✓
                                    </button>
                                  )}
                                  <button
                                    onClick={() => moveToLost(item)}
                                    className="text-red-600 hover:text-red-800 text-xs"
                                    title="Move to Lost Deals"
                                  >
                                    ✗
                                  </button>
                                </>
                              )}
                              {currentView === 'active' && (
                                <button
                                  onClick={() => moveToFormer(item)}
                                  className="text-gray-600 hover:text-gray-800 text-xs"
                                  title="Move to Former Clients"
                                >
                                  📦
                                </button>
                              )}
                            <button
                              onClick={() => deleteItem(item.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash size={16} />
                            </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
              {currentPipeline.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No items in this pipeline yet. Click &quot;Add{' '}
                  {currentView === 'sales' ? 'Sales Deal' : 'Client'}&quot; to get started.
                </div>
              )}
            </div>
          )}
        </div>

        {/* PDF Import Dialog */}
        <PDFImportDialog
          isOpen={showPDFImport}
          onClose={() => setShowPDFImport(false)}
          onImport={async (importedGoals) => {
            const newGoals: Goal[] = importedGoals.map((g, index) => ({
              id: Date.now() + index,
              name: g.name || 'Imported Goal',
              category: g.category || 'Revenue',
              startingValue: g.startingValue || 0,
              currentValue: g.currentValue || g.startingValue || 0,
              targetValue: g.targetValue || 0,
              targetDate: g.targetDate || new Date().toISOString().split('T')[0],
              unit: g.unit || '$',
              createdAt: new Date().toISOString(),
            }));

            const updatedGoals = [...goals, ...newGoals];
            setGoals(updatedGoals);
            await storage.saveGoals(updatedGoals);
          }}
        />
      </div>
    </div>
  );
}

