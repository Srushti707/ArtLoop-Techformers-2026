import { useState, useEffect } from 'react';
import { ArrowUpRight, LogOut, LogIn } from 'lucide-react';
import ArtLoopLogo from './ArtLoopLogo';
import { useAuth } from '../useAuth';

export type Page = 'home' | 'discover' | 'artist' | 'commission' | 'dashboard' | 'join' | 'upload' | 'enquiry';

type NavProps = {
  current: Page;
  onNavigate: (page: Page, artistSlug?: string) => void;
  onOpenAuth: (initialRole?: 'buyer' | 'creator', initialMode?: 'signin' | 'signup') => void;
};

export default function Nav({ current, onNavigate, onOpenAuth }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { role, buyer, creator, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links: { label: string; page: Page }[] = [
    { label: 'Discover', page: 'discover' },
    { label: 'Artists', page: 'discover' },
    { label: 'Dashboard', page: 'dashboard' },
  ];

  const handleNav = (page: Page) => {
    setMenuOpen(false);
    onNavigate(page);
  };

  const handleSignOut = () => {
    signOut();
    setMenuOpen(false);
    onNavigate('home');
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-canvas/95 backdrop-blur-md border-b border-border-soft py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2 group"
            aria-label="ArtLoop home"
          >
            <ArtLoopLogo compact />
          </button>

          <nav className="hidden md:flex items-center gap-10">
            {links.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNav(link.page)}
                className={`link-underline text-sm font-medium tracking-wide transition-colors duration-200 ${
                  current === link.page ? 'text-coral' : 'text-ink hover:text-coral'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {role === 'buyer' && buyer && (
              <>
                <span className="text-sm text-ink-soft">Hi, {buyer.name.split(' ')[0]}</span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-sm text-muted hover:text-coral transition-colors"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}

            {role === 'creator' && creator && (
              <>
                <span className="text-sm text-ink-soft">Hi, {creator.name.split(' ')[0]}</span>
                <button
                  onClick={() => handleNav('upload')}
                  className="flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-coral transition-colors"
                >
                  Upload artwork
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-sm text-muted hover:text-coral transition-colors"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}

            {!role && (
              <button
                onClick={() => onOpenAuth('buyer', 'signin')}
                className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-coral transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Log in
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden flex flex-col gap-1.5 z-50"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-ink transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-ink transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-ink transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 bg-canvas transition-transform duration-500 md:hidden ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-6">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => handleNav(link.page)}
              className="font-display text-3xl font-bold text-ink hover:text-coral transition-colors"
            >
              {link.label}
            </button>
          ))}

          {role === 'buyer' && buyer && (
            <div className="flex flex-col items-center gap-3 mt-4">
              <span className="text-sm text-ink-soft">Signed in as {buyer.name}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-sm text-coral"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}

          {role === 'creator' && creator && (
            <div className="flex flex-col items-center gap-3 mt-4">
              <button
                onClick={() => handleNav('upload')}
                className="btn-coral"
              >
                Upload artwork
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-sm text-coral"
              >
                <LogOut className="w-4 h-4" />
                Sign out ({creator.name.split(' ')[0]})
              </button>
            </div>
          )}

          {!role && (
            <div className="flex flex-col items-center gap-3 mt-4">
              <button
                onClick={() => { setMenuOpen(false); onOpenAuth('buyer', 'signin'); }}
                className="btn-coral w-48 text-center flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Log in
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
