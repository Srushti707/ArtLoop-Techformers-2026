import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Trash2, ArrowUpRight, Inbox, Clock, CheckCircle2, XCircle, Loader2,
  Plus, Edit3, Mail, Image as ImageIcon, LogOut,
  LayoutGrid, User, Palette, MessageSquare, Upload,
} from 'lucide-react';
import type { Page } from './Nav';
import type { Commission, CommissionStatus, EnquiryStatus, Artwork } from '../types';
import { useCommissions } from '../useCommissions';
import { useEnquiries, useCreatorArtworks, useCreatorProfiles } from '../useCreator';
import { useAuth } from '../useAuth';
import BuyerDashboard from './BuyerDashboard';
import { getImageURL } from '../imageStore';
import { fileToAvatarDataUrl } from '../avatarUtils';
import { inr } from '../format';

type DashboardProps = {
  onNavigate: (page: Page, artistSlug?: string) => void;
  onEditArtwork: (id: string) => void;
  onEnquireArtwork?: (artwork: Artwork) => void;
  onOpenAuth?: (initialRole?: 'buyer' | 'creator', initialMode?: 'signin' | 'signup') => void;
};

type Tab = 'overview' | 'profile' | 'artworks' | 'requests';

const statusConfig: Record<CommissionStatus, { label: string; color: string; bg: string; border: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: Clock },
  accepted: { label: 'Accepted', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: CheckCircle2 },
  'in-progress': { label: 'In Progress', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: Loader2 },
  completed: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle2 },
  declined: { label: 'Declined', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle },
};

const statusOrder: CommissionStatus[] = ['pending', 'accepted', 'in-progress', 'completed', 'declined'];

const enquiryStatusConfig: Record<EnquiryStatus, { label: string; color: string; bg: string; border: string }> = {
  new: { label: 'New', color: 'text-coral', bg: 'bg-coral/10', border: 'border-coral/30' },
  responded: { label: 'Responded', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  closed: { label: 'Closed', color: 'text-muted', bg: 'bg-canvas-dark/30', border: 'border-border' },
};

const allStatuses: ('all' | CommissionStatus)[] = ['all', ...statusOrder];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function Dashboard({
  onNavigate,
  onEditArtwork,
  onEnquireArtwork,
  onOpenAuth,
}: DashboardProps) {
  const { role, buyer, creator, signOut } = useAuth();
  const { updateProfile } = useCreatorProfiles();
  const { commissions, updateStatus, deleteCommission } = useCommissions();
  const { enquiries, updateEnquiryStatus, deleteEnquiry } = useEnquiries();
  const { artworks: creatorArtworks, deleteArtwork } = useCreatorArtworks();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [filterStatus, setFilterStatus] = useState<'all' | CommissionStatus>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [artworkImageUrls, setArtworkImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Resolve image URLs for the creator's own artworks
  useEffect(() => {
    if (!creator) return;
    let cancelled = false;
    Promise.all(
      creatorArtworks.map(async (cw) => {
        const url = await getImageURL(cw.imageKey);
        return [cw.id, url] as const;
      }),
    ).then((results) => {
      if (cancelled) return;
      const map: Record<string, string> = {};
      for (const [id, url] of results) {
        if (url) map[id] = url;
      }
      setArtworkImageUrls(map);
    });
    return () => { cancelled = true; };
  }, [creatorArtworks, creator]);

  // Filter data for the signed-in creator
  const myCommissions = useMemo(
    () => creator ? commissions.filter((c) => c.artistId === creator.id) : [],
    [commissions, creator],
  );

  const myEnquiries = useMemo(
    () => creator ? enquiries.filter((e) => e.artistId === creator.id) : [],
    [enquiries, creator],
  );

  const myArtworks = useMemo(
    () => creator ? creatorArtworks.filter((a) => a.creatorId === creator.id) : [],
    [creatorArtworks, creator],
  );

  const stats = useMemo(() => {
    const totalReqs = myCommissions.length + myEnquiries.length;
    const pending = myCommissions.filter((c) => c.status === 'pending').length + myEnquiries.filter((e) => e.status === 'new').length;
    const active = myCommissions.filter((c) => c.status === 'accepted' || c.status === 'in-progress').length;
    const completed = myCommissions.filter((c) => c.status === 'completed').length;
    const publishedCount = myArtworks.filter((a) => a.status === 'published').length;
    const draftCount = myArtworks.filter((a) => a.status === 'draft').length;
    const totalValue = myCommissions.filter((c) => c.status !== 'declined').reduce((sum, c) => sum + c.budget, 0);
    return { totalReqs, pending, active, completed, publishedCount, draftCount, totalValue };
  }, [myCommissions, myEnquiries, myArtworks]);

  // 1. If logged-in user is a Buyer, render Buyer Dashboard
  if (role === 'buyer' && buyer) {
    return (
      <BuyerDashboard
        onNavigate={onNavigate}
        onEnquireArtwork={onEnquireArtwork || (() => onNavigate('discover'))}
      />
    );
  }

  // 2. If nobody is logged in, show clean prompt with two choices
  if (!creator) {
    return (
      <div className="pt-28 md:pt-36 min-h-screen">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="mb-12 md:mb-16">
            <span className="editorial-label mb-4 block">Dashboard Portal</span>
            <h1 className="font-display font-bold text-ink text-display-2 mb-4">
              Sign in to view your dashboard.
            </h1>
            <p className="text-lg text-ink-soft max-w-2xl">
              Choose your role below to access your commission tracking, artwork requests, or portfolio management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            {/* Buyer Choice */}
            <div className="border border-border p-8 md:p-10 bg-canvas hover:border-coral transition-colors flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-coral/10 text-coral flex items-center justify-center mb-6">
                  <User className="w-6 h-6" />
                </div>
                <span className="editorial-label text-coral block mb-2">Art Collector</span>
                <h2 className="font-display text-2xl font-bold text-ink mb-3">
                  Buyer Dashboard
                </h2>
                <p className="text-ink-soft text-sm leading-relaxed mb-6">
                  Track your custom commissions, follow up on purchase enquiries, and review your saved artwork wishlist.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onOpenAuth ? onOpenAuth('buyer', 'signin') : onNavigate('discover')}
                  className="btn-coral w-full justify-center"
                >
                  Continue as Buyer
                </button>
                <button
                  onClick={() => onOpenAuth ? onOpenAuth('buyer', 'signup') : onNavigate('discover')}
                  className="text-xs text-muted hover:text-coral text-center py-1 font-medium transition-colors"
                >
                  New collector? Create account →
                </button>
              </div>
            </div>

            {/* Creator Choice */}
            <div className="border border-border p-8 md:p-10 bg-canvas hover:border-ink transition-colors flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-full bg-canvas-dark text-ink flex items-center justify-center mb-6">
                  <Palette className="w-6 h-6" />
                </div>
                <span className="editorial-label text-muted block mb-2">Student Artist</span>
                <h2 className="font-display text-2xl font-bold text-ink mb-3">
                  Student Creator Dashboard
                </h2>
                <p className="text-ink-soft text-sm leading-relaxed mb-6">
                  Publish original artwork to Discover, manage client briefs, update commission statuses, and edit your profile.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onOpenAuth ? onOpenAuth('creator', 'signin') : onNavigate('home')}
                  className="btn-outline w-full justify-center"
                >
                  Continue as Student Creator
                </button>
                <button
                  onClick={() => onOpenAuth ? onOpenAuth('creator', 'signup') : onNavigate('home')}
                  className="text-xs text-muted hover:text-coral text-center py-1 font-medium transition-colors"
                >
                  New artist? Sign up as Creator →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. If logged-in user is a Student Creator, render existing Creator Dashboard
  const tabs: { id: Tab; label: string; icon: typeof LayoutGrid }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'artworks', label: 'My Artwork', icon: Palette },
    { id: 'requests', label: 'Requests', icon: MessageSquare },
  ];

  const handleSignOut = () => {
    signOut();
    onNavigate('home');
  };

  return (
    <div className="pt-28 md:pt-36 min-h-screen">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12 md:mb-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div>
            <span className="editorial-label mb-4 block">Student Creator Dashboard</span>
            <h1 className="font-display font-bold text-ink text-display-2 mb-4">
              Welcome back, {creator.name.split(' ')[0]}.
            </h1>
            <p className="text-lg text-ink-soft max-w-2xl">
              Manage your profile, artwork, and incoming requests — all in one place.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('upload')} className="btn-coral">
              <Plus className="w-4 h-4" />
              Upload artwork
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm text-muted hover:text-coral transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-10 flex flex-wrap gap-2 border-b border-border pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-300 border-b-2 -mb-1 ${
                  activeTab === tab.id
                    ? 'border-coral text-coral'
                    : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── Overview Tab ─── */}
        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px border border-border bg-border">
              {[
                { label: 'Published works', value: stats.publishedCount, accent: false },
                { label: 'Drafts', value: stats.draftCount, accent: false },
                { label: 'Total enquiries', value: stats.totalReqs, accent: false },
                { label: 'Portfolio value', value: inr(stats.totalValue), accent: true },
              ].map((stat) => (
                <div key={stat.label} className="bg-canvas p-6">
                  <p className="editorial-label mb-3">{stat.label}</p>
                  <p className={`font-display text-3xl font-bold ${stat.accent ? 'text-coral' : 'text-ink'}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => onNavigate('upload')}
                className="border border-border p-8 text-left hover:border-ink transition-colors group"
              >
                <Plus className="w-6 h-6 text-coral mb-4" />
                <p className="font-display text-lg font-semibold text-ink group-hover:text-coral transition-colors">Upload new artwork</p>
                <p className="text-sm text-muted mt-2">Share a piece with the marketplace.</p>
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className="border border-border p-8 text-left hover:border-ink transition-colors group"
              >
                <Edit3 className="w-6 h-6 text-coral mb-4" />
                <p className="font-display text-lg font-semibold text-ink group-hover:text-coral transition-colors">Edit your profile</p>
                <p className="text-sm text-muted mt-2">Update your bio, location, or pricing.</p>
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className="border border-border p-8 text-left hover:border-ink transition-colors group"
              >
                <MessageSquare className="w-6 h-6 text-coral mb-4" />
                <p className="font-display text-lg font-semibold text-ink group-hover:text-coral transition-colors">
                  {stats.pending > 0 ? `${stats.pending} new requests` : 'View requests'}
                </p>
                <p className="text-sm text-muted mt-2">Review commissions and purchase enquiries.</p>
              </button>
            </div>

            {/* Recent artworks preview */}
            {myArtworks.length > 0 && (
              <div>
                <div className="flex items-end justify-between mb-6">
                  <h2 className="font-display text-xl font-semibold text-ink">Recent uploads</h2>
                  <button onClick={() => setActiveTab('artworks')} className="text-sm text-muted hover:text-coral transition-colors flex items-center gap-1">
                    See all <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {myArtworks.slice(0, 4).map((art) => (
                    <div key={art.id} className="group">
                      <div className={`relative border border-border overflow-hidden ${
                        art.aspect === 'portrait' ? 'aspect-[3/4]' : art.aspect === 'square' ? 'aspect-square' : 'aspect-[4/3]'
                      }`}>
                        {artworkImageUrls[art.id] ? (
                          <img src={artworkImageUrls[art.id]} alt={art.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-canvas-dark/20">
                            <ImageIcon className="w-8 h-8 text-muted" />
                          </div>
                        )}
                        {art.status === 'draft' && (
                          <div className="absolute top-2 left-2 bg-ink/80 text-canvas px-2 py-0.5 text-xs">Draft</div>
                        )}
                      </div>
                      <p className="mt-2 text-sm font-medium text-ink truncate">{art.title}</p>
                      <p className="text-xs text-muted">{inr(art.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── Profile Tab ─── */}
        {activeTab === 'profile' && (
          <ProfileEditor creator={creator} updateProfile={updateProfile} />
        )}

        {/* ─── Artworks Tab ─── */}
        {activeTab === 'artworks' && (
          <div>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">My Artwork</h2>
                <p className="text-sm text-muted mt-1">{myArtworks.length} pieces · {stats.publishedCount} published · {stats.draftCount} drafts</p>
              </div>
              <button onClick={() => onNavigate('upload')} className="btn-coral">
                <Plus className="w-4 h-4" />
                New artwork
              </button>
            </div>

            {myArtworks.length === 0 ? (
              <div className="py-24 text-center border border-border">
                <Palette className="w-12 h-12 text-muted mx-auto mb-6" />
                <p className="font-display text-2xl text-ink mb-4">No artwork yet.</p>
                <p className="text-muted mb-8">Upload your first piece to share it with the marketplace.</p>
                <button onClick={() => onNavigate('upload')} className="btn-coral">
                  <Plus className="w-4 h-4" />
                  Upload artwork
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myArtworks.map((art) => (
                  <div key={art.id} className="border border-border group">
                    <div className={`relative overflow-hidden ${
                      art.aspect === 'portrait' ? 'aspect-[3/4]' : art.aspect === 'square' ? 'aspect-square' : 'aspect-[4/3]'
                    }`}>
                      {artworkImageUrls[art.id] ? (
                        <img src={artworkImageUrls[art.id]} alt={art.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-canvas-dark/20">
                          <ImageIcon className="w-8 h-8 text-muted" />
                        </div>
                      )}
                      <div className={`absolute top-3 left-3 px-2.5 py-1 text-xs font-semibold ${
                        art.status === 'published'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-ink/80 text-canvas'
                      }`}>
                        {art.status === 'published' ? 'Published' : 'Draft'}
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="font-display text-lg font-medium text-ink">{art.title}</p>
                      <p className="text-sm text-muted mt-1">{art.category} · {inr(art.price)}</p>
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={() => onEditArtwork(art.id)}
                          className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-coral transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${art.title}"? This cannot be undone.`)) {
                              deleteArtwork(art.id);
                            }
                          }}
                          className="flex items-center gap-1.5 text-sm text-muted hover:text-coral-dim transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Requests Tab (Commissions + Enquiries) ─── */}
        {activeTab === 'requests' && (
          <div className="space-y-12">
            {/* Enquiries section */}
            <div>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">Purchase Enquiries</h2>
                  <p className="text-sm text-muted mt-1">{myEnquiries.length} enquiries for your artwork</p>
                </div>
              </div>

              {myEnquiries.length === 0 ? (
                <div className="py-16 text-center border border-border">
                  <Mail className="w-10 h-10 text-muted mx-auto mb-4" />
                  <p className="font-display text-lg text-ink mb-2">No purchase enquiries yet.</p>
                  <p className="text-sm text-muted">When buyers enquire about your artwork, they'll appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myEnquiries.map((enq) => {
                    const cfg = enquiryStatusConfig[enq.status];
                    return (
                      <div key={enq.id} className="border border-border bg-canvas">
                        <div className="p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                          <div className={`flex items-center gap-2 px-3 py-1.5 border ${cfg.bg} ${cfg.border} ${cfg.color} text-xs font-semibold shrink-0`}>
                            {cfg.label}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-display text-lg font-semibold text-ink">{enq.artworkTitle}</p>
                            <p className="text-sm text-muted truncate mt-1">
                              From {enq.buyerName} · {enq.message.slice(0, 80)}{enq.message.length > 80 ? '...' : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-6 shrink-0 text-sm">
                            <div className="text-right">
                              <p className="text-muted text-xs">Offer</p>
                              <p className="font-display text-base text-ink">{inr(enq.offerPrice)}</p>
                            </div>
                            <div className="text-right hidden sm:block">
                              <p className="text-muted text-xs">Date</p>
                              <p className="text-ink">{formatDate(enq.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="px-6 pb-6 pt-2 border-t border-border-soft">
                          <p className="text-sm text-ink-soft mb-4">{enq.message}</p>
                          <p className="text-xs text-muted mb-4">Buyer email: {enq.buyerEmail}</p>
                          <div className="flex items-center gap-2">
                            {(['new', 'responded', 'closed'] as EnquiryStatus[]).map((s) => {
                              const c = enquiryStatusConfig[s];
                              return (
                                <button
                                  key={s}
                                  onClick={() => updateEnquiryStatus(enq.id, s)}
                                  className={`px-3 py-1.5 text-xs font-medium border transition-all ${
                                    enq.status === s
                                      ? `${c.bg} ${c.border} ${c.color}`
                                      : 'bg-canvas text-ink border-border hover:border-ink'
                                  }`}
                                >
                                  {c.label}
                                </button>
                              );
                            })}
                            <button
                              onClick={() => deleteEnquiry(enq.id)}
                              className="ml-auto flex items-center gap-1 text-xs text-muted hover:text-coral-dim transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Commissions section */}
            <div>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">Commission Requests</h2>
                  <p className="text-sm text-muted mt-1">{myCommissions.length} commission requests for you</p>
                </div>
              </div>

              <CommissionList
                commissions={myCommissions}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                expandedId={expandedId}
                setExpandedId={setExpandedId}
                updateStatus={updateStatus}
                deleteCommission={deleteCommission}
                onNavigate={onNavigate}
                compact
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────

function CommissionList({
  commissions,
  filterStatus,
  setFilterStatus,
  expandedId,
  setExpandedId,
  updateStatus,
  deleteCommission,
  onNavigate,
  compact = false,
}: {
  commissions: Commission[];
  filterStatus: 'all' | CommissionStatus;
  setFilterStatus: (s: 'all' | CommissionStatus) => void;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  updateStatus: (id: string, status: CommissionStatus) => void;
  deleteCommission: (id: string) => void;
  onNavigate: (page: Page, artistSlug?: string) => void;
  compact?: boolean;
}) {
  const filtered = filterStatus === 'all' ? commissions : commissions.filter((c) => c.status === filterStatus);

  return (
    <div>
      {/* Filter tabs */}
      {!compact && (
        <div className="mb-8 flex flex-wrap gap-2">
          {allStatuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 text-sm font-medium border transition-all duration-300 capitalize ${
                filterStatus === status
                  ? 'bg-ink text-canvas border-ink'
                  : 'bg-transparent text-ink border-border hover:border-ink'
              }`}
            >
              {status === 'all' ? 'All requests' : statusConfig[status].label}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="py-24 text-center border border-border">
          <Inbox className="w-12 h-12 text-muted mx-auto mb-6" />
          <p className="font-display text-2xl text-ink mb-4">
            {commissions.length === 0 ? 'No commission requests yet.' : 'No requests with this status.'}
          </p>
          <p className="text-muted mb-8">
            {commissions.length === 0
              ? 'When someone sends a commission request, it will appear here.'
              : 'Try a different filter to see more requests.'}
          </p>
          {commissions.length === 0 && (
            <button onClick={() => onNavigate('discover')} className="btn-coral">
              Explore the artists
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((commission) => {
            const isExpanded = expandedId === commission.id;
            const config = statusConfig[commission.status];
            const StatusIcon = config.icon;

            return (
              <div key={commission.id} className="border border-border bg-canvas transition-all duration-300 hover:border-ink/30">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : commission.id)}
                  className="w-full text-left p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-8"
                >
                  <div className={`flex items-center gap-2 px-3 py-1.5 border ${config.bg} ${config.border} ${config.color} text-xs font-semibold shrink-0`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${commission.status === 'in-progress' ? 'animate-spin' : ''}`} />
                    {config.label}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-lg font-semibold text-ink truncate">{commission.buyerName}</p>
                    <p className="text-sm text-muted truncate">
                      {commission.projectDescription.slice(0, 80)}{commission.projectDescription.length > 80 ? '...' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 md:gap-8 shrink-0 text-sm">
                    <div className="text-right">
                      <p className="text-muted text-xs">Budget</p>
                      <p className="font-display text-base text-ink">{inr(commission.budget)}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-muted text-xs">Deadline</p>
                      <p className="text-ink">{formatDate(commission.deadline)}</p>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 md:px-8 pb-8 animate-slide-in">
                    <div className="pt-6 border-t border-border-soft">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                          <p className="editorial-label mb-2">Buyer name</p>
                          <p className="text-ink">{commission.buyerName}</p>
                        </div>
                        <div>
                          <p className="editorial-label mb-2">Buyer email</p>
                          <p className="text-ink">{commission.buyerEmail}</p>
                        </div>
                        <div>
                          <p className="editorial-label mb-2">Budget</p>
                          <p className="font-display text-xl text-ink">{inr(commission.budget)}</p>
                        </div>
                        <div>
                          <p className="editorial-label mb-2">Deadline</p>
                          <p className="text-ink">{formatDate(commission.deadline)}</p>
                        </div>
                        <div>
                          <p className="editorial-label mb-2">Submitted</p>
                          <p className="text-ink">{formatDate(commission.createdAt)}</p>
                        </div>
                      </div>
                      <div className="mb-8">
                        <p className="editorial-label mb-2">Project description</p>
                        <p className="text-ink-soft leading-relaxed">{commission.projectDescription}</p>
                      </div>
                      <div className="mb-8">
                        <p className="editorial-label mb-3">Update status</p>
                        <div className="flex flex-wrap gap-2">
                          {statusOrder.map((status) => {
                            const cfg = statusConfig[status];
                            const Icon = cfg.icon;
                            return (
                              <button
                                key={status}
                                onClick={() => updateStatus(commission.id, status)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border transition-all duration-300 ${
                                  commission.status === status
                                    ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                                    : 'bg-canvas text-ink border-border hover:border-ink'
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                                {cfg.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteCommission(commission.id)}
                        className="flex items-center gap-2 text-sm text-muted hover:text-coral-dim transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete this request
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProfileEditor({
  creator,
  updateProfile,
}: {
  creator: import('../types').CreatorProfile;
  updateProfile: (id: string, updates: Partial<import('../types').CreatorProfile>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: creator.name,
    bio: creator.bio,
    location: creator.location,
    university: creator.university,
    startingPrice: String(creator.startingPrice),
    avatar: creator.avatar,
  });

  const avatarFileRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setForm((p) => ({ ...p, avatar: dataUrl }));
    } catch {
      // ignore
    }
  };

  const handleSave = () => {
    updateProfile(creator.id, {
      name: form.name.trim(),
      bio: form.bio.trim(),
      location: form.location.trim(),
      university: form.university.trim(),
      startingPrice: parseFloat(form.startingPrice) || creator.startingPrice,
      avatar: form.avatar.trim(),
    });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl">
      {saved && (
        <div className="mb-6 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-3">
          <CheckCircle2 className="w-4 h-4" />
          Profile updated successfully.
        </div>
      )}

      <div className="flex items-start gap-6 mb-10">
        <div className="w-24 h-24 border border-border overflow-hidden shrink-0">
          <img src={form.avatar || creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">{creator.name}</h2>
          <p className="text-sm text-muted mt-1">{creator.discipline} · {creator.university}</p>
          <p className="text-sm text-muted mt-1">{creator.location}</p>
          <p className="text-sm text-ink-soft mt-2">Commissions from {inr(creator.startingPrice)}</p>
        </div>
      </div>

      {!editing ? (
        <>
          <div className="space-y-6 mb-8">
            <div>
              <p className="editorial-label mb-2">Bio</p>
              <p className="text-ink-soft leading-relaxed">{creator.bio}</p>
            </div>
            <div>
              <p className="editorial-label mb-2">Email</p>
              <p className="text-ink">{creator.email}</p>
            </div>
          </div>
          <button onClick={() => setEditing(true)} className="btn-outline">
            <Edit3 className="w-4 h-4" />
            Edit profile
          </button>
        </>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="editorial-label mb-2 block">Display name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="editorial-label mb-2 block">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              className="input-field resize-none min-h-[100px] py-3"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="editorial-label mb-2 block">City</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="editorial-label mb-2 block">Institution</label>
              <input
                type="text"
                value={form.university}
                onChange={(e) => setForm((p) => ({ ...p, university: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="editorial-label mb-2 block">Starting price (INR)</label>
            <div className="flex items-baseline">
              <span className="font-display text-2xl text-muted mr-2">₹</span>
              <input
                type="number"
                min={500}
                step={100}
                value={form.startingPrice}
                onChange={(e) => setForm((p) => ({ ...p, startingPrice: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="editorial-label mb-2 block">Profile Image</label>
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-border bg-canvas shrink-0">
                <img
                  src={form.avatar || creator.avatar}
                  alt={creator.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => avatarFileRef.current?.click()}
                className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload new photo
              </button>
              <input
                ref={avatarFileRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <label className="text-xs text-muted block mb-1">Or image URL:</label>
            <input
              type="url"
              value={form.avatar.startsWith('data:') ? '' : form.avatar}
              onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value }))}
              className="input-field text-sm"
              placeholder="https://..."
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={handleSave} className="btn-coral">Save changes</button>
            <button onClick={() => setEditing(false)} className="btn-outline">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
