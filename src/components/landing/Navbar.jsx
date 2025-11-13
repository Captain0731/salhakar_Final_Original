import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import LanguageSelector from "../LanguageSelector";
import UserIcon from "../UserIcon";
import { Menu, X } from "lucide-react";

const navItems = [
  {
    label: "Home",
    path: "/",
  },
  {
    label: "Services",
    links: [
      { 
        label: "Legal Judgment", 
        path: "/judgment-access",
      },
      { 
        label: "Law Library", 
        path: "/law-library"
      },
      { 
        label: "Law Mapping", 
        path: "/law-mapping"
      },
      { 
        label: "YouTube Summarizer", 
        path: "/youtube-summary",
      },
    ],
  },
  {
    label: "About",
    path: "/about",
  },
  {
    label: "Pricing",
    path: "/pricing",
  },
  {
    label: "More",
    links: [
      { 
        label: "Blog", 
        path: "/blog",
      },
      { 
        label: "Support", 
        path: "/support"
      },
      // { 
      //   label: "Referral Program", 
      //   path: "/referral",
      // },
      
    ],
  },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null); // index of main dropdown
  // Changed: track both main index and sub index to avoid collisions
  const [subDropdownOpen, setSubDropdownOpen] = useState({ main: null, sub: null });
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const navRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const subHoverTimeoutRef = useRef(null);

  const handleNavClick = (path, filter = null) => {
    console.log('Navigating to:', path);
    if (path && path !== "#") {
      if (path.startsWith("/#")) {
        const anchorId = path.substring(2);
        const element = document.getElementById(anchorId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // All routes are now public - no authentication required
        
        if (filter) {
          navigate(path, { state: { filter } });
        } else {
          navigate(path);
        }
      }
      setMenuOpen(false);
      setDropdownOpen(null);
      setSubDropdownOpen({ main: null, sub: null });
    }
  };

  // Handle scroll effect and progress bar
  // useEffect(() => {
  //   let rafId = null;
    
  //   const updateScrollProgress = () => {
  //     const scrollTop = window.scrollY;
  //     const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  //     const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      
  //     setIsScrolled(scrollTop > 50);
  //     setScrollProgress(Math.min(100, Math.max(0, scrollPercent)));
  //   };

  //   const handleScroll = () => {
  //     if (rafId) {
  //       cancelAnimationFrame(rafId);
  //     }
  //     rafId = requestAnimationFrame(updateScrollProgress);
  //   };

  //   const handleResize = () => {
  //     updateScrollProgress();
  //   };

  //   // Initial calculation
  //   updateScrollProgress();

  //   window.addEventListener('scroll', handleScroll, { passive: true });
  //   window.addEventListener('resize', handleResize, { passive: true });
    
  //   return () => {
  //     window.removeEventListener('scroll', handleScroll);
  //     window.removeEventListener('resize', handleResize);
  //     if (rafId) {
  //       cancelAnimationFrame(rafId);
  //     }
  //   };
  // }, []);

  // // Close dropdowns when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (navRef.current && !navRef.current.contains(event.target)) {
  //       setDropdownOpen(null);
  //       setSubDropdownOpen({ main: null, sub: null });
  //       setUserDropdownOpen(false);
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //     // Clear timeouts on cleanup
  //     if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  //     if (subHoverTimeoutRef.current) clearTimeout(subHoverTimeoutRef.current);
  //   };
  // }, []);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate("/");
  };

  // Helper classes for smooth animation
  const animatedDropdownClass = (isOpen) =>
    `transition-all duration-300 ease-out transform ${
      isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"
    }`;

  const animatedSubDropdownClass = (isOpen) =>
    `transition-all duration-300 ease-out transform ${
      isOpen ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 -translate-x-2 pointer-events-none"
    }`;

  return (
    <nav ref={navRef} className={`fixed top-0 left-0 right-0 z-[9999] border-b transition-all duration-500 ease-in-out ${
      isScrolled 
        ? 'bg-white/20 backdrop-blur-lg shadow-xl py-2' 
        : 'bg-white/90 backdrop-blur-md shadow-lg py-3 sm:py-4 md:py-4'
    }`} style={{ borderColor: '#E5E7EB' }}>
      <div className="max-w-7xl  mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center ">
        
        {/* Brand Logo - Left Corner */}
        <div
          className="cursor-pointer group flex items-center"
          onClick={() => navigate("/")}
        >
          <img
            src="/logo4.png"
            alt="सलहाकार Logo"
            className={`max-h-24 sm:max-h-16 md:max-h-18 w-auto object-contain group-hover:scale-110 transition-all duration-500 ease-out ${
              isScrolled ? 'max-h-16 sm:max-h-16 md:max-h-18' : 'max-h-16 sm:max-h-16 md:max-h-18'
            }`}
            style={{ height: 'auto' }}
            onError={(e) => {
              if (e.target.src.includes('logo4.png')) {
                e.target.src = '/logo.png';
              } else if (e.target.src.includes('logo.png')) {
                e.target.src = '/logo 3.PNG';
              } else if (e.target.src.includes('logo 3.PNG')) {
                e.target.src = '/laogo2.jpeg';
              } else {
                e.target.src = '/logo4.png';
              }
            }}
          />
        </div>

        {/* Right Side - Mobile: Language Selector + Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Language Selector - Mobile (in navbar bar) */}
          <div className="flex-shrink-0 max-w-[100px] sm:max-w-[120px]">
            <LanguageSelector />
          </div>
          
          {/* Menu Button - Mobile */}
          <button
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-300 touch-manipulation flex items-center justify-center"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ 
              minWidth: '44px', 
              minHeight: '44px',
              color: '#1E65AD'
            }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="w-6 h-6" strokeWidth={2.5} />
            ) : (
              <Menu className="w-6 h-6" strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Nav Links */}
        <ul
          className={`flex-col md:flex-row md:flex gap-1 sm:gap-2 items-center absolute md:static left-0 w-full md:w-auto backdrop-blur-lg md:bg-transparent p-6 sm:p-8 md:p-0 transition-all duration-500 ease-out shadow-2xl md:shadow-none rounded-2xl md:rounded-none border-t md:border-t-0  ${
            isScrolled ? 'bg-white/70 backdrop-blur-lg top-16 sm:top-18' : 'bg-white/90 backdrop-blur-md top-20 sm:top-24'
          } ${menuOpen ? "flex opacity-100 translate-y-0" : "hidden md:flex opacity-0 md:opacity-100 -translate-y-2 md:translate-y-0"}`}
          style={{ borderTopColor: '#E5E7EB', zIndex: 9999 }}
        >
          {navItems.map((item, idx) => (
            <li 
              key={idx} 
              className="relative group w-full md:w-auto"
              style={{ position: 'relative' }}
              onMouseEnter={() => {
                if (window.innerWidth >= 768 && item.links && item.links.length > 0) {
                  // Clear any existing timeout
                  if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                  }
                  console.log('Opening dropdown for:', item.label, 'index:', idx);
                  setDropdownOpen(idx);
                }
              }}
              onMouseLeave={() => {
                if (window.innerWidth >= 768) {
                  // Clear any existing timeout
                  if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                  }
                  hoverTimeoutRef.current = setTimeout(() => {
                    setDropdownOpen(null);
                    setSubDropdownOpen({ main: null, sub: null });
                  }, 150);
                }
              }}
            >
              <button
                onClick={() => {
                  if (item.links && item.links.length > 0) {
                    setDropdownOpen(dropdownOpen === idx ? null : idx);
                    setSubDropdownOpen({ main: null, sub: null });
                  } else if (item.path) {
                    handleNavClick(item.path);
                  }
                }}
                className={`flex items-center justify-between w-full md:w-auto py-3 sm:py-3 px-4 sm:px-4 rounded-xl transition-all duration-300 font-medium hover:scale-105 text-sm sm:text-base touch-manipulation relative overflow-hidden group ${(item.path && location.pathname === item.path) ? 'bg-blue-50 text-blue-600' : ''}`}
                style={{ 
                  color: (item.path && location.pathname === item.path) ? '#1E65AD' : '#8C969F', 
                  fontFamily: 'Roboto, sans-serif',
                  minHeight: '44px'
                }}
                onMouseEnter={(e) => {
                  if (window.innerWidth >= 768) {
                    const isSelected = item.path && location.pathname === item.path;
                    e.currentTarget.style.color = isSelected ? '#1E65AD' : '#1E65AD';
                    e.currentTarget.style.backgroundColor = isSelected ? '#E3F2FD' : '#F8FAFC';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 101, 173, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (window.innerWidth >= 768) {
                    const isSelected = item.path && location.pathname === item.path;
                    e.currentTarget.style.color = isSelected ? '#1E65AD' : '#8C969F';
                    e.currentTarget.style.backgroundColor = isSelected ? '#E3F2FD' : 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <span className="text-left">{item.label}</span>
                {item.links && item.links.length > 0 && (
                  <span 
                    className={`ml-2 ${dropdownOpen === idx ? 'rotate-180 scale-110' : 'scale-100'}`}
                    style={{ 
                      color: '#CF9B63',
                      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      transformOrigin: 'center',
                      display: 'inline-block'
                    }}
                  >
                    ▼
                  </span>
                )}
              </button>

                {/* Main Dropdown - uses smooth animation class */}
                {item.links && item.links.length > 0 && (
                  <ul
                    className={`w-full md:absolute md:left-0 md:top-full backdrop-blur-md shadow-2xl rounded-lg sm:rounded-xl md:rounded-2xl py-2 sm:py-3 mt-2 sm:mt-3 md:min-w-[300px] border ${
                      isScrolled ? 'bg-white/95' : 'bg-white/95'
                    } ${
                      dropdownOpen === idx ? "block opacity-100" : "hidden opacity-0"
                    } ${animatedDropdownClass(dropdownOpen === idx)}`}
                  style={{ 
                    borderColor: '#E5E7EB',
                    zIndex: 9999,
                    backgroundColor: 'white',
                    color: '#1f2937'
                  }}
                  onMouseEnter={() => {
                    if (window.innerWidth >= 768) {
                      // Clear any existing timeout
                      if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current);
                      }
                      setDropdownOpen(idx);
                    }
                  }}
                  onMouseLeave={() => {
                    if (window.innerWidth >= 768) {
                      // Clear any existing timeout
                      if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current);
                      }
                      hoverTimeoutRef.current = setTimeout(() => {
                        setDropdownOpen(null);
                        setSubDropdownOpen({ main: null, sub: null });
                      }, 150);
                    }
                  }}
                >
                  {item.links.map((link, i) => (
                    <li 
                      key={i} 
                      className="relative w-full"
                      style={{
                        position: 'relative',
                        transition: 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                      }}
                      onMouseEnter={() => {
                        if (window.innerWidth >= 768 && link.subLinks && link.subLinks.length > 0) {
                          // Clear any existing timeout
                          if (subHoverTimeoutRef.current) {
                            clearTimeout(subHoverTimeoutRef.current);
                          }
                          // set both main and sub for correct matching
                          setSubDropdownOpen({ main: idx, sub: i });
                        }
                      }}
                      onMouseLeave={() => {
                        if (window.innerWidth >= 768) {
                          // Clear any existing timeout
                          if (subHoverTimeoutRef.current) {
                            clearTimeout(subHoverTimeoutRef.current);
                          }
                          subHoverTimeoutRef.current = setTimeout(() => {
                            setSubDropdownOpen({ main: null, sub: null });
                          }, 150);
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <button
                          onClick={() => {
                            if (link.subLinks && link.subLinks.length > 0) {
                              // toggle using composite main/sub keys
                              setSubDropdownOpen(prev => (
                                prev.main === idx && prev.sub === i ? { main: null, sub: null } : { main: idx, sub: i }
                              ));
                            } else {
                              handleNavClick(link.path, link.filter);
                            }
                          }}
                          className="flex items-center justify-between w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm md:text-base touch-manipulation rounded-lg mx-1 sm:mx-2 group"
                          style={{ 
                            color: '#1f2937', 
                            fontFamily: 'Roboto, sans-serif',
                            minHeight: '44px',
                            transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                          }}
                          onMouseEnter={(e) => {
                            if (window.innerWidth >= 768) {
                              e.currentTarget.style.color = 'white';
                              e.currentTarget.style.backgroundColor = '#1E65AD';
                              e.currentTarget.style.transform = 'translateX(4px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 101, 173, 0.2)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (window.innerWidth >= 768) {
                              e.currentTarget.style.color = '#8C969F';
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.transform = 'translateX(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }
                          }}
                        >
                          <span style={{ color: '#1f2937' }}>{link.label}</span>
                          {link.subLinks && link.subLinks.length > 0 && (
                            <span 
                              className={`ml-2 ${(subDropdownOpen.main === idx && subDropdownOpen.sub === i) ? 'rotate-90 scale-110' : 'scale-100'}`}
                              style={{ 
                                color: '#CF9B63',
                                transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                display: 'inline-block'
                              }}
                            >
                              ▶
                            </span>
                          )}
                        </button>
                      </div>

                        {/* Sub-dropdown for services with sub-links - uses composite check */}
                        {link.subLinks && link.subLinks.length > 0 && (
                          <ul
                            // On md+: absolute flyout; on mobile: static block below parent
                            className={`w-full backdrop-blur-md shadow-lg rounded-lg sm:rounded-xl md:rounded-2xl py-2 sm:py-3 mt-2 sm:mt-2.5 md:mt-0 ml-0 md:ml-2 md:absolute md:left-full md:top-0 md:min-w-[220px] border ${
                              isScrolled ? 'bg-white/95' : 'bg-white/95'
                            } 
                              ${(subDropdownOpen.main === idx && subDropdownOpen.sub === i) ? "block opacity-100" : "hidden opacity-0"}
                              ${animatedSubDropdownClass(subDropdownOpen.main === idx && subDropdownOpen.sub === i)}`}
                          style={{ 
                            borderColor: '#E5E7EB',
                            zIndex: 10000,
                            backgroundColor: 'white',
                            color: '#1f2937'
                          }}
                          onMouseEnter={() => {
                            if (window.innerWidth >= 768) {
                              // Clear any existing timeout
                              if (subHoverTimeoutRef.current) {
                                clearTimeout(subHoverTimeoutRef.current);
                              }
                              setSubDropdownOpen({ main: idx, sub: i });
                            }
                          }}
                          onMouseLeave={() => {
                            if (window.innerWidth >= 768) {
                              // Clear any existing timeout
                              if (subHoverTimeoutRef.current) {
                                clearTimeout(subHoverTimeoutRef.current);
                              }
                              subHoverTimeoutRef.current = setTimeout(() => {
                                setSubDropdownOpen({ main: null, sub: null });
                              }, 150);
                            }
                          }}
                        >
                          {link.subLinks.map((subLink, j) => (
                            <li 
                              key={j}
                              className=""
                              style={{
                                transition: 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                              }}
                            >
                              <button
                                onClick={() => handleNavClick(subLink.path, subLink.filter)}
                                className="block w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm md:text-base touch-manipulation rounded-lg mx-1 sm:mx-2 group"
                                style={{ 
                                  color: '#1f2937', 
                                  fontFamily: 'Roboto, sans-serif',
                                  minHeight: '44px',
                                  transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                                }}
                                onMouseEnter={(e) => {
                                  if (window.innerWidth >= 768) {
                                    e.currentTarget.style.color = 'white';
                                    e.currentTarget.style.backgroundColor = '#CF9B63';
                                    e.currentTarget.style.transform = 'translateX(4px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(207, 155, 99, 0.2)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (window.innerWidth >= 768) {
                                    e.currentTarget.style.color = '#8C969F';
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }
                                }}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium" style={{ color: '#1f2937' }}>{subLink.label}</span>
                                  {subLink.arrow && (
                                    <span className="text-blue-600 font-bold text-lg group-hover:scale-110 group-hover:rotate-12"
                                      style={{
                                        transition: 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                        display: 'inline-block'
                                      }}>
                                      {subLink.arrow}
                                    </span>
                                  )}
                                  {subLink.targetLabel && (
                                    <span className="font-medium" style={{ color: '#1f2937' }}>{subLink.targetLabel}</span>
                                  )}
                                </div>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}

          {/* User Profile or Login Button - Mobile */}
          <li className="w-full md:hidden mt-2">
            {isAuthenticated ? (
              <div className="w-full">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                  <div>
                    <div className="font-semibold text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {user?.name || 'name'}
                    </div>
                  </div>
                  <UserIcon size="md" />
                </div>
                
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMenuOpen(false);
                  }}
                  className="text-white px-6 sm:px-8 py-3 sm:py-3 rounded-full font-semibold hover:shadow-xl hover:scale-110 transition-all duration-500 ease-out transform w-full text-sm sm:text-base touch-manipulation relative overflow-hidden group mb-2"
                  style={{ 
                    backgroundColor: '#1E65AD', 
                    fontFamily: 'Roboto, sans-serif',
                    boxShadow: '0 4px 15px rgba(30, 101, 173, 0.3)',
                    minHeight: '44px'
                  }}
                >
                  View Profile
                </button>
                
                <button
                  onClick={() => {
                    navigate("/dashboard");
                    setMenuOpen(false);
                  }}
                  className="text-white px-6 sm:px-8 py-3 sm:py-3 rounded-full font-semibold hover:shadow-xl hover:scale-110 transition-all duration-500 ease-out transform w-full text-sm sm:text-base touch-manipulation relative overflow-hidden group mb-2"
                  style={{ 
                    backgroundColor: '#1E65AD', 
                    fontFamily: 'Roboto, sans-serif',
                    boxShadow: '0 4px 15px rgba(30, 101, 173, 0.3)',
                    minHeight: '44px'
                  }}
                >
                  Dashboard
                </button>
                
                <button
                  onClick={handleLogout}
                  className="text-white px-6 sm:px-8 py-3 sm:py-3 rounded-full font-semibold hover:shadow-xl hover:scale-110 transition-all duration-500 ease-out transform w-full text-sm sm:text-base touch-manipulation relative overflow-hidden group"
                  style={{ 
                    backgroundColor: '#CF9B63', 
                    fontFamily: 'Roboto, sans-serif',
                    boxShadow: '0 4px 15px rgba(207, 155, 99, 0.3)',
                    minHeight: '44px'
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="animated-login-button w-full"
                style={{
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  transition: 'all 0.25s ease',
                  background: 'radial-gradient(65.28% 65.28% at 50% 100%, rgba(207, 155, 99, 0.6) 0%, rgba(207, 155, 99, 0) 100%), linear-gradient(0deg, #1E65AD, #1E65AD)',
                  borderRadius: '0.75rem',
                  border: '2px solid #CF9B63',
                  outline: 'none',
                  padding: '12px 18px',
                  width: '100%',
                  height: '48px'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate("/login");
                  }
                }}
              >
                <span className="fold"></span>
                <div className="points_wrapper">
                  {[...Array(10)].map((_, i) => (
                    <i key={i} className="point"></i>
                  ))}
                </div>
                <span className="inner">
                  <svg
                    className="icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    style={{ width: '18px', height: '18px' }}
                  >
                    <path d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"></path>
                  </svg>
                  Log In
                </span>
              </button>
            )}
          </li>
        </ul>

        {/* User Profile or Login Button - Right Side */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Selector */}
          <LanguageSelector />
          
          {isAuthenticated ? (
            <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 px-4 py-2 rounded-full hover:bg-gray-50 transition-all duration-200"
                >
                  <UserIcon size="md" showSelector={false} />
                  <div className="text-left">
                    <div className="font-semibold text-gray-800 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {user?.name || 'name'}
                    </div>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* User Dropdown */}
                <div className={`absolute right-0 top-full mt-2 w-64 backdrop-blur-md rounded-xl shadow-xl border py-2 z-50 transition-all duration-300 ease-out ${
                  isScrolled ? 'bg-white/80' : 'bg-white/95'
                } ${userDropdownOpen ? 'block opacity-100' : 'hidden opacity-0'}`} style={{ borderColor: '#E5E7EB' }}>
                  <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: '#E5E7EB' }}>
                    <UserIcon size="md" />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {user?.name || 'name'}
                      </div>
                      <div className="font-semibold text-gray-800 text-xs" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {user?.email || 'email'}
                      </div>
                      {user?.profession && (
                        <div className="text-xs text-blue-600 mt-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {user.profession}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate("/dashboard");
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200 text-sm"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 text-sm"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  >
                    Logout
                  </button>
                </div>
              </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="animated-login-button"
              style={{
                cursor: 'pointer',
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                transition: 'all 0.25s ease',
                background: 'radial-gradient(65.28% 65.28% at 50% 100%, rgba(223, 113, 255, 0.8) 0%, rgba(223, 113, 255, 0) 100%), linear-gradient(0deg, #7a5af8, #7a5af8)',
                borderRadius: '0.75rem',
                border: 'none',
                outline: 'none',
                padding: '12px 18px',
                width: '120px',
                height: '48px'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate("/login");
                }
              }}
            >
              <span className="fold"></span>
              <div className="points_wrapper">
                {[...Array(10)].map((_, i) => (
                  <i key={i} className="point"></i>
                ))}
              </div>
              <span className="inner">
                <svg
                  className="icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  style={{ width: '24px', height: '18px' }}
                >
                  <path d="m15.626 11.769a6 6 0 1 0 -7.252 0 9.008 9.008 0 0 0 -5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0 -5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1 -4-4zm10 14h-12a1 1 0 0 1 -1-1 7 7 0 0 1 14 0 1 1 0 0 1 -1 1z"></path>
                </svg>
                Log In
              </span>
            </button>
          )}

        </div>
      </div>
      
      {/* Smooth Scroll Progress Bar */}
      <div 
        className="absolute bottom-0 left-0 right-0 z-[10001] h-1 bg-transparent pointer-events-none"
        style={{ 
          transform: 'translateY(100%)'
        }}
      >
        <div
          className="h-full relative overflow-hidden"
          style={{
            width: `${scrollProgress}%`,
            background: 'linear-gradient(90deg, #1E65AD 0%, #CF9B63 50%, #1E65AD 100%)',
            backgroundSize: '200% 100%',
            boxShadow: '0 -2px 10px rgba(30, 101, 173, 0.3)',
            willChange: 'width',
            transition: 'width 0.1s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Shimmer effect */}
          <div
            className="absolute inset-0 shimmer opacity-60"
            style={{
              width: '100%',
              height: '100%'
            }}
          />
        </div>
      </div>
      
      {/* Animated Login Button Styles */}
      <style>{`
        .animated-login-button::before,
        .animated-login-button::after {
          content: "";
          position: absolute;
          transition: all 0.5s ease-in-out;
          z-index: 0;
        }
        .animated-login-button::before {
          inset: 1px;
          border-radius: calc(0.75rem - 1px);
          background: linear-gradient(
            177.95deg,
            rgba(255, 255, 255, 0.19) 0%,
            rgba(255, 255, 255, 0) 100%
          );
        }
        .animated-login-button::after {
          inset: 2px;
          border-radius: calc(0.75rem - 2px);
          background: radial-gradient(
              65.28% 65.28% at 50% 100%,
              rgba(207, 155, 99, 0.6) 10%,
              rgba(207, 155, 99, 0) 100%
            ),
            linear-gradient(0deg, #1E65AD, #1E65AD);
        }
        .animated-login-button:active {
          transform: scale(0.95);
        }
        // .animated-login-button:hover {
        //   border-color: #CF9B63;
        //   box-shadow: 0 0 15px rgba(207, 155, 99, 0.4);
        // }

        .points_wrapper {
          overflow: hidden;
          width: 100%;
          height: 100%;
          pointer-events: none;
          position: absolute;
          z-index: 1;
        }

        .points_wrapper .point {
          bottom: -10px;
          position: absolute;
          animation: floating-points infinite ease-in-out;
          pointer-events: none;
          width: 2px;
          height: 2px;
          background-color: #fff;
          border-radius: 9999px;
        }
        @keyframes floating-points {
          0% {
            transform: translateY(0);
          }
          85% {
            opacity: 0;
          }
          100% {
            transform: translateY(-55px);
            opacity: 0;
          }
        }
        .points_wrapper .point:nth-child(1) {
          left: 10%;
          opacity: 1;
          animation-duration: 2.35s;
          animation-delay: 0.2s;
        }
        .points_wrapper .point:nth-child(2) {
          left: 30%;
          opacity: 0.7;
          animation-duration: 2.5s;
          animation-delay: 0.5s;
        }
        .points_wrapper .point:nth-child(3) {
          left: 25%;
          opacity: 0.8;
          animation-duration: 2.2s;
          animation-delay: 0.1s;
        }
        .points_wrapper .point:nth-child(4) {
          left: 44%;
          opacity: 0.6;
          animation-duration: 2.05s;
        }
        .points_wrapper .point:nth-child(5) {
          left: 50%;
          opacity: 1;
          animation-duration: 1.9s;
        }
        .points_wrapper .point:nth-child(6) {
          left: 75%;
          opacity: 0.5;
          animation-duration: 1.5s;
          animation-delay: 1.5s;
        }
        .points_wrapper .point:nth-child(7) {
          left: 88%;
          opacity: 0.9;
          animation-duration: 2.2s;
          animation-delay: 0.2s;
        }
        .points_wrapper .point:nth-child(8) {
          left: 58%;
          opacity: 0.8;
          animation-duration: 2.25s;
          animation-delay: 0.2s;
        }
        .points_wrapper .point:nth-child(9) {
          left: 98%;
          opacity: 0.6;
          animation-duration: 2.6s;
          animation-delay: 0.1s;
        }
        .points_wrapper .point:nth-child(10) {
          left: 65%;
          opacity: 1;
          animation-duration: 2.5s;
          animation-delay: 0.2s;
        }

        .animated-login-button .inner {
          z-index: 2;
          gap: 6px;
          position: relative;
          width: 100%;
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 500;
          line-height: 1.5;
          transition: color 0.2s ease-in-out;
          font-family: 'Roboto', sans-serif;
        }

        .animated-login-button .inner svg.icon {
          width: 18px;
          height: 18px;
          transition: fill 0.1s linear;
        }

        .animated-login-button:focus svg.icon {
          fill: white;
        }
        .animated-login-button:hover svg.icon {
          fill: transparent;
          animation:
            dasharray 1s linear forwards,
            filled 0.1s linear forwards 0.95s;
        }
        @keyframes dasharray {
          from {
            stroke-dasharray: 0 0 0 0;
          }
          to {
            stroke-dasharray: 68 68 0 0;
          }
        }
        @keyframes filled {
          to {
            fill: white;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
