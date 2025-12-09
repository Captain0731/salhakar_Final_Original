import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Loader2, Copy, Share2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ChatFeedbackButton = ({ messageId, messageText, onFeedbackSubmitted }) => {
  const { isAuthenticated } = useAuth();
  const [userRating, setUserRating] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load existing feedback
  useEffect(() => {
    if (isAuthenticated && messageId) {
      loadFeedback();
    }
  }, [isAuthenticated, messageId]);

  const loadFeedback = async () => {
    if (!isAuthenticated || !messageId) return;
    
    setLoading(true);
    try {
      const response = await apiService.getChatMessageFeedback(messageId);
      if (response && response.user_feedback) {
        setUserRating(response.user_feedback.rating);
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Error loading chat feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingClick = async (rating) => {
    if (!isAuthenticated) {
      return; // Don't show alert, just don't do anything
    }

    if (submitting) return;

    const newRating = userRating === rating ? null : rating; // Toggle if same rating clicked
    setUserRating(newRating);
    setSubmitting(true);

    try {
      await apiService.submitChatFeedback({
        message_id: messageId,
        rating: newRating
      });

      setSubmitted(true);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (error) {
      console.error('Error submitting chat feedback:', error);
      // Revert rating on error
      setUserRating(userRating);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!messageText) return;
    
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = messageText;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleShare = async () => {
    if (!messageText) return;

    const shareData = {
      title: 'Legal AI Assistant Response',
      text: messageText,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard with a message
        await navigator.clipboard.writeText(messageText);
        alert('Message copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        // Fallback: copy to clipboard
        handleCopy();
      }
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      {/* Thumbs Up/Down - Only for authenticated users */}
      {isAuthenticated && (
        <>
          <motion.button
            onClick={() => handleRatingClick('thumbs_up')}
            disabled={submitting || loading}
            whileHover={{ scale: submitting ? 1 : 1.1 }}
            whileTap={{ scale: submitting ? 1 : 0.9 }}
            className={`p-1.5 rounded-lg transition-all ${
              userRating === 'thumbs_up'
                ? 'bg-green-100'
                : 'bg-gray-100 hover:bg-gray-200'
            } ${submitting || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title="Helpful"
          >
            {submitting && userRating === 'thumbs_up' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#10B981' }} />
            ) : (
              <ThumbsUp 
                className="w-3.5 h-3.5" 
                style={{ 
                  color: userRating === 'thumbs_up' ? '#10B981' : '#8C969F',
                  fill: userRating === 'thumbs_up' ? '#10B981' : 'none'
                }} 
              />
            )}
          </motion.button>

          <motion.button
            onClick={() => handleRatingClick('thumbs_down')}
            disabled={submitting || loading}
            whileHover={{ scale: submitting ? 1 : 1.1 }}
            whileTap={{ scale: submitting ? 1 : 0.9 }}
            className={`p-1.5 rounded-lg transition-all ${
              userRating === 'thumbs_down'
                ? 'bg-red-100'
                : 'bg-gray-100 hover:bg-gray-200'
            } ${submitting || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            title="Not Helpful"
          >
            {submitting && userRating === 'thumbs_down' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#EF4444' }} />
            ) : (
              <ThumbsDown 
                className="w-3.5 h-3.5" 
                style={{ 
                  color: userRating === 'thumbs_down' ? '#EF4444' : '#8C969F',
                  fill: userRating === 'thumbs_down' ? '#EF4444' : 'none'
                }} 
              />
            )}
          </motion.button>

          {submitted && userRating && (
            <span className="text-xs text-gray-500 ml-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
              ✓
            </span>
          )}
        </>
      )}

      {/* Copy Button - Available for all users */}
      <motion.button
        onClick={handleCopy}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-1.5 rounded-lg transition-all bg-gray-100 hover:bg-gray-200 cursor-pointer"
        title="Copy message"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
        ) : (
          <Copy className="w-3.5 h-3.5" style={{ color: '#8C969F' }} />
        )}
      </motion.button>

      {/* Share Button - Available for all users */}
      <motion.button
        onClick={handleShare}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-1.5 rounded-lg transition-all bg-gray-100 hover:bg-gray-200 cursor-pointer"
        title="Share message"
      >
        <Share2 className="w-3.5 h-3.5" style={{ color: '#8C969F' }} />
      </motion.button>
    </div>
  );
};

export default ChatFeedbackButton;

