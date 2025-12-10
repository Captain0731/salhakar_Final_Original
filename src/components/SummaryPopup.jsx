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
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />

          {/* Popup - Full screen on mobile, centered on desktop */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 bg-white rounded-t-3xl sm:rounded-xl md:rounded-2xl shadow-2xl max-w-3xl w-full h-[95vh] sm:h-auto sm:max-h-[85vh] overflow-hidden flex flex-col"
            style={{ 
              minHeight: '95vh',
              backdropFilter: 'blur(10px)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Handle */}
            <div className="sm:hidden flex justify-center pt-2 pb-1">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* Header - Improved Mobile */}
            <div
              className="px-3 sm:px-6 py-3 sm:py-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)",
              }}
            >
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2
                    className="text-lg sm:text-2xl font-bold text-white truncate"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Summary
                  </h2>
                  <p className="text-xs sm:text-base text-white text-opacity-90 truncate mt-0.5 sm:mt-1" style={{ fontFamily: "Roboto, sans-serif" }}>
                    {getItemTitle()}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2.5 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors flex-shrink-0 ml-2 sm:ml-3"
                aria-label="Close popup"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </div>

            {/* Content - Improved Mobile */}
            <div 
              className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6"
              style={{ 
                minHeight: 0,
                maxHeight: 'calc(95vh - 120px)',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-6 sm:py-12">
                  <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 animate-spin mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-lg text-gray-600" style={{ fontFamily: "Roboto, sans-serif" }}>
                    Loading summary...
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-6 sm:py-12">
                  <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-red-50 flex items-center justify-center mb-3 sm:mb-4">
                    <X className="w-6 h-6 sm:w-10 sm:h-10 text-red-600" />
                  </div>
                  <p className="text-sm sm:text-lg text-red-600 text-center px-3 sm:px-4" style={{ fontFamily: "Roboto, sans-serif" }}>
                    {error}
                  </p>
                </div>
              ) : summary ? (
                <div
                  className="prose prose-sm sm:prose-base max-w-none"
                  style={{ 
                    fontFamily: "Roboto, sans-serif", 
                    color: "#1a1a1a",
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                >
                  <div 
                    className="text-gray-700 leading-relaxed text-sm sm:text-base"
                    style={{
                      lineHeight: '1.8'
                    }}
                  >
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="text-sm sm:text-base mb-3 sm:mb-5 mt-3 sm:mt-5" style={{ 
                            lineHeight: '1.8',
                            wordWrap: 'break-word'
                          }}>
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="ml-4 sm:ml-6 mb-3 sm:mb-5 mt-3 sm:mt-5 pl-2 sm:pl-4" style={{ 
                            listStyleType: 'disc'
                          }}>
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="ml-4 sm:ml-6 mb-3 sm:mb-5 mt-3 sm:mt-5 pl-2 sm:pl-4" style={{ 
                            listStyleType: 'decimal'
                          }}>
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-sm sm:text-base mb-2 sm:mb-3" style={{ 
                            lineHeight: '1.8'
                          }}>
                            {children}
                          </li>
                        ),
                        strong: ({ children }) => (
                          <strong className="text-sm sm:text-base" style={{ 
                            fontWeight: 'bold', 
                            color: '#1E65AD'
                          }}>
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em style={{ fontStyle: 'italic' }}>
                            {children}
                          </em>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-lg sm:text-xl mb-3 sm:mb-4 mt-4 sm:mt-6" style={{ 
                            fontWeight: 'bold',
                            color: '#1E65AD'
                          }}>
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-base sm:text-lg mb-2 sm:mb-3 mt-3 sm:mt-5" style={{ 
                            fontWeight: 'bold',
                            color: '#1E65AD'
                          }}>
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-sm sm:text-base mb-2 mt-3 sm:mt-4" style={{ 
                            fontWeight: 'bold',
                            color: '#1E65AD'
                          }}>
                            {children}
                          </h3>
                        ),
                      }}
                    >
                      {summary}
                    </ReactMarkdown>
                  </div>
                  
                  {/* Feedback Buttons Below Content - Improved Mobile */}
                  {getReferenceType() && getReferenceId() && (
                    <div className="mt-4 sm:mt-8 pt-4 sm:pt-6 border-t-2 border-gray-200">
                    <SummaryFeedbackButton
                      referenceType={getReferenceType()}
                      referenceId={getReferenceId()}
                        summaryText={summary}
                    />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 sm:py-12">
                  <p className="text-sm sm:text-lg text-gray-600 text-center px-3 sm:px-4" style={{ fontFamily: "Roboto, sans-serif" }}>
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

