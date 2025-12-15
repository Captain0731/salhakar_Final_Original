import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../services/api";

const sentences = [
  "  Legal Judgments",
  "  law Mapping",
  "  Law Library",
  "  Smart Dashboard",
  " Legal Templates",
  " Youtube Summary",
  " Kiki AI"
];

const TYPING_SPEED = 80; // milliseconds per character
const PAUSE_DELAY = 1500; // delay before next sentence

const SearchBar = () => {
  const navigate = useNavigate();
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [searchInput, setSearchInput] = useState("");
  
  // Autocomplete states
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsDetailed, setSuggestionsDetailed] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  // Refs for debouncing and aborting requests
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Typing animation effect
  useEffect(() => {
    let charIndex = 0;
    let typingTimeout;

    const typeSentence = () => {
      const sentence = sentences[currentSentenceIndex];
      if (charIndex < sentence.length) {
        setDisplayedText(prev => prev + sentence.charAt(charIndex));
        charIndex++;
        typingTimeout = setTimeout(typeSentence, TYPING_SPEED);
      } else {
        // Wait before deleting and moving to next sentence
        typingTimeout = setTimeout(() => {
          setDisplayedText("");
          setCurrentSentenceIndex((currentSentenceIndex + 1) % sentences.length);
        }, PAUSE_DELAY);
      }
    };

    typeSentence();

    return () => clearTimeout(typingTimeout);
  }, [currentSentenceIndex]);

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(async (query) => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Don't fetch if query is too short (minimum 2 characters)
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setSuggestionsDetailed([]);
      setShowSuggestions(false);
      return;
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    setIsLoadingSuggestions(true);

    console.log('🔍 Fetching autocomplete for:', query);

    try {
      const result = await apiService.getJudgementsAutocomplete(query.trim(), 10);
      
      console.log('📦 Autocomplete result:', result);
      
      // Only update if this is still the current request
      if (result && result.suggestions && result.suggestions.length > 0) {
        console.log('✅ Setting suggestions:', result.suggestions);
        setSuggestions(result.suggestions);
        setSuggestionsDetailed(result.suggestions_detailed || []);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } else {
        // Empty results - hide dropdown
        console.log('⚠️ Empty suggestions, hiding dropdown');
        setSuggestions([]);
        setSuggestionsDetailed([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      // On error - hide dropdown
      if (error.name !== 'AbortError') {
        console.error('❌ Autocomplete fetch failed:', error);
      }
      setSuggestions([]);
      setSuggestionsDetailed([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Handle input change with debounce (300ms)
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If input is cleared or too short, hide dropdown immediately
    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      setSuggestionsDetailed([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce API call (~300ms as specified)
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Trigger the real search - navigates to judgment-access with search query
  const triggerRealSearch = (searchText) => {
    if (searchText && searchText.trim()) {
      navigate(`/judgment-access?search=${encodeURIComponent(searchText.trim())}`);
    }
  };

  // Handle suggestion click
  // 1. Prevent default navigation
  // 2. Set input value to suggestion text
  // 3. Close dropdown
  // 4. Trigger real search
  const handleSuggestionClick = (e, suggestion) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Set input value
    setSearchInput(suggestion);
    
    // Close dropdown
    setShowSuggestions(false);
    setSuggestions([]);
    setSuggestionsDetailed([]);
    setSelectedIndex(-1);
    
    // Trigger real search
    triggerRealSearch(suggestion);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    // If dropdown is NOT visible, normal Enter behavior
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerRealSearch(searchInput);
      }
      return;
    }

    // Dropdown IS visible - handle navigation
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
        
      case 'Enter':
        // IMPORTANT: Do not navigate on Enter while dropdown is visible
        // unless a suggestion is selected
        e.preventDefault();
        
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          // Suggestion is selected - set input, close dropdown, trigger search
          const selectedSuggestion = suggestions[selectedIndex];
          setSearchInput(selectedSuggestion);
          setShowSuggestions(false);
          setSuggestions([]);
          setSuggestionsDetailed([]);
          setSelectedIndex(-1);
          triggerRealSearch(selectedSuggestion);
        } else {
          // No suggestion selected - just close dropdown, don't search
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
        
      default:
        break;
    }
  };

  // Handle form submit (button click)
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Close dropdown first
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    
    // Trigger search
    triggerRealSearch(searchInput);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="w-full px-1 sm:px-2 md:px-4 lg:px-8 flex justify-center">
      <div className="relative w-full max-w-5xl">
        <form onSubmit={handleSearch} className="flex bg-white rounded-full p-1 sm:p-1.5 md:p-2 shadow-lg items-center gap-1 sm:gap-2 w-full">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={searchInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                // Show dropdown on focus if we have suggestions
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              placeholder={displayedText || "Search..."}
              className="w-full rounded-full outline-none px-2.5 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-2.5 md:py-3 text-gray-700 text-xs sm:text-sm md:text-base lg:text-lg placeholder:text-xs sm:placeholder:text-sm md:placeholder:text-base"
              autoComplete="off"
            />
            
            {/* Loading indicator */}
            {isLoadingSuggestions && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          
          <button 
            type="submit"
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 bg-gray-950 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform flex-shrink-0 touch-manipulation"
            style={{ minWidth: '32px', minHeight: '32px' }}
          >
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>
        </form>

        {/* Autocomplete Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-blue-400 overflow-hidden max-h-80 overflow-y-auto"
            style={{ zIndex: 9999 }}
          >
            {suggestions.map((suggestion, index) => {
              const detailed = suggestionsDetailed[index];
              return (
                <div
                  key={index}
                  onClick={(e) => handleSuggestionClick(e, suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-4 py-3 cursor-pointer transition-colors flex items-start gap-3 ${
                    index === selectedIndex 
                      ? 'bg-blue-50' 
                      : 'hover:bg-gray-50'
                  } ${index !== suggestions.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  {/* Search Icon */}
                  <svg 
                    className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 font-medium truncate">
                      {suggestion}
                    </p>
                    {detailed?.court_name && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        {detailed.court_name}
                      </p>
                    )}
                  </div>
                  
                  {/* Arrow Icon for navigation hint */}
                  <svg 
                    className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
