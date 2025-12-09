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
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 pt-16 sm:pt-20"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50" />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col"
            style={{ minHeight: '300px', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)",
              }}
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2
                    className="text-lg sm:text-xl font-bold text-white truncate"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                    Summary
                  </h2>
                  <p className="text-xs sm:text-sm text-white text-opacity-90 truncate" style={{ fontFamily: "Roboto, sans-serif" }}>
                    {getItemTitle()}
                  </p>
                </div>
              </div>
              
              {/* Feedback Buttons in Header */}
              {getReferenceType() && getReferenceId() && (
                <div className="flex items-center gap-2 mx-3">
                  <SummaryFeedbackButton
                    referenceType={getReferenceType()}
                    referenceId={getReferenceId()}
                  />
                </div>
              )}
              
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors flex-shrink-0 ml-2"
                aria-label="Close popup"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div 
              className="flex-1 overflow-y-auto p-4 sm:p-6"
              style={{ 
                minHeight: 0,
                maxHeight: 'calc(90vh - 120px)',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
                  <p className="text-gray-600" style={{ fontFamily: "Roboto, sans-serif" }}>
                    Loading summary...
                  </p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-red-600 text-center px-4" style={{ fontFamily: "Roboto, sans-serif" }}>
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
                    className="text-gray-700 leading-relaxed"
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.7'
                    }}
                  >
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p style={{ 
                            marginBottom: '1rem', 
                            marginTop: '1rem',
                            fontSize: '14px',
                            lineHeight: '1.7',
                            wordWrap: 'break-word'
                          }}>
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul style={{ 
                            marginLeft: '1.5rem', 
                            marginBottom: '1rem', 
                            marginTop: '1rem', 
                            listStyleType: 'disc',
                            paddingLeft: '1rem'
                          }}>
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol style={{ 
                            marginLeft: '1.5rem', 
                            marginBottom: '1rem', 
                            marginTop: '1rem', 
                            listStyleType: 'decimal',
                            paddingLeft: '1rem'
                          }}>
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li style={{ 
                            marginBottom: '0.5rem',
                            fontSize: '14px',
                            lineHeight: '1.7'
                          }}>
                            {children}
                          </li>
                        ),
                        strong: ({ children }) => (
                          <strong style={{ 
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
                          <h1 style={{ 
                            fontSize: '20px', 
                            fontWeight: 'bold', 
                            marginTop: '1.5rem', 
                            marginBottom: '1rem',
                            color: '#1E65AD'
                          }}>
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 style={{ 
                            fontSize: '18px', 
                            fontWeight: 'bold', 
                            marginTop: '1.25rem', 
                            marginBottom: '0.75rem',
                            color: '#1E65AD'
                          }}>
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 style={{ 
                            fontSize: '16px', 
                            fontWeight: 'bold', 
                            marginTop: '1rem', 
                            marginBottom: '0.5rem',
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
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-600 text-center px-4" style={{ fontFamily: "Roboto, sans-serif" }}>
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

