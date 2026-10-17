import ArtLoopLogo from './ArtLoopLogo';
import type { Page } from './Nav';

type FooterProps = {
  onNavigate: (page: Page) => void;
};

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-aubergine text-canvas mt-24 md:mt-32">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <div className="mb-6">
              <ArtLoopLogo inverse />
            </div>
            <p className="font-display text-2xl md:text-3xl leading-snug text-canvas/80 max-w-md">
              An independent marketplace where emerging student artists find their first audience.
            </p>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <p className="editorial-label text-canvas/50 mb-5">Explore</p>
            <ul className="space-y-3">
              <li>
                <button onClick={() => onNavigate('discover')} className="link-underline text-canvas/90 hover:text-coral transition-colors">
                  Discover artworks
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('artists')} className="link-underline text-canvas/90 hover:text-coral transition-colors">
                  Browse artists
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('dashboard')} className="link-underline text-canvas/90 hover:text-coral transition-colors">
                  Creator dashboard
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="editorial-label text-canvas/50 mb-5">About</p>
            <ul className="space-y-3">
              <li className="text-canvas/90">A university hackathon project</li>
              <li className="text-canvas/90">Built for student creators</li>
              <li className="text-canvas/90">No payments. No auth. Just art.</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-canvas/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-sm text-canvas/50">
            © 2026 ArtLoop — Independent talent. Fresh perspectives.
          </p>
          <p className="text-sm text-canvas/50">
            Crafted with intention for the student art community
          </p>
        </div>
      </div>
    </footer>
  );
}
