'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import type { Goal, PipelineItem, LeadItem, GovContractItem } from '@/types';

export function usePipelineData() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [leadsPipeline, setLeadsPipeline] = useState<LeadItem[]>([]);
  const [salesPipeline, setSalesPipeline] = useState<PipelineItem[]>([]);
  const [activeClients, setActiveClients] = useState<PipelineItem[]>([]);
  const [lostDeals, setLostDeals] = useState<PipelineItem[]>([]);
  const [formerClients, setFormerClients] = useState<PipelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      // Load all data with individual error handling to prevent one failure from blocking all
      const results = await Promise.allSettled([
        storage.getGoals(),
        storage.getLeadsPipeline(),
        storage.getSalesPipeline(),
        storage.getActiveClients(),
        storage.getLostDeals(),
        storage.getFormerClients(),
        storage.getLeadPipeline(), // Legacy
      ]);

      const savedGoals = results[0].status === 'fulfilled' ? results[0].value : [];
      const savedLeads = results[1].status === 'fulfilled' ? results[1].value : [];
      const savedSales = results[2].status === 'fulfilled' ? results[2].value : [];
      const savedClients = results[3].status === 'fulfilled' ? results[3].value : [];
      const savedLostDeals = results[4].status === 'fulfilled' ? results[4].value : [];
      const savedFormerClients = results[5].status === 'fulfilled' ? results[5].value : [];
      const legacyLeads = results[6].status === 'fulfilled' ? results[6].value : [];

      setGoals(savedGoals || []);
      setLeadsPipeline(savedLeads || []);
      
      // Merge legacy leadPipeline into salesPipeline if salesPipeline is empty
      if ((!savedSales || savedSales.length === 0) && legacyLeads && legacyLeads.length > 0) {
        setSalesPipeline(legacyLeads);
      } else {
        setSalesPipeline(savedSales || []);
      }
      
      setActiveClients(savedClients || []);
      setLostDeals(savedLostDeals || []);
      setFormerClients(savedFormerClients || []);
    } catch (error) {
      console.error('Error loading data:', error);
      // Set defaults on error to prevent infinite loading
      setGoals([]);
      setLeadsPipeline([]);
      setSalesPipeline([]);
      setActiveClients([]);
      setLostDeals([]);
      setFormerClients([]);
    } finally {
      // Always set loading to false, even if there's an error
      setLoading(false);
    }
  };

  return {
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
    refresh: loadAllData,
  };
}

export function useGovContracts() {
  const [contracts, setContracts] = useState<GovContractItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedContracts = await storage.getGovContracts();
      setContracts(savedContracts || []);
    } catch (error) {
      console.error('Error loading government contracts:', error);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    contracts,
    setContracts,
    loading,
    refresh: loadData,
  };
}

