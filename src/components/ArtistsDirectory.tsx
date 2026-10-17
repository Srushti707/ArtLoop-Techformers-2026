import { useState, useMemo, useEffect } from 'react';
import { Search, X, ArrowUpRight, GraduationCap, MapPin } from 'lucide-react';
import ArtworkImage from './ArtworkImage';
import type { Page } from './Nav';
import { categories } from '../data';
import { useMarketplace } from '../useMarketplace';
import { inr } from '../format';

type ArtistsDirectoryProps = {
  onNavigate: (page: Page, artistSlug?: string) => void;
};

export default function ArtistsDirectory({ onNavigate }: ArtistsDirectoryProps) {
  const { allArtists, allArtworks } = useMarketplace();
  const [search, setSearch] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter artists by search and discipline
  const filteredArtists = useMemo(() => {
    return allArtists.filter((artist) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        artist.name.toLowerCase().includes(query) ||
        artist.discipline.toLowerCase().includes(query) ||
        artist.university.toLowerCase().includes(query) ||
        artist.location.toLowerCase().includes(query) ||
        artist.bio.toLowerCase().includes(query);

      const matchesDiscipline =
        selectedDiscipline === 'All' || artist.discipline === selectedDiscipline;

      return matchesSearch && matchesDiscipline;
    });
  }, [allArtists, search, selectedDiscipline]);

  // Compute number of published artworks per artist
  const getArtworkCount = (artistId: string): number => {
    return allArtworks.filter((w) => w.artistId === artistId).length;
  };

  const getArtistWorks = (artistId: string) => {
    return allArtworks.filter((w) => w.artistId === artistId);
  };

  return (
    <div className="pt-28 md:pt-36 min-h-screen pb-24">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        {/* Editorial Page Header */}
        <div className="mb-12 md:mb-16">
          <span className="editorial-label mb-3 block">Emerging Creators Directory</span>
          <h1 className="font-display font-bold text-ink text-display-2 mb-4">
            Meet the artists.
          </h1>
          <p className="text-lg md:text-xl text-ink-soft max-w-2xl leading-relaxed">
            ArtLoop is a student-centric digital art marketplace celebrating independent talent from India’s premier fine art and design institutes. Discover their distinctive practices, explore curated collections, and commission original works directly.
          </p>
        </div>

        {/* Search & Discipline Filter Bar */}
        <div className="mb-10 space-y-6">
          {/* Keyword Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search artists by name, discipline, or institute..."
              className="input-field pl-7 pr-8 text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Discipline Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedDiscipline(cat)}
                className={`px-4 py-2 text-xs font-medium tracking-wide transition-all duration-200 border ${
                  selectedDiscipline === cat
                    ? 'bg-ink text-canvas border-ink'
                    : 'bg-canvas text-ink border-border hover:border-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between text-sm text-muted pt-2 border-t border-border-soft">
            <p>
              Showing <span className="font-semibold text-ink">{filteredArtists.length}</span> creator{filteredArtists.length !== 1 ? 's' : ''}
              {selectedDiscipline !== 'All' && <span> in {selectedDiscipline}</span>}
            </p>
            {(search || selectedDiscipline !== 'All') && (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedDiscipline('All');
                }}
                className="text-xs text-coral hover:underline font-medium"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* Artists Grid or Empty State */}
        {filteredArtists.length === 0 ? (
          <div className="py-24 text-center border border-border bg-canvas">
            <p className="font-display text-2xl md:text-3xl text-ink mb-3">No artists found.</p>
            <p className="text-sm text-muted mb-8 max-w-md mx-auto">
              {allArtists.length === 0
                ? 'No creators have registered on ArtLoop yet. Be the first to showcase your practice.'
                : 'Try adjusting your search query or selecting a different discipline.'}
            </p>
            {allArtists.length === 0 ? (
              <button onClick={() => onNavigate('dashboard')} className="btn-coral">
                Become a Creator
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedDiscipline('All');
                }}
                className="btn-outline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArtists.map((artist) => {
              const artworkCount = getArtworkCount(artist.id);
              const works = getArtistWorks(artist.id);

              return (
                <div
                  key={artist.id}
                  className="border border-border bg-canvas group hover-lift transition-all flex flex-col justify-between overflow-hidden"
                >
                  {/* Artist Header / Avatar */}
                  <div>
                    <div className="image-zoom relative aspect-[16/10] border-b border-border bg-canvas-dark">
                      <button
                        onClick={() => onNavigate('artist', artist.slug)}
                        className="w-full h-full block text-left focus:outline-none"
                        title={`View ${artist.name}'s profile`}
                      >
                        <ArtworkImage
                          src={artist.avatar}
                          alt={artist.name}
                          className="w-full h-full"
                          imgClassName="group-hover:scale-105"
                        />
                      </button>

                      {/* Discipline Badge */}
                      <div className="absolute top-3 left-3 bg-canvas/95 px-3 py-1 text-xs font-semibold text-ink border border-border/40 shadow-sm">
                        {artist.discipline}
                      </div>

                      {/* Artworks Count Badge */}
                      <div className="absolute top-3 right-3 bg-ink/90 text-canvas px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase shadow-sm">
                        {artworkCount} {artworkCount === 1 ? 'Work' : 'Works'}
                      </div>
                    </div>

                    {/* Artist Details */}
                    <div className="p-6 md:p-7">
                      <button
                        onClick={() => onNavigate('artist', artist.slug)}
                        className="text-left block group/title w-full"
                      >
                        <h2 className="font-display text-2xl font-bold text-ink group-hover/title:text-coral transition-colors">
                          {artist.name}
                        </h2>
                      </button>

                      <div className="flex items-center gap-1.5 text-xs text-muted mt-2">
                        <GraduationCap className="w-3.5 h-3.5 text-coral shrink-0" />
                        <span className="truncate">{artist.university}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted mt-1">
                        <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
                        <span>{artist.location}</span>
                      </div>

                      <p className="text-sm text-ink-soft mt-4 line-clamp-3 leading-relaxed">
                        {artist.bio}
                      </p>

                      {/* Preview Thumbnails */}
                      {works.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-border-soft flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-wider text-muted font-semibold">
                            Recent Works
                          </span>
                          <div className="flex items-center gap-1.5">
                            {works.slice(0, 3).map((w) => (
                              <div
                                key={w.id}
                                className="w-9 h-9 border border-border overflow-hidden shrink-0 bg-canvas-dark"
                                title={w.title}
                              >
                                <img src={w.image} alt={w.title} className="w-full h-full object-cover" />
                              </div>
                            ))}
                            {works.length > 3 && (
                              <span className="text-xs text-muted font-medium pl-1">
                                +{works.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Starting Price & CTA */}
                  <div className="px-6 md:px-7 pb-6 pt-4 border-t border-border flex items-center justify-between gap-4 bg-canvas">
                    <div>
                      <span className="text-xs text-muted block">Commissions</span>
                      <span className="font-display text-sm md:text-base font-bold text-ink">
                        from {inr(artist.startingPrice)}
                      </span>
                    </div>

                    <button
                      onClick={() => onNavigate('artist', artist.slug)}
                      className="btn-coral text-xs py-2.5 px-4 flex items-center gap-1.5 group/btn"
                    >
                      View Portfolio
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
