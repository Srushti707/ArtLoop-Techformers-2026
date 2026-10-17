import { useState, useEffect, useCallback } from 'react';
import Nav, { type Page } from './components/Nav';
import Footer from './components/Footer';
import Home from './components/Home';
import Discover from './components/Discover';
import ArtistsDirectory from './components/ArtistsDirectory';
import ArtistProfile from './components/ArtistProfile';
import CommissionForm from './components/CommissionForm';
import Dashboard from './components/Dashboard';
import ArtworkUpload from './components/ArtworkUpload';
import EnquiryModal from './components/EnquiryModal';
import AuthModal from './components/AuthModal';
import ArtworkDetailModal from './components/ArtworkDetailModal';
import CheckoutModal from './components/CheckoutModal';
import type { Artwork, Artist } from './types';
import { useMarketplace } from './useMarketplace';
import { useState as useReactState } from 'react';

function parseHash(): {
  page: Page;
  artistSlug?: string;
  editId?: string;
  artworkId?: string;
  isLogin?: boolean;
  openCreatorSignup?: boolean;
} {
  const hash = window.location.hash.slice(1);
  const parts = hash.split('/').filter(Boolean);

  if (parts.length === 0) return { page: 'home' };
  if (parts[0] === 'discover') return { page: 'discover' };
  if (parts[0] === 'artists') return { page: 'artists' };
  if (parts[0] === 'dashboard') return { page: 'dashboard' };
  if (parts[0] === 'login') return { page: 'dashboard', isLogin: true };
  if (parts[0] === 'join') return { page: 'dashboard', openCreatorSignup: true };
  if (parts[0] === 'upload') {
    return { page: 'upload', editId: parts[1] };
  }
  if (parts[0] === 'artist' && parts[1]) return { page: 'artist', artistSlug: parts[1] };
  if (parts[0] === 'commission' && parts[1]) return { page: 'commission', artistSlug: parts[1] };
  if (parts[0] === 'artwork' && parts[1]) return { page: 'discover', artworkId: parts[1] };

  return { page: 'home' };
}

function buildHash(page: Page, artistSlug?: string, editId?: string): string {
  if (page === 'home') return '';
  if (page === 'artist' && artistSlug) return `artist/${artistSlug}`;
  if (page === 'commission' && artistSlug) return `commission/${artistSlug}`;
  if (page === 'upload' && editId) return `upload/${editId}`;
  return page;
}

export default function App() {
  const [state, setState] = useState(() => parseHash());
  const [enquiryTarget, setEnquiryTarget] = useReactState<{ artwork: Artwork; artist: Artist | undefined } | null>(null);
  const [detailArtwork, setDetailArtwork] = useState<Artwork | null>(null);
  const [checkoutArtwork, setCheckoutArtwork] = useState<Artwork | null>(null);
  const [authModal, setAuthModal] = useState<{
    open: boolean;
    initialRole: 'buyer' | 'creator';
    initialMode: 'signin' | 'signup';
  }>({
    open: false,
    initialRole: 'buyer',
    initialMode: 'signin',
  });
  const marketplace = useMarketplace();

  useEffect(() => {
    const handleHash = () => {
      const parsed = parseHash();
      setState(parsed);
      if (parsed.isLogin) {
        setAuthModal({ open: true, initialRole: 'buyer', initialMode: 'signin' });
      } else if (parsed.openCreatorSignup) {
        setAuthModal({ open: true, initialRole: 'creator', initialMode: 'signup' });
      }
      if (parsed.artworkId) {
        const found = marketplace.allArtworks.find((a) => a.id === parsed.artworkId);
        if (found) {
          setDetailArtwork(found);
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [marketplace.allArtworks]);

  const navigate = useCallback((page: Page, artistSlug?: string) => {
    const hash = buildHash(page, artistSlug);
    window.location.hash = hash;
    setState({ page, artistSlug });
  }, []);

  const navigateEdit = useCallback((editId: string) => {
    const hash = buildHash('upload', undefined, editId);
    window.location.hash = hash;
    setState({ page: 'upload', editId });
  }, []);

  const openEnquiry = useCallback((artwork: Artwork) => {
    const artist = marketplace.allArtists.find((a) => a.id === artwork.artistId);
    setEnquiryTarget({ artwork, artist });
  }, [marketplace.allArtists, setEnquiryTarget]);

  const openAuth = useCallback(
    (initialRole: 'buyer' | 'creator' = 'buyer', initialMode: 'signin' | 'signup' = 'signin') => {
      setAuthModal({ open: true, initialRole, initialMode });
    },
    []
  );

  const handleSelectArtwork = useCallback((artwork: Artwork) => {
    setDetailArtwork(artwork);
  }, []);

  return (
    <>
      <div className="grain-overlay" />
      <Nav current={state.page} onNavigate={navigate} onOpenAuth={openAuth} />

      <main>
        {state.page === 'home' && (
          <Home
            onNavigate={navigate}
            onOpenAuth={openAuth}
            onSelectArtwork={handleSelectArtwork}
          />
        )}
        {state.page === 'discover' && (
          <Discover
            onNavigate={navigate}
            onEnquire={openEnquiry}
            onSelectArtwork={handleSelectArtwork}
          />
        )}
        {state.page === 'artists' && (
          <ArtistsDirectory onNavigate={navigate} />
        )}
        {state.page === 'artist' && state.artistSlug && (
          <ArtistProfile
            artistSlug={state.artistSlug}
            onNavigate={navigate}
            onSelectArtwork={handleSelectArtwork}
          />
        )}
        {state.page === 'commission' && (
          <CommissionForm artistSlug={state.artistSlug} onNavigate={navigate} />
        )}
        {state.page === 'dashboard' && (
          <Dashboard
            onNavigate={navigate}
            onEditArtwork={navigateEdit}
            onEnquireArtwork={openEnquiry}
            onSelectArtwork={handleSelectArtwork}
            onOpenAuth={openAuth}
          />
        )}
        {state.page === 'upload' && (
          <ArtworkUpload onNavigate={navigate} onOpenAuth={openAuth} editId={state.editId} />
        )}
      </main>

      <Footer onNavigate={navigate} />

      {/* Artwork Detail Modal */}
      {detailArtwork && (
        <ArtworkDetailModal
          artwork={detailArtwork}
          artist={marketplace.allArtists.find((a) => a.id === detailArtwork.artistId)}
          isOpen={Boolean(detailArtwork)}
          onClose={() => setDetailArtwork(null)}
          onNavigate={navigate}
          onBuyNow={(art) => {
            setDetailArtwork(null);
            setCheckoutArtwork(art);
          }}
          onEnquire={(art) => {
            setDetailArtwork(null);
            openEnquiry(art);
          }}
        />
      )}

      {/* Checkout Modal */}
      {checkoutArtwork && (
        <CheckoutModal
          artwork={checkoutArtwork}
          artist={marketplace.allArtists.find((a) => a.id === checkoutArtwork.artistId)}
          isOpen={Boolean(checkoutArtwork)}
          onClose={() => setCheckoutArtwork(null)}
          onNavigate={navigate}
        />
      )}

      {/* Enquiry Modal */}
      {enquiryTarget && (
        <EnquiryModal
          artwork={enquiryTarget.artwork}
          artist={enquiryTarget.artist}
          onClose={() => setEnquiryTarget(null)}
          onNavigate={navigate}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal.open}
        initialRole={authModal.initialRole}
        initialMode={authModal.initialMode}
        onClose={() => setAuthModal((p) => ({ ...p, open: false }))}
        onNavigate={navigate}
      />
    </>
  );
}
