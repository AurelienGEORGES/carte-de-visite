import { useRef, useState } from 'react';
import { formatDuration } from '../utils';

// Carte fixe : une seule image générée par l'API Static Maps de MapTiler, au lieu de Leaflet et de ses tuiles.
// Vue du monde centrée sur (0°, 20°N), zoom 0.5 : le même cadrage que l'ancienne carte Leaflet.
const MAP_KEY = 'lx9QLhuAyx3LhtoQz1LB';
const mapUrl = (scale: '' | '@2x') =>
    `https://api.maptiler.com/maps/streets/static/0,20,0.5/640x320${scale}.png?key=${MAP_KEY}&attribution=false`;

// Position de Toulouse (1.44°E, 43.60°N) dans l'image 640×320, en projection Web Mercator.
const MARKER_POSITION = { left: '50.45%', top: '32.5%' };

interface MapCardProps {
    onMapLoaded?: (responseTime: string) => void;
}

export default function MapCard({ onMapLoaded }: MapCardProps) {
    const requestStartedAt = useRef(performance.now());
    const [hasError, setHasError] = useState(false);

    function handleError() {
        setHasError(true);
        onMapLoaded?.('Indisponible');
    }

    return (
        <section className="glass-subcard overflow-hidden p-3.5 sm:p-5" aria-labelledby="map-title">
            <div className="mb-3 flex flex-col items-start gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <h1 id="map-title" className="section-title">Localisation</h1>
                <p className="m-0 text-sm text-ink/75">Toulouse, France</p>
            </div>
            <div className="relative h-[clamp(220px,38vw,320px)] overflow-hidden rounded-xl border border-white/40 bg-[rgba(246,250,253,0.4)]">
                {hasError ? (
                    <p className="flex size-full items-center justify-center text-sm text-ink/75">
                        La carte est temporairement indisponible.
                    </p>
                ) : (
                    <>
                        <img
                            src={mapUrl('')}
                            srcSet={`${mapUrl('')} 1x, ${mapUrl('@2x')} 2x`}
                            alt="Carte mondiale avec un repère à Toulouse, France"
                            width={640}
                            height={320}
                            decoding="async"
                            className="size-full object-cover"
                            onLoad={() => onMapLoaded?.(formatDuration(performance.now() - requestStartedAt.current))}
                            onError={handleError}
                        />
                        <svg
                            viewBox="0 0 24 36"
                            className="absolute h-9 w-6 -translate-x-1/2 -translate-y-full drop-shadow-md"
                            style={MARKER_POSITION}
                            aria-hidden="true"
                        >
                            <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#2a81cb" />
                            <circle cx="12" cy="12" r="4.5" fill="#fff" />
                        </svg>
                        <span className="absolute right-0 bottom-0 rounded-tl-md bg-white/70 px-1.5 py-0.5 text-[0.65rem] text-ink/80">
                            © MapTiler © OpenStreetMap
                        </span>
                    </>
                )}
            </div>
        </section>
    );
}
