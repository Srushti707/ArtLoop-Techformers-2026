type ArtLoopLogoProps = {
  compact?: boolean;
  inverse?: boolean;
  className?: string;
};

export default function ArtLoopLogo({ compact = false, inverse = false, className = '' }: ArtLoopLogoProps) {
  const wordmarkColor = inverse ? 'text-canvas' : 'text-ink';
  const iconSize = compact ? 'h-9 w-9' : 'h-10 w-10';
  const textSize = compact ? 'text-xl' : 'text-2xl';

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className={`${iconSize} shrink-0 rounded-xl bg-aubergine p-1.5 shadow-sm`} aria-hidden="true">
        <svg viewBox="0 0 40 40" className="h-full w-full" fill="none">
          <path
            d="M25.8 9.3c-4.7-3.6-10.9-1.8-13.8 2.9-2.9 4.7-2.1 10.7 2.1 13.3 4.2 2.6 9.6.2 11.8-4.6 2.2-4.8 1.5-10.4-2.4-12.9Z"
            stroke="#f5f0e8"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M14.2 30.7c4.7 3.6 10.9 1.8 13.8-2.9 2.9-4.7 2.1-10.7-2.1-13.3-4.2-2.6-9.6-.2-11.8 4.6-2.2 4.8-1.5 10.4 2.4 12.9Z"
            stroke="#f5f0e8"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <span className={`font-sans text-3xl font-bold tracking-[-0.07em] ${textSize} ${wordmarkColor}`}>
        artloop<span className="ml-0.5 align-top text-[0.5em] font-semibold tracking-normal">®</span>
      </span>
      <span className="sr-only">ArtLoop</span>
    </span>
  );
}
