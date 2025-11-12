import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Navbar from "../components/landing/Navbar";
import BookmarkButton from "../components/BookmarkButton";
import SummaryPopup from "../components/SummaryPopup";
import apiService from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { FileText, StickyNote, Share2, Download } from "lucide-react";
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
  const [notesCount, setNotesCount] = useState(0);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
  
  // Summary popup state
  const [summaryPopupOpen, setSummaryPopupOpen] = useState(false);

  // Get current language from cookie (Google Translate)
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

  // Translate text using Google Translate API
  const translateText = async (text, targetLang) => {
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

      const translatedChunks = await Promise.all(
        chunks.map(async (chunk, index) => {
          try {
            const response = await fetch(
              `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(chunk)}`,
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
            console.warn(`Translation chunk ${index + 1} failed:`, chunkError);
            return chunk; // Return original chunk on error
          }
        })
      );

      return translatedChunks.join(" ");
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
      // Get act or judgment data from location state
      const actData = location.state?.act;
      const judgmentData = location.state?.judgment;
     
      // If URL has ID but no judgment data in state, fetch by ID
      if (urlId && !judgmentData && !actData) {
        try {
          setLoading(true);
          setError("");
          console.log('📄 ViewPDF: Fetching judgment by ID from URL:', urlId);
          
          const response = await apiService.getJudgementById(urlId);
          
          // Handle different response structures
          let fetchedJudgment = response;
          if (Array.isArray(response)) {
            fetchedJudgment = response[0]; // Take first item if array
          } else if (response?.data) {
            fetchedJudgment = Array.isArray(response.data) ? response.data[0] : response.data;
          } else if (response?.judgment) {
            fetchedJudgment = response.judgment;
          }
          
          if (fetchedJudgment) {
            console.log('📄 ViewPDF: Fetched judgment data:', fetchedJudgment);
            setJudgmentInfo(fetchedJudgment);
            
            const originalPdfUrl = fetchedJudgment.pdf_link || fetchedJudgment.pdf_url || "";
            if (!originalPdfUrl || originalPdfUrl.trim() === "") {
              console.warn('⚠️ ViewPDF: No PDF URL found in judgment data');
              setError('PDF URL not available for this judgment');
            }
            
            setPdfUrl(originalPdfUrl);
            setTotalPages(25);
            setLoading(false);
          } else {
            throw new Error('Judgment not found');
          }
        } catch (err) {
          console.error('❌ ViewPDF: Error fetching judgment by ID:', err);
          setError(err.message || 'Failed to load judgment');
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

  // Fetch markdown content when markdown view is selected
  useEffect(() => {
    if (showMarkdown && judgmentInfo && !markdownContent && !loadingMarkdown) {
      const fetchMarkdown = async () => {
        setLoadingMarkdown(true);
        setMarkdownError("");
        try {
          const judgmentId = judgmentInfo.id || judgmentInfo.act_id;
          if (judgmentId) {
            const markdown = await apiService.getJudgementByIdMarkdown(judgmentId);
            setMarkdownContent(markdown);
    } else {
            setMarkdownError("No judgment ID available");
          }
        } catch (error) {
          console.error("Error fetching markdown:", error);
          setMarkdownError(error.message || "Failed to load Transalted content");
        } finally {
          setLoadingMarkdown(false);
        }
      };
      
      fetchMarkdown();
    }
  }, [showMarkdown, judgmentInfo, markdownContent, loadingMarkdown]);

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
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
        <Navbar />
        <div className="pt-16 sm:pt-20 flex justify-center items-center h-96 px-4">
          <div className="text-center max-w-md w-full">
            <div className="text-red-600 text-base sm:text-lg mb-3 sm:mb-4 font-semibold">Error loading PDF</div>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-5 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
              style={{ fontFamily: 'Roboto, sans-serif' }}
            >
              Go Back
            </button>
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
      <div className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6" style={{ height: 'calc(100vh - 80px)', overflow: 'hidden' }}>
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6 h-full" style={{ height: '100%' }}>
            {/* Details - Left Side - Static */}
            <div className="lg:col-span-1 order-1 lg:order-1 pt-3" style={{ height: '100%', overflow: 'hidden' }}>
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-2 sm:p-2 md:p-6 h-full overflow-y-auto" style={{ height: '100%', position: 'sticky', top: 0 }}>
                <div className="mb-3 sm:mb-4 md:mb-6">
                  <div className="flex flex-col grid grid-cols-2  sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-2 sm:mb-3">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold" style={{ color: '#1E65AD', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}>
                      {location.state?.act ? 'Act Details' : 'Judgment Details'}
                    </h3>
                    {judgmentInfo && (
                      <div className="flex items-center gap-2 justify-end self-start sm:self-auto relative">
                        <button
                          onClick={() => {
                            if (!isUserAuthenticated) {
                              navigate('/login');
                              return;
                            }
                            const url = window.location.href;
                            navigator.clipboard.writeText(url).then(() => {
                              alert('Link copied to clipboard!');
                            }).catch(() => {
                              alert('Failed to copy link');
                            });
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
                          title="Share"
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
                                  onClick={() => {
                                    // If user is not logged in, redirect to login page
                                    if (!isUserAuthenticated) {
                                      navigate('/login');
                                      setShowDownloadDropdown(false);
                                      return;
                                    }
                                    // If logged in, allow download
                                    if (pdfUrl) {
                                      const link = document.createElement('a');
                                      link.href = pdfUrl;
                                      link.download = `${judgmentInfo?.title || 'judgment'}_original.pdf`;
                                      link.target = '_blank';
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    } else {
                                      alert('Original PDF not available');
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
                                      
                                      let contentToDownload = markdownContent;
                                      
                                      // If markdown content is not loaded, fetch it
                                      if (!contentToDownload) {
                                        const judgmentId = judgmentInfo?.id || judgmentInfo?.cnr;
                                        if (judgmentId) {
                                          contentToDownload = await apiService.getJudgementByIdMarkdown(judgmentId);
                                          } else {
                                            alert('Translated PDF not available');
                                          setShowDownloadDropdown(false);
                                          return;
                                          }
                                      }

                                      if (!contentToDownload || contentToDownload.trim() === '') {
                                          alert('Translated PDF not available');
                                        setShowDownloadDropdown(false);
                                        return;
                                      }

                                      // Show loading message if translating
                                      if (currentLang !== 'en') {
                                        const loadingMsg = document.createElement('div');
                                        loadingMsg.id = 'pdf-translation-loading';
                                        loadingMsg.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#1E65AD;color:white;padding:20px 30px;border-radius:8px;z-index:10000;font-family:Roboto,sans-serif;box-shadow:0 4px 6px rgba(0,0,0,0.3);';
                                        loadingMsg.textContent = `Translating to ${langName}... Please wait.`;
                                        document.body.appendChild(loadingMsg);
                                      }

                                      // Translate content if language is not English
                                      let finalContent = contentToDownload;
                                      if (currentLang !== 'en') {
                                        // Clean markdown first before translating
                                        const cleanMarkdown = contentToDownload
                                          .replace(/#{1,6}\s+/g, '') // Remove markdown headers
                                          .replace(/\*\*\*(.*?)\*\*\*/g, '$1') // Remove bold italic
                                          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
                                          .replace(/\*(.*?)\*/g, '$1') // Remove italic
                                          .replace(/`(.*?)`/g, '$1') // Remove code
                                          .replace(/```[\s\S]*?```/g, '') // Remove code blocks
                                          .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links
                                          .trim();
                                        
                                        finalContent = await translateText(cleanMarkdown, currentLang);
                                        
                                        // Remove loading message
                                        const loadingMsg = document.getElementById('pdf-translation-loading');
                                        if (loadingMsg) {
                                          document.body.removeChild(loadingMsg);
                                        }
                                      } else {
                                        // Remove loading message if it exists
                                        const loadingMsg = document.getElementById('pdf-translation-loading');
                                        if (loadingMsg) {
                                          document.body.removeChild(loadingMsg);
                                        }
                                      }

                                      // Create a temporary HTML element to render the text with proper Unicode support
                                      const tempDiv = document.createElement('div');
                                      tempDiv.style.position = 'absolute';
                                      tempDiv.style.left = '-9999px';
                                      tempDiv.style.width = '210mm'; // A4 width
                                      tempDiv.style.padding = '20mm';
                                      tempDiv.style.fontSize = '12pt';
                                      tempDiv.style.lineHeight = '1.6';
                                      tempDiv.style.fontFamily = currentLang === 'en' 
                                        ? 'Arial, sans-serif' 
                                        : 'Noto Sans Devanagari, Noto Sans Gujarati, Arial Unicode MS, sans-serif';
                                      tempDiv.style.color = '#1a1a1a';
                                      tempDiv.style.backgroundColor = '#ffffff';
                                      tempDiv.style.whiteSpace = 'pre-wrap';
                                      tempDiv.style.wordWrap = 'break-word';
                                      
                                      // Set text content (preserve line breaks and Unicode characters)
                                      tempDiv.textContent = finalContent;
                                      
                                      document.body.appendChild(tempDiv);

                                      // Wait a moment for fonts to load
                                      await new Promise(resolve => setTimeout(resolve, 100));

                                      // Use html2canvas to capture the HTML as image (handles Unicode properly)
                                      const canvas = await html2canvas(tempDiv, {
                                        scale: 2,
                                        useCORS: true,
                                        logging: false,
                                        backgroundColor: '#ffffff',
                                        width: tempDiv.offsetWidth,
                                        height: tempDiv.scrollHeight,
                                        windowWidth: tempDiv.scrollWidth,
                                        windowHeight: tempDiv.scrollHeight
                                      });

                                      // Remove temporary element
                                      document.body.removeChild(tempDiv);

                                      // Create PDF and add the canvas image with proper page breaks
                                      const pdf = new jsPDF('p', 'mm', 'a4');
                                      const pageWidth = pdf.internal.pageSize.getWidth();
                                      const pageHeight = pdf.internal.pageSize.getHeight();
                                      const margin = 20; // mm
                                      const imgWidth = pageWidth;
                                      const imgHeight = (canvas.height * pageWidth) / canvas.width;
                                      
                                      // Get judgment link
                                      const judgmentId = judgmentInfo?.id || judgmentInfo?.cnr || urlId;
                                      const judgmentLink = judgmentId 
                                        ? `${window.location.origin}/judgment/${judgmentId}`
                                        : window.location.origin;
                                      
                                      // Function to add footer to a page
                                      const addFooter = (pdfInstance, pageNum, link) => {
                                        // Add footer line
                                        pdfInstance.setDrawColor(200, 200, 200);
                                        pdfInstance.setLineWidth(0.5);
                                        pdfInstance.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
                                        
                                        pdfInstance.setTextColor(100, 100, 100);
                                        pdfInstance.setFontSize(8);
                                        pdfInstance.setFont('helvetica', 'normal');
                                        
                                        // Footer text: salhakar.com (centered)
                                        const footerText = 'salhakar.com';
                                        const footerTextWidth = pdfInstance.getTextWidth(footerText);
                                        const footerX = (pageWidth - footerTextWidth) / 2;
                                        const footerY = pageHeight - 12;
                                        pdfInstance.text(footerText, footerX, footerY);
                                        
                                        // Page number (center)
                                        pdfInstance.setFontSize(7);
                                        pdfInstance.setTextColor(150, 150, 150);
                                        const pageText = `Page ${pageNum}`;
                                        const pageTextWidth = pdfInstance.getTextWidth(pageText);
                                        const pageX = (pageWidth - pageTextWidth) / 2;
                                        pdfInstance.text(pageText, pageX, footerY - 4);
                                        
                                        // Add judgment link (as clickable text on the right)
                                        if (link) {
                                          try {
                                            // Show the actual link URL
                                            const linkText = link.length > 40 ? link.substring(0, 40) + '...' : link;
                                            const linkTextWidth = pdfInstance.getTextWidth(linkText);
                                            const linkX = pageWidth - margin - linkTextWidth;
                                            const linkY = pageHeight - 12;
                                            
                                            // Add text first
                                            pdfInstance.setTextColor(26, 101, 173); // #1E65AD
                                            pdfInstance.setFontSize(7);
                                            pdfInstance.text(linkText, linkX, linkY);
                                            
                                            // Add clickable link annotation covering the text area
                                            pdfInstance.link(linkX, linkY - 3, linkTextWidth, 4, { url: link });
                                            
                                            pdfInstance.setFontSize(8); // Reset font size
                                            pdfInstance.setTextColor(100, 100, 100); // Reset color
                                          } catch (error) {
                                            console.warn('Could not add judgment link:', error);
                                            // Fallback: just show the link text
                                            const linkText = link.length > 40 ? link.substring(0, 40) + '...' : link;
                                            const linkTextWidth = pdfInstance.getTextWidth(linkText);
                                            const linkX = pageWidth - margin - linkTextWidth;
                                            const linkY = pageHeight - 12;
                                            pdfInstance.setTextColor(26, 101, 173);
                                            pdfInstance.setFontSize(7);
                                            pdfInstance.text(linkText, linkX, linkY);
                                            pdfInstance.setFontSize(8);
                                            pdfInstance.setTextColor(100, 100, 100);
                                          }
                                        }
                                      };
                                      
                                      let heightLeft = imgHeight;
                                      let position = 0;
                                      let pageNum = 1;

                                      // Add first page
                                      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
                                      heightLeft -= pageHeight;
                                      pageNum++;

                                      // Add additional pages if needed
                                      while (heightLeft >= 0) {
                                        position = heightLeft - imgHeight;
                                        pdf.addPage();
                                        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
                                        heightLeft -= pageHeight;
                                        pageNum++;
                                      }

                                      // Add footer only on the last page
                                      const lastPageNum = pdf.internal.getNumberOfPages();
                                      pdf.setPage(lastPageNum);
                                      addFooter(pdf, lastPageNum, judgmentLink);

                                      // Download PDF with language name in filename
                                      const baseFileName = (judgmentInfo?.title || 'judgment').replace(/[^a-z0-9]/gi, '_');
                                      const fileName = currentLang !== 'en' 
                                        ? `${baseFileName}_${langName}.pdf`
                                        : `${baseFileName}_translated.pdf`;
                                      pdf.save(fileName);
                                      
                                      } catch (error) {
                                        console.error('Error downloading translated PDF:', error);
                                      // Remove loading message if it exists
                                      const loadingMsg = document.getElementById('pdf-translation-loading');
                                      if (loadingMsg) {
                                        document.body.removeChild(loadingMsg);
                                      }
                                      alert('Failed to download translated PDF. Please try again.');
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
                    {/* View PDF Button - Mobile Only */}
                    {isMobile && (
                      <button
                        onClick={() => {
                          navigate('/mobile-pdf', {
                            state: {
                              pdfUrl: pdfUrl,
                              judgment: judgmentInfo,
                              act: location.state?.act ? judgmentInfo : null
                            }
                          });
                        }}
                        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View PDF
                      </button>
                    )}
                    <button
                      onClick={() => navigate(-1)}
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
            <div className="lg:col-span-2 order-2 lg:order-2 hidden lg:block" style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {/* Desktop View: Show PDF Viewer */}
              {!isMobile && (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col" style={{ height: '100%' }}>
                {/* PDF Toolbar - Search, Summary, Notes */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3 p-2 sm:p-2.5 md:p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                  {/* Search Bar */}
                  <div className="relative flex-1 min-w-[120px] sm:min-w-[200px]">
                    <img 
                      src="/uit3.GIF" 
                      alt="Search" 
                      className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 object-contain pointer-events-none z-10"
                    />
                    
                    <input
                      type="text"
                      placeholder="Search With Kiki AI..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 sm:pl-10 pr-2 sm:pr-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-xs sm:text-sm"
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
                  
                  {/* Action Buttons Container */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    {/* Summary Button with Animation */}
                    <style>{`
                      .summary-animated-button {
                        --h-button: 36px;
                        --w-button: 90px;
                        --round: 0.75rem;
                        cursor: pointer;
                        position: relative;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        overflow: hidden;
                        transition: all 0.25s ease;
                        background: radial-gradient(
                            65.28% 65.28% at 50% 100%,
                            rgba(207, 155, 99, 0.8) 0%,
                            rgba(207, 155, 99, 0) 100%
                          ),
                          linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%);
                        border-radius: var(--round);
                        border: none;
                        outline: none;
                        padding: 8px 14px;
                        font-family: 'Roboto', sans-serif;
                      }
                      .summary-animated-button::before,
                      .summary-animated-button::after {
                        content: "";
                        position: absolute;
                        inset: var(--space);
                        transition: all 0.5s ease-in-out;
                        border-radius: calc(var(--round) - var(--space));
                        z-index: 0;
                      }
                      .summary-animated-button::before {
                        --space: 1px;
                        background: linear-gradient(
                          177.95deg,
                          rgba(255, 255, 255, 0.19) 0%,
                          rgba(255, 255, 255, 0) 100%
                        );
                      }
                      .summary-animated-button::after {
                        --space: 2px;
                        background: radial-gradient(
                            65.28% 65.28% at 50% 100%,
                            rgba(207, 155, 99, 0.8) 0%,
                            rgba(207, 155, 99, 0) 100%
                          ),
                          linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%);
                      }
                      .summary-animated-button:active {
                        transform: scale(0.95);
                      }
                      .summary-points-wrapper {
                        overflow: hidden;
                        width: 100%;
                        height: 100%;
                        pointer-events: none;
                        position: absolute;
                        z-index: 1;
                      }
                      .summary-points-wrapper .summary-point {
                        bottom: -10px;
                        position: absolute;
                        animation: floating-points infinite ease-in-out;
                        pointer-events: none;
                        width: 2px;
                        height: 2px;
                        background-color: #fff;
                        border-radius: 9999px;
                      }
                      @keyframes floating-points {
                        0% {
                          transform: translateY(0);
                        }
                        85% {
                          opacity: 0;
                        }
                        100% {
                          transform: translateY(-55px);
                          opacity: 0;
                        }
                      }
                      .summary-points-wrapper .summary-point:nth-child(1) {
                        left: 10%;
                        opacity: 1;
                        animation-duration: 2.35s;
                        animation-delay: 0.2s;
                      }
                      .summary-points-wrapper .summary-point:nth-child(2) {
                        left: 30%;
                        opacity: 0.7;
                        animation-duration: 2.5s;
                        animation-delay: 0.5s;
                      }
                      .summary-points-wrapper .summary-point:nth-child(3) {
                        left: 25%;
                        opacity: 0.8;
                        animation-duration: 2.2s;
                        animation-delay: 0.1s;
                      }
                      .summary-points-wrapper .summary-point:nth-child(4) {
                        left: 44%;
                        opacity: 0.6;
                        animation-duration: 2.05s;
                      }
                      .summary-points-wrapper .summary-point:nth-child(5) {
                        left: 50%;
                        opacity: 1;
                        animation-duration: 1.9s;
                      }
                      .summary-points-wrapper .summary-point:nth-child(6) {
                        left: 75%;
                        opacity: 0.5;
                        animation-duration: 1.5s;
                        animation-delay: 1.5s;
                      }
                      .summary-points-wrapper .summary-point:nth-child(7) {
                        left: 88%;
                        opacity: 0.9;
                        animation-duration: 2.2s;
                        animation-delay: 0.2s;
                      }
                      .summary-points-wrapper .summary-point:nth-child(8) {
                        left: 58%;
                        opacity: 0.8;
                        animation-duration: 2.25s;
                        animation-delay: 0.2s;
                      }
                      .summary-points-wrapper .summary-point:nth-child(9) {
                        left: 98%;
                        opacity: 0.6;
                        animation-duration: 2.6s;
                        animation-delay: 0.1s;
                      }
                      .summary-points-wrapper .summary-point:nth-child(10) {
                        left: 65%;
                        opacity: 1;
                        animation-duration: 2.5s;
                        animation-delay: 0.2s;
                      }
                      .summary-inner {
                        z-index: 2;
                        gap: 6px;
                        position: relative;
                        width: 100%;
                        color: white;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                        font-weight: 500;
                        line-height: 1.5;
                        transition: color 0.2s ease-in-out;
                        font-family: 'Roboto', sans-serif;
                      }
                      .summary-inner svg.summary-icon {
                        width: 16px;
                        height: 16px;
                        transition: fill 0.1s linear;
                      }
                      .summary-animated-button:focus svg.summary-icon {
                        fill: white;
                      }
                      .summary-animated-button:hover svg.summary-icon {
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
                    <button
                      type="button"
                      className="summary-animated-button"
                      onClick={() => {
                        if (!isUserAuthenticated) {
                          navigate('/login');
                          return;
                        }
                        // Open summary popup
                        setSummaryPopupOpen(true);
                      }}
                      title="View Summary"
                    >
                      <div className="summary-points-wrapper">
                        <i className="summary-point"></i>
                        <i className="summary-point"></i>
                        <i className="summary-point"></i>
                        <i className="summary-point"></i>
                        <i className="summary-point"></i>
                        <i className="summary-point"></i>
                        <i className="summary-point"></i>
                        <i className="summary-point"></i>
                        <i className="summary-point"></i>
                        <i className="summary-point"></i>
                      </div>
                      <span className="summary-inner">
                        <svg
                          className="summary-icon"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                        >
                          <polyline points="13.18 1.37 13.18 9.64 21.45 9.64 10.82 22.63 10.82 14.36 2.55 14.36 13.18 1.37"></polyline>
                        </svg>
                        <span className="hidden sm:inline">Summary</span>
                      </span>
                    </button>
                    
                    {/* Notes Button - Fake when not logged in, Real when logged in */}
                    <style>{`
                      .notes-animated-button {
                        --h-button: 36px;
                        --w-button: 90px;
                        --round: 0.75rem;
                        cursor: pointer;
                        position: relative;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        overflow: hidden;
                        transition: all 0.25s ease;
                        background: radial-gradient(
                            65.28% 65.28% at 50% 100%,
                            rgba(207, 155, 99, 0.8) 0%,
                            rgba(207, 155, 99, 0) 100%
                          ),
                          linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%);
                        border-radius: var(--round);
                        border: none;
                        outline: none;
                        padding: 8px 14px;
                        font-family: 'Roboto', sans-serif;
                      }
                      .notes-animated-button::before,
                      .notes-animated-button::after {
                        content: "";
                        position: absolute;
                        inset: var(--space);
                        transition: all 0.5s ease-in-out;
                        border-radius: calc(var(--round) - var(--space));
                        z-index: 0;
                      }
                      .notes-animated-button::before {
                        --space: 1px;
                        background: linear-gradient(
                          177.95deg,
                          rgba(255, 255, 255, 0.19) 0%,
                          rgba(255, 255, 255, 0) 100%
                        );
                      }
                      .notes-animated-button::after {
                        --space: 2px;
                        background: radial-gradient(
                            65.28% 65.28% at 50% 100%,
                            rgba(207, 155, 99, 0.8) 0%,
                            rgba(207, 155, 99, 0) 100%
                          ),
                          linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%);
                      }
                      .notes-animated-button:active {
                        transform: scale(0.95);
                      }
                      .notes-points-wrapper {
                        overflow: hidden;
                        width: 100%;
                        height: 100%;
                        pointer-events: none;
                        position: absolute;
                        z-index: 1;
                      }
                      .notes-points-wrapper .notes-point {
                        bottom: -10px;
                        position: absolute;
                        animation: floating-points-notes infinite ease-in-out;
                        pointer-events: none;
                        width: 2px;
                        height: 2px;
                        background-color: #fff;
                        border-radius: 9999px;
                      }
                      @keyframes floating-points-notes {
                        0% {
                          transform: translateY(0);
                        }
                        85% {
                          opacity: 0;
                        }
                        100% {
                          transform: translateY(-55px);
                          opacity: 0;
                        }
                      }
                      .notes-points-wrapper .notes-point:nth-child(1) {
                        left: 10%;
                        opacity: 1;
                        animation-duration: 2.35s;
                        animation-delay: 0.2s;
                      }
                      .notes-points-wrapper .notes-point:nth-child(2) {
                        left: 30%;
                        opacity: 0.7;
                        animation-duration: 2.5s;
                        animation-delay: 0.5s;
                      }
                      .notes-points-wrapper .notes-point:nth-child(3) {
                        left: 25%;
                        opacity: 0.8;
                        animation-duration: 2.2s;
                        animation-delay: 0.1s;
                      }
                      .notes-points-wrapper .notes-point:nth-child(4) {
                        left: 44%;
                        opacity: 0.6;
                        animation-duration: 2.05s;
                      }
                      .notes-points-wrapper .notes-point:nth-child(5) {
                        left: 50%;
                        opacity: 1;
                        animation-duration: 1.9s;
                      }
                      .notes-points-wrapper .notes-point:nth-child(6) {
                        left: 75%;
                        opacity: 0.5;
                        animation-duration: 1.5s;
                        animation-delay: 1.5s;
                      }
                      .notes-points-wrapper .notes-point:nth-child(7) {
                        left: 88%;
                        opacity: 0.9;
                        animation-duration: 2.2s;
                        animation-delay: 0.2s;
                      }
                      .notes-points-wrapper .notes-point:nth-child(8) {
                        left: 58%;
                        opacity: 0.8;
                        animation-duration: 2.25s;
                        animation-delay: 0.2s;
                      }
                      .notes-points-wrapper .notes-point:nth-child(9) {
                        left: 98%;
                        opacity: 0.6;
                        animation-duration: 2.6s;
                        animation-delay: 0.1s;
                      }
                      .notes-points-wrapper .notes-point:nth-child(10) {
                        left: 65%;
                        opacity: 1;
                        animation-duration: 2.5s;
                        animation-delay: 0.2s;
                      }
                      .notes-inner {
                        z-index: 2;
                        gap: 6px;
                        position: relative;
                        width: 100%;
                        color: white;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                        font-weight: 500;
                        line-height: 1.5;
                        transition: color 0.2s ease-in-out;
                        font-family: 'Roboto', sans-serif;
                      }
                      .notes-inner svg.notes-icon {
                        width: 16px;
                        height: 16px;
                        transition: fill 0.1s linear;
                      }
                      .notes-animated-button:focus svg.notes-icon {
                        fill: white;
                      }
                      .notes-animated-button:hover svg.notes-icon {
                        fill: transparent;
                        animation:
                          dasharray-notes 1s linear forwards,
                          filled-notes 0.1s linear forwards 0.95s;
                      }
                      @keyframes dasharray-notes {
                        from {
                          stroke-dasharray: 0 0 0 0;
                        }
                        to {
                          stroke-dasharray: 68 68 0 0;
                        }
                      }
                      @keyframes filled-notes {
                        to {
                          fill: white;
                        }
                      }
                    `}</style>
                    {isUserAuthenticated ? (
                      // Real Notes Button (when logged in)
                      <button
                        type="button"
                        className="notes-animated-button"
                        onClick={() => {
                          // If we have existing notes, load the first one
                          if (existingNotes.length > 0 && !activeNoteId) {
                            const firstNote = existingNotes[0];
                            setActiveNoteId(firstNote.id);
                            setNotesContent(firstNote.content || '');
                            setActiveFolderId(firstNote.folder_id || null);
                          } else if (existingNotes.length === 0) {
                            // Initialize with default content for new note
                            const refInfo = getReferenceInfo();
                            if (refInfo) {
                              const initialContent = `# ${judgmentInfo?.title || judgmentInfo?.short_title || 'Untitled Note'}\n\n${judgmentInfo?.summary || 'No summary available.'}\n\n## Details\n\n${location.state?.act ? 'Ministry' : 'Court'}: ${location.state?.act ? (judgmentInfo?.ministry || 'N/A') : (judgmentInfo?.court_name || 'N/A')}\nDate: ${judgmentInfo?.decision_date || judgmentInfo?.year || 'N/A'}`;
                              setNotesContent(initialContent);
                              setActiveNoteId(null);
                              setActiveFolderId(null);
                            }
                          }
                          
                          setShowNotesPopup(true);
                        }}
                        title="Add Notes"
                      >
                        <div className="notes-points-wrapper">
                          <i className="notes-point"></i>
                          <i className="notes-point"></i>
                          <i className="notes-point"></i>
                          <i className="notes-point"></i>
                          <i className="notes-point"></i>
                          <i className="notes-point"></i>
                          <i className="notes-point"></i>
                          <i className="notes-point"></i>
                          <i className="notes-point"></i>
                          <i className="notes-point"></i>
                        </div>
                        <span className="notes-inner">
                          <StickyNote className="notes-icon" style={{ width: '16px', height: '16px' }} />
                          <span className="hidden sm:inline">Notes</span>
                        </span>
                        {notesCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center z-10">
                            {notesCount}
                          </span>
                        )}
                      </button>
                    ) : (
                      // Fake Notes Button (when not logged in - navigates to login)
                      <button
                        type="button"
                        className="notes-animated-button"
                        onClick={() => {
                          navigate('/login');
                        }}
                        title="Login to Add Notes"
                      >
                        <div className="notes-points-wrapper">
                          <i className="notes-point"></i>
                          <i className="notes-point"></i>
                          <i className="notes-point"></i>
                          <i className="notes-point"></i>
                          <i className="notes-point"></i>
                          <i className="notes-point"></i>
                          <i className="notes-point"></i>
                          <i className="notes-point"></i>
                          <i className="notes-point"></i>
                          <i className="notes-point"></i>
                        </div>
                        <span className="notes-inner">
                          <StickyNote className="notes-icon" style={{ width: '16px', height: '16px' }} />
                          <span className="hidden sm:inline">Notes</span>
                        </span>
                      </button>
                    )}
                    
                    {/* PDF/Markdown Toggle Button */}
                    <div className="relative inline-flex items-center bg-gray-100 rounded-xl p-1 shadow-inner">
                      {/* Sliding background indicator */}
                      <motion.div
                        className="absolute top-1 bottom-1 rounded-lg z-0"
                        initial={false}
                        animate={{
                          left: !showMarkdown ? '4px' : 'calc(50% + 2px)',
                          backgroundColor: !showMarkdown ? '#1E65AD' : '#CF9B63',
                        }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 300, 
                          damping: 30 
                        }}
                        style={{
                          width: 'calc(50% - 4px)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        }}
                      />
                      
                      <motion.button
                        onClick={() => {
                          // If user is not logged in, redirect to login page
                          if (!isUserAuthenticated) {
                            navigate('/login');
                            return;
                          }
                          // If logged in, allow switching to Original view
                          setShowMarkdown(false);
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 rounded-lg font-semibold transition-all duration-300 relative z-10 min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm ${
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
                        className={`px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 rounded-lg font-semibold transition-all duration-300 relative z-10 min-w-[100px] sm:min-w-[120px] text-xs sm:text-sm ${
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
                  <div className="relative h-full w-full" style={{ minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
                    {/* Desktop View: Show PDF in iframe */}
                    <>
                      {/* PDF Embed - Try iframe first, fallback to button */}
                      <div className="w-full h-full flex-1" style={{ minHeight: 0, position: 'relative' }}>
                        <iframe
                            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&page=${currentPage}&zoom=page-fit&view=FitH`}
                          className="absolute inset-0 w-full h-full border-0 rounded-lg"
                          title={location.state?.act ? 'Act PDF' : 'Judgment PDF'}
                          style={{ 
                            width: '100%', 
                            height: '100%',
                            display: 'block'
                          }}
                          allow="fullscreen"
                          scrolling="auto"
                          onLoad={() => {
                            setLoading(false);
                          }}
                          onError={() => {
                            // If iframe fails, show the button fallback
                            setError("PDF cannot be embedded due to security restrictions");
                          }}
                        />
                      </div>
                        
                        {/* Fallback PDF Access - Show when iframe fails */}
                        {error && (
                      <div className="absolute inset-0 bg-white flex items-center justify-center p-3 sm:p-4 md:p-8">
                        <div className="text-center max-w-md w-full px-2">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 mx-auto mb-3 sm:mb-4 md:mb-6 rounded-full bg-gradient-to-br flex items-center justify-center" 
                               style={{ background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)' }}>
                            <svg className="w-7 h-7 sm:w-8 sm:h-8 md:w-12 md:h-12" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <h3 className="text-base sm:text-lg md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 px-2" style={{ color: '#1E65AD', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}>
                            {location.state?.act ? 'Act PDF Document' : 'Judgment PDF Document'}
                          </h3>
                          <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4 md:mb-6 px-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            The PDF cannot be embedded due to security restrictions. Click the button below to view the {location.state?.act ? 'act' : 'judgment'} PDF document in a new tab.
                          </p>
                          <div className="space-y-2 sm:space-y-3 px-2">
                            <button
                              onClick={() => window.open(pdfUrl, '_blank')}
                              className="w-full px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm md:text-base"
                              style={{ fontFamily: 'Roboto, sans-serif' }}
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Open PDF Document
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    </>

                    {/* Loading Overlay - Only show on desktop */}
                    {loading && (
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
                       <h3 className="text-sm sm:text-base md:text-lg font-bold mb-1 sm:mb-2 px-2" style={{ color: '#1E65AD', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}>
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
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Draggable Notes Popup */}
      {showNotesPopup && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setShowNotesPopup(false)}
          />
          
          {/* Draggable Popup */}
          <div
            className="fixed bg-white rounded-lg shadow-2xl z-50 flex flex-col"
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
              width: `${popupSize.width}px`,
              height: `${popupSize.height}px`,
              minWidth: '400px',
              minHeight: '300px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              fontFamily: 'Roboto, sans-serif',
              userSelect: isDragging || isResizing ? 'none' : 'auto'
            }}
            onMouseDown={(e) => {
              // Only start dragging if clicking on the header
              if (e.target.closest('.notes-popup-header')) {
                setIsDragging(true);
                const rect = e.currentTarget.getBoundingClientRect();
                setDragOffset({
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top
                });
              }
            }}
            onMouseMove={(e) => {
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
            }}
            onMouseUp={() => {
              setIsDragging(false);
              setIsResizing(false);
            }}
            onMouseLeave={() => {
              setIsDragging(false);
              setIsResizing(false);
            }}
          >
            {/* Header - Draggable Area */}
            <div 
              className="notes-popup-header flex items-center justify-between p-4 border-b border-gray-200"
              style={{ 
                borderTopLeftRadius: '0.5rem', 
                borderTopRightRadius: '0.5rem',
                cursor: isDragging ? 'grabbing' : 'move',
                userSelect: 'none',
                background: 'linear-gradient(90deg, #1E65AD 0%, #CF9B63 100%)'
              }}
              onMouseEnter={(e) => {
                if (!isDragging) {
                  e.currentTarget.style.cursor = 'move';
                }
              }}
            >
              <div className="flex items-center gap-2">
                <StickyNote className="h-5 w-5 text-white" />
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}>
                  Notes
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {/* Size Control Buttons */}
                <div className="flex items-center gap-1 border-r border-white border-opacity-30 pr-2 mr-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPopupSize(prev => ({
                        width: Math.max(400, prev.width - 50),
                        height: Math.max(300, prev.height - 50)
                      }));
                    }}
                    className="text-white hover:text-gray-200 transition-colors p-1 rounded hover:bg-opacity-20"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.25rem',
                      cursor: 'pointer'
                    }}
                    title="Make Smaller"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
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
                    className="text-white hover:text-gray-200 transition-colors p-1 rounded hover:bg-opacity-20"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '0.25rem',
                      cursor: 'pointer'
                    }}
                    title="Make Bigger"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNotesPopup(false);
                  }}
                  className="text-white hover:text-gray-200 transition-colors p-1 rounded hover:bg-opacity-20 flex-shrink-0"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.25rem',
                    cursor: 'pointer'
                  }}
                  title="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Resize Handle - Bottom Right Corner */}
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

            {/* Folder Selector and Note Selector */}
            <div className="border-b border-gray-200 bg-gray-50 flex items-center gap-1 px-2 py-1 overflow-x-auto">
              <div className="flex items-center gap-1 flex-1 min-w-0">
                {/* Folder Dropdown */}
                <select
                  value={activeFolderId || ''}
                  onChange={(e) => {
                    const folderId = e.target.value ? parseInt(e.target.value) : null;
                    setActiveFolderId(folderId);
                  }}
                  className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
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
                  <div className="flex items-center gap-1 px-2">
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
                      className="px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      style={{ fontFamily: 'Roboto, sans-serif', minWidth: '120px' }}
                      autoFocus
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowNewFolderInput(false);
                        setNewFolderName('');
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all flex items-center gap-1"
                    title="Add new folder"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">New Folder</span>
                  </button>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col" style={{ cursor: 'text' }}>
              <textarea
                value={notesContent}
                onChange={(e) => {
                  setNotesContent(e.target.value);
                }}
                placeholder="Write your notes here..."
                className="flex-1 w-full p-4 border-0 resize-none focus:outline-none focus:ring-0"
                style={{ 
                  fontFamily: 'Roboto, sans-serif',
                  minHeight: '300px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#1E65AD',
                  cursor: 'text'
                }}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowNotesPopup(false);
                }}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
                style={{ fontFamily: 'Roboto, sans-serif', cursor: 'pointer' }}
                disabled={savingNote}
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
                className="px-4 py-2 text-white rounded-lg transition-all font-medium text-sm shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  fontFamily: 'Roboto, sans-serif',
                  background: 'linear-gradient(90deg, #1E65AD 0%, #CF9B63 100%)',
                  cursor: savingNote ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!savingNote) {
                    e.target.style.background = 'linear-gradient(90deg, #1a5a9a 0%, #b88a56 100%)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!savingNote) {
                    e.target.style.background = 'linear-gradient(90deg, #1E65AD 0%, #CF9B63 100%)';
                  }
                }}
                disabled={savingNote}
              >
                {savingNote ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </>
      )}

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
