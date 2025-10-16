import { useEffect, useRef } from 'react';

interface PrefetchOptions {
  enabled?: boolean;
  distance?: number; // Nombre d'éléments à précharger en avant
}

/**
 * Hook pour précharger les prochains contenus (vidéos, images)
 * Utilise les link rel="prefetch" pour optimiser le chargement
 */
export const usePrefetch = (
  urls: string[],
  currentIndex: number,
  options: PrefetchOptions = {}
) => {
  const { enabled = true, distance = 2 } = options;
  const prefetchedUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || urls.length === 0) return;

    // Déterminer les URLs à précharger
    const urlsToPrefetch: string[] = [];
    for (let i = 1; i <= distance; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < urls.length && !prefetchedUrls.current.has(urls[nextIndex])) {
        urlsToPrefetch.push(urls[nextIndex]);
      }
    }

    // Précharger les URLs
    const links: HTMLLinkElement[] = [];
    urlsToPrefetch.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.as = url.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image';
      link.href = url;
      document.head.appendChild(link);
      links.push(link);
      prefetchedUrls.current.add(url);
    });

    // Nettoyer les anciennes précharges
    return () => {
      links.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, [urls, currentIndex, enabled, distance]);

  return { prefetchedUrls: prefetchedUrls.current };
};