import { useState, useEffect, useCallback } from 'react';
import type { Order, LicenseType, Category } from './types';
import { DEMO_BUYER } from './useAuth';

const ORDERS_STORAGE_KEY = 'artloop_orders';
const ORDERS_SEED_KEY = 'artloop_orders_seeded_v1';

export const DEMO_ORDER: Order = {
  id: 'ORD-2026-10492',
  artworkId: 'w12',
  artworkTitle: 'Sketch on Table',
  artworkImage: 'https://images.pexels.com/photos/28890271/pexels-photo-28890271.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  category: 'Illustration',
  aspect: 'portrait',
  artistId: 'a3',
  artistName: 'Kavya Rao',
  buyerId: DEMO_BUYER.id,
  buyerName: DEMO_BUYER.name,
  buyerEmail: DEMO_BUYER.email,
  price: 950,
  licenseType: 'Personal Display',
  digitalDeliverableUrl: 'https://images.pexels.com/photos/28890271/pexels-photo-28890271.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  certificateId: 'CERT-AL-99824X',
  status: 'completed',
  createdAt: '2026-10-04T12:00:00.000Z',
  isDemo: true,
};

function loadStoredOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function seedOrdersOnce(): void {
  try {
    if (localStorage.getItem(ORDERS_SEED_KEY)) return;
    const existing = loadStoredOrders();
    const hasDemo = existing.some((o) => o.id === DEMO_ORDER.id);
    if (!hasDemo) {
      const initial = [DEMO_ORDER, ...existing];
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(initial));
    }
    localStorage.setItem(ORDERS_SEED_KEY, 'true');
  } catch {
    // ignore
  }
}

seedOrdersOnce();

let currentOrders: Order[] = loadStoredOrders();
const orderListeners = new Set<() => void>();

function notifyOrderListeners() {
  orderListeners.forEach((fn) => fn());
}

function persistOrders(orders: Order[]): void {
  currentOrders = orders;
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // ignore
  }
  notifyOrderListeners();
}

export function generateCertificateText(order: Order): string {
  const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `================================================================================
               ARTLOOP DIGITAL CERTIFICATE OF AUTHENTICITY
================================================================================

ORDER REFERENCE:     ${order.id}
CERTIFICATE SERIAL:  ${order.certificateId}
REGISTRATION DATE:   ${dateStr}

------------------------------- ARTWORK DETAILS --------------------------------
Title:               ${order.artworkTitle}
Category:            ${order.category}
Format / Aspect:     ${order.aspect}
Student Creator:     ${order.artistName}
Acquisition Price:   ₹${order.price.toLocaleString('en-IN')} (INR)
Deliverable File:    High-Resolution Master Raster File (JPG/PNG)

------------------------------ COLLECTOR RIGHTS --------------------------------
Registered Buyer:    ${order.buyerName}
Buyer Contact:       ${order.buyerEmail}
License Tier:        ${order.licenseType}
Grant of Rights:     Perpetual, worldwide, non-exclusive license for personal
                     digital exhibition, framing, and private viewing.
Restrictions:        No commercial exploitation, resale, sublicensing, or
                     inclusion in generative AI datasets without express
                     written permission from the creator.

------------------------------ VERIFICATION NOTICE -----------------------------
Platform:            ArtLoop Student Marketplace (Techformers 2026)
Architecture:        Client-side Demo Prototype Architecture
Validation Hash:     SHA-DEMO-${order.id.slice(-6)}-${order.certificateId.slice(-4)}

Thank you for directly backing emerging student talent in India.
================================================================================`;
}

export function downloadCertificate(order: Order): void {
  const text = generateCertificateText(order);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ArtLoop-Certificate-${order.id}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadArtworkDeliverable(order: Order): Promise<void> {
  try {
    const response = await fetch(order.digitalDeliverableUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = order.artworkTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    a.download = `ArtLoop-${safeTitle}-${order.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    // If browser blocks cross-origin fetch for external demo image, open in new tab
    window.open(order.digitalDeliverableUrl, '_blank');
  }
}

export type CreateOrderInput = {
  artworkId: string;
  artworkTitle: string;
  artworkImage: string;
  category: Category;
  aspect: 'portrait' | 'landscape' | 'square';
  artistId: string;
  artistName: string;
  buyerId?: string;
  buyerName: string;
  buyerEmail: string;
  price: number;
  licenseType?: LicenseType;
};

export function useOrders() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    orderListeners.add(handleUpdate);
    return () => {
      orderListeners.delete(handleUpdate);
    };
  }, []);

  const orders = currentOrders;

  const isArtworkSold = useCallback(
    (artworkId: string): boolean => {
      return orders.some((o) => o.artworkId === artworkId && o.status === 'completed');
    },
    [orders]
  );

  const getOrdersByBuyer = useCallback(
    (buyerId?: string, buyerEmail?: string): Order[] => {
      const cleanEmail = buyerEmail ? buyerEmail.trim().toLowerCase() : '';
      return orders.filter((o) => {
        if (buyerId && o.buyerId === buyerId) return true;
        if (cleanEmail && o.buyerEmail.trim().toLowerCase() === cleanEmail) return true;
        return false;
      });
    },
    [orders]
  );

  const getOrdersByArtist = useCallback(
    (artistId: string): Order[] => {
      return orders.filter((o) => o.artistId === artistId);
    },
    [orders]
  );

  const getSalesStatsForArtist = useCallback(
    (artistId: string) => {
      const artistOrders = orders.filter((o) => o.artistId === artistId && o.status === 'completed');
      const salesCount = artistOrders.length;
      const totalEarnings = artistOrders.reduce((sum, o) => sum + o.price, 0);
      return { salesCount, totalEarnings, artistOrders };
    },
    [orders]
  );

  const createOrder = useCallback(
    (input: CreateOrderInput): { success: boolean; order?: Order; error?: string } => {
      // 1. Validation: price
      if (typeof input.price !== 'number' || isNaN(input.price) || input.price <= 0) {
        return { success: false, error: 'Invalid artwork price.' };
      }

      // 2. Validation: buyer info
      if (!input.buyerName.trim()) {
        return { success: false, error: 'Buyer name is required.' };
      }
      if (!input.buyerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.buyerEmail.trim())) {
        return { success: false, error: 'Valid buyer email is required.' };
      }

      // 3. Validation: prevent duplicate purchase if one-of-a-kind already sold
      const alreadySold = currentOrders.some(
        (o) => o.artworkId === input.artworkId && o.status === 'completed'
      );
      if (alreadySold) {
        return {
          success: false,
          error: 'This one-of-a-kind artwork has already been collected.',
        };
      }

      // Generate unique IDs
      const uniqueSuffix = Math.random().toString(36).slice(2, 6).toUpperCase();
      const orderId = `ORD-${Date.now().toString().slice(-6)}-${uniqueSuffix}`;
      const certId = `CERT-AL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      const newOrder: Order = {
        id: orderId,
        artworkId: input.artworkId,
        artworkTitle: input.artworkTitle,
        artworkImage: input.artworkImage,
        category: input.category,
        aspect: input.aspect,
        artistId: input.artistId,
        artistName: input.artistName,
        buyerId: input.buyerId,
        buyerName: input.buyerName.trim(),
        buyerEmail: input.buyerEmail.trim().toLowerCase(),
        price: input.price,
        licenseType: input.licenseType || 'Personal Display',
        digitalDeliverableUrl: input.artworkImage,
        certificateId: certId,
        status: 'completed',
        createdAt: new Date().toISOString(),
        isDemo: true,
      };

      const updated = [newOrder, ...currentOrders];
      persistOrders(updated);

      return { success: true, order: newOrder };
    },
    []
  );

  return {
    orders,
    isArtworkSold,
    getOrdersByBuyer,
    getOrdersByArtist,
    getSalesStatsForArtist,
    createOrder,
  };
}
