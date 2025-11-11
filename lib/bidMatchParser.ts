import type { GovContractItem } from '@/types';

interface BidMatchOpportunity {
  opp_number: string;
  title: string;
  agency: string;
  type: string;
  priority: string;
  match: string;
  value: string;
  due_date?: string;
  status: string;
  actions?: string[];
  portal_url?: string;
  solicitation_id?: string;
  direct_link?: string;
  capability_alignment?: {
    primary: string;
    secondary?: string[];
    confidence: string;
  };
  geographic?: {
    state: string;
    sector: string;
  };
  requirements?: {
    sam_registration?: boolean;
    naics_code?: string;
    [key: string]: any;
  };
  special_notes?: string;
  contact?: {
    organization?: string;
    website?: string;
    phone?: string;
    email?: string;
    note?: string;
  };
}

interface BidMatchData {
  metadata?: any;
  opportunities: BidMatchOpportunity[];
  summary?: any;
}

/**
 * Parse BidMatch priority to dashboard priority
 */
function parsePriority(priority: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  const p = priority.toUpperCase();
  
  if (p.includes('TIER 1') || p.includes('URGENT') || p.includes('EMERGENCY') || p.includes('HIGHEST')) {
    return 'CRITICAL';
  }
  if (p.includes('TIER 2')) {
    return 'HIGH';
  }
  if (p.includes('TIER 3')) {
    return 'MEDIUM';
  }
  return 'LOW';
}

/**
 * Parse capability match percentage from text like "95% - Description"
 */
function parseCapabilityMatch(match: string): number {
  const percentMatch = match.match(/(\d+)%/);
  return percentMatch ? parseInt(percentMatch[1]) : 50;
}

/**
 * Parse value range like "$50K-$500K (Estimated)" or "$10M-$50M+"
 */
function parseValue(value: string): { min: number; max?: number } {
  // Remove commas and handle K/M/B suffixes
  const cleanValue = value.toUpperCase().replace(/[,$()]/g, '');
  
  // Extract numbers with K, M, B multipliers
  const rangeMatch = cleanValue.match(/(\d+\.?\d*)(K|M|B)?\s*-\s*(\d+\.?\d*)(K|M|B)?/);
  
  if (rangeMatch) {
    const min = parseValueWithMultiplier(rangeMatch[1], rangeMatch[2]);
    const max = parseValueWithMultiplier(rangeMatch[3], rangeMatch[4]);
    return { min, max };
  }
  
  // Single value
  const singleMatch = cleanValue.match(/(\d+\.?\d*)(K|M|B)?/);
  if (singleMatch) {
    const min = parseValueWithMultiplier(singleMatch[1], singleMatch[2]);
    return { min };
  }
  
  return { min: 0 };
}

function parseValueWithMultiplier(num: string, multiplier?: string): number {
  const base = parseFloat(num);
  if (!multiplier) return base;
  
  switch (multiplier) {
    case 'K':
      return base * 1000;
    case 'M':
      return base * 1000000;
    case 'B':
      return base * 1000000000;
    default:
      return base;
  }
}

/**
 * Parse opportunity type to dashboard format
 */
function parseOpportunityType(type: string): 'Federal' | 'State' | 'Local' | 'Emergency' {
  const t = type.toUpperCase();
  
  if (t.includes('EMERGENCY')) {
    return 'Emergency';
  }
  if (t.includes('FEDERAL')) {
    return 'Federal';
  }
  if (t.includes('STATE')) {
    return 'State';
  }
  if (t.includes('LOCAL') || t.includes('TRANSIT')) {
    return 'Local';
  }
  
  // Default based on agency if available
  return 'Federal';
}

/**
 * Parse status to dashboard status
 */
function parseStatus(status: string): 'new' | 'registered' | 'reviewing' | 'preparing' | 'submitted' | 'awarded' | 'declined' | 'lost' {
  const s = status.toUpperCase();
  
  if (s.includes('CRITICAL') || s.includes('IMMEDIATE')) {
    return 'new';
  }
  if (s.includes('REGISTRATION')) {
    return 'new';
  }
  if (s.includes('TRACKING') || s.includes('EXPLORING')) {
    return 'new';
  }
  if (s.includes('REVIEWING')) {
    return 'reviewing';
  }
  if (s.includes('PREPARING')) {
    return 'preparing';
  }
  if (s.includes('SUBMITTED')) {
    return 'submitted';
  }
  if (s.includes('AWARDED') || s.includes('WON')) {
    return 'awarded';
  }
  if (s.includes('DECLINED') || s.includes('LOST')) {
    return 'declined';
  }
  
  return 'new';
}

/**
 * Parse due date from various formats
 */
function parseDueDate(dueDate?: string): string | undefined {
  if (!dueDate || dueDate.toUpperCase().includes('UNKNOWN')) {
    return undefined;
  }
  
  // If it contains "URGENT" or "TODAY", suggest 7 days from now
  if (dueDate.toUpperCase().includes('URGENT') || dueDate.toUpperCase().includes('TODAY')) {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  }
  
  // Try to parse actual date
  try {
    const parsed = new Date(dueDate);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  } catch (e) {
    // Invalid date
  }
  
  return undefined;
}

/**
 * Convert BidMatch opportunity to GovContractItem
 */
function convertBidMatchOpportunity(bidMatch: BidMatchOpportunity, index: number): GovContractItem {
  const values = parseValue(bidMatch.value);
  const capabilityMatch = parseCapabilityMatch(bidMatch.match);
  const priority = parsePriority(bidMatch.priority);
  const opportunityType = parseOpportunityType(bidMatch.type);
  const status = parseStatus(bidMatch.status);
  const dueDate = parseDueDate(bidMatch.due_date);
  
  // Convert actions to action items
  const actionItems = bidMatch.actions?.map((action, idx) => ({
    id: Date.now() + index * 100 + idx,
    description: action,
    dueDate: dueDate,
    completed: false,
  })) || [];
  
  // Build notes from various fields
  let notes = '';
  if (bidMatch.special_notes) {
    notes += `${bidMatch.special_notes}\n\n`;
  }
  if (bidMatch.capability_alignment) {
    notes += `Primary Capability: ${bidMatch.capability_alignment.primary}\n`;
    if (bidMatch.capability_alignment.secondary && bidMatch.capability_alignment.secondary.length > 0) {
      notes += `Secondary: ${bidMatch.capability_alignment.secondary.join(', ')}\n`;
    }
  }
  if (bidMatch.geographic) {
    notes += `\nLocation: ${bidMatch.geographic.state} - ${bidMatch.geographic.sector}`;
  }
  if (bidMatch.contact) {
    notes += `\n\nContact Info:\n`;
    if (bidMatch.contact.organization) notes += `Org: ${bidMatch.contact.organization}\n`;
    if (bidMatch.contact.website) notes += `Web: ${bidMatch.contact.website}\n`;
    if (bidMatch.contact.phone) notes += `Phone: ${bidMatch.contact.phone}\n`;
    if (bidMatch.contact.email) notes += `Email: ${bidMatch.contact.email}\n`;
    if (bidMatch.contact.note) notes += `Note: ${bidMatch.contact.note}\n`;
  }
  
  // Determine registration required
  const registrationRequired = bidMatch.requirements?.sam_registration || 
                               bidMatch.status.toUpperCase().includes('REGISTRATION') ||
                               false;
  
  const item: GovContractItem = {
    id: Date.now() + index * 1000, // Unique ID based on import time and index
    opportunityNumber: `#${bidMatch.opp_number}`,
    title: bidMatch.title,
    agency: bidMatch.agency,
    opportunityType,
    portalUrl: bidMatch.portal_url || bidMatch.direct_link,
    solicitationNumber: bidMatch.solicitation_id,
    status,
    priority,
    capabilityMatch,
    estimatedValue: values.min,
    estimatedValueMax: values.max,
    dueDate,
    naicsCode: bidMatch.requirements?.naics_code,
    actionItems,
    registrationRequired,
    registrationStatus: registrationRequired ? 'not_started' : undefined,
    teamingRequired: false, // Can be enhanced if data includes this
    notes: notes.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  return item;
}

/**
 * Main parser function - converts BidMatch JSON to GovContractItem array
 */
export function parseBidMatchJSON(data: BidMatchData): GovContractItem[] {
  if (!data.opportunities || !Array.isArray(data.opportunities)) {
    throw new Error('Invalid BidMatch JSON: missing opportunities array');
  }
  
  return data.opportunities.map((opp, index) => convertBidMatchOpportunity(opp, index));
}

/**
 * Validate BidMatch JSON format
 */
export function isBidMatchFormat(data: any): boolean {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.opportunities) &&
    data.opportunities.length > 0 &&
    data.opportunities[0].opp_number !== undefined &&
    data.opportunities[0].match !== undefined
  );
}

