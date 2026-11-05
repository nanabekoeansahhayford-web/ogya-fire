import { useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'ogya_theme';

export function getSystemTheme(): ThemeMode {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch (e) {
    // ignore localStorage access errors
  }
  return getSystemTheme();
}

export function applyTheme(theme: ThemeMode): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    // ignore
  }
}

export function useDarkMode() {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const initial = getStoredTheme();
    applyTheme(initial);
    return initial;
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen to system changes if user hasn't explicitly overridden, or storage events
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (!saved) {
        const nextTheme = e.matches ? 'dark' : 'light';
        setThemeState(nextTheme);
        applyTheme(nextTheme);
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && (e.newValue === 'dark' || e.newValue === 'light')) {
        setThemeState(e.newValue);
        applyTheme(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  };

  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme: (t: ThemeMode) => {
      setThemeState(t);
      applyTheme(t);
    },
  };
}
