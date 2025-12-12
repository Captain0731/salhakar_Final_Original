import React, { useEffect, useState } from 'react';

/**
 * GoogleTranslate Component
 * 
 * Client-only Google Website Translator integration with cookie persistence.
 * Supports both regular page translation and PDF translation.
 * 
 * Features:
 * - Dynamically loads Google Translate script
 * - Manages googtrans cookie for persistence
 * - Handles script loading errors gracefully
 * - SSR-safe implementation
 * - PDF translation support via URL parameter
 * 
 * Cookie Format: /en/{lang} (e.g., /en/hi for Hindi, /en/gu for Gujarati)
 * - /en/hi: Translate from English to Hindi
 * - /en/gu: Translate from English to Gujarati
 * - Empty/cleared: Original English content
 * 
 * PDF Translation:
 * - Accepts pdfUrl prop for PDF translation
 * - Creates Google Translate URL for PDF documents
 * - Maintains translation state for PDF viewing
 */

const GoogleTranslate = ({ pdfUrl = null }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  // Available languages
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' }
  ];

  // Get current language from cookie - supports all languages with improved detection
  const getCurrentLanguage = () => {
    if (typeof window === 'undefined') return 'en';
    
    // Try to get from googtrans cookie first
    const cookie = document.cookie
      .split('; ')
      .find(row => row.trim().startsWith('googtrans='));
    
    if (cookie) {
      try {
        const value = decodeURIComponent(cookie.split('=').slice(1).join('='));
        if (value && value.startsWith('/en/')) {
          const lang = value.replace('/en/', '').toLowerCase().split(';')[0].trim();
          if (lang) return lang;
        }
      } catch (e) {
        console.warn('Error parsing googtrans cookie:', e);
      }
    }
    
    // Fallback to localStorage
    try {
      const storedLang = localStorage.getItem('selectedLanguage');
      if (storedLang && storedLang !== 'en') {
        return storedLang.toLowerCase();
      }
    } catch (e) {
      console.warn('localStorage not available:', e);
    }
    
    return 'en';
  };

  // Helper function to set cookie with proper attributes
  const setCookie = (name, value, days = 365) => {
    if (typeof window === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    const hostname = window.location.hostname;
    const domain = hostname.includes('localhost') || hostname.includes('127.0.0.1') 
      ? '' 
      : hostname.split('.').slice(-2).join('.');
    
    let cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    
    if (window.location.protocol === 'https:') {
      cookieString += '; Secure';
    }
    
    if (domain && !hostname.includes('localhost')) {
      cookieString += `; domain=.${domain}`;
    }
    
    document.cookie = cookieString;
    
    try {
      localStorage.setItem('selectedLanguage', value.replace('/en/', '') || 'en');
    } catch (e) {
      console.warn('localStorage not available:', e);
    }
  };

  // Helper function to clear cookie
  const clearCookie = (name) => {
    if (typeof window === 'undefined') return;
    
    const hostname = window.location.hostname;
    const domain = hostname.includes('localhost') || hostname.includes('127.0.0.1') 
      ? '' 
      : hostname.split('.').slice(-2).join('.');
    
    const clearOptions = [
      `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`,
      `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`,
    ];
    
    if (domain && !hostname.includes('localhost')) {
      clearOptions.push(`${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`);
    }
    
    if (window.location.protocol === 'https:') {
      clearOptions.forEach(opt => {
        document.cookie = opt + ' Secure;';
      });
    } else {
      clearOptions.forEach(opt => {
        document.cookie = opt;
      });
    }
    
    try {
      localStorage.removeItem('selectedLanguage');
    } catch (e) {
      console.warn('localStorage not available:', e);
    }
  };

  // Set googtrans cookie and reload page
  const setLanguage = (langCode) => {
    if (typeof window === 'undefined') return;

    if (langCode === 'en') {
      // Clear translation - remove cookie
      clearCookie('googtrans');
    } else {
      // Set translation cookie
      const cookieValue = `/en/${langCode}`;
      setCookie('googtrans', cookieValue, 365);
    }

    // Small delay to ensure cookie is set before reload
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  // Create Google Translate URL for PDF translation with smart routing
  // Smart Translation Logic:
  // - If source is English → translate directly to target
  // - If source is not English and target is not English → translate to English first, then to target
  const createTranslatedPdfUrl = (originalPdfUrl, langCode, sourceLang = 'en') => {
    if (!originalPdfUrl || langCode === 'en') {
      return originalPdfUrl;
    }

    // Smart translation routing
    const needsTwoStepTranslation = sourceLang !== 'en' && langCode !== 'en';
    
    if (needsTwoStepTranslation) {
      // Two-step translation: source → English → target
      // Step 1: Create intermediate URL (source → English)
      const intermediateUrl = `https://translate.google.com/translate?sl=${sourceLang}&tl=en&u=${encodeURIComponent(originalPdfUrl)}`;
      
      // Step 2: Create final URL (English → target) using the intermediate URL
      const finalUrl = `https://translate.google.com/translate?sl=en&tl=${langCode}&u=${encodeURIComponent(intermediateUrl)}`;
      
      console.log(`🌐 Two-step PDF translation: ${sourceLang} → English → ${langCode}`);
      return finalUrl;
    } else {
      // Direct translation: English → target (or source → target if source is not English)
      const fromLang = sourceLang === 'en' ? 'en' : sourceLang;
      const translateUrl = `https://translate.google.com/translate?sl=${fromLang}&tl=${langCode}&u=${encodeURIComponent(originalPdfUrl)}`;
      console.log(`🌐 Direct PDF translation: ${fromLang} → ${langCode}`);
      return translateUrl;
    }
  };

  // Get translated PDF URL based on current language
  const getTranslatedPdfUrl = () => {
    if (!pdfUrl) return null;
    return createTranslatedPdfUrl(pdfUrl, currentLang);
  };

  // Load Google Translate script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if script already loaded
    if (window.google && window.google.translate) {
      setIsLoaded(true);
      setCurrentLang(getCurrentLanguage());
      return;
    }

    // Check if script element already exists
    if (document.getElementById('google-translate-script')) {
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.type = 'text/javascript';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;

    // Handle script load
    script.onload = () => {
      setIsLoaded(true);
      setCurrentLang(getCurrentLanguage());
    };

    // Handle script error
    script.onerror = () => {
      setHasError(true);
    };

    // Add script to head
    document.head.appendChild(script);

    // Global callback for Google Translate
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: 'en,hi,bn,ta,te,ml,kn,gu,mr,pa,or,as',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
          multilanguagePage: true
        }, 'google_translate_element');
        
        // Hide the Google Translate banner immediately after initialization
        const hideGoogleElements = () => {
          // Hide banner frame
          const banner = document.querySelector('.goog-te-banner-frame');
          if (banner) {
            banner.style.display = 'none';
            banner.style.visibility = 'hidden';
            banner.style.opacity = '0';
            banner.style.height = '0';
            banner.style.width = '0';
            banner.style.position = 'absolute';
            banner.style.left = '-9999px';
            banner.style.top = '-9999px';
            banner.style.zIndex = '-9999';
          }
          
          // Hide all Google Translate elements
          const selectors = [
            '.goog-te-banner-frame',
            '.goog-te-ftab',
            '.goog-te-gadget',
            '.goog-te-combo',
            '.goog-te-logo',
            '.skiptranslate',
            '[class*="goog-te"]',
            'iframe[src*="translate.google.com"]'
          ];
          
          selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
              if (el) {
                el.style.display = 'none';
                el.style.visibility = 'hidden';
                el.style.opacity = '0';
                el.style.height = '0';
                el.style.width = '0';
                el.style.position = 'absolute';
                el.style.left = '-9999px';
                el.style.top = '-9999px';
                el.style.zIndex = '-9999';
              }
            });
          });
        };
        
        // Hide immediately
        hideGoogleElements();
        
        // Hide after short delay
        setTimeout(hideGoogleElements, 50);
        setTimeout(hideGoogleElements, 100);
        setTimeout(hideGoogleElements, 500);
        setTimeout(hideGoogleElements, 1000);
        
        // Use MutationObserver to hide any Google Translate elements that appear later
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) { // Element node
                // Hide Google Translate banner
                if (node.classList && (node.classList.contains('goog-te-banner-frame') || node.classList.contains('skiptranslate'))) {
                  node.style.display = 'none';
                  node.style.visibility = 'hidden';
                  node.style.opacity = '0';
                  node.style.height = '0';
                  node.style.width = '0';
                  node.style.position = 'absolute';
                  node.style.left = '-9999px';
                  node.style.top = '-9999px';
                  node.style.zIndex = '-9999';
                }
                
                // Hide any Google Translate elements within the added node
                const selectors = [
                  '.goog-te-banner-frame',
                  '.goog-te-ftab',
                  '.goog-te-gadget',
                  '.goog-te-combo',
                  '.goog-te-logo',
                  '.skiptranslate',
                  '[class*="goog-te"]',
                  'iframe[src*="translate.google.com"]'
                ];
                
                selectors.forEach(selector => {
                  const googleElements = node.querySelectorAll ? node.querySelectorAll(selector) : [];
                  googleElements.forEach(el => {
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                    el.style.opacity = '0';
                    el.style.height = '0';
                    el.style.width = '0';
                    el.style.position = 'absolute';
                    el.style.left = '-9999px';
                    el.style.top = '-9999px';
                    el.style.zIndex = '-9999';
                  });
                });
              }
            });
          });
        });
        
        // Start observing
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }
    };

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Update current language when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentLang(getCurrentLanguage());
    }
  }, []);

  // Expose functions globally for use in other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.GoogleTranslate = {
        setLanguage,
        getCurrentLanguage,
        isLoaded: () => isLoaded,
        hasError: () => hasError,
        createTranslatedPdfUrl,
        getTranslatedPdfUrl: getTranslatedPdfUrl,
        getCurrentLang: () => currentLang
      };
    }
  }, [isLoaded, hasError, currentLang, pdfUrl]);

  return (
    <>
      {/* Hidden container required by Google Translate widget */}
      <div id="google_translate_element" style={{ display: 'none' }} />
      
      {/* Error fallback - only show if script failed to load */}
      {hasError && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-sm z-50">
          Translation unavailable
        </div>
      )}
    </>
  );
};

export default GoogleTranslate;
