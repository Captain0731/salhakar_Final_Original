# Complete Project File Structure - Salhakar Legal Platform

## 📁 Root Directory Structure

```
salhakar/
├── 📂 public/                          # Static assets and public files
│   ├── index.html                      # Main HTML entry point
│   ├── favicon.ico                     # Site favicon
│   ├── manifest.json                   # PWA manifest
│   ├── robots.txt                      # SEO robots file
│   ├── pdf.worker.min.mjs              # PDF.js worker file
│   ├── 📂 usericons/                   # User avatar icons
│   │   ├── avatar.png
│   │   ├── boy.png
│   │   ├── man.png
│   │   ├── woman.png
│   │   └── [additional user icons]
│   └── [logo assets, images, PDFs]    # Brand assets and sample PDFs
│
├── 📂 src/                             # Source code directory
│   ├── index.js                        # React application entry point
│   ├── index.css                       # Global base styles
│   ├── App.js                          # Main App component with routing
│   ├── App.css                         # App-specific styles
│   ├── App.test.js                     # App component tests
│   ├── reportWebVitals.js              # Performance monitoring
│   ├── setupProxy.js                   # Development proxy configuration
│   ├── setupTests.js                   # Test configuration
│   │
│   ├── 📂 components/                  # Reusable React components
│   │   ├── 📂 landing/                 # Landing page components
│   │   │   ├── Navbar.jsx             # Main navigation bar
│   │   │   ├── Hero.jsx               # Hero section
│   │   │   ├── Features.jsx            # Features showcase
│   │   │   ├── VideoSection.jsx       # Video content section
│   │   │   ├── Testimonials.jsx       # Customer testimonials
│   │   │   ├── BlogSection.jsx       # Blog posts section
│   │   │   ├── FAQ.jsx                # Frequently asked questions
│   │   │   ├── Footer.jsx              # Site footer
│   │   │   ├── QuickLinks.jsx         # Quick navigation links
│   │   │   ├── SearchBar.jsx          # Search functionality
│   │   │   ├── Stats.jsx              # Statistics display
│   │   │   ├── FreeTrialPopup.jsx     # Free trial popup
│   │   │   └── ScrollOverlapWrapper.jsx # Scroll animation wrapper
│   │   │
│   │   ├── 📂 dashboard/              # Dashboard-specific components
│   │   │   ├── MyDownloads.jsx        # User downloads management
│   │   │   ├── Calendar.jsx           # Calendar/events component
│   │   │   ├── Bookmarks.jsx          # Bookmarks management
│   │   │   ├── BookmarkAnalytics.jsx  # Bookmark analytics
│   │   │   ├── BookmarkImportExport.jsx # Import/export bookmarks
│   │   │   ├── Notifications.jsx      # User notifications
│   │   │   ├── ProfileSettings.jsx    # Profile configuration
│   │   │   └── Notes.jsx              # Notes component
│   │   │
│   │   ├── 📂 examples/               # Example/demo components
│   │   │   └── BookmarkExample.jsx    # Bookmark usage examples
│   │   │
│   │   ├── BookmarkButton.jsx         # Reusable bookmark button
│   │   ├── Chatbot.jsx                # Chatbot component
│   │   ├── CookieConsentPopup.jsx     # Cookie consent popup
│   │   ├── ErrorBoundary.jsx         # Error boundary component
│   │   ├── GoogleTranslate.jsx       # Google Translate integration
│   │   ├── LanguageSelector.jsx      # Language selection component
│   │   ├── LanguageSelectorButton.jsx # Language selector button
│   │   ├── PDFTranslator.jsx         # PDF translation feature
│   │   ├── ProtectedRoute.jsx        # Route protection wrapper
│   │   ├── SessionManagement.jsx    # Session management UI
│   │   ├── LoadingComponents.jsx     # Loading state components
│   │   ├── EnhancedLoadingComponents.jsx # Enhanced loaders
│   │   ├── SkeletonLoaders.jsx        # Skeleton loading states
│   │   ├── ReactPDFViewer.jsx        # PDF viewer component
│   │   ├── SummaryPopup.jsx          # Summary popup component
│   │   ├── TranslatedPDF.jsx         # Translated PDF component
│   │   └── UserIcon.jsx              # User icon component
│   │
│   ├── 📂 pages/                      # Page components (routes)
│   │   ├── LandingPage.jsx            # Home/landing page
│   │   ├── Login.jsx                 # User login page
│   │   ├── Signup.jsx                # User registration page
│   │   ├── Dashboard.jsx              # Main user dashboard
│   │   ├── Profile.jsx                # User profile page
│   │   ├── Bookmarks.jsx             # Bookmarks page
│   │   ├── NotesPage.jsx             # Notes page
│   │   │
│   │   ├── 📂 Legal Content Pages     # Legal resource pages
│   │   │   ├── LegalJudgments.jsx    # Judgments listing (unified)
│   │   │   ├── ViewPDF.jsx           # PDF viewer for judgments
│   │   │   ├── LawLibrary.jsx        # Law library (acts browser)
│   │   │   ├── BrowseActs.jsx        # Acts browser
│   │   │   ├── ActDetails.jsx        # Individual act details
│   │   │   ├── LawMapping.jsx        # Law mapping interface
│   │   │   └── MappingDetails.jsx    # Mapping details page
│   │   │
│   │   ├── 📂 Utility Pages          # Feature pages
│   │   │   ├── LegalTemplate.jsx     # Legal document templates
│   │   │   ├── YoutubeVideoSummary.jsx # Video summary feature
│   │   │   ├── LegalChatbot.jsx      # AI legal chatbot
│   │   │   └── LanguageSelectorDemo.jsx # Language demo
│   │   │
│   │   ├── 📂 Referral Program       # Referral system pages
│   │   │   ├── Referral.jsx          # Referral dashboard
│   │   │   ├── InviteFriends.jsx     # Invite friends page
│   │   │   ├── EarnRewards.jsx       # Rewards page
│   │   │   └── TrackReferrals.jsx    # Referral tracking
│   │   │
│   │   └── 📂 Legal/Policy Pages     # Legal/policy pages
│   │       ├── About.jsx             # About us page
│   │       ├── OurTeam.jsx           # Team page
│   │       ├── PrivacyPolicy.jsx     # Privacy policy
│   │       ├── TermsOfService.jsx    # Terms of service
│   │       ├── CookiePolicy.jsx      # Cookie policy
│   │       ├── RefundPolicy.jsx      # Refund policy
│   │       ├── PricingPage.jsx       # Pricing page
│   │       ├── Blog.jsx              # Blog listing
│   │       ├── BlogPost.jsx          # Individual blog post
│   │       └── Support.jsx           # Support page
│   │
│   ├── 📂 contexts/                  # React Context providers
│   │   └── AuthContext.jsx           # Authentication context
│   │                                 # - User state management
│   │                                 # - Login/logout functionality
│   │                                 # - Session management
│   │                                 # - Token refresh
│   │
│   ├── 📂 hooks/                     # Custom React hooks
│   │   ├── useBookmarks.js           # Bookmark management hook
│   │   ├── useInfiniteScroll.js      # Infinite scroll functionality
│   │   ├── useSmoothInfiniteScroll.js # Smooth scroll hook
│   │   ├── useScrollAnimation.js    # Scroll animation hook
│   │   └── useURLFilters.js          # URL filter persistence hook
│   │
│   ├── 📂 services/                   # API and external services
│   │   └── api.js                     # Main API service
│   │                                 # - Authentication APIs
│   │                                 # - Judgments APIs (SC, HC)
│   │                                 # - Acts APIs (Central, State)
│   │                                 # - Bookmark APIs
│   │                                 # - Dashboard APIs
│   │                                 # - Law mapping APIs
│   │                                 # - Notes APIs
│   │                                 # - Error handling & retry logic
│   │
│   └── 📂 utils/                     # Utility functions
│                                     # (Helper functions and utilities)
│
├── 📂 build/                          # Production build output
│   ├── index.html                     # Built HTML
│   ├── asset-manifest.json            # Asset manifest
│   ├── 📂 static/                     # Static assets
│   │   ├── 📂 css/                   # Compiled CSS
│   │   └── 📂 js/                    # Compiled JavaScript
│   └── [other build assets]
│
├── 📂 app/                            # Additional app directory
│                                     # (May contain backend or additional configs)
│
├── 📂 node_modules/                   # NPM dependencies
│
├── 📄 Configuration Files
│   ├── package.json                   # NPM dependencies & scripts
│   ├── package-lock.json              # Locked dependency versions
│   ├── tailwind.config.js             # Tailwind CSS configuration
│   ├── postcss.config.js              # PostCSS configuration
│   ├── vercel.json                    # Vercel deployment config
│   └── .gitignore                     # Git ignore rules
│
├── 📄 Test Files
│   ├── test-api-connectivity.js       # API connectivity test script
│   ├── test-bookmark-api-structure.js # Bookmark API structure test
│   ├── test-bookmark-navigation.js    # Bookmark navigation test
│   ├── test-bookmark-navigation.sh    # Bookmark navigation test (shell)
│   ├── test-pdf-download.ps1          # PDF download test (PowerShell)
│   └── test-pdf-download.sh           # PDF download test (shell)
│
└── 📄 Documentation Files
    ├── README.md                      # Project readme
    ├── QUICK_START.md                 # Quick start guide
    ├── FILE_STRUCTURE_FLOW.md         # File structure documentation
    ├── PROJECT_STRUCTURE_PROMPT.md    # Project structure prompt
    ├── PROJECT_FILE_STRUCTURE.md      # This file
    ├── BOOKMARK_API_DOCUMENTATION.md  # Bookmark API docs
    ├── BOOKMARK_IMPLEMENTATION_GUIDE.md # Implementation guide
    ├── BOOKMARK_SYSTEM_GUIDE.md       # Bookmark system overview
    ├── BOOKMARK_INTEGRATION_STATUS.md # Integration status
    ├── CHANGES_SUMMARY.md             # Change log
    ├── INTEGRATION_SUMMARY.md         # Integration documentation
    ├── LEGAL_PLATFORM_COMPLETE_PROMPT.md # Complete platform prompt
    ├── NOTES_FEATURE_COMPLETE_DOCUMENTATION.md # Notes feature docs
    ├── DEBUG_BOOKMARKS.md             # Bookmark debugging guide
    └── CURL_TEST_COMMANDS.md          # CURL test commands
```

---

## 🔄 Data Flow Architecture

### 1. Application Entry Point
```
index.js
  └──> Renders <App /> into root DOM element
  └──> Applies global styles (index.css)
```

### 2. Main Application Structure
```
App.js
  └──> AuthProvider (AuthContext wrapper)
        └──> AppLayout
              ├──> GoogleTranslate (Global)
              ├──> CookieConsentPopup
              ├──> Chatbot (Conditional)
              └──> Routes
                    ├──> Public Routes
                    │     ├──> Landing, Login, Signup
                    │     ├──> About, Pricing, Blog
                    │     └──> Legal/Policy Pages
                    │
                    ├──> Protected Routes
                    │     └──> NotesPage (requires auth)
                    │
                    └──> Feature Routes
                          ├──> Judgments (/judgment/:id)
                          ├──> Acts (/acts/:id)
                          ├──> Law Mapping (/law-mapping)
                          ├──> Dashboard
                          └──> Bookmarks
```

### 3. Authentication Flow
```
AuthContext.jsx
  ├──> Manages user state
  ├──> Handles login/signup/logout
  ├──> Token management (access/refresh)
  ├──> Session management
  └──> Persists auth state to localStorage
        ├──> user
        ├──> access_token
        ├──> refresh_token
        └──> token
```

### 4. API Communication Flow
```
Components/Pages
  └──> api.js (ApiService)
        ├──> Authentication APIs
        │     ├──> POST /auth/login
        │     ├──> POST /auth/signup
        │     ├──> POST /auth/logout
        │     ├──> POST /auth/refresh
        │     └──> GET /auth/sessions
        │
        ├──> Judgments APIs
        │     ├──> GET /api/judgements (High Court)
        │     ├──> GET /api/supreme-court-judgements
        │     └──> GET /api/judgements/{id}
        │
        ├──> Acts APIs
        │     ├──> GET /api/acts/central-acts
        │     ├──> GET /api/acts/state-acts
        │     ├──> GET /api/acts/central-acts/{id}
        │     └──> GET /api/acts/state-acts/{id}
        │
        ├──> Bookmark APIs
        │     ├──> GET /api/bookmarks
        │     ├──> POST /api/bookmarks
        │     ├──> DELETE /api/bookmarks/{id}
        │     └──> GET /api/bookmarks/{type}/{id}
        │
        ├──> Law Mapping APIs
        │     ├──> GET /api/law_mapping?mapping_type=bns_ipc
        │     ├──> GET /api/law_mapping?mapping_type=bsa_iea
        │     └──> GET /api/law_mapping?mapping_type=bnss_crpc
        │
        ├──> Notes APIs
        │     ├──> GET /api/notes
        │     ├──> POST /api/notes
        │     └──> PUT /api/notes/{id}
        │
        └──> Error Handling
              ├──> Automatic token refresh
              ├──> Error retry logic
              └──> Fallback URL support
```

---

## 🎯 Key Features & File Locations

### 1. **Authentication System**
- **Context**: `src/contexts/AuthContext.jsx`
- **Pages**: `src/pages/Login.jsx`, `src/pages/Signup.jsx`
- **Protection**: `src/components/ProtectedRoute.jsx`
- **API**: `src/services/api.js` (auth methods)

### 2. **Dashboard System**
- **Main Page**: `src/pages/Dashboard.jsx`
- **Components**: `src/components/dashboard/*`
- **API**: `src/services/api.js` (dashboard methods)

### 3. **Bookmark System**
- **Hook**: `src/hooks/useBookmarks.js`
- **Component**: `src/components/BookmarkButton.jsx`
- **Pages**: `src/pages/Bookmarks.jsx`, `src/components/dashboard/Bookmarks.jsx`
- **API**: `src/services/api.js` (bookmark methods)

### 4. **Judgments System**
- **Pages**: 
  - `src/pages/LegalJudgments.jsx` (unified judgments page)
  - `src/pages/ViewPDF.jsx` (PDF viewer)
- **API**: `src/services/api.js` (judgment methods)

### 5. **Acts System**
- **Pages**: 
  - `src/pages/LawLibrary.jsx` (acts browser)
  - `src/pages/BrowseActs.jsx` (acts listing)
  - `src/pages/ActDetails.jsx` (act details)
- **API**: `src/services/api.js` (acts methods)

### 6. **Law Mapping System**
- **Pages**:
  - `src/pages/LawMapping.jsx` (mapping interface)
  - `src/pages/MappingDetails.jsx` (mapping details)
- **API**: `src/services/api.js` (mapping methods)

### 7. **Notes System**
- **Pages**: `src/pages/NotesPage.jsx`
- **Components**: `src/components/dashboard/Notes.jsx`
- **API**: `src/services/api.js` (notes methods)

### 8. **Translation Features**
- **Components**: 
  - `src/components/GoogleTranslate.jsx`
  - `src/components/LanguageSelector.jsx`
  - `src/components/PDFTranslator.jsx`
  - `src/components/TranslatedPDF.jsx`

### 9. **Chatbot System**
- **Component**: `src/components/Chatbot.jsx`
- **Page**: `src/pages/LegalChatbot.jsx`

---

## 🛠 Technology Stack

- **Frontend Framework**: React 19.2.0
- **Routing**: React Router DOM 7.9.3
- **Styling**: Tailwind CSS 3.4.13
- **Icons**: Lucide React, React Icons
- **Animations**: Framer Motion
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Build Tool**: Create React App (react-scripts)
- **PDF Viewer**: react-pdf, pdfjs-dist

---

## 📋 Route Structure

### Public Routes
- `/` - Landing page
- `/home` - Landing page (alias)
- `/login` - Login page
- `/signup` - Signup page (redirects to login)
- `/about` - About page
- `/pricing` - Pricing page
- `/blog` - Blog listing
- `/blog/:id` - Blog post
- `/support` - Support page
- `/our-team` - Team page
- `/privacy-policy` - Privacy policy
- `/terms-of-service` - Terms of service
- `/cookie-policy` - Cookie policy
- `/refund-policy` - Refund policy

### Feature Routes (Public)
- `/judgment-access` - Judgments search
- `/judgment/:id?` - View judgment PDF
- `/law-library` - Law library
- `/browse-acts` - Browse acts
- `/acts/:id` - Act details
- `/law-mapping` - Law mapping
- `/mapping-details` - Mapping details
- `/legal-chatbot` - Legal chatbot
- `/profile` - User profile
- `/bookmarks` - Bookmarks page
- `/dashboard` - Dashboard

### Protected Routes
- `/notes/:id` - Notes page (requires authentication)

---

## 🔧 Development Workflow

1. **Start Development**: `npm start`
2. **Build Production**: `npm run build`
3. **Run Tests**: `npm test`
4. **API Connectivity**: Test with `test-api-connectivity.js`

---

## 📝 Key Configuration Files

- `package.json` - Dependencies and scripts
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS processing
- `setupProxy.js` - Development proxy configuration
- `vercel.json` - Vercel deployment configuration
- `src/services/api.js` - API service configuration

---

## 🎨 Component Organization

### Landing Page Components
Located in `src/components/landing/`
- Reusable components for the landing page
- Includes: Navbar, Hero, Features, Footer, etc.

### Dashboard Components
Located in `src/components/dashboard/`
- Dashboard-specific functionality
- Includes: Bookmarks, Calendar, Notifications, etc.

### Shared Components
Located in `src/components/`
- Reusable across multiple pages
- Includes: BookmarkButton, Chatbot, ProtectedRoute, etc.

---

## 📊 State Management

### React Context
- `AuthContext` - Authentication state
  - User information
  - Authentication status
  - Token management

### Local State (useState)
- Component-specific UI state
- Form states
- Loading states

### LocalStorage
- `user` - User data
- `access_token` - Access token
- `refresh_token` - Refresh token
- `token` - Legacy token support

---

## 🔐 Security Features

- Protected routes with authentication
- Token-based authentication
- Automatic token refresh
- Session management
- Secure API communication

---

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS responsive utilities
- Breakpoints: sm, md, lg, xl
- Touch-friendly interfaces

---

## 🚀 Performance Optimizations

- Code splitting
- Lazy loading
- Image optimization
- Infinite scroll for large lists
- Skeleton loaders
- Request debouncing

---

This structure supports a scalable, maintainable legal research platform with clear separation of concerns, reusable components, and comprehensive API integration.

