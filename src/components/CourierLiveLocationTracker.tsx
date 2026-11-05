import React, { useState, useEffect, useRef } from 'react';
import {
  Navigation,
  Compass,
  MapPin,
  Truck,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ExternalLink,
  Layers,
  Zap,
} from 'lucide-react';
import { CourierOrder, GhanaRegion } from '../types/courier';
import { GHANA_REGIONS_DATA } from '../utils/courierStorage';

interface CourierLiveLocationTrackerProps {
  order: CourierOrder;
  onAdvanceMilestone?: () => void;
}

interface Waypoint {
  name: string;
  lat: number;
  lng: number;
  x: number; // SVG coordinate
  y: number; // SVG coordinate
  passed: boolean;
  notes: string;
}

export const CourierLiveLocationTracker: React.FC<CourierLiveLocationTrackerProps> = ({
  order,
  onAdvanceMilestone,
}) => {
  // Live Simulation state: progress 0.0 to 1.0 along route
  const initialProgress = order.status === 'delivered' ? 1.0 : order.status === 'out_for_delivery' ? 0.85 : 0.45;
  const [progress, setProgress] = useState<number>(initialProgress);
  const [isPlaying, setIsPlaying] = useState<boolean>(order.status === 'in_transit' || order.status === 'out_for_delivery');
  const [mapTheme, setMapTheme] = useState<'highway' | 'satellite' | 'night'>('highway');
  const [speedKmh, setSpeedKmh] = useState<number>(order.status === 'delivered' ? 0 : 52);
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpVerified, setOtpVerified] = useState<boolean>(order.status === 'delivered');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [showSosAlert, setShowSosAlert] = useState<boolean>(false);

  const animationFrameRef = useRef<number | null>(null);

  // Define origin & destination coords
  const originInfo = GHANA_REGIONS_DATA[order.sender.region] || GHANA_REGIONS_DATA['Greater Accra'];
  const destInfo = GHANA_REGIONS_DATA[order.recipient.region] || GHANA_REGIONS_DATA['Ashanti'];

  // Map route points in SVG coordinate system (800x420)
  const isAccraToKumasi =
    (order.sender.region === 'Ashanti' && order.recipient.region === 'Greater Accra') ||
    (order.sender.region === 'Greater Accra' && order.recipient.region === 'Ashanti');

  // Generate intermediate highway checkpoints across Ghana
  const routeWaypoints: Waypoint[] = isAccraToKumasi
    ? [
        { name: `${order.sender.cityOrArea} (Origin)`, lat: originInfo.lat, lng: originInfo.lng, x: 120, y: 120, passed: progress >= 0.1, notes: 'Package sealed with barcode seal' },
        { name: 'Ejisu Highway Checkpoint', lat: 6.71, lng: -1.48, x: 230, y: 145, passed: progress >= 0.25, notes: 'Passed regional cargo weighing station' },
        { name: 'Konongo Transit Corridor', lat: 6.62, lng: -1.22, x: 330, y: 180, passed: progress >= 0.45, notes: 'Normal highway traffic flow' },
        { name: 'Nkawkaw Escarpment Bypass', lat: 6.55, lng: -0.77, x: 440, y: 220, passed: progress >= 0.65, notes: 'GPS checkpoint ping verified' },
        { name: 'Suhum - Bunso Junction', lat: 6.04, lng: -0.45, x: 550, y: 260, passed: progress >= 0.8, notes: 'Rider refueled, moving onto expressway' },
        { name: 'Pokuase Interchange / Gateway', lat: 5.69, lng: -0.28, x: 660, y: 310, passed: progress >= 0.9, notes: 'Entering destination metro perimeter' },
        { name: `${order.recipient.cityOrArea} Doorstep`, lat: destInfo.lat, lng: destInfo.lng, x: 740, y: 350, passed: progress >= 0.99, notes: 'Final delivery address' },
      ]
    : [
        { name: `${order.sender.cityOrArea} (Hub A)`, lat: originInfo.lat, lng: originInfo.lng, x: 120, y: 150, passed: progress >= 0.1, notes: 'Dispatched from origin hub' },
        { name: 'Inter-Regional Waypoint 1', lat: (originInfo.lat * 2 + destInfo.lat) / 3, lng: (originInfo.lng * 2 + destInfo.lng) / 3, x: 300, y: 210, passed: progress >= 0.4, notes: 'Cruising national corridor' },
        { name: 'Regional Border GPS Point', lat: (originInfo.lat + destInfo.lat) / 2, lng: (originInfo.lng + destInfo.lng) / 2, x: 500, y: 270, passed: progress >= 0.7, notes: 'Transit security clearance OK' },
        { name: `${order.recipient.cityOrArea} Doorstep`, lat: destInfo.lat, lng: destInfo.lng, x: 720, y: 340, passed: progress >= 0.99, notes: 'Destination delivery pin' },
      ];

  // Calculate current rider coordinates along the path
  const totalSegments = routeWaypoints.length - 1;
  const scaledProgress = Math.max(0, Math.min(1, progress)) * totalSegments;
  const currentSegmentIndex = Math.min(totalSegments - 1, Math.floor(scaledProgress));
  const segmentT = scaledProgress - currentSegmentIndex;

  const p1 = routeWaypoints[currentSegmentIndex];
  const p2 = routeWaypoints[currentSegmentIndex + 1] || p1;

  const currentX = p1.x + (p2.x - p1.x) * segmentT;
  const currentY = p1.y + (p2.y - p1.y) * segmentT;
  const currentLat = p1.lat + (p2.lat - p1.lat) * segmentT;
  const currentLng = p1.lng + (p2.lng - p1.lng) * segmentT;

  const distanceRemainingKm = Math.max(0, Math.round(order.distanceKmEstimated * (1 - progress)));
  const etaMinutes = Math.max(2, Math.round((distanceRemainingKm / (speedKmh || 45)) * 60));

  // Simulation tick loop
  useEffect(() => {
    if (!isPlaying || progress >= 1.0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1.0) {
          setIsPlaying(false);
          setSpeedKmh(0);
          return 1.0;
        }
        // Small realistic speed fluctuations
        const jitterSpeed = 48 + Math.floor(Math.random() * 12);
        setSpeedKmh(jitterSpeed);
        return Math.min(1.0, prev + 0.015);
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isPlaying, progress]);

  const handleTogglePlay = () => {
    if (progress >= 1.0) {
      setProgress(0.1);
      setIsPlaying(true);
      setSpeedKmh(52);
    } else {
      setIsPlaying(!isPlaying);
      if (isPlaying) setSpeedKmh(0);
      else setSpeedKmh(52);
    }
  };

  const handleReset = () => {
    setProgress(0.1);
    setIsPlaying(false);
    setSpeedKmh(0);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (otpInput.trim() === order.securityOtp) {
      setOtpVerified(true);
      setProgress(1.0);
      setIsPlaying(false);
      setSpeedKmh(0);
      onAdvanceMilestone?.();
    } else {
      setOtpError(`Incorrect OTP. Please enter the 4-digit code #${order.securityOtp} shown on your order receipt.`);
    }
  };

  // SVG path calculation for the route
  const routePathD = routeWaypoints.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-md space-y-0">
      {/* Tracker Top Bar */}
      <div className="px-5 py-3.5 bg-slate-950 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
            <Radio size={16} className={isPlaying ? 'animate-pulse text-slate-950' : 'text-slate-950'} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase font-black bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded border border-amber-500/30">
                Live GPS
              </span>
              <span className="text-xs font-bold text-slate-200 truncate">
                {order.waybillNumber} · {order.sender.cityOrArea} → {order.recipient.cityOrArea}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
              <span>Coords: {currentLat.toFixed(4)}°N, {Math.abs(currentLng).toFixed(4)}°W</span>
              <span>·</span>
              <span className="text-emerald-400 font-semibold">High Precision Satellite Lock</span>
            </div>
          </div>
        </div>

        {/* View Themes & Simulation Buttons */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setMapTheme('highway')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                mapTheme === 'highway' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Highway
            </button>
            <button
              type="button"
              onClick={() => setMapTheme('satellite')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                mapTheme === 'satellite' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapTheme('night')}
              className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                mapTheme === 'night' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Radar
            </button>
          </div>

          <button
            type="button"
            onClick={handleTogglePlay}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title={isPlaying ? 'Pause live movement simulation' : 'Play live rider movement simulation'}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} fill="currentColor" />}
            <span>{isPlaying ? 'Pause GPS' : 'Simulate GPS'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Reset simulation to origin"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Interactive Map Visualizer Canvas */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-slate-950 select-none">
        {/* SVG Route Graphic */}
        <svg
          className="w-full h-full"
          viewBox="0 0 800 420"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background Gradient depending on map theme */}
          <rect
            width="800"
            height="420"
            fill={
              mapTheme === 'satellite'
                ? '#0d131f'
                : mapTheme === 'night'
                ? '#070a12'
                : '#111827'
            }
          />

          {/* Radar Scanner Grid Lines */}
          <g className="stroke-slate-800/60" strokeWidth="1">
            <line x1="0" y1="100" x2="800" y2="100" />
            <line x1="0" y1="200" x2="800" y2="200" />
            <line x1="0" y1="300" x2="800" y2="300" />
            <line x1="200" y1="0" x2="200" y2="420" />
            <line x1="400" y1="0" x2="400" y2="420" />
            <line x1="600" y1="0" x2="600" y2="420" />
            <circle cx="400" cy="210" r="140" fill="none" className="stroke-slate-800/40" strokeDasharray="3 3" />
            <circle cx="400" cy="210" r="240" fill="none" className="stroke-slate-800/30" strokeDasharray="4 4" />
          </g>

          {/* Geographical Ghana Regions outlines (Illustrative vector zones) */}
          <path
            d="M 60 40 Q 180 30 320 60 T 600 50 Q 720 120 760 220 T 720 380 Q 450 400 220 380 T 60 300 Z"
            fill={mapTheme === 'satellite' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.03)'}
            stroke={mapTheme === 'satellite' ? '#065f46' : '#334155'}
            strokeWidth="1.5"
            strokeDasharray="5 5"
          />

          {/* Forest & Mountain Reserve annotations */}
          <text x="360" y="80" className="fill-slate-600 dark:fill-slate-600 font-mono text-[9px] uppercase tracking-widest select-none">
            🌲 Atewa Forest / Kwahu Ridge Range
          </text>
          <text x="180" y="320" className="fill-slate-600 dark:fill-slate-600 font-mono text-[9px] uppercase tracking-widest select-none">
            🌊 Gulf of Guinea Coastline
          </text>

          {/* Full Highway Trajectory (Inactive dashed path) */}
          <path
            d={routePathD}
            fill="none"
            className="stroke-slate-700/80"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={routePathD}
            fill="none"
            className="stroke-slate-800"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Completed Segment of Highway (Glowing active transit route) */}
          <path
            d={routePathD}
            fill="none"
            className="stroke-amber-500/40"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="800"
            strokeDashoffset={800 * (1 - progress)}
          />
          <path
            d={routePathD}
            fill="none"
            className="stroke-amber-400"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="800"
            strokeDashoffset={800 * (1 - progress)}
          />

          {/* Checkpoint Milestone Nodes */}
          {routeWaypoints.map((pt, idx) => (
            <g key={idx} transform={`translate(${pt.x}, ${pt.y})`}>
              <circle
                r={idx === 0 || idx === routeWaypoints.length - 1 ? 8 : 5}
                className={
                  pt.passed
                    ? 'fill-emerald-400 stroke-slate-950'
                    : 'fill-slate-700 stroke-slate-900'
                }
                strokeWidth="2"
              />
              <text
                x="0"
                y="-12"
                textAnchor="middle"
                className="fill-slate-300 font-mono text-[9px] font-bold select-none drop-shadow-md"
              >
                {pt.name}
              </text>
            </g>
          ))}

          {/* Geofence Delivery Radius Ring around Destination (Final point) */}
          {routeWaypoints.length > 0 && (
            <g transform={`translate(${routeWaypoints[routeWaypoints.length - 1].x}, ${routeWaypoints[routeWaypoints.length - 1].y})`}>
              <circle
                r="45"
                fill="rgba(16, 185, 129, 0.08)"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                className="animate-pulse"
              />
              <text x="0" y="32" textAnchor="middle" className="fill-emerald-400 font-mono text-[8px] font-bold">
                Doorstep Handover Geofence (500m)
              </text>
            </g>
          )}

          {/* Moving Dispatch Rider Marker */}
          <g transform={`translate(${currentX}, ${currentY})`}>
            {/* Pulsing signal halo */}
            <circle r="22" fill="rgba(245, 158, 11, 0.25)" className="animate-ping [animation-duration:2s]" />
            <circle r="14" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" className="shadow-lg" />
            <circle r="5" fill="#000000" />
          </g>
        </svg>

        {/* Live Rider Hover Tag */}
        <div
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-300"
          style={{
            left: `${(currentX / 800) * 100}%`,
            top: `${(currentY / 420) * 100 - 15}%`,
          }}
        >
          <div className="px-2.5 py-1 bg-slate-950/90 text-white rounded-lg shadow-xl border border-amber-500/60 backdrop-blur-xs flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[11px] font-bold font-mono text-amber-400">
              {order.rider?.name || 'OGYA Rider'} · {speedKmh} km/h
            </span>
          </div>
        </div>

        {/* Top Floating Telemetry Overlay */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2 flex-wrap">
          <div className="px-3 py-1.5 bg-slate-950/85 backdrop-blur-md rounded-xl border border-slate-800 text-white text-xs shadow-md flex items-center gap-2">
            <Clock size={13} className="text-amber-400" />
            <span className="font-mono font-bold text-amber-400">
              ETA: {progress >= 1.0 ? 'Arrived at Door' : `~${etaMinutes} mins`}
            </span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-slate-300">
              {distanceRemainingKm} km remaining
            </span>
          </div>

          {progress >= 0.85 && progress < 1.0 && (
            <div className="px-2.5 py-1.5 bg-emerald-950/90 border border-emerald-500/80 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 animate-bounce shadow-md">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Rider has entered your neighborhood!</span>
            </div>
          )}
        </div>

        {/* Bottom Floating Handover Notice */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-950/90 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-xs text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
            <span className="text-[11px] text-slate-300">
              <strong>Strict Security Protocol:</strong> Never share OTP <strong>#{order.securityOtp}</strong> over phone call. Only inspect package at door before release.
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {order.rider && (
              <a
                href={`tel:${order.rider.phone}`}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Phone size={12} />
                <span>Call {order.rider.name.split(' ')[0]}</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => setShowSosAlert(true)}
              className="px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700/80 text-red-300 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              title="Report suspicious route diversion or emergency"
            >
              <ShieldAlert size={12} className="text-red-400" />
              <span>Safety SOS</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Telemetry Data Strip */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Cruising Speed</span>
          <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
            {speedKmh} km/h
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">
            {speedKmh > 0 ? 'Smooth Highway Flow' : 'Parked / Doorstep'}
          </span>
        </div>

        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Milestone</span>
          <span className="font-bold text-slate-900 dark:text-white text-xs truncate block">
            {p1.name}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
            {p1.notes}
          </span>
        </div>

        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Rider Vehicle Plate</span>
          <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
            {order.rider?.vehiclePlate || 'GH-M-2024-4158'}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
            {order.rider?.vehicleType || 'Motorcycle'} · Badge #{order.rider?.companyBadge || '042'}
          </span>
        </div>

        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Tamper Seal Check</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1">
            <CheckCircle2 size={13} />
            <span>Barcode Intact</span>
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
            Seal #{order.waybillNumber}
          </span>
        </div>
      </div>

      {/* Doorstep Inspection & OTP Handover Simulator Section */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white border-t border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-amber-400" />
              <h4 className="font-extrabold text-sm text-white">
                Doorstep Delivery Release & Inspection
              </h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-lg">
              When the rider arrives at your door, inspect the package seal and contents. If satisfied, provide the 4-digit code (<strong>#{order.securityOtp}</strong>) to release funds from escrow.
            </p>
          </div>

          {otpVerified ? (
            <div className="px-4 py-2.5 bg-emerald-950/80 border border-emerald-500 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 shadow-md">
              <CheckCircle2 size={18} className="text-emerald-400" />
              <span>Doorstep Handover Verified & Delivered!</span>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <input
                type="text"
                maxLength={4}
                placeholder="4-digit OTP"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                className="w-28 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-center font-mono font-black text-base text-amber-400 tracking-widest focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm"
              >
                Confirm Handover
              </button>
            </form>
          )}
        </div>

        {otpError && (
          <p className="text-xs text-red-400 mt-2 font-medium">
            {otpError}
          </p>
        )}
      </div>

      {/* Emergency Safety SOS Modal */}
      {showSosAlert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-4 border border-red-500/80 shadow-2xl text-slate-900 dark:text-white">
            <div className="flex items-center gap-2.5 text-red-600 dark:text-red-400 font-black">
              <ShieldAlert size={24} />
              <h3 className="text-base font-black">OGYA Safety & Dispatch Rapid Response</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              If the rider is deviating from the authorized Ghana transit corridor, asking for your OTP in advance, or if you suspect identity mismatch, our 24/7 National Dispatch Security unit is on standby.
            </p>
            <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl text-xs space-y-1 font-mono text-red-800 dark:text-red-300">
              <div>Incident Ref: {order.waybillNumber}</div>
              <div>Assigned Rider: {order.rider?.name} ({order.rider?.phone})</div>
              <div>Vehicle Plate: {order.rider?.vehiclePlate}</div>
            </div>
            <div className="flex items-center gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSosAlert(false)}
                className="px-3.5 py-2 bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Dismiss
              </button>
              <a
                href="tel:+233244128890"
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Phone size={14} />
                <span>Call Dispatch Emergency</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
