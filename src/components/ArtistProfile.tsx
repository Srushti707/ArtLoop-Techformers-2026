import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, GraduationCap, IndianRupee, ArrowUpRight, Heart } from 'lucide-react';
import ArtworkImage from './ArtworkImage';
import type { Page } from './Nav';
import type { Artwork } from '../types';
import { getArtist, getArtworksByArtist } from '../data';
import { useAuth } from '../useAuth';
import { useOrders } from '../useOrders';
import { inr } from '../format';

type ArtistProfileProps = {
  artistSlug: string;
  onNavigate: (page: Page, artistSlug?: string) => void;
  onSelectArtwork?: (artwork: Artwork) => void;
};

export default function ArtistProfile({ artistSlug, onNavigate, onSelectArtwork }: ArtistProfileProps) {
  const { toggleSaveArtwork, isArtworkSaved } = useAuth();
  const { isArtworkSold } = useOrders();
  const [visibleBio, setVisibleBio] = useState(false);
  const artist = getArtist(artistSlug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [artistSlug]);

  useEffect(() => {
    setVisibleBio(false);
    const timer = setTimeout(() => setVisibleBio(true), 100);
    return () => clearTimeout(timer);
  }, [artistSlug]);

  if (!artist) {
    return (
      <div className="pt-40 min-h-screen flex flex-col items-center justify-center">
        <p className="font-display text-4xl text-ink mb-4">Artist not found.</p>
        <button onClick={() => onNavigate('discover')} className="btn-outline">
          Back to Discover
        </button>
      </div>
    );
  }

  const portfolioWorks = getArtworksByArtist(artist.id);

  return (
    <div className="pt-28 md:pt-36 min-h-screen">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        {/* Back link */}
        <button
          onClick={() => onNavigate('discover')}
          className="flex items-center gap-2 text-sm text-muted hover:text-coral transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Discover
        </button>

        {/* Hero section — asymmetrical */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-20 md:mb-28">
          <div className="lg:col-span-5">
            <div className="image-zoom relative aspect-[4/5] border border-border">
              <ArtworkImage
                src={artist.avatar}
                alt={artist.name}
                className="w-full h-full"
                imgClassName="hover:scale-105"
              />
            </div>
          </div>

          <div className="lg:col-span-7 lg:pl-8 flex flex-col justify-between">
            <div>
              <span className="editorial-label mb-6 block">{artist.discipline}</span>
              <h1 className="font-display font-bold text-ink text-display-2 mb-6">
                {artist.name}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap gap-6 mb-8 text-sm text-ink-soft">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-coral" />
                  {artist.location}
                </span>
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-coral" />
                  {artist.university}
                </span>
                <span className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-coral" />
                  From {inr(artist.startingPrice)}
                </span>
              </div>

              <p
                className={`text-lg text-ink-soft leading-relaxed max-w-xl transition-all duration-700 ${
                  visibleBio ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                {artist.bio}
              </p>
            </div>

            {/* Commission CTA */}
            <div className="mt-10 pt-10 border-t border-border">
              <p className="font-display text-2xl text-ink mb-4">
                Interested in working with {artist.name.split(' ')[0]}?
              </p>
              <button
                onClick={() => onNavigate('commission', artist.slug)}
                className="btn-coral"
              >
                Request a commission
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Portfolio */}
        <div className="border-t border-border pt-16 md:pt-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="editorial-label mb-4 block">Portfolio</span>
              <h2 className="font-display font-bold text-ink text-display-3">
                Selected works.
              </h2>
            </div>
            <p className="text-sm text-muted hidden md:block">
              {portfolioWorks.length} pieces available
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-10">
            {portfolioWorks.map((work, i) => {
              const sold = isArtworkSold(work.id);
              return (
                <div
                  key={work.id}
                  className={`group text-left ${i % 3 === 0 ? 'lg:mt-0' : i % 3 === 1 ? 'lg:mt-16' : 'lg:mt-8'}`}
                >
                  <div className={`image-zoom relative border border-border ${
                    work.aspect === 'portrait' ? 'aspect-[3/4]' : work.aspect === 'square' ? 'aspect-square' : 'aspect-[4/3]'
                  }`}>
                    <button
                      onClick={() => onSelectArtwork && onSelectArtwork(work)}
                      className="w-full h-full block text-left focus:outline-none"
                      title="View artwork details & purchase rights"
                    >
                      <ArtworkImage
                        src={work.image}
                        alt={work.title}
                        className="w-full h-full"
                        imgClassName="group-hover:scale-105"
                      />
                    </button>

                    {sold && (
                      <div className="absolute bottom-3 left-3 bg-ink/95 text-canvas px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider shadow">
                        Collected (1 of 1)
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveArtwork(work.id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-canvas/90 hover:bg-canvas rounded-full text-ink transition-all z-10 shadow-sm"
                      title={isArtworkSaved(work.id) ? 'Saved in Wishlist' : 'Save to Wishlist'}
                      aria-label="Save to Wishlist"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isArtworkSaved(work.id) ? 'fill-coral text-coral' : 'text-ink hover:text-coral'
                        }`}
                      />
                    </button>

                    {/* View Details hover button */}
                    {onSelectArtwork && (
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectArtwork(work);
                          }}
                          className="bg-ink text-canvas hover:bg-coral px-3 py-1.5 text-xs font-semibold shadow transition-colors"
                        >
                          View Details & Rights
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <button
                      onClick={() => onSelectArtwork && onSelectArtwork(work)}
                      className="text-left group/title flex-1 min-w-0"
                    >
                      <p className="font-display text-xl font-medium text-ink group-hover/title:text-coral transition-colors truncate">
                        {work.title}
                      </p>
                      <p className="text-sm text-muted mt-1">{work.category}</p>
                    </button>
                    <div className="text-right flex-shrink-0">
                      <span className="font-display text-lg text-ink whitespace-nowrap">{inr(work.price)}</span>
                      {sold && (
                        <span className="block text-[11px] font-semibold text-coral uppercase tracking-wide">Sold</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Commission CTA bottom band */}
        <div className="mt-24 bg-aubergine text-canvas p-10 md:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="font-display text-2xl md:text-3xl mb-2">
              Commission {artist.name.split(' ')[0]} for your next project.
            </p>
            <p className="text-canvas/70">Starting from {inr(artist.startingPrice)}. No payment required to submit a request.</p>
          </div>
          <button
            onClick={() => onNavigate('commission', artist.slug)}
            className="shrink-0 inline-flex items-center gap-2 bg-coral text-canvas px-8 py-4 font-semibold text-sm border border-coral hover:bg-canvas hover:text-aubergine hover:border-canvas transition-all duration-300"
          >
            Request a commission
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
