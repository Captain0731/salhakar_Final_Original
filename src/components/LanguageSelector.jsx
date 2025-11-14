import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LanguageSelector Component
 * 
 * Compact language selector for Google Translate integration.
 * Features:
 * - Tailwind-styled dropdown
 * - Keyboard accessible (tab, enter, escape)
 * - Screen reader friendly
 * - Responsive design
 * - Cookie persistence
 * - Auto-scrolling language carousel animation
 */

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [rowHeight, setRowHeight] = useState(14); // Smaller initial height for mobile
  const dropdownRef = useRef(null);
  const intervalRef = useRef(null);
  const measureRef = useRef(null);

  const languages = [
    { code: 'en', langCode: 'En', name: 'English', country: 'US', flag: '🇺🇸', display: 'English' },
    { code: 'gu', langCode: 'Gu', name: 'ગુજરાતી', country: 'IN', flag: '🇮🇳', display: 'IN' },
    { code: 'hi', langCode: 'Hi', name: 'हिन्दी  ', flag: '🇮🇳', country: 'IN', display: 'IN' },
    { code: 'as', langCode: 'As', name: 'অসমীয়া', flag: '🇮🇳', country: 'IN', display: 'IN' },
    { code: 'bn', langCode: 'Be', name: 'বাংলা', flag: '🇧🇩', country: 'BD', display: 'BD' },  
    { code: 'kn', langCode: 'Ka', name: 'ಕನ್ನಡ', flag: '🇮🇳', country: 'IN', display: 'IN' },
    { code: 'ml', langCode: 'Ma', name: 'മലയാളം', country: 'IN', flag: '🇮🇳', display: 'IN' },
    { code: 'mr', langCode: 'Mr', name: 'मराठी', flag: '🇮🇳', country: 'IN', display: 'IN' },
    { code: 'or', langCode: 'Odi', name: 'ଓଡ଼ିଆ', flag: '🇮🇳', country: 'IN', display: 'IN' },
    { code: 'pa', langCode: 'Pu', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳', country: 'IN', display: 'IN' },
    { code: 'ta', langCode: 'Ta', name: 'தமிழ்', flag: '🇮🇳', country: 'IN', display: 'IN' },
      { code: 'te', langCode: 'Te', name: 'తెలుగు', flag: '🇮🇳', country: 'IN', display: 'IN' },
  ];

  // Get current language from cookie
  const getCurrentLanguage = () => {
    if (typeof window === 'undefined') return 'en';
    
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('googtrans='));
    
    if (cookie) {
      const value = cookie.split('=')[1];
      // Extract language code from /en/xx format
      if (value && value.startsWith('/en/')) {
        return value.replace('/en/', '').toLowerCase();
      }
    }
    return 'en';
  };

  // Set language and reload page
  const handleLanguageSelect = (langCode) => {
    if (typeof window === 'undefined') return;

    // Allow all languages to be translated without authentication
    if (langCode === 'en') {
      // Clear translation for English
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } else {
      // Set translation cookie for selected language
      document.cookie = `googtrans=/en/${langCode}; path=/; max-age=31536000; SameSite=Lax`;
    }
    // Reload page to apply translation
    window.location.reload();
  };

  // Update current language on mount
  useEffect(() => {
    setCurrentLang(getCurrentLanguage());
    // Set initial scroll index to current language
    const initialLang = getCurrentLanguage();
    const initialIndex = languages.findIndex(lang => lang.code === initialLang.toLowerCase());
    setCurrentScrollIndex(initialIndex >= 0 ? initialIndex : 0);
  }, []);

  // Measure row height for smooth scrolling
  useEffect(() => {
    const updateRowHeight = () => {
      if (measureRef.current) {
        setRowHeight(measureRef.current.offsetHeight || 24);
      }
    };
    updateRowHeight();
    window.addEventListener('resize', updateRowHeight);
    return () => window.removeEventListener('resize', updateRowHeight);
  }, []);

  // Auto-scroll through languages
  useEffect(() => {
    const prefersReduced = typeof window !== 'undefined' &&
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) return; // respect user preference

    if (!isHovered && !isOpen) {
      // Slightly longer interval than transition for calm feel
      intervalRef.current = setInterval(() => {
        setCurrentScrollIndex((prev) => {
          // move forward; when we hit the cloned last item, advance and then we'll reset
          return prev + 1;
        });
      }, 2600);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isHovered, isOpen]);

  // Extended languages for seamless loop (clone first item)
  const extendedLanguages = [...languages, languages[0]];

  // Seamless reset when reaching the cloned item
  useEffect(() => {
    const lastIndex = extendedLanguages.length - 1;
    if (currentScrollIndex === lastIndex) {
      // After the transition completes, jump back to 0 without transition
      const TRANSITION_MS = 650;
      const timeout = setTimeout(() => {
        setIsResetting(true);
        setCurrentScrollIndex(0);
        // re-enable transition on the next frame
        requestAnimationFrame(() => requestAnimationFrame(() => setIsResetting(false)));
      }, TRANSITION_MS + 20);
      return () => clearTimeout(timeout);
    }
    // Also keep index bounded to avoid unbounded growth
    if (currentScrollIndex > lastIndex) {
      setCurrentScrollIndex(0);
    }
  }, [currentScrollIndex, extendedLanguages.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang.toLowerCase()) || languages[0];
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <>
      <style>{`
        .gradient-border-wrapper {
          position: relative;
          border-radius: 8px;
          padding: 2px;
          display: inline-block;
          width: 100%;
        }
        
        @media (min-width: 640px) {
          .gradient-border-wrapper {
            border-radius: 12px;
            padding: 3px;
          }
        }
        
        .gradient-border-wrapper::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 10px;
          background: conic-gradient(
            from 0deg,
            #ff6b9d,
            #ff8c42,
            #ffd93d,
            #6bcf7f,
            #4dabf7,
            #9775fa,
            #ff6b9d
          );
          z-index: -2;
        }
        
        @media (min-width: 640px) {
          .gradient-border-wrapper::before {
            inset: -3px;
            border-radius: 15px;
          }
        }
        
        .gradient-border-wrapper::after {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 8px;
          background: white;
          z-index: -1;
        }
        
        @media (min-width: 640px) {
          .gradient-border-wrapper::after {
            border-radius: 12px;
          }
        }
        
        .gradient-border-inner {
          background: transparent;
          border-radius: 6px;
          width: 100%;
          height: 100%;
          position: relative;
          z-index: 1;
        }
        
        @media (min-width: 640px) {
          .gradient-border-inner {
            border-radius: 9px;
          }
        }
        
        .language-carousel {
          position: relative;
        }
      `}</style>
      <div className="relative notranslate" ref={dropdownRef}>
        <div className="gradient-border-wrapper">
          <div className="gradient-border-inner">
            <button
              onClick={() => setIsOpen(!isOpen)}
              onKeyDown={handleKeyDown}
              onMouseEnter={() => {
                setShowTooltip(true);
                setIsHovered(true);
              }}
              onMouseLeave={() => {
                setShowTooltip(false);
                setIsHovered(false);
              }}
              className="flex items-center justify-between gap-1 sm:gap-2 px-1 sm:px-1.5 md:px-3 py-0.5 sm:py-1 md:py-2 rounded-md sm:rounded-lg transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full relative z-10 group min-h-[28px] sm:min-h-[32px] md:min-h-[38px] notranslate"
              style={{ 
                color: '#1E65AD',
                fontFamily: 'Roboto, sans-serif',
                background: 'white',
                cursor: 'pointer',
              }}
              aria-label={`Current language: ${currentLanguage.name}. Click to change language.`}
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              title="Select your language"
            >
              <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2">
                {/* Globe Icon */}
                <svg 
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 flex-shrink-0 transition-colors duration-500"
                  style={{ color: '#1E65AD' }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                
                {/* Auto-scrolling language display */}
                <div className="h-3.5 sm:h-4 md:h-5 lg:h-6 w-auto min-w-[40px] sm:min-w-[45px] md:min-w-[60px] overflow-hidden relative language-carousel select-none">
                  {/* ticker content */}
                  <div
                    className="will-change-transform"
                    style={{
                      transform: `translateY(-${currentScrollIndex * rowHeight}px)`,
                      transition: isResetting ? 'none' : 'transform 650ms cubic-bezier(0.22, 1, 0.36, 1)'
                    }}
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {extendedLanguages.map((language, index) => (
                      <div
                        key={`${language.code}-${index}`}
                        ref={index === 0 ? measureRef : null}
                        className="h-3.5 sm:h-4 md:h-5 lg:h-6 flex items-center gap-0.5 sm:gap-1 md:gap-1.5"
                      >
                        <span className="text-[9px] sm:text-[10px] md:text-xs font-bold notranslate" style={{ color: '#1E65AD', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}>
                          {language.langCode}
                        </span>
                        <span className="text-[9px] sm:text-[10px] md:text-xs font-medium hidden sm:inline notranslate" style={{ color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                          {language.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Chevron Icon */}
              <svg 
                className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3.5 md:h-3.5 transition-all duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''} ${isHovered ? 'translate-y-0.5' : ''}`}
                style={{ color: '#1E65AD' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Tooltip */}
            {showTooltip && !isOpen && (
              <div
                className="absolute top-full left-2/2 transform -translate-x-1/2 mb-2 px-5 py-1.5 rounded-lg shadow-lg z-50 pointer-events-none whitespace-nowrap transition-opacity duration-200"
                style={{
                  backgroundColor: '#1E65AD',
                  color: '#FFFFFF',
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '12px',
                  fontWeight: 500,
                  boxShadow: '0 4px 12px rgba(30, 101, 173, 0.3)',
                }}
              >
                Select your Preferred language
                {/* Tooltip Arrow */}
                <div
                  className="absolute -full left-5/6 transform -translate-x-2/2 -mt-1"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '6px solidrgb(255, 255, 255)',
                  }}
                />
              </div>
            )}
          </div>
        </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ 
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="fixed md:absolute right-2 sm:right-4 md:right-0 top-[60px] sm:top-[65px] md:top-full md:mt-2 w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] md:w-64 max-w-[300px] sm:max-w-[320px] md:max-w-none bg-white rounded-xl shadow-2xl overflow-hidden z-50 flex notranslate"
              style={{ 
                backgroundColor: '#FFFFFF',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                maxHeight: 'calc(100vh - 80px)',
              }}
              role="listbox"
              aria-label="Language selection"
            >
          {/* Gradient Left Border */}
          <div 
            className="w-1 flex-shrink-0"
            style={{
              background: 'linear-gradient(180deg, #ff6b9d 0%, #ff8c42 20%, #ffd93d 40%, #6bcf7f 60%, #4dabf7 80%, #9775fa 100%)',
            }}
          />
          
          {/* Language List */}
          <div className="flex-1 py-2 sm:py-2 md:py-2 overflow-y-auto max-h-[calc(100vh-120px)] md:max-h-[400px]">
            {languages.map((language, index) => {
              const isSelected = currentLang.toLowerCase() === language.code.toLowerCase();
              return (
                <button
                  key={`${language.code}-${language.country}-${index}`}
                  onClick={() => {
                    handleLanguageSelect(language.code);
                    setIsOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleLanguageSelect(language.code);
                      setIsOpen(false);
                    }
                  }}
                  className={`w-full text-left px-4 sm:px-4 md:px-4 py-3 sm:py-2.5 md:py-3 transition-all duration-150 flex items-center justify-between gap-2 sm:gap-3 focus:outline-none active:bg-gray-100 ${
                    isSelected 
                      ? 'bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  style={{ 
                    fontFamily: 'Roboto, sans-serif',
                    backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
                  }}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="flex items-center gap-3 sm:gap-3 flex-1 min-w-0">
                    <span className="text-sm sm:text-sm md:text-sm font-bold notranslate flex-shrink-0" style={{ color: '#1E65AD', fontFamily: 'Helvetica Hebrew Bold, sans-serif', minWidth: '32px' }}>
                      {language.langCode}
                    </span>
                    <span 
                      className="text-sm sm:text-sm md:text-sm font-medium notranslate break-words"
                      style={{ 
                        color: '#1E65AD',
                        fontFamily: 'Roboto, sans-serif',
                      }}
                    >
                      {language.name}
                    </span>
                  </div>
                  {isSelected && (
                    <div 
                      className="w-2 h-2 sm:w-2 sm:h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: '#ff6b9d' }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    </>
  );
};

export default LanguageSelector;
