import { useEffect, useState } from 'react';
import type { PointerEvent } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import ArtworkImage from './ArtworkImage';
import ArtLoopLogo from './ArtLoopLogo';
import type { Page } from './Nav';
import type { Artwork } from '../types';
import { artists, artworks, getArtistName } from '../data';
import { inr } from '../format';

type HomeProps = {
  onNavigate: (page: Page, artistSlug?: string) => void;
  onOpenAuth?: (initialRole?: 'buyer' | 'creator', initialMode?: 'signin' | 'signup') => void;
  onSelectArtwork?: (artwork: Artwork) => void;
};

type HeroCard = {
  artworkIndex: number;
  rotate: number;
  depth: number;
  position: string;
};

const heroCards: HeroCard[] = [
  { artworkIndex: 0, rotate: -5, depth: 1, position: 'hero-card-main' },
  { artworkIndex: 4, rotate: 6, depth: 2, position: 'hero-card-back' },
  { artworkIndex: 8, rotate: -9, depth: 3, position: 'hero-card-side' },
  { artworkIndex: 12, rotate: 4, depth: 4, position: 'hero-card-front' },
];

export default function Home({ onNavigate, onOpenAuth, onSelectArtwork }: HomeProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);

  const spotlightArtworks = [artworks[2], artworks[6], artworks[10], artworks[14], artworks[18], artworks[22]];

  const handleCompositionPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 2,
    });
  };

  const resetPointer = () => setPointer({ x: 0, y: 0 });

  return (
    <div className="overflow-hidden">
      <section className="relative min-h-screen pt-32 md:pt-40 pb-20">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className={`mb-8 md:mb-12 ${mounted ? 'animate-fade-up' : 'opacity-0'}`}>
            <span className="editorial-label">Independent talent. Fresh perspectives.</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-4 items-center">
            <div className="lg:col-span-7 relative z-20">
              <div className="mb-7 flex items-center gap-3 opacity-80">
                <ArtLoopLogo compact />
                <span className="hidden sm:inline editorial-label">Student-made, carefully found</span>
              </div>
              <h1
                className={`font-display font-bold text-ink text-display-1 ${mounted ? 'animate-fade-up' : 'opacity-0'}`}
                style={{ animationDelay: '0.1s' }}
              >
                Good art deserves
                <br />
                to be <span className="italic font-light text-coral">discovered.</span>
              </h1>

              <p
                className={`mt-8 text-lg md:text-xl text-ink-soft leading-relaxed max-w-xl ${mounted ? 'animate-fade-up' : 'opacity-0'}`}
                style={{ animationDelay: '0.25s' }}
              >
                ArtLoop is where emerging student artists from India find their first audience. Browse original works, commission pieces directly, and support the next generation of creative talent.
              </p>

              <div
                className={`mt-10 flex flex-wrap items-center gap-4 ${mounted ? 'animate-fade-up' : 'opacity-0'}`}
                style={{ animationDelay: '0.4s' }}
              >
                <button onClick={() => onNavigate('discover')} className="btn-coral">
                  Explore the artists
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => (onOpenAuth ? onOpenAuth('creator', 'signup') : onNavigate('discover'))}
                  className="btn-outline"
                >
                  Become a Creator
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 lg:-ml-10 xl:-ml-16 relative z-10">
              <div
                className={`hero-art-composition ${mounted ? 'animate-fade-in' : 'opacity-0'}`}
                onPointerMove={handleCompositionPointerMove}
                onPointerLeave={resetPointer}
                style={{ animationDelay: '0.3s' }}
              >
                <div className="hero-orbit-mark" aria-hidden="true">✦</div>
                {heroCards.map((card, i) => {
                  const artwork = artworks[card.artworkIndex];
                  const artist = artists.find((item) => item.id === artwork.artistId);
                  const isHovered = hoveredCard === card.artworkIndex;
                  const parallaxX = reducedMotion ? 0 : pointer.x * (card.depth * 2.5);
                  const parallaxY = reducedMotion ? 0 : pointer.y * (card.depth * 1.8);
                  // Subtle rotation straightening: softens the tilt angle by ~70% on hover
                  const hoverRotate = card.rotate * 0.3;
                  const transform = isHovered
                    ? `translate3d(${parallaxX}px, ${parallaxY - 9}px, 0) rotate(${hoverRotate}deg) scale(1.028)`
                    : `translate3d(${parallaxX}px, ${parallaxY}px, 0) rotate(${card.rotate}deg)`;

                  return (
                    <div
                      key={artwork.id}
                      className={`hero-card-slot ${card.position} hero-float-${i + 1} ${isHovered ? 'is-hovered' : ''}`}
                      style={{ zIndex: isHovered ? 30 : 10 + card.depth }}
                    >
                      <button
                        type="button"
                        className={`hero-art-card ${isHovered ? 'is-hovered' : ''}`}
                        style={{ transform }}
                        onClick={() => artist && onNavigate('artist', artist.slug)}
                        onFocus={() => setHoveredCard(card.artworkIndex)}
                        onBlur={() => setHoveredCard(null)}
                        onMouseEnter={() => setHoveredCard(card.artworkIndex)}
                        onMouseLeave={() => setHoveredCard(null)}
                        aria-label={`View ${artwork.title} by ${getArtistName(artwork.artistId)}`}
                      >
                        <span className="hero-art-image">
                          <ArtworkImage src={artwork.image} alt={artwork.title} className="h-full w-full" />
                        </span>
                        <span className="hero-art-caption">
                          <span>
                            <strong>{artwork.title}</strong>
                            <small>by {getArtistName(artwork.artistId)}</small>
                          </span>
                          <ArrowUpRight className="h-5 w-5 shrink-0" aria-hidden="true" />
                        </span>
                      </button>
                    </div>
                  );
                })}
                <span className="hero-art-note">Fresh eyes<br />welcome here.</span>
              </div>
            </div>
          </div>

          <div className={`mt-12 md:mt-16 flex items-center gap-3 text-muted ${mounted ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
            <ArrowDown className="w-4 h-4 animate-bounce" />
            <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
          </div>
        </div>
      </section>

      <section className="border-y border-border py-5 overflow-hidden bg-canvas-dark/30">
        <div className="marquee-track">
          {[...Array(2)].map((_, set) => (
            <div key={set} className="flex items-center gap-12 px-6">
              {['Painting', 'Digital Art', 'Illustration', 'Photography', 'Mixed Media', 'Commissions', 'Student Made', 'Independent', 'Original Works'].map((word, i) => (
                <span key={`${set}-${i}`} className="flex items-center gap-12">
                  <span className="font-display text-2xl md:text-3xl font-light text-ink/70 whitespace-nowrap">{word}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-coral" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6">
            <div>
              <span className="editorial-label mb-4 block">Featured emerging creators</span>
              <h2 className="font-display font-bold text-ink text-display-3">Meet the artists<br />shaping what comes next.</h2>
            </div>
            <button onClick={() => onNavigate('discover')} className="flex items-center gap-2 text-sm font-semibold text-ink hover:text-coral transition-colors group">
              See all artists
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {artists.slice(0, 4).map((artist, i) => (
              <button key={artist.id} onClick={() => onNavigate('artist', artist.slug)} className="text-left group hover-lift" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="image-zoom relative aspect-[3/4] mb-5 border border-border">
                  <ArtworkImage src={artist.avatar} alt={artist.name} className="w-full h-full" imgClassName="group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                    <p className="text-canvas text-xs uppercase tracking-widest mb-1">View profile</p>
                    <p className="font-display text-lg text-canvas">{artist.name}</p>
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-xl font-semibold text-ink group-hover:text-coral transition-colors">{artist.name}</p>
                    <p className="text-sm text-muted mt-1">{artist.discipline}</p>
                    <p className="text-xs text-muted mt-2">{artist.university}</p>
                  </div>
                  <span className="text-xs text-muted text-right whitespace-nowrap mt-1">from<br /><span className="font-display text-base text-ink">{inr(artist.startingPrice)}</span></span>
                </div>
              </button>
            ))}
          </div>
          <p className="mt-8 text-xs text-muted">Fictional demo profiles created for the ArtLoop marketplace.</p>
        </div>
      </section>

      <section className="py-24 md:py-32 bg-aubergine text-canvas">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="mb-16 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div>
              <span className="editorial-label text-canvas/50 mb-4 block">Creator spotlight</span>
              <h2 className="font-display font-bold text-display-3">A curated selection<br />of recent works.</h2>
            </div>
            <button onClick={() => onNavigate('discover')} className="flex items-center gap-2 text-sm font-semibold text-canvas hover:text-coral transition-colors group">
              Browse all artworks
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {spotlightArtworks.map((art) => (
              <button
                key={art.id}
                onClick={() => {
                  if (onSelectArtwork) {
                    onSelectArtwork(art);
                  } else {
                    onNavigate('artist', artists.find((a) => a.id === art.artistId)?.slug);
                  }
                }}
                className="text-left group"
              >
                <div className={`image-zoom relative border border-canvas/15 ${art.aspect === 'portrait' ? 'aspect-[3/4]' : art.aspect === 'square' ? 'aspect-square' : 'aspect-[4/3]'}`}>
                  <ArtworkImage src={art.image} alt={art.title} className="w-full h-full" imgClassName="group-hover:scale-105" />
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg font-medium text-canvas group-hover:text-coral transition-colors">{art.title}</p>
                    <p className="text-sm text-canvas/60 mt-1">{getArtistName(art.artistId)}</p>
                  </div>
                  <span className="font-display text-base text-coral whitespace-nowrap">{inr(art.price)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <span className="editorial-label mb-6 block">How it works</span>
              <h2 className="font-display font-bold text-ink text-display-3 mb-6">Commission a piece,<br /><span className="italic font-light text-aubergine">made just for you.</span></h2>
              <p className="text-lg text-ink-soft leading-relaxed max-w-lg mb-10">Found an artist whose work speaks to you? Send a commission request with your project details, budget, and timeline. They'll review it in their dashboard and respond.</p>
              <button onClick={() => onNavigate('discover')} className="btn-coral">Start a commission<ArrowUpRight className="w-4 h-4" /></button>
            </div>
            <div className="space-y-px">
              {[
                { num: '01', title: 'Discover an artist', desc: 'Browse the editorial grid and filter by category or budget.' },
                { num: '02', title: 'Send your brief', desc: 'Describe your vision, set a budget, and pick a deadline.' },
                { num: '03', title: 'Track the process', desc: 'The artist reviews and updates the status in their dashboard.' },
              ].map((step) => (
                <div key={step.num} className="flex gap-8 py-8 border-t border-border group hover:bg-canvas-dark/30 transition-colors px-4 -mx-4 cursor-default">
                  <span className="font-display text-3xl font-light text-coral w-12 shrink-0">{step.num}</span>
                  <div>
                    <p className="font-display text-xl font-semibold text-ink mb-2 group-hover:text-coral transition-colors">{step.title}</p>
                    <p className="text-ink-soft leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
