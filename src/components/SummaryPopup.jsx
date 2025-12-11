import React, { useState, useEffect } from "react";
import { X, FileText, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import apiService from "../services/api";
import SummaryFeedbackButton from "./SummaryFeedbackButton";

const SummaryPopup = ({ isOpen, onClose, item, itemType }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && item) {
      fetchSummary();
    } else {
      // Reset state when popup closes
      setSummary("");
      setError("");
    }
  }, [isOpen, item]);

  const fetchSummary = async () => {
    if (!item) return;

    setLoading(true);
    setError("");
    setSummary("");

    try {
      let summaryText = "";

      // Get summary based on item type
      if (itemType === "judgment") {
        // For judgments, use the backend summary endpoint (Gemini-powered)
        if (item.id) {
          try {
            const summaryResponse = await apiService.getJudgementSummary(item.id, {
              format: 'markdown'
            });
            
            if (summaryResponse && summaryResponse.success && summaryResponse.summary) {
              summaryText = summaryResponse.summary;
            } else {
              // Fallback: try to get summary from the item
              summaryText = item.summary || item.description || "";
            }
          } catch (err) {
            console.warn("Could not fetch summary from backend:", err);
            // Fallback: try to get summary from the item
            summaryText = item.summary || item.description || "";
            
            // If still no summary, try to fetch markdown and extract summary
            if (!summaryText) {
              try {
                // Determine if it's a Supreme Court judgment
                const courtName = item?.court_name || item?.court || '';
                const isSupremeCourt = courtName && (
                  courtName.toLowerCase().includes('supreme') || 
                  courtName.toLowerCase().includes('sc') ||
                  courtName.toLowerCase() === 'supreme court of india'
                );
                
                // Use appropriate endpoint based on court type
                let markdown;
                if (isSupremeCourt) {
                  markdown = await apiService.getSupremeCourtJudgementByIdMarkdown(item.id);
                } else {
                  markdown = await apiService.getJudgementByIdMarkdown(item.id);
                }
                
                // Extract first few paragraphs as summary
                const paragraphs = markdown.split("\n\n").filter(p => p.trim().length > 50);
                summaryText = paragraphs.slice(0, 3).join("\n\n");
              } catch (markdownErr) {
                console.warn("Could not fetch markdown for summary:", markdownErr);
              }
            }
          }
        } else {
          // No ID available, use item summary if available
          summaryText = item.summary || item.description || "";
        }
      } else if (itemType === "act") {
        // For acts, use description or summary field
        summaryText = item.summary || item.description || item.long_title || "";
      } else if (itemType === "mapping") {
        // For mappings, try to generate AI summary first
        if (item.id) {
          // Determine mapping_type from item
          let mappingType = item.mapping_type;
          
          // If mapping_type not directly available, infer from reference type
          if (!mappingType) {
            // Check for mapping type indicators
            if (item.ipc_section || item.bns_section) {
              mappingType = 'bns_ipc';
            } else if (item.iea_section || item.bsa_section) {
              mappingType = 'bsa_iea';
            } else if (item.crpc_section || item.bnss_section) {
              mappingType = 'bnss_crpc';
            } else {
              // Default fallback
              mappingType = 'bns_ipc';
            }
          }
          
          if (mappingType) {
            try {
              const summaryResponse = await apiService.generateLawMappingSummary(
                item.id,
                mappingType,
                {
                  focus: "key differences and practical implications",
                  max_chars_per_chunk: 15000
                }
              );
              
              if (summaryResponse && summaryResponse.success && summaryResponse.summary) {
                summaryText = summaryResponse.summary;
              } else {
                // Fallback: use existing summary or description
                summaryText = item.summary || item.description || item.source_description || "";
              }
            } catch (err) {
              console.warn("Could not generate AI summary for mapping:", err);
              // Fallback: use existing summary or description
              summaryText = item.summary || item.description || item.source_description || "";
            }
          } else {
            // No mapping_type available, use existing summary or description
            summaryText = item.summary || item.description || item.source_description || "";
          }
        } else {
          // No ID available, use existing summary or description
          summaryText = item.summary || item.description || item.source_description || "";
        }
      }

      if (!summaryText || summaryText.trim() === "") {
        setError("Summary not available for this item.");
      } else {
        setSummary(summaryText);
      }
    } catch (err) {
      console.error("Error fetching summary:", err);
      setError(err.message || "Failed to load summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getItemTitle = () => {
    if (itemType === "judgment") {
      return item.title || item.case_info || item.case_title || item.case_number || "Judgment";
    } else if (itemType === "act") {
      return item.short_title || item.long_title || "Act";
    } else if (itemType === "mapping") {
      return item.subject || item.title || "Mapping";
    }
    return "Item";
  };

  // Map itemType to API reference_type
  const getReferenceType = () => {
    if (itemType === "judgment") {
      return "judgement";
    } else if (itemType === "act") {
      // Determine if central or state act
      return item.act_type === "state_act" ? "state_act" : "central_act";
    } else if (itemType === "mapping") {
      // Determine mapping type
      if (item.mapping_type) {
        if (item.mapping_type === "bns_ipc") return "bns_ipc";
        if (item.mapping_type === "bsa_iea") return "bsa_iea";
        if (item.mapping_type === "bnss_crpc") return "bnss_crpc";
      }
      // Fallback: check for section fields
      if (item.ipc_section || item.bns_section) return "bns_ipc";
      if (item.iea_section || item.bsa_section) return "bsa_iea";
      if (item.crpc_section || item.bnss_section) return "bnss_crpc";
      return "bns_ipc"; // Default
    }
    return null;
  };

  const getReferenceId = () => {
    return item?.id || null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pt-0 sm:pt-20"
          onClick={onClose}
        >
          {/* Backdrop with better blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-md"
          />

          {/* Popup - Modern Design - Medium Size */}
          <motion.div
            initial={{ opacity: 0, y: '100%', scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: '100%', scale: 0.95 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="relative z-10 bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-2xl w-full h-[85vh] sm:h-auto sm:max-h-[75vh] overflow-hidden flex flex-col border border-gray-100"
            style={{ 
              minHeight: '85vh',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Handle - Modern */}
            <div className="sm:hidden flex justify-center pt-3 pb-2">
              <div className="w-16 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* Header - Modern Gradient Design */}
            <div
              className="px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between flex-shrink-0 relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1E65AD 0%, #2C7FC7 50%, #CF9B63 100%)",
              }}
            >
              {/* Decorative Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24"></div>
              </div>
              
              <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0 relative z-10">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white bg-opacity-25 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg border border-white border-opacity-30">
                  <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2
                    className="text-xl sm:text-3xl font-bold text-white mb-1 sm:mb-2"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                  >
                    Summary
                  </h2>
                  <p className="text-sm sm:text-base text-white text-opacity-95 truncate font-medium" style={{ fontFamily: "'Heebo', sans-serif" }}>
                    {getItemTitle()}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 sm:p-3 rounded-xl hover:bg-white hover:bg-opacity-20 transition-all duration-200 flex-shrink-0 ml-3 sm:ml-4 relative z-10 group"
                aria-label="Close popup"
                style={{ backdropFilter: 'blur(10px)' }}
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>

            {/* Content - Modern Scrollable Area */}
            <div 
              className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-gradient-to-b from-gray-50 to-white"
              style={{ 
                minHeight: 0,
                maxHeight: 'calc(85vh - 140px)',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
                scrollbarColor: '#CBD5E0 #F3F4F6'
              }}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 animate-spin mb-4 sm:mb-6" />
                    <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-100 rounded-full"></div>
                  </div>
                  <p className="text-base sm:text-lg text-gray-700 font-medium" style={{ fontFamily: "'Heebo', sans-serif" }}>
                    Loading summary...
                  </p>
                  <p className="text-sm text-gray-500 mt-2" style={{ fontFamily: "'Heebo', sans-serif" }}>
                    Please wait while we generate your summary
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-50 flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                    <X className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
                  </div>
                  <p className="text-base sm:text-lg text-red-600 text-center px-4 sm:px-6 font-semibold mb-2" style={{ fontFamily: "'Heebo', sans-serif" }}>
                    {error}
                  </p>
                  <p className="text-sm text-gray-500 text-center px-4" style={{ fontFamily: "'Heebo', sans-serif" }}>
                    Please try again later
                  </p>
                </div>
              ) : summary ? (
                <div
                  className="max-w-none"
                  style={{ 
                    fontFamily: "'Heebo', sans-serif", 
                    color: "#1a1a1a",
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                >
                  {/* Summary Content Card */}
                  <div 
                    className="bg-white rounded-2xl p-5 sm:p-7 md:p-8 shadow-sm border border-gray-100"
                    style={{
                      lineHeight: '1.8'
                    }}
                  >
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="text-base sm:text-lg mb-4 sm:mb-6 text-gray-700" style={{ 
                            lineHeight: '1.9',
                            wordWrap: 'break-word'
                          }}>
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="ml-5 sm:ml-6 mb-4 sm:mb-6 mt-4 sm:mt-5 pl-2 space-y-2" style={{ 
                            listStyleType: 'disc',
                            listStylePosition: 'outside'
                          }}>
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="ml-5 sm:ml-6 mb-4 sm:mb-6 mt-4 sm:mt-5 pl-2 space-y-2" style={{ 
                            listStyleType: 'decimal',
                            listStylePosition: 'outside'
                          }}>
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-base sm:text-lg mb-2 text-gray-700" style={{ 
                            lineHeight: '1.8',
                            paddingLeft: '0.5rem'
                          }}>
                            {children}
                          </li>
                        ),
                        strong: ({ children }) => (
                          <strong className="text-base sm:text-lg font-bold" style={{ 
                            color: '#1E65AD',
                            fontWeight: 700
                          }}>
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="text-base sm:text-lg italic text-gray-600">
                            {children}
                          </em>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-2xl sm:text-3xl mb-4 sm:mb-5 mt-6 sm:mt-8 font-bold" style={{ 
                            color: '#1E65AD',
                            fontFamily: "'Bricolage Grotesque', sans-serif"
                          }}>
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xl sm:text-2xl mb-3 sm:mb-4 mt-5 sm:mt-6 font-bold" style={{ 
                            color: '#1E65AD',
                            fontFamily: "'Bricolage Grotesque', sans-serif"
                          }}>
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-lg sm:text-xl mb-2 sm:mb-3 mt-4 sm:mt-5 font-semibold" style={{ 
                            color: '#1E65AD',
                            fontFamily: "'Bricolage Grotesque', sans-serif"
                          }}>
                            {children}
                          </h3>
                        ),
                      }}
                    >
                      {summary}
                    </ReactMarkdown>
                  </div>
                  
                  {/* Feedback Buttons - Modern Design */}
                  {getReferenceType() && getReferenceId() && (
                    <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                      <div className="bg-gray-50 rounded-xl p-4 sm:p-5">
                    <SummaryFeedbackButton
                      referenceType={getReferenceType()}
                      referenceId={getReferenceId()}
                          summaryText={summary}
                    />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 sm:py-20">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-4 sm:mb-6">
                    <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 text-center px-4 sm:px-6 font-medium" style={{ fontFamily: "'Heebo', sans-serif" }}>
                    No summary available for this item.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SummaryPopup;

