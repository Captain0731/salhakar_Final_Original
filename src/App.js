// App.js
import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import GoogleTranslate from "./components/GoogleTranslate";
import ReviewPopup from "./components/ReviewPopup";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LegalJudgments from "./pages/LegalJudgments";
import ViewPDF from "./pages/ViewPDF";
import BrowseActs from "./pages/BrowseActs";
import LawLibrary from "./pages/LawLibrary";
import ActDetails from "./pages/ActDetails";
import MappingDetails from "./pages/MappingDetails";
import LawMapping from "./pages/LawMapping";
import LegalTemplate from "./pages/LegalTemplate";
import DocumentEditor from "./pages/DocumentEditor";
import YoutubeVideoSummary from "./pages/YoutubeVideoSummary";
import LegalChatbot from "./pages/LegalChatbot";
import Profile from "./pages/Profile";
import Bookmarks from "./pages/Bookmarks";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import RefundPolicy from "./pages/RefundPolicy";
import Referral from "./pages/Referral";
// import InviteFriends from "./pages/InviteFriends";
// import EarnRewards from "./pages/EarnRewards";
// import TrackReferrals from "./pages/TrackReferrals";
import OurTeam from "./pages/OurTeam";
import PricingPage from "./pages/PricingPage";
import Dashboard from "./pages/Dashboard";
import NotesPage from "./pages/NotesPage";
import LanguageSelectorDemo from "./pages/LanguageSelectorDemo";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

import Chatbot from "./components/Chatbot";
import Footer from "./components/landing/Footer";
import CookieConsentPopup from "./components/CookieConsentPopup";

// ScrollToTop component to reset scroll position on route change with smooth behavior
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Smooth scroll window to top
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    
    // Also reset any scroll containers with smooth behavior
    const scrollContainers = [
      document.getElementById('main-scroll-area'),
      document.getElementById('chatbot-scroll-area'),
      document.querySelector('[data-scroll-container]')
    ];
    
    scrollContainers.forEach(container => {
      if (container) {
        container.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      }
    });
    
    // Also reset document element scroll smoothly
    const smoothScrollToTop = () => {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
      if (currentScroll > 0) {
        window.requestAnimationFrame(smoothScrollToTop);
        window.scrollTo(0, currentScroll - (currentScroll / 8));
      }
    };
    
    // Use smooth scroll animation
    smoothScrollToTop();
  }, [pathname]);

  return null;
}

function AppLayout() {
  const location = useLocation();
  
  // Restore previous language when navigating away from chatbot
  useEffect(() => {
    const currentPath = location.pathname;
    const isOnChatbotPage = currentPath === '/legal-chatbot' || currentPath === '/chatbot';
    
    // If we're not on chatbot page, check if we need to restore previous language
    if (!isOnChatbotPage) {
      // Check if we've already restored (prevent multiple restorations)
      const hasRestored = sessionStorage.getItem('languageRestored');
      
      if (!hasRestored) {
        const previousLang = localStorage.getItem('previousLanguageBeforeChatbot');
        
        if (previousLang && previousLang !== 'en') {
          const langCode = previousLang;
          
          // Mark as restored to prevent multiple attempts
          sessionStorage.setItem('languageRestored', 'true');
          
          // Helper function to set cookie with proper attributes
          const setCookie = (name, value, days = 365) => {
            if (typeof window === 'undefined') return;
            
            const expires = new Date();
            expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
            
            const hostname = window.location.hostname;
            const domain = hostname.includes('localhost') || hostname.includes('127.0.0.1') 
              ? '' 
              : hostname.split('.').slice(-2).join('.');
            
            let cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
            
            if (window.location.protocol === 'https:') {
              cookieString += '; Secure';
            }
            
            if (domain && !hostname.includes('localhost')) {
              cookieString += `; domain=.${domain}`;
            }
            
            document.cookie = cookieString;
            
            try {
              localStorage.setItem('selectedLanguage', langCode);
            } catch (e) {
              console.warn('localStorage not available:', e);
            }
          };
          
          // Restore previous language
          setCookie('googtrans', `/en/${langCode}`, 365);
          
          // Clear the stored previous language
          localStorage.removeItem('previousLanguageBeforeChatbot');
          
          // Reload to apply the restored language
          window.location.reload();
          return; // Exit early to prevent further execution
        }
      }
    } else {
      // If we're on chatbot page, clear the restoration flag
      sessionStorage.removeItem('languageRestored');
    }
  }, [location.pathname]);
  
  // Pages where chatbot should be hidden
  const hideChatbotPaths = [
    '/login',
    '/signup',
    '/judgment',
    '/acts',
    '/mapping-details',
    '/law-library',
    '/legal-chatbot',
    '/law-mapping',
    '/dashboard',
    '/profile',
    '/document-editor'
  ];
  
  // Pages where footer should be hidden
  const hideFooterPaths = [
    '/login',
    '/signup',
    '/dashboard',
    '/profile',
    '/judgment-access',
    '/judgment',
    '/acts',
    '/mapping-details',
    '/law-library',
    '/legal-chatbot',
    '/law-mapping',
    '/legal-template',
    '/document-editor'
  ];
  
  const shouldShowChatbot = !hideChatbotPaths.some(path => location.pathname.startsWith(path));
  const shouldShowFooter = !hideFooterPaths.some(path => {
    // Match exact path or paths that start with the excluded path followed by '/'
    return location.pathname === path || location.pathname.startsWith(path + '/');
  });
  
  return (
    <div style={{ minHeight: "100vh", overflowY: "auto", overflowX: "hidden", width: "100%", maxWidth: "100vw", scrollbarWidth: "none", msOverflowStyle: "none" }} className="scrollbar-hide">
      {/* Scroll to top on route change */}
      <ScrollToTop />
      {/* Google Translate Component - Global mount point */}
      <GoogleTranslate />
      {/* Cookie Consent Popup - Shows on first visit */}
      <CookieConsentPopup />
      {/* Review Popup - Shows every 5 min (not logged in) or 10 min (logged in) */}
      <ReviewPopup />
      {/* Chatbot Icon - Fixed position on all pages except specified ones */}
      {shouldShowChatbot && <Chatbot />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/support" element={<Support />} />
        <Route path="/our-team" element={<OurTeam />} />
        <Route path="/language-demo" element={<LanguageSelectorDemo />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        
        {/* Public Routes - No Authentication Required */}
        <Route path="/judgment/:id?" element={<ViewPDF />} />
        <Route path="/law-library" element={<LawLibrary />} />
        <Route path="/browse-acts" element={<BrowseActs />} />
        <Route path="/acts/:id" element={<ActDetails />} />
        <Route path="/mapping-details" element={<MappingDetails />} />
        <Route path="/law-mapping" element={<LawMapping />} />
        <Route path="/legal-template" element={<LegalTemplate />} />
        <Route path="/document-editor" element={<DocumentEditor />} />
        <Route path="/youtube-summary" element={<YoutubeVideoSummary />} />
        <Route path="/legal-chatbot" element={<LegalChatbot />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Additional Routes for Navigation */}
        <Route path="/judgment-access" element={<LegalJudgments />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        {/* <Route path="/invite-friends" element={<InviteFriends />} /> */}
        {/* <Route path="/earn-rewards" element={<EarnRewards />} /> */}
        {/* <Route path="/track-referrals" element={<TrackReferrals />} /> */}
        
        {/* Dashboard - Public Route (no login required) */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Protected Routes - Authentication Required */}
        <Route path="/notes/:id" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
        
        {/* Referral Program Routes */}
        <Route path="/referral" element={<Referral />} />
        {/* <Route path="/referral/invite" element={<InviteFriends />} /> */}
        {/* <Route path="/referral/rewards" element={<EarnRewards />} /> */}
        {/* <Route path="/referral/track" element={<TrackReferrals />} /> */}
        
        {/* {chatbot routes} */}
        <Route path="/chatbot" element={<LegalChatbot />} />
        
        {/* 404 - Catch all unmatched routes */}
        <Route path="*" element={<NotFound />} />
        
      </Routes>
      {/* Footer - Show on all pages except login, signup, dashboard, and profile */}
      {shouldShowFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppLayout />
      </NotificationProvider>
    </AuthProvider>
  );
}
