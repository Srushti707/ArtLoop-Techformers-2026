import { useState, useEffect, useCallback } from 'react';
import Nav, { type Page } from './components/Nav';
import Footer from './components/Footer';
import Home from './components/Home';
import Discover from './components/Discover';
import ArtistProfile from './components/ArtistProfile';
import CommissionForm from './components/CommissionForm';
import Dashboard from './components/Dashboard';
import CreatorOnboarding from './components/CreatorOnboarding';
import ArtworkUpload from './components/ArtworkUpload';
import EnquiryModal from './components/EnquiryModal';
import type { Artwork, Artist } from './types';
import { useMarketplace } from './useMarketplace';
import { useState as useReactState } from 'react';

function parseHash(): { page: Page; artistSlug?: string; editId?: string } {
  const hash = window.location.hash.slice(1);
  const parts = hash.split('/').filter(Boolean);

  if (parts.length === 0) return { page: 'home' };
  if (parts[0] === 'discover') return { page: 'discover' };
  if (parts[0] === 'dashboard') return { page: 'dashboard' };
  if (parts[0] === 'join') return { page: 'join' };
  if (parts[0] === 'upload') {
    return { page: 'upload', editId: parts[1] };
  }
  if (parts[0] === 'artist' && parts[1]) return { page: 'artist', artistSlug: parts[1] };
  if (parts[0] === 'commission' && parts[1]) return { page: 'commission', artistSlug: parts[1] };

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
  const marketplace = useMarketplace();

  useEffect(() => {
    const onHashChange = () => setState(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

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
  }, [marketplace.allArtists]);

  return (
    <>
      <div className="grain-overlay" />
      <Nav current={state.page} onNavigate={navigate} />

      <main>
        {state.page === 'home' && <Home onNavigate={navigate} />}
        {state.page === 'discover' && <Discover onNavigate={navigate} onEnquire={openEnquiry} />}
        {state.page === 'artist' && state.artistSlug && (
          <ArtistProfile artistSlug={state.artistSlug} onNavigate={navigate} />
        )}
        {state.page === 'commission' && (
          <CommissionForm artistSlug={state.artistSlug} onNavigate={navigate} />
        )}
        {state.page === 'dashboard' && <Dashboard onNavigate={navigate} onEditArtwork={navigateEdit} />}
        {state.page === 'join' && <CreatorOnboarding onNavigate={navigate} />}
        {state.page === 'upload' && <ArtworkUpload onNavigate={navigate} editId={state.editId} />}
      </main>

      <Footer onNavigate={navigate} />

      {enquiryTarget && (
        <EnquiryModal
          artwork={enquiryTarget.artwork}
          artist={enquiryTarget.artist}
          onClose={() => setEnquiryTarget(null)}
        />
      )}
    </>
  );
}
