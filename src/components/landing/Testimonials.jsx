import React, { useState, useEffect } from "react";
import useScrollAnimation from "../../hooks/useScrollAnimation";

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Modal functions
  const openModal = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTestimonial(null);
    document.body.style.overflow = 'unset'; // Restore scroll
  };

  // Close modal on ESC key
  useEffect(() => {
    if (!isModalOpen) return;
    
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        setIsModalOpen(false);
        setSelectedTestimonial(null);
        document.body.style.overflow = 'unset';
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isModalOpen]);

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
      className="py-10 sm:py-12 md:py-16 relative overflow-hidden"
      style={{ backgroundColor: '#F9FAFC' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <span 
            className="inline-block px-4 py-2 rounded-full text-sm font-semibold mb-3"
            style={{ 
              backgroundColor: '#EBF5FF', 
              color: '#1E65AD',
              fontFamily: 'Heebo, sans-serif'
            }}
          >
            Testimonials
          </span>
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3"
            style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            What Our Users Say
          </h2>
          <p 
            className="text-base sm:text-lg max-w-2xl mx-auto"
            style={{ color: '#8C969F', fontFamily: 'Heebo, sans-serif' }}
          >
            Trusted by legal professionals across India
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative" style={{ minHeight: '320px' }}>
          {/* Left Arrow Button */}
          <button
            onClick={goToPrev}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 z-20
                       w-12 h-12 lg:w-14 lg:h-14 rounded-full
                       bg-white shadow-lg border border-gray-200
                       items-center justify-center
                       transition-all duration-300
                       hover:scale-110 hover:shadow-xl active:scale-95
                       hover:bg-gray-50 group"
            aria-label="Previous testimonials"
          >
            <svg
              className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6" style={{ gap: 'clamp(0.75rem, 1.5vw, 1.5rem)' }}>
            {visibleCards.map(({ index, position }) => {
              const testimonial = testimonials[index];
              const isCenter = position === 'center';
              
              if (isMobile && !isCenter) return null;
                
                return (
                  <div 
                  key={`${testimonial.id}-${position}`}
                  className="flex-shrink-0 transition-all duration-500 ease-out"
                  style={{
                    width: isMobile 
                      ? 'clamp(280px, 90vw, 360px)' 
                      : isCenter 
                        ? 'clamp(320px, 25vw, 420px)' 
                        : 'clamp(280px, 20vw, 350px)',
                    maxWidth: isMobile ? 'clamp(280px, 90vw, 360px)' : 'none',
                    minWidth: isMobile ? '280px' : isCenter ? 'clamp(320px, 25vw, 420px)' : 'clamp(280px, 20vw, 350px)',
                    opacity: isCenter ? 1 : 0.5,
                    transform: `scale(${isCenter ? 1 : 0.85}) translateY(${isCenter ? 0 : 20}px)`,
                    zIndex: isCenter ? 10 : 5
                  }}
                >
                  <div
                    onClick={() => openModal(testimonial)}
                    className="rounded-3xl transition-all duration-300 relative overflow-hidden cursor-pointer hover:scale-105"
                    style={{ 
                      backgroundColor: isCenter ? '#FFFFFF' : '#F3F4F6',
                      boxShadow: isCenter 
                        ? '0 25px 50px -12px rgba(30, 101, 173, 0.25)' 
                        : '0 10px 25px -10px rgba(0, 0, 0, 0.1)',
                      border: isCenter ? '2px solid #1E65AD' : '1px solid #E5E7EB',
                      padding: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                      borderRadius: 'clamp(1rem, 2vw, 1.5rem)'
                    }}
                  >
                    {/* Quote Icon */}
                        <div
                      className="absolute opacity-10"
                      style={{ 
                        color: '#1E65AD',
                        top: 'clamp(1rem, 2vw, 1.5rem)',
                        right: 'clamp(1rem, 2vw, 1.5rem)',
                        fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
                        lineHeight: '1'
                      }}
                        >
                      "
                    </div>

                    {/* Stars */}
                    <div className="flex gap-1" style={{ marginBottom: 'clamp(0.75rem, 1.5vw, 1.25rem)' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                          key={star}
                          fill="#CF9B63"
                                viewBox="0 0 20 20"
                          style={{ width: 'clamp(1rem, 1.5vw, 1.25rem)', height: 'clamp(1rem, 1.5vw, 1.25rem)' }}
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>

                    {/* Testimonial Text */}
                          <blockquote 
                      className="leading-relaxed"
                      style={{ 
                        color: isCenter ? '#374151' : '#6B7280', 
                        fontFamily: 'Heebo, sans-serif',
                        fontSize: 'clamp(0.875rem, 1.2vw, 1.1rem)',
                        lineHeight: '1.75',
                        marginBottom: 'clamp(1rem, 2vw, 1.5rem)'
                      }}
                          >
                            "{testimonial.content}"
                          </blockquote>

                    {/* Divider */}
                            <div 
                      className="rounded-full"
                      style={{ 
                        backgroundColor: isCenter ? '#1E65AD' : '#D1D5DB',
                        width: 'clamp(2.5rem, 4vw, 3rem)',
                        height: 'clamp(0.25rem, 0.5vw, 0.375rem)',
                        marginBottom: 'clamp(0.75rem, 1.5vw, 1.25rem)'
                      }}
                    />

                    {/* Author */}
                    <div>
                              <h4 
                        className="font-bold"
                        style={{ 
                          color: isCenter ? '#1E65AD' : '#374151', 
                          fontFamily: "'Bricolage Grotesque', sans-serif",
                          fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
                          marginBottom: 'clamp(0.25rem, 0.5vw, 0.5rem)'
                        }}
                              >
                                {testimonial.name}
                              </h4>
                              <p 
                        className="text-sm"
                        style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
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
                );
              })}
            </div>

          {/* Right Arrow Button */}
          <button
            onClick={goToNext}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 z-20
                       w-12 h-12 lg:w-14 lg:h-14 rounded-full
                       bg-white shadow-lg border border-gray-200
                       items-center justify-center
                       transition-all duration-300
                       hover:scale-110 hover:shadow-xl active:scale-95
                       hover:bg-gray-50 group"
            aria-label="Next testimonials"
          >
            <svg
              className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Dots */}
        <div className="flex items-center justify-center mt-6 sm:mt-8">
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

      {/* Modal Popup */}
      {isModalOpen && selectedTestimonial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <h3 className="text-xl font-bold text-gray-900">Testimonial Details</h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              {/* User Info */}
              <div className="mb-6">
                <h4 className="text-2xl font-bold text-gray-900 mb-1">
                  {selectedTestimonial.name}
                </h4>
                <p className="text-lg text-blue-600 font-medium mb-1">
                  {selectedTestimonial.title}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedTestimonial.company}
                </p>
              </div>

              {/* Stars Rating */}
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-6 h-6"
                    fill="#CF9B63"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote Icon */}
              <div className="absolute top-20 right-8 text-7xl text-blue-50 font-serif leading-none">
                "
              </div>

              {/* Testimonial Content */}
              <div className="relative">
                <blockquote className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-6">
                  "{selectedTestimonial.content}"
                </blockquote>
              </div>

              {/* Divider */}
              <div className="w-20 h-1 rounded-full bg-blue-600 mb-6"></div>

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Verified User:</span> This testimonial has been verified by our team.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end rounded-b-2xl">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Testimonials;
