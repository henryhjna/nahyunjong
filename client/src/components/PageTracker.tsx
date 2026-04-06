'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Extract locale from path
    const locale = pathname.startsWith('/en') ? 'en' : 'ko';

    // Don't track admin or API paths
    if (pathname.startsWith('/admin') || pathname.startsWith('/api')) return;

    const sendPageview = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analytics/pageview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: pathname,
            locale,
            referrer: document.referrer || null,
          }),
        });
      } catch {
        // Silently fail — analytics should never break the site
      }
    };

    sendPageview();
  }, [pathname]);

  return null;
}
