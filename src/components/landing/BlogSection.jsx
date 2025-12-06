import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const BlogSection = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const blogPosts = [
    {
      id: 1,
      title: "Understanding the New Legal Framework",
      description: "Explore the latest changes in Indian legal system and how they impact modern legal practice.",
      category: "Legal Updates",
      author: "Dr. Priya Sharma",
      date: "Dec 15, 2024",
      image: "📚",
      readTime: "8 min"
    },
    {
      id: 2,
      title: "AI-Powered Legal Research",
      description: "Discover how artificial intelligence is revolutionizing legal research and case analysis.",
      category: "Technology",
      author: "Rajesh Kumar",
      date: "Dec 12, 2024",
      image: "🤖",
      readTime: "6 min"
    },
    {
      id: 3,
      title: "Digital Transformation in Law Firms",
      description: "Learn how law firms are embracing digital transformation to improve efficiency.",
      category: "Business",
      author: "Anita Mehta",
      date: "Dec 10, 2024",
      image: "💼",
      readTime: "10 min"
    },
    {
      id: 4,
      title: "Contract Management Strategies",
      description: "Master the art of digital contract management with modern tools and proven strategies.",
      category: "Contracts",
      author: "Vikram Singh",
      date: "Dec 8, 2024",
      image: "📋",
      readTime: "7 min"
    },
    {
      id: 5,
      title: "Legal Ethics in the Digital Era",
      description: "Explore the evolving landscape of legal ethics in our digital world.",
      category: "Ethics",
      author: "Dr. Meera Patel",
      date: "Dec 5, 2024",
      image: "⚖️",
      readTime: "9 min"
    },
    {
      id: 6,
      title: "Building a Successful Practice",
      description: "Learn proven strategies for building and growing a successful legal practice.",
      category: "Practice",
      author: "Arjun Gupta",
      date: "Dec 2, 2024",
      image: "🏆",
      readTime: "12 min"
    }
  ];

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const slidesPerView = isMobile ? 1 : 3;
  const totalSlides = Math.ceil(blogPosts.length / slidesPerView);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

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

  // Reset slide on mobile change
  useEffect(() => {
    setCurrentSlide(0);
  }, [isMobile]);

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
      className="py-16 sm:py-20 lg:py-24 relative overflow-hidden"
      style={{ backgroundColor: '#F9FAFC' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            Our Blog
          </span>
          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
            style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Latest Insights
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto"
            style={{ color: '#8C969F', fontFamily: 'Heebo, sans-serif' }}
          >
            Stay updated with the latest trends in legal technology and best practices
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative">
          {/* Slider */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ 
                transform: `translateX(-${currentSlide * (100 / totalSlides)}%)`,
                width: `${totalSlides * 100}%`
              }}
            >
              {Array.from({ length: totalSlides }, (_, slideIndex) => {
                const startIndex = slideIndex * slidesPerView;
                const endIndex = Math.min((slideIndex + 1) * slidesPerView, blogPosts.length);
                const slidePosts = blogPosts.slice(startIndex, endIndex);
                
                return (
                  <div 
                    key={slideIndex}
                    className="flex-shrink-0"
                    style={{ 
                      width: `${100 / totalSlides}%`,
                      padding: '0 8px'
                    }}
                  >
                    <div className={`grid gap-6 md:gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
                      {slidePosts.map((post) => {
                        const categoryStyle = getCategoryStyle(post.category);
                        
                        return (
                          <article
                            key={post.id}
                            onClick={() => navigate('/blog')}
                            className="group cursor-pointer"
                          >
                            <div 
                              className="bg-white rounded-2xl overflow-hidden transition-all duration-300 h-full flex flex-col"
                              style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px)';
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(30, 101, 173, 0.15)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
                              }}
                            >
                              {/* Image Section */}
                              <div 
                                className="relative h-48 flex items-center justify-center overflow-hidden"
                                style={{ 
                                  background: `linear-gradient(135deg, ${categoryStyle.bg} 0%, #FFFFFF 100%)`
                                }}
                              >
                                <span className="text-6xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                                  {post.image}
                                </span>
                                
                                {/* Category Badge */}
                                <span 
                                  className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold"
                                  style={{ 
                                    backgroundColor: categoryStyle.bg, 
                                    color: categoryStyle.color,
                                    fontFamily: 'Heebo, sans-serif'
                                  }}
                                >
                                  {post.category}
                                </span>

                                {/* Read Time Badge */}
                                <span 
                                  className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-white"
                                  style={{ 
                                    color: '#8C969F',
                                    fontFamily: 'Heebo, sans-serif',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                  }}
                                >
                                  ⏱️ {post.readTime}
                                </span>
                              </div>

                              {/* Content Section */}
                              <div className="p-6 flex-1 flex flex-col">
                                <h3 
                                  className="text-xl font-bold mb-3 leading-tight transition-colors duration-300 group-hover:text-blue-600"
                                  style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}
                                >
                                  {post.title}
                                </h3>

                                <p 
                                  className="text-base mb-6 flex-1"
                                  style={{ color: '#6B7280', fontFamily: 'Heebo, sans-serif', lineHeight: '1.6' }}
                                >
                                  {post.description}
                                </p>

                                {/* Author & Date */}
                                <div 
                                  className="flex items-center justify-between pt-4"
                                  style={{ borderTop: '1px solid #F3F4F6' }}
                                >
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                                      style={{ backgroundColor: '#F3F4F6' }}
                                    >
                                      👤
                                    </div>
                                    <div>
                                      <p 
                                        className="text-sm font-semibold"
                                        style={{ color: '#1E65AD', fontFamily: 'Heebo, sans-serif' }}
                                      >
                                        {post.author}
                                      </p>
                                      <p 
                                        className="text-xs"
                                        style={{ color: '#8C969F', fontFamily: 'Heebo, sans-serif' }}
                                      >
                                        {post.date}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Arrow */}
                                  <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-blue-600"
                                    style={{ backgroundColor: '#F3F4F6' }}
                                  >
                                    <svg 
                                      className="w-5 h-5 transition-colors duration-300 group-hover:text-white" 
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
                          </article>
                        );
                      })}
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

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold transition-all duration-300"
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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
