import { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldCheck, Download, FileText, ArrowRight, AlertCircle, Sparkles, User } from 'lucide-react';
import type { Artwork, Artist, Order } from '../types';
import type { Page } from './Nav';
import { inr } from '../format';
import { useAuth } from '../useAuth';
import { useOrders, downloadCertificate, downloadArtworkDeliverable } from '../useOrders';

type CheckoutModalProps = {
  artwork: Artwork | null;
  artist?: Artist;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page, artistSlug?: string) => void;
};

export default function CheckoutModal({
  artwork,
  artist,
  isOpen,
  onClose,
  onNavigate,
}: CheckoutModalProps) {
  const { buyer, creator, quickLoginDemoBuyer } = useAuth();
  const { createOrder, isArtworkSold } = useOrders();

  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Synchronize state when opening
  useEffect(() => {
    if (isOpen) {
      if (buyer) {
        setBuyerName(buyer.name);
        setBuyerEmail(buyer.email);
      } else {
        setBuyerName('');
        setBuyerEmail('');
      }
      setError('');
      setIsSubmitting(false);
      setConfirmedOrder(null);
    }
  }, [isOpen, buyer]);

  // Keyboard accessibility
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !artwork) return null;

  const isSold = isArtworkSold(artwork.id);
  const isOwner = Boolean(creator && creator.id === artwork.artistId);

  const handleUseDemoBuyer = () => {
    const demo = quickLoginDemoBuyer();
    setBuyerName(demo.name);
    setBuyerEmail(demo.email);
    setError('');
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isOwner) {
      setError('You are signed in as the creator of this artwork. Self-purchases are not allowed.');
      return;
    }

    if (isSold) {
      setError('This one-of-a-kind artwork has already been collected.');
      return;
    }

    if (!buyerName.trim()) {
      setError('Please provide your name.');
      return;
    }

    if (!buyerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    if (artwork.price <= 0) {
      setError('Artwork price must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    // Simulate short network confirmation delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = createOrder({
      artworkId: artwork.id,
      artworkTitle: artwork.title,
      artworkImage: artwork.image,
      category: artwork.category,
      aspect: artwork.aspect,
      artistId: artwork.artistId,
      artistName: artist?.name || 'Student Creator',
      buyerId: buyer?.id,
      buyerName: buyerName.trim(),
      buyerEmail: buyerEmail.trim().toLowerCase(),
      price: artwork.price,
      licenseType: 'Personal Display',
    });

    setIsSubmitting(false);

    if (result.success && result.order) {
      setConfirmedOrder(result.order);
    } else {
      setError(result.error || 'Failed to complete order. Please try again.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative bg-canvas border border-border w-full max-w-xl max-h-[92dvh] flex flex-col shadow-2xl z-10 animate-fade-up overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-canvas/95 backdrop-blur">
          <div>
            <span className="editorial-label text-xs block mb-0.5">
              {confirmedOrder ? 'Order Confirmation' : 'Checkout & Licensing'}
            </span>
            <h2 id="checkout-modal-title" className="font-display text-xl font-bold text-ink">
              {confirmedOrder ? 'Acquisition Successful' : 'Collect Artwork'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted hover:text-ink transition-colors rounded-full hover:bg-canvas-dark/30"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {!confirmedOrder ? (
            /* ─── Step 1: Review & Collect Form ─── */
            <form onSubmit={handleCompleteOrder} className="space-y-5">
              {/* Artwork Summary Row */}
              <div className="flex gap-4 p-3.5 border border-border bg-canvas-dark/15 rounded">
                <img
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-20 h-20 object-cover border border-border shrink-0 bg-canvas"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
                    {artwork.category} · 1 of 1 Edition
                  </span>
                  <h3 className="font-display text-lg font-bold text-ink truncate">
                    {artwork.title}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">
                    by {artist?.name || 'Student Creator'} ({artist?.university || 'Art Institute'})
                  </p>
                  <p className="font-display text-base font-bold text-ink mt-1.5">
                    {inr(artwork.price)}
                  </p>
                </div>
              </div>

              {/* License Scope Card */}
              <div className="border border-border p-3.5 bg-canvas rounded space-y-1.5 text-xs">
                <div className="flex items-center gap-2 font-semibold text-ink">
                  <FileText className="w-4 h-4 text-coral shrink-0" />
                  <span>Personal Display Digital License Included</span>
                </div>
                <p className="text-muted leading-relaxed">
                  Grants perpetual rights for high-resolution private display, digital framing, and exhibition. Artist retains underlying copyright.
                </p>
              </div>

              {/* Self-purchase or Sold Alerts */}
              {isOwner && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Self-Purchase Disabled</strong>
                    You are signed in as the creator of this artwork. Creators cannot buy their own works.
                  </div>
                </div>
              )}

              {isSold && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Already Collected</strong>
                    This one-of-a-kind piece has already been purchased and is no longer available.
                  </div>
                </div>
              )}

              {/* Buyer Information */}
              <div className="space-y-3.5 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="editorial-label text-xs">Collector Information</span>
                  {!buyer && (
                    <button
                      type="button"
                      onClick={handleUseDemoBuyer}
                      className="text-xs font-semibold text-coral hover:text-ink transition-colors underline flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      Fill with Demo Buyer
                    </button>
                  )}
                </div>

                {buyer && (
                  <div className="flex items-center gap-2 text-xs text-muted bg-canvas-dark/20 p-2.5 rounded border border-border">
                    <User className="w-3.5 h-3.5 text-coral shrink-0" />
                    <span>Signed in as <strong className="text-ink font-semibold">{buyer.name}</strong></span>
                  </div>
                )}

                <div>
                  <label className="editorial-label text-xs mb-1 block">Full Name</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="input-field text-sm py-2"
                    required
                  />
                </div>

                <div>
                  <label className="editorial-label text-xs mb-1 block">Email Address (Deliverable Delivery)</label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="e.g. priya@example.com"
                    className="input-field text-sm py-2"
                    required
                  />
                  <p className="text-[11px] text-muted mt-1">
                    Your digital certificate and deliverable reference will be registered to this email.
                  </p>
                </div>
              </div>

              {/* Explicit Hackathon Demo Notice */}
              <div className="p-3 bg-coral/5 border border-coral/20 rounded text-xs text-ink-soft space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-coral">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Demo Mode — No Financial Transaction</span>
                </div>
                <p className="text-[11px] leading-relaxed text-muted">
                  This prototype simulates instant checkout for Techformers 2026. No real credit card or bank transfer is processed. Order will be confirmed and digital deliverable unlocked immediately.
                </p>
              </div>

              {error && (
                <p className="text-xs text-coral font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </p>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || isOwner || isSold}
                  className={`btn-coral w-full justify-center py-3 text-sm font-semibold shadow-sm flex items-center gap-2 ${
                    isSubmitting || isOwner || isSold ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    'Processing Simulated Order...'
                  ) : (
                    <>
                      Confirm & Collect Artwork · {inr(artwork.price)}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* ─── Step 2: Confirmation & Digital Deliverable Screen ─── */
            <div className="text-center space-y-6 animate-fade-up">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border-2 border-emerald-300">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="editorial-label text-xs block mb-1">Acquisition Confirmed</span>
                <h3 className="font-display text-2xl font-bold text-ink">
                  Congratulations, {confirmedOrder.buyerName.split(' ')[0]}!
                </h3>
                <p className="text-sm text-ink-soft mt-1">
                  You are now the registered collector of <strong>{confirmedOrder.artworkTitle}</strong>.
                </p>
              </div>

              {/* Order Metadata Box */}
              <div className="border border-border bg-canvas p-4 rounded text-xs text-left space-y-2">
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted">Order ID</span>
                  <span className="font-mono font-bold text-ink">{confirmedOrder.id}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted">Certificate Serial</span>
                  <span className="font-mono text-ink">{confirmedOrder.certificateId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted">Creator</span>
                  <span className="font-semibold text-ink">{confirmedOrder.artistName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted">Acquisition Total</span>
                  <span className="font-display font-bold text-ink">{inr(confirmedOrder.price)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted">License Type</span>
                  <span className="text-emerald-700 font-semibold">{confirmedOrder.licenseType}</span>
                </div>
              </div>

              {/* Digital Deliverables Action Buttons */}
              <div className="space-y-3 pt-2">
                <p className="editorial-label text-xs">Your Digital Deliverables</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => downloadArtworkDeliverable(confirmedOrder)}
                    className="btn-coral justify-center py-2.5 text-xs font-semibold flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Master File
                  </button>
                  <button
                    onClick={() => downloadCertificate(confirmedOrder)}
                    className="btn-outline justify-center py-2.5 text-xs font-semibold flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Download Certificate
                  </button>
                </div>
              </div>

              {/* Navigation helpers */}
              <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-3 justify-center text-xs">
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('dashboard');
                  }}
                  className="font-semibold text-coral hover:underline py-1"
                >
                  View in Buyer Dashboard →
                </button>
                <span className="hidden sm:inline text-muted">·</span>
                <button
                  onClick={() => {
                    onClose();
                    onNavigate('discover');
                  }}
                  className="font-medium text-muted hover:text-ink py-1"
                >
                  Continue Browsing Discover
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
