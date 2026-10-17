type ArtworkImageProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
};

import { useState } from 'react';

export default function ArtworkImage({ src, alt, className = '', imgClassName = '' }: ArtworkImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className={`relative bg-canvas-dark overflow-hidden ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 animate-pulse bg-canvas-dark" />
      )}
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-canvas-dark">
          <div className="text-center p-8">
            <div className="w-12 h-12 mx-auto mb-3 border-2 border-muted/40 rounded-full flex items-center justify-center">
              <span className="font-display text-lg text-muted">AL</span>
            </div>
            <p className="text-xs text-muted">Artwork preview unavailable</p>
          </div>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${imgClassName}`}
        />
      )}
    </div>
  );
}
