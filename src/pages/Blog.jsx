import React, { useState, useLayoutEffect } from "react";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, Clock, User, ArrowRight, Search, Tag, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const Blog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Scroll to top immediately when component mounts or route changes (before paint)
  useLayoutEffect(() => {
    // Force scroll to top immediately (synchronous, no animation)
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);

  const categories = ["All", "Legal Updates", "AI & Technology", "Case Studies", "Legal Tips", "Industry News"];

  // const features = [
  //   "Latest Legal Insights",
  //   "Expert Analysis",
  //   "Industry Updates",
  //   "Research Tips & Guides"
  // ];

  const blogPosts = [
    {
      id: 1,
      title: "The Future of Legal Research: AI-Powered Solutions",
      excerpt: "Discover how artificial intelligence is revolutionizing legal research and making it more accessible for lawyers, students, and researchers.",
      author: "Salhakar Team",
      date: "2024-01-15",
      readTime: "5 min read",
      category: "AI & Technology",
      image: "/logo4.png",
      tags: ["AI", "Legal Tech", "Innovation"]
    },
    {
      id: 2,
      title: "Understanding BNS to IPC Mapping: A Comprehensive Guide",
      excerpt: "Navigate the transition from old legal frameworks to new ones with our detailed guide on BNS to IPC mapping.",
      author: "Legal Experts",
      date: "2024-01-10",
      readTime: "8 min read",
      category: "Legal Updates",
      image: "/logo4.png",
      tags: ["BNS", "IPC", "Legal Framework"]
    },
    {
      id: 3,
      title: "How to Conduct Efficient Legal Research",
      excerpt: "Learn proven strategies and techniques to streamline your legal research process and save valuable time.",
      author: "Research Team",
      date: "2024-01-05",
      readTime: "6 min read",
      category: "Legal Tips",
      image: "/logo4.png",
      tags: ["Research", "Productivity", "Tips"]
    },
    {
      id: 4,
      title: "Case Study: Successful Legal Research Using Salhakar",
      excerpt: "Read how a leading law firm improved their research efficiency by 300% using Salhakar's AI-powered platform.",
      author: "Case Studies",
      date: "2023-12-28",
      readTime: "7 min read",
      category: "Case Studies",
      image: "/logo4.png",
      tags: ["Case Study", "Success Story", "Efficiency"]
    },
    {
      id: 5,
      title: "Latest Updates in Indian Legal System",
      excerpt: "Stay informed about the latest changes, amendments, and updates in the Indian legal system.",
      author: "Legal Updates",
      date: "2023-12-20",
      readTime: "4 min read",
      category: "Industry News",
      image: "/logo4.png",
      tags: ["Legal Updates", "India", "News"]
    },
    {
      id: 6,
      title: "Multilingual Legal Research: Breaking Language Barriers",
      excerpt: "Explore how Salhakar enables legal research in multiple Indian languages, making legal information accessible to all.",
      author: "Technology Team",
      date: "2023-12-15",
      readTime: "5 min read",
      category: "AI & Technology",
      image: "/logo4.png",
      tags: ["Multilingual", "Accessibility", "Technology"]
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: '#F9FAFC' }}>
      <Navbar />
      
      {/* Enhanced Header Section */}
      <div className="bg-white border-b border-gray-200 pt-14 sm:pt-16 md:pt-20 animate-slide-in-bottom w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 lg:py-12 w-full">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 animate-fade-in-up" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Blog
            </h1>
            <div className="w-12 sm:w-16 md:w-20 h-0.5 sm:h-1 mx-auto mb-3 sm:mb-4 md:mb-6 animate-fade-in-up" style={{ backgroundColor: '#CF9B63', animationDelay: '0.2s' }}></div>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl mx-auto px-2 sm:px-4 animate-fade-in-up" style={{ color: '#8C969F', fontFamily: 'Roboto, sans-serif', animationDelay: '0.4s' }}>
              Stay updated with the latest legal insights, AI technology trends, and expert analysis
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 -mt-4 sm:-mt-6 md:-mt-8 lg:-mt-12 w-full overflow-x-hidden">
        {/* Search and Filter Section */}
        <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-10 xl:mb-12">
          <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-lg mx-0"
            style={{
              border: '1px solid rgba(30, 101, 173, 0.1)',
              boxShadow: '0 4px 20px rgba(30, 101, 173, 0.08)'
            }}
          >
            {/* Search Bar */}
            <div className="relative mb-3 sm:mb-4 md:mb-5 lg:mb-6">
              <Search className="absolute left-2 sm:left-3 md:left-4 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5"
                style={{ color: '#8C969F' }}
              />
              <input
                type="text"
                placeholder="Search blog posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-9 md:pl-10 lg:pl-12 pr-2 sm:pr-3 md:pr-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl border focus:outline-none focus:ring-2 transition-all text-xs sm:text-sm md:text-base"
                style={{
                  borderColor: 'rgba(30, 101, 173, 0.2)',
                  fontFamily: "'Heebo', sans-serif",
                  color: '#1E65AD'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1E65AD';
                  e.target.style.boxShadow = '0 0 0 3px rgba(30, 101, 173, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(30, 101, 173, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm md:text-base"
                  style={{
                    backgroundColor: selectedCategory === category ? '#1E65AD' : 'transparent',
                    color: selectedCategory === category ? '#FFFFFF' : '#8C969F',
                    border: `2px solid ${selectedCategory === category ? '#1E65AD' : 'rgba(30, 101, 173, 0.2)'}`,
                    fontFamily: "'Heebo', sans-serif",
                    fontWeight: selectedCategory === category ? 600 : 500
                  }}
                  onMouseEnter={(e) => {
                    if (window.innerWidth >= 768 && selectedCategory !== category) {
                      e.target.style.borderColor = '#1E65AD';
                      e.target.style.color = '#1E65AD';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (window.innerWidth >= 768 && selectedCategory !== category) {
                      e.target.style.borderColor = 'rgba(30, 101, 173, 0.2)';
                      e.target.style.color = '#8C969F';
                    }
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8 w-full">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer w-full max-w-full"
              style={{
                border: '1px solid rgba(30, 101, 173, 0.1)',
                boxShadow: '0 4px 20px rgba(30, 101, 173, 0.08)'
              }}
              onClick={() => navigate(`/blog/${post.id}`)}
            >
              {/* Post Image */}
              <div className="relative h-32 sm:h-36 md:h-40 lg:h-44 xl:h-48 overflow-hidden"
                style={{ backgroundColor: '#F9FAFC' }}
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.background = 'linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)';
                  }}
                />
                <div className="absolute top-1.5 sm:top-2 md:top-3 lg:top-4 left-1.5 sm:left-2 md:left-3 lg:left-4">
                  <span className="px-1.5 sm:px-2 md:px-2.5 lg:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold text-white"
                    style={{
                      backgroundColor: '#CF9B63',
                      fontFamily: "'Heebo', sans-serif"
                    }}
                  >
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                <h3
                  className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold mb-2 sm:mb-2.5 md:mb-3 leading-tight break-words"
                  style={{
                    color: '#1E65AD',
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700
                  }}
                >
                  {post.title}
                </h3>
                <p
                  className="text-xs sm:text-sm md:text-base mb-2.5 sm:mb-3 md:mb-3.5 lg:mb-4 leading-relaxed break-words"
                  style={{
                    color: '#8C969F',
                    fontFamily: "'Heebo', sans-serif",
                    lineHeight: '1.6'
                  }}
                >
                  {post.excerpt}
                </p>

                {/* Post Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2 md:gap-0 text-xs sm:text-sm mb-2.5 sm:mb-3 md:mb-3.5 lg:mb-4"
                  style={{ color: '#8C969F', fontFamily: "'Heebo', sans-serif" }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                      <span className="break-words truncate">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                      <span className="break-words truncate">{formatDate(post.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 mb-2.5 sm:mb-3 md:mb-3.5 lg:mb-4">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs"
                      style={{
                        backgroundColor: 'rgba(30, 101, 173, 0.1)',
                        color: '#1E65AD',
                        fontFamily: "'Heebo', sans-serif"
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Read More */}
                <button
                  className="flex items-center gap-1 sm:gap-1.5 md:gap-2 font-semibold transition-all duration-200 group text-xs sm:text-sm md:text-base"
                  style={{
                    color: '#1E65AD',
                    fontFamily: "'Heebo', sans-serif"
                  }}
                  onMouseEnter={(e) => {
                    if (window.innerWidth >= 768) {
                      e.target.style.color = '#CF9B63';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (window.innerWidth >= 768) {
                      e.target.style.color = '#1E65AD';
                    }
                  }}
                >
                  Read More
                  <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-10 sm:py-12 md:py-16 lg:py-20 px-2">
            <p
              className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold break-words"
              style={{
                color: '#8C969F',
                fontFamily: "'Heebo', sans-serif"
              }}
            >
              No blog posts found. Try adjusting your search or filter.
            </p>
          </div>
        )}
      </div>

      {/* <Footer /> */}
    </div>
  );
};

export default Blog;

