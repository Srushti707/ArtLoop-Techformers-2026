import { useState, useMemo, useEffect } from 'react';
import {
  Clock, CheckCircle2, XCircle, Loader2, Mail, Bookmark,
  ArrowUpRight, Trash2, LogOut, ShoppingBag, Download, FileText,
} from 'lucide-react';
import type { Page } from './Nav';
import type { CommissionStatus, EnquiryStatus, Artwork } from '../types';
import { useCommissions } from '../useCommissions';
import { useEnquiries } from '../useCreator';
import { useAuth } from '../useAuth';
import { useMarketplace } from '../useMarketplace';
import { useOrders, downloadCertificate, downloadArtworkDeliverable } from '../useOrders';
import ArtworkImage from './ArtworkImage';
import { inr } from '../format';

type BuyerDashboardProps = {
  onNavigate: (page: Page, artistSlug?: string) => void;
  onEnquireArtwork: (artwork: Artwork) => void;
  onSelectArtwork?: (artwork: Artwork) => void;
};

type Tab = 'orders' | 'commissions' | 'enquiries' | 'saved';

const commissionStatusConfig: Record<
  CommissionStatus,
  { label: string; color: string; bg: string; border: string; icon: typeof Clock }
> = {
  pending: { label: 'Pending Review', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
  accepted: { label: 'Accepted', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: CheckCircle2 },
  'in-progress': { label: 'In Progress', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: Loader2 },
  completed: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2 },
  declined: { label: 'Declined', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle },
};

const enquiryStatusConfig: Record<
  EnquiryStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  new: { label: 'Sent', color: 'text-coral', bg: 'bg-coral/10', border: 'border-coral/30' },
  responded: { label: 'Responded', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  closed: { label: 'Closed', color: 'text-muted', bg: 'bg-canvas-dark/30', border: 'border-border' },
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function BuyerDashboard({ onNavigate, onEnquireArtwork, onSelectArtwork }: BuyerDashboardProps) {
  const { buyer, signOut, savedArtworkIds, toggleSaveArtwork } = useAuth();
  const { commissions, deleteCommission } = useCommissions();
  const { enquiries, deleteEnquiry } = useEnquiries();
  const { allArtworks, allArtists } = useMarketplace();

  const { getOrdersByBuyer } = useOrders();

  const [activeTab, setActiveTab] = useState<Tab>('orders');
  const [filterStatus, setFilterStatus] = useState<'all' | CommissionStatus>('all');
  const [expandedCommId, setExpandedCommId] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter orders for this buyer
  const myOrders = useMemo(() => {
    if (!buyer) return [];
    return getOrdersByBuyer(buyer.id, buyer.email);
  }, [getOrdersByBuyer, buyer]);

  // Filter commissions for this buyer
  const myCommissions = useMemo(() => {
    if (!buyer) return [];
    const bEmail = buyer.email.trim().toLowerCase();
    return commissions.filter((c) => {
      if (c.buyerId && c.buyerId === buyer.id) return true;
      if (c.buyerEmail && c.buyerEmail.trim().toLowerCase() === bEmail) return true;
      return false;
    });
  }, [commissions, buyer]);

  // Filter enquiries for this buyer
  const myEnquiries = useMemo(() => {
    if (!buyer) return [];
    const bEmail = buyer.email.trim().toLowerCase();
    return enquiries.filter((e) => {
      if (e.buyerId && e.buyerId === buyer.id) return true;
      if (e.buyerEmail && e.buyerEmail.trim().toLowerCase() === bEmail) return true;
      return false;
    });
  }, [enquiries, buyer]);

  // Wishlist artworks
  const mySavedArtworks = useMemo(() => {
    return allArtworks.filter((art) => savedArtworkIds.includes(art.id));
  }, [allArtworks, savedArtworkIds]);

  const filteredCommissions = useMemo(() => {
    if (filterStatus === 'all') return myCommissions;
    return myCommissions.filter((c) => c.status === filterStatus);
  }, [myCommissions, filterStatus]);

  if (!buyer) return null;

  return (
    <div className="pt-28 md:pt-36 min-h-screen">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-10 md:mb-14 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div>
            <span className="editorial-label mb-2 block">Buyer Dashboard</span>
            <h1 className="font-display font-bold text-ink text-display-2 mb-3">
              Welcome back, {buyer.name.split(' ')[0]}.
            </h1>
            <p className="text-lg text-ink-soft max-w-2xl">
              Track your collected artworks, custom commissions, purchase enquiries, and saved pieces.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('discover')}
              className="btn-coral flex items-center gap-1.5"
            >
              Browse Discover
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                signOut();
                onNavigate('home');
              }}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-coral transition-colors px-3 py-2"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-10 flex flex-wrap gap-2 border-b border-border pb-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-1 ${
              activeTab === 'orders'
                ? 'border-coral text-coral font-bold'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Purchases & Deliverables
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-canvas-dark text-muted font-bold">
              {myOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('commissions')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-1 ${
              activeTab === 'commissions'
                ? 'border-coral text-coral font-bold'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <Clock className="w-4 h-4" />
            My Commissions
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-canvas-dark text-muted font-bold">
              {myCommissions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('enquiries')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-1 ${
              activeTab === 'enquiries'
                ? 'border-coral text-coral font-bold'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <Mail className="w-4 h-4" />
            Purchase Enquiries
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-canvas-dark text-muted font-bold">
              {myEnquiries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-1 ${
              activeTab === 'saved'
                ? 'border-coral text-coral font-bold'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            Saved Artworks
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-canvas-dark text-muted font-bold">
              {mySavedArtworks.length}
            </span>
          </button>
        </div>

        {/* ─── TAB: PURCHASES & DELIVERABLES ─── */}
        {activeTab === 'orders' && (
          <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-ink">
                  Collected Artworks & Digital Deliverables
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Access your high-resolution original digital files and verifiable certificates of authenticity.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                {myOrders.length} {myOrders.length === 1 ? 'Acquisition' : 'Acquisitions'}
              </span>
            </div>

            {myOrders.length === 0 ? (
              <div className="py-24 text-center border border-border bg-canvas">
                <ShoppingBag className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="font-display text-2xl text-ink mb-2">No collected artworks yet.</p>
                <p className="text-sm text-muted mb-6 max-w-md mx-auto">
                  Browse original works from emerging student artists, verify their digital provenance, and collect pieces with full usage rights.
                </p>
                <button onClick={() => onNavigate('discover')} className="btn-coral">
                  Explore Discover
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myOrders.map((order) => {
                  return (
                    <div
                      key={order.id}
                      className="border border-border bg-canvas p-6 flex flex-col md:flex-row gap-6 items-start justify-between hover:border-ink/40 transition-colors"
                    >
                      <div className="flex gap-4 items-start w-full md:w-auto">
                        <img
                          src={order.artworkImage}
                          alt={order.artworkTitle}
                          className="w-24 h-24 object-cover border border-border shrink-0 bg-canvas-dark/20"
                        />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-coral">
                              {order.id}
                            </span>
                            <span className="text-xs text-muted">·</span>
                            <span className="text-xs text-muted">{formatDate(order.createdAt)}</span>
                            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Completed · Active License
                            </span>
                          </div>
                          <h3 className="font-display text-xl font-bold text-ink">
                            {order.artworkTitle}
                          </h3>
                          <p className="text-xs text-muted">
                            Creator: <strong className="text-ink">{order.artistName}</strong> · {order.category}
                          </p>
                          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                            <span className="font-display text-base font-bold text-ink">
                              {inr(order.price)}
                            </span>
                            <span className="text-muted">·</span>
                            <span className="text-muted">License: <strong className="text-ink">{order.licenseType}</strong></span>
                            <span className="text-muted">·</span>
                            <span className="text-muted">Cert: <code className="font-mono text-ink text-[11px]">{order.certificateId}</code></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0 md:min-w-[190px]">
                        <button
                          onClick={() => downloadArtworkDeliverable(order)}
                          className="btn-coral text-xs py-2 px-3.5 justify-center flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download Master File
                        </button>
                        <button
                          onClick={() => downloadCertificate(order)}
                          className="btn-outline text-xs py-2 px-3.5 justify-center flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Download Certificate
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: COMMISSIONS ─── */}
        {activeTab === 'commissions' && (
          <div>
            {/* Status Filter */}
            {myCommissions.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {(['all', 'pending', 'accepted', 'in-progress', 'completed', 'declined'] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3.5 py-1.5 text-xs font-medium border transition-all ${
                        filterStatus === status
                          ? 'bg-ink text-canvas border-ink'
                          : 'bg-transparent text-ink border-border hover:border-ink'
                      }`}
                    >
                      {status === 'all' ? 'All' : commissionStatusConfig[status].label}
                    </button>
                  ),
                )}
              </div>
            )}

            {filteredCommissions.length === 0 ? (
              <div className="py-24 text-center border border-border bg-canvas">
                <Clock className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="font-display text-2xl text-ink mb-2">No commission requests yet.</p>
                <p className="text-sm text-muted mb-6">
                  {myCommissions.length === 0
                    ? 'Commission custom artwork directly from emerging student artists.'
                    : 'No requests match this filter.'}
                </p>
                {myCommissions.length === 0 && (
                  <button onClick={() => onNavigate('discover')} className="btn-coral">
                    Explore Artists
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCommissions.map((comm) => {
                  const cfg = commissionStatusConfig[comm.status];
                  const StatusIcon = cfg.icon;
                  const isExpanded = expandedCommId === comm.id;
                  const artist = allArtists.find(
                    (a) => a.id === comm.artistId || a.name === comm.artistName,
                  );

                  return (
                    <div
                      key={comm.id}
                      className="border border-border bg-canvas hover:border-ink/40 transition-colors"
                    >
                      <div
                        onClick={() => setExpandedCommId(isExpanded ? null : comm.id)}
                        className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color} shrink-0`}>
                            <StatusIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="font-display text-lg font-bold text-ink">
                                Artist: {comm.artistName}
                              </h3>
                              <span className={`text-xs px-2.5 py-0.5 border font-semibold ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                                {cfg.label}
                              </span>
                            </div>
                            <p className="text-sm text-ink-soft mt-1 line-clamp-1">
                              {comm.projectDescription}
                            </p>
                            <p className="text-xs text-muted mt-1">
                              Submitted {formatDate(comm.createdAt)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 shrink-0 md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-border-soft">
                          <div>
                            <p className="text-xs text-muted">Budget</p>
                            <p className="font-display text-base font-bold text-ink">{inr(comm.budget)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted">Deadline</p>
                            <p className="text-sm text-ink">{formatDate(comm.deadline)}</p>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-6 pb-6 pt-2 border-t border-border-soft bg-canvas-dark/20 text-sm">
                          <p className="editorial-label mb-2">Project Brief</p>
                          <p className="text-ink-soft leading-relaxed mb-4 p-4 bg-canvas border border-border">
                            {comm.projectDescription}
                          </p>

                          <div className="flex items-center justify-between pt-2">
                            {artist ? (
                              <button
                                onClick={() => onNavigate('artist', artist.slug)}
                                className="text-xs text-coral font-medium hover:underline flex items-center gap-1"
                              >
                                View Artist Profile <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            ) : <span />}

                            {comm.status === 'pending' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Cancel this commission request?')) {
                                    deleteCommission(comm.id);
                                  }
                                }}
                                className="text-xs text-muted hover:text-coral flex items-center gap-1 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Cancel request
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: ENQUIRIES ─── */}
        {activeTab === 'enquiries' && (
          <div>
            {myEnquiries.length === 0 ? (
              <div className="py-24 text-center border border-border bg-canvas">
                <Mail className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="font-display text-2xl text-ink mb-2">No purchase enquiries yet.</p>
                <p className="text-sm text-muted mb-6">
                  When browsing Discover, click "Enquire" on any piece to message the artist.
                </p>
                <button onClick={() => onNavigate('discover')} className="btn-coral">
                  Browse Marketplace
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myEnquiries.map((enq) => {
                  const cfg = enquiryStatusConfig[enq.status];
                  const artwork = allArtworks.find((a) => a.id === enq.artworkId);
                  const artist = allArtists.find((a) => a.id === enq.artistId);

                  return (
                    <div key={enq.id} className="border border-border bg-canvas p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          {artwork ? (
                            <div className="w-16 h-16 border border-border overflow-hidden shrink-0">
                              <ArtworkImage src={artwork.image} alt={enq.artworkTitle} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-canvas-dark border border-border flex items-center justify-center shrink-0">
                              <Mail className="w-6 h-6 text-muted" />
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="font-display text-lg font-bold text-ink">
                                {enq.artworkTitle}
                              </h3>
                              <span className={`text-xs px-2.5 py-0.5 border font-semibold ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                                {cfg.label}
                              </span>
                            </div>
                            <p className="text-sm text-muted mt-0.5">
                              Artist: {enq.artistName} · Sent on {formatDate(enq.createdAt)}
                            </p>
                            <p className="text-sm text-ink-soft mt-2 italic bg-canvas-dark/20 p-3 border border-border-soft">
                              "{enq.message}"
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 shrink-0 md:text-right border-t md:border-t-0 pt-3 md:pt-0 border-border-soft">
                          <div>
                            <p className="text-xs text-muted">Your Offer</p>
                            <p className="font-display text-base font-bold text-ink">{inr(enq.offerPrice)}</p>
                          </div>
                          {artwork && (
                            <div>
                              <p className="text-xs text-muted">Listed Price</p>
                              <p className="text-sm text-muted">{inr(artwork.price)}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border-soft flex items-center justify-between text-xs">
                        {artist ? (
                          <button
                            onClick={() => onNavigate('artist', artist.slug)}
                            className="text-coral font-medium hover:underline flex items-center gap-1"
                          >
                            View Artist <ArrowUpRight className="w-3 h-3" />
                          </button>
                        ) : <span />}
                        <button
                          onClick={() => {
                            if (confirm('Delete this enquiry?')) {
                              deleteEnquiry(enq.id);
                            }
                          }}
                          className="text-muted hover:text-coral transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: SAVED ARTWORKS ─── */}
        {activeTab === 'saved' && (
          <div>
            {mySavedArtworks.length === 0 ? (
              <div className="py-24 text-center border border-border bg-canvas">
                <Bookmark className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="font-display text-2xl text-ink mb-2">No saved artworks yet.</p>
                <p className="text-sm text-muted mb-6">
                  Save pieces you like while exploring Discover to keep track of them here.
                </p>
                <button onClick={() => onNavigate('discover')} className="btn-coral">
                  Explore Discover
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mySavedArtworks.map((art) => {
                  const artist = allArtists.find((a) => a.id === art.artistId);
                  return (
                    <div key={art.id} className="border border-border bg-canvas group hover-lift transition-all">
                      <div className="relative aspect-[4/5] overflow-hidden">
                        <button
                          onClick={() => onSelectArtwork ? onSelectArtwork(art) : onNavigate('discover')}
                          className="w-full h-full block text-left focus:outline-none"
                          title="View artwork details"
                        >
                          <ArtworkImage src={art.image} alt={art.title} className="w-full h-full" />
                        </button>
                        <button
                          onClick={() => toggleSaveArtwork(art.id)}
                          className="absolute top-3 right-3 p-2 bg-canvas/90 hover:bg-canvas rounded-full text-coral transition-all"
                          title="Remove from saved"
                        >
                          <Bookmark className="w-4 h-4 fill-coral" />
                        </button>
                        <div className="absolute bottom-3 left-3 bg-canvas/90 px-2.5 py-0.5 text-xs font-semibold text-ink">
                          {art.category}
                        </div>
                      </div>

                      <div className="p-5">
                        <button
                          onClick={() => onSelectArtwork ? onSelectArtwork(art) : onNavigate('discover')}
                          className="text-left block w-full group/title"
                        >
                          <h3 className="font-display text-lg font-bold text-ink truncate group-hover/title:text-coral transition-colors">{art.title}</h3>
                        </button>
                        <p className="text-sm text-muted mt-0.5">
                          {artist ? (
                            <button
                              onClick={() => onNavigate('artist', artist.slug)}
                              className="hover:text-coral transition-colors"
                            >
                              by {artist.name}
                            </button>
                          ) : (
                            'Unknown Artist'
                          )}
                        </p>
                        <div className="mt-4 pt-3 border-t border-border-soft flex items-center justify-between">
                          <span className="font-display text-base font-bold text-ink">{inr(art.price)}</span>
                          <div className="flex items-center gap-1.5">
                            {onSelectArtwork && (
                              <button
                                onClick={() => onSelectArtwork(art)}
                                className="border border-border px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-canvas-dark transition-colors"
                              >
                                View
                              </button>
                            )}
                            <button
                              onClick={() => onEnquireArtwork(art)}
                              className="btn-coral text-xs py-1.5 px-3 flex items-center gap-1"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Enquire
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
