import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  src?: string;
  alt: string;
  eager?: boolean;
  priority?: boolean;
  wrapperClassName?: string;
  placeholderClassName?: string;
  fallback?: React.ReactNode;
}

/**
 * High-performance responsive image component:
 * - Defers network fetch via IntersectionObserver until scrolled near viewport (unless eager=true)
 * - Shows a smooth grey shimmer + blur-up transition while loading
 * - Uses native loading="lazy" & decoding="async" for below-the-fold images
 * - Sets fetchPriority="high" ONLY when priority=true (primary above-the-fold hero image)
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  eager = false,
  priority = false,
  className = '',
  wrapperClassName = '',
  placeholderClassName = '',
  fallback = null,
  onError,
  onLoad,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState<boolean>(eager || priority);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // Reset states when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  // Only fetch image when user scrolls near it (unless eager/priority)
  useEffect(() => {
    if (eager || priority || shouldLoad) return;

    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
            break;
          }
        }
      },
      {
        rootMargin: '250px 0px',
        threshold: 0.01,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [eager, priority, shouldLoad]);

  if (!src || hasError) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-slate-200 dark:bg-slate-800 ${wrapperClassName}`}
    >
      {/* Blur / Shimmer Grey Placeholder */}
      {!isLoaded && (
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-gradient-to-br from-slate-200 via-slate-300/80 to-slate-200 dark:from-slate-800 dark:via-slate-700/70 dark:to-slate-800 animate-pulse backdrop-blur-md ${placeholderClassName}`}
        />
      )}

      {shouldLoad && (
        <img
          src={src}
          alt={alt}
          loading={eager || priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : undefined}
          onLoad={(e) => {
            setIsLoaded(true);
            onLoad?.(e);
          }}
          onError={(e) => {
            setHasError(true);
            onError?.(e);
          }}
          className={`${className} transition-all duration-300 ease-out ${
            isLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-sm scale-[1.03]'
          }`}
          {...rest}
        />
      )}
    </div>
  );
};
