import React, { useState, useEffect } from "react";
import useScrollAnimation from "../../hooks/useScrollAnimation";

const Stats = () => {
  const { ref: sectionRef, isVisible } = useScrollAnimation({ threshold: 0.1, rootMargin: '50px' });
  const stats = [
    {
      number: "16",
      unit: "M",
      label: "Legal Judgments",
      suffix: "+"
    },
    {
      number: "11",
      unit: "K",
      label: "Total Acts",
      suffix: "+"
    },
    {
      number: "12",
      unit: "",
      label: "Languages Supported",
      suffix: "+"
    },
    {
      number: "24/7",
      unit: "/7",
      label: "Consumer Support",
      suffix: ""
    }
  
  ];
  const [countedStats, setCountedStats] = useState(stats.map(stat => {
    const num = parseInt(stat.number);
    return isNaN(num) ? stat.number : num;
  }));

  // Count up animation
  useEffect(() => {
    if (isVisible) {
      // Reset to 0 then count up
      setCountedStats([0, 0, 0, 0]);
      
      setTimeout(() => {
        const duration = 2000; // 2 seconds
        const steps = 60;
        const interval = duration / steps;
        const timers = [];
        
        stats.forEach((stat, index) => {
          const target = parseInt(stat.number);
          // Skip animation for non-numeric values like "24/7"
          if (isNaN(target)) {
            return;
          }
          
          const increment = target / steps;
          let current = 0;
          
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCountedStats(prev => {
                const newStats = [...prev];
                newStats[index] = target;
                return newStats;
              });
              clearInterval(timer);
            } else {
              setCountedStats(prev => {
                const newStats = [...prev];
                newStats[index] = Math.floor(current);
                return newStats;
              });
            }
          }, interval);
          
          timers.push(timer);
        });
        
        return () => {
          timers.forEach(timer => clearInterval(timer));
        };
      }, 100);
    }
  }, [isVisible]);

  return (
    <section 
      ref={sectionRef}
      className={`py-12 sm:py-16 md:py-20 transition-all duration-1000 ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-100 translate-y-0'
      }`}
      style={{ backgroundColor: '#F9FAFC' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6"
            style={{ color: '#1E65AD', fontFamily: 'Helvetica Hebrew Bold, sans-serif' }}
          >
            We're Good with Numbers
          </h2>
          <div className="w-16 sm:w-20 h-1 mx-auto rounded-full" style={{ backgroundColor: '#CF9B63' }}></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="relative group"
              style={{
                animationDelay: `${index * 150}ms`,
                animation: isVisible ? 'slideInScale 0.8s ease-out forwards' : 'none'
              }}
            >
              {/* Animated Card */}
              <div 
                className="bg-white rounded-2xl p-6 sm:p-8 text-center border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden"
                style={{ 
                  borderColor: 'transparent',
                  boxShadow: '0 4px 20px rgba(30, 101, 173, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#1E65AD';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(30, 101, 173, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(30, 101, 173, 0.1)';
                }}
              >
                {/* Animated Background Gradient on Hover */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 101, 173, 0.05) 0%, rgba(207, 155, 99, 0.05) 100%)'
                  }}
                ></div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Number with Counter Animation */}
                  <div 
                    className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-2 sm:mb-3 transition-all duration-300"
                    style={{ 
                      fontFamily: 'Helvetica Hebrew Bold, sans-serif',
                      color: '#1E65AD',
                      position: 'relative'
                    }}
                  >
                    <span style={{ 
                      display: 'inline-block',
                      color: '#1E65AD',
                      textShadow: '0 2px 8px rgba(30, 101, 173, 0.2)'
                    }}>
                      {countedStats[index]}
                    </span>
                    {stat.unit && (
                      <span style={{ 
                        display: 'inline-block',
                        color: '#1E65AD',
                        textShadow: '0 2px 8px rgba(30, 101, 173, 0.2)'
                      }}>{stat.unit}</span>
                    )}
                    {stat.suffix && (
                      <span style={{ 
                        color: '#CF9B63',
                        marginLeft: '2px',
                        display: 'inline-block',
                        fontWeight: 'bold'
                      }}>{stat.suffix}</span>
                    )}
                  </div>
                  
                  {/* Label */}
                  <div 
                    className="text-xs sm:text-sm md:text-base font-medium transition-colors duration-300"
                    style={{ 
                      color: '#8C969F',
                      fontFamily: 'Roboto, sans-serif'
                    }}
                  >
                    {stat.label}
                  </div>
                </div>

                {/* Animated Border Effect */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(135deg, #1E65AD, #CF9B63)',
                    padding: '2px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude'
                  }}
                ></div>
              </div>

              {/* Floating Animation Dot */}
              <div 
                className="absolute -top-2 -right-2 w-4 h-4 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"
                style={{ backgroundColor: '#CF9B63' }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideInScale {
          0% { 
            opacity: 0; 
            transform: translateY(40px) scale(0.8); 
          }
          60% {
            transform: translateY(-5px) scale(1.05);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px); 
          }
          50% { 
            transform: translateY(-10px); 
          }
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Stats;

