import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  Sparkles,
  Camera,
  Move,
} from 'lucide-react';
import { formatPrice } from '../utils/storage';

interface ListingLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  listingTitle: string;
  categoryName?: string;
  price?: number;
  currency?: string;
  onIndexChange?: (index: number) => void;
}

export const ListingLightboxModal: React.FC<ListingLightboxModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  listingTitle,
  categoryName,
  price,
  currency = 'GH₵',
  onIndexChange,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showControlsHint, setShowControlsHint] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Touch handling
  const touchStartDist = useRef<number | null>(null);
  const initialTouchScale = useRef<number>(1);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const lastTouchPos = useRef<{ x: number; y: number } | null>(null);

  // Sync index when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      resetTransform();
    }
  }, [isOpen, initialIndex]);

  // Notify parent of index change
  const handleIndexChange = useCallback(
    (newIndex: number) => {
      const validIndex = Math.max(0, Math.min(newIndex, images.length - 1));
      setCurrentIndex(validIndex);
      resetTransform();
      onIndexChange?.(validIndex);
    },
    [images.length, onIndexChange]
  );

  const resetTransform = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (images.length <= 1) return;
      handleIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
    },
    [currentIndex, images.length, handleIndexChange]
  );

  const handlePrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (images.length <= 1) return;
      handleIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
    },
    [currentIndex, images.length, handleIndexChange]
  );

  // Zoom helpers
  const zoomIn = () => {
    setScale((prev) => {
      const next = Math.min(Number((prev + 0.5).toFixed(1)), 4);
      return next;
    });
  };

  const zoomOut = () => {
    setScale((prev) => {
      const next = Math.max(Number((prev - 0.5).toFixed(1)), 1);
      if (next === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Fullscreen toggle via Fullscreen API
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (err) {
      console.warn('Fullscreen error:', err);
    }
  };

  // Listen to fullscreen changes (e.g. if user presses Esc to exit browser fullscreen)
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Double click / Double tap to toggle 1x and 2.5x zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale > 1) {
      resetTransform();
    } else {
      setScale(2.5);
      // Center zoom roughly around click
      if (imageContainerRef.current) {
        const rect = imageContainerRef.current.getBoundingClientRect();
        const offsetX = e.clientX - (rect.left + rect.width / 2);
        const offsetY = e.clientY - (rect.top + rect.height / 2);
        setPosition({
          x: -offsetX * 0.8,
          y: -offsetY * 0.8,
        });
      }
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      // Zoom in
      setScale((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 4));
    } else {
      // Zoom out
      setScale((prev) => {
        const next = Math.max(Number((prev - 0.25).toFixed(2)), 1);
        if (next === 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Mouse drag to pan when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    // Allow panning with sensible bounds based on scale
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch gestures: Pinch-to-zoom and Pan or Swipe
  const getTouchDistance = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom start
      touchStartDist.current = getTouchDistance(e.touches);
      initialTouchScale.current = scale;
    } else if (e.touches.length === 1) {
      touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (scale > 1) {
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStartDist.current !== null) {
      // Pinch zooming
      const currentDist = getTouchDistance(e.touches);
      const factor = currentDist / touchStartDist.current;
      const newScale = Math.min(Math.max(initialTouchScale.current * factor, 1), 4);
      setScale(Number(newScale.toFixed(2)));
      if (newScale === 1) setPosition({ x: 0, y: 0 });
    } else if (e.touches.length === 1 && scale > 1 && isDragging) {
      // Panning while zoomed
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      touchStartDist.current = null;
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
      // Check for swipe when not zoomed
      if (scale === 1 && touchStartPos.current) {
        const touchEndPos = lastTouchPos.current || touchStartPos.current;
        const deltaX = touchEndPos.x - touchStartPos.current.x;
        const deltaY = touchEndPos.y - touchStartPos.current.y;
        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX < 0) {
            handleNext();
          } else {
            handlePrev();
          }
        }
      }
      touchStartPos.current = null;
      lastTouchPos.current = null;
    }
  };

  // Track touch position during single touch
  const handleTouchMoveRecord = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      lastTouchPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    handleTouchMove(e);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handlePrev();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleNext();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          zoomOut();
          break;
        case 'r':
        case 'R':
        case '0':
          e.preventDefault();
          resetTransform();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  // Auto-dismiss control hints after 4 seconds
  useEffect(() => {
    if (isOpen) {
      setShowControlsHint(true);
      const timer = setTimeout(() => setShowControlsHint(false), 4500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !images || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];
  const hasMultiple = images.length > 1;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex flex-col justify-between overflow-hidden select-none animate-in fade-in duration-200"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Navigation Bar */}
      <div className="relative z-20 px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-b from-black/85 via-black/50 to-transparent flex items-center justify-between gap-3 text-white">
        {/* Left: Listing Title & Details */}
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm sm:text-base text-white truncate max-w-[260px] sm:max-w-md">
                {listingTitle}
              </span>
              {price !== undefined && price !== null && (
                <span className="text-xs sm:text-sm font-extrabold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded tabular-nums">
                  {formatPrice(price, currency)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              {categoryName && <span>{categoryName}</span>}
              {categoryName && <span>·</span>}
              <span className="flex items-center gap-1 font-semibold text-slate-300 tabular-nums">
                <Camera size={12} className="text-amber-400" />
                <span>
                  Photo {currentIndex + 1} of {images.length}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Zoom & Gallery Control Toolbar */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Zoom Percentage Badge */}
          <div className="hidden md:flex items-center gap-1 text-xs font-mono font-bold bg-white/10 px-2.5 py-1.5 rounded-lg text-slate-200 border border-white/10">
            <span>{Math.round(scale * 100)}%</span>
            {rotation > 0 && <span className="text-amber-400">· {rotation}°</span>}
          </div>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={zoomOut}
            disabled={scale <= 1}
            className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 text-white transition-all cursor-pointer border border-white/10 disabled:cursor-not-allowed"
            title="Zoom Out (-)"
            aria-label="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={zoomIn}
            disabled={scale >= 4}
            className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 text-white transition-all cursor-pointer border border-white/10 disabled:cursor-not-allowed"
            title="Zoom In (+)"
            aria-label="Zoom In"
          >
            <ZoomIn size={18} />
          </button>

          {/* Reset Zoom & Position */}
          {(scale > 1 || rotation !== 0) && (
            <button
              type="button"
              onClick={resetTransform}
              className="p-2 sm:p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-all cursor-pointer border border-amber-400/30 flex items-center gap-1 text-xs font-bold"
              title="Reset Zoom & Orientation (R)"
              aria-label="Reset Zoom"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {/* Rotate Clockwise */}
          <button
            type="button"
            onClick={rotate}
            className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/10"
            title="Rotate 90° Clockwise"
            aria-label="Rotate image"
          >
            <RotateCw size={18} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/10"
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen Mode (F)'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          <div className="h-6 w-px bg-white/20 mx-1 hidden sm:block" />

          {/* Close Lightbox */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white transition-all cursor-pointer shadow-lg border border-red-500/50 flex items-center gap-1"
            title="Close Gallery (Esc)"
            aria-label="Close Lightbox"
          >
            <X size={20} />
            <span className="hidden sm:inline text-xs font-bold">Esc</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        ref={imageContainerRef}
        className="relative flex-1 flex items-center justify-center overflow-hidden px-4 py-2 cursor-default"
        onWheel={handleWheel}
        onDoubleClick={handleDoubleClick}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMoveRecord}
        onTouchEnd={handleTouchEnd}
      >
        {/* Helper Hint Toast for User Experience */}
        {showControlsHint && (
          <div className="absolute top-4 z-30 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-slate-900/90 text-slate-200 border border-slate-700/80 text-xs px-4 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2">
              <Sparkles size={14} className="text-amber-400 shrink-0" />
              <span>Double-click or scroll wheel to zoom · Drag to pan</span>
            </div>
          </div>
        )}

        {/* Pan Indicator when Zoomed */}
        {scale > 1 && (
          <div className="absolute bottom-4 left-4 z-20 pointer-events-none bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5">
            <Move size={13} className="text-amber-400 animate-pulse" />
            <span>Pan mode active ({Math.round(scale * 100)}%)</span>
          </div>
        )}

        {/* The Zoomable / Pannable Image */}
        <div
          className={`relative max-w-full max-h-full flex items-center justify-center transition-transform ${
            isDragging ? 'duration-0' : 'duration-200 ease-out'
          }`}
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${scale}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          }}
        >
          <img
            key={currentImage}
            src={currentImage}
            alt={`${listingTitle} - image ${currentIndex + 1}`}
            className="max-h-[78vh] sm:max-h-[82vh] max-w-[94vw] object-contain rounded-lg shadow-2xl pointer-events-none select-none"
            referrerPolicy="no-referrer"
            draggable={false}
          />
        </div>

        {/* Navigation Arrow: Previous */}
        {hasMultiple && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all backdrop-blur-md shadow-2xl cursor-pointer z-30 hover:scale-110 active:scale-95 border border-white/20 group"
            aria-label="Previous image (Left arrow)"
            title="Previous Photo (←)"
          >
            <ChevronLeft size={28} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Navigation Arrow: Next */}
        {hasMultiple && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all backdrop-blur-md shadow-2xl cursor-pointer z-30 hover:scale-110 active:scale-95 border border-white/20 group"
            aria-label="Next image (Right arrow)"
            title="Next Photo (→)"
          >
            <ChevronRight size={28} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* Bottom Filmstrip & Shortcuts Bar */}
      <div className="relative z-20 px-4 py-3 sm:px-6 bg-gradient-to-t from-black/95 via-black/80 to-transparent flex flex-col gap-2">
        {/* Thumbnails Filmstrip */}
        {hasMultiple && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 max-w-4xl mx-auto scrollbar-thin">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleIndexChange(idx)}
                className={`relative w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                  currentIndex === idx
                    ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105 opacity-100'
                    : 'border-white/20 opacity-50 hover:opacity-90 hover:border-white/40'
                }`}
                title={`Jump to photo ${idx + 1}`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-0.5 right-1 bg-black/80 text-[10px] text-white px-1 rounded font-mono">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Keyboard hints footer */}
        <div className="flex items-center justify-center gap-3 sm:gap-6 text-[11px] text-slate-400 flex-wrap">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px] border border-white/10">
              ← / →
            </kbd>
            <span>Navigate</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px] border border-white/10">
              + / -
            </kbd>
            <span>Zoom</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px] border border-white/10">
              Double Click
            </kbd>
            <span>Toggle 2.5x</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px] border border-white/10">
              R
            </kbd>
            <span>Reset</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-mono text-[10px] border border-white/10">
              Esc
            </kbd>
            <span>Close</span>
          </span>
        </div>
      </div>
    </div>
  );
};
