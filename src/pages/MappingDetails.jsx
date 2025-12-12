import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/landing/Navbar";
import apiService from "../services/api";
import BookmarkButton from "../components/BookmarkButton";
import SummaryPopup from "../components/SummaryPopup";
import { useAuth } from "../contexts/AuthContext";
import { StickyNote, Share2 } from "lucide-react";

export default function MappingDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Additional check to ensure token exists - memoized to update when token changes
  const isUserAuthenticated = useMemo(() => {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token');
    const hasValidToken = !!token && token !== 'null' && token !== 'undefined';
    return isAuthenticated && hasValidToken;
  }, [isAuthenticated]);
  
  const [mapping, setMapping] = useState(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotesPopup, setShowNotesPopup] = useState(false);
  const [notesContent, setNotesContent] = useState("");
  const [notesFolders, setNotesFolders] = useState([{ id: 'default', name: 'Default', content: '' }]);
  const [activeFolderId, setActiveFolderId] = useState('default');
  const [notesCount, setNotesCount] = useState(0);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [popupPosition, setPopupPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [popupSize, setPopupSize] = useState({ width: 500, height: 400 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Summary popup state
  const [summaryPopupOpen, setSummaryPopupOpen] = useState(false);
  

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
    // Get mapping data from location state
    if (location.state?.mapping) {
      setMapping(location.state.mapping);
      setLoading(false);
    } else {
      // If no mapping data, redirect back to law-mapping page with type from URL
      const searchParams = new URLSearchParams(location.search);
      const typeParam = searchParams.get('type');
      const redirectUrl = typeParam ? `/law-mapping?type=${typeParam}` : '/law-mapping';
      navigate(redirectUrl);
    }
  }, [location.state, location.search, navigate]);


  // Determine reference type from mapping
  const getReferenceType = () => {
    if (!mapping) return 'bns_ipc_mapping';
    if (mapping.mapping_type) {
      if (mapping.mapping_type === 'bns_ipc') return 'bns_ipc_mapping';
      if (mapping.mapping_type === 'bsa_iea') return 'bsa_iea_mapping';
      if (mapping.mapping_type === 'bnss_crpc') return 'bnss_crpc_mapping';
    }
    // Fallback logic
    if (mapping.ipc_section || mapping.bns_section) return 'bns_ipc_mapping';
    if (mapping.iea_section || mapping.bsa_section) return 'bsa_iea_mapping';
    if (mapping.crpc_section || mapping.bnss_section) return 'bnss_crpc_mapping';
    return 'bns_ipc_mapping';
  };

  // Load saved notes from API when mapping changes
  useEffect(() => {
    const loadNotes = async () => {
      if (!mapping || !mapping.id || !isUserAuthenticated) return;

      try {
        const referenceType = getReferenceType();
        
        // Fetch notes from API
        const response = await apiService.getNotesByReference(referenceType, mapping.id);
        
        if (response.success && response.data && response.data.notes) {
          const notes = response.data.notes;
          if (notes.length > 0) {
            // Convert API notes to folder format
            const folders = notes.map((note, index) => ({
              id: note.id || `note-${index}`,
              name: note.title || `Note ${index + 1}`,
              content: note.content || '',
              noteId: note.id // Store note ID for updates
            }));
            
            setNotesFolders(folders);
            setActiveFolderId(folders[0].id);
            setNotesContent(folders[0].content || '');
            setNotesCount(notes.length);
          } else {
            // No notes found, initialize with default folder using mapping title
            const defaultName = mapping?.subject || mapping?.title || 'Untitled Note';
            setNotesFolders([{ id: 'default', name: defaultName, content: '' }]);
            setActiveFolderId('default');
            setNotesContent('');
            setNotesCount(0);
          }
        }
      } catch (error) {
        console.error('Error loading notes from API:', error);
        // Fallback to localStorage if API fails
        const notesKey = `notes_mapping_${mapping.id}`;
        const savedNotes = localStorage.getItem(notesKey);
        if (savedNotes) {
          try {
            const parsedFolders = JSON.parse(savedNotes);
            if (parsedFolders && Array.isArray(parsedFolders) && parsedFolders.length > 0) {
              setNotesFolders(parsedFolders);
              setActiveFolderId(parsedFolders[0].id);
              setNotesContent(parsedFolders[0].content || '');
            }
          } catch (parseError) {
            console.error('Error parsing saved notes:', parseError);
          }
        }
      }
    };

    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapping?.id, isUserAuthenticated]);

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

  // Determine mapping type from the mapping data (for display purposes)
  const getMappingType = () => {
    if (!mapping) return 'bns_ipc'; // default if mapping not loaded yet
    if (mapping.mapping_type) {
      return mapping.mapping_type;
    }
    // Try to determine from section fields
    if (mapping.ipc_section || mapping.bns_section) return 'bns_ipc';
    if (mapping.iea_section || mapping.bsa_section) return 'bsa_iea';
    if (mapping.crpc_section || mapping.bnss_section) return 'bnss_crpc';
    return 'bns_ipc'; // default
  };


  const goBack = () => {
    // Navigate back to law-mapping page with the correct mapping type
    // First try to get from location.state, then from URL, then from mapping data
    const mappingTypeFromState = location.state?.mappingType;
    const searchParams = new URLSearchParams(location.search);
    const mappingTypeFromUrl = searchParams.get('type');
    const mappingType = mappingTypeFromState || mappingTypeFromUrl || (mapping ? getMappingType() : 'bns_ipc');
    
    navigate(`/law-mapping?type=${mappingType}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-500">Loading mapping details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-500 text-lg">{error}</p>
            <button
              onClick={goBack}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!mapping) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-gray-500 text-lg">No mapping data available</p>
            <button
              onClick={goBack}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use the getMappingType function defined earlier, but only if mapping exists
  const mappingType = mapping ? getMappingType() : 'bns_ipc';

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

  // Get labels and colors based on mapping type
  const getMappingInfo = () => {
    if (mappingType === 'bns_ipc') {
      return {
        title: 'IPC ↔ BNS Mapping',
        sourceLabel: 'IPC Section',
        targetLabel: 'BNS Section',
        sourceAct: 'Indian Penal Code, 1860',
        targetAct: 'Bharatiya Nyaya Sanhita, 2023',
        sourceColor: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
        targetColor: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' }
      };
    } else if (mappingType === 'bsa_iea') {
      return {
        title: 'IEA ↔ BSA Mapping',
        sourceLabel: 'IEA Section',
        targetLabel: 'BSA Section',
        sourceAct: 'Indian Evidence Act, 1872',
        targetAct: 'Bharatiya Sakshya Adhiniyam, 2023',
        sourceColor: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
        targetColor: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' }
      };
    } else {
      return {
        title: 'CrPC ↔ BNSS Mapping',
        sourceLabel: 'CrPC Section',
        targetLabel: 'BNSS Section',
        sourceAct: 'Code of Criminal Procedure, 1973',
        targetAct: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
        sourceColor: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
        targetColor: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200' }
      };
    }
  };

  const mappingInfo = getMappingInfo();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
      <Navbar />
      <div className="pt-14 sm:pt-16 md:pt-20">
        <div className="flex-1 p-3 sm:p-4 md:p-5 lg:p-6" style={{ minHeight: 'calc(100vh - 80px)' }}>
          <div className="max-w-7xl mx-auto h-full">
            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              
              {/* Header Section - Improved Mobile Layout */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-5 md:p-6">
                <div className="flex flex-col gap-3 sm:gap-4">
                  {/* Title and Action Buttons Row */}
                  <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold break-words mb-2" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        {mappingInfo.title}
                      </h1>
                      <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r mt-2" style={{ background: 'linear-gradient(90deg, #1E65AD 0%, #CF9B63 100%)' }}></div>
                    </div>
                      {mapping && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                          onClick={async () => {
                            try {
                              const mappingId = mapping?.id || mapping?.mapping_id || '';
                              const shareUrl = mappingId 
                                ? `${window.location.origin}/mapping-details?id=${mappingId}`
                                : window.location.href;
                              const shareTitle = mappingInfo?.title || mapping?.title || 'Legal Mapping';
                              const shareText = `Check out this legal mapping: ${shareTitle}`;
                              
                              const shareData = {
                                title: shareTitle,
                                text: shareText,
                                url: shareUrl
                              };

                              if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                                await navigator.share(shareData);
                              } else {
                                await navigator.clipboard.writeText(shareUrl);
                                alert('Link copied to clipboard!');
                              }
                            } catch (err) {
                              if (err.name !== 'AbortError') {
                                const mappingId = mapping?.id || mapping?.mapping_id || '';
                                const shareUrl = mappingId 
                                  ? `${window.location.origin}/mapping-details?id=${mappingId}`
                                  : window.location.href;
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
                          className="p-2 sm:p-2.5 rounded-lg transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
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
                          title="Share mapping"
                          >
                            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#FFFFFF' }} />
                          </button>
                          <BookmarkButton
                            item={mapping}
                            type={
                              mappingType === 'bns_ipc' ? 'bns_ipc_mapping' : 
                              mappingType === 'bsa_iea' ? 'bsa_iea_mapping' : 
                              mappingType === 'bnss_crpc' ? 'bnss_crpc_mapping' : 
                              'bns_ipc_mapping'
                            }
                            size="small"
                            showText={false}
                          />
                        </div>
                      )}
                    </div>
                  
                  {/* Back Button - Full Width on Mobile */}
                  <button
                    onClick={goBack}
                    className="w-full sm:w-auto sm:ml-auto px-4 sm:px-5 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm sm:text-base shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Mappings
                  </button>
                </div>
              </div>

              {/* Toolbar - Search, Summary, Notes - Improved Mobile Layout */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  {/* Search Bar */}
                  <div className="relative flex-1 w-full">
                    <img 
                      src="/uit3.GIF" 
                      alt="Search" 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 object-contain pointer-events-none z-10"
                    />
                    <input
                      type="text"
                      placeholder="Search With Kiki AI..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 sm:pl-14 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          // Redirect to chatbot with question
                          const question = searchQuery.trim();
                          navigate('/legal-chatbot', {
                            state: {
                              initialQuestion: question
                            }
                          });
                        }
                      }}
                    />
                  </div>
                  
                  {/* Action Buttons Container - Improved Mobile Layout */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full sm:w-auto">
                    {/* Summary Button */}
                    <button
                      type="button"
                      className="animated-icon-button flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg text-white font-medium text-sm sm:text-base transition-colors hover:opacity-90 shadow-md hover:shadow-lg"
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
                        className="icon w-4 h-4 sm:w-5 sm:h-5"
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
                        className="animated-icon-button flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg text-white font-medium text-sm sm:text-base transition-colors hover:opacity-90 relative shadow-md hover:shadow-lg"
                        style={{ 
                          backgroundColor: '#1E65AD',
                          fontFamily: 'Roboto, sans-serif'
                        }}
                        onClick={() => {
                          const notesKey = `notes_mapping_${mapping?.id || 'default'}`;
                          const savedNotes = localStorage.getItem(notesKey);
                          if (!savedNotes) {
                            // Initialize with mapping title as folder name if no folders exist
                            if (notesFolders.length === 0 || (notesFolders.length === 1 && notesFolders[0].id === 'default' && notesFolders[0].content === '')) {
                              const defaultName = mapping?.subject || mapping?.title || 'Untitled Note';
                              setNotesFolders([{ id: 'default', name: defaultName, content: '' }]);
                              setActiveFolderId('default');
                              setNotesContent('');
                            }
                          } else {
                            const currentFolder = notesFolders.find(f => f.id === activeFolderId);
                            // Remove title (lines starting with #) from content
                            const content = currentFolder?.content || '';
                            const lines = content.split('\n');
                            const contentWithoutTitle = lines.filter(line => !line.trim().startsWith('#')).join('\n').trim();
                            setNotesContent(contentWithoutTitle);
                          }
                          setShowNotesPopup(true);
                        }}
                        title="Add Notes"
                      >
                        <svg
                          className="icon w-4 h-4 sm:w-5 sm:h-5"
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
                          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] px-1.5 flex items-center justify-center z-20 shadow-lg" style={{ fontSize: notesCount > 9 ? '10px' : '12px', lineHeight: '1' }}>
                            {notesCount > 99 ? '99+' : notesCount}
                          </span>
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="animated-icon-button flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg text-white font-medium text-sm sm:text-base transition-colors hover:opacity-90 shadow-md hover:shadow-lg"
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
                          className="icon w-4 h-4 sm:w-5 sm:h-5"
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
                </div>
              </div>

              {/* Main Content - Two Column Layout - Improved Mobile */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                
                {/* Source Section Card */}
                <div className={`${mappingInfo.sourceColor.bg} rounded-xl sm:rounded-2xl shadow-lg border-2 ${mappingInfo.sourceColor.border} p-3 sm:p-5 md:p-6 lg:p-8`}>
                  <div className="text-center mb-3 sm:mb-5 md:mb-6">
                    <h3 className="text-xs sm:text-base md:text-lg lg:text-xl font-semibold mb-2 sm:mb-3" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      {mappingInfo.sourceLabel}
                    </h3>
                    {sourceSection && (
                      <div className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold ${mappingInfo.sourceColor.text} mb-2 sm:mb-4`}>
                        {sourceSection}
                      </div>
                    )}
                    <div className="text-[10px] sm:text-sm md:text-base text-gray-700 font-medium leading-tight" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {mappingInfo.sourceAct}
                    </div>
                  </div>
                  
                  {/* Source Section Details */}
                  {mapping.ipc_description && (
                    <div className="mt-2 sm:mt-4 md:mt-5 pt-2 sm:pt-4 md:pt-5 border-t-2 border-gray-300">
                      <h4 className="text-xs sm:text-sm md:text-base font-semibold mb-1 sm:mb-2 md:mb-3 text-gray-800">Section Description</h4>
                      <p className="text-[10px] sm:text-sm md:text-base text-gray-700 leading-relaxed line-clamp-3 sm:line-clamp-none" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {mapping.ipc_description}
                      </p>
                    </div>
                  )}
                  {mapping.iea_description && (
                    <div className="mt-2 sm:mt-4 md:mt-5 pt-2 sm:pt-4 md:pt-5 border-t-2 border-gray-300">
                      <h4 className="text-xs sm:text-sm md:text-base font-semibold mb-1 sm:mb-2 md:mb-3 text-gray-800">Section Description</h4>
                      <p className="text-[10px] sm:text-sm md:text-base text-gray-700 leading-relaxed line-clamp-3 sm:line-clamp-none" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {mapping.iea_description}
                      </p>
                    </div>
                  )}
                  {mapping.crpc_description && (
                    <div className="mt-2 sm:mt-4 md:mt-5 pt-2 sm:pt-4 md:pt-5 border-t-2 border-gray-300">
                      <h4 className="text-xs sm:text-sm md:text-base font-semibold mb-1 sm:mb-2 md:mb-3 text-gray-800">Section Description</h4>
                      <p className="text-[10px] sm:text-sm md:text-base text-gray-700 leading-relaxed line-clamp-3 sm:line-clamp-none" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {mapping.crpc_description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Target Section Card */}
                <div className={`${mappingInfo.targetColor.bg} rounded-xl sm:rounded-2xl shadow-lg border-2 ${mappingInfo.targetColor.border} p-3 sm:p-5 md:p-6 lg:p-8`}>
                  <div className="text-center mb-3 sm:mb-5 md:mb-6">
                    <h3 className="text-xs sm:text-base md:text-lg lg:text-xl font-semibold mb-2 sm:mb-3" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      {mappingInfo.targetLabel}
                    </h3>
                    {targetSection && (
                      <div className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold ${mappingInfo.targetColor.text} mb-2 sm:mb-4`}>
                        {targetSection}
                      </div>
                    )}
                    <div className="text-[10px] sm:text-sm md:text-base text-gray-700 font-medium leading-tight" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {mappingInfo.targetAct}
                    </div>
                  </div>
                  
                  {/* Target Section Details */}
                  {mapping.bns_description && (
                    <div className="mt-2 sm:mt-4 md:mt-5 pt-2 sm:pt-4 md:pt-5 border-t-2 border-gray-300">
                      <h4 className="text-xs sm:text-sm md:text-base font-semibold mb-1 sm:mb-2 md:mb-3 text-gray-800">Section Description</h4>
                      <p className="text-[10px] sm:text-sm md:text-base text-gray-700 leading-relaxed line-clamp-3 sm:line-clamp-none" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {mapping.bns_description}
                      </p>
                    </div>
                  )}
                  {mapping.bsa_description && (
                    <div className="mt-2 sm:mt-4 md:mt-5 pt-2 sm:pt-4 md:pt-5 border-t-2 border-gray-300">
                      <h4 className="text-xs sm:text-sm md:text-base font-semibold mb-1 sm:mb-2 md:mb-3 text-gray-800">Section Description</h4>
                      <p className="text-[10px] sm:text-sm md:text-base text-gray-700 leading-relaxed line-clamp-3 sm:line-clamp-none" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {mapping.bsa_description}
                      </p>
                    </div>
                  )}
                  {mapping.bnss_description && (
                    <div className="mt-2 sm:mt-4 md:mt-5 pt-2 sm:pt-4 md:pt-5 border-t-2 border-gray-300">
                      <h4 className="text-xs sm:text-sm md:text-base font-semibold mb-1 sm:mb-2 md:mb-3 text-gray-800">Section Description</h4>
                      <p className="text-[10px] sm:text-sm md:text-base text-gray-700 leading-relaxed line-clamp-3 sm:line-clamp-none" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {mapping.bnss_description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Subject and Summary Section - Improved Mobile */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-5 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-5 break-words" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  Subject: {subject}
                </h3>
                {summary && (
                  <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t-2 border-gray-200">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-3" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Description
                    </h4>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {summary}
                    </p>
                  </div>
                )}
              </div>

              {/* All Mapping Data Section - Shows all fields from API - Improved Mobile */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-5 sm:p-6 md:p-8">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-5 sm:mb-6" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  Complete Mapping Information
                </h3>
                
                {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
                  {/* Left Column - Source Details */}
                  {/* <div className="space-y-4"> */}
                    {/* <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      Source Section Details
                    </h4> */}
                    
                    {/* IPC Section Fields */}
                    {/* {mapping.ipc_section && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">IPC Section Number</h5>
                        <p className="text-sm text-gray-900 font-medium">{mapping.ipc_section}</p>
                      </div>
                    )}
                    {mapping.ipc_description && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">IPC Description</h5>
                        <p className="text-sm text-gray-600 leading-relaxed">{mapping.ipc_description}</p>
                      </div>
                    )} */}
                    
                    {/* IEA Section Fields */}
                    {/* {mapping.iea_section && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">IEA Section Number</h5>
                        <p className="text-sm text-gray-900 font-medium">{mapping.iea_section}</p>
                      </div>
                    )}
                    {mapping.iea_description && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">IEA Description</h5>
                        <p className="text-sm text-gray-600 leading-relaxed">{mapping.iea_description}</p>
                      </div>
                    )} */}
                    
                    {/* CrPC Section Fields */}
                    {/* {mapping.crpc_section && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">CrPC Section Number</h5>
                        <p className="text-sm text-gray-900 font-medium">{mapping.crpc_section}</p>
                      </div>
                    )}
                    {mapping.crpc_description && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">CrPC Description</h5>
                        <p className="text-sm text-gray-600 leading-relaxed">{mapping.crpc_description}</p>
                      </div>
                    )} */}
                    
                    {/* Generic Source Fields */}
                    {/* {mapping.source_section && !mapping.ipc_section && !mapping.iea_section && !mapping.crpc_section && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">Source Section</h5>
                        <p className="text-sm text-gray-900 font-medium">{mapping.source_section}</p>
                      </div>
                    )}
                    {mapping.source_description && !mapping.ipc_description && !mapping.iea_description && !mapping.crpc_description && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">Source Description</h5>
                        <p className="text-sm text-gray-600 leading-relaxed">{mapping.source_description}</p>
                      </div>
                    )} */}
                  {/* </div> */}

                  {/* Right Column - Target Details */}
                  {/* <div className="space-y-4"> */}
                    {/* <h4 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      Target Section Details
                    </h4> */}
                    
                    {/* BNS Section Fields */}
                    {/* {mapping.bns_section && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">BNS Section Number</h5>
                        <p className="text-sm text-gray-900 font-medium">{mapping.bns_section}</p>
                      </div>
                    )}
                    {mapping.bns_description && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">BNS Description</h5>
                        <p className="text-sm text-gray-600 leading-relaxed">{mapping.bns_description}</p>
                      </div>
                    )} */}
                    
                    {/* BSA Section Fields */}
                    {/* {mapping.bsa_section && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">BSA Section Number</h5>
                        <p className="text-sm text-gray-900 font-medium">{mapping.bsa_section}</p>
                      </div>
                    )}
                    {mapping.bsa_description && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">BSA Description</h5>
                        <p className="text-sm text-gray-600 leading-relaxed">{mapping.bsa_description}</p>
                      </div>
                    )} */}
                    
                    {/* BNSS Section Fields */}
                    {/* {mapping.bnss_section && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">BNSS Section Number</h5>
                        <p className="text-sm text-gray-900 font-medium">{mapping.bnss_section}</p>
                      </div>
                    )}
                    {mapping.bnss_description && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">BNSS Description</h5>
                        <p className="text-sm text-gray-600 leading-relaxed">{mapping.bnss_description}</p>
                      </div>
                    )} */}
                    
                    {/* Generic Target Fields */}
                    {/* {mapping.target_section && !mapping.bns_section && !mapping.bsa_section && !mapping.bnss_section && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">Target Section</h5>
                        <p className="text-sm text-gray-900 font-medium">{mapping.target_section}</p>
                      </div>
                    )}
                    {mapping.target_description && !mapping.bns_description && !mapping.bsa_description && !mapping.bnss_description && (
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 mb-1">Target Description</h5>
                        <p className="text-sm text-gray-600 leading-relaxed">{mapping.target_description}</p>
                      </div>
                    )} */}
                  {/* </div> */}
                {/* </div> */}

                {/* Additional Fields Section */}
                <div>
                  {/* <h4 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    Additional Information
                  </h4> */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {mapping.mapping_type && (
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <h5 className="text-sm sm:text-base font-semibold text-gray-700 mb-2">Mapping Type</h5>
                        <p className="text-sm sm:text-base text-gray-600">{mapping.mapping_type}</p>
                      </div>
                    )}
                    {mapping.title && mapping.title !== subject && (
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <h5 className="text-sm sm:text-base font-semibold text-gray-700 mb-2">Title</h5>
                        <p className="text-sm sm:text-base text-gray-600 break-words">{mapping.title}</p>
                      </div>
                    )}
                    {mapping.description && mapping.description !== summary && (
                      <div className="sm:col-span-2 bg-gray-50 rounded-lg p-3 sm:p-4">
                        <h5 className="text-sm sm:text-base font-semibold text-gray-700 mb-2">Description</h5>
                        <p className="text-sm sm:text-base text-gray-600 break-words leading-relaxed">{mapping.description}</p>
                      </div>
                    )}
                    {mapping.notes && (
                      <div className="sm:col-span-2 bg-gray-50 rounded-lg p-3 sm:p-4">
                        <h5 className="text-sm sm:text-base font-semibold text-gray-700 mb-2">Notes</h5>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-words">{mapping.notes}</p>
                      </div>
                    )}
                    {mapping.comments && (
                      <div className="sm:col-span-2 bg-gray-50 rounded-lg p-3 sm:p-4">
                        <h5 className="text-sm sm:text-base font-semibold text-gray-700 mb-2">Comments</h5>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-words">{mapping.comments}</p>
                      </div>
                    )}
                    {mapping.remarks && (
                      <div className="sm:col-span-2 bg-gray-50 rounded-lg p-3 sm:p-4">
                        <h5 className="text-sm sm:text-base font-semibold text-gray-700 mb-2">Remarks</h5>
                        <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-words">{mapping.remarks}</p>
                      </div>
                    )}
                    {mapping.created_at && (
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <h5 className="text-sm sm:text-base font-semibold text-gray-700 mb-2">Created At</h5>
                        <p className="text-sm sm:text-base text-gray-600">{new Date(mapping.created_at).toLocaleString()}</p>
                      </div>
                    )}
                    {mapping.updated_at && (
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <h5 className="text-sm sm:text-base font-semibold text-gray-700 mb-2">Updated At</h5>
                        <p className="text-sm sm:text-base text-gray-600">{new Date(mapping.updated_at).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Display any other fields that might exist in the API response */}
                  {Object.keys(mapping).filter(key => 
                    !['id', 'subject', 'summary', 'title', 'description', 'mapping_type',
                      'ipc_section', 'bns_section', 'iea_section', 'bsa_section', 'crpc_section', 'bnss_section',
                      'ipc_description', 'bns_description', 'iea_description', 'bsa_description', 'crpc_description', 'bnss_description',
                      'source_section', 'target_section', 'source_description', 'target_description',
                      'notes', 'comments', 'remarks', 'created_at', 'updated_at'].includes(key)
                    && mapping[key] !== null && mapping[key] !== undefined && mapping[key] !== ''
                  ).length > 0 && (
                    <div >
                      <h4 className="text-lg font-semibold text-gray-800 mb-4" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        Acts Details 
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        {Object.keys(mapping)
                          .filter(key => 
                            !['id', 'subject', 'summary', 'title', 'description', 'mapping_type',
                              'ipc_section', 'bns_section', 'iea_section', 'bsa_section', 'crpc_section', 'bnss_section',
                              'ipc_description', 'bns_description', 'iea_description', 'bsa_description', 'crpc_description', 'bnss_description',
                              'source_section', 'target_section', 'source_description', 'target_description',
                              'notes', 'comments', 'remarks', 'created_at', 'updated_at', 'highlights'].includes(key)
                            && mapping[key] !== null && mapping[key] !== undefined && mapping[key] !== ''
                          )
                          .map(key => (
                            <div key={key}>
                              <h5 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 capitalize">
                                {key.replace(/_/g, ' ')}
                              </h5>
                              <p className="text-xs sm:text-sm text-gray-600 break-words">
                                {typeof mapping[key] === 'object' ? JSON.stringify(mapping[key], null, 2) : String(mapping[key])}
                              </p>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - Improved Mobile */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-5 sm:p-6">
                  <button
                    onClick={goBack}
                  className="w-full sm:w-auto sm:ml-auto px-6 sm:px-8 py-3 sm:py-3.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium text-sm sm:text-base shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Mappings
                  </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Draggable Notes Popup - Improved Mobile */}
      <AnimatePresence>
      {showNotesPopup && (
        <>
          {/* Backdrop */}
            <motion.div 
            className="fixed inset-0 bg-black bg-opacity-30 z-40"
            onClick={() => setShowNotesPopup(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
          />
          
            {/* Popup - Centered modal on mobile, draggable on desktop */}
            <motion.div
            className={`fixed bg-white shadow-2xl z-50 flex flex-col ${isMobile ? 'rounded-3xl' : 'rounded-lg'}`}
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
              minWidth: '400px',
              minHeight: '300px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              fontFamily: 'Roboto, sans-serif',
              userSelect: (isDragging || isResizing) ? 'none' : 'auto'
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
                {/* Size Control Buttons - Desktop only */}
                {!isMobile && (
                  <div className="flex items-center gap-1.5 border-r border-white border-opacity-30 pr-3 mr-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPopupSize(prev => ({
                        width: Math.max(400, prev.width - 50),
                        height: Math.max(300, prev.height - 50)
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

            {/* Folder Selector - Dropdown Style */}
            <div className={`border-b bg-gradient-to-r from-gray-50 to-gray-100 flex items-center ${isMobile ? 'px-3 py-3' : 'px-4 py-3'} flex-shrink-0`} style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
              <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} gap-2 flex-1 min-w-0 w-full`}>
                {/* Folder Dropdown */}
                <select
                  value={activeFolderId || ''}
                  onChange={(e) => {
                      e.stopPropagation();
                    const folderId = e.target.value || null;
                      // Save current folder content before switching
                      setNotesFolders(prev => prev.map(f => 
                        f.id === activeFolderId ? { ...f, content: notesContent } : f
                      ));
                      // Switch to new folder
                    if (folderId) {
                      setActiveFolderId(folderId);
                      const selectedFolder = notesFolders.find(f => f.id === folderId);
                      setNotesContent(selectedFolder?.content || '');
                    } else {
                      setActiveFolderId('default');
                      const defaultFolder = notesFolders.find(f => f.id === 'default');
                      setNotesContent(defaultFolder?.content || '');
                    }
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
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">Unfiled</option>
                  {notesFolders.map((folder) => (
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
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newFolderName.trim()) {
                          const newFolder = {
                            id: `folder-${Date.now()}`,
                            name: newFolderName.trim(),
                            content: ''
                          };
                          setNotesFolders([...notesFolders, newFolder]);
                          setActiveFolderId(newFolder.id);
                          setNotesContent('');
                          setNewFolderName('');
                          setShowNewFolderInput(false);
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
                      onClick={(e) => e.stopPropagation()}
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

            {/* Content Area - Improved Mobile */}
            <div className="flex-1 overflow-hidden flex flex-col bg-gray-50" style={{ cursor: 'text', minHeight: 0 }}>
              <textarea
                value={notesContent}
                onChange={(e) => {
                  setNotesContent(e.target.value);
                  // Update folder content in real-time
                  setNotesFolders(prev => prev.map(f => 
                    f.id === activeFolderId ? { ...f, content: e.target.value } : f
                  ));
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
            <div className={`flex ${isMobile ? 'flex-col' : 'items-center justify-end'} gap-3 ${isMobile ? 'p-4' : 'p-5'} border-t bg-white flex-shrink-0`} style={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)', boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)' }}>
              {saveMessage && (
                <div className={`flex-1 ${isMobile ? 'w-full mb-2' : ''} px-4 py-2.5 rounded-lg text-sm font-medium ${
                  saveMessage.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`} style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {saveMessage.text}
                </div>
              )}
              <button
                onClick={() => {
                  // Save current folder content before closing
                  setNotesFolders(prev => prev.map(f => 
                    f.id === activeFolderId ? { ...f, content: notesContent } : f
                  ));
                  setShowNotesPopup(false);
                }}
                className={`${isMobile ? 'w-full' : ''} px-5 py-2.5 border-2 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold ${isMobile ? 'text-sm' : 'text-sm'}`}
                style={{ 
                  fontFamily: 'Roboto, sans-serif', 
                  cursor: 'pointer',
                  borderColor: '#e5e7eb',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
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

                  if (!notesContent.trim()) {
                    setSaveMessage({ type: 'error', text: 'Please enter some notes before saving.' });
                    setTimeout(() => setSaveMessage(null), 3000);
                    return;
                  }

                  setIsSaving(true);
                  setSaveMessage(null);

                  try {
                    const referenceType = getReferenceType();
                    
                    // Extract title from content (first line starting with #) or use mapping title
                    const titleMatch = notesContent.match(/^#\s+(.+)$/m);
                    const title = titleMatch ? titleMatch[1] : (mapping?.subject || mapping?.title || 'Untitled Note');
                    
                    // Get current folder to check if it has a noteId (existing note)
                    const currentFolder = notesFolders.find(f => f.id === activeFolderId);
                    const noteId = currentFolder?.noteId;

                    if (noteId) {
                      // Update existing note
                      const updateData = {
                        title: title,
                        content: notesContent
                      };
                      const response = await apiService.updateNote(noteId, updateData);
                      
                      if (response.success) {
                        // Update local state
                        setNotesFolders(prev => prev.map(f => 
                          f.id === activeFolderId ? { ...f, content: notesContent, name: title } : f
                        ));
                        // Reload notes to update count
                        const updatedResponse = await apiService.getNotesByReference(referenceType, mapping.id);
                        if (updatedResponse.success && updatedResponse.data && updatedResponse.data.notes) {
                          setNotesCount(updatedResponse.data.notes.length);
                        }
                        setSaveMessage({ type: 'success', text: 'Note updated successfully!' });
                        setTimeout(() => {
                          setSaveMessage(null);
                          setShowNotesPopup(false);
                        }, 1500);
                      } else {
                        setSaveMessage({ type: 'error', text: 'Failed to update note. Please try again.' });
                        setTimeout(() => setSaveMessage(null), 3000);
                      }
                    } else {
                      // Create new note
                      const noteData = {
                        title: title,
                        content: notesContent,
                        referenceType: referenceType,
                        referenceId: mapping.id,
                        referenceData: {
                          mapping_type: mapping.mapping_type,
                          subject: mapping.subject,
                          title: mapping.title,
                          ipc_section: mapping.ipc_section,
                          bns_section: mapping.bns_section,
                          iea_section: mapping.iea_section,
                          bsa_section: mapping.bsa_section,
                          crpc_section: mapping.crpc_section,
                          bnss_section: mapping.bnss_section
                        }
                      };

                      const response = await apiService.createNoteFromDocument(noteData);
                      
                      if (response.success && response.data && response.data.note) {
                        // Update local state with new note ID
                        const newNoteId = response.data.note.id;
                        setNotesFolders(prev => prev.map(f => 
                          f.id === activeFolderId 
                            ? { ...f, content: notesContent, name: title, noteId: newNoteId, id: newNoteId } 
                            : f
                        ));
                        // Reload notes to update count
                        const updatedResponse = await apiService.getNotesByReference(referenceType, mapping.id);
                        if (updatedResponse.success && updatedResponse.data && updatedResponse.data.notes) {
                          setNotesCount(updatedResponse.data.notes.length);
                        }
                        setSaveMessage({ type: 'success', text: 'Note saved successfully!' });
                        setTimeout(() => {
                          setSaveMessage(null);
                          setShowNotesPopup(false);
                        }, 1500);
                      } else {
                        setSaveMessage({ type: 'error', text: 'Failed to save note. Please try again.' });
                        setTimeout(() => setSaveMessage(null), 3000);
                      }
                    }
                  } catch (error) {
                    console.error('Error saving note:', error);
                    setSaveMessage({ type: 'error', text: 'An error occurred while saving the note. Please try again.' });
                    setTimeout(() => setSaveMessage(null), 3000);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
                className={`${isMobile ? 'w-full' : ''} px-6 py-2.5 text-white rounded-xl transition-all font-semibold ${isMobile ? 'text-sm' : 'text-sm'} ${
                  isSaving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                }`}
                style={{ 
                  fontFamily: 'Roboto, sans-serif',
                  background: isSaving 
                    ? 'linear-gradient(90deg, #1E65AD 0%, #CF9B63 100%)'
                    : 'linear-gradient(135deg, #1E65AD 0%, #2E7CD6 50%, #CF9B63 100%)',
                  boxShadow: isSaving 
                    ? '0 2px 8px rgba(30, 101, 173, 0.3)'
                    : '0 4px 12px rgba(30, 101, 173, 0.4)',
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  if (!isSaving) {
                    e.target.style.background = 'linear-gradient(135deg, #1a5a9a 0%, #2563eb 50%, #b88a56 100%)';
                    e.target.style.boxShadow = '0 6px 16px rgba(30, 101, 173, 0.5)';
                    e.target.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSaving) {
                    e.target.style.background = 'linear-gradient(135deg, #1E65AD 0%, #2E7CD6 50%, #CF9B63 100%)';
                    e.target.style.boxShadow = '0 4px 12px rgba(30, 101, 173, 0.4)';
                    e.target.style.transform = 'translateY(0)';
                  }
                }}
              >
                {isSaving ? (
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

      {/* Summary Popup */}
      <SummaryPopup
        isOpen={summaryPopupOpen}
        onClose={() => {
          setSummaryPopupOpen(false);
        }}
        item={mapping ? {
          ...mapping,
          // Ensure mapping_type is set correctly for API call
          mapping_type: mapping.mapping_type || getReferenceType().replace('_mapping', '') // Convert 'bns_ipc_mapping' to 'bns_ipc'
        } : null}
        itemType="mapping"
      />


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

    </div>
  );
}

