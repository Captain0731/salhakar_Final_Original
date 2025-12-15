import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

// Prevent body scroll when modal is open
const useBodyScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isLocked]);
};

// List of available icons from public/usericons
const AVAILABLE_ICONS = [
  '1000.jpeg',
  '1001.jpeg',
  '1002.jpeg',
  '1003.jpeg',
  '1004.jpeg',
  '1005.jpeg',
  '1006.jpeg',
  '1007.jpeg',
  '1008.jpeg',
  '1009.jpeg',
  '1010.jpeg',
  '1011.jpeg',
  '1012.jpeg',
  '1013.jpeg',
  '1014.jpeg'
];

const DEFAULT_ICON = '1011.jpeg';
const AVATAR_CDN = 'https://storing.sfo3.digitaloceanspaces.com/profile';

const UserIcon = ({ 
  size = 'md', 
  showSelector = true, 
  className = '',
  onClick = null 
}) => {
  const { user, login } = useAuth();
  const [showIconModal, setShowIconModal] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lock body scroll when modal is open
  useBodyScrollLock(showIconModal);

  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showIconModal) {
        setShowIconModal(false);
      }
    };
    if (showIconModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showIconModal]);

  // Get current user icon or default
  const getUserIcon = () => {
    const avatarId = user?.avatar_id;
    if (avatarId && Number.isInteger(avatarId)) {
      return `${AVATAR_CDN}/${avatarId}.jpeg`;
    }
    // Fallback to legacy local asset
    return `/usericons/${DEFAULT_ICON}`;
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32'
  };

  const handleIconClick = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }
    if (showSelector) {
      setShowIconModal(true);
    }
  };

  const handleIconSelect = async (iconName) => {
    setSelectedIcon(iconName);
    setLoading(true);
    
    let updateSuccess = false;
    
    try {
      const avatarId = parseInt(iconName.replace('.jpeg', ''), 10);
      if (!Number.isInteger(avatarId)) {
        throw new Error('Invalid avatar selected.');
      }

      // Persist avatar selection via backend
      const updated = await apiService.setAvatar(avatarId);

      // Update auth context/local storage with new avatar_id
      if (user && login) {
        const updatedUser = { ...user, avatar_id: avatarId };
        // backend response may already contain avatar_id; prefer it
        const mergedUser = { ...updatedUser, ...(updated || {}) };
        localStorage.setItem('user', JSON.stringify(mergedUser));
        login(mergedUser);
      }

      updateSuccess = true;

      if (updateSuccess) {
        setShowIconModal(false);
        // Optionally show a success toast/notification here instead of alert
        console.log('Icon updated successfully');
      }
    } catch (error) {
      console.error('Error updating icon:', error);
      setSelectedIcon(null); // Reset selection on error
      alert('Failed to update icon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        onClick={handleIconClick}
        className={`${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer transition-transform hover:scale-105 ${className}`}
        style={{
          background: 'linear-gradient(to bottom right, rgba(255,255,255,0.3), rgba(255,255,255,0.1))'
        }}
      >
        <img
          src={getUserIcon()}
          alt="User"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to default icon if image fails to load
            e.target.src = `/usericons/${DEFAULT_ICON}`;
          }}
        />
      </div>

      {/* Icon Selection Modal - Using Portal */}
      {showIconModal && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4"
          onClick={() => setShowIconModal(false)}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            zIndex: 99999,
            isolation: 'isolate'
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              position: 'relative', 
              zIndex: 100000,
              isolation: 'isolate'
            }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  Select Your Icon
                </h2>
                <button
                  onClick={() => setShowIconModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {AVAILABLE_ICONS.map((iconName) => {
                  const numericId = parseInt(iconName.replace('.jpeg', ''), 10);
                  const isSelected = selectedIcon === iconName 
                    || (!selectedIcon && user?.avatar_id === numericId)
                    || (!selectedIcon && !user?.avatar_id && iconName === DEFAULT_ICON);
                  return (
                    <div
                      key={iconName}
                      onClick={() => !loading && handleIconSelect(iconName)}
                      className={`relative p-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:bg-gray-100'
                      } ${loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                    >
                      <div className="aspect-square rounded-full overflow-hidden bg-gray-200 border-2 border-transparent hover:border-gray-300 transition-colors">
                        <img
                          src={`/usericons/${iconName}`}
                          alt={iconName}
                          className="w-full h-full object-cover"
                          draggable="false"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {loading && (
                <div className="mt-4 text-center text-gray-600">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  <span className="ml-2">Updating icon...</span>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default UserIcon;

