import React, { lazy, ComponentType } from 'react';

/**
 * Wraps dynamic import() with automatic retries to survive transient Vite dev reloads
 * or brief mobile network drops on 3G/4G.
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  retries = 2,
  delayMs = 350
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await factory();
      } catch (err) {
        lastError = err;
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
        }
      }
    }
    throw lastError;
  });
}

interface ChunkErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ChunkErrorBoundaryState {
  hasError: boolean;
}

export class ChunkErrorBoundary extends React.Component<
  ChunkErrorBoundaryProps,
  ChunkErrorBoundaryState
> {
  constructor(props: ChunkErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ChunkErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn('Module load boundary caught error:', error?.message || error);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="max-w-md mx-auto my-6 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">
            Section failed to load
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            A network hiccup interrupted loading this view.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="px-4 py-2 rounded-xl bg-[#FF6600] hover:bg-orange-600 text-white text-xs font-black cursor-pointer transition-colors"
          >
            Retry Loading
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
