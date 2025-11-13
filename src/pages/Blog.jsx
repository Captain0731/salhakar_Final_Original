import React, { useState } from "react";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, User, ArrowRight, Search, Tag, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const Blog = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

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
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
      <Navbar />
      
      {/* Hero Section - Matching Support Page Style */}
      <div 
        className="pt-20 sm:pt-36 md:pt-40 pb-12 sm:pb-20 md:pb-24 relative overflow-hidden h-96"
        style={{
          background: 'linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)'
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-96 h-76 rounded-full"
            style={{ backgroundColor: '#1E65AD', filter: 'blur(100px)' }}
          ></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full"
            style={{ backgroundColor: '#CF9B63', filter: 'blur(100px)' }}
          ></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white"
              style={{ 
                fontFamily: "'Heebo', 'Helvetica Hebrew Bold', sans-serif",
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: '1.2'
              }}
            >
              Salhakar Blog
            </h1>
            <div className="w-24 sm:w-32 md:w-40 h-1.5 sm:h-2 mx-auto rounded-full mb-2"
              style={{ backgroundColor: '#FFFFFF', opacity: 0.9 }}
            ></div>
            <p 
              className="text-lg sm:text-xl md:text-2xl text-white max-w-3xl mx-auto mb-8"
              style={{ 
                fontFamily: "'Roboto', sans-serif",
                opacity: 0.95,
                lineHeight: '1.6'
              }}
            >
              Insights, updates, and expert guidance on legal research, technology, and the future of law.
            </p>
            
            {/* Features List */}
            {/* <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3"
                >
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  <span 
                    className="text-sm sm:text-base text-white font-medium"
                    style={{ fontFamily: "'Roboto', sans-serif" }}
                  >
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div> */}
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 -mt-8 sm:-mt-12">
        {/* Search and Filter Section */}
        <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 shadow-lg mx-2 sm:mx-0"
            style={{
              border: '1px solid rgba(30, 101, 173, 0.1)',
              boxShadow: '0 4px 20px rgba(30, 101, 173, 0.08)'
            }}
          >
            {/* Search Bar */}
            <div className="relative mb-4 sm:mb-5 md:mb-6">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5"
                style={{ color: '#8C969F' }}
              />
              <input
                type="text"
                placeholder="Search blog posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 md:pl-12 pr-3 sm:pr-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl border focus:outline-none focus:ring-2 transition-all text-xs sm:text-sm md:text-base"
                style={{
                  borderColor: 'rgba(30, 101, 173, 0.2)',
                  fontFamily: "'Roboto', sans-serif",
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
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm md:text-base"
                  style={{
                    backgroundColor: selectedCategory === category ? '#1E65AD' : 'transparent',
                    color: selectedCategory === category ? '#FFFFFF' : '#8C969F',
                    border: `2px solid ${selectedCategory === category ? '#1E65AD' : 'rgba(30, 101, 173, 0.2)'}`,
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: selectedCategory === category ? 600 : 500
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== category) {
                      e.target.style.borderColor = '#1E65AD';
                      e.target.style.color = '#1E65AD';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== category) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
              style={{
                border: '1px solid rgba(30, 101, 173, 0.1)',
                boxShadow: '0 4px 20px rgba(30, 101, 173, 0.08)'
              }}
              onClick={() => navigate(`/blog/${post.id}`)}
            >
              {/* Post Image */}
              <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden"
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
                <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4">
                  <span className="px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold text-white"
                    style={{
                      backgroundColor: '#CF9B63',
                      fontFamily: "'Roboto', sans-serif"
                    }}
                  >
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                <h3
                  className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-2 sm:mb-2.5 md:mb-3 leading-tight break-words"
                  style={{
                    color: '#1E65AD',
                    fontFamily: "'Heebo', 'Helvetica Hebrew Bold', sans-serif",
                    fontWeight: 700
                  }}
                >
                  {post.title}
                </h3>
                <p
                  className="text-xs sm:text-sm md:text-base mb-3 sm:mb-3.5 md:mb-4 leading-relaxed break-words"
                  style={{
                    color: '#8C969F',
                    fontFamily: "'Roboto', sans-serif",
                    lineHeight: '1.6'
                  }}
                >
                  {post.excerpt}
                </p>

                {/* Post Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-xs sm:text-sm mb-3 sm:mb-3.5 md:mb-4"
                  style={{ color: '#8C969F', fontFamily: "'Roboto', sans-serif" }}
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="break-words">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="break-words">{formatDate(post.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-3.5 md:mb-4">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 sm:py-1 rounded text-xs"
                      style={{
                        backgroundColor: 'rgba(30, 101, 173, 0.1)',
                        color: '#1E65AD',
                        fontFamily: "'Roboto', sans-serif"
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Read More */}
                <button
                  className="flex items-center gap-1.5 sm:gap-2 font-semibold transition-all duration-200 group text-xs sm:text-sm md:text-base"
                  style={{
                    color: '#1E65AD',
                    fontFamily: "'Roboto', sans-serif"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#CF9B63';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#1E65AD';
                  }}
                >
                  Read More
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 group-hover:translate-x-1" />
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
                fontFamily: "'Roboto', sans-serif"
              }}
            >
              No blog posts found. Try adjusting your search or filter.
            </p>
          </div>
        )}
      </div>

      
    </div>
  );
};

export default Blog;

