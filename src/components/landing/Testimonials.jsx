import React, { useState, useEffect } from "react";
import useScrollAnimation from "../../hooks/useScrollAnimation";

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { ref: sectionRef, isVisible } = useScrollAnimation({ threshold: 0.1, rootMargin: '50px' });
  
  const testimonials = [
    {
      id: 1,
      name: "Dr. Priya Sharma",
      title: "Senior Advocate",
      company: "Supreme Court",
      content: "When you find something this good, you have to let everyone know about it. सलहाकार has completely transformed my legal research workflow.",
      avatar: "👩‍⚖️"
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      title: "Legal Consultant",
      company: "Kumar Legal Services",
      content: "If I had a nickel for every hour this thing saved me in my workflow, I'd have so many nickels that I'd need a coin roller!",
      avatar: "👨‍💼"
    },
    {
      id: 3,
      name: "Anita Mehta",
      title: "Law Student",
      company: "National Law University",
      content: "After months of hearing about this from my friends, I finally decided to try it. I'm not disappointed at all!",
      avatar: "👩‍🎓"
    },
    {
      id: 4,
      name: "Vikram Singh",
      title: "Managing Partner",
      company: "Singh & Partners",
      content: "सलहाकार has transformed our legal research process completely. The AI-powered features save us hours every day.",
      avatar: "👨‍💻"
    },
    {
      id: 5,
      name: "Dr. Meera Patel",
      title: "Legal Researcher",
      company: "Institute of Legal Studies",
      content: "The platform's AI capabilities are remarkable. It's become an essential part of our research workflow.",
      avatar: "👩‍🔬"
    },
    {
      id: 6,
      name: "Arjun Gupta",
      title: "Corporate Lawyer",
      company: "Gupta & Associates",
      content: "The old-to-new law mapping feature helps me stay updated with legislative changes effortlessly.",
      avatar: "👨‍⚖️"
    }
  ];

  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const totalSlides = testimonials.length;

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  // Get visible cards
  const getVisibleCards = () => {
    const prev = (currentSlide - 1 + totalSlides) % totalSlides;
    const next = (currentSlide + 1) % totalSlides;
    return [
      { index: prev, position: 'left' },
      { index: currentSlide, position: 'center' },
      { index: next, position: 'right' }
    ];
  };

  const visibleCards = getVisibleCards();

  return (
    <section 
      ref={sectionRef}
      className="py-16 sm:py-20 lg:py-24 relative overflow-hidden"
      style={{ backgroundColor: '#F9FAFC' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span 
            className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-4"
            style={{ 
              backgroundColor: '#EBF5FF', 
              color: '#1E65AD',
              fontFamily: 'Heebo, sans-serif'
            }}
          >
            Testimonials
          </span>
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            What Our Users Say
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ color: '#8C969F', fontFamily: 'Heebo, sans-serif' }}
          >
            Trusted by legal professionals across India
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative" style={{ minHeight: '400px' }}>
          <div className="flex items-center justify-center gap-6 md:gap-8">
            {visibleCards.map(({ index, position }) => {
              const testimonial = testimonials[index];
              const isCenter = position === 'center';
              
              if (isMobile && !isCenter) return null;
              
              return (
                <div
                  key={`${testimonial.id}-${position}`}
                  className="flex-shrink-0 transition-all duration-500 ease-out"
                  style={{
                    width: isMobile ? '100%' : isCenter ? '400px' : '320px',
                    maxWidth: isMobile ? '360px' : 'none',
                    opacity: isCenter ? 1 : 0.5,
                    transform: `scale(${isCenter ? 1 : 0.85}) translateY(${isCenter ? 0 : 20}px)`,
                    zIndex: isCenter ? 10 : 5,
                    filter: isCenter ? 'none' : 'blur(1px)'
                  }}
                >
                  <div
                    className="rounded-3xl p-8 transition-all duration-300 relative overflow-hidden"
                    style={{
                      backgroundColor: isCenter ? '#FFFFFF' : '#F3F4F6',
                      boxShadow: isCenter 
                        ? '0 25px 50px -12px rgba(30, 101, 173, 0.25)' 
                        : '0 10px 25px -10px rgba(0, 0, 0, 0.1)',
                      border: isCenter ? '2px solid #1E65AD' : '1px solid #E5E7EB'
                    }}
                  >
                    {/* Quote Icon */}
                    <div 
                      className="absolute top-6 right-6 text-5xl opacity-10"
                      style={{ color: '#1E65AD' }}
                    >
                      "
                    </div>

                    {/* Stars */}
                    <div className="flex gap-1 mb-6">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className="w-5 h-5"
                          fill="#CF9B63"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* Testimonial Text */}
                    <blockquote 
                      className="mb-8 leading-relaxed"
                      style={{ 
                        color: isCenter ? '#374151' : '#6B7280', 
                        fontFamily: 'Heebo, sans-serif',
                        fontSize: '1.1rem',
                        lineHeight: '1.75'
                      }}
                    >
                      "{testimonial.content}"
                    </blockquote>

                    {/* Divider */}
                    <div 
                      className="w-12 h-1 rounded-full mb-6"
                      style={{ backgroundColor: isCenter ? '#1E65AD' : '#D1D5DB' }}
                    />

                    {/* Author */}
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
                        style={{ 
                          background: isCenter 
                            ? 'linear-gradient(135deg, #1E65AD 0%, #2A7BC8 100%)' 
                            : '#E5E7EB',
                          boxShadow: isCenter ? '0 4px 12px rgba(30, 101, 173, 0.3)' : 'none'
                        }}
                      >
                        {testimonial.avatar}
                      </div>
                      <div>
                        <h4 
                          className="font-bold text-lg"
                          style={{ 
                            color: isCenter ? '#1E65AD' : '#374151', 
                            fontFamily: "'Bricolage Grotesque', sans-serif" 
                          }}
                        >
                          {testimonial.name}
                        </h4>
                        <p 
                          className="text-sm"
                          style={{ 
                            color: isCenter ? '#CF9B63' : '#8C969F', 
                            fontFamily: 'Heebo, sans-serif' 
                          }}
                        >
                          {testimonial.title}, {testimonial.company}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex items-center justify-center mt-10">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSlides }, (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="transition-all duration-300"
                style={{
                  width: index === currentSlide ? '28px' : '10px',
                  height: '10px',
                  borderRadius: '5px',
                  backgroundColor: index === currentSlide ? '#1E65AD' : '#D1D5DB'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
