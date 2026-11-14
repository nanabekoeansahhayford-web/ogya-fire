import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Layers, ArrowRight, Clock, X, Sparkles, Mic, Store } from 'lucide-react';
import { CATEGORIES, REGIONS } from '../data/categories';
import { CategoryId } from '../types/marketplace';
import {
  getRecentSearches,
  addRecentSearch,
  removeRecentSearch,
  clearRecentSearches,
} from '../utils/storage';
import heroAccraFastDeliveryImg from '../assets/images/hero_accra_fast_delivery_1793870145564.jpg';
import heroMarketplaceShowcaseImg from '../assets/images/hero_marketplace_showcase_1792291775965.jpg';

interface HeroBannerProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CategoryId | 'all';
  onCategoryChange: (category: CategoryId | 'all') => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  onQuickTagClick: (tag: string) => void;
  onOpenCourierHub?: () => void;
  onOpenIWantThis?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedRegion,
  onRegionChange,
  onQuickTagClick,
  onOpenCourierHub,
  onOpenIWantThis,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => getRecentSearches());
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [heroBgError, setHeroBgError] = useState(false);
  const [heroCardError, setHeroCardError] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const popularSuggestions = [
    'Range Rover',
    'East Legon Villa',
    'MacBook M3',
    'Bonwire Kente',
    'Accountant CV',
  ];

  // Close recent searches dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleInputFocus = () => {
    setRecentSearches(getRecentSearches());
    setIsFocused(true);
  };

  const handleExecuteSearch = (queryToSearch = searchQuery) => {
    const trimmed = queryToSearch.trim();
    if (trimmed) {
      const updated = addRecentSearch(trimmed);
      setRecentSearches(updated);
    }
    setIsFocused(false);
    setTimeout(() => {
      const el = document.getElementById('browse-listings') || document.querySelector('main');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecuteSearch();
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  const handleSelectTag = (tag: string) => {
    onSearchChange(tag);
    handleExecuteSearch(tag);
  };

  const handleRemoveTag = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeRecentSearch(tag);
    setRecentSearches(updated);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecentSearches([]);
  };

  const handleSuggestionClick = (tag: string) => {
    const updated = addRecentSearch(tag);
    setRecentSearches(updated);
    onQuickTagClick(tag);
    // Smooth scroll down to listings section
    setTimeout(() => {
      const el = document.getElementById('browse-listings') || document.querySelector('main');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  };

  // Web Speech API Voice Search Handler
  const handleVoiceSearch = () => {
    // If already active, toggle off
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      setVoiceFeedback(null);
      return;
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setVoiceError('Voice search is not supported in this browser. Try Chrome, Edge, or Safari.');
      setTimeout(() => setVoiceError(null), 4500);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
        setVoiceFeedback('Listening... Speak your query clearly');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0]?.transcript)
          .join('');

        if (transcript) {
          const cleaned = transcript.trim().replace(/[.,!?;:]+$/, '');
          setVoiceFeedback(`Heard: "${cleaned}"`);
          onSearchChange(cleaned);

          // If final result, execute search and record to recent searches
          if (event.results[0]?.isFinal) {
            handleExecuteSearch(cleaned);
            setTimeout(() => {
              setVoiceFeedback(null);
            }, 2500);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed') {
          setVoiceError('Microphone permission was denied. Please allow microphone access to search by voice.');
        } else if (event.error !== 'no-speech') {
          setVoiceError(`Voice recognition: ${event.error}`);
        }
        setTimeout(() => setVoiceError(null), 4000);
        setIsListening(false);
        setVoiceFeedback(null);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTimeout(() => setVoiceFeedback(null), 2000);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition failed to initialize:', err);
      setVoiceError('Unable to access microphone for voice search.');
      setTimeout(() => setVoiceError(null), 4000);
      setIsListening(false);
      setVoiceFeedback(null);
    }
  };

  return (
    <div className="relative bg-slate-950 text-white overflow-hidden border-b border-slate-800">
      {/* Background imagery with subtle overlay scrim */}
      <div className="absolute inset-0 z-0">
        {!heroBgError && (
          <img
            src={heroAccraFastDeliveryImg}
            alt="Shop Local in Accra - Fast Delivery on OGYA"
            onError={() => setHeroBgError(true)}
            className="w-full h-full object-cover opacity-35 object-center"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-900/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        {/* Tablet 50/50 split & Desktop layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8 lg:gap-12 items-center">
          {/* Left Column (50% on tablet): Headline, Subtitle, Search bar */}
          <div className="w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-3 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>🇬🇭 GHANA VENDOR MARKETPLACE · FAST COURIER</span>
            </div>

            <h1 className="text-[clamp(1.75rem,5.5vw,3rem)] font-black tracking-tight text-white mb-2 sm:mb-3 leading-tight text-balance">
              Shop Local in Accra - Fast Delivery
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm md:text-base mb-5 sm:mb-6 leading-relaxed">
              Direct from verified Ghanaian merchants in Osu, East Legon, Spintex, and Makola. Authentic goods with doorstep courier dispatch and Mobile Money protection.
            </p>

            {/* Unified search bar wrapper - Stacks vertically on phone, 1 row on tablet/desktop */}
            <div ref={searchContainerRef} className="relative">
              {/* Real-time Voice Search Listening / Status Banner */}
              {isListening && (
                <div className="absolute -top-11 left-0 right-0 flex items-center justify-center pointer-events-none z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="bg-red-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2 border border-red-400/40">
                    <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                    <span>{voiceFeedback || 'Listening... Speak now into your microphone'}</span>
                  </div>
                </div>
              )}
              {voiceError && (
                <div className="absolute -top-11 left-0 right-0 flex items-center justify-center pointer-events-none z-30 animate-in fade-in duration-150">
                  <div className="bg-amber-600 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-lg border border-amber-400/40">
                    {voiceError}
                  </div>
                </div>
              )}

              <div
                className={`bg-[#0B1221] p-2 sm:p-2.5 rounded-[16px] shadow-xl flex flex-col md:flex-row items-stretch md:items-center gap-2 text-white border-2 transition-all ${
                  isListening
                    ? 'border-red-500 ring-2 ring-red-500/40 shadow-2xl'
                    : isFocused
                    ? 'border-[#F59E0B] ring-2 ring-[#F59E0B]/30 shadow-2xl'
                    : 'border-[#F59E0B]'
                }`}
              >
                {/* Search query input */}
                <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-[#111A2E] md:bg-transparent rounded-xl min-h-[44px]">
                  <Search className="w-5 h-5 text-slate-400 shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={
                      isListening
                        ? 'Listening... say e.g. "Range Rover", "MacBook M3"'
                        : 'What are you looking for...'
                    }
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent text-sm font-medium text-white placeholder:text-slate-300 focus:outline-none caret-[#F59E0B]"
                  />

                  {/* Clear text button */}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        onSearchChange('');
                        inputRef.current?.focus();
                      }}
                      className="text-slate-400 hover:text-white p-1 cursor-pointer transition-colors"
                      title="Clear search text"
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}

                  {/* Web Speech API Microphone Button */}
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer relative shrink-0 flex items-center justify-center min-h-[36px] min-w-[36px] ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse shadow-md ring-2 ring-red-400/60'
                        : 'text-slate-300 hover:text-[#F59E0B] hover:bg-slate-800/80'
                    }`}
                    title={
                      isListening
                        ? 'Listening... Speak your search query now (Click to stop)'
                        : 'Search listings by voice (Web Speech API)'
                    }
                    aria-label={isListening ? 'Stop voice listening' : 'Start voice search'}
                  >
                    <Mic size={17} className={isListening ? 'animate-bounce' : ''} />
                    {isListening && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping" />
                    )}
                  </button>
                </div>

                {/* Category selection */}
                <div className="flex items-center gap-2 px-3 py-2.5 bg-[#111A2E] md:bg-transparent rounded-xl border-t md:border-t-0 md:border-l border-slate-700/80 min-h-[44px]">
                  <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => onCategoryChange(e.target.value as CategoryId | 'all')}
                    aria-label="Filter by Category"
                    className="w-full md:w-auto bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer md:max-w-[140px] truncate"
                  >
                    <option value="all" className="bg-[#0B1221] text-white">
                      All 17 Categories
                    </option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#0B1221] text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Region selection */}
                <div className="flex items-center gap-2 px-3 py-2.5 bg-[#111A2E] md:bg-transparent rounded-xl border-t md:border-t-0 md:border-l border-slate-700/80 min-h-[44px]">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={selectedRegion === 'all' ? 'All Regions' : selectedRegion}
                    onChange={(e) => {
                      onRegionChange(e.target.value);
                      setTimeout(() => {
                        const el = document.getElementById('browse-listings') || document.querySelector('main');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 60);
                    }}
                    aria-label="Filter by Region"
                    className="w-full md:w-auto bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer md:max-w-[130px] truncate"
                  >
                    <option value="All Regions" className="bg-[#0B1221] text-white">
                      All Regions
                    </option>
                    {selectedRegion &&
                      selectedRegion !== 'All Regions' &&
                      selectedRegion !== 'all' &&
                      !REGIONS.includes(selectedRegion) && (
                        <option value={selectedRegion} className="bg-[#0B1221] text-white">
                          {selectedRegion}
                        </option>
                      )}
                    {REGIONS.map((r) => (
                      <option key={r} value={r} className="bg-[#0B1221] text-white">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit / Filter action — Orange #F59E0B with black bold text */}
                <button
                  type="button"
                  onClick={() => handleExecuteSearch()}
                  className="w-full md:w-auto px-6 py-3.5 bg-[#F59E0B] hover:bg-[#fbbf24] active:bg-[#d97706] text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer shadow-md hover:shadow-lg min-h-[44px] relative z-20 whitespace-nowrap"
                >
                  <span>Search</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
              </div>

              {/* Card directly below search bar: Recent Searches + Popular Suggestions */}
              <div className="mt-3 bg-[#0F172A]/95 backdrop-blur-md text-white rounded-2xl border border-slate-700/80 shadow-xl p-4">
                {recentSearches.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200">
                        <Clock size={14} className="text-[#F59E0B] shrink-0" />
                        <span>Recent Searches</span>
                        <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                          ({recentSearches.length})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-[11px] font-semibold text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Clear recent searches history"
                      >
                        Clear history
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {recentSearches.map((tag) => (
                        <div
                          key={tag}
                          className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-[#F59E0B] border border-slate-700 hover:border-[#F59E0B]/50 transition-all shadow-xs group"
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectTag(tag)}
                            className="flex items-center gap-1.5 text-left truncate max-w-[220px] cursor-pointer"
                            title={`Search for "${tag}"`}
                          >
                            <Clock size={11} className="text-slate-400 group-hover:text-[#F59E0B] shrink-0" />
                            <span className="truncate">{tag}</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleRemoveTag(tag, e)}
                            className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition-colors cursor-pointer"
                            title={`Remove "${tag}" from history`}
                            aria-label={`Remove "${tag}"`}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs mb-1">
                      <Clock size={14} className="text-[#F59E0B] shrink-0" />
                      <span>Recent Searches</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      No recent searches yet... Search for vehicles, electronics, apartments, or jobs to quickly revisit them here.
                    </p>
                  </div>
                )}

                <div className="pt-2.5 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles size={11} className="text-[#F59E0B]" />
                    <span>POPULAR SUGGESTIONS</span>
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {popularSuggestions.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleSuggestionClick(tag)}
                        className="text-xs font-semibold bg-slate-800/90 hover:bg-[#F59E0B] hover:text-slate-950 text-slate-200 px-3 py-1.5 rounded-full border border-slate-700 hover:border-[#F59E0B] transition-colors cursor-pointer active:scale-95 whitespace-nowrap"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (50% on tablet/desktop): Hero Visual Card */}
          <div className="hidden md:flex flex-col items-center justify-center relative">
            <div className="w-full relative rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl bg-gradient-to-br from-slate-900 to-slate-950 group">
              {!heroCardError ? (
                <img
                  src={heroMarketplaceShowcaseImg}
                  alt="OGYA FIRE Marketplace Ghana"
                  onError={() => setHeroCardError(true)}
                  referrerPolicy="no-referrer"
                  className="w-full h-64 lg:h-80 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-64 lg:h-80 bg-gradient-to-br from-slate-900 via-[#111A2E] to-slate-950 flex flex-col items-center justify-center p-6 text-center">
                  <Store className="w-12 h-12 text-[#F59E0B] mb-2" />
                  <p className="text-sm font-black text-white">OGYA FIRE Ghana Marketplace</p>
                  <p className="text-xs text-slate-400 mt-1">Verified Vendors Across All 16 Regions</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold text-white">Live in Accra, Kumasi &amp; Tema</span>
                </div>
                <div className="flex items-center gap-1.5 bg-orange-600/95 text-white px-2.5 py-1.5 rounded-lg font-black text-[11px] shadow-md">
                  <span>⚡ 100% MoMo Secured</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Big Orange "I WANT THIS - Post What You Want" Action Card */}
      {onOpenIWantThis && (
        <div className="mt-5 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-600/90 via-amber-600/90 to-orange-500/90 border border-orange-400/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-xl bg-white/20 shrink-0">
              🔥
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-white/30 px-2 py-0.5 rounded text-white">
                  BUYERS DIRECT
                </span>
                <span className="text-xs font-bold text-orange-100">Can't find what you need?</span>
              </div>
              <p className="text-xs text-white font-medium mt-0.5">
                Tell Ghana sellers your budget and location. Verified merchants will message you with offers!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenIWantThis}
            className="shrink-0 w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-orange-50 text-orange-600 hover:text-orange-700 font-black text-xs uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px]"
          >
            <span>I WANT THIS - Post What You Want</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* End-to-End Door-to-Door Courier Access Strip */}
      {onOpenCourierHub && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-black text-[10px] uppercase tracking-wide border border-amber-500/30">
              NEW
            </span>
            <span>
              <strong>Door-to-Door Courier Across Ghana:</strong> Ship or receive parcels in all 16 regions with strict security OTP & escrow.
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenCourierHub}
            className="text-amber-400 hover:text-amber-300 font-bold hover:underline transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1 min-h-[36px]"
          >
            <span>Book Courier or Track Parcel →</span>
          </button>
        </div>
      )}
      </div>
    </div>
  );
};
