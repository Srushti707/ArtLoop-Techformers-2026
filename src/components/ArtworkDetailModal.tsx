import { useEffect } from 'react';
import { X, Heart, Mail, ShieldCheck, Sparkles, ArrowUpRight, CheckCircle2, User, FileText } from 'lucide-react';
import ArtworkImage from './ArtworkImage';
import type { Artwork, Artist } from '../types';
import type { Page } from './Nav';
import { inr } from '../format';
import { useAuth } from '../useAuth';
import { useOrders } from '../useOrders';

type ArtworkDetailModalProps = {
  artwork: Artwork | null;
  artist?: Artist;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page, artistSlug?: string) => void;
  onBuyNow: (artwork: Artwork, artist?: Artist) => void;
  onEnquire: (artwork: Artwork) => void;
};

export default function ArtworkDetailModal({
  artwork,
  artist,
  isOpen,
  onClose,
  onNavigate,
  onBuyNow,
  onEnquire,
}: ArtworkDetailModalProps) {
  const { creator, isArtworkSaved, toggleSaveArtwork } = useAuth();
  const { isArtworkSold } = useOrders();

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

  const sold = isArtworkSold(artwork.id);
  const isOwner = Boolean(creator && creator.id === artwork.artistId);
  const saved = isArtworkSaved(artwork.id);

  const handleArtistClick = () => {
    if (artist?.slug) {
      onClose();
      onNavigate('artist', artist.slug);
    }
  };

  const handleCommissionClick = () => {
    if (artist?.slug) {
      onClose();
      onNavigate('commission', artist.slug);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 md:p-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="artwork-detail-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="relative bg-canvas border border-border w-full max-w-5xl max-h-[92dvh] flex flex-col shadow-2xl z-10 animate-fade-up overflow-hidden">
        {/* Sticky Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-canvas/95 backdrop-blur z-20">
          <div className="flex items-center gap-3">
            <span className="editorial-label text-xs">Artwork Detail</span>
            {sold ? (
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-ink/10 text-ink border border-ink/20">
                ● Collected / Sold Out
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                ● Available (1 of 1 Original)
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted hover:text-ink transition-colors rounded-full hover:bg-canvas-dark/30"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            {/* Left: Artwork Presentation */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="relative border border-border bg-canvas-dark/10 overflow-hidden shadow-inner flex items-center justify-center min-h-[320px] max-h-[520px]">
                <ArtworkImage
                  src={artwork.image}
                  alt={artwork.title}
                  className="w-full h-full object-contain max-h-[500px]"
                />
                {sold && (
                  <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="px-6 py-2.5 bg-ink text-canvas font-display text-xl uppercase tracking-wider font-bold shadow-lg border border-canvas/20">
                      Collected (1 of 1)
                    </span>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-canvas/90 backdrop-blur px-3 py-1 text-xs font-semibold text-ink border border-border">
                  {artwork.category} · {artwork.aspect}
                </div>
              </div>

              {/* Digital Art Deliverable Guarantee card */}
              <div className="border border-border/80 bg-canvas-dark/20 p-4 rounded text-xs space-y-2">
                <div className="flex items-center gap-2 text-ink font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Digital Deliverable & Verification Guarantee</span>
                </div>
                <p className="text-muted leading-relaxed">
                  Purchasing this work grants you instant access to the uncompressed digital master file, plus a digitally verifiable <strong>ArtLoop Certificate of Authenticity</strong> registered to your name.
                </p>
              </div>
            </div>

            {/* Right: Artwork Details & Acquisition */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                {/* Title & Category */}
                <div>
                  <span className="text-xs uppercase tracking-widest text-muted font-mono">{artwork.category}</span>
                  <h1 id="artwork-detail-title" className="font-display text-3xl md:text-4xl font-bold text-ink mt-1">
                    {artwork.title}
                  </h1>
                </div>

                {/* Creator Attribution */}
                {artist && (
                  <div
                    onClick={handleArtistClick}
                    className="flex items-center gap-3.5 p-3.5 border border-border bg-canvas hover:border-coral transition-colors cursor-pointer group"
                    role="button"
                    tabIndex={0}
                  >
                    <img
                      src={artist.avatar}
                      alt={artist.name}
                      className="w-12 h-12 rounded-full object-cover border border-border shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted">Created by</p>
                      <p className="font-display text-base font-semibold text-ink group-hover:text-coral transition-colors truncate">
                        {artist.name}
                      </p>
                      <p className="text-xs text-muted truncate">{artist.university}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted group-hover:text-coral group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                  </div>
                )}

                {/* Price Display */}
                <div className="pt-2 border-t border-border">
                  <span className="editorial-label text-xs block mb-1">Acquisition Price</span>
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-4xl font-bold text-ink">
                      {inr(artwork.price)}
                    </span>
                    <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                      Zero Buyer Fees
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-1.5">
                    100% of proceeds go directly to supporting this student artist.
                  </p>
                </div>

                {/* Rights & License Terms */}
                <div className="border border-border p-4 bg-canvas space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 font-semibold text-ink">
                    <FileText className="w-4 h-4 text-coral" />
                    <span>License & Usage Rights Included:</span>
                  </div>
                  <ul className="space-y-1.5 text-ink-soft list-disc list-inside">
                    <li>Non-exclusive perpetual personal display license</li>
                    <li>High-resolution digital master file download</li>
                    <li>Unique cryptographic order reference & certificate</li>
                    <li>Student creator retains copyright & moral rights</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-border">
                {sold ? (
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full py-3 px-4 rounded bg-canvas-dark text-muted font-semibold text-sm cursor-not-allowed border border-border flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-muted" />
                      Sold Out — 1 of 1 Edition Collected
                    </button>
                    {artist && (
                      <button
                        onClick={handleCommissionClick}
                        className="btn-outline w-full justify-center py-2.5 text-sm font-medium"
                      >
                        Request custom commission from {artist.name.split(' ')[0]}
                      </button>
                    )}
                  </div>
                ) : isOwner ? (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <User className="w-4 h-4 text-amber-700" />
                      Your Artwork (Creator Preview)
                    </p>
                    <p>You are signed in as the creator of this artwork. Self-purchases are disabled.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <button
                      onClick={() => onBuyNow(artwork, artist)}
                      className="btn-coral w-full justify-center py-3.5 text-base font-semibold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Buy Now · {inr(artwork.price)}
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onEnquire(artwork)}
                        className="btn-outline justify-center py-2.5 text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Enquire / Message
                      </button>
                      <button
                        onClick={() => toggleSaveArtwork(artwork.id)}
                        className={`justify-center py-2.5 text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                          saved
                            ? 'bg-coral/10 border-coral text-coral font-bold'
                            : 'bg-canvas border-border text-ink hover:border-coral'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-coral text-coral' : ''}`} />
                        {saved ? 'In Wishlist' : 'Save to Wishlist'}
                      </button>
                    </div>
                  </div>
                )}

                <p className="text-[11px] text-muted text-center pt-1">
                  ArtLoop Hackathon Prototype · INR Simulated Demo Checkout
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
