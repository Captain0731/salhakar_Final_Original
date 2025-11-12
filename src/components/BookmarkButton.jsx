import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, Star, StarOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import apiService from '../services/api';
import { useAuth } from '../contexts/AuthContext';

/**
 * Perfect Bookmark Button Component
 * Handles bookmarking for different content types with real-time status checking
 */
const BookmarkButton = ({ 
  item, 
  type, 
  actType = null, 
  mappingType = null, 
  size = 'default',
  showText = true,
  onBookmarkChange = null,
  autoCheckStatus = true,
  showNotifications = true,
  className = ''
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [bookmarkId, setBookmarkId] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Check if user is authenticated
  const isUserAuthenticated = () => {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('accessToken') || 
                  localStorage.getItem('token');
    const hasValidToken = !!token && token !== 'null' && token !== 'undefined';
    return isAuthenticated && hasValidToken;
  };

  // Check bookmark status on mount
  useEffect(() => {
    if (autoCheckStatus && item?.id && isUserAuthenticated()) {
      checkBookmarkStatus();
    }
  }, [item?.id, type, isAuthenticated]);

  const checkBookmarkStatus = async () => {
    if (!item?.id) return;
    
    setIsCheckingStatus(true);
    try {
      // Get user's bookmarks and check if this item is bookmarked
      const response = await apiService.getUserBookmarks({
        limit: 1000, // Get all bookmarks to check status
        type: type
      });
      
      const existingBookmark = response.bookmarks?.find(bookmark => {
        const bookmarkItem = bookmark.item || bookmark;
        // Compare IDs - handle both string and numeric
        const itemId = parseInt(item.id);
        const bookmarkItemId = parseInt(bookmarkItem.id);
        return (bookmarkItemId === itemId || bookmarkItem.id === item.id) && bookmark.type === type;
      });
      
      if (existingBookmark) {
        setIsBookmarked(true);
        setBookmarkId(existingBookmark.id);
      } else {
        setIsBookmarked(false);
        setBookmarkId(null);
      }
    } catch (err) {
      // Silently handle errors - don't show error for status check
      // 404 errors are expected if user has no bookmarks or is not authenticated
      if (err.message && !err.message.includes('404')) {
        console.warn('Bookmark status check failed (non-critical):', err.message);
      }
      // Assume not bookmarked on any error
      setIsBookmarked(false);
      setBookmarkId(null);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const showNotificationMessage = (message, type = 'success') => {
    if (!showNotifications) return;
    
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBookmarkToggle = async () => {
    if (isLoading || !item) return;
    
    // Check authentication first
    if (!isUserAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // For acts, ensure we have a valid numeric ID
    let itemId = item.id;
    if ((type === 'central_act' || type === 'state_act') && !itemId) {
      // Fallback: try act_id if id is not available (shouldn't happen, but just in case)
      itemId = item.act_id;
      console.warn('⚠️ Using act_id fallback:', { item, type });
    }
    
    if (!itemId) {
      console.error('❌ No valid ID found for bookmark:', { item, type });
      // Only set error if showText is true
      if (showText) {
        setError('Item ID is missing. Cannot bookmark.');
      }
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    console.log('🔖 BookmarkButton: Toggling bookmark', { type, itemId, item, isBookmarked });
    
    try {
      let success = false;
      let message = '';
      
      if (isBookmarked) {
        // Remove bookmark
        switch (type) {
          case 'judgement':
            await apiService.removeJudgementBookmark(item.id);
            message = 'Judgment removed from bookmarks';
            break;
          case 'central_act':
            // Ensure numeric ID - backend requires numeric item.id, not string act_id
            const centralActId = parseInt(item.id);
            if (isNaN(centralActId)) {
              throw new Error('Invalid central act ID');
            }
            console.log('🔖 Removing central act bookmark:', { id: centralActId, originalId: item.id, item });
            await apiService.removeActBookmark('central', centralActId);
            message = 'Central act removed from bookmarks';
            break;
          case 'state_act':
            // Ensure numeric ID - backend requires numeric item.id, not string act_id
            const stateActId = parseInt(item.id);
            if (isNaN(stateActId)) {
              throw new Error('Invalid state act ID');
            }
            console.log('🔖 Removing state act bookmark:', { id: stateActId, originalId: item.id, item });
            await apiService.removeActBookmark('state', stateActId);
            message = 'State act removed from bookmarks';
            break;
          case 'bsa_iea_mapping':
            await apiService.removeMappingBookmark('bsa_iea', item.id);
            message = 'BSA-IEA mapping removed from bookmarks';
            break;
          case 'bns_ipc_mapping':
            await apiService.removeMappingBookmark('bns_ipc', item.id);
            message = 'BNS-IPC mapping removed from bookmarks';
            break;
          case 'bnss_crpc_mapping':
            await apiService.removeMappingBookmark('bnss_crpc', item.id);
            message = 'BNSS-CrPC mapping removed from bookmarks';
            break;
          default:
            throw new Error(`Unsupported bookmark type: ${type}`);
        }
        
        setIsBookmarked(false);
        setBookmarkId(null);
        success = true;
        
      } else {
        // Add bookmark
        let response;
        switch (type) {
          case 'judgement':
            response = await apiService.bookmarkJudgement(item.id);
            message = 'Judgment added to bookmarks';
            break;
          case 'central_act':
            // Ensure numeric ID - backend requires numeric item.id, not string act_id
            const centralActIdAdd = parseInt(item.id);
            if (isNaN(centralActIdAdd)) {
              throw new Error('Invalid central act ID');
            }
            console.log('🔖 Adding central act bookmark:', { id: centralActIdAdd, originalId: item.id, item });
            response = await apiService.bookmarkAct('central', centralActIdAdd);
            console.log('🔖 Central act bookmark response:', response);
            message = 'Central act added to bookmarks';
            break;
          case 'state_act':
            // Ensure numeric ID - backend requires numeric item.id, not string act_id
            const stateActIdAdd = parseInt(item.id);
            if (isNaN(stateActIdAdd)) {
              throw new Error('Invalid state act ID');
            }
            console.log('🔖 Adding state act bookmark:', { id: stateActIdAdd, originalId: item.id, item });
            response = await apiService.bookmarkAct('state', stateActIdAdd);
            console.log('🔖 State act bookmark response:', response);
            message = 'State act added to bookmarks';
            break;
          case 'bsa_iea_mapping':
            response = await apiService.bookmarkMapping('bsa_iea', item.id);
            message = 'BSA-IEA mapping added to bookmarks';
            break;
          case 'bns_ipc_mapping':
            response = await apiService.bookmarkMapping('bns_ipc', item.id);
            message = 'BNS-IPC mapping added to bookmarks';
            break;
          case 'bnss_crpc_mapping':
            response = await apiService.bookmarkMapping('bnss_crpc', item.id);
            message = 'BNSS-CrPC mapping added to bookmarks';
            break;
          default:
            throw new Error(`Unsupported bookmark type: ${type}`);
        }
        
        setIsBookmarked(true);
        if (response?.bookmark?.id) {
          setBookmarkId(response.bookmark.id);
        }
        success = true;
      }
      
      if (success) {
        showNotificationMessage(message, 'success');
        if (onBookmarkChange) {
          onBookmarkChange(isBookmarked, item.id, bookmarkId);
        }
      }
      
    } catch (err) {
      const errorMessage = err.message || 'Failed to update bookmark';
      // Only set error if showText is true, otherwise just log it
      if (showText) {
        setError(errorMessage);
        showNotificationMessage(errorMessage, 'error');
      } else {
        // For icon-only mode, just log the error silently
        console.error('Bookmark error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonStyles = () => {
    const baseStyles = "flex items-center justify-center transition-all duration-200 font-medium rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
    
    // For icon-only buttons, use square padding and no width constraint
    // Match share button sizing: p-1.5 sm:p-2
    if (!showText) {
      if (size === 'small') {
        return `${baseStyles} p-1.5 sm:p-2`;
      } else if (size === 'large') {
        return `${baseStyles} p-3 sm:p-4`;
      } else {
        return `${baseStyles} p-2 sm:p-2.5`;
      }
    }
    
    // For buttons with text, use horizontal padding and full width
    if (size === 'small') {
      return `${baseStyles} px-3 py-1.5 text-sm w-full`;
    } else if (size === 'large') {
      return `${baseStyles} px-6 py-3 text-lg w-full`;
    } else {
      return `${baseStyles} px-4 py-2 text-sm w-full`;
    }
  };

  const getIconSize = () => {
    // Match share button icon sizing: h-4 w-4 sm:h-5 sm:w-5
    if (size === 'small') return 'h-4 w-4 sm:h-5 sm:w-5';
    if (size === 'large') return 'h-6 w-6 sm:h-7 sm:w-7';
    return 'h-5 w-5 sm:h-6 sm:w-6';
  };

  const getButtonContent = () => {
    const iconStyle = { color: '#FFFFFF' };
    
    if (isCheckingStatus) {
      return (
        <>
          <Loader2 className={`${getIconSize()} ${showText ? 'mr-2' : ''} animate-spin`} style={iconStyle} />
          {showText && 'Checking...'}
        </>
      );
    }

    if (isLoading) {
      return (
        <>
          <Loader2 className={`${getIconSize()} ${showText ? 'mr-2' : ''} animate-spin`} style={iconStyle} />
          {showText && 'Processing...'}
        </>
      );
    }

    if (isBookmarked) {
      return (
        <>
          <BookmarkCheck className={`${getIconSize()} ${showText ? 'mr-2' : ''}`} style={iconStyle} />
          {showText && 'Bookmarked'}
        </>
      );
    }

    return (
      <>
        <Bookmark className={`${getIconSize()} ${showText ? 'mr-2' : ''}`} style={iconStyle} />
        {showText && 'Bookmark'}
      </>
    );
  };

  const getButtonColors = () => {
    // Always use the same blue background as share button
    return 'text-white';
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleBookmarkToggle}
        disabled={isLoading || isCheckingStatus}
        className={`${getButtonStyles()} ${getButtonColors()}`}
        style={{ 
          backgroundColor: '#1E65AD',
          color: '#FFFFFF'
        }}
        onMouseEnter={(e) => {
          if (!isLoading && !isCheckingStatus) {
            e.target.style.backgroundColor = '#1a5a9a';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading && !isCheckingStatus) {
            e.target.style.backgroundColor = '#1E65AD';
          }
        }}
        title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        {getButtonContent()}
      </button>
      
      {/* Error Tooltip - Only show if showText is true */}
      {error && showText && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700 whitespace-nowrap z-10 shadow-lg">
          <div className="flex items-center">
            <XCircle className="h-3 w-3 mr-1" />
            {error}
          </div>
        </div>
      )}
      
      {/* Success Notification - Only show if showText is true */}
      {notification && notification.type === 'success' && showText && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-green-100 border border-green-300 rounded text-xs text-green-700 whitespace-nowrap z-10 shadow-lg">
          <div className="flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            {notification.message}
          </div>
        </div>
      )}
      
      {/* Error Notification - Only show if showText is true */}
      {notification && notification.type === 'error' && showText && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 border border-red-300 rounded text-xs text-red-700 whitespace-nowrap z-10 shadow-lg">
          <div className="flex items-center">
            <XCircle className="h-3 w-3 mr-1" />
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Compact Bookmark Icon Component
 * Just shows the bookmark icon without text - uses the same logic as BookmarkButton
 */
export const BookmarkIcon = ({ 
  item, 
  type, 
  actType = null, 
  mappingType = null, 
  onBookmarkChange = null,
  autoCheckStatus = true,
  showNotifications = false
}) => {
  return (
    <BookmarkButton
      item={item}
      type={type}
      actType={actType}
      mappingType={mappingType}
      size="small"
      showText={false}
      onBookmarkChange={onBookmarkChange}
      autoCheckStatus={autoCheckStatus}
      showNotifications={showNotifications}
    />
  );
};

export default BookmarkButton;
