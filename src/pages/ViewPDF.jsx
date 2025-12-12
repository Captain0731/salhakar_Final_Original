import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Navbar from "../components/landing/Navbar";
import BookmarkButton from "../components/BookmarkButton";
import SummaryPopup from "../components/SummaryPopup";
import apiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { FileText, StickyNote, Share2, Download } from "lucide-react";
import { marked } from "marked";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ViewPDF() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: urlId } = useParams();
  const { isAuthenticated } = useAuth();
  
  // Additional check to ensure token exists - memoized to update when token changes
  const isUserAuthenticated = useMemo(() => {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token');
    const hasValidToken = !!token && token !== 'null' && token !== 'undefined';
    return isAuthenticated && hasValidToken;
  }, [isAuthenticated]);
  const [pdfUrl, setPdfUrl] = useState("");
  const [judgmentInfo, setJudgmentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotesPopup, setShowNotesPopup] = useState(false);
  const [notesContent, setNotesContent] = useState("");
  const [notesFolders, setNotesFolders] = useState([]); // API folders
  const [apiFolders, setApiFolders] = useState([]); // All user folders from API
  const [existingNotes, setExistingNotes] = useState([]); // Notes for current reference
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [activeNoteId, setActiveNoteId] = useState(null); // Current note being edited
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [popupPosition, setPopupPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [popupSize, setPopupSize] = useState({ width: 500, height: 400 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [markdownContent, setMarkdownContent] = useState("");
  const [loadingMarkdown, setLoadingMarkdown] = useState(false);
  const [markdownError, setMarkdownError] = useState("");
  const [markdownFetched, setMarkdownFetched] = useState(false); // Track if markdown has been fetched
  const [notesCount, setNotesCount] = useState(0);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  const notesOpenedRef = useRef(false);
  
  // Summary popup state
  const [summaryPopupOpen, setSummaryPopupOpen] = useState(false);

  // Get current language from cookie (Google Translate) with improved detection
  const getCurrentLanguage = () => {
    if (typeof window === 'undefined') return 'en';
    
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

  // Get language name from code
  const getLanguageName = (langCode) => {
    const languageMap = {
      'en': 'English',
      'hi': 'Hindi',
      'gu': 'Gujarati',
      'ta': 'Tamil',
      'te': 'Telugu',
      'kn': 'Kannada',
      'ml': 'Malayalam',
      'bn': 'Bengali',
      'mr': 'Marathi',
      'pa': 'Punjabi',
      'ur': 'Urdu',
      'or': 'Odia',
      'as': 'Assamese'
    };
    return languageMap[langCode] || 'English';
  };

  // Translate text using Google Translate API with smart routing
  // Smart Translation Logic:
  // - If source is English → translate directly to target
  // - If source is not English and target is not English → translate to English first, then to target
  const translateText = async (text, targetLang, sourceLang = 'en') => {
    if (!text || !text.trim() || targetLang === 'en') {
      return text;
    }

    try {
      // Split long text into chunks for translation
      const maxChunkLength = 5000;
      const chunks = [];
      for (let i = 0; i < text.length; i += maxChunkLength) {
        chunks.push(text.substring(i, i + maxChunkLength));
      }

      // Helper function to translate a chunk
      const translateChunk = async (chunk, fromLang, toLang) => {
        try {
          const response = await fetch(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(chunk)}`,
            {
              method: 'GET',
              signal: AbortSignal.timeout(30000)
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data && data[0]) {
              return data[0].map((seg) => seg[0]).join(" ");
            }
          }
          return chunk;
        } catch (chunkError) {
          console.warn(`Translation chunk failed (${fromLang} → ${toLang}):`, chunkError);
          return chunk; // Return original chunk on error
        }
      };

      // Smart translation routing
      const needsTwoStepTranslation = sourceLang !== 'en' && targetLang !== 'en';
      
      if (needsTwoStepTranslation) {
        // Two-step translation: source → English → target
        console.log(`🌐 Two-step translation: ${sourceLang} → English → ${targetLang}`);
        
        // Step 1: Translate from source language to English
        console.log(`   Step 1: Translating ${chunks.length} chunks from ${sourceLang} to English...`);
        const englishChunks = await Promise.all(
          chunks.map((chunk, index) => {
            console.log(`   Chunk ${index + 1}/${chunks.length}: ${sourceLang} → English`);
            return translateChunk(chunk, sourceLang, 'en');
          })
        );
        const englishText = englishChunks.join(" ");
        console.log(`   ✅ Step 1 complete: Translated to English`);

        // Step 2: Translate from English to target language
        console.log(`   Step 2: Translating from English to ${targetLang}...`);
        const englishChunksForStep2 = [];
        for (let i = 0; i < englishText.length; i += maxChunkLength) {
          englishChunksForStep2.push(englishText.substring(i, i + maxChunkLength));
        }

        const targetChunks = await Promise.all(
          englishChunksForStep2.map((chunk, index) => {
            console.log(`   Chunk ${index + 1}/${englishChunksForStep2.length}: English → ${targetLang}`);
            return translateChunk(chunk, 'en', targetLang);
          })
        );
        return targetChunks.join(" ");
      } else {
        // Direct translation: English → target (or source → target if source is not English)
        const fromLang = sourceLang === 'en' ? 'en' : sourceLang;
        console.log(`🌐 Direct translation: ${fromLang} → ${targetLang}`);
        const translatedChunks = await Promise.all(
          chunks.map((chunk, index) => {
            console.log(`   Chunk ${index + 1}/${chunks.length}: ${fromLang} → ${targetLang}`);
            return translateChunk(chunk, fromLang, targetLang);
          })
        );
        return translatedChunks.join(" ");
      }
    } catch (error) {
      console.error("Translation error:", error);
      return text; // Fallback to original text
    }
  };

  // Check if translation is active and set default view
  useEffect(() => {
    const currentLang = getCurrentLanguage();
    // If user is not logged in, always default to Translated (Markdown) view
    if (!isUserAuthenticated) {
      setShowMarkdown(true);
    } else if (currentLang !== 'en') {
      // If a non-English language is selected, default to Translated (Markdown) view
      setShowMarkdown(true);
    }
  }, [isUserAuthenticated]); // Run when authentication status changes

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadJudgmentData = async () => {
      console.log('📄 ViewPDF: loadJudgmentData called', {
        urlId,
        hasState: !!location.state,
        hasJudgmentInState: !!location.state?.judgment,
        hasActInState: !!location.state?.act
      });
      
      // Get act or judgment data from location state
      const actData = location.state?.act;
      const judgmentData = location.state?.judgment;
     
      // If URL has ID but no judgment data in state, fetch by ID
      if (urlId && !judgmentData && !actData) {
        console.log('📄 ViewPDF: Will fetch judgment by ID from URL:', urlId);
        try {
          setLoading(true);
          setError("");
          console.log('📄 ViewPDF: Fetching judgment by ID from URL:', urlId);
          
          let fetchedJudgment = null;
          let fetchError = null;
          
          // Try High Court endpoint first
          try {
            console.log('🔍 Trying High Court endpoint...');
            fetchedJudgment = await apiService.getJudgementById(urlId);
            console.log('✅ Found in High Court');
          } catch (highCourtErr) {
            console.log('⚠️ High Court fetch failed:', highCourtErr.message);
            fetchError = highCourtErr;
            
            // If 404 or "not found", try Supreme Court endpoint
            if (highCourtErr.message.includes('not found') || 
                highCourtErr.message.includes('404') ||
                highCourtErr.message.includes('Judgment with ID')) {
              try {
                console.log('🔍 Trying Supreme Court endpoint...');
                fetchedJudgment = await apiService.getSupremeCourtJudgementById(urlId);
                console.log('✅ Found in Supreme Court');
                fetchError = null; // Clear error since we found it
              } catch (supremeCourtErr) {
                console.log('⚠️ Supreme Court fetch also failed:', supremeCourtErr.message);
                fetchError = supremeCourtErr;
              }
            }
          }
          
          if (fetchedJudgment) {
            console.log('📄 ViewPDF: Fetched judgment data:', fetchedJudgment);
            setJudgmentInfo(fetchedJudgment);
            
            // Handle both pdf_url (from API) and pdf_link (for backward compatibility)
            // Supreme Court uses pdf_url, High Court uses pdf_link
            const originalPdfUrl = fetchedJudgment.pdf_link || fetchedJudgment.pdf_url || "";
            
            if (!originalPdfUrl || originalPdfUrl.trim() === "") {
              console.warn('⚠️ ViewPDF: No PDF URL found in judgment data');
              setError('PDF URL not available for this judgment');
              setLoading(false);
              return;
            }
            
            console.log('📄 ViewPDF: PDF URL resolved:', originalPdfUrl);
            setPdfUrl(originalPdfUrl);
            setTotalPages(25); // Default page count, could be enhanced with API data
            setLoading(false);
          } else {
            // Both endpoints failed
            throw fetchError || new Error('Judgment not found in High Court or Supreme Court');
          }
        } catch (err) {
          console.error('❌ ViewPDF: Error fetching judgment by ID:', err);
          // Show more specific error messages
          let errorMessage = 'Failed to load judgment';
          if (err.message) {
            errorMessage = err.message;
          } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
            errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection.';
          }
          setError(errorMessage);
          setLoading(false);
        }
        return;
      }
   
      if (judgmentData) {
        console.log('📄 ViewPDF: Received judgment data:', judgmentData);
        setJudgmentInfo(judgmentData);
        
        // Update URL to include ID if not already present
        const judgmentId = judgmentData.id || judgmentData.cnr;
        if (judgmentId && urlId !== String(judgmentId)) {
          navigate(`/judgment/${judgmentId}`, { replace: true, state: { judgment: judgmentData } });
        }
        
        // Handle both pdf_url (from API) and pdf_link (for backward compatibility)
        // Priority: pdf_link > pdf_url > empty string
        const originalPdfUrl = judgmentData.pdf_link || judgmentData.pdf_url || "";
        
        console.log('📄 ViewPDF: PDF URL resolved:', originalPdfUrl);
        
        if (!originalPdfUrl || originalPdfUrl.trim() === "") {
          console.warn('⚠️ ViewPDF: No PDF URL found in judgment data');
          setError('PDF URL not available for this judgment');
        }
        
        setPdfUrl(originalPdfUrl);
        setTotalPages(25); // Default page count, could be enhanced with API data
        setLoading(false);
      } else if (actData) {
        // Handle act data if needed
        setJudgmentInfo(actData);
        const actPdfUrl = actData.pdf_link || actData.pdf_url || "";
        setPdfUrl(actPdfUrl);
        setLoading(false);
      } else if (!urlId) {
        // No data provided and no URL ID, redirect back to appropriate page
        console.warn('⚠️ ViewPDF: No judgment or act data provided, redirecting...');
        const referrer = document.referrer;
        if (referrer.includes('/state-acts')) {
          navigate('/state-acts');
        } else if (referrer.includes('/supreme-court') || referrer.includes('/high-court')) {
          navigate('/supreme-court');
        } else {
          navigate('/central-acts');
        }
      }
    };

    loadJudgmentData();
  }, [location.state, navigate, urlId]);

  // Helper function to determine reference type and ID
  const getReferenceInfo = () => {
    if (!judgmentInfo) return null;
    
    // Check if it's an act (from location.state)
    if (location.state?.act) {
      // Determine if central or state act
      // State acts typically have 'location' or 'state' field
      if (judgmentInfo.location || judgmentInfo.state) {
        return {
          reference_type: 'state_act',
          reference_id: judgmentInfo.act_id || judgmentInfo.id
        };
      } else {
        return {
          reference_type: 'central_act',
          reference_id: judgmentInfo.act_id || judgmentInfo.id
        };
      }
    }
    
    // Otherwise it's a judgment
    return {
      reference_type: 'judgment',
      reference_id: judgmentInfo.id
    };
  };

  // Load notes from API when judgment/act changes
  useEffect(() => {
    const loadNotes = async () => {
      if (!judgmentInfo || !isUserAuthenticated) {
        setNotesCount(0);
        return;
      }

      const refInfo = getReferenceInfo();
      if (!refInfo || !refInfo.reference_id) {
        setNotesCount(0);
        return;
      }

      try {
        setLoadingNotes(true);
        const response = await apiService.getNotesByReference(
          refInfo.reference_type,
          refInfo.reference_id
        );
        
        // Handle different response formats
        let notes = [];
        if (response.success && response.data?.notes) {
          notes = response.data.notes;
        } else if (Array.isArray(response)) {
          notes = response;
        } else if (response.data && Array.isArray(response.data)) {
          notes = response.data;
        }
        
        setExistingNotes(notes);
        setNotesCount(notes.length);
        
        // If there are notes, load the first one
        if (notes.length > 0) {
          const firstNote = notes[0];
          setActiveNoteId(firstNote.id);
          setNotesContent(firstNote.content || '');
          setActiveFolderId(firstNote.folder_id || null);
        } else {
          setActiveNoteId(null);
          setNotesContent('');
          setActiveFolderId(null);
        }
      } catch (error) {
        console.error('Error loading notes:', error);
        setExistingNotes([]);
        setNotesCount(0);
        setActiveNoteId(null);
        setNotesContent('');
        setActiveFolderId(null);
      } finally {
        setLoadingNotes(false);
      }
    };

    loadNotes();
  }, [judgmentInfo?.id, judgmentInfo?.act_id, isUserAuthenticated]);

  // Reset notes opened flag when judgment changes
  useEffect(() => {
    notesOpenedRef.current = false;
  }, [judgmentInfo?.id, judgmentInfo?.act_id]);


  // Load user folders from API
  useEffect(() => {
    const loadFolders = async () => {
      if (!isUserAuthenticated) {
        setApiFolders([]);
        return;
      }

      try {
        const response = await apiService.getFolders();
        if (response.success && response.data?.folders) {
          setApiFolders(response.data.folders);
        } else if (Array.isArray(response)) {
          // Handle case where API returns array directly
          setApiFolders(response);
        } else {
          setApiFolders([]);
        }
      } catch (error) {
        console.error('Error loading folders:', error);
        setApiFolders([]);
      }
    };

    loadFolders();
  }, [isUserAuthenticated]);

  // Reset markdown fetched flag when judgment changes
  useEffect(() => {
    setMarkdownFetched(false);
    setMarkdownContent("");
    setMarkdownError("");
  }, [judgmentInfo?.id, judgmentInfo?.act_id]);

  // Fetch markdown content when markdown view is selected
  useEffect(() => {
    if (showMarkdown && judgmentInfo && !markdownFetched && !loadingMarkdown) {
      const fetchMarkdown = async () => {
        setLoadingMarkdown(true);
        setMarkdownError("");
        
        try {
          const judgmentId = judgmentInfo.id || judgmentInfo.act_id;
          if (!judgmentId) {
            throw new Error("No judgment ID available");
          }

            // Determine if it's a Supreme Court judgment
            const courtName = judgmentInfo?.court_name || judgmentInfo?.court || '';
            const isSupremeCourt = courtName && (
              courtName.toLowerCase().includes('supreme') || 
              courtName.toLowerCase().includes('sc') ||
              courtName.toLowerCase() === 'supreme court of india'
            );
          
          console.log(`📄 Fetching markdown for judgment ${judgmentId} (${isSupremeCourt ? 'Supreme Court' : 'High Court'})`);
            
            // Use appropriate endpoint based on court type
            let markdown;
            if (isSupremeCourt) {
              markdown = await apiService.getSupremeCourtJudgementByIdMarkdown(judgmentId);
            } else {
              markdown = await apiService.getJudgementByIdMarkdown(judgmentId);
            }
          
          // Validate markdown content
          if (!markdown || typeof markdown !== 'string') {
            throw new Error("Invalid markdown content received from server");
          }
          
          console.log(`✅ Markdown fetched successfully (${markdown.length} characters)`);
            setMarkdownContent(markdown);
            setMarkdownError(""); // Clear any previous errors on success
          setMarkdownFetched(true); // Mark as fetched ONLY after successful fetch
        } catch (error) {
          console.error("❌ Error fetching markdown:", error);
          console.error("Error details:", {
            message: error.message,
            judgmentId: judgmentInfo?.id || judgmentInfo?.act_id,
            courtName: judgmentInfo?.court_name || judgmentInfo?.court
          });
          
          // Reset markdownFetched on error to allow retry
          setMarkdownFetched(false);
          setMarkdownError(error.message || "Failed to load Translated content");
          setMarkdownContent(""); // Clear content on error
        } finally {
          setLoadingMarkdown(false);
        }
      };
      
      fetchMarkdown();
    }
  }, [showMarkdown, judgmentInfo, markdownFetched, loadingMarkdown]);

  // Track previous language to detect changes
  const previousLangRef = useRef(null);

  // Monitor language changes and reset markdown state to allow re-fetch
  useEffect(() => {
    if (showMarkdown && judgmentInfo) {
      const currentLang = getCurrentLanguage();
      const langChanged = previousLangRef.current !== null && previousLangRef.current !== currentLang;
      
      if (langChanged) {
        console.log(`🌐 Language changed from ${previousLangRef.current} to ${currentLang}, resetting markdown state`);
        // Reset state to allow re-fetch
        setMarkdownFetched(false);
        setMarkdownError(""); // Clear errors when language changes
      }
      
      previousLangRef.current = currentLang;
    }
  }, [showMarkdown, judgmentInfo]);

  // Poll for language changes every 500ms to catch Google Translate cookie updates
  useEffect(() => {
    if (!showMarkdown || !judgmentInfo) return;

    const checkLanguage = () => {
      const currentLang = getCurrentLanguage();
      const langChanged = previousLangRef.current !== null && previousLangRef.current !== currentLang;
      
      if (langChanged) {
        console.log(`🌐 [Poll] Language changed from ${previousLangRef.current} to ${currentLang}, resetting markdown state`);
        setMarkdownFetched(false);
        setMarkdownError("");
        previousLangRef.current = currentLang;
      }
    };

    // Check immediately
    checkLanguage();

    // Poll every 500ms
    const intervalId = setInterval(checkLanguage, 500);
    return () => clearInterval(intervalId);
  }, [showMarkdown, judgmentInfo]);

  // Handle window resize to keep popup within bounds
  useEffect(() => {
    const handleResize = () => {
      if (showNotesPopup) {
        const maxX = window.innerWidth - popupSize.width;
        const maxY = window.innerHeight - popupSize.height;
        
        // Adjust popup size if it exceeds viewport
        setPopupSize(prev => ({
          width: Math.min(prev.width, window.innerWidth * 0.9),
          height: Math.min(prev.height, window.innerHeight * 0.9)
        }));
        
        setPopupPosition(prev => ({
          x: Math.max(0, Math.min(prev.x, maxX)),
          y: Math.max(0, Math.min(prev.y, maxY))
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [showNotesPopup, popupSize]);


  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
        <Navbar />
        <div className="pt-16 sm:pt-20 flex justify-center items-center h-96">
          <div className="text-center px-4">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Loading PDF...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const handleRetry = async () => {
      if (!urlId) return;
      
      setError("");
      setLoading(true);
      
      try {
        console.log('🔄 Retrying: Fetching judgment by ID from URL:', urlId);
        
        let fetchedJudgment = null;
        let fetchError = null;
        
        // Try High Court endpoint first
        try {
          console.log('🔍 Retrying High Court endpoint...');
          fetchedJudgment = await apiService.getJudgementById(urlId);
          console.log('✅ Found in High Court');
        } catch (highCourtErr) {
          console.log('⚠️ High Court fetch failed:', highCourtErr.message);
          fetchError = highCourtErr;
          
          // If 404 or "not found", try Supreme Court endpoint
          if (highCourtErr.message.includes('not found') || 
              highCourtErr.message.includes('404') ||
              highCourtErr.message.includes('Judgment with ID')) {
            try {
              console.log('🔍 Retrying Supreme Court endpoint...');
              fetchedJudgment = await apiService.getSupremeCourtJudgementById(urlId);
              console.log('✅ Found in Supreme Court');
              fetchError = null;
            } catch (supremeCourtErr) {
              console.log('⚠️ Supreme Court fetch also failed:', supremeCourtErr.message);
              fetchError = supremeCourtErr;
            }
          }
        }
        
        if (fetchedJudgment) {
          console.log('📄 ViewPDF: Fetched judgment data:', fetchedJudgment);
          setJudgmentInfo(fetchedJudgment);
          
          const originalPdfUrl = fetchedJudgment.pdf_link || fetchedJudgment.pdf_url || "";
          
          if (!originalPdfUrl || originalPdfUrl.trim() === "") {
            console.warn('⚠️ ViewPDF: No PDF URL found in judgment data');
            setError('PDF URL not available for this judgment');
            setLoading(false);
            return;
          }
          
          console.log('📄 ViewPDF: PDF URL resolved:', originalPdfUrl);
          setPdfUrl(originalPdfUrl);
          setTotalPages(25);
          setLoading(false);
        } else {
          throw fetchError || new Error('Judgment not found in High Court or Supreme Court');
        }
      } catch (err) {
        console.error('❌ ViewPDF: Error fetching judgment by ID:', err);
        let errorMessage = 'Failed to load judgment';
        if (err.message) {
          errorMessage = err.message;
        } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
          errorMessage = 'Network error: Unable to connect to the server. Please check your internet connection.';
        }
        setError(errorMessage);
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
        <Navbar />
        <div className="pt-16 sm:pt-20 flex justify-center items-center h-96 px-4">
          <div className="text-center max-w-md w-full">
            <div className="text-red-600 text-base sm:text-lg mb-3 sm:mb-4 font-semibold">Error loading PDF</div>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={handleRetry}
                disabled={loading}
                className="px-5 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Roboto, sans-serif' }}
              >
                {loading ? 'Retrying...' : 'Retry'}
              </button>
            <button
              onClick={() => {
                // Determine court type from judgment info if available
                const courtName = judgmentInfo?.court_name || judgmentInfo?.court || '';
                const isSupremeCourt = courtName && (
                  courtName.toLowerCase().includes('supreme') || 
                  courtName.toLowerCase().includes('sc') ||
                  courtName.toLowerCase() === 'supreme court of india'
                );
                
                const courtType = isSupremeCourt ? 'supremecourt' : 'highcourt';
                
                // Store court type in localStorage for browser back button support
                localStorage.setItem('lastCourtType', courtType);
                
                // Navigate to judgment access page with court type preserved
                navigate(`/judgment-access?court=${courtType}`, { 
                  state: { 
                    courtType: courtType
                  } 
                });
              }}
                className="px-5 sm:px-6 py-2 sm:py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base font-medium"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Go Back
            </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
      <Navbar />
      <div className="pt-16 sm:pt-20">

      {/* Responsive Layout: Stacked on mobile, side-by-side on desktop */}
      <div className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6" style={{ minHeight: 'calc(100vh - 80px)', height: isMobile ? 'auto' : 'calc(100vh - 80px)', overflow: isMobile ? 'visible' : 'hidden' }}>
        <div className="max-w-7xl mx-auto" style={{ height: isMobile ? 'auto' : '100%' }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6" style={{ height: isMobile ? 'auto' : '100%' }}>
            {/* Details - Left Side - Static */}
            <div className="lg:col-span-1 order-1 lg:order-1 pt-3" style={{ height: isMobile ? 'auto' : '100%', overflow: 'hidden' }}>
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-2 sm:p-2 md:p-6 overflow-y-auto" style={{ height: isMobile ? 'auto' : '100%', position: isMobile ? 'relative' : 'sticky', top: 0 }}>
                <div className="mb-3 sm:mb-4 md:mb-6">
                  <div className="flex flex-col grid grid-cols-2  sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      {location.state?.act ? 'Act Details' : 'Judgment Details'}
                    </h3>
                    {judgmentInfo && (
                      <div className="flex items-center gap-2 justify-end self-start sm:self-auto relative">
                        <button
                          onClick={async () => {
                            try {
                              const judgmentId = urlId || judgmentInfo?.id || judgmentInfo?.cnr || '';
                              const shareUrl = `${window.location.origin}/judgment/${judgmentId}`;
                              const shareTitle = judgmentInfo?.title || 'Legal Judgment';
                              const shareText = `Check out this legal judgment: ${shareTitle}`;
                              
                              const shareData = {
                                title: shareTitle,
                                text: shareText,
                                url: shareUrl
                              };

                              if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                                await navigator.share(shareData);
                              } else {
                                // Fallback to copy
                                await navigator.clipboard.writeText(shareUrl);
                                alert('Link copied to clipboard!');
                              }
                            } catch (err) {
                              if (err.name !== 'AbortError') {
                                // Fallback to copy
                                const judgmentId = urlId || judgmentInfo?.id || judgmentInfo?.cnr || '';
                                const shareUrl = `${window.location.origin}/judgment/${judgmentId}`;
                                try {
                                  await navigator.clipboard.writeText(shareUrl);
                              alert('Link copied to clipboard!');
                                } catch (copyErr) {
                                  console.error('Failed to share or copy:', copyErr);
                                  alert('Failed to share. Please try again.');
                                }
                              }
                            }
                          }}
                          className="p-1.5 sm:p-2 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                          style={{ 
                            backgroundColor: '#1E65AD',
                            color: '#FFFFFF'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#1a5a9a';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#1E65AD';
                          }}
                          title="Share judgment"
                        >
                          <Share2 className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#FFFFFF' }} />
                        </button>
                        
                        {/* Download Button with Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() => {
                              if (!isUserAuthenticated) {
                                navigate('/login');
                                return;
                              }
                              setShowDownloadDropdown(!showDownloadDropdown);
                            }}
                            className="p-1.5 sm:p-2 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
                            style={{ 
                              backgroundColor: '#1E65AD',
                              color: '#FFFFFF'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#1a5a9a';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = '#1E65AD';
                            }}
                            title="Download"
                          >
                            <Download className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#FFFFFF' }} />
                          </button>
                          
                          {/* Download Dropdown Menu */}
                          {showDownloadDropdown && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setShowDownloadDropdown(false)}
                              ></div>
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                                <button
                                  onClick={async () => {
                                    // If user is not logged in, redirect to login page
                                    if (!isUserAuthenticated) {
                                      navigate('/login');
                                      setShowDownloadDropdown(false);
                                      return;
                                    }
                                    
                                    // If logged in, allow download
                                    if (!pdfUrl) {
                                      alert('Original PDF not available');
                                      setShowDownloadDropdown(false);
                                      return;
                                    }
                                    
                                    try {
                                      console.log('Downloading Original PDF from:', pdfUrl);
                                      
                                      // Simple fetch without credentials or custom headers to avoid CORS preflight
                                      // DigitalOcean Spaces doesn't support credentialed requests
                                      // This makes it a "simple request" that doesn't trigger preflight OPTIONS
                                      try {
                                        // Simple GET request - NO credentials, NO custom headers
                                        const response = await fetch(pdfUrl);
                                        
                                        if (!response.ok) {
                                          throw new Error(`HTTP ${response.status}`);
                                        }
                                        
                                        const blob = await response.blob();
                                        
                                        // Verify blob is not empty
                                        if (blob.size === 0) {
                                          throw new Error('Downloaded PDF is empty');
                                        }
                                        
                                        console.log('PDF blob size:', blob.size, 'bytes');
                                        
                                        // Create download link
                                        const blobUrl = URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = blobUrl;
                                        
                                        // Generate filename from judgment info
                                        const judgmentTitle = judgmentInfo?.title || judgmentInfo?.case_title || 'judgment';
                                        link.download = `${judgmentTitle.replace(/[^a-z0-9]/gi, '_')}_original.pdf`;
                                        link.style.display = 'none';
                                        document.body.appendChild(link);
                                        link.click();
                                        
                                        // Clean up
                                        setTimeout(() => {
                                        document.body.removeChild(link);
                                          URL.revokeObjectURL(blobUrl);
                                        }, 100);
                                        
                                        console.log('PDF download initiated successfully');
                                      } catch (fetchError) {
                                        // If fetch fails (CORS or network), use direct download link
                                        console.warn('Fetch failed, using direct download link:', fetchError);
                                        const link = document.createElement('a');
                                        link.href = pdfUrl;
                                        const judgmentTitle = judgmentInfo?.title || judgmentInfo?.case_title || 'judgment';
                                        link.download = `${judgmentTitle.replace(/[^a-z0-9]/gi, '_')}_original.pdf`;
                                        link.style.display = 'none';
                                        document.body.appendChild(link);
                                        link.click();
                                        setTimeout(() => {
                                          document.body.removeChild(link);
                                        }, 100);
                                      }
                                      } catch (error) {
                                        console.error('Download error:', error);
                                      // Final fallback: open in new tab (CORS doesn't apply to top-level navigation)
                                      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
                                      }
                                    
                                    setShowDownloadDropdown(false);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                                  style={{ fontFamily: 'Roboto, sans-serif', color: '#1a1a1a' }}
                                >
                                  <FileText className="h-4 w-4" style={{ color: '#1E65AD' }} />
                                  <span>Original PDF</span>
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      // Get current selected language
                                      const currentLang = getCurrentLanguage();
                                      const langName = getLanguageName(currentLang);
                                      
                                      // Get judgment ID
                                      const judgmentId = judgmentInfo?.id || judgmentInfo?.cnr || urlId;
                                      
                                      if (!judgmentId) {
                                        alert('Judgment ID not available');
                                          setShowDownloadDropdown(false);
                                          return;
                                      }

                                      // Show loading message
                                        const loadingMsg = document.createElement('div');
                                        loadingMsg.id = 'pdf-translation-loading';
                                        loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1E65AD;color:white;padding:20px 30px;border-radius:8px;z-index:10000;font-family:Roboto,sans-serif;box-shadow:0 4px 6px rgba(0,0,0,0.3);';
                                      loadingMsg.textContent = currentLang !== 'en' 
                                        ? `Generating PDF in ${langName}... Please wait.`
                                        : 'Generating PDF... Please wait.';
                                        document.body.appendChild(loadingMsg);

                                      // Fetch markdown content from backend
                                      let markdownContent = '';
                                      try {
                                        // Determine if it's a Supreme Court judgment
                                        const courtName = judgmentInfo?.court_name || judgmentInfo?.court || '';
                                        const isSupremeCourt = courtName && (
                                          courtName.toLowerCase().includes('supreme') || 
                                          courtName.toLowerCase().includes('sc') ||
                                          courtName.toLowerCase() === 'supreme court of india'
                                        );
                                        
                                        // Use appropriate endpoint based on court type
                                        if (isSupremeCourt) {
                                          markdownContent = await apiService.getSupremeCourtJudgementByIdMarkdown(judgmentId);
                                        } else {
                                          markdownContent = await apiService.getJudgementByIdMarkdown(judgmentId);
                                        }
                                        
                                        if (!markdownContent || markdownContent.trim() === '') {
                                          throw new Error('Markdown content is empty');
                                        }
                                      } catch (markdownError) {
                                        // Remove loading message
                                        if (loadingMsg && loadingMsg.parentNode) {
                                          document.body.removeChild(loadingMsg);
                                        }
                                        throw new Error('Failed to fetch markdown content: ' + markdownError.message);
                                      }

                                      // Translate markdown if needed (using existing translateText function)
                                      let finalMarkdown = markdownContent;
                                      if (currentLang !== 'en') {
                                        try {
                                          // Clean markdown before translating
                                          const cleanMarkdown = markdownContent
                                          .replace(/#{1,6}\s+/g, '') // Remove markdown headers
                                          .replace(/\*\*\*(.*?)\*\*\*/g, '$1') // Remove bold italic
                                          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
                                          .replace(/\*(.*?)\*/g, '$1') // Remove italic
                                          .replace(/`(.*?)`/g, '$1') // Remove code
                                          .replace(/```[\s\S]*?```/g, '') // Remove code blocks
                                          .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links
                                          .trim();
                                        
                                          finalMarkdown = await translateText(cleanMarkdown, currentLang);
                                        } catch (translateError) {
                                          console.warn('Translation failed, using original markdown:', translateError);
                                          finalMarkdown = markdownContent;
                                        }
                                      }

                                      // PDF GENERATION STRATEGY:
                                      // - For English: Use text-based rendering (smallest file size)
                                      // - For other languages (Gujarati, Hindi, etc.): Use html2canvas with optimized settings
                                      //   because jsPDF's default fonts don't support Unicode/Indic scripts

                                      if (currentLang === 'en') {
                                        // TEXT-BASED APPROACH FOR ENGLISH (smallest file size)
                                        // Convert markdown to plain text (strip formatting for smaller size)
                                        let plainText = finalMarkdown
                                          .replace(/#{1,6}\s+/g, '') // Remove markdown headers
                                          .replace(/\*\*\*(.*?)\*\*\*/g, '$1') // Remove bold italic
                                          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
                                          .replace(/\*(.*?)\*/g, '$1') // Remove italic
                                          .replace(/`(.*?)`/g, '$1') // Remove inline code
                                          .replace(/```[\s\S]*?```/g, '') // Remove code blocks
                                          .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
                                          .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '') // Remove images
                                          .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double
                                          .trim();

                                        // Create PDF using jsPDF with text-based rendering (much smaller file size)
                                        const pdf = new jsPDF('p', 'mm', 'a4');
                                        const pageWidth = pdf.internal.pageSize.getWidth();
                                        const pageHeight = pdf.internal.pageSize.getHeight();
                                        const margin = 10; // Minimal margin for maximum space
                                        const lineHeight = 5; // Compact line height in mm
                                        const fontSize = 9; // Small font for smaller file size
                                        
                                        pdf.setFontSize(fontSize);
                                        pdf.setFont('helvetica', 'normal'); // Lightweight font for smaller file size
                                        
                                        // Split text into lines and handle word wrapping
                                        const maxWidth = pageWidth - (margin * 2);
                                        let y = margin;
                                        const lines = plainText.split('\n');
                                        
                                        lines.forEach((line) => {
                                          if (!line.trim()) {
                                            // Empty line - add small spacing
                                            y += lineHeight * 0.5;
                                            return;
                                          }
                                          
                                          // Split long lines to fit page width
                                          const words = line.split(' ');
                                          let currentLine = '';
                                          
                                          words.forEach((word) => {
                                            const testLine = currentLine ? `${currentLine} ${word}` : word;
                                            const textWidth = pdf.getTextWidth(testLine);
                                            
                                            if (textWidth > maxWidth && currentLine) {
                                              // Current line is full, write it and start new line
                                              if (y > pageHeight - margin - lineHeight) {
                                                pdf.addPage();
                                                y = margin;
                                              }
                                              pdf.text(currentLine, margin, y);
                                              y += lineHeight;
                                              currentLine = word;
                                            } else {
                                              currentLine = testLine;
                                            }
                                          });
                                          
                                          // Write remaining line
                                          if (currentLine) {
                                            if (y > pageHeight - margin - lineHeight) {
                                              pdf.addPage();
                                              y = margin;
                                            }
                                            pdf.text(currentLine, margin, y);
                                            y += lineHeight;
                                          }
                                        });
                                        
                                        // Remove loading message
                                        if (loadingMsg && loadingMsg.parentNode) {
                                          document.body.removeChild(loadingMsg);
                                        }

                                        // Generate filename
                                        const baseFileName = (judgmentInfo?.title || 'judgment').replace(/[^a-z0-9]/gi, '_');
                                        const fileName = `${baseFileName}_translated.pdf`;
                                        
                                        // Download PDF (text-based, much smaller file size)
                                        pdf.save(fileName);
                                        console.log('PDF downloaded successfully (text-based, optimized size):', fileName);
                                      } else {
                                        // HTML2CANVAS APPROACH FOR NON-ENGLISH LANGUAGES (supports Unicode/Indic scripts)
                                        console.log('Generating PDF for non-English language:', currentLang);
                                        console.log('Final markdown length:', finalMarkdown?.length);
                                        
                                        if (!finalMarkdown || finalMarkdown.trim() === '') {
                                          console.error('Error: finalMarkdown is empty!');
                                          if (loadingMsg && loadingMsg.parentNode) {
                                          document.body.removeChild(loadingMsg);
                                        }
                                          throw new Error('No content to generate PDF');
                                        }
                                        
                                        // Determine appropriate font family for the language
                                        const fontFamily = currentLang === 'gu' 
                                          ? 'Noto Sans Gujarati, Arial Unicode MS, sans-serif'
                                          : currentLang === 'hi'
                                          ? 'Noto Sans Devanagari, Arial Unicode MS, sans-serif'
                                          : currentLang === 'ta'
                                          ? 'Noto Sans Tamil, Arial Unicode MS, sans-serif'
                                          : currentLang === 'te'
                                          ? 'Noto Sans Telugu, Arial Unicode MS, sans-serif'
                                          : currentLang === 'kn'
                                          ? 'Noto Sans Kannada, Arial Unicode MS, sans-serif'
                                          : currentLang === 'ml'
                                          ? 'Noto Sans Malayalam, Arial Unicode MS, sans-serif'
                                          : currentLang === 'bn'
                                          ? 'Noto Sans Bengali, Arial Unicode MS, sans-serif'
                                          : currentLang === 'mr'
                                          ? 'Noto Sans Devanagari, Arial Unicode MS, sans-serif'
                                          : 'Noto Sans Devanagari, Noto Sans Gujarati, Arial Unicode MS, sans-serif';
                                        
                                        // Parse markdown to HTML
                                        let htmlContent;
                                        try {
                                          const parseResult = marked.parse(finalMarkdown);
                                          if (parseResult instanceof Promise) {
                                            htmlContent = await parseResult;
                                          } else {
                                            htmlContent = parseResult;
                                          }
                                          if (!htmlContent || htmlContent.trim().length < 10) {
                                            htmlContent = `<div style="white-space: pre-wrap; font-family: ${fontFamily};">${finalMarkdown.replace(/\n/g, '<br>')}</div>`;
                                          }
                                        } catch (parseError) {
                                          console.warn('Markdown parsing failed, using plain text:', parseError);
                                          htmlContent = `<div style="white-space: pre-wrap; font-family: ${fontFamily}; line-height: 1.6;">${finalMarkdown.replace(/\n/g, '<br>')}</div>`;
                                        }

                                        // Create a temporary div with the content, styled for PDF
                                      const tempDiv = document.createElement('div');
                                      tempDiv.style.position = 'absolute';
                                      tempDiv.style.left = '-9999px';
                                        tempDiv.style.top = '0';
                                        tempDiv.style.width = '210mm';
                                        tempDiv.style.padding = '15mm';
                                        tempDiv.style.fontSize = '12pt'; // Slightly larger font for better readability
                                        tempDiv.style.lineHeight = '1.7';
                                        tempDiv.style.fontFamily = fontFamily;
                                      tempDiv.style.color = '#1a1a1a';
                                      tempDiv.style.backgroundColor = '#ffffff';
                                        tempDiv.style.direction = 'ltr';
                                        tempDiv.style.unicodeBidi = 'embed';
                                      tempDiv.style.wordWrap = 'break-word';
                                        tempDiv.style.overflowWrap = 'break-word';
                                        tempDiv.style.textAlign = 'left';
                                        
                                        // Add CSS for better formatting
                                        const pdfStyle = document.createElement('style');
                                        pdfStyle.setAttribute('data-pdf-style', 'true');
                                        pdfStyle.textContent = `
                                          div[style*="210mm"] p {
                                            margin-bottom: 0.8em;
                                            margin-top: 0;
                                            page-break-inside: avoid;
                                          }
                                          div[style*="210mm"] h1,
                                          div[style*="210mm"] h2,
                                          div[style*="210mm"] h3,
                                          div[style*="210mm"] h4,
                                          div[style*="210mm"] h5,
                                          div[style*="210mm"] h6 {
                                            page-break-after: avoid;
                                            margin-top: 1em;
                                            margin-bottom: 0.5em;
                                          }
                                          div[style*="210mm"] ul,
                                          div[style*="210mm"] ol {
                                            page-break-inside: avoid;
                                            margin-bottom: 0.8em;
                                          }
                                          div[style*="210mm"] li {
                                            page-break-inside: avoid;
                                          }
                                        `;
                                        document.head.appendChild(pdfStyle);
                                        
                                        // Clean HTML to remove ALL problematic elements and data URIs
                                        let cleanHtmlContent = htmlContent
                                          // Remove all images (including data URIs)
                                          .replace(/<img[^>]*>/gi, '')
                                          .replace(/<img[^>]*\/>/gi, '')
                                          // Remove all SVGs
                                          .replace(/<svg[\s\S]*?<\/svg>/gi, '')
                                          // Remove all canvases
                                          .replace(/<canvas[\s\S]*?<\/canvas>/gi, '')
                                          // Remove data URIs from style attributes
                                          .replace(/data:image[^;]*;base64,[^"'\s)]*/gi, '')
                                          .replace(/data:image\/[^;]*;base64,[^"'\s)]*/gi, '')
                                          // Remove background-image data URIs
                                          .replace(/background-image:\s*url\(data:[^)]*\)/gi, '')
                                          // Remove any remaining data URIs
                                          .replace(/data:[^"'\s)]*/gi, '');
                                        
                                        tempDiv.innerHTML = cleanHtmlContent;
                                      document.body.appendChild(tempDiv);

                                        // Wait for fonts to load
                                        await Promise.all([
                                          new Promise(resolve => setTimeout(resolve, 800)),
                                          document.fonts?.ready || Promise.resolve()
                                        ]);
                                        
                                        // Force layout calculation
                                        void tempDiv.offsetHeight;
                                        
                                        // Verify content exists
                                        const hasContent = tempDiv.textContent && tempDiv.textContent.trim().length > 0;
                                        const innerHTMLHasContent = tempDiv.innerHTML && tempDiv.innerHTML.trim().length > 0;
                                        if (!hasContent && !innerHTMLHasContent) {
                                          if (tempDiv && tempDiv.parentNode) {
                                      document.body.removeChild(tempDiv);
                                          }
                                          if (loadingMsg && loadingMsg.parentNode) {
                                            document.body.removeChild(loadingMsg);
                                          }
                                          throw new Error('No content to render in PDF');
                                        }
                                        
                                        tempDiv.style.visibility = 'visible';
                                        tempDiv.style.opacity = '1';

                                        // Generate PDF using html2canvas directly (better control and error handling)
                                      const pdf = new jsPDF('p', 'mm', 'a4');
                                      const pageWidth = pdf.internal.pageSize.getWidth();
                                      const pageHeight = pdf.internal.pageSize.getHeight();
                                        const margin = 15;
                                        const contentWidth = pageWidth - (margin * 2);

                                        try {
                                          // Use html2canvas directly for better control
                                          const canvas = await html2canvas(tempDiv, {
                                            scale: 1.0, // Higher scale for better readability
                                            useCORS: false, // Disable CORS to avoid issues
                                            logging: false,
                                            backgroundColor: '#ffffff',
                                            removeContainer: false,
                                            allowTaint: false,
                                            pixelRatio: window.devicePixelRatio || 1, // Use device pixel ratio for better quality
                                            letterRendering: true,
                                            foreignObjectRendering: false, // Disable to avoid atob errors
                                            onclone: (clonedDoc) => {
                                              // Remove all problematic elements from cloned document
                                              const clonedDiv = clonedDoc.querySelector('div[style*="210mm"]') || clonedDoc.body;
                                              if (clonedDiv) {
                                                clonedDiv.style.fontFamily = tempDiv.style.fontFamily;
                                                clonedDiv.style.fontSize = tempDiv.style.fontSize;
                                                clonedDiv.style.lineHeight = tempDiv.style.lineHeight;
                                                clonedDiv.style.visibility = 'visible';
                                                clonedDiv.style.opacity = '1';
                                              }
                                              
                                              // Aggressively remove all problematic elements
                                              const images = clonedDoc.querySelectorAll('img');
                                              images.forEach(img => {
                                                try {
                                                  img.remove();
                                                } catch (e) {
                                                  img.style.display = 'none';
                                                }
                                              });
                                              
                                              const svgs = clonedDoc.querySelectorAll('svg');
                                              svgs.forEach(svg => {
                                                try {
                                                  svg.remove();
                                                } catch (e) {
                                                  svg.style.display = 'none';
                                                }
                                              });
                                              
                                              const canvases = clonedDoc.querySelectorAll('canvas');
                                              canvases.forEach(canvas => {
                                                try {
                                                  canvas.remove();
                                                } catch (e) {
                                                  canvas.style.display = 'none';
                                                }
                                              });
                                              
                                              // Remove all elements with data URIs
                                              const allElements = clonedDoc.querySelectorAll('*');
                                              allElements.forEach(el => {
                                                try {
                                                  // Check style attribute
                                                  if (el.style && el.style.backgroundImage) {
                                                    if (el.style.backgroundImage.includes('data:')) {
                                                      el.style.backgroundImage = 'none';
                                                    }
                                                  }
                                                  // Check all attributes
                                                  Array.from(el.attributes || []).forEach(attr => {
                                                    if (attr.value && attr.value.includes('data:image')) {
                                                      el.removeAttribute(attr.name);
                                                    }
                                                  });
                                                } catch (e) {
                                                  // Ignore errors
                                                }
                                              });
                                            }
                                          });

                                          // Calculate dimensions for proper page breaks
                                          const imgWidth = canvas.width;
                                          const imgHeight = canvas.height;
                                          const imgAspectRatio = imgWidth / imgHeight;
                                          
                                          // Calculate PDF dimensions
                                          const pdfContentWidth = contentWidth;
                                          const pdfContentHeight = pdfContentWidth / imgAspectRatio;
                                          const maxPageHeight = pageHeight - (margin * 2);
                                          
                                          // Split content across pages if needed
                                          if (pdfContentHeight <= maxPageHeight) {
                                            // Content fits on one page
                                            pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', margin, margin, pdfContentWidth, pdfContentHeight);
                                          } else {
                                            // Content needs multiple pages - split the canvas
                                            const totalPages = Math.ceil(pdfContentHeight / maxPageHeight);
                                            const sourceHeight = imgHeight / totalPages;
                                            
                                            for (let page = 0; page < totalPages; page++) {
                                              if (page > 0) {
                                                pdf.addPage();
                                              }
                                              
                                              // Calculate source and destination coordinates
                                              const sourceY = page * sourceHeight;
                                              const destHeight = Math.min(maxPageHeight, pdfContentHeight - (page * maxPageHeight));
                                              
                                              // Create a temporary canvas for this page
                                              const pageCanvas = document.createElement('canvas');
                                              pageCanvas.width = imgWidth;
                                              pageCanvas.height = Math.min(sourceHeight, imgHeight - sourceY);
                                              const pageCtx = pageCanvas.getContext('2d');
                                              
                                              // Draw the portion of the original canvas
                                              pageCtx.drawImage(
                                                canvas,
                                                0, sourceY, imgWidth, pageCanvas.height,  // Source
                                                0, 0, imgWidth, pageCanvas.height          // Destination
                                              );
                                              
                                              // Add to PDF with better quality
                                              pdf.addImage(
                                                pageCanvas.toDataURL('image/jpeg', 0.92), // Higher quality for readability
                                                'JPEG',
                                                margin,
                                                margin,
                                                pdfContentWidth,
                                                destHeight
                                              );
                                            }
                                          }

                                          // Cleanup
                                          if (pdfStyle && pdfStyle.parentNode) {
                                            document.head.removeChild(pdfStyle);
                                          }
                                          if (tempDiv && tempDiv.parentNode) {
                                            document.body.removeChild(tempDiv);
                                          }
                                          if (loadingMsg && loadingMsg.parentNode) {
                                            document.body.removeChild(loadingMsg);
                                          }

                                          // Save PDF
                                      const baseFileName = (judgmentInfo?.title || 'judgment').replace(/[^a-z0-9]/gi, '_');
                                          const fileName = `${baseFileName}_${langName}.pdf`;
                                      pdf.save(fileName);
                                          console.log('PDF downloaded successfully (html2canvas, Unicode support):', fileName);
                                        } catch (htmlError) {
                                          console.error('Error in html2canvas:', htmlError);
                                          // Cleanup on error
                                          const style = document.querySelector('style[data-pdf-style]');
                                          if (style && style.parentNode) {
                                            document.head.removeChild(style);
                                          }
                                          if (tempDiv && tempDiv.parentNode) {
                                            document.body.removeChild(tempDiv);
                                          }
                                          if (loadingMsg && loadingMsg.parentNode) {
                                            document.body.removeChild(loadingMsg);
                                          }
                                          throw new Error(`Failed to generate PDF: ${htmlError.message || 'Unknown error'}`);
                                        }
                                      }
                                      
                                      } catch (error) {
                                      console.error('Error generating PDF:', error);
                                      console.error('Error details:', {
                                        message: error.message,
                                        stack: error.stack,
                                        name: error.name
                                      });
                                      
                                      // Remove loading message if it exists
                                      const loadingMsg = document.getElementById('pdf-translation-loading');
                                      if (loadingMsg && loadingMsg.parentNode) {
                                        document.body.removeChild(loadingMsg);
                                      }
                                      
                                      // Remove temporary element if it exists
                                      const tempDiv = document.querySelector('div[style*="position: absolute"][style*="-9999px"]');
                                      if (tempDiv && tempDiv.parentNode) {
                                        document.body.removeChild(tempDiv);
                                      }
                                      
                                      // Show more helpful error message
                                      const errorMessage = error.message 
                                        ? `Failed to generate PDF: ${error.message}` 
                                        : 'Failed to generate PDF. Please try again.';
                                      alert(errorMessage);
                                    }
                                    setShowDownloadDropdown(false);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm border-t border-gray-200"
                                  style={{ fontFamily: 'Roboto, sans-serif', color: '#1a1a1a' }}
                                >
                                  <FileText className="h-4 w-4" style={{ color: '#CF9B63' }} />
                                  <span>
                                    {(() => {
                                      const currentLang = getCurrentLanguage();
                                      const langName = getLanguageName(currentLang);
                                      return currentLang !== 'en' 
                                        ? `Download PDF (${langName})`
                                        : 'Translated PDF';
                                    })()}
                                  </span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <BookmarkButton
                          item={judgmentInfo}
                          type={location.state?.act ? "act" : "judgement"}
                          size="small"
                          showText={false}
                        />
                      </div>
                    )}
                  </div>
                  <div className="w-10 sm:w-12 h-0.5 sm:h-1 bg-gradient-to-r" style={{ background: 'linear-gradient(90deg, #1E65AD 0%, #CF9B63 100%)' }}></div>
                </div>

                <div className="space-y-2.5 sm:space-y-3 md:space-y-4 lg:space-y-6">
                  {/* Title */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {location.state?.act ? 'Act Title' : 'Case Title'}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {judgmentInfo?.title || judgmentInfo?.short_title || judgmentInfo?.long_title}
                    </p>
                  </div>

                  {/* Long Title/Description for Acts */}
                  {location.state?.act && judgmentInfo?.long_title && judgmentInfo?.long_title !== judgmentInfo?.short_title && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Description
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {judgmentInfo.long_title}
                      </p>
                    </div>
                  )}

                  {/* Court/Ministry Information */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {location.state?.act ? 'Ministry' : 'Court'}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {location.state?.act ? (judgmentInfo?.ministry || 'N/A') : (judgmentInfo?.court_name || 'N/A')}
                    </p>
                  </div>

                  {/* Judge/Department */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {location.state?.act ? 'Department' : 'Judge'}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {location.state?.act ? (judgmentInfo?.department || 'N/A') : (judgmentInfo?.judge || 'N/A')}
                    </p>
                  </div>

                  {/* Location for State Acts */}
                  {location.state?.act && judgmentInfo?.location && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Location
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {judgmentInfo.location}
                      </p>
                    </div>
                  )}

                  {/* Decision Date/Year */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {location.state?.act ? 'Year' : 'Decision Date'}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {location.state?.act ? (judgmentInfo?.year || 'N/A') : (judgmentInfo?.decision_date ? new Date(judgmentInfo.decision_date).toLocaleDateString() : 'N/A')}
                    </p>
                  </div>

                  {/* Enactment Date for Acts */}
                  {location.state?.act && judgmentInfo?.enactment_date && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Enactment Date
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {new Date(judgmentInfo.enactment_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Enforcement Date for Acts */}
                  {location.state?.act && judgmentInfo?.enforcement_date && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Enforcement Date
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {new Date(judgmentInfo.enforcement_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {/* Act ID for Acts */}
                  {location.state?.act && judgmentInfo?.act_id && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Act ID
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 font-mono" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {judgmentInfo.act_id}
                      </p>
                    </div>
                  )}

                  {/* CNR/Source */}
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {location.state?.act ? 'Source' : 'CNR Number'}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 font-mono" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {location.state?.act ? (judgmentInfo?.source || 'N/A') : (judgmentInfo?.cnr || 'N/A')}
                    </p>
                  </div>

                  {/* Disposal Nature/Type */}
                  {(judgmentInfo?.disposal_nature || judgmentInfo?.type) && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {location.state?.act ? 'Type' : 'Disposal Nature'}
                      </h4>
                      <div className="inline-flex items-center gap-2 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium" 
                           style={{ backgroundColor: '#E3F2FD', color: '#1E65AD', fontFamily: 'Roboto, sans-serif' }}>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ backgroundColor: '#1E65AD' }}></div>
                        {location.state?.act ? judgmentInfo.type : judgmentInfo.disposal_nature}
                      </div>
                    </div>
                  )}

                  {/* Year for Judgments */}
                  {!location.state?.act && judgmentInfo?.year && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Year
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {judgmentInfo.year}
                      </p>
                    </div>
                  )}

                  {/* Case Info for Judgments */}
                  {!location.state?.act && judgmentInfo?.case_info && (
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        Case Information
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {judgmentInfo.case_info}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-3 sm:mt-4 md:mt-6 lg:mt-8 pt-2.5 sm:pt-3 md:pt-4 lg:pt-6 border-t border-gray-200">
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        // Determine court type from judgment info
                        const courtName = judgmentInfo?.court_name || judgmentInfo?.court || '';
                        const isSupremeCourt = courtName && (
                          courtName.toLowerCase().includes('supreme') || 
                          courtName.toLowerCase().includes('sc') ||
                          courtName.toLowerCase() === 'supreme court of india'
                        );
                        
                        const courtType = isSupremeCourt ? 'supremecourt' : 'highcourt';
                        
                        // Store court type in localStorage for browser back button support
                        localStorage.setItem('lastCourtType', courtType);
                        
                        // Navigate to judgment access page with court type preserved
                        navigate(`/judgment-access?court=${courtType}`, { 
                          state: { 
                            courtType: courtType
                          } 
                        });
                      }}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Results
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* PDF Viewer - Right Side - Scrollable */}
            <div className="lg:col-span-2 order-2 lg:order-2" style={{ height: isMobile ? 'auto' : '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* PDF Viewer - Show on all screen sizes */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col" style={{ height: isMobile ? 'auto' : '100%' }}>
                {/* PDF Toolbar - Search, Summary, Notes */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-1.5 md:gap-3 p-1.5 sm:p-2 md:p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                  {/* Search Bar - First Row on Mobile */}
                  <div className="relative w-full sm:flex-1 sm:min-w-[150px] md:min-w-0">
                    <img 
                      src="/uit3.GIF" 
                      alt="Search" 
                      className="absolute left-1.5 sm:left-2.5 md:left-3 top-1/2 transform -translate-y-1/2 h-12 w-8 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 object-contain pointer-events-none z-10"
                    />
                    
                    <input
                      type="text"
                      placeholder="Search With Kiki AI..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 sm:pl-12 md:pl-14 lg:pl-16 pr-1.5 sm:pr-3 py-2 sm:py-1.5 md:py-2.5 border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-[10px] sm:text-xs md:text-base"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          // Trigger PDF search functionality
                          console.log('Searching for:', searchQuery);
                          // You can implement PDF search logic here
                        }
                      }}
                    />
                  </div>
                  
                  {/* Action Buttons Container - Second Row on Mobile */}
                  <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2.5 flex-shrink-0 w-full sm:w-auto">
                    {/* Summary Button */}
                    <button
                      type="button"
                      className="animated-icon-button flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-white font-medium text-[10px] sm:text-xs md:text-sm transition-colors hover:opacity-90"
                      style={{ 
                        backgroundColor: '#1E65AD',
                        fontFamily: 'Roboto, sans-serif'
                      }}
                      onClick={() => {
                        if (!isUserAuthenticated) {
                          navigate('/login');
                          return;
                        }
                        setSummaryPopupOpen(true);
                      }}
                      title="View Summary"
                    >
                      <svg
                        className="icon w-3 h-3 sm:w-4 sm:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                      >
                        <polyline points="13.18 1.37 13.18 9.64 21.45 9.64 10.82 22.63 10.82 14.36 2.55 14.36 13.18 1.37"></polyline>
                      </svg>
                      <span>Summary</span>
                    </button>
                    
                    {/* Notes Button */}
                    {isUserAuthenticated ? (
                      <button
                        type="button"
                        className="animated-icon-button flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-white font-medium text-[10px] sm:text-xs md:text-sm transition-colors hover:opacity-90 relative"
                        style={{ 
                          backgroundColor: '#1E65AD',
                          fontFamily: 'Roboto, sans-serif'
                        }}
                        onClick={() => {
                          if (existingNotes.length > 0 && !activeNoteId) {
                            const firstNote = existingNotes[0];
                            setActiveNoteId(firstNote.id);
                            // Remove title (lines starting with #) from content
                            const content = firstNote.content || '';
                            const lines = content.split('\n');
                            const contentWithoutTitle = lines.filter(line => !line.trim().startsWith('#')).join('\n').trim();
                            setNotesContent(contentWithoutTitle);
                            setActiveFolderId(firstNote.folder_id || null);
                          } else if (existingNotes.length === 0) {
                            const refInfo = getReferenceInfo();
                            if (refInfo) {
                              // Remove title, start with empty content
                              const initialContent = '';
                              setNotesContent(initialContent);
                              setActiveNoteId(null);
                              setActiveFolderId(null);
                            }
                          }
                          setShowNotesPopup(true);
                        }}
                        title="Add Notes"
                      >
                        <svg
                          className="icon w-3 h-3 sm:w-4 sm:h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                        >
                          <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z"></path>
                          <polyline points="15 2 15 8 21 8"></polyline>
                        </svg>
                        <span>Notes</span>
                        {notesCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center z-20 shadow-lg" style={{ fontSize: notesCount > 9 ? '10px' : '11px', lineHeight: '1' }}>
                            {notesCount > 99 ? '99+' : notesCount}
                          </span>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="animated-icon-button flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-white font-medium text-[10px] sm:text-xs md:text-sm transition-colors hover:opacity-90"
                        style={{ 
                          backgroundColor: '#1E65AD',
                          fontFamily: 'Roboto, sans-serif'
                        }}
                        onClick={() => {
                          navigate('/login');
                        }}
                        title="Login to Add Notes"
                      >
                        <svg
                          className="icon w-3 h-3 sm:w-4 sm:h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                        >
                          <path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5-.3.3-.5.7-.5 1.1v12.8c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z"></path>
                          <polyline points="15 2 15 8 21 8"></polyline>
                        </svg>
                        <span>Notes</span>
                      </button>
                    )}
                  </div>
                    
                  {/* PDF/Markdown Toggle Button - Third Row on Mobile - Always visible regardless of Summary button */}
                  <div className="relative flex items-center bg-gray-100 rounded-lg sm:rounded-xl p-0.5 sm:p-1 shadow-inner flex-shrink-0 w-full sm:w-auto sm:inline-flex">
                    {/* Sliding background indicator */}
                    <motion.div
                      className="absolute top-0.5 bottom-0.5 sm:top-1 sm:bottom-1 rounded-md sm:rounded-lg z-0"
                      initial={false}
                      animate={{
                        left: !showMarkdown ? '2px' : 'calc(50% + 1px)',
                        backgroundColor: !showMarkdown ? '#1E65AD' : '#CF9B63',
                      }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 30 
                      }}
                      style={{
                        width: 'calc(50% - 2px)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      }}
                    />
                    
                    <motion.button
                      onClick={() => {
                        // Allow switching to Original view for all users
                        setShowMarkdown(false);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 sm:flex-none px-2.5 sm:px-4 md:px-5 lg:px-6 py-1 sm:py-1.5 md:py-2.5 rounded-md sm:rounded-lg font-semibold transition-all duration-300 relative z-10 text-[10px] sm:text-xs md:text-base ${
                        !showMarkdown
                          ? 'text-white'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      style={{
                        fontFamily: 'Roboto, sans-serif',
                      }}
                    >
                      Original
                    </motion.button>
                    <motion.button
                      onClick={() => setShowMarkdown(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-1 sm:flex-none px-2.5 sm:px-4 md:px-5 lg:px-6 py-1 sm:py-1.5 md:py-2.5 rounded-md sm:rounded-lg font-semibold transition-all duration-300 relative z-10 text-[10px] sm:text-xs md:text-base ${
                        showMarkdown
                          ? 'text-white'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      style={{
                        fontFamily: 'Roboto, sans-serif',
                      }}
                    >
                      Translated
                    </motion.button>
                  </div>
                </div>
                
                {/* PDF/Markdown Content */}
                <div className="flex-1 overflow-hidden relative" style={{ minHeight: 0, height: '100%' }}>
                  {showMarkdown ? (
                    /* Markdown View */
                    <div 
                      className="w-full h-full bg-white rounded-lg"
                      style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      {/* Watermark - Logo */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          zIndex: 0,
                          opacity: 0.15,
                          pointerEvents: 'none',
                          width: '300px',
                          height: '300px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <img 
                          src="/logo4.png" 
                          alt="Watermark"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      <style>
                        {`
                          .markdown-scroll-container::-webkit-scrollbar {
                            width: 12px;
                          }
                          .markdown-scroll-container::-webkit-scrollbar-track {
                            background: #f4f4f4;
                            border-radius: 6px;
                          }
                          .markdown-scroll-container::-webkit-scrollbar-thumb {
                            background: #CF9B63;
                            border-radius: 6px;
                          }
                          .markdown-scroll-container::-webkit-scrollbar-thumb:hover {
                            background: #b88a56;
                          }
                          .markdown-content {
                            text-rendering: optimizeLegibility;
                            -webkit-font-smoothing: antialiased;
                            -moz-osx-font-smoothing: grayscale;
                            font-feature-settings: "kern" 1;
                            text-size-adjust: 100%;
                          }
                          .markdown-content h1:first-child,
                          .markdown-content h2:first-child,
                          .markdown-content h3:first-child,
                          .markdown-content h4:first-child,
                          .markdown-content h5:first-child,
                          .markdown-content h6:first-child {
                            margin-top: 0;
                          }
                          .markdown-content p:last-child,
                          .markdown-content ul:last-child,
                          .markdown-content ol:last-child,
                          .markdown-content blockquote:last-child {
                            margin-bottom: 0;
                          }
                          .markdown-content img {
                            max-width: 100%;
                            height: auto;
                            border-radius: 0.625rem;
                            margin: 2rem auto;
                            display: block;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                          }
                          .markdown-content table {
                            border-radius: 0.5rem;
                            overflow: hidden;
                          }
                          .markdown-content tr:nth-child(even) {
                            background-color: #f8f9fa;
                          }
                          .markdown-content tr:hover {
                            background-color: #f1f3f5;
                            transition: background-color 0.2s ease;
                          }
                          .markdown-content a:hover {
                            color: #CF9B63;
                            text-decoration-color: #1E65AD;
                          }
                          .markdown-content code {
                            word-break: break-word;
                          }
                          .markdown-content pre code {
                            display: block;
                            padding: 0;
                            background: transparent;
                            border: none;
                            color: inherit;
                          }
                        `}
                      </style>
                      <div 
                        className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 markdown-scroll-container"
                        style={{
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#CF9B63 #f4f4f4',
                          height: '100%',
                          overflowY: 'scroll',
                          position: 'relative',
                          zIndex: 1
                        }}
                      >
                        {loadingMarkdown ? (
                          <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                              <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>Loading Translated content...</p>
                            </div>
                          </div>
                        ) : markdownError ? (
                          <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
                            <div className="text-center text-red-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                              <p className="text-lg font-semibold mb-2">Error loading Translated content</p>
                              <p className="text-sm">{markdownError}</p>
                            </div>
                          </div>
                        ) : markdownContent ? (
                          <div className="markdown-content" style={{ 
                            fontFamily: 'Roboto, sans-serif',
                            lineHeight: '1.9',
                            color: '#1a1a1a',
                            fontSize: '17px',
                            maxWidth: '100%',
                            padding: '0',
                            letterSpacing: '0.01em'
                          }}>
                            <ReactMarkdown
                              components={{
                                h1: ({node, children, ...props}) => <h1 style={{ 
                                  fontSize: '1rem', 
                                  fontWeight: '800', 
                                  marginTop: '2.5rem', 
                                  marginBottom: '1.5rem', 
                                  color: '#1E65AD',
                                  lineHeight: '1.2',
                                  borderBottom: '3px solid #E3F2FD',
                                  paddingBottom: '1rem',
                                  // letterSpacing: '-0.02em',
                                  textAlign: 'center'
                                }} {...props}>{children || ''}</h1>,
                                h2: ({node, children, ...props}) => <h2 style={{ 
                                  fontSize: '1rem', 
                                  fontWeight: '700', 
                                  marginTop: '2rem', 
                                  marginBottom: '1.25rem', 
                                  color: '#1E65AD',
                                  lineHeight: '1.3',
                                  // letterSpacing: '-0.01em',
                                  paddingLeft: '0.5rem',
                                  // borderLeft: '4px solid #CF9B63',
                                  paddingTop: '0.5rem',
                                  paddingBottom: '0.5rem',
                                  textAlign: 'center'
                                }} {...props}>{children || ''}</h2>,
                                h3: ({node, children, ...props}) => <h3 style={{ 
                                  fontSize: '2rem', 
                                  fontWeight: '600', 
                                  marginTop: '1.75rem', 
                                  marginBottom: '1rem', 
                                  color: '#1E65AD',
                                  lineHeight: '1.4',
                                  textAlign: 'center',
                                  letterSpacing: '0'
                                }} {...props}>{children || ''}</h3>,
                                h4: ({node, children, ...props}) => <h4 style={{ 
                                  fontSize: '1.75rem', 
                                  fontWeight: '600', 
                                  marginTop: '1.5rem', 
                                  marginBottom: '0.875rem', 
                                  color: '#1E65AD',
                                  textAlign: 'center',
                                  lineHeight: '1.5'
                                }} {...props}>{children || ''}</h4>,
                                h5: ({node, children, ...props}) => <h5 style={{ 
                                  fontSize: '1.5rem', 
                                  fontWeight: '600', 
                                  marginTop: '1.25rem', 
                                  marginBottom: '0.75rem', 
                                  color: '#1E65AD',
                                  textAlign: 'center',
                                  lineHeight: '1.5'
                                }} {...props}>{children || ''}</h5>,
                                h6: ({node, children, ...props}) => <h6 style={{ 
                                  fontSize: '1.25rem', 
                                  fontWeight: '600', 
                                  marginTop: '1rem', 
                                  marginBottom: '0.625rem', 
                                  textAlign: 'center',
                                  color: '#1E65AD',
                                  lineHeight: '1.5'
                                }} {...props}>{children || ''}</h6>,
                                p: ({node, ...props}) => <p style={{ 
                                  marginBottom: '1.5rem', 
                                  marginTop: '0',
                                  lineHeight: '1.95',
                                  fontSize: '15px',
                                  color: '#2c3e50',
                                  // textAlign: 'left',
                                  // wordSpacing: '0.05em',
                                  // letterSpacing: '0.01em',
                                  padding: '0.5rem 0',
                                  maxWidth: '100%'
                                }} {...props} />,
                                ul: ({node, ...props}) => <ul style={{ 
                                  marginBottom: '1.5rem', 
                                  paddingLeft: '2.5rem', 
                                  listStyleType: 'disc',
                                  textAlign: 'left',
                                  lineHeight: '1.9'
                                }} {...props} />,
                                ol: ({node, ...props}) => <ol style={{ 
                                  marginBottom: '1.5rem', 
                                  paddingLeft: '2.5rem', 
                                  listStyleType: 'decimal',
                                  textAlign: 'left',
                                  lineHeight: '1.9'
                                }} {...props} />,
                                li: ({node, ...props}) => <li style={{ 
                                  marginBottom: '0.75rem',
                                  lineHeight: '1.9',
                                  color: '#2c3e50',
                                  textAlign: 'left',
                                  fontSize: '18px',
                                  paddingLeft: '0.5rem'
                                }} {...props} />,
                                strong: ({node, ...props}) => <strong style={{ 
                                  fontWeight: '700', 
                                  color: '#1E65AD',
                                  letterSpacing: '0.01em'
                                }} {...props} />,
                                em: ({node, ...props}) => <em style={{ 
                                  fontStyle: 'italic',
                                  color: '#2c3e50',
                                  fontWeight: '500'
                                }} {...props} />,
                                code: ({node, ...props}) => <code style={{ 
                                  backgroundColor: '#f1f3f5', 
                                  padding: '0.3rem 0.6rem', 
                                  borderRadius: '0.375rem', 
                                  fontFamily: '"Fira Code", "Courier New", monospace', 
                                  fontSize: '0.9em',
                                  color: '#d63384',
                                  border: '1px solid #dee2e6',
                                  fontWeight: '500',
                                  letterSpacing: '0'
                                }} {...props} />,
                                pre: ({node, ...props}) => <pre style={{ 
                                  backgroundColor: '#f8f9fa',
                                  padding: '1.25rem',
                                  borderRadius: '0.625rem',
                                  overflowX: 'auto',
                                  marginBottom: '1.5rem',
                                  border: '1px solid #e9ecef',
                                  fontSize: '0.9em',
                                  lineHeight: '1.7',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }} {...props} />,
                                blockquote: ({node, ...props}) => <blockquote style={{ 
                                  borderLeft: '5px solid #1E65AD',
                                  paddingLeft: '1.5rem',
                                  marginLeft: '0',
                                  marginBottom: '1.5rem',
                                  fontStyle: 'italic',
                                  color: '#495057',
                                  backgroundColor: '#f8f9fa',
                                  padding: '1.25rem 1.25rem 1.25rem 1.5rem',
                                  borderRadius: '0.5rem',
                                  borderTop: '1px solid #e9ecef',
                                  borderRight: '1px solid #e9ecef',
                                  borderBottom: '1px solid #e9ecef',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }} {...props} />,
                                hr: ({node, ...props}) => <hr style={{ 
                                  border: 'none',
                                  borderTop: '2px solid #E3F2FD',
                                  margin: '2.5rem 0',
                                  borderRadius: '1px',
                                  height: '2px',
                                  background: 'linear-gradient(90deg, transparent, #E3F2FD, transparent)'
                                }} {...props} />,
                                a: ({node, children, ...props}) => <a style={{ 
                                  color: '#1E65AD',
                                  textDecoration: 'underline',
                                  textDecorationColor: '#CF9B63',
                                  textUnderlineOffset: '3px',
                                  fontWeight: '500',
                                  transition: 'color 0.2s ease'
                                }} {...props}>{children || props.href || ''}</a>,
                                table: ({node, ...props}) => <table style={{ 
                                  width: '100%',
                                  borderCollapse: 'collapse',
                                  marginBottom: '1.5rem',
                                  fontSize: '16px',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                  borderRadius: '0.5rem',
                                  overflow: 'hidden'
                                }} {...props} />,
                                th: ({node, ...props}) => <th style={{ 
                                  backgroundColor: '#1E65AD',
                                  color: '#ffffff',
                                  padding: '1rem',
                                  textAlign: 'left',
                                  fontWeight: '600',
                                  border: '1px solid #1a5a9a',
                                  fontSize: '0.95em',
                                  letterSpacing: '0.02em'
                                }} {...props} />,
                                td: ({node, ...props}) => <td style={{ 
                                  padding: '0.875rem 1rem',
                                  border: '1px solid #e9ecef',
                                  backgroundColor: '#ffffff',
                                  fontSize: '0.95em'
                                }} {...props} />,
                                img: ({node, ...props}) => <img 
                                  alt={props.alt || 'Markdown content image'}
                                  style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    borderRadius: '0.625rem',
                                    margin: '2rem 0',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                    display: 'block',
                                    marginLeft: 'auto',
                                    marginRight: 'auto'
                                  }} 
                                  {...props} 
                                />,
                              }}
                            >
                              {markdownContent}
                            </ReactMarkdown>
                            
                            {/* Footer - Appears at bottom of markdown content */}
                            <div className="mt-12 pt-8 border-t border-gray-300" style={{ 
                              fontFamily: 'Roboto, sans-serif',
                              color: '#666',
                              fontSize: '12px',
                              paddingBottom: '20px',
                              marginTop: '48px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '12px'
                            }}>
                              {/* Left: salhakar.com */}
                              <div style={{ color: '#666', fontWeight: '500' }}>
                                salhakar.com
                              </div>
                              
                              {/* Center: Page number (not applicable for markdown, but keeping for consistency) */}
                              <div style={{ color: '#999', fontSize: '11px' }}>
                                {/* Markdown view doesn't have page numbers */}
                              </div>
                              
                              {/* Right: Judgment link */}
                              <div>
                                <a 
                                  href={`${window.location.origin}/judgment/${urlId || judgmentInfo?.id || judgmentInfo?.cnr || ''}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ 
                                    color: '#1E65AD',
                                    textDecoration: 'none',
                                    fontSize: '11px',
                                    wordBreak: 'break-all'
                                  }}
                                  onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                  onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                >
                                  {`${window.location.origin}/judgment/${urlId || judgmentInfo?.id || judgmentInfo?.cnr || ''}`}
                                </a>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
                            <p className="text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>No Translated content available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : pdfUrl && pdfUrl.trim() !== "" ? (
                    /* PDF View */
                  <div className="relative h-full w-full pdf-scrollbar-container" style={{ minHeight: isMobile ? '400px' : '350px', display: 'flex', flexDirection: 'column' }}>
                    <style>{`
                      /* Container scrollbar styling */
                      .pdf-scrollbar-container::-webkit-scrollbar {
                        width: 14px;
                        height: 14px;
                      }
                      .pdf-scrollbar-container::-webkit-scrollbar-track {
                        background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
                        border-radius: 10px;
                        border: 1px solid #dee2e6;
                      }
                      .pdf-scrollbar-container::-webkit-scrollbar-thumb {
                        background: linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%);
                        border-radius: 10px;
                        border: 2px solid #f8f9fa;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        transition: all 0.3s ease;
                      }
                      .pdf-scrollbar-container::-webkit-scrollbar-thumb:hover {
                        background: linear-gradient(135deg, #1a5a9a 0%, #b88a52 100%);
                        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
                        transform: scale(1.05);
                      }
                      .pdf-scrollbar-container::-webkit-scrollbar-thumb:active {
                        background: linear-gradient(135deg, #154a7a 0%, #a67a42 100%);
                      }
                      .pdf-scrollbar-container::-webkit-scrollbar-button {
                        background: linear-gradient(180deg, #1E65AD 0%, #CF9B63 100%);
                        border: 1px solid #dee2e6;
                        border-radius: 10px;
                        height: 16px;
                      }
                      .pdf-scrollbar-container::-webkit-scrollbar-button:hover {
                        background: linear-gradient(180deg, #1a5a9a 0%, #b88a52 100%);
                      }
                      .pdf-scrollbar-container::-webkit-scrollbar-button:active {
                        background: linear-gradient(180deg, #154a7a 0%, #a67a42 100%);
                      }
                      .pdf-scrollbar-container::-webkit-scrollbar-corner {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border-radius: 10px;
                      }
                      
                      /* Iframe scrollbar styling */
                      .pdf-scrollbar-container iframe::-webkit-scrollbar {
                        width: 14px;
                        height: 14px;
                      }
                      .pdf-scrollbar-container iframe::-webkit-scrollbar-track {
                        background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
                        border-radius: 10px;
                        border: 1px solid #dee2e6;
                      }
                      .pdf-scrollbar-container iframe::-webkit-scrollbar-thumb {
                        background: linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%);
                        border-radius: 10px;
                        border: 2px solid #f8f9fa;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                        transition: all 0.3s ease;
                      }
                      .pdf-scrollbar-container iframe::-webkit-scrollbar-thumb:hover {
                        background: linear-gradient(135deg, #1a5a9a 0%, #b88a52 100%);
                        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
                      }
                      .pdf-scrollbar-container iframe::-webkit-scrollbar-thumb:active {
                        background: linear-gradient(135deg, #154a7a 0%, #a67a42 100%);
                      }
                      .pdf-scrollbar-container iframe::-webkit-scrollbar-button {
                        background: linear-gradient(180deg, #1E65AD 0%, #CF9B63 100%);
                        border: 1px solid #dee2e6;
                        border-radius: 10px;
                        height: 16px;
                      }
                      .pdf-scrollbar-container iframe::-webkit-scrollbar-button:hover {
                        background: linear-gradient(180deg, #1a5a9a 0%, #b88a52 100%);
                      }
                      .pdf-scrollbar-container iframe::-webkit-scrollbar-button:active {
                        background: linear-gradient(180deg, #154a7a 0%, #a67a42 100%);
                      }
                      .pdf-scrollbar-container iframe::-webkit-scrollbar-corner {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        border-radius: 10px;
                      }
                      
                      /* Firefox scrollbar styling */
                      .pdf-scrollbar-container {
                        scrollbar-width: thin;
                        scrollbar-color: #1E65AD #f1f1f1;
                      }
                      .pdf-scrollbar-container iframe {
                        scrollbar-width: thin;
                        scrollbar-color: #1E65AD #f1f1f1;
                      }
                    `}</style>
                    {/* PDF Embed - Display inline for both mobile and desktop */}
                    <div className="w-full h-full flex-1" style={{ minHeight: isMobile ? '400px' : '350px', position: 'relative' }}>
                      <iframe
                        src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&page=${currentPage}&zoom=${isMobile ? 'page-width' : 'page-fit'}&view=FitH`}
                        className="absolute inset-0 w-full h-full border-0 rounded-lg"
                        title={location.state?.act ? 'Act PDF' : 'Judgment PDF'}
                        style={{ 
                          width: '100%', 
                          height: '100%',
                          display: 'block',
                          minHeight: isMobile ? '400px' : '350px'
                        }}
                        allow="fullscreen"
                        scrolling="auto"
                        onLoad={() => {
                          setLoading(false);
                          setError("");
                        }}
                        onError={() => {
                          // On error, try to reload or show embedded view
                          console.warn('PDF iframe error, trying alternative display');
                          setError("");
                        }}
                      />
                      
                      {/* Alternative: Use object tag as fallback for mobile */}
                      {isMobile && (
                        <object
                          data={pdfUrl}
                          type="application/pdf"
                          className="absolute inset-0 w-full h-full border-0 rounded-lg"
                          style={{
                            width: '100%',
                            height: '100%',
                            minHeight: '400px',
                            display: 'none'
                          }}
                          aria-label={location.state?.act ? 'Act PDF' : 'Judgment PDF'}
                        >
                          <p className="text-center p-4 text-gray-600">
                            Your browser does not support PDFs. 
                            <a href={pdfUrl} target="_self" className="text-blue-600 underline ml-1">
                              Click here to view
                            </a>
                          </p>
                        </object>
                      )}
                    </div>

                    {/* Loading Overlay - Only show on desktop */}
                    {loading && !isMobile && (
                      <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 flex items-center justify-center rounded-lg">
                        <div className="text-center p-3 sm:p-4 md:p-6">
                          <div className="relative">
                            <div className="animate-spin rounded-full h-7 w-7 sm:h-8 sm:w-8 md:h-12 md:w-12 border-4 border-gray-200 mx-auto"></div>
                            <div className="animate-spin rounded-full h-7 w-7 sm:h-8 sm:w-8 md:h-12 md:w-12 border-4 border-transparent border-t-blue-600 absolute top-0 left-0"></div>
                          </div>
                          <p className="mt-2 sm:mt-3 md:mt-4 text-gray-600 font-medium text-xs sm:text-sm md:text-base px-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Loading PDF Document...
                          </p>
                          <p className="mt-1 text-xs sm:text-sm text-gray-500 px-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Please wait while we prepare the document
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                   <div className="flex items-center justify-center h-full min-h-[350px] sm:min-h-[400px]">
                     <div className="text-center p-3 sm:p-4 md:p-8">
                       <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-2 sm:mb-3 md:mb-4 rounded-full bg-gradient-to-br flex items-center justify-center" 
                            style={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' }}>
                         <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                         </svg>
                       </div>
                       <h3 className="text-sm sm:text-base md:text-lg font-bold mb-1 sm:mb-2 px-2" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                         PDF Not Available
                       </h3>
                       <p className="text-gray-600 text-xs sm:text-sm px-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                         This {location.state?.act ? 'act' : 'judgment'} does not have a PDF document available.
                       </p>
                     </div>
                   </div>
                 )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Draggable Notes Popup */}
      <AnimatePresence>
      {showNotesPopup && (
        <>
          {/* Backdrop */}
            <motion.div 
            className="fixed inset-0 bg-black bg-opacity-30 z-[10000]"
            onClick={() => setShowNotesPopup(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Draggable Popup */}
          <motion.div
            className={`fixed bg-white z-[10001] flex flex-col ${isMobile ? 'rounded-3xl' : 'rounded-2xl'}`}
            style={isMobile ? {
              width: '92%',
              maxWidth: '500px',
              height: '85vh',
              maxHeight: '700px',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              fontFamily: 'Roboto, sans-serif',
              userSelect: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)',
            } : {
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
              width: `${popupSize.width}px`,
              height: `${popupSize.height}px`,
              minWidth: '450px',
              minHeight: '400px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              fontFamily: 'Roboto, sans-serif',
              userSelect: isDragging || isResizing ? 'none' : 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.08)',
            }}
            initial={isMobile ? { opacity: 0, scale: 0.9, y: '-50%', x: '-50%' } : { opacity: 0, scale: 0.95 }}
            animate={isMobile ? { opacity: 1, scale: 1, y: '-50%', x: '-50%' } : { opacity: 1, scale: 1 }}
            exit={isMobile ? { opacity: 0, scale: 0.9, y: '-50%', x: '-50%' } : { opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onMouseDown={!isMobile ? (e) => {
              // Only start dragging if clicking on the header
              if (e.target.closest('.notes-popup-header')) {
                setIsDragging(true);
                const rect = e.currentTarget.getBoundingClientRect();
                setDragOffset({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top
                });
              }
            } : undefined}
            onMouseMove={!isMobile ? (e) => {
              if (isDragging) {
                const newX = e.clientX - dragOffset.x;
                const newY = e.clientY - dragOffset.y;
                
                // Constrain to viewport
                const maxX = window.innerWidth - popupSize.width;
                const maxY = window.innerHeight - popupSize.height;
                
                setPopupPosition({
                  x: Math.max(0, Math.min(newX, maxX)),
                  y: Math.max(0, Math.min(newY, maxY))
                });
              } else if (isResizing) {
                const deltaX = e.clientX - resizeStart.x;
                const deltaY = e.clientY - resizeStart.y;
                
                const newWidth = Math.max(400, Math.min(window.innerWidth * 0.9, resizeStart.width + deltaX));
                const newHeight = Math.max(300, Math.min(window.innerHeight * 0.9, resizeStart.height + deltaY));
                
                setPopupSize({
                  width: newWidth,
                  height: newHeight
                });
                
                // Adjust position if popup goes out of bounds
                const maxX = window.innerWidth - newWidth;
                const maxY = window.innerHeight - newHeight;
                setPopupPosition(prev => ({
                  x: Math.min(prev.x, maxX),
                  y: Math.min(prev.y, maxY)
                }));
              }
            } : undefined}
            onMouseUp={!isMobile ? () => {
              setIsDragging(false);
              setIsResizing(false);
            } : undefined}
            onMouseLeave={!isMobile ? () => {
              setIsDragging(false);
              setIsResizing(false);
            } : undefined}
          >

            {/* Header - Draggable Area */}
            <div 
              className={`notes-popup-header flex items-center justify-between ${isMobile ? 'p-4' : 'p-4 sm:p-5'} border-b flex-shrink-0 ${isMobile ? '' : 'cursor-move'}`}
              style={{ 
                borderTopLeftRadius: isMobile ? '1.5rem' : '1rem', 
                borderTopRightRadius: isMobile ? '1.5rem' : '1rem',
                cursor: isMobile ? 'default' : (isDragging ? 'grabbing' : 'move'),
                userSelect: 'none',
                background: 'linear-gradient(135deg, #1E65AD 0%, #2E7CD6 50%, #CF9B63 100%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
              onMouseEnter={!isMobile ? (e) => {
                if (!isDragging) {
                  e.currentTarget.style.cursor = 'move';
                }
              } : undefined}
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm">
                  <StickyNote className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-white`} />
                </div>
                <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white`} style={{ 
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  letterSpacing: '0.01em'
                }}>
                  Notes
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {/* Size Control Buttons - Hide on Mobile */}
                {!isMobile && (
                <div className="flex items-center gap-1.5 border-r border-white border-opacity-30 pr-3 mr-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPopupSize(prev => ({
                        width: Math.max(450, prev.width - 50),
                        height: Math.max(400, prev.height - 50)
                      }));
                    }}
                    className="text-white hover:text-white transition-all p-1.5 rounded-lg hover:bg-opacity-30"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)'
                    }}
                    title="Make Smaller"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPopupSize(prev => ({
                        width: Math.min(window.innerWidth * 0.9, prev.width + 50),
                        height: Math.min(window.innerHeight * 0.9, prev.height + 50)
                      }));
                    }}
                    className="text-white hover:text-white transition-all p-1.5 rounded-lg hover:bg-opacity-30"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)'
                    }}
                    title="Make Bigger"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotesPopup(false);
                  }}
                  className={`text-white hover:text-white transition-all ${isMobile ? 'p-2' : 'p-1.5'} rounded-lg hover:bg-opacity-30 flex-shrink-0`}
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)'
                  }}
                  title="Close"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
                >
                  <svg className={`${isMobile ? 'w-5 h-5' : 'w-5 h-5'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Resize Handle - Bottom Right Corner - Only on desktop */}
            {!isMobile && (
              <div
                className="absolute bottom-0 right-0 w-6 h-6"
                style={{
                  background: 'linear-gradient(135deg, transparent 0%, transparent 50%, rgba(30, 101, 173, 0.3) 50%, rgba(30, 101, 173, 0.3) 100%)',
                  borderBottomRightRadius: '0.5rem',
                  cursor: isResizing ? 'nwse-resize' : 'nwse-resize'
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsResizing(true);
                  setResizeStart({
                    x: e.clientX,
                    y: e.clientY,
                    width: popupSize.width,
                    height: popupSize.height
                  });
                }}
                onMouseEnter={(e) => {
                  if (!isResizing) {
                    e.currentTarget.style.cursor = 'nwse-resize';
                  }
                }}
                title="Drag to resize"
              />
            )}

            {/* Folder Selector and Note Selector */}
            <div className={`border-b bg-gradient-to-r from-gray-50 to-gray-100 flex items-center ${isMobile ? 'px-3 py-3' : 'px-4 py-3'} flex-shrink-0`} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} gap-2 flex-1 min-w-0 w-full`}>
                {/* Folder Dropdown */}
                <select
                  value={activeFolderId || ''}
                  onChange={(e) => {
                    const folderId = e.target.value ? parseInt(e.target.value) : null;
                    setActiveFolderId(folderId);
                  }}
                  className={`${isMobile ? 'w-full px-3 py-2.5 text-sm' : 'px-4 py-2.5 text-sm'} rounded-lg font-medium border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer`}
                  style={{ 
                    fontFamily: 'Roboto, sans-serif',
                    minWidth: isMobile ? '100%' : '150px',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.75rem center',
                    paddingRight: isMobile ? '2.5rem' : '3rem',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <option value="">Unfiled</option>
                  {apiFolders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
                
                {/* Add New Folder Button */}
                {showNewFolderInput ? (
                  <div className={`flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}>
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyPress={async (e) => {
                        if (e.key === 'Enter' && newFolderName.trim()) {
                          try {
                            const response = await apiService.createFolder({ name: newFolderName.trim() });
                            if (response.success && response.data?.folder) {
                              const newFolder = response.data.folder;
                              setApiFolders([...apiFolders, newFolder]);
                              setActiveFolderId(newFolder.id);
                              setNewFolderName('');
                              setShowNewFolderInput(false);
                            }
                          } catch (error) {
                            console.error('Error creating folder:', error);
                            alert('Failed to create folder. Please try again.');
                          }
                        } else if (e.key === 'Escape') {
                          setShowNewFolderInput(false);
                          setNewFolderName('');
                        }
                      }}
                      placeholder="Folder name..."
                      className={`${isMobile ? 'flex-1 px-3 py-2.5 text-sm' : 'px-3 py-2 text-sm'} border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      style={{ 
                        fontFamily: 'Roboto, sans-serif',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
                      }}
                      autoFocus
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNewFolderInput(false);
                        setNewFolderName('');
                      }}
                      className="text-gray-500 hover:text-gray-700 transition-colors p-2 flex-shrink-0"
                      title="Cancel"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNewFolderInput(true);
                    }}
                    className={`${isMobile ? 'w-full px-4 py-2.5 text-sm' : 'px-4 py-2.5 text-sm'} text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all flex items-center justify-center gap-1.5 font-medium`}
                    style={{ 
                      fontFamily: 'Roboto, sans-serif',
                      whiteSpace: 'nowrap'
                    }}
                    title="Add new folder"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>New Folder</span>
                  </button>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col bg-gray-50" style={{ cursor: 'text', minHeight: 0 }}>
              <textarea
                value={notesContent}
                onChange={(e) => {
                  setNotesContent(e.target.value);
                }}
                placeholder="Write your notes here... Use markdown for formatting (e.g., # Heading, **bold**, *italic*)"
                className={`flex-1 w-full border-0 resize-none focus:outline-none focus:ring-0 ${isMobile ? 'p-4' : 'p-5'}`}
                style={{ 
                  fontFamily: 'Roboto, sans-serif',
                  minHeight: isMobile ? '250px' : '350px',
                  fontSize: isMobile ? '15px' : '15px',
                  lineHeight: '1.7',
                  color: '#1a1a1a',
                  cursor: 'text',
                  backgroundColor: '#ffffff',
                  backgroundImage: 'linear-gradient(to right, #f9fafb 1px, transparent 1px), linear-gradient(to bottom, #f9fafb 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  letterSpacing: '0.01em'
                }}
              />
            </div>

            {/* Footer */}
            <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-end'} gap-3 ${isMobile ? 'p-4' : 'p-5'} border-t bg-white`} style={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)', boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)' }}>
              <button
                onClick={() => {
                  setShowNotesPopup(false);
                }}
                className={`${isMobile ? 'w-full' : ''} px-5 py-2.5 border-2 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold ${isMobile ? 'text-sm' : 'text-sm'}`}
                style={{ 
                  fontFamily: 'Roboto, sans-serif', 
                  cursor: 'pointer',
                  borderColor: '#e5e7eb',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
                disabled={savingNote}
                onMouseEnter={(e) => {
                  if (!savingNote) {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!savingNote) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                  }
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!isUserAuthenticated) {
                    navigate('/login');
                    return;
                  }

                  const refInfo = getReferenceInfo();
                  if (!refInfo || !refInfo.reference_id) {
                    alert('Unable to determine reference information');
                    return;
                  }

                  if (!notesContent.trim()) {
                    alert('Please enter some content for the note');
                    return;
                  }

                  try {
                    setSavingNote(true);
                    
                    // Prepare reference_data
                    const referenceData = {
                      title: judgmentInfo?.title || judgmentInfo?.short_title || 'Untitled',
                      ...(location.state?.act ? {
                        ministry: judgmentInfo?.ministry || 'N/A',
                        department: judgmentInfo?.department || 'N/A',
                        year: judgmentInfo?.year || 'N/A'
                      } : {
                        court_name: judgmentInfo?.court_name || 'N/A',
                        judge: judgmentInfo?.judge || 'N/A',
                        decision_date: judgmentInfo?.decision_date || 'N/A'
                      })
                    };

                    const noteData = {
                      title: (judgmentInfo?.title || judgmentInfo?.short_title || 'Untitled Note').substring(0, 200),
                      content: notesContent,
                      reference_type: refInfo.reference_type,
                      reference_id: refInfo.reference_id,
                      reference_data: referenceData,
                      folder_id: activeFolderId || null,
                      tags: [] // Can be enhanced later
                    };

                    if (activeNoteId) {
                      // Update existing note
                      await apiService.updateNote(activeNoteId, noteData);
                    } else {
                      // Create new note
                      const response = await apiService.createNote(noteData);
                      if (response.success && response.data?.note) {
                        setActiveNoteId(response.data.note.id);
                      }
                    }

                    // Reload notes to update count
                    const notesResponse = await apiService.getNotesByReference(
                      refInfo.reference_type,
                      refInfo.reference_id
                    );
                    
                    // Handle different response formats
                    let updatedNotes = [];
                    if (notesResponse.success && notesResponse.data?.notes) {
                      updatedNotes = notesResponse.data.notes;
                    } else if (Array.isArray(notesResponse)) {
                      updatedNotes = notesResponse;
                    } else if (notesResponse.data && Array.isArray(notesResponse.data)) {
                      updatedNotes = notesResponse.data;
                    }
                    
                    setExistingNotes(updatedNotes);
                    setNotesCount(updatedNotes.length);
                    
                    // Update active note if we just created one
                    if (!activeNoteId && updatedNotes.length > 0) {
                      const newNote = updatedNotes.find(n => 
                        n.reference_type === refInfo.reference_type && 
                        n.reference_id === refInfo.reference_id
                      ) || updatedNotes[0];
                      setActiveNoteId(newNote.id);
                    }

                    setShowNotesPopup(false);
                  } catch (error) {
                    console.error('Error saving note:', error);
                    alert(`Failed to save note: ${error.message || 'Unknown error'}`);
                  } finally {
                    setSavingNote(false);
                  }
                }}
                className={`${isMobile ? 'w-full' : ''} px-6 py-2.5 text-white rounded-xl transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{ 
                  fontFamily: 'Roboto, sans-serif',
                  background: savingNote 
                    ? 'linear-gradient(90deg, #1E65AD 0%, #CF9B63 100%)'
                    : 'linear-gradient(135deg, #1E65AD 0%, #2E7CD6 50%, #CF9B63 100%)',
                  cursor: savingNote ? 'not-allowed' : 'pointer',
                  boxShadow: savingNote 
                    ? '0 2px 8px rgba(30, 101, 173, 0.3)'
                    : '0 4px 12px rgba(30, 101, 173, 0.4)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  if (!savingNote) {
                    e.target.style.background = 'linear-gradient(135deg, #1a5a9a 0%, #2563eb 50%, #b88a56 100%)';
                    e.target.style.boxShadow = '0 6px 16px rgba(30, 101, 173, 0.5)';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!savingNote) {
                    e.target.style.background = 'linear-gradient(135deg, #1E65AD 0%, #2E7CD6 50%, #CF9B63 100%)';
                    e.target.style.boxShadow = '0 4px 12px rgba(30, 101, 173, 0.4)';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
                disabled={savingNote}
              >
                {savingNote ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Notes'
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>

      {/* Icon Animation Styles */}
      <style>{`
        .animated-icon-button .icon {
          transition: fill 0.1s linear;
        }
        .animated-icon-button:focus .icon {
          fill: white;
        }
        .animated-icon-button:hover .icon {
          fill: transparent;
          animation:
            dasharray 1s linear forwards,
            filled 0.1s linear forwards 0.95s;
        }
        @keyframes dasharray {
          from {
            stroke-dasharray: 0 0 0 0;
          }
          to {
            stroke-dasharray: 68 68 0 0;
          }
        }
        @keyframes filled {
          to {
            fill: white;
          }
        }
      `}</style>

      {/* Summary Popup */}
      <SummaryPopup
        isOpen={summaryPopupOpen}
        onClose={() => {
          setSummaryPopupOpen(false);
        }}
        item={judgmentInfo}
        itemType="judgment"
      />
    </div>
  );
}

