import { useRef, useState } from 'react';
import { formatDuration } from '../utils';

// Carte fixe sans Leaflet : les 4 tuiles MapTiler (512 px, zoom 1) qui couvrent le monde,
// affichées en simples images. Même cadrage que l'ancienne carte Leaflet (zoom 1.5, centre 0°, 20°N).
const TILE_URL = 'https://api.maptiler.com/maps/streets/1/{x}/{y}.png?key=lx9QLhuAyx3LhtoQz1LB';
const TILES = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 }
];

// Positions en Web Mercator dans un monde de 724 px de côté (256 × 2^1.5).
const WORLD_SIZE = 724;
const TILE_SIZE = WORLD_SIZE / 2;
const VIEW_CENTER = { x: 362, y: 320.9 }; // 0°, 20°N
const TOULOUSE = { x: 364.9, y: 264.4 }; // 1.44°E, 43.60°N

interface MapCardProps {
    onMapLoaded?: (responseTime: string) => void;
}

export default function MapCard({ onMapLoaded }: MapCardProps) {
    const requestStartedAt = useRef(performance.now());
    const loadedTiles = useRef(0);
    const [hasError, setHasError] = useState(false);

    function handleTileLoad() {
        loadedTiles.current += 1;
        if (loadedTiles.current === TILES.length) {
            onMapLoaded?.(formatDuration(performance.now() - requestStartedAt.current));
        }
    }

    function handleTileError() {
        if (!hasError) {
            setHasError(true);
            onMapLoaded?.('Indisponible');
        }
    }

    return (
        <section className="glass-subcard overflow-hidden p-3.5 sm:p-5" aria-labelledby="map-title">
            <div className="mb-3 flex flex-col items-start gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <h1 id="map-title" className="section-title">Localisation</h1>
                <p className="m-0 text-sm text-ink/75">Toulouse, France</p>
            </div>
            <div
                className="relative h-[clamp(220px,38vw,320px)] overflow-hidden rounded-xl border border-white/40 bg-[rgba(246,250,253,0.4)]"
                role="img"
                aria-label="Carte mondiale avec un repère à Toulouse, France"
            >
                {hasError ? (
                    <p className="flex size-full items-center justify-center text-sm text-ink/75">
                        La carte est temporairement indisponible.
                    </p>
                ) : (
                    <>
                        <div
                            className="absolute"
                            style={{
                                width: WORLD_SIZE,
                                height: WORLD_SIZE,
                                left: `calc(50% - ${VIEW_CENTER.x}px)`,
                                top: `calc(50% - ${VIEW_CENTER.y}px)`
                            }}
                        >
                            {TILES.map(({ x, y }) => (
                                <img
                                    key={`${x}-${y}`}
                                    src={TILE_URL.replace('{x}', String(x)).replace('{y}', String(y))}
                                    alt=""
                                    width={TILE_SIZE}
                                    height={TILE_SIZE}
                                    decoding="async"
                                    className="absolute max-w-none"
                                    style={{ left: x * TILE_SIZE, top: y * TILE_SIZE }}
                                    onLoad={handleTileLoad}
                                    onError={handleTileError}
                                />
                            ))}
                            <svg
                                viewBox="0 0 24 36"
                                className="absolute h-9 w-6 -translate-x-1/2 -translate-y-full drop-shadow-md"
                                style={{ left: TOULOUSE.x, top: TOULOUSE.y }}
                                aria-hidden="true"
                            >
                                <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#2a81cb" />
                                <circle cx="12" cy="12" r="4.5" fill="#fff" />
                            </svg>
                        </div>
                        <span className="absolute right-0 bottom-0 rounded-tl-md bg-white/70 px-1.5 py-0.5 text-[0.65rem] text-ink/80">
                            © MapTiler © OpenStreetMap
                        </span>
                    </>
                )}
            </div>
        </section>
    );
}
