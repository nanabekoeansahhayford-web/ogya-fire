import React, { useState } from 'react';
import {
  MapPin,
  ExternalLink,
  Copy,
  Check,
  Compass,
  Navigation,
  ShieldCheck,
  Maximize2,
  Layers,
  ZoomIn,
  ZoomOut,
  Building2,
  Sparkles
} from 'lucide-react';

interface LocationMapPlaceholderProps {
  location: string;
  region: string;
  categoryName?: string;
  title?: string;
}

export const LocationMapPlaceholder: React.FC<LocationMapPlaceholderProps> = ({
  location,
  region,
  categoryName,
  title,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copiedLocation, setCopiedLocation] = useState<boolean>(false);
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite' | 'transit'>('streets');

  const handleCopyLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${location}, ${region}, Ghana`);
    setCopiedLocation(true);
    setTimeout(() => setCopiedLocation(false), 2000);
  };

  const handleOpenGoogleMaps = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = encodeURIComponent(`${location}, ${region}, Ghana`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer');
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => Math.min(prev + 0.25, 1.75));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  };

  // Determine neighborhood tag based on location text
  const isAccra = location.toLowerCase().includes('accra') || region.toLowerCase().includes('accra');
  const isKumasi = location.toLowerCase().includes('kumasi') || region.toLowerCase().includes('ashanti');

  const mainStreetName = isAccra
    ? 'Liberation Road / Airport Bypass'
    : isKumasi
    ? 'Harper Road / Western Ring'
    : 'Commercial Central Avenue';

  const secondaryStreetName = isAccra
    ? 'Independence Avenue'
    : isKumasi
    ? 'Prempeh II Boulevard'
    : 'Regional Link Road';

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
      {/* Map Canvas Container */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-[#e5e9ec] dark:bg-[#0f172a] select-none">
        {/* Background Stylized Map Grid / Vector Streets */}
        <div
          className="absolute inset-0 transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Base Vector Canvas */}
          <svg
            className="w-full h-full"
            viewBox="0 0 800 400"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Landmass Base */}
            <rect width="800" height="400" fill={mapStyle === 'satellite' ? '#1e293b' : 'currentColor'} className="text-[#f1f5f9] dark:text-[#0b1120]" />

            {/* Urban Zoning Blocks / Neighborhood Parcels */}
            <g className={mapStyle === 'satellite' ? 'opacity-20' : 'opacity-100'}>
              {/* Park / Green Reserve */}
              <path
                d="M 50 40 Q 120 20 200 60 T 260 140 Q 180 160 110 130 Z"
                className="fill-emerald-100/70 dark:fill-emerald-950/40"
              />
              <path
                d="M 620 240 Q 720 220 780 270 T 740 370 Q 640 360 610 300 Z"
                className="fill-emerald-100/70 dark:fill-emerald-950/40"
              />

              {/* Waterbody / Lagoon / Ocean edge */}
              <path
                d="M 0 350 Q 180 320 340 360 T 800 330 L 800 400 L 0 400 Z"
                className="fill-sky-100 dark:fill-sky-950/40 stroke-sky-200 dark:stroke-sky-900/60"
                strokeWidth="2"
              />

              {/* Residential & Commercial Area Blocks */}
              <rect x="70" y="180" width="100" height="70" rx="8" className="fill-slate-200/50 dark:fill-slate-800/40" />
              <rect x="190" y="190" width="120" height="80" rx="8" className="fill-slate-200/50 dark:fill-slate-800/40" />
              <rect x="330" y="80" width="130" height="85" rx="8" className="fill-slate-200/50 dark:fill-slate-800/40" />
              <rect x="480" y="70" width="140" height="95" rx="8" className="fill-slate-200/50 dark:fill-slate-800/40" />
              <rect x="520" y="190" width="110" height="75" rx="8" className="fill-slate-200/50 dark:fill-slate-800/40" />
              <rect x="650" y="90" width="100" height="80" rx="8" className="fill-slate-200/50 dark:fill-slate-800/40" />
            </g>

            {/* Minor Roads / Grid Network */}
            <g className="stroke-white dark:stroke-slate-800/90" strokeWidth="3" strokeLinecap="round">
              <line x1="0" y1="110" x2="800" y2="110" />
              <line x1="0" y1="270" x2="800" y2="270" />
              <line x1="180" y1="0" x2="180" y2="400" />
              <line x1="320" y1="0" x2="320" y2="400" />
              <line x1="640" y1="0" x2="640" y2="400" />
              <line x1="480" y1="0" x2="480" y2="400" />
            </g>

            {/* Secondary Arterial Roads */}
            <g className="stroke-slate-300 dark:stroke-slate-700/80" strokeWidth="5" strokeLinecap="round">
              <path d="M 0 170 Q 250 190 400 170 T 800 210" fill="none" />
              <path d="M 240 0 Q 260 200 240 400" fill="none" />
              <path d="M 580 0 Q 560 220 600 400" fill="none" />
            </g>

            {/* Primary Highway / Main Expressway (passing near item pin) */}
            <g strokeLinecap="round">
              {/* Outer Highway casing */}
              <path
                d="M 40 40 Q 280 220 400 200 T 760 120"
                fill="none"
                className="stroke-amber-300/80 dark:stroke-amber-700/70"
                strokeWidth="8"
              />
              {/* Inner Highway core */}
              <path
                d="M 40 40 Q 280 220 400 200 T 760 120"
                fill="none"
                className="stroke-amber-400 dark:stroke-amber-500"
                strokeWidth="4"
              />
            </g>

            {/* Street / Landmark Text Annotations */}
            <text x="75" y="130" className="fill-slate-400 dark:fill-slate-500 text-[10px] font-bold tracking-wider select-none font-mono">
              {mainStreetName}
            </text>
            <text x="490" y="210" className="fill-slate-400 dark:fill-slate-500 text-[9px] font-semibold tracking-wider select-none font-mono">
              {secondaryStreetName}
            </text>
            <text x="120" y="90" className="fill-emerald-700/60 dark:fill-emerald-400/60 text-[9px] font-bold select-none">
              🌿 Central Green Reserve
            </text>
            <text x="210" y="380" className="fill-sky-600/70 dark:fill-sky-400/70 text-[9px] font-bold select-none">
              🌊 Coastal Lagoon Area
            </text>
            <text x="630" y="160" className="fill-slate-400 dark:fill-slate-600 text-[9px] font-medium select-none">
              Commercial Plaza Hub
            </text>

            {/* Inspection / Public Safe Meetup Radius Ring around Pin (Center: 400, 200) */}
            <circle
              cx="400"
              cy="200"
              r="70"
              fill="rgba(245, 158, 11, 0.08)"
              className="stroke-amber-500/50 dark:stroke-amber-400/40"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          </svg>
        </div>

        {/* Central Map Pin Target Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-20 pointer-events-none flex flex-col items-center">
          {/* Floating Location Name Tag */}
          <div className="mb-1.5 px-3 py-1.5 bg-slate-900/90 dark:bg-black/90 text-white rounded-xl shadow-lg border border-slate-700/80 backdrop-blur-xs flex items-center gap-1.5 animate-bounce [animation-duration:2.5s]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-black truncate max-w-[190px] sm:max-w-[260px]">
              {location}
            </span>
          </div>

          {/* Map Pin Droplet */}
          <div className="relative group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-red-600 via-orange-500 to-amber-500 text-white flex items-center justify-center shadow-xl ring-4 ring-white dark:ring-slate-900">
              <MapPin size={22} className="fill-white/20 text-white stroke-[2.2]" />
            </div>

            {/* Glowing Pin Point Drop */}
            <div className="w-2.5 h-2.5 bg-red-600 rotate-45 mx-auto -mt-1 rounded-xs ring-2 ring-white dark:ring-slate-900" />
          </div>

          {/* Pulsing Ripple on Ground */}
          <div className="w-7 h-2 rounded-full bg-slate-950/25 dark:bg-black/50 blur-[1px] mt-0.5" />
        </div>

        {/* Top Left Compass & Neighborhood Badge */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <div className="px-2.5 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-800 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            <Compass size={14} className="text-amber-500" />
            <span className="truncate max-w-[150px] sm:max-w-[200px]">{region}</span>
          </div>
        </div>

        {/* Top Right Map Style / Layer Pills */}
        <div className="absolute top-3 right-3 z-10 hidden sm:flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs p-1 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-800 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setMapStyle('streets')}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              mapStyle === 'streets'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Streets
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('satellite')}
            className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
              mapStyle === 'satellite'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Bottom Right Zoom Controls */}
        <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1">
          <div className="flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-800 overflow-hidden">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border-b border-slate-200/70 dark:border-slate-800"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
          </div>
        </div>

        {/* Bottom Left Scale Bar */}
        <div className="absolute bottom-3 left-3 z-10 px-2 py-0.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs rounded-md text-[9px] font-mono text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5">
          <span className="w-8 border-b-2 border-slate-700 dark:border-slate-300 inline-block" />
          <span>500 m</span>
        </div>
      </div>

      {/* Map Footer Bar with Location Details & Direct Navigation Links */}
      <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
              <MapPin size={14} className="text-red-500" />
              <span>{location}</span>
            </span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              {region}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <ShieldCheck size={13} />
              <span>Verified District Hub</span>
            </span>
            <span>·</span>
            <span>Public meetup venues available (malls, banks, fuel stations)</span>
          </div>
        </div>

        {/* Action Buttons: Open in Google Maps & Copy Coordinates */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={handleCopyLocation}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Copy address to clipboard"
          >
            {copiedLocation ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
            <span>{copiedLocation ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleOpenGoogleMaps}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Open in Google Maps for driving directions"
          >
            <Navigation size={13} className="text-amber-400" />
            <span>Open in Maps</span>
            <ExternalLink size={12} className="opacity-70" />
          </button>
        </div>
      </div>
    </div>
  );
};
