import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/landing/Navbar";
import apiService from "../services/api";
import useSmoothInfiniteScroll from "../hooks/useSmoothInfiniteScroll";
import { 
  EnhancedJudgmentSkeleton, 
  EnhancedInfiniteScrollLoader, 
  SkeletonGrid,
  SmoothTransitionWrapper 
} from "../components/EnhancedLoadingComponents";
import { useAuth } from "../contexts/AuthContext";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { Mic } from "lucide-react";

// Add custom CSS animations
const customStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  
  @keyframes fadeInUp {
    from { 
      opacity: 0; 
      transform: translateY(30px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes slideInFromBottom {
    from { 
      opacity: 0; 
      transform: translateY(50px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }
  
  .animate-slide-in-bottom {
    animation: slideInFromBottom 0.8s ease-out forwards;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = customStyles;
  if (!document.getElementById('law-mapping-styles')) {
    styleSheet.id = 'law-mapping-styles';
    document.head.appendChild(styleSheet);
  }
}

export default function LawMapping() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMountedRef = useRef(true);
  const { isAuthenticated } = useAuth();
  
  // Check if user is authenticated
  const isUserAuthenticated = useMemo(() => {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token');
    const hasValidToken = !!token && token !== 'null' && token !== 'undefined';
    return isAuthenticated && hasValidToken;
  }, [isAuthenticated]);

  // Get mapping type from URL query parameter, default to bns_ipc
  const getInitialMappingType = () => {
    const searchParams = new URLSearchParams(location.search);
    const typeParam = searchParams.get('type');
    // Validate that the type is one of the valid mapping types
    const validTypes = ['bns_ipc', 'bsa_iea', 'bnss_crpc'];
    if (typeParam && validTypes.includes(typeParam)) {
      return typeParam;
    }
    return "bns_ipc"; // default
  };

  // Mapping type state - initialize from URL query parameter
  const [mappingType, setMappingType] = useState(getInitialMappingType);

  // Filter visibility state
  const [showFilters, setShowFilters] = useState(false);

  // Data states
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [offset, setOffset] = useState(0);
  const offsetRef = useRef(0);
  const fetchMappingsRef = useRef(null);
  const isInitialMountRef = useRef(true);
  const isFetchingRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  // Filter states
  const [filters, setFilters] = useState({
    word_search: '', // Full-text search for searchable text
    source_section_search: '', // Source section specific search (BNS/BNSS/BSA)
    target_section_search: '', // Target section specific search (IPC/CrPC/IEA)
    subject: '',
    section: '',
    source_section: '',
    target_section: ''
  });

  const pageSize = 50; // Increased from 20 to show more mappings per page

  const mappingTypes = [
    { value: "bns_ipc", label: "IPC ↔ BNS (Criminal Law)", description: "Indian Penal Code to Bharatiya Nyaya Sanhita" },
    { value: "bsa_iea", label: "IEA ↔ BSA (Evidence Law)", description: "Indian Evidence Act to Bharatiya Sakshya Adhiniyam" },
    { value: "bnss_crpc", label: "CrPC ↔ BNSS (Criminal Procedure)", description: "Code of Criminal Procedure to Bharatiya Nagarik Suraksha Sanhita" }
  ];

  // Update mapping type when URL query parameter changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const typeParam = searchParams.get('type');
    const validTypes = ['bns_ipc', 'bsa_iea', 'bnss_crpc'];
    if (typeParam && validTypes.includes(typeParam) && typeParam !== mappingType) {
      setMappingType(typeParam);
    }
  }, [location.search]);

  // Reset filters when mapping type changes
  useEffect(() => {
    setFilters({
      word_search: '',
      source_section_search: '',
      target_section_search: '',
      subject: '',
      section: '',
      source_section: '',
      target_section: ''
    });
    setMappings([]);
    setOffset(0);
    setHasMore(true);
  }, [mappingType]);

  // Store filters in ref to always get latest values
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Fetch mappings function with offset-based pagination
  const fetchMappings = useCallback(async (isLoadMore = false, customFilters = null) => {
    if (!isMountedRef.current) return;
    
    // Prevent duplicate simultaneous requests
    if (isFetchingRef.current && !isLoadMore) {
      console.log('Already fetching, skipping duplicate request');
      return;
    }
    
    try {
      if (!isLoadMore) {
        isFetchingRef.current = true;
      }
      
      if (isLoadMore) {
        setIsSearching(true);
      } else {
        setLoading(true);
        setError(null);
      }
      
      // Use custom filters if provided, otherwise use current filters from ref
      const activeFilters = customFilters !== null ? customFilters : filtersRef.current;
      const currentOffset = isLoadMore ? offsetRef.current : 0;
      
      // Prepare params - ensure mapping_type is always included
      const params = {
        limit: pageSize,
        offset: currentOffset,
        mapping_type: mappingType  // Always include mapping_type
      };

      // First pass: collect search values for combining
      let searchTerms = [];
      let hasWordSearch = false;
      let hasSourceSectionSearch = false;
      let hasTargetSectionSearch = false;
      
      // Check what search types are active
      if (activeFilters.word_search && activeFilters.word_search.trim() !== '') {
        hasWordSearch = true;
        searchTerms.push(activeFilters.word_search.trim());
      }
      if (activeFilters.source_section_search && activeFilters.source_section_search.trim() !== '') {
        hasSourceSectionSearch = true;
        searchTerms.push(activeFilters.source_section_search.trim());
      }
      if (activeFilters.target_section_search && activeFilters.target_section_search.trim() !== '') {
        hasTargetSectionSearch = true;
        searchTerms.push(activeFilters.target_section_search.trim());
      }
      
      // If any search is used, combine them and enable highlights
      if (searchTerms.length > 0) {
        params.search = searchTerms.join(' ');
        params.highlight = true;
      }
      
      // Add filters - map to API parameter names based on mapping type
      Object.keys(activeFilters).forEach(key => {
        const value = activeFilters[key];
        // Skip empty values
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return;
        }
        
        // Map filter keys to API parameter names
        if (key === 'word_search') {
          // Already handled above in search parameter
          // No additional action needed
        } else if (key === 'source_section_search') {
          // Source section search: use source_section for filtering
          params.source_section = value;
        } else if (key === 'target_section_search') {
          // Target section search: use target_section for filtering
          params.target_section = value;
        } else if (key === 'subject') {
          params.subject = value;
        } else if (key === 'section') {
          // Section searches in both source and target sections
          params.section = value;
        } else if (key === 'source_section') {
          // source_section maps to bns_section/bsa_section/bnss_section based on mapping_type
          params.source_section = value;
        } else if (key === 'target_section') {
          // target_section maps to ipc_section/iea_section/crpc_section based on mapping_type
          params.target_section = value;
        } else {
          // Direct mapping for other filters
          params[key] = value;
        }
      });

      // Remove empty params (but keep mapping_type even if it's empty string - it shouldn't be)
      Object.keys(params).forEach(key => {
        if (key === 'mapping_type') return; // Always keep mapping_type
        if (params[key] === "" || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      // Log the request for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Fetching mappings with params:', params);
      }

      // Call API
      const data = await apiService.getLawMappingsWithOffset(currentOffset, pageSize, params);
      
      // Log the response for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('Mappings API response:', { 
          mappingType, 
          dataCount: data?.data?.length,
          pagination: data?.pagination,
          searchMetadata: data?.search_metadata
        });
      }
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid API response: Expected object but got ' + typeof data);
      }
      
      // Handle different response structures
      let mappingsArray = [];
      if (Array.isArray(data.data)) {
        mappingsArray = data.data;
      } else if (Array.isArray(data)) {
        mappingsArray = data;
      } else if (data.data) {
        console.warn('API response data is not an array:', data.data);
        mappingsArray = [];
      }
      
      if (!isMountedRef.current) return;
      
      // Handle both pagination and pagination_info for backward compatibility
      const paginationInfo = data.pagination || data.pagination_info || {};
      
      if (isLoadMore) {
        setMappings(prev => [...prev, ...mappingsArray]);
        setOffset(prev => prev + mappingsArray.length);
        offsetRef.current = offsetRef.current + mappingsArray.length;
      } else {
        setMappings(mappingsArray);
        setOffset(mappingsArray.length);
        offsetRef.current = mappingsArray.length;
      }
      
      // Update hasMore based on API response
      setHasMore(paginationInfo.has_more !== false); // Default to true if not specified
      
      // Update total count from pagination info if available
      if (paginationInfo.total_count !== undefined) {
        setTotalCount(paginationInfo.total_count);
      } else if (!isLoadMore) {
        // If no total count, estimate based on current data
        setTotalCount(mappingsArray.length + (paginationInfo.has_more ? pageSize : 0));
      }
      
      // Log search metadata if Elasticsearch was used
      if (data.search_metadata && process.env.NODE_ENV === 'development') {
        console.log('Elasticsearch search metadata:', data.search_metadata);
      }
      
    } catch (error) {
      if (!isMountedRef.current) return;
      console.error('Error fetching mappings:', error);
      
      let errorMessage = `Failed to fetch law mappings. Please try again.`;
      
      if (error.message.includes('401') || error.message.includes('Authentication')) {
        errorMessage = "Authentication required. Please log in to access mappings.";
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        errorMessage = "Access denied. Please check your permissions.";
      } else if (error.message.includes('500') || error.message.includes('Internal Server')) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Clear mappings on error (except when loading more)
      if (!isLoadMore) {
        setMappings([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsSearching(false);
        if (!isLoadMore) {
          isFetchingRef.current = false;
        }
      }
    }
  }, [mappingType, pageSize]);

  // Store fetchMappings in ref
  useEffect(() => {
    fetchMappingsRef.current = fetchMappings;
  }, [fetchMappings]);

  // Filter handling functions
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      word_search: '',
      source_section_search: '',
      target_section_search: '',
      subject: '',
      section: '',
      source_section: '',
      target_section: ''
    });
    setMappings([]);
    setHasMore(true);
    setOffset(0);
    offsetRef.current = 0;
    setTimeout(() => {
      if (fetchMappingsRef.current) {
        fetchMappingsRef.current(false);
      }
    }, 100);
  };

  const applyFilters = () => {
    if (isFetchingRef.current) return;
    
    setMappings([]);
    setHasMore(true);
    setOffset(0);
    offsetRef.current = 0;
    setError(null);
    
    setTimeout(() => {
      if (fetchMappingsRef.current) {
        const currentFilters = filtersRef.current;
        fetchMappingsRef.current(false, currentFilters);
      }
    }, 100);
  };

  // Sync offset ref with state
  useEffect(() => {
    offsetRef.current = offset;
  }, [offset]);

  // Auto-apply filters when they change (with debounce) - Skip on initial mount
  useEffect(() => {
    if (isInitialMountRef.current) {
      return;
    }
    
    if (isFetchingRef.current) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      const hasActiveFilters = Object.entries(filters).some(([key, val]) => {
        // Skip word_search, source_section_search, target_section_search from auto-apply
        // They need explicit Apply button or Enter key
        if (key === 'word_search' || key === 'source_section_search' || key === 'target_section_search') {
          return false;
        }
        return val && (typeof val === 'string' ? val.trim() !== '' : val !== '');
      });
      
      if (hasActiveFilters && !isFetchingRef.current && fetchMappingsRef.current) {
        const currentFilters = filtersRef.current;
        setMappings([]);
        setHasMore(true);
        setOffset(0);
        offsetRef.current = 0;
        setError(null);
        fetchMappingsRef.current(false, currentFilters);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [filters.subject, filters.section, filters.source_section, filters.target_section, filters.word_search, filters.source_section_search, filters.target_section_search]);

  // Load initial data when mapping type changes
  useEffect(() => {
    // Reset offset when mapping type changes
    setOffset(0);
    offsetRef.current = 0;
    setMappings([]);
    setHasMore(true);
    setError(null);
    
    if (isInitialMountRef.current) {
      const timer = setTimeout(() => {
        if (!isFetchingRef.current && fetchMappingsRef.current) {
          fetchMappingsRef.current(false);
        }
      }, 100);
      isInitialMountRef.current = false;
      return () => clearTimeout(timer);
    } else {
      // When mapping type changes, immediately fetch new data
      if (!isFetchingRef.current && fetchMappingsRef.current) {
        const timer = setTimeout(() => {
          fetchMappingsRef.current(false);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [mappingType]);

  // Enhanced infinite scroll logic
  const loadMoreData = useCallback(async () => {
    if (!hasMore || loading || isSearching || !isMountedRef.current) return;
    if (fetchMappingsRef.current) {
      await fetchMappingsRef.current(true);
    }
  }, [hasMore, loading, isSearching]);

  const { 
    loadingRef, 
    isLoadingMore, 
    error: scrollError, 
    retry, 
    retryCount,
    isFetching 
  } = useSmoothInfiniteScroll({
    fetchMore: loadMoreData,
    hasMore,
    isLoading: loading || isSearching,
    threshold: 0.1,
    rootMargin: '100px',
    preloadThreshold: 0.3,
    throttleDelay: 150
  });

  const viewMappingDetails = (mapping) => {
    // Navigate to mapping details page with mapping data and current mapping type
    navigate('/mapping-details', { state: { mapping, mappingType } });
  };


  // Cleanup effect
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const mappingTypeLabel = mappingTypes.find(m => m.value === mappingType)?.label || "Law Mapping";

  return (
    <div className="min-h-screen animate-fade-in-up" style={{ backgroundColor: '#F9FAFC' }}>
      <Navbar />
      
      <div 
        id="main-scroll-area"
        className="h-screen overflow-y-auto"
        style={{ scrollBehavior: 'smooth', scrollPaddingTop: '0' }}
      >
      
      {/* Enhanced Header Section */}
      <div className="bg-white border-b border-gray-200 pt-14 sm:pt-16 md:pt-20 animate-slide-in-bottom">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 lg:py-12">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 animate-fade-in-up" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Law Mapping
            </h1>
            <div className="w-12 sm:w-16 md:w-20 h-1 mx-auto mb-3 sm:mb-4 md:mb-6 animate-fade-in-up" style={{ backgroundColor: '#CF9B63', animationDelay: '0.2s' }}></div>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl mx-auto px-2 animate-fade-in-up" style={{ color: '#8C969F', fontFamily: 'Roboto, sans-serif', animationDelay: '0.4s' }}>
              Navigate the transition from old legal codes to new ones. Map sections between IPC-BNS, IEA-BSA, and CrPC-BNSS.
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-5 lg:p-6">
        <div className="max-w-7xl mx-auto">

          {/* Mapping Type Selector */}
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            
          </div> */}

          {/* Enhanced Search and Filter Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 lg:p-8 mb-3 sm:mb-4 md:mb-6 lg:mb-8"
          >
            <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
              <h2 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold animate-fade-in-up text-center sm:text-left" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                Search {mappingTypeLabel}
              </h2>
              
              {/* Toggle Button - Three Options */}
              <div className="relative w-full flex items-center bg-gray-100 rounded-xl p-0.5 sm:p-1 shadow-inner">
                  {/* Sliding background indicator */}
                  <motion.div
                    className="absolute top-0.5 bottom-0.5 sm:top-1 sm:bottom-1 rounded-lg z-0"
                    initial={false}
                    animate={{
                      left: mappingType === 'bns_ipc' ? '2px' : mappingType === 'bsa_iea' ? 'calc(33.33% + 1px)' : 'calc(66.66% + 1px)',
                      backgroundColor: mappingType === 'bns_ipc' ? '#1E65AD' : mappingType === 'bsa_iea' ? '#CF9B63' : '#8C969F',
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 30 
                    }}
                    style={{
                      width: 'calc(33.33% - 2px)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    }}
                  />
                  
                  <motion.button
                    onClick={() => setMappingType('bns_ipc')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold transition-all duration-300 relative z-10 flex-1 text-[10px] sm:text-xs md:text-sm ${
                      mappingType === 'bns_ipc'
                        ? 'text-white'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    style={{
                      fontFamily: 'Roboto, sans-serif',
                    }}
                  >
                    IPC ↔ BNS
                  </motion.button>
                  <motion.button
                    onClick={() => setMappingType('bsa_iea')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold transition-all duration-300 relative z-10 flex-1 text-[10px] sm:text-xs md:text-sm ${
                      mappingType === 'bsa_iea'
                        ? 'text-white'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    style={{
                      fontFamily: 'Roboto, sans-serif',
                    }}
                  >
                    IEA ↔ BSA
                  </motion.button>
                  <motion.button
                    onClick={() => setMappingType('bnss_crpc')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold transition-all duration-300 relative z-10 flex-1 text-[10px] sm:text-xs md:text-sm ${
                      mappingType === 'bnss_crpc'
                        ? 'text-white'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    style={{
                      fontFamily: 'Roboto, sans-serif',
                    }}
                  >
                    CrPC ↔ BNSS
                  </motion.button>
                </div>
            </div>
            
            {/* Three Search Fields: Source Section - Target Section - Word Search */}
            <div className="mb-3 sm:mb-4 md:mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                {/* Source Section Search (BNS/BNSS/BSA) */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {mappingType === 'bns_ipc' ? 'IPC Section Search' : mappingType === 'bsa_iea' ? 'BSA Section Search' : 'BNSS Section Search'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.source_section_search}
                      onChange={(e) => handleFilterChange('source_section_search', e.target.value)}
                      placeholder={mappingType === 'bns_ipc' ? 'e.g., 300, 103' : mappingType === 'bsa_iea' ? 'e.g., 3, 5' : 'e.g., 154, 161'}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !loading && !isFetchingRef.current) {
                          e.preventDefault();
                          applyFilters();
                        }
                      }}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                      <Mic className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Target Section Search (IPC/CrPC/IEA) */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {mappingType === 'bns_ipc' ? 'BNS Section Search' : mappingType === 'bsa_iea' ? 'IEA Section Search' : 'CrPC Section Search'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.target_section_search}
                      onChange={(e) => handleFilterChange('target_section_search', e.target.value)}
                      placeholder={mappingType === 'bns_ipc' ? 'e.g., 300, 302' : mappingType === 'bsa_iea' ? 'e.g., 3, 5' : 'e.g., 154, 161'}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !loading && !isFetchingRef.current) {
                          e.preventDefault();
                          applyFilters();
                        }
                      }}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                      <Mic className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Word Search (Full-text search) */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Word Search
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.word_search}
                      onChange={(e) => handleFilterChange('word_search', e.target.value)}
                      placeholder="e.g., murder, punishment"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !loading && !isFetchingRef.current) {
                          e.preventDefault();
                          applyFilters();
                        }
                      }}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                    <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                      <Mic className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Clear Filters Button */}
              {Object.values(filters).some(val => val && (typeof val === 'string' ? val.trim() !== '' : val !== '')) && (
                <div className="mt-3 sm:mt-4">
                  <button
                    onClick={clearFilters}
                    disabled={loading || isFetchingRef.current}
                    className="px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 active:bg-gray-700 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* Dynamic Filters - Hidden by default, shown when showFilters is true */}
            <AnimatePresence>
              {showFilters && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="border-t border-gray-200 pt-3 sm:pt-4 md:pt-6 mt-3 sm:mt-4 md:mt-6 overflow-hidden"
                >
                <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-2 sm:mb-3 md:mb-4" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  Filter Options
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-3 sm:mb-4 md:mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Subject
                    </label>
                    <input
                      type="text"
                      value={filters.subject}
                      onChange={(e) => handleFilterChange('subject', e.target.value)}
                      placeholder="e.g., Theft, Murder, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Section (Any)
                    </label>
                    <input
                      type="text"
                      value={filters.section}
                      onChange={(e) => handleFilterChange('section', e.target.value)}
                      placeholder="e.g., 302, 103, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Searches in both source and target sections</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {mappingType === 'bns_ipc' ? 'BNS Section' : mappingType === 'bsa_iea' ? 'BSA Section' : 'BNSS Section'}
                    </label>
                    <input
                      type="text"
                      value={filters.source_section}
                      onChange={(e) => handleFilterChange('source_section', e.target.value)}
                      placeholder={mappingType === 'bns_ipc' ? 'e.g., 101, 103, 106' : mappingType === 'bsa_iea' ? 'e.g., 3, 5, 24' : 'e.g., 154, 161, 173'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {mappingType === 'bns_ipc' ? 'IPC Section' : mappingType === 'bsa_iea' ? 'IEA Section' : 'CrPC Section'}
                    </label>
                    <input
                      type="text"
                      value={filters.target_section}
                      onChange={(e) => handleFilterChange('target_section', e.target.value)}
                      placeholder={mappingType === 'bns_ipc' ? 'e.g., 302, 304, 307' : mappingType === 'bsa_iea' ? 'e.g., 3, 5, 24' : 'e.g., 154, 161, 173'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    />
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
                  <motion.button
                    onClick={applyFilters}
                    disabled={loading || isFetchingRef.current}
                    whileHover={{ scale: loading || isFetchingRef.current ? 1 : 1.02 }}
                    whileTap={{ scale: loading || isFetchingRef.current ? 1 : 0.98 }}
                    className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Apply Filters
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button
                    onClick={clearFilters}
                    disabled={loading || isFetchingRef.current}
                    whileHover={{ scale: loading || isFetchingRef.current ? 1 : 1.02 }}
                    whileTap={{ scale: loading || isFetchingRef.current ? 1 : 0.98 }}
                    className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 active:bg-gray-700 transition-all font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Filters
                  </motion.button>
                </div>

                {/* Active Filters Display */}
                {Object.values(filters).some(val => val && (typeof val === 'string' ? val.trim() !== '' : val !== '')) && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <h3 className="text-sm font-medium text-blue-800 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Active Filters:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(filters).map(([key, value]) => {
                        if (value && (typeof value === 'string' ? value.trim() !== '' : value !== '')) {
                          const label = key === 'source_section' ? 'Source Section' : 
                                       key === 'target_section' ? 'Target Section' :
                                       key.charAt(0).toUpperCase() + key.slice(1);
                          return (
                            <span key={key} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                              {label}: "{value}"
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </motion.div>
                )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Enhanced Results Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 lg:p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4 md:mb-6">
              <div className="flex-1">
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold animate-fade-in-up" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  {Object.values(filters).some(val => val && (typeof val === 'string' ? val.trim() !== '' : val !== '')) 
                    ? `Search Results - ${mappingTypeLabel}` 
                    : `Latest ${mappingTypeLabel}`}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {Object.values(filters).some(val => val && (typeof val === 'string' ? val.trim() !== '' : val !== '')) 
                    ? `Showing mappings matching your search criteria` 
                    : `Showing the most recent mappings first`}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <div className="flex flex-col items-start sm:items-end gap-1">
                  <span className="text-xs sm:text-sm font-medium text-gray-700" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    {mappings.length} {mappings.length === 1 ? 'Mapping' : 'Mappings'}
                  </span>
                  {hasMore && !loading && (
                    <span className="text-xs text-blue-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      More available
                    </span>
                  )}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 p-5 bg-red-50 border-l-4 border-red-400 rounded-lg shadow-sm"
                >
                <div className="flex items-start justify-between">
                  <div className="flex items-start flex-1">
                    <svg className="w-6 h-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-red-800 font-semibold mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Error Loading Mappings
                      </h4>
                      <p className="text-red-700 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {error}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setError(null);
                      fetchMappings(false);
                    }}
                    disabled={loading}
                    className="ml-4 px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retry
                  </button>
                </div>
              </motion.div>
              )}
            </AnimatePresence>

            {loading && mappings.length === 0 ? (
              <SkeletonGrid count={3} />
            ) : mappings.length === 0 && !error ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  No mappings found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {Object.values(filters).some(val => val && (typeof val === 'string' ? val.trim() !== '' : val !== ''))
                    ? 'No mappings match your current search criteria. Try adjusting your filters or search terms.'
                    : `No mappings are currently available. Please check back later.`}
                </p>
                {Object.values(filters).some(val => val && (typeof val === 'string' ? val.trim() !== '' : val !== '')) && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Clear All Filters
                  </button>
                )}
              </motion.div>
            ) : (
              <div 
                key="mappings-list-container"
                className="relative"
              >
                <div className="space-y-3 sm:space-y-4 md:space-y-5">
                  <AnimatePresence mode="popLayout">
                    {mappings.map((mapping, index) => {
                  // Get section numbers based on mapping type
                  const getSourceSection = () => {
                    if (mappingType === 'bns_ipc') {
                      return mapping.ipc_section || mapping.source_section;
                    } else if (mappingType === 'bsa_iea') {
                      return mapping.iea_section || mapping.source_section;
                    } else {
                      return mapping.crpc_section || mapping.source_section;
                    }
                  };
                  
                  const getTargetSection = () => {
                    if (mappingType === 'bns_ipc') {
                      return mapping.bns_section || mapping.target_section;
                    } else if (mappingType === 'bsa_iea') {
                      return mapping.bsa_section || mapping.target_section;
                    } else {
                      return mapping.bnss_section || mapping.target_section;
                    }
                  };
                  
                  const sourceSection = getSourceSection();
                  const targetSection = getTargetSection();
                  const subject = mapping.subject || mapping.title || 'Mapping';
                  const summary = mapping.summary || mapping.description || mapping.source_description || '';
                  
                  // Get colors based on mapping type - all use red and green pattern
                  const getSourceColor = () => {
                    return { bg: 'bg-red-50', text: 'text-red-600' };
                  };
                  
                  const getTargetColor = () => {
                    return { bg: 'bg-green-50', text: 'text-green-600' };
                  };
                  
                  const sourceColor = getSourceColor();
                  const targetColor = getTargetColor();
                  
                  const getSourceLabel = () => {
                    if (mappingType === 'bns_ipc') return 'IPC Section';
                    if (mappingType === 'bsa_iea') return 'IEA Section';
                    return 'CrPC Section';
                  };
                  
                  const getTargetLabel = () => {
                    if (mappingType === 'bns_ipc') return 'BNS Section';
                    if (mappingType === 'bsa_iea') return 'BSA Section';
                    return 'BNSS Section';
                  };
                  
                  return (
                    <motion.div
                      key={mapping.id || `mapping-${index}`}
                      initial={{ opacity: 0, y: 30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: index * 0.05,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                      whileHover={{ 
                        y: -4, 
                        scale: 1.01,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div 
                        onClick={() => viewMappingDetails(mapping)}
                        className="border border-gray-200 rounded-lg p-2.5 sm:p-4 md:p-5 lg:p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300 bg-white group cursor-pointer"
                      >
                        {/* Section Mapping Display */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 items-center mb-2 sm:mb-3 md:mb-4">
                          {/* Source Section */}
                          <div className={`${sourceColor.bg} p-1.5 sm:p-3 md:p-4 rounded-lg shadow-sm`}>
                            <div className="text-center">
                              <div className="text-[9px] sm:text-xs md:text-sm font-medium text-gray-600 mb-0.5 sm:mb-1 md:mb-1.5 leading-tight">{getSourceLabel()}</div>
                              {sourceSection && (
                                <div 
                                  className={`text-sm sm:text-lg md:text-xl lg:text-2xl font-bold ${sourceColor.text} leading-tight`}
                                  dangerouslySetInnerHTML={{
                                    __html: mapping.highlights?.bns_section?.[0] || 
                                            mapping.highlights?.bnss_section?.[0] || 
                                            mapping.highlights?.bsa_section?.[0] || 
                                            sourceSection
                                  }}
                                />
                              )}
                            </div>
                          </div>

                          {/* Arrow */}
                          <div className="text-center flex flex-col items-center justify-center px-1">
                            <div className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-600 leading-none">
                              ⇄
                            </div>
                            <div className="text-[9px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 hidden sm:block">Maps to</div>
                          </div>

                          {/* Target Section */}
                          <div className={`${targetColor.bg} p-1.5 sm:p-3 md:p-4 rounded-lg shadow-sm`}>
                            <div className="text-center">
                              <div className="text-[9px] sm:text-xs md:text-sm font-medium text-gray-600 mb-0.5 sm:mb-1 md:mb-1.5 leading-tight">{getTargetLabel()}</div>
                              {targetSection && (
                                <div 
                                  className={`text-sm sm:text-lg md:text-xl lg:text-2xl font-bold ${targetColor.text} leading-tight`}
                                  dangerouslySetInnerHTML={{
                                    __html: mapping.highlights?.ipc_section?.[0] || 
                                            mapping.highlights?.crpc_section?.[0] || 
                                            mapping.highlights?.iea_section?.[0] || 
                                            targetSection
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Subject and Summary */}
                        <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 pt-2 sm:pt-3 border-t border-gray-100">
                          <div className="flex-1 min-w-0">
                            <h3 
                              className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold mb-1.5 sm:mb-2 md:mb-3 break-words leading-tight" 
                              style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}
                              dangerouslySetInnerHTML={{
                                __html: mapping.highlights?.subject?.[0] || subject
                              }}
                            />
                            {summary && (
                              <p 
                                className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed line-clamp-2 sm:line-clamp-3" 
                                style={{ fontFamily: 'Roboto, sans-serif' }}
                                dangerouslySetInnerHTML={{
                                  __html: mapping.highlights?.summary?.[0] || summary
                                }}
                              />
                            )}
                          </div>
                          
                          <div className="flex-shrink-0 w-1/6 mt-1 sm:mt-0 justify-right items-end">
                            {/* View Details Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                viewMappingDetails(mapping);
                              }}
                              className="w-full px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all font-medium text-xs sm:text-sm md:text-base shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{ fontFamily: 'Roboto, sans-serif' }}
                            >
                              <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                                View Details
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                    })}
                  </AnimatePresence>
                  
                  {/* Enhanced Infinite Scroll Loader */}
                  {hasMore && (
                    <div ref={loadingRef} className="py-4" style={{ minHeight: '100px' }}>
                      <EnhancedInfiniteScrollLoader 
                        isLoading={isLoadingMore} 
                        hasMore={hasMore} 
                        error={scrollError} 
                        onRetry={retry}
                        retryCount={retryCount}
                        isFetching={isFetching}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

        </div>
      </div>

      </div>
      
      <ScrollToTopButton scrollContainerId="main-scroll-area" />

    </div>
  );
}
