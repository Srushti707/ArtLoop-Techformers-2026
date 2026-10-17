import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, X, ArrowUpRight, Mail, Heart } from 'lucide-react';
import ArtworkImage from './ArtworkImage';
import type { Page } from './Nav';
import type { Artwork, Artist } from '../types';
import { categories, budgetRanges } from '../data';
import { useMarketplace } from '../useMarketplace';
import { useAuth } from '../useAuth';
import { inr } from '../format';

type DiscoverProps = {
  onNavigate: (page: Page, artistSlug?: string) => void;
  onEnquire: (artwork: Artwork) => void;
};

export default function Discover({ onNavigate, onEnquire }: DiscoverProps) {
  const { allArtworks, allArtists } = useMarketplace();
  const { toggleSaveArtwork, isArtworkSaved } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>('All');
  const [activeBudget, setActiveBudget] = useState(0);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getArtistForArtwork = (artwork: Artwork): Artist | undefined =>
    allArtists.find((a) => a.id === artwork.artistId);

  const getArtistName = useCallback(
    (artistId: string): string => allArtists.find((a) => a.id === artistId)?.name ?? 'Unknown Artist',
    [allArtists]
  );

  const filteredArtworks = useMemo(() => {
    const budget = budgetRanges[activeBudget];
    return allArtworks.filter((art) => {
      const matchesSearch =
        search === '' ||
        art.title.toLowerCase().includes(search.toLowerCase()) ||
        getArtistName(art.artistId).toLowerCase().includes(search.toLowerCase()) ||
        art.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || art.category === activeCategory;
      const matchesBudget = art.price >= budget.min && art.price <= budget.max;
      return matchesSearch && matchesCategory && matchesBudget;
    });
  }, [allArtworks, getArtistName, search, activeCategory, activeBudget]);

  const visibleArtworks = filteredArtworks.slice(0, visibleCount);
  const hasMore = visibleCount < filteredArtworks.length;

  const aspectForIndex = (i: number): string => {
    const pattern = ['aspect-[4/5]', 'aspect-[3/4]', 'aspect-[4/3]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/4]'];
    return pattern[i % pattern.length];
  };

  return (
    <div className="pt-28 md:pt-36 min-h-screen">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <span className="editorial-label mb-4 block">Discover</span>
          <h1 className="font-display font-bold text-ink text-display-2 mb-4">
            Browse the collection.
          </h1>
          <p className="text-lg text-ink-soft max-w-2xl">
            {allArtworks.length} original works from {allArtists.length} student artists. Filter by category, search by name, and find your next favorite piece.
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-8 flex items-center gap-4 border-b border-border pb-4">
          <Search className="w-5 h-5 text-muted shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(12); }}
            placeholder="Search artworks, artists, or categories..."
            className="flex-1 bg-transparent text-ink placeholder:text-muted text-lg outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-muted hover:text-coral transition-colors"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-12 flex flex-col md:flex-row gap-6 md:gap-10 md:items-center">
          <div className="flex flex-col gap-2">
            <span className="editorial-label">Category</span>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setVisibleCount(12); }}
                  className={`px-4 py-2 text-sm font-medium border transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-ink text-canvas border-ink'
                      : 'bg-transparent text-ink border-border hover:border-ink'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 md:ml-auto">
            <span className="editorial-label">Budget</span>
            <div className="flex flex-wrap gap-2">
              {budgetRanges.map((range, i) => (
                <button
                  key={range.label}
                  onClick={() => { setActiveBudget(i); setVisibleCount(12); }}
                  className={`px-4 py-2 text-sm font-medium border transition-all duration-300 ${
                    activeBudget === i
                      ? 'bg-coral text-canvas border-coral'
                      : 'bg-transparent text-ink border-border hover:border-coral hover:text-coral'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-8 flex items-center justify-between">
          <p className="text-sm text-muted">
            Showing <span className="text-ink font-semibold">{visibleArtworks.length}</span>
            {hasMore && ` of ${filteredArtworks.length}`} result{filteredArtworks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Editorial grid */}
        {visibleArtworks.length === 0 ? (
          <div className="py-32 text-center">
            <p className="font-display text-3xl text-ink mb-4">No artworks found.</p>
            <p className="text-muted mb-8">Try adjusting your search or filters.</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('All'); setActiveBudget(0); }}
              className="btn-outline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {visibleArtworks.map((art, i) => {
              const artist = getArtistForArtwork(art);
              return (
                <div key={art.id} className="text-left group hover-lift">
                  <div className={`image-zoom relative border border-border ${aspectForIndex(i)}`}>
                    <button
                      onClick={() => artist && onNavigate('artist', artist.slug)}
                      className="w-full h-full block"
                    >
                      <ArtworkImage
                        src={art.image}
                        alt={art.title}
                        className="w-full h-full"
                        imgClassName="group-hover:scale-105"
                      />
                    </button>
                    <div className="absolute top-3 left-3 bg-canvas/90 px-3 py-1 text-xs font-medium text-ink">
                      {art.category}
                    </div>
                    {/* Save to Wishlist button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveArtwork(art.id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-canvas/90 hover:bg-canvas rounded-full text-ink transition-all z-10 shadow-sm"
                      title={isArtworkSaved(art.id) ? 'Saved in Wishlist' : 'Save to Wishlist'}
                      aria-label="Save to Wishlist"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isArtworkSaved(art.id) ? 'fill-coral text-coral' : 'text-ink hover:text-coral'
                        }`}
                      />
                    </button>
                    {/* Enquire button — appears on hover */}
                    <button
                      onClick={() => onEnquire(art)}
                      className="absolute bottom-3 right-3 bg-ink text-canvas px-3 py-2 text-xs font-semibold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 hover:bg-coral"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Enquire
                    </button>
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="font-display text-lg font-medium text-ink group-hover:text-coral transition-colors">
                        {art.title}
                      </p>
                      <p className="text-sm text-muted mt-1">{getArtistName(art.artistId)}</p>
                    </div>
                    <span className="font-display text-base text-ink whitespace-nowrap">{inr(art.price)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <div className="mt-16 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className="btn-outline"
            >
              Load more artworks
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Featured creators strip */}
        <div className="mt-24 md:mt-32 border-t border-border pt-16">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="editorial-label mb-4 block">Featured emerging creators</span>
              <h2 className="font-display font-bold text-ink text-display-3">
                The artists behind the work.
              </h2>
            </div>
          </div>

          {/* Creator spotlight */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-12">
            {allArtists[0] && (
              <button
                onClick={() => onNavigate('artist', allArtists[0].slug)}
                className="lg:col-span-5 text-left group hover-lift"
              >
                <div className="image-zoom relative aspect-[4/5] border border-border">
                  <ArtworkImage
                    src={allArtists[0].avatar}
                    alt={allArtists[0].name}
                    className="w-full h-full"
                    imgClassName="group-hover:scale-105"
                  />
                  <div className="absolute top-5 left-5 bg-coral text-canvas px-3 py-1 text-xs font-bold uppercase tracking-wider">
                    Spotlight
                  </div>
                </div>
                <div className="mt-5">
                  <p className="font-display text-2xl font-semibold text-ink group-hover:text-coral transition-colors">
                    {allArtists[0].name}
                  </p>
                  <p className="text-sm text-muted mt-1">{allArtists[0].discipline} · {allArtists[0].university}</p>
                  <p className="text-sm text-ink-soft mt-3 line-clamp-2">{allArtists[0].bio}</p>
                </div>
              </button>
            )}

            <div className="lg:col-span-7 grid grid-cols-2 gap-6 md:gap-8">
              {allArtists.slice(1, 5).map((artist) => (
                <button
                  key={artist.id}
                  onClick={() => onNavigate('artist', artist.slug)}
                  className="text-left group hover-lift"
                >
                  <div className="image-zoom relative aspect-square border border-border">
                    <ArtworkImage
                      src={artist.avatar}
                      alt={artist.name}
                      className="w-full h-full"
                      imgClassName="group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-4">
                    <p className="font-display text-lg font-medium text-ink group-hover:text-coral transition-colors">
                      {artist.name}
                    </p>
                    <p className="text-xs text-muted mt-1">{artist.discipline}</p>
                    <p className="text-xs text-muted mt-2">from {inr(artist.startingPrice)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
