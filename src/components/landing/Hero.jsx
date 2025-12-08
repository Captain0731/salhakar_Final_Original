import React, { forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import QuickLinks from "./QuickLinks";

const Hero = forwardRef((props, ref) => {
  const navigate = useNavigate();

  const handleFreeTrialClick = () => {
    navigate('/pricing');
  };

  return (
    <section
      ref={ref}
      className="relative min-h-[70vh] sm:min-h-screen flex flex-col items-center justify-center text-center px-3 sm:px-4 md:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-8 sm:pb-12"
      style={{ 
        background: 'radial-gradient(ellipse at center, #B8D4E8 0%, #D8E8F0 30%, #FCFFFF 50%, #F5F5F0 100%)'
      }}
    >
      {/* Vertical Free Trial Button - Left Side */}
      <button
        onClick={handleFreeTrialClick}
        className="fixed left-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex flex-col items-center justify-center gap-3 bg-white text-[#1E65AD] px-2 py-8 rounded-r-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:translate-x-2 border-2 border-[#1E65AD] border-l-0"
        style={{
          fontFamily: "'Heebo', sans-serif",
          fontWeight: 600,
          boxShadow: '4px 0 20px rgba(30, 101, 173, 0.2)',
          minWidth: '55px'
        }}
      >
        {/* Text Container */}
        <div className="flex flex-col items-center gap-1">
          <span 
            className="transform -rotate-90"
            style={{
              fontSize: '12px',
              letterSpacing: '0.03em',
              color: '#1E65AD'
            }}
          >
            Free
          </span>
          <span 
            className="transform -rotate-90"
            style={{
              fontSize: '12px',
              letterSpacing: '0.03em',
              color: '#1E65AD'
            }}
          >
            Trial
          </span>
        </div>
        
        {/* Icon at Bottom */}
        <div className="mb-0">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className="text-[#1E65AD]"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
      </button>

      {/* Soft Radial Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(184, 212, 232, 0.4) 0%, rgba(245, 245, 240, 0.2) 70%, transparent 100%)'
        }}></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto w-full pt-4 sm:pt-8 md:pt-12 lg:pt-16 pb-4 sm:pb-8 md:pb-12 lg:pb-16">
        {/* Heading */}
        <div className="flex flex-col items-center justify-center mb-4 sm:mb-6 md:mb-8 lg:mb-12 px-2 sm:px-4">
          
          <img 
            src="/logo31.png" 
            alt="सलहाकार Logo" 
            className="w-40 sm:w-48 md:w-56 lg:w-64 xl:w-72 h-auto object-contain mb-3 sm:mb-4 md:mb-6" 
            style={{ maxWidth: '90%' }}
          />

          <p 
            className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl max-w-4xl px-3 sm:px-4 leading-relaxed text-center"
            style={{ color: '#8C969F', fontFamily: 'Heebo' }}
          >
            India’s smartest & simplest{" "}
            <span 
              className="font-semibold"
              style={{ color: '#000' }}
            >
              AI-Powered
            </span>{" "}
            multilingual legal research platform
          </p>
          
          <div className="w-10 sm:w-12 md:w-16 lg:w-20 xl:w-24 h-0.5 sm:h-1 mx-auto mt-2 sm:mt-3 md:mt-4 lg:mt-6 rounded-full" style={{ backgroundColor: '#CF9B63' }}></div>
        </div>

        {/* Search + Quick Links */}
        <div className="mt-3 sm:mt-4 md:mt-6 lg:mt-8 w-full max-w-4xl mx-auto px-2 sm:px-3 md:px-4">
          <SearchBar />
          <QuickLinks />
        </div>
      </div>

    </section>
  );
});

Hero.displayName = 'Hero';

export default Hero;
