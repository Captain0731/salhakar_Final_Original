import React from "react";
import { useNavigate } from "react-router-dom";
import useScrollAnimation from "../../hooks/useScrollAnimation";

// Separate component for feature cards with clean modern design
const FeatureCard = ({ feature, index, onClick }) => {
  const { ref: featureRef, isVisible: isFeatureVisible } = useScrollAnimation({ 
    threshold: 0.2, 
    rootMargin: '50px',
    delay: index * 100 
  });
  
  const [isHovered, setIsHovered] = React.useState(false);

  // Determine colors for each card based on feature ID
  const getCardColors = (id) => {
    switch(id) {
      case 1: // Legal Judgment
        return { linkColor: '#1E65AD', buttonBg: '#1E65AD', buttonIcon: '#FFFFFF' };
      case 2: // Law Mapping
        return { linkColor: '#CF9B63', buttonBg: '#FED7AA', buttonIcon: '#CF9B63' };
      case 3: // Law Library
        return { linkColor: '#8C969F', buttonBg: '#E5E7EB', buttonIcon: '#6B7280' };
      case 4: // Legal Templates
        return { linkColor: '#1E65AD', buttonBg: '#1E65AD', buttonIcon: '#FFFFFF' };
      case 5: // Smart Dashboard
        return { linkColor: '#1E65AD', buttonBg: '#1E65AD', buttonIcon: '#FFFFFF'  };
      case 6: // YouTube Summarizer
        return { linkColor: '#CF9B63', buttonBg: '#FED7AA', buttonIcon: '#CF9B63' };
      case 7: // Kiki AI
        return {linkColor: '#8C969F', buttonBg: '#E5E7EB', buttonIcon: '#6B7280' };
      default:
        return { linkColor: '#1E65AD', buttonBg: '#E5E7EB', buttonIcon: '#6B7280' };
    }
  };

  const colors = getCardColors(feature.id);

  return (
    <div
      ref={featureRef}
      className={`group cursor-pointer transform transition-all duration-300 flex ${
        isFeatureVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-12 scale-90'
      }`}
      onClick={() => onClick(feature.path)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        transitionDelay: `${index * 80}ms`,
        cursor: 'pointer'
      }}
    >
      <div 
        className="relative w-full flex flex-col overflow-hidden"
        style={{
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* Clean White Card */}
        <div 
          className="relative rounded-2xl sm:rounded-3xl flex flex-col flex-grow bg-white overflow-hidden"
          // style={{
          //   boxShadow: isHovered 
          //     ? '0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          //     : '0 4px 20px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          //   transition: 'box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          // }}
        >
          {/* Content Container */}
          <div className="p-4 sm:p-6 md:p-8 flex flex-col flex-grow relative z-10">
            {/* Title */}
            <h3 
              className="text-base sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight"
              style={{ 
                color: '#1E65AD',
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 700
              }}
            >
              {feature.title}
            </h3>

            {/* Description - Hidden on mobile */}
            <p 
              className="hidden sm:block text-sm sm:text-base text-gray-500 leading-relaxed mb-6 sm:mb-8 flex-grow"
              style={{ 
                fontFamily: 'Heebo',
                color: '#6B7280',
                lineHeight: '1.6'
              }}
            >
              {feature.description}
            </p>

            {/* Footer with Explore Feature Link and Circular Button */}
            <div className="flex items-center justify-between mt-auto">
              {/* Explore Feature Text - Hidden on mobile */}
              <span 
                className="hidden sm:inline text-sm sm:text-base font-medium transition-all duration-300"
                style={{ 
                  color: colors.linkColor,
                  fontFamily: 'Heebo',
                  fontWeight: 500
                }}
              >
                Explore Feature
              </span>
              
              {/* Circular Arrow Button */}
              <div 
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ml-auto sm:ml-0"
                style={{
                  background: colors.buttonBg,
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: isHovered 
                    ? '0 4px 12px rgba(0, 0, 0, 0.15)'
                    : '0 2px 6px rgba(0, 0, 0, 0.1)'
                }}
              >
                <svg 
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" 
                  style={{ color: colors.buttonIcon }}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  {feature.id === 4 ? (
                    // Down arrow for Legal Templates
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  ) : (
                    // Right arrow for others
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  )}
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Features = React.forwardRef((props, ref) => {
  const navigate = useNavigate();
  const internalRef = React.useRef(null);
  const sectionRef = ref || internalRef;
  const { ref: animationRef, isVisible } = useScrollAnimation({ threshold: 0.1, rootMargin: '50px' });
  
  // Combine refs
  React.useEffect(() => {
    if (typeof sectionRef === 'function') {
      sectionRef(animationRef.current);
    } else if (sectionRef && 'current' in sectionRef) {
      sectionRef.current = animationRef.current;
    }
  }, [sectionRef, animationRef]);

  const features = [
    {
      id: 1,
      title: "Legal Judgment",
      description: "Access comprehensive database of legal judgments from High Courts and Supreme Court with advanced search and filtering capabilities.",
      color: "#1E65AD",
      secondaryColor: "#CF9B63",
      path: "/judgment-access"
    },
    {
      id: 2,
      title: "Law Mapping",
      description: "Seamlessly map between old and new legal frameworks including BNS to IEA, BNSS to CrPC, and BNS to IPC transitions.",
      color: "#CF9B63",
      secondaryColor: "#1E65AD",
      path: "/law-mapping"
    },
    {
      id: 3,
      title: "Law Library",
      description: "Comprehensive collection of Central Acts and State Acts with detailed provisions, amendments, and cross-references.",
      color: "#8C969F",
      secondaryColor: "#1E65AD",
      path: "/law-library"
    },
    // {
    //   id: 4,
    //   title: "Legal Templates",
    //   description: "Professional legal document templates for various purposes including contracts, agreements, and legal notices.",
    //   color: "#1E65AD",
    //   secondaryColor: "#8C969F",
    //   path: "/legal-template"
    // },
    {
      id: 5,
      title: "Smart Dashboard",
      description: "Intelligent legal assistant powered by AI to answer queries, provide legal guidance, and assist with research.",
      color: "#1E65AD",
      secondaryColor: "#CF9B63",
      path: "/dashboard"
    },
    {
      id: 6,
      title: "YouTube Summarizer",
      description: "AI-powered summarization of legal YouTube videos, extracting key insights and important legal concepts.",
      color: "#8C969F",
      secondaryColor: "#CF9B63",
      path: "/youtube-summary"
    },
    {
      id: 7,
      title: "Kiki AI",
      description: "Smart assistant answers, automates, and guides your legal research.",
      color: "#8C969F",
      secondaryColor: "#CF9B63",
      path: "/legal-chatbot"
    }
  ];

  const handleFeatureClick = (path) => {
    navigate(path);
  };

  return (
    <section 
      ref={(node) => {
        if (typeof sectionRef === 'function') {
          sectionRef(node);
        } else if (sectionRef && 'current' in sectionRef) {
          sectionRef.current = node;
        }
        if (animationRef.current !== node) {
          animationRef.current = node;
        }
      }}
      className="py-12 sm:py-16 md:py-20 relative overflow-hidden"
      style={{ 
        backgroundColor: '#F9FAFC'
      }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full opacity-10 animate-float" style={{ backgroundColor: '#1E65AD' }}></div>
        <div className="absolute top-40 right-32 w-24 h-24 rounded-full opacity-10 animate-float animation-delay-1000" style={{ backgroundColor: '#CF9B63' }}></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 rounded-full opacity-10 animate-float animation-delay-2000" style={{ backgroundColor: '#8C969F' }}></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 rounded-full opacity-10 animate-float animation-delay-3000" style={{ backgroundColor: '#1E65AD' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mb-3 sm:mb-4 md:mb-6 px-2 sm:px-4 leading-tight tracking-tight"
            style={{ 
              color: '#1E65AD', 
              fontFamily: "'Bricolage Grotesque', sans-serif",
              textShadow: '0 2px 4px rgba(30, 101, 173, 0.1)',
              letterSpacing: '-0.02em',
              fontWeight: 600
            }}
          >
            Our Features
          </h2>
          
          <p 
            className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto leading-relaxed mb-4 sm:mb-6 md:mb-8 px-3 sm:px-4"
            style={{ color: '#8C969F', fontFamily: 'Heebo' }}
          >
            Comprehensive legal-tech solutions for lawyers, students, and researchers that save hours every week.
          </p>
          
          <div className="w-12 sm:w-16 md:w-20 lg:w-24 h-0.5 sm:h-1 mx-auto rounded-full" style={{ backgroundColor: '#CF9B63' }}></div>
        </div>

        {/* Features Grid - 2 columns (pairs) only on mobile, 3 columns on larger screens */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard 
              key={feature.id}
              feature={feature}
              index={index}
              onClick={handleFeatureClick}
            />
          ))}
        </div>

      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
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
    </section>
  );
});

Features.displayName = 'Features';

export default Features;
