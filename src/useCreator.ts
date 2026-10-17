import { useState, useEffect, useCallback } from 'react';
import type { CreatorProfile, CreatorArtwork, PurchaseEnquiry, EnquiryStatus } from './types';

const PROFILES_KEY = 'artloop_creator_profiles';
const ARTWORKS_KEY = 'artloop_creator_artworks';
const ENQUIRIES_KEY = 'artloop_purchase_enquiries';

function loadJSON<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveJSON<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

import { useAuth } from './useAuth';

// ─── Session ──────────────────────────────────────────────

export function useCreatorSession() {
  const { creator, loginCreator, signOut } = useAuth();
  return {
    creator,
    signIn: loginCreator,
    signOut,
  };
}

// ─── Profiles ─────────────────────────────────────────────

export function useCreatorProfiles() {
  const [profiles, setProfiles] = useState<CreatorProfile[]>(() => loadJSON<CreatorProfile>(PROFILES_KEY));

  useEffect(() => { saveJSON(PROFILES_KEY, profiles); }, [profiles]);

  const createProfile = useCallback((data: Omit<CreatorProfile, 'id' | 'slug' | 'createdAt'>): CreatorProfile => {
    const profile: CreatorProfile = {
      ...data,
      id: genId('cr'),
      slug: slugify(data.name),
      createdAt: new Date().toISOString(),
    };
    setProfiles((prev) => [profile, ...prev]);
    return profile;
  }, []);

  const updateProfile = useCallback((id: string, updates: Partial<CreatorProfile>) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  return { profiles, createProfile, updateProfile };
}

// ─── Artworks ─────────────────────────────────────────────

export function useCreatorArtworks() {
  const [artworks, setArtworks] = useState<CreatorArtwork[]>(() => loadJSON<CreatorArtwork>(ARTWORKS_KEY));

  useEffect(() => { saveJSON(ARTWORKS_KEY, artworks); }, [artworks]);

  const addArtwork = useCallback((data: Omit<CreatorArtwork, 'id' | 'createdAt' | 'updatedAt'>): CreatorArtwork => {
    const now = new Date().toISOString();
    const artwork: CreatorArtwork = { ...data, id: genId('cw'), createdAt: now, updatedAt: now };
    setArtworks((prev) => [artwork, ...prev]);
    return artwork;
  }, []);

  const updateArtwork = useCallback((id: string, updates: Partial<CreatorArtwork>) => {
    setArtworks((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a)));
  }, []);

  const deleteArtwork = useCallback((id: string) => {
    setArtworks((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { artworks, addArtwork, updateArtwork, deleteArtwork };
}

// ─── Enquiries ────────────────────────────────────────────

export function useEnquiries() {
  const [enquiries, setEnquiries] = useState<PurchaseEnquiry[]>(() => loadJSON<PurchaseEnquiry>(ENQUIRIES_KEY));

  useEffect(() => { saveJSON(ENQUIRIES_KEY, enquiries); }, [enquiries]);

  const addEnquiry = useCallback((data: Omit<PurchaseEnquiry, 'id' | 'status' | 'createdAt'>): PurchaseEnquiry => {
    const enquiry: PurchaseEnquiry = {
      ...data,
      id: genId('enq'),
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    setEnquiries((prev) => [enquiry, ...prev]);
    return enquiry;
  }, []);

  const updateEnquiryStatus = useCallback((id: string, status: EnquiryStatus) => {
    setEnquiries((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  }, []);

  const deleteEnquiry = useCallback((id: string) => {
    setEnquiries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { enquiries, addEnquiry, updateEnquiryStatus, deleteEnquiry };
}
