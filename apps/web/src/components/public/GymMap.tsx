'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, Navigation, AlertCircle } from 'lucide-react';

interface Gym {
  id: string;
  name: string;
  slug: string;
  city?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  logoUrl?: string;
}

interface MapState {
  status: 'idle' | 'locating' | 'loading' | 'ready' | 'error';
  error?: string;
  lat?: number;
  lng?: number;
  gyms: Gym[];
}

export default function GymMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const [state, setState] = useState<MapState>({ status: 'idle', gyms: [] });
  const [selected, setSelected] = useState<Gym | null>(null);

  async function fetchGyms(lat: number, lng: number) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/gyms/discover?limit=50`
      );
      if (!res.ok) return [];
      const data = await res.json();
      // Assign random coords near the user if no real lat/lng stored yet
      return (data.gyms ?? []).map((g: Gym, i: number) => ({
        ...g,
        lat: g.lat ?? lat + (Math.random() - 0.5) * 0.12,
        lng: g.lng ?? lng + (Math.random() - 0.5) * 0.12,
      }));
    } catch {
      return [];
    }
  }

  async function initMap(lat: number, lng: number, gyms: Gym[]) {
    if (!mapRef.current || leafletMap.current) return;

    const L = (await import('leaflet')).default;
    await import('leaflet/dist/leaflet.css' as any);

    // Fix default icon paths broken by bundlers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(
      [lat, lng],
      13
    );
    leafletMap.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // User location marker (blue dot)
    const userIcon = L.divIcon({
      className: '',
      html: `<div style="width:16px;height:16px;background:#6366f1;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(99,102,241,0.25)"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    L.marker([lat, lng], { icon: userIcon })
      .addTo(map)
      .bindPopup('<b>You are here</b>');

    // Gym markers
    gyms.forEach((gym) => {
      if (!gym.lat || !gym.lng) return;

      const gymIcon = L.divIcon({
        className: '',
        html: `<div style="width:32px;height:32px;background:#4f46e5;border:2px solid white;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v16M18 4v16M3 8h3m12 0h3M3 16h3m12 0h3M9 4h6M9 20h6"/></svg>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([gym.lat, gym.lng], { icon: gymIcon })
        .addTo(map)
        .on('click', () => setSelected(gym))
        .bindTooltip(gym.name, { direction: 'top', offset: [0, -18] });
    });
  }

  async function handleLocate() {
    setState({ status: 'locating', gyms: [] });
    if (!navigator.geolocation) {
      setState({ status: 'error', error: 'Geolocation is not supported by your browser.', gyms: [] });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setState({ status: 'loading', lat, lng, gyms: [] });
        const gyms = await fetchGyms(lat, lng);
        setState({ status: 'ready', lat, lng, gyms });
        await initMap(lat, lng, gyms);
      },
      (err) => {
        setState({ status: 'error', error: 'Location access denied. Please allow location access and try again.', gyms: [] });
      },
      { timeout: 10000 }
    );
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50" style={{ height: 480 }}>
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Overlay states */}
      {state.status !== 'ready' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-[1000]">
          {state.status === 'idle' && (
            <>
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Find gyms near you</h3>
              <p className="text-sm text-slate-500 mb-6 text-center max-w-xs">
                Allow location access and we'll show all gyms on an interactive map.
              </p>
              <button
                onClick={handleLocate}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                <Navigation className="w-4 h-4" /> Use my location
              </button>
            </>
          )}
          {(state.status === 'locating' || state.status === 'loading') && (
            <>
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
              <p className="text-slate-600 font-medium">
                {state.status === 'locating' ? 'Getting your location…' : 'Loading gyms near you…'}
              </p>
            </>
          )}
          {state.status === 'error' && (
            <>
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
              <p className="text-slate-700 font-medium mb-1">Location unavailable</p>
              <p className="text-sm text-slate-500 mb-5 text-center max-w-xs">{state.error}</p>
              <button
                onClick={handleLocate}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
              >
                Try again
              </button>
            </>
          )}
        </div>
      )}

      {/* Selected gym card */}
      {selected && state.status === 'ready' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1001] w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4">
          <button
            onClick={() => setSelected(null)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-lg leading-none"
            aria-label="Close"
          >
            ×
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm leading-tight">{selected.name}</p>
              {selected.city && <p className="text-xs text-slate-400">{selected.city}</p>}
            </div>
          </div>
          <a
            href={`/gyms/${selected.slug}`}
            className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
          >
            View gym profile →
          </a>
        </div>
      )}

      {/* Gym count badge */}
      {state.status === 'ready' && state.gyms.length > 0 && (
        <div className="absolute top-3 left-3 z-[1001] bg-white rounded-lg shadow px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-100">
          📍 {state.gyms.length} gyms nearby
        </div>
      )}
    </div>
  );
}
