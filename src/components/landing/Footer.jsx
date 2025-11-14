import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Linkedin, X, Youtube, Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSubscribe = () => {
    if (isAuthenticated) {
      // If already logged in, redirect to landing page
      navigate("/");
    } else {
      // If not logged in, redirect to login page
      navigate("/login");
    }
  };

  const footerLinks = {
    services: [
      { name: "Legal Judgment", href: "/judgment-access" },
      { name: "Law Library", href: "/law-library" },
      { name: "Law Mapping", href: "/law-mapping" },
      { name: "YouTube Summarizer", href: "/youtube-summary" }
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Our Team", href: "/about#our-team" },
      { name: "Careers", href: "/about#careers" },
      { name: "Blog", href: "/blog" }
    ],
    // resources: [
    //   { name: "Help Center", href: "/help-center" },
    //   { name: "Legal Templates", href: "/legal-templates" },
    //   { name: "Case Studies", href: "/case-studies" }
    // ],
    legal: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms of Service", href: "/terms-of-service" },
      { name: "Cookie Policy", href: "/cookie-policy" }
    ]
  };

  const socialLinks = [
    { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/company/salhakar/" },
    { name: "Twitter", icon: null, image: "/twitter.png", href: "https://x.com/Salhakar_legal" },
    { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/salhakar.legal/" },
    { name: "YouTube", icon: Youtube, href: "#youtube" }
  ];
  
  const contactInfo = [
    { icon: Mail, text: "inquiry@salhakar.com" },
    { icon: Phone, text: "+91 7069900088" },
    { icon: MapPin, text: "Gandhinagar, Gujarat, India" }
  ];

  return (
    <footer className="relative overflow-hidden" style={{ backgroundColor: '#1E65AD' }}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-10 animate-float" style={{ backgroundColor: '#CF9B63' }}></div>
        <div className="absolute top-20 right-20 w-24 h-24 rounded-full opacity-10 animate-float animation-delay-1000" style={{ backgroundColor: '#8C969F' }}></div>
        <div className="absolute bottom-20 left-20 w-28 h-28 rounded-full opacity-10 animate-float animation-delay-2000" style={{ backgroundColor: '#CF9B63' }}></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 rounded-full opacity-10 animate-float animation-delay-3000" style={{ backgroundColor: '#8C969F' }}></div>
        
        {/* Subtle geometric patterns */}
        <div className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full opacity-30" style={{ backgroundColor: '#CF9B63' }}></div>
        <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 rounded-full opacity-25" style={{ backgroundColor: '#8C969F' }}></div>
        <div className="absolute bottom-1/3 left-1/3 w-1 h-1 rounded-full opacity-30" style={{ backgroundColor: '#CF9B63' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
            {/* Brand Section */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="mb-6">
                <div className="mb-4">
                  <img src="/salahakar .PNG" alt="Salhakar" className="w-50 h-20 object-contain" />
                </div>
                
                <p 
                  className="text-base sm:text-lg leading-relaxed mb-6"
                  style={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'Roboto, sans-serif' }}
                >
                  Empowering legal professionals with AI-driven research tools, 
                  comprehensive judgment access, and modern practice management solutions.
                </p>
              </div>

              {/* Contact Information */}
              <div className="space-y-3 mb-6">
                {contactInfo.map((contact, index) => {
                  const IconComponent = contact.icon;
                  return (
                    <div key={index} className="flex items-center">
                      <IconComponent className="w-5 h-5 mr-3" style={{ color: 'rgba(255, 255, 255, 0.9)' }} />
                      <span 
                        className="text-sm"
                        style={{ color: 'rgba(255, 255, 255, 0.9)', fontFamily: 'Roboto, sans-serif' }}
                      >
                        {contact.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#CF9B63';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      }}
                      aria-label={social.name}
                    >
                      {social.image ? (
                        <img 
                          src={social.image} 
                          alt={social.name}
                          className="w-5 h-5 object-contain"
                          style={{ 
                            filter: 'brightness(0) invert(1)',
                            opacity: 0.9
                          }}
                        />
                      ) : (
                        <IconComponent className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.9)' }} />
                      )}
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Services and Company - Side by Side */}
            <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {/* Services Links */}
              <div>
                <h4 
                  className="text-base sm:text-lg font-semibold mb-4 sm:mb-6"
                  style={{ color: 'white', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}
                >
                  Services
                </h4>
                <ul className="space-y-3">
                  {footerLinks.services.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="text-sm transition-colors duration-300 hover:opacity-80"
                        style={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'Roboto, sans-serif' }}
                        onMouseEnter={(e) => {
                          e.target.style.color = '#CF9B63';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                        }}
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h4 
                  className="text-base sm:text-lg font-semibold mb-4 sm:mb-6"
                  style={{ color: 'white', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}
                >
                  Company
                </h4>
                <ul className="space-y-3">
                  {footerLinks.company.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.href}
                        className="text-sm transition-colors duration-300 hover:opacity-80"
                        style={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'Roboto, sans-serif' }}
                        onMouseEnter={(e) => {
                          e.target.style.color = '#CF9B63';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                        }}
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Resources Links */}
            {/* <div>
              <h4 
                className="text-base sm:text-lg font-semibold mb-4 sm:mb-6"
                style={{ color: 'white', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}
              >
                Resources
              </h4>
              <ul className="space-y-3">
                {footerLinks.resources.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-sm transition-colors duration-300 hover:opacity-80"
                      style={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'Roboto, sans-serif' }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#CF9B63';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                      }}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div> */}
          </div>
        </div>

        {/* Newsletter Subscription */}
        <div 
          className="py-6 sm:py-8 border-t border-opacity-20"
          style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="mb-4 lg:mb-0 text-center lg:text-left w-full lg:w-auto">
              <h4 
                className="text-lg sm:text-xl font-semibold mb-2"
                style={{ color: 'white', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}
              >
                Stay Updated
              </h4>
              <p 
                className="text-sm sm:text-base"
                style={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'Roboto, sans-serif' }}
              >
                Get the latest legal insights and platform updates delivered to your inbox.
              </p>
            </div>
            
            <div className="flex flex-row gap-2 sm:gap-3 w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-0 focus:outline-none focus:ring-4 focus:ring-opacity-50 flex-1 lg:flex-none lg:w-64 text-sm sm:text-base"
                style={{ 
                  fontFamily: 'Roboto, sans-serif',
                  focusRingColor: 'rgba(207, 155, 99, 0.3)'
                }}
              />
              <button
                onClick={handleSubscribe}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 whitespace-nowrap text-sm sm:text-base flex-shrink-0"
                style={{ 
                  backgroundColor: '#CF9B63', 
                  fontFamily: 'Roboto, sans-serif',
                  boxShadow: '0 4px 15px rgba(207, 155, 99, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#8C969F';
                  e.target.style.boxShadow = '0 6px 20px rgba(140, 150, 159, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#CF9B63';
                  e.target.style.boxShadow = '0 4px 15px rgba(207, 155, 99, 0.3)';
                }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="py-4 sm:py-6 border-t border-opacity-20"
          style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
            <div className="mb-4 sm:mb-0">
              <p 
                className="text-xs sm:text-sm"
                style={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Roboto, sans-serif' }}
              >
                © {currentYear} सलहाकार. All rights reserved.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-end space-x-4 sm:space-x-6">
              {footerLinks.legal.map((link, index) => {
                const isInternalLink = link.href.startsWith('/') && !link.href.endsWith('.pdf');
                
                if (isInternalLink) {
                  return (
                    <Link
                      key={index}
                      to={link.href}
                      className="text-xs transition-colors duration-300 hover:opacity-80"
                      style={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Roboto, sans-serif' }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#CF9B63';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                      }}
                    >
                      {link.name}
                    </Link>
                  );
                } else {
                  return (
                    <a
                      key={index}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs transition-colors duration-300 hover:opacity-80"
                      style={{ color: 'rgba(255, 255, 255, 0.7)', fontFamily: 'Roboto, sans-serif' }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#CF9B63';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = 'rgba(255, 255, 255, 0.7)';
                      }}
                    >
                      {link.name}
                    </a>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
