import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import { Mail, MessageCircle, HelpCircle, FileText, Clock, Headphones, ArrowRight, CheckCircle2, Phone, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Support() {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const supportOptions = [
    {
      icon: <MessageCircle className="w-full h-full" />,
      title: "Live Chat",
      description: "Get instant help from our support team",
      action: "Start Chat",
      iconBg: "#1E65AD",
      delay: 0.1
    },
    {
      icon: <Mail className="w-full h-full" />,
      title: "Email Support",
      description: "Send us a detailed message and we'll respond",
      action: "Send Email",
      iconBg: "#CF9B63",
      email: "inquiry@salhakar.com",
      delay: 0.2
    },
    {
      icon: <HelpCircle className="w-full h-full" />,
      title: "FAQ",
      description: "Find quick answers to common questions",
      action: "Browse FAQ",
      iconBg: "#1E65AD",
      delay: 0.3
    },
    {
      icon: <FileText className="w-full h-full" />,
      title: "Documentation",
      description: "Comprehensive guides and tutorials",
      action: "View Docs",
      iconBg: "#CF9B63",
      delay: 0.4
    }
  ];

  // const features = [
  //   "24/7 Support Available",
  //   "Quick Response Time",
  //   "Expert Assistance",
  //   "Multiple Contact Channels"
  // ];

  const handleEmailClick = () => {
    window.location.href = "mailto:inquiry@salhakar.com";
  };

  const handleFAQClick = () => {
    navigate("/#faq");
  };

  const handleLiveChatClick = () => {
    setShowComingSoon(true);
  };

  const closeComingSoon = () => {
    setShowComingSoon(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
      <Navbar />
      
      {/* Hero Section */}
      <div 
        className="pt-24 sm:pt-32 md:pt-36 lg:pt-40 pb-12 sm:pb-16 md:pb-20 lg:pb-24 relative overflow-hidden min-h-[300px] sm:min-h-[400px] md:h-96"
        style={{
          background: 'linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)'
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 h-48 sm:w-96 sm:h-96 rounded-full"
            style={{ backgroundColor: '#1E65AD', filter: 'blur(100px)' }}
          ></div>
          <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-48 h-48 sm:w-96 sm:h-96 rounded-full"
            style={{ backgroundColor: '#CF9B63', filter: 'blur(100px)' }}
          ></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-4 sm:mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 sm:mb-3"
              style={{ 
                fontFamily: "'Heebo', 'Helvetica Hebrew Bold', sans-serif",
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: '1.2'
              }}
            >
              We're Here to Help
            </h1>
            <div className="w-16 sm:w-24 md:w-32 lg:w-40 h-1 sm:h-1.5 md:h-2 mx-auto rounded-full mb-2 sm:mb-3"
              style={{ backgroundColor: '#FFFFFF', opacity: 0.9 }}
            ></div>
            <p 
              className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white max-w-3xl mx-auto mb-2 px-2 sm:px-0"
              style={{ 
                fontFamily: "'Roboto', sans-serif",
                opacity: 0.95,
                lineHeight: '1.6'
              }}
            >
              Get the support you need, when you need it. Our team is ready to assist you with any questions or issues.
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

      {/* Support Options */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 -mt-6 sm:-mt-8 md:-mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {supportOptions.map((option, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: option.delay }}
              className="group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
              style={{
                border: '1px solid rgba(30, 101, 173, 0.1)',
                boxShadow: '0 4px 20px rgba(30, 101, 173, 0.08)'
              }}
            >
              {/* Decorative gradient overlay on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${option.iconBg} 0%, ${option.iconBg === '#1E65AD' ? '#CF9B63' : '#1E65AD'} 100%)`
                }}
              ></div>
              
              <div className="relative p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 md:gap-6">
                  {/* Icon */}
                  <div 
                    className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{ backgroundColor: option.iconBg }}
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8">
                      {option.icon}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <h3 
                      className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3"
                      style={{ 
                        color: '#1E65AD', 
                        fontFamily: "'Heebo', 'Helvetica Hebrew Bold', sans-serif",
                        fontWeight: 700,
                        letterSpacing: '-0.02em'
                      }}
                    >
                      {option.title}
                    </h3>
                    <p 
                      className="mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm md:text-base"
                      style={{ 
                        color: '#8C969F',
                        fontFamily: "'Roboto', sans-serif",
                        lineHeight: '1.7'
                      }}
                    >
                      {option.description}
                    </p>
                    {option.email ? (
                      <button
                        onClick={handleEmailClick}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-xs sm:text-sm md:text-base group/btn"
                        style={{ 
                          fontFamily: "'Roboto', sans-serif",
                          background: 'linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {option.action}
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    ) : option.title === "FAQ" ? (
                      <button
                        onClick={handleFAQClick}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-xs sm:text-sm md:text-base group/btn"
                        style={{ 
                          fontFamily: "'Roboto', sans-serif",
                          background: 'linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {option.action}
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    ) : option.title === "Live Chat" ? (
                      <button
                        onClick={handleLiveChatClick}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-xs sm:text-sm md:text-base group/btn"
                        style={{ 
                          fontFamily: "'Roboto', sans-serif",
                          background: 'linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {option.action}
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <button
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-xs sm:text-sm md:text-base group/btn"
                        style={{ 
                          fontFamily: "'Roboto', sans-serif",
                          background: 'linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        {option.action}
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="bg-white border-t" style={{ borderColor: 'rgba(30, 101, 173, 0.1)' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12 md:mb-16"
          >
            <h2 
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6"
              style={{ 
                color: '#1E65AD', 
                fontFamily: "'Heebo', 'Helvetica Hebrew Bold', sans-serif",
                fontWeight: 700,
                letterSpacing: '-0.02em'
              }}
            >
              Get in Touch
            </h2>
            <div className="w-16 sm:w-24 md:w-32 lg:w-40 h-1 sm:h-1.5 md:h-2 mx-auto rounded-full mb-4 sm:mb-6"
              style={{ backgroundColor: '#CF9B63' }}
            ></div>
            <p 
              className="text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto px-2 sm:px-0"
              style={{ 
                color: '#8C969F',
                fontFamily: "'Roboto', sans-serif",
                lineHeight: '1.8'
              }}
            >
              Choose the best way to reach us. We're committed to providing you with the best support experience.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {[
              {
                icon: <Mail className="w-full h-full" />,
                title: "Email Us",
                content: "inquiry@salhakar.com",
                description: "Send us an email anytime",
                bgColor: "rgba(30, 101, 173, 0.1)",
                iconColor: "#1E65AD",
                isLink: true,
                link: "mailto:inquiry@salhakar.com"
              },
              {
                icon: <Clock className="w-full h-full" />,
                title: "Response Time",
                content: "Within 24 hours",
                description: "We typically respond within a day",
                bgColor: "rgba(207, 155, 99, 0.1)",
                iconColor: "#CF9B63"
              },
              {
                icon: <Headphones className="w-full h-full" />,
                title: "Support Hours",
                content: "Mon - Fri, 9 AM - 6 PM IST",
                description: "Our team is available during business hours",
                bgColor: "rgba(30, 101, 173, 0.1)",
                iconColor: "#1E65AD"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-xl"
                style={{
                  backgroundColor: '#F9FAFC',
                  border: '1px solid rgba(30, 101, 173, 0.1)'
                }}
              >
                <div 
                  className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 mx-auto mb-4 sm:mb-5 md:mb-6 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform duration-300 hover:scale-110"
                  style={{ backgroundColor: item.bgColor }}
                >
                  <div style={{ color: item.iconColor }} className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8">
                    {item.icon}
                  </div>
                </div>
                <h3 
                  className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3"
                  style={{ 
                    color: '#1E65AD', 
                    fontFamily: "'Heebo', 'Helvetica Hebrew Bold', sans-serif",
                    fontWeight: 700
                  }}
                >
                  {item.title}
                </h3>
                {item.isLink ? (
                  <a 
                    href={item.link}
                    className="block mb-2 text-base sm:text-lg md:text-xl font-semibold transition-colors duration-300 break-words"
                    style={{ 
                      color: '#1E65AD',
                      fontFamily: "'Roboto', sans-serif",
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#CF9B63'}
                    onMouseLeave={(e) => e.target.style.color = '#1E65AD'}
                  >
                    {item.content}
                  </a>
                ) : (
                  <p 
                    className="mb-2 text-base sm:text-lg md:text-xl font-semibold"
                    style={{ 
                      color: '#1E65AD',
                      fontFamily: "'Roboto', sans-serif"
                    }}
                  >
                    {item.content}
                  </p>
                )}
                <p 
                  className="text-xs sm:text-sm md:text-base"
                  style={{ 
                    color: '#8C969F',
                    fontFamily: "'Roboto', sans-serif",
                    lineHeight: '1.7'
                  }}
                >
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Help Section */}
      <div className="bg-gradient-to-br from-blue-50 to-orange-50 py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 md:mb-6"
              style={{ 
                color: '#1E65AD', 
                fontFamily: "'Heebo', 'Helvetica Hebrew Bold', sans-serif",
                fontWeight: 700
              }}
            >
              Still Need Help?
            </h2>
            <p 
              className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 px-2 sm:px-0"
              style={{ 
                color: '#8C969F',
                fontFamily: "'Roboto', sans-serif",
                lineHeight: '1.8'
              }}
            >
              Can't find what you're looking for? Our support team is always ready to assist you.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEmailClick}
              className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm sm:text-base md:text-lg w-full sm:w-auto max-w-xs sm:max-w-none"
              style={{ 
                fontFamily: "'Roboto', sans-serif",
                background: 'linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)'
              }}
            >
              <Mail className="w-5 h-5" />
              Contact Support Team
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Coming Soon Popup */}
      <AnimatePresence>
        {showComingSoon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={closeComingSoon}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-50" />

            {/* Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeComingSoon}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close popup"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>

              {/* Content */}
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)'
                  }}
                >
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                
                <h2
                  className="text-2xl sm:text-3xl font-bold mb-3"
                  style={{
                    color: '#1E65AD',
                    fontFamily: "'Heebo', 'Helvetica Hebrew Bold', sans-serif",
                    fontWeight: 700
                  }}
                >
                  Coming Soon
                </h2>
                
                <div className="w-24 h-1.5 mx-auto rounded-full mb-4"
                  style={{ backgroundColor: '#CF9B63' }}
                ></div>
                
                <p
                  className="text-base sm:text-lg mb-6"
                  style={{
                    color: '#8C969F',
                    fontFamily: "'Roboto', sans-serif",
                    lineHeight: '1.6'
                  }}
                >
                  Live Chat feature is currently under development. We're working hard to bring you instant support. In the meantime, please use email support or check our FAQ section.
                </p>
                
                <button
                  onClick={closeComingSoon}
                  className="px-6 py-3 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    background: 'linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)'
                  }}
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
     
    </div>
  );
}
