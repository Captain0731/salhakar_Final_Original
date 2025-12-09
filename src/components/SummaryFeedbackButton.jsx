import React, { useState, useEffect, useRef } from 'react';
import { ThumbsUp, ThumbsDown, Loader2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const SummaryFeedbackButton = ({ referenceType, referenceId, onFeedbackSubmitted }) => {
  const { isAuthenticated } = useAuth();
  const [userRating, setUserRating] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittingText, setSubmittingText] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const buttonRef = useRef(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

  // Load existing feedback and statistics
  useEffect(() => {
    if (isAuthenticated && referenceType && referenceId) {
      loadFeedback();
    }
  }, [isAuthenticated, referenceType, referenceId]);

  // Calculate popup position and handle click outside
  useEffect(() => {
    if (showPopup && buttonRef.current) {
      const updatePosition = () => {
        if (!buttonRef.current) return;
        
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const popupWidth = 384; // w-96 = 384px
        const popupHeight = 400; // Approximate height
        const gap = 8; // Gap between button and popup
        
        // Calculate position below the button (using viewport coordinates)
        let top = buttonRect.bottom + gap;
        let left = buttonRect.left;
        
        // Adjust if popup would go off screen to the right
        if (left + popupWidth > window.innerWidth - 16) {
          left = window.innerWidth - popupWidth - 16;
        }
        
        // Adjust if popup would go off screen to the left
        if (left < 16) {
          left = 16;
        }
        
        // Adjust if popup would go off screen at bottom - show above instead
        if (buttonRect.bottom + popupHeight + gap > window.innerHeight - 16) {
          top = buttonRect.top - popupHeight - gap;
          // If still off screen at top, position at center vertically
          if (top < 16) {
            top = Math.max(16, (window.innerHeight - popupHeight) / 2);
          }
        }
        
        // Ensure minimum top position
        if (top < 16) {
          top = 16;
        }
        
        setPopupPosition({ top, left });
      };
      
      updatePosition();
      
      // Update position on scroll and resize
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      const handleClickOutside = (event) => {
        const target = event.target;
        // Check if click is outside the popup and buttons
        if (!target.closest('.feedback-popup-container') && !target.closest('button[title="Helpful"]') && !target.closest('button[title="Not Helpful"]')) {
          setShowPopup(false);
          setFeedbackText('');
        }
      };
      
      // Add event listener after a small delay to avoid immediate closing
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showPopup]);

  const loadFeedback = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await apiService.getSummaryFeedback(referenceType, referenceId);
      if (response && response.user_feedback) {
        setUserRating(response.user_feedback.rating);
        setFeedbackText(response.user_feedback.feedback_text || '');
      }
    } catch (error) {
      console.error('Error loading feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = async (rating) => {
    if (!isAuthenticated) {
      alert('Please login to provide feedback');
      return;
    }

    if (submitting) return;

    const newRating = userRating === rating ? null : rating; // Toggle if same rating clicked
    setUserRating(newRating);
    setSelectedRating(newRating);
    setSubmitting(true);

    try {
      await apiService.submitSummaryFeedback({
        reference_type: referenceType,
        reference_id: referenceId,
        rating: newRating,
        feedback_text: null
      });

      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
      
      // Show popup with input field after successful submission
      if (newRating) {
        setShowPopup(true);
        setFeedbackText(''); // Reset feedback text
      }
      
      // Reload feedback
      await loadFeedback();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      // Revert rating on error
      setUserRating(userRating);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTextFeedbackSubmit = async () => {
    if (submittingText) return;

    setSubmittingText(true);
    try {
      await apiService.submitSummaryFeedback({
        reference_type: referenceType,
        reference_id: referenceId,
        rating: selectedRating,
        feedback_text: feedbackText.trim() || null
      });

      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
      
      // Close popup after successful submission
      setShowPopup(false);
      setFeedbackText('');
      
      // Reload feedback
      await loadFeedback();
    } catch (error) {
      console.error('Error submitting text feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmittingText(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Don't show feedback buttons if not authenticated
  }

  return (
    <>
      <div ref={buttonRef} className="relative flex items-center gap-2">
        {/* Thumbs Up Button - Icon Only */}
        <motion.button
          onClick={() => handleRatingClick('thumbs_up')}
          disabled={submitting || loading}
          whileHover={{ scale: submitting ? 1 : 1.1 }}
          whileTap={{ scale: submitting ? 1 : 0.9 }}
          className={`p-2 rounded-lg transition-all ${
            userRating === 'thumbs_up'
              ? 'bg-white bg-opacity-30'
              : 'bg-white bg-opacity-20 hover:bg-opacity-30'
          } ${submitting || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title="Helpful"
        >
          {submitting && userRating === 'thumbs_up' ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white" />
          ) : (
            <ThumbsUp 
              className="w-4 h-4 sm:w-5 sm:h-5" 
              style={{ 
                color: userRating === 'thumbs_up' ? '#FFFFFF' : '#FFFFFF',
                fill: userRating === 'thumbs_up' ? '#FFFFFF' : 'none',
                opacity: userRating === 'thumbs_up' ? 1 : 0.8
              }} 
            />
          )}
        </motion.button>

        {/* Thumbs Down Button - Icon Only */}
        <motion.button
          onClick={() => handleRatingClick('thumbs_down')}
          disabled={submitting || loading}
          whileHover={{ scale: submitting ? 1 : 1.1 }}
          whileTap={{ scale: submitting ? 1 : 0.9 }}
          className={`p-2 rounded-lg transition-all ${
            userRating === 'thumbs_down'
              ? 'bg-white bg-opacity-30'
              : 'bg-white bg-opacity-20 hover:bg-opacity-30'
          } ${submitting || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title="Not Helpful"
        >
          {submitting && userRating === 'thumbs_down' ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white" />
          ) : (
            <ThumbsDown 
              className="w-4 h-4 sm:w-5 sm:h-5" 
              style={{ 
                color: userRating === 'thumbs_down' ? '#FFFFFF' : '#FFFFFF',
                fill: userRating === 'thumbs_down' ? '#FFFFFF' : 'none',
                opacity: userRating === 'thumbs_down' ? 1 : 0.8
              }} 
            />
          )}
        </motion.button>
      </div>

      {/* Feedback Popup - Positioned below buttons */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="feedback-popup-container fixed z-[10001] bg-white rounded-xl shadow-2xl p-6 w-80 sm:w-96"
            style={{ 
              border: '2px solid #E5E7EB',
              top: `${popupPosition.top}px`,
              left: `${popupPosition.left}px`,
              maxHeight: 'calc(100vh - 20px)',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Check className="w-6 h-6" style={{ color: '#10B981' }} />
                </div>
                <h3 className="text-lg font-semibold" style={{ color: '#1F2937', fontFamily: 'Heebo, sans-serif' }}>
                  Thank You!
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowPopup(false);
                  setFeedbackText('');
                }}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" style={{ color: '#6B7280' }} />
              </button>
            </div>
            
            <p className="text-sm mb-4" style={{ color: '#6B7280', fontFamily: 'Roboto, sans-serif' }}>
              Thank you for your feedback! Would you like to share more details? (Optional)
            </p>

            {/* Text Input */}
            <div className="mb-4">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your thoughts about this summary..."
                rows={4}
                maxLength={2000}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                style={{ 
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '14px'
                }}
              />
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {feedbackText.length}/2000 characters
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowPopup(false);
                  setFeedbackText('');
                }}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors hover:bg-gray-100"
                style={{ 
                  color: '#6B7280',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                Skip
              </button>
              <button
                onClick={handleTextFeedbackSubmit}
                disabled={submittingText}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                style={{ 
                  backgroundColor: '#1E65AD',
                  fontFamily: 'Roboto, sans-serif'
                }}
              >
                {submittingText ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SummaryFeedbackButton;

