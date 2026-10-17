import { useState, useEffect, useCallback } from 'react';
import type { BuyerProfile, CreatorProfile, Commission, PurchaseEnquiry, Category } from './types';

export type UserRole = 'buyer' | 'creator';

export type AuthSession =
  | { role: 'buyer'; user: BuyerProfile }
  | { role: 'creator'; user: CreatorProfile }
  | null;

const AUTH_KEY = 'artloop_auth_session';
const WISHLIST_KEY = 'artloop_wishlist';
const SEED_FLAG_KEY = 'artloop_demo_seed_done';

export const DEMO_BUYER: BuyerProfile = {
  id: 'buyer_priya_demo',
  name: 'Priya Sharma',
  email: 'priya.sharma@example.com',
  avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  phone: '+91 98201 44520',
  location: 'Mumbai, Maharashtra',
  savedArtworkIds: ['w1', 'w5', 'w12'],
  createdAt: '2026-09-10T10:00:00.000Z',
  password: 'password123',
};

export const DEMO_CREATOR: CreatorProfile = {
  id: 'a1',
  name: 'Aanya Mehta',
  slug: 'aanya-mehta',
  email: 'aanya.mehta@artloop.demo',
  discipline: 'Painting',
  bio: 'Aanya translates monsoon light, family archives, and city rhythms into large-scale abstract paintings. Her work explores memory, color, and the feeling of home between places.',
  avatar: 'https://images.pexels.com/photos/32323486/pexels-photo-32323486.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  location: 'Mumbai, Maharashtra',
  university: 'Sir J. J. Institute of Applied Art, Mumbai',
  startingPrice: 2000,
  createdAt: '2026-09-01T10:00:00.000Z',
  password: 'password123',
};

const DEMO_COMMISSIONS: Commission[] = [
  {
    id: 'c_demo_1',
    artistId: 'a1',
    artistName: 'Aanya Mehta',
    buyerId: 'buyer_priya_demo',
    buyerName: 'Priya Sharma',
    buyerEmail: 'priya.sharma@example.com',
    projectDescription: 'Large acrylic landscape depicting Marine Drive in the gentle monsoon rain with warm street lamp reflections.',
    budget: 8500,
    deadline: '2026-11-25',
    status: 'in-progress',
    createdAt: '2026-10-02T14:30:00.000Z',
  },
  {
    id: 'c_demo_2',
    artistId: 'a2',
    artistName: 'Ira Nair',
    buyerId: 'buyer_priya_demo',
    buyerName: 'Priya Sharma',
    buyerEmail: 'priya.sharma@example.com',
    projectDescription: 'A custom digital typography composition based on brutalist architecture and contemporary Indian vernacular signage.',
    budget: 4500,
    deadline: '2026-12-10',
    status: 'accepted',
    createdAt: '2026-10-09T11:15:00.000Z',
  },
];

const DEMO_ENQUIRIES: PurchaseEnquiry[] = [
  {
    id: 'enq_demo_1',
    artworkId: 'w1',
    artworkTitle: 'Monsoon Cadence',
    artistId: 'a1',
    artistName: 'Aanya Mehta',
    buyerId: 'buyer_priya_demo',
    buyerName: 'Priya Sharma',
    buyerEmail: 'priya.sharma@example.com',
    message: 'Hello Aanya, we loved this piece when we saw it featured. Could you let us know if it is framed or can be framed before shipping?',
    offerPrice: 4200,
    status: 'responded',
    createdAt: '2026-10-05T09:20:00.000Z',
  },
  {
    id: 'enq_demo_2',
    artworkId: 'w7',
    artworkTitle: 'Subtle Geometry',
    artistId: 'a2',
    artistName: 'Ira Nair',
    buyerId: 'buyer_priya_demo',
    buyerName: 'Priya Sharma',
    buyerEmail: 'priya.sharma@example.com',
    message: 'Hi Ira, I would love to acquire this artwork for our art collection. Is the original canvas still available?',
    offerPrice: 3800,
    status: 'new',
    createdAt: '2026-10-14T16:45:00.000Z',
  },
];

function seedDemoDataOnce(): void {
  try {
    if (localStorage.getItem(SEED_FLAG_KEY)) {
      return;
    }
    const rawComms = localStorage.getItem('artloop_commissions');
    const existingComms: Commission[] = rawComms ? JSON.parse(rawComms) : [];
    const hasPriyaComms = existingComms.some(
      (c) => c.buyerEmail === DEMO_BUYER.email || c.buyerId === DEMO_BUYER.id,
    );
    if (!hasPriyaComms) {
      localStorage.setItem('artloop_commissions', JSON.stringify([...DEMO_COMMISSIONS, ...existingComms]));
    }

    const rawEnqs = localStorage.getItem('artloop_purchase_enquiries');
    const existingEnqs: PurchaseEnquiry[] = rawEnqs ? JSON.parse(rawEnqs) : [];
    const hasPriyaEnq = existingEnqs.some(
      (e) => e.buyerEmail === DEMO_BUYER.email || e.buyerId === DEMO_BUYER.id,
    );
    if (!hasPriyaEnq) {
      localStorage.setItem('artloop_purchase_enquiries', JSON.stringify([...DEMO_ENQUIRIES, ...existingEnqs]));
    }

    localStorage.setItem(SEED_FLAG_KEY, 'true');
  } catch {
    // ignore
  }
}

// Run initial seed once on module load
seedDemoDataOnce();

function loadInitialSession(): AuthSession {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) {
      return JSON.parse(raw) as AuthSession;
    }
    // Backward compatibility check for creator session
    const oldCreator = localStorage.getItem('artloop_creator_session');
    if (oldCreator) {
      const creator = JSON.parse(oldCreator) as CreatorProfile;
      return { role: 'creator', user: creator };
    }
  } catch {
    // ignore
  }
  return null;
}

function loadWishlist(): string[] {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    void err;
  }
  return DEMO_BUYER.savedArtworkIds;
}

// Module-level state & listener dispatch for synchronized single source of truth
let currentSession: AuthSession = loadInitialSession();
let currentWishlist: string[] = loadWishlist();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function updateSession(session: AuthSession) {
  currentSession = session;
  try {
    if (session) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(session));
      // Keep legacy keys in sync for existing subcomponents
      if (session.role === 'creator') {
        localStorage.setItem('artloop_creator_session', JSON.stringify(session.user));
      } else {
        localStorage.removeItem('artloop_creator_session');
      }
    } else {
      localStorage.removeItem(AUTH_KEY);
      localStorage.removeItem('artloop_creator_session');
    }
  } catch (err) {
    void err;
  }
  notify();
}

function updateWishlist(ids: string[]) {
  currentWishlist = ids;
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
  } catch (err) {
    void err;
  }
  notify();
}

export function useAuth() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const session = currentSession;
  const role: UserRole | null = session ? session.role : null;
  const buyer: BuyerProfile | null = session && session.role === 'buyer' ? session.user : null;
  const creator: CreatorProfile | null = session && session.role === 'creator' ? session.user : null;

  const loginBuyer = useCallback((buyerProfile: BuyerProfile) => {
    updateSession({ role: 'buyer', user: buyerProfile });
  }, []);

  const loginBuyerByNameEmail = useCallback(
    (name: string, email: string, password?: string): BuyerProfile => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim() || 'Art Buyer';

      let existingBuyers: BuyerProfile[] = [];
      try {
        const raw = localStorage.getItem('artloop_buyer_profiles');
        if (raw) existingBuyers = JSON.parse(raw);
      } catch {
        existingBuyers = [];
      }

      if (cleanEmail === DEMO_BUYER.email.toLowerCase()) {
        const profile: BuyerProfile = {
          ...DEMO_BUYER,
          name: cleanName !== 'Art Buyer' ? cleanName : DEMO_BUYER.name,
          savedArtworkIds: currentWishlist.length > 0 ? currentWishlist : DEMO_BUYER.savedArtworkIds,
          password: password || DEMO_BUYER.password,
        };
        updateSession({ role: 'buyer', user: profile });
        return profile;
      }

      const match = existingBuyers.find((b) => b.email.toLowerCase() === cleanEmail);
      if (match) {
        const updated: BuyerProfile = {
          ...match,
          name: cleanName !== 'Art Buyer' ? cleanName : match.name,
          password: password || match.password,
          savedArtworkIds: currentWishlist.length > 0 ? currentWishlist : match.savedArtworkIds,
        };
        updateSession({ role: 'buyer', user: updated });
        return updated;
      }

      const profile: BuyerProfile = {
        id: `buyer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: cleanName,
        email: cleanEmail,
        savedArtworkIds: currentWishlist,
        createdAt: new Date().toISOString(),
        password: password || 'password123',
      };

      try {
        localStorage.setItem('artloop_buyer_profiles', JSON.stringify([...existingBuyers, profile]));
      } catch {
        // ignore
      }

      updateSession({ role: 'buyer', user: profile });
      return profile;
    },
    []
  );

  const quickLoginDemoBuyer = useCallback((): BuyerProfile => {
    const profile: BuyerProfile = {
      ...DEMO_BUYER,
      savedArtworkIds: currentWishlist.length > 0 ? currentWishlist : DEMO_BUYER.savedArtworkIds,
    };
    updateSession({ role: 'buyer', user: profile });
    return profile;
  }, []);

  const loginCreator = useCallback((creatorProfile: CreatorProfile) => {
    updateSession({ role: 'creator', user: creatorProfile });
  }, []);

  const quickLoginDemoCreator = useCallback((): CreatorProfile => {
    updateSession({ role: 'creator', user: DEMO_CREATOR });
    return DEMO_CREATOR;
  }, []);

  const loginCreatorByNameEmail = useCallback(
    (
      name: string,
      email: string,
      password?: string,
      avatarOrExtra?:
        | string
        | {
            discipline?: Category;
            university?: string;
            location?: string;
            avatar?: string;
            bio?: string;
          }
    ): CreatorProfile => {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = name.trim() || 'Student Creator';
      const slug = cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const extra =
        typeof avatarOrExtra === 'object' && avatarOrExtra !== null
          ? avatarOrExtra
          : { avatar: typeof avatarOrExtra === 'string' ? avatarOrExtra : undefined };

      const avatar = extra.avatar;
      const discipline = extra.discipline || 'Painting';
      const university = extra.university || 'Art & Design Institute';
      const location = extra.location || 'Mumbai, India';
      const bio = extra.bio || `Student creator portfolio of ${cleanName}.`;

      // Check if existing profile in artloop_creator_profiles
      let existingProfiles: CreatorProfile[] = [];
      try {
        const raw = localStorage.getItem('artloop_creator_profiles');
        if (raw) existingProfiles = JSON.parse(raw);
      } catch {
        existingProfiles = [];
      }

      const match = existingProfiles.find((p) => p.email.toLowerCase() === cleanEmail);
      if (match) {
        const updated: CreatorProfile = {
          ...match,
          avatar: avatar || match.avatar,
          password: password || match.password,
          discipline: extra.discipline || match.discipline,
          university: extra.university || match.university,
          location: extra.location || match.location,
        };
        updateSession({ role: 'creator', user: updated });
        return updated;
      }

      if (cleanEmail === DEMO_CREATOR.email.toLowerCase()) {
        const profile: CreatorProfile = {
          ...DEMO_CREATOR,
          name: cleanName || DEMO_CREATOR.name,
          avatar: avatar || DEMO_CREATOR.avatar,
          password: password || DEMO_CREATOR.password,
        };
        updateSession({ role: 'creator', user: profile });
        return profile;
      }

      const newProfile: CreatorProfile = {
        id: `creator_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: cleanName,
        slug,
        email: cleanEmail,
        discipline,
        bio,
        avatar:
          avatar ||
          'https://images.pexels.com/photos/32323486/pexels-photo-32323486.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
        location,
        university,
        startingPrice: 2000,
        createdAt: new Date().toISOString(),
        password: password || 'password123',
      };

      try {
        localStorage.setItem(
          'artloop_creator_profiles',
          JSON.stringify([...existingProfiles, newProfile])
        );
      } catch {
        // ignore
      }

      updateSession({ role: 'creator', user: newProfile });
      return newProfile;
    },
    []
  );

  const signOut = useCallback(() => {
    updateSession(null);
  }, []);

  const toggleSaveArtwork = useCallback((artworkId: string): boolean => {
    const exists = currentWishlist.includes(artworkId);
    const next = exists
      ? currentWishlist.filter((id) => id !== artworkId)
      : [...currentWishlist, artworkId];
    updateWishlist(next);

    if (currentSession && currentSession.role === 'buyer') {
      const updatedBuyer: BuyerProfile = {
        ...currentSession.user,
        savedArtworkIds: next,
      };
      updateSession({ role: 'buyer', user: updatedBuyer });
    }
    return !exists;
  }, []);

  const isArtworkSaved = useCallback(
    (artworkId: string): boolean => {
      return currentWishlist.includes(artworkId);
    },
    [],
  );

  return {
    session,
    role,
    buyer,
    creator,
    loginBuyer,
    loginBuyerByNameEmail,
    quickLoginDemoBuyer,
    loginCreator,
    quickLoginDemoCreator,
    loginCreatorByNameEmail,
    signOut,
    savedArtworkIds: currentWishlist,
    toggleSaveArtwork,
    isArtworkSaved,
  };
}
