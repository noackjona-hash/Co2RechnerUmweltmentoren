'use client';

import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';

const COOKIE_KEY = 'co2rechner_cookie_consent';

/**
 * GDPR / DSGVO & TDDDG compliant Analytics wrapper.
 * Strictly executes @vercel/analytics ONLY after explicit user consent.
 */
export function AnalyticsConsentWrapper() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // Check initial consent from localStorage
    try {
      const saved = localStorage.getItem(COOKIE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.analytics === true) {
          setHasConsent(true);
        }
      }
    } catch {
      // ignore JSON parse errors
    }

    // Listen for real-time consent updates from the CookieBanner
    const handleConsentChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ analytics?: boolean }>;
      if (customEvent.detail && typeof customEvent.detail.analytics === 'boolean') {
        setHasConsent(customEvent.detail.analytics);
      }
    };

    window.addEventListener('cookie-consent-updated', handleConsentChange);
    return () => window.removeEventListener('cookie-consent-updated', handleConsentChange);
  }, []);

  if (!hasConsent) {
    return null;
  }

  return <Analytics />;
}
