/**
 * SeizenLogo – reusable brand logo component
 *
 * Props:
 *  variant  "full"   – icon + "Seizen AI" wordmark + tagline  (default)
 *           "icon"   – icon only (square tile)
 *           "mark"   – icon + "Seizen AI" wordmark (no tagline)
 *  size     number   – base size in px (icon width/height). Default 40
 *  className string  – extra class on the root wrapper
 */
export default function SeizenLogo({
    variant = 'full',
    size = 40,
    className = '',
    textColor,
    aiColor = '#20C997',
    tileBg = '#14B8A6'
}) {
    const tileRadius = size * 0.22;

    const Tile = () => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 56 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ flexShrink: 0 }}
        >
            {/* Rounded teal background */}
            <rect width="56" height="56" rx={tileRadius} fill={tileBg} />

            {/* ECG / heartbeat line */}
            <polyline
                points="6,28 14,28 18,18 22,38 26,24 30,32 34,28 50,28"
                stroke="white"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
            />

            {/* Small dots at the ends */}
            <circle cx="6"  cy="28" r="2.2" fill="white" />
            <circle cx="50" cy="28" r="2.2" fill="white" />
        </svg>
    );

    if (variant === 'icon') return <Tile />;

    return (
        <div
            className={`seizen-logo-root ${className}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.3 }}
        >
            <Tile />

            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
                {/* Wordmark */}
                <span
                    style={{
                        fontFamily: 'Plus Jakarta Sans, sans-serif',
                        fontWeight: 700,
                        fontSize: size * 0.6,
                        letterSpacing: '-0.01em',
                        display: 'flex',
                        gap: '0.18em',
                    }}
                >
                    <span style={{ color: textColor || 'var(--color-text, #1B2A3B)' }}>Seizen</span>
                    <span style={{ color: aiColor }}>AI</span>
                </span>

                {/* Tagline – only in "full" variant */}
                {variant === 'full' && (
                    <span
                        style={{
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            fontWeight: 400,
                            fontSize: size * 0.27,
                            color: 'var(--color-text-muted, #6B7280)',
                            letterSpacing: '0.01em',
                            marginTop: 1,
                        }}
                    >
                        healthcare, understood
                    </span>
                )}
            </div>
        </div>
    );
}
