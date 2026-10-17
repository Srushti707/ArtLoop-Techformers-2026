import { useState, useEffect, useCallback } from 'react';
import type { Commission, CommissionStatus } from './types';

const STORAGE_KEY = 'artloop_commissions';

function loadCommissions(): Commission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveCommissions(commissions: Commission[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(commissions));
  } catch {
    // ignore quota errors
  }
}

export function useCommissions() {
  const [commissions, setCommissions] = useState<Commission[]>(() => loadCommissions());

  useEffect(() => {
    saveCommissions(commissions);
  }, [commissions]);

  const addCommission = useCallback((c: Omit<Commission, 'id' | 'status' | 'createdAt'>) => {
    const newCommission: Commission = {
      ...c,
      id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setCommissions((prev) => [newCommission, ...prev]);
    return newCommission;
  }, []);

  const updateStatus = useCallback((id: string, status: CommissionStatus) => {
    setCommissions((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  }, []);

  const deleteCommission = useCallback((id: string) => {
    setCommissions((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { commissions, addCommission, updateStatus, deleteCommission };
}
