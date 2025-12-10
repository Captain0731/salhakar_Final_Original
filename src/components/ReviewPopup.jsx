import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, MessageSquare, Heart, Smile, Meh, Frown, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ReviewPopup = () => {
  const { isAuthenticated } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Reaction options with professional icons
  const reactions = [
    { id: 5, icon: Frown, label: 'Poor', value: 1, color: '#8C969F' },
    { id: 4, icon: Meh, label: 'Fair', value: 2, color: '#CF9B63' },
    { id: 3, icon: Smile, label: 'Good', value: 3, color: '#CF9B63' },
    { id: 2, icon: Star, label: 'Very Good', value: 4, color: '#1E65AD' },
    { id: 1, icon: Heart, label: 'Excellent', value: 5, color: '#1E65AD' }
  ];

  // Check if popup should be shown based on timer
  // DISABLED: Popup will not show automatically
  useEffect(() => {
    // Popup is disabled - do not show automatically
    // const checkAndShowPopup = () => {
    //   const lastShown = localStorage.getItem('reviewPopupLastShown');
    //   const now = Date.now();
    //   
    //   // Determine interval based on authentication status
    //   // Logged in: 2 hours (120 minutes), Not logged in: 1.5 hours (90 minutes)
    //   const interval = isAuthenticated ? 120 * 60 * 1000 : 90 * 60 * 1000;
    //   
    //   if (!lastShown || (now - parseInt(lastShown)) >= interval) {
    //     // Check if user has already submitted a review today
    //     const lastSubmitted = localStorage.getItem('reviewPopupLastSubmitted');
    //     const today = new Date().toDateString();
    //     
    //     if (!lastSubmitted || new Date(lastSubmitted).toDateString() !== today) {
    //       setShowPopup(true);
    //     }
    //   }
    // };

    // Check immediately - DISABLED
    // checkAndShowPopup();

    // Check every minute - DISABLED
    // const intervalId = setInterval(checkAndShowPopup, 60 * 1000);

    // return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  const handleReactionClick = (reaction) => {
    setSelectedReaction(reaction);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedReaction) {
      alert('Please select a reaction first');
      return;
    }

    if (!reviewText.trim()) {
      alert('Please provide your feedback');
      return;
    }

    try {
      // Here you can send the review to your backend API
      // For now, we'll just store it locally
      const reviewData = {
        reaction: selectedReaction,
        review: reviewText,
        timestamp: new Date().toISOString(),
        isAuthenticated: isAuthenticated
      };

      // Store review data (you can send to API here)
      console.log('Review submitted:', reviewData);

      // Mark as submitted
      setSubmitted(true);
      localStorage.setItem('reviewPopupLastSubmitted', new Date().toISOString());
      localStorage.setItem('reviewPopupLastShown', Date.now().toString());

      // Close popup after 2 seconds
      setTimeout(() => {
        setShowPopup(false);
        setSelectedReaction(null);
        setReviewText('');
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const handleClose = () => {
    setShowPopup(false);
    // Update last shown time
    localStorage.setItem('reviewPopupLastShown', Date.now().toString());
    // Reset form
    setSelectedReaction(null);
    setReviewText('');
    setSubmitted(false);
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!showPopup) return null;

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div 
                className="px-6 py-4 flex items-center justify-between"
                style={{ 
                  background: 'linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 
                      className="text-white font-bold text-lg" 
                      style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                    >
                      Share Your Feedback
                    </h3>
                    <p 
                      className="text-white text-opacity-90 text-sm" 
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Help us improve your experience
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {!submitted ? (
                  <>
                    {/* Reaction Buttons */}
                    <div className="mb-6">
                      <p 
                        className="text-sm font-medium mb-4 text-center" 
                        style={{ 
                          fontFamily: "'Bricolage Grotesque', sans-serif",
                          color: '#1E65AD'
                        }}
                      >
                        How would you rate your experience?
                      </p>
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-nowrap w-full">
                        {reactions.map((reaction) => {
                          const IconComponent = reaction.icon;
                          const isSelected = selectedReaction?.id === reaction.id;
                          return (
                            <button
                              key={reaction.id}
                              onClick={() => handleReactionClick(reaction)}
                              className="flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl transition-colors flex-1 min-w-0"
                              style={{
                                backgroundColor: isSelected ? `${reaction.color}15` : '#F3F4F6',
                                border: isSelected ? `2px solid ${reaction.color}` : '2px solid transparent'
                              }}
                            >
                              <IconComponent 
                                className="w-5 h-5 sm:w-6 sm:h-6"
                                style={{ 
                                  color: isSelected ? reaction.color : '#8C969F'
                                }}
                              />
                              <span 
                                className="text-xs font-medium whitespace-nowrap text-center" 
                                style={{ 
                                  fontFamily: 'Roboto, sans-serif',
                                  color: isSelected ? reaction.color : '#8C969F'
                                }}
                              >
                                {reaction.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Review Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label 
                          htmlFor="review" 
                          className="block text-sm font-medium mb-2" 
                          style={{ 
                            fontFamily: "'Bricolage Grotesque', sans-serif",
                            color: '#1E65AD'
                          }}
                        >
                          Tell us more <span style={{ color: '#EF4444' }}>*</span>
                        </label>
                        <textarea
                          id="review"
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Share your thoughts, suggestions, or feedback..."
                          rows={4}
                          required
                          className="w-full px-4 py-3 border-2 rounded-lg transition-colors resize-none focus:outline-none"
                          style={{ 
                            fontFamily: 'Roboto, sans-serif',
                            borderColor: '#E5E7EB',
                            focusBorderColor: '#1E65AD',
                            focusRingColor: '#1E65AD'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#1E65AD';
                            e.target.style.boxShadow = '0 0 0 3px rgba(30, 101, 173, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#E5E7EB';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handleSkip}
                          className="flex-1 px-4 py-2.5 border-2 rounded-lg transition-colors font-medium"
                          style={{ 
                            fontFamily: 'Roboto, sans-serif',
                            borderColor: '#E5E7EB',
                            color: '#8C969F',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#F9FAFC';
                            e.target.style.borderColor = '#CF9B63';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.borderColor = '#E5E7EB';
                          }}
                        >
                          Skip
                        </button>
                        <button
                          type="submit"
                          disabled={!selectedReaction || !reviewText.trim()}
                          className="flex-1 px-4 py-2.5 text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                          style={{ 
                            fontFamily: 'Roboto, sans-serif',
                            backgroundColor: (!selectedReaction || !reviewText.trim()) ? '#9CA3AF' : '#1E65AD'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedReaction && reviewText.trim()) {
                              e.target.style.backgroundColor = '#155A9A';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedReaction && reviewText.trim()) {
                              e.target.style.backgroundColor = '#1E65AD';
                            }
                          }}
                        >
                          <Star className="w-4 h-4" fill="currentColor" />
                          Submit
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  /* Success Message */
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 15 }}
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: '#1E65AD15' }}
                    >
                      <CheckCircle2 className="w-8 h-8" style={{ color: '#1E65AD' }} />
                    </motion.div>
                    <h4 
                      className="text-xl font-bold mb-2" 
                      style={{ 
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        color: '#1E65AD'
                      }}
                    >
                      Thank You!
                    </h4>
                    <p 
                      className="text-sm" 
                      style={{ 
                        fontFamily: 'Roboto, sans-serif',
                        color: '#8C969F'
                      }}
                    >
                      Your feedback helps us improve.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReviewPopup;

