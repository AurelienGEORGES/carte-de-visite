import { useEffect, useRef } from 'react';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { formatDuration } from '../utils';

const WORLD_ZOOM = 1.5;
const WORLD_BOUNDS: L.LatLngBoundsExpression = [[-85, -180], [85, 180]];
const TOULOUSE: L.LatLngTuple = [43.6047, 1.4442];
const TILES_URL = 'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=lx9QLhuAyx3LhtoQz1LB';

const markerIconConfig = L.icon({
    ...L.Icon.Default.prototype.options,
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow
});

interface MapCardProps {
    onTilesLoaded?: (responseTime: string) => void;
}

export default function MapCard({ onTilesLoaded }: MapCardProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const onTilesLoadedRef = useRef(onTilesLoaded);
    onTilesLoadedRef.current = onTilesLoaded;

    useEffect(() => {
        const map = L.map(containerRef.current!, {
            boxZoom: false,
            doubleClickZoom: false,
            dragging: false,
            keyboard: false,
            maxBounds: WORLD_BOUNDS,
            maxBoundsViscosity: 1,
            minZoom: WORLD_ZOOM,
            maxZoom: WORLD_ZOOM,
            scrollWheelZoom: false,
            touchZoom: false,
            worldCopyJump: false,
            zoomControl: false,
            zoomSnap: 0
        }).setView([20, 0], WORLD_ZOOM);

        const mapRequestStartedAt = performance.now();
        const tiles = L.tileLayer(TILES_URL, {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors &copy; MapTiler',
            bounds: WORLD_BOUNDS,
            noWrap: true,
            tileSize: 512,
            zoomOffset: -1
        });

        let hasTileError = false;
        tiles.once('tileerror', () => {
            hasTileError = true;
        });
        tiles.once('load', () => {
            onTilesLoadedRef.current?.(
                hasTileError ? 'Indisponible' : formatDuration(performance.now() - mapRequestStartedAt)
            );
        });
        tiles.addTo(map);

        L.marker(TOULOUSE, { icon: markerIconConfig }).addTo(map);

        return () => {
            map.remove();
        };
    }, []);

    return (
        <section className="glass-subcard overflow-hidden p-3.5 sm:p-5" aria-labelledby="map-title">
            <div className="mb-3 flex flex-col items-start gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                <h1 id="map-title" className="section-title">Localisation</h1>
                <p className="m-0 text-sm text-ink/75">Toulouse, France</p>
            </div>
            <div
                ref={containerRef}
                className="h-[clamp(220px,38vw,320px)] rounded-xl border border-white/40 bg-[rgba(246,250,253,0.4)]"
                aria-label="Carte mondiale avec un repère à Toulouse, France"
            />
        </section>
    );
}
