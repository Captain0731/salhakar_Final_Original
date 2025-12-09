import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useScrollAnimation from "../../hooks/useScrollAnimation";

const BlogSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { ref: sectionRef, isVisible } = useScrollAnimation({ threshold: 0.1, rootMargin: '50px' });

  const blogPosts = [
    {
      id: 1,
      title: "Understanding the New Legal Framework",
      description: "Explore the latest changes in Indian legal system and how they impact modern legal practice. Learn about recent amendments and their implications for legal professionals.",
      category: "Legal Updates",
      author: "Dr. Priya Sharma",
      date: "Dec 15, 2024",
      image: "📚",
      readTime: "8 min",
      fullContent: "The Indian legal system has undergone significant transformations in recent years. This comprehensive guide explores the latest amendments, their implications, and how legal professionals can adapt to these changes effectively."
    },
    {
      id: 2,
      title: "AI-Powered Legal Research",
      description: "Discover how artificial intelligence is revolutionizing legal research and case analysis. See how modern tools are transforming the way lawyers work.",
      category: "Technology",
      author: "Rajesh Kumar",
      date: "Dec 12, 2024",
      image: "🤖",
      readTime: "6 min",
      fullContent: "Artificial intelligence is reshaping the legal industry. From automated case research to predictive analytics, AI tools are helping legal professionals work more efficiently and make better-informed decisions."
    },
    {
      id: 3,
      title: "Digital Transformation in Law Firms",
      description: "Learn how law firms are embracing digital transformation to improve efficiency and client service. Discover best practices and implementation strategies.",
      category: "Business",
      author: "Anita Mehta",
      date: "Dec 10, 2024",
      image: "💼",
      readTime: "10 min",
      fullContent: "Digital transformation is no longer optional for law firms. This article explores how leading firms are leveraging technology to streamline operations, enhance client experiences, and stay competitive in the modern legal landscape."
    },
    {
      id: 4,
      title: "Contract Management Strategies",
      description: "Master the art of digital contract management with modern tools and proven strategies. Learn how to streamline your contract workflow.",
      category: "Contracts",
      author: "Vikram Singh",
      date: "Dec 8, 2024",
      image: "📋",
      readTime: "7 min",
      fullContent: "Effective contract management is crucial for legal success. This guide covers the latest tools, strategies, and best practices for managing contracts efficiently in the digital age."
    },
    {
      id: 5,
      title: "Legal Ethics in the Digital Era",
      description: "Explore the evolving landscape of legal ethics in our digital world. Understand new challenges and responsibilities for modern lawyers.",
      category: "Ethics",
      author: "Dr. Meera Patel",
      date: "Dec 5, 2024",
      image: "⚖️",
      readTime: "9 min",
      fullContent: "As technology continues to evolve, legal professionals face new ethical challenges. This article examines the intersection of law, technology, and ethics, providing guidance for navigating this complex landscape."
    },
    {
      id: 6,
      title: "Building a Successful Practice",
      description: "Learn proven strategies for building and growing a successful legal practice. Get insights from industry experts and successful practitioners.",
      category: "Practice",
      author: "Arjun Gupta",
      date: "Dec 2, 2024",
      image: "🏆",
      readTime: "12 min",
      fullContent: "Building a successful legal practice requires more than just legal expertise. This comprehensive guide covers business development, client relationships, technology adoption, and other key factors for long-term success."
    }
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const totalSlides = blogPosts.length;

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
  const openModal = (blog) => {
    setSelectedBlog(blog);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
    document.body.style.overflow = 'unset'; // Restore scroll
  };

  // Close modal on ESC key
  useEffect(() => {
    if (!isModalOpen) return;
    
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        setIsModalOpen(false);
        setSelectedBlog(null);
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

  const getCategoryStyle = (category) => {
    const styles = {
      "Legal Updates": { bg: "#EBF5FF", color: "#1E65AD" },
      "Technology": { bg: "#FEF3E2", color: "#CF9B63" },
      "Business": { bg: "#F3F4F6", color: "#4B5563" },
      "Contracts": { bg: "#EBF5FF", color: "#1E65AD" },
      "Ethics": { bg: "#FEF3E2", color: "#CF9B63" },
      "Practice": { bg: "#F3F4F6", color: "#4B5563" }
    };
    return styles[category] || { bg: "#EBF5FF", color: "#1E65AD" };
  };

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
            Our Blog
          </span>
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3"
            style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Latest Insights
          </h2>
          <p 
            className="text-base sm:text-lg max-w-2xl mx-auto"
            style={{ color: '#8C969F', fontFamily: 'Heebo, sans-serif' }}
          >
            Stay updated with the latest trends in legal technology and best practices
          </p>
        </div>

        {/* Blog Carousel */}
        <div className="relative" style={{ minHeight: '400px' }}>
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
            aria-label="Previous blog posts"
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
              const blog = blogPosts[index];
              const isCenter = position === 'center';
              const categoryStyle = getCategoryStyle(blog.category);
              
              if (isMobile && !isCenter) return null;
                
              return (
                <div 
                  key={`${blog.id}-${position}`}
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
                    onClick={() => openModal(blog)}
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
                    {/* Image/Icon Section */}
                    <div 
                      className="relative h-32 sm:h-40 flex items-center justify-center overflow-hidden mb-4 rounded-xl"
                      style={{ 
                        background: `linear-gradient(135deg, ${categoryStyle.bg} 0%, #FFFFFF 100%)`
                      }}
                    >
                      <span 
                        className="text-4xl sm:text-5xl transition-transform duration-500 hover:scale-110 hover:rotate-6"
                      >
                        {blog.image}
                      </span>
                      
                      {/* Category Badge */}
                      <span 
                        className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold"
                        style={{ 
                          backgroundColor: categoryStyle.bg, 
                          color: categoryStyle.color,
                          fontFamily: 'Heebo, sans-serif'
                        }}
                      >
                        {blog.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 
                      className="font-bold mb-2 leading-tight"
                      style={{ 
                        color: isCenter ? '#1E65AD' : '#374151', 
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
                        marginBottom: 'clamp(0.5rem, 1vw, 0.75rem)'
                      }}
                    >
                      {blog.title}
                    </h3>

                    {/* Description */}
                    <p 
                      className="leading-relaxed mb-3"
                      style={{ 
                        color: isCenter ? '#6B7280' : '#8C969F', 
                        fontFamily: 'Heebo, sans-serif',
                        fontSize: 'clamp(0.75rem, 1vw, 0.875rem)',
                        lineHeight: '1.6',
                        marginBottom: 'clamp(0.75rem, 1.5vw, 1rem)'
                      }}
                    >
                      {blog.description}
                    </p>

                    {/* Divider */}
                    <div 
                      className="rounded-full mb-3"
                      style={{ 
                        backgroundColor: isCenter ? '#1E65AD' : '#D1D5DB',
                        width: 'clamp(2.5rem, 4vw, 3rem)',
                        height: 'clamp(0.25rem, 0.5vw, 0.375rem)',
                        marginBottom: 'clamp(0.75rem, 1.5vw, 1rem)'
                      }}
                    />

                    {/* Author & Meta */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 
                          className="font-semibold text-xs sm:text-sm"
                          style={{ 
                            color: isCenter ? '#1E65AD' : '#374151', 
                            fontFamily: 'Heebo, sans-serif',
                            marginBottom: '0.25rem'
                          }}
                        >
                          {blog.author}
                        </h4>
                        <p 
                          className="text-xs"
                          style={{ 
                            color: isCenter ? '#CF9B63' : '#8C969F', 
                            fontFamily: 'Heebo, sans-serif' 
                          }}
                        >
                          {blog.date} · {blog.readTime}
                        </p>
                      </div>
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-blue-600 flex-shrink-0"
                        style={{ backgroundColor: isCenter ? '#EBF5FF' : '#F3F4F6' }}
                      >
                        <svg 
                          className="w-4 h-4 transition-colors duration-300" 
                          style={{ color: '#1E65AD' }}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
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
            aria-label="Next blog posts"
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

        {/* View All Button */}
        <div className="text-center mt-8 sm:mt-10">
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 rounded-full text-sm sm:text-base font-semibold transition-all duration-300"
            style={{ 
              backgroundColor: '#CF9B63', 
              color: '#FFFFFF',
              fontFamily: 'Heebo, sans-serif',
              boxShadow: '0 4px 15px rgba(207, 155, 99, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#B8864F';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(207, 155, 99, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#CF9B63';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(207, 155, 99, 0.3)';
            }}
          >
            View All Articles
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Modal Popup */}
      {isModalOpen && selectedBlog && (
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
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedBlog.image}</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedBlog.title}</h3>
                  <span 
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1"
                    style={{ 
                      backgroundColor: getCategoryStyle(selectedBlog.category).bg, 
                      color: getCategoryStyle(selectedBlog.category).color,
                      fontFamily: 'Heebo, sans-serif'
                    }}
                  >
                    {selectedBlog.category}
                  </span>
                </div>
              </div>
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
              {/* Author & Date Info */}
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-900 mb-1">
                  {selectedBlog.author}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {selectedBlog.date} · {selectedBlog.readTime} read
                </p>
              </div>

              {/* Quote Icon */}
              <div className="absolute top-20 right-8 text-7xl text-blue-50 font-serif leading-none">
                "
              </div>

              {/* Blog Content */}
              <div className="relative">
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
                  {selectedBlog.fullContent}
                </p>
              </div>

              {/* Divider */}
              <div className="w-20 h-1 rounded-full bg-blue-600 mb-6"></div>

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">Category:</span> {selectedBlog.category}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold text-gray-900">Reading Time:</span> {selectedBlog.readTime}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between rounded-b-2xl">
              <button
                onClick={() => {
                  closeModal();
                  navigate('/blog');
                }}
                className="px-4 py-2 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
              >
                Read Full Article →
              </button>
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

export default BlogSection;
