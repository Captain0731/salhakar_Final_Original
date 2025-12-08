import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import { Mail, MessageCircle, ArrowRight, X, Phone, MapPin, Clock, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Support() {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNo: '',
    emailId: '',
    remark: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailClick = () => {
    window.location.href = "mailto:inquiry@salhakar.com";
  };

  const closeComingSoon = () => {
    setShowComingSoon(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      alert('Thank you for contacting us! We will get back to you soon.');
      setFormData({
        firstName: '',
        lastName: '',
        mobileNo: '',
        emailId: '',
        remark: ''
      });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
      <Navbar />
      
      {/* Enhanced Header Section */}
      <div className="bg-white border-b border-gray-200 pt-14 sm:pt-16 md:pt-20 animate-slide-in-bottom w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 lg:py-12 w-full">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 animate-fade-in-up" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Support
            </h1>
            <div className="w-12 sm:w-16 md:w-20 h-0.5 sm:h-1 mx-auto mb-3 sm:mb-4 md:mb-6 animate-fade-in-up" style={{ backgroundColor: '#CF9B63', animationDelay: '0.2s' }}></div>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl mx-auto px-2 sm:px-4 animate-fade-in-up" style={{ color: '#8C969F', fontFamily: 'Roboto, sans-serif', animationDelay: '0.4s' }}>
              Get the support you need, when you need it. Our team is ready to assist you with any questions or issues
            </p>
          </div>
        </div>
      </div>

      {/* Contact Us Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 -mt-6 sm:-mt-8 md:-mt-12">
        {/* <motion.div
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
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700,
              letterSpacing: '-0.02em'
            }}
          >
            Contact Us
          </h2>
          <div className="w-16 sm:w-24 md:w-32 lg:w-40 h-1 sm:h-1.5 md:h-2 mx-auto rounded-full mb-4 sm:mb-6"
            style={{ backgroundColor: '#CF9B63' }}
          ></div>
          <p 
            className="text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto px-2 sm:px-0"
            style={{ 
              color: '#8C969F',
              fontFamily: "'Heebo', sans-serif",
              lineHeight: '1.8'
            }}
          >
            Have a question or need assistance? Fill out the form below and we'll get back to you as soon as possible.
          </p>
        </motion.div> */}

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 sm:gap-8 md:gap-10">
          {/* Contact Form Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            style={{
              border: '1px solid rgba(30, 101, 173, 0.1)',
              boxShadow: '0 4px 20px rgba(30, 101, 173, 0.1)'
            }}
          >
            <div className="p-6 sm:p-8 md:p-10">
              <h3 
                className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8"
                style={{ 
                  color: '#1E65AD', 
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700
                }}
              >
                Send us a Message
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* First Name */}
                  <div>
                    <label 
                      htmlFor="firstName"
                      className="block text-sm sm:text-base font-medium mb-2"
                      style={{ 
                        color: '#1E65AD',
                        fontFamily: "'Heebo', sans-serif"
                      }}
                    >
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{
                        borderColor: 'rgba(30, 101, 173, 0.2)',
                        fontFamily: "'Heebo', sans-serif",
                        fontSize: '14px'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1E65AD'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(30, 101, 173, 0.2)'}
                      placeholder="Enter your first name"
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label 
                      htmlFor="lastName"
                      className="block text-sm sm:text-base font-medium mb-2"
                      style={{ 
                        color: '#1E65AD',
                        fontFamily: "'Heebo', sans-serif"
                      }}
                    >
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{
                        borderColor: 'rgba(30, 101, 173, 0.2)',
                        fontFamily: "'Heebo', sans-serif",
                        fontSize: '14px'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1E65AD'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(30, 101, 173, 0.2)'}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Mobile No */}
                  <div>
                    <label 
                      htmlFor="mobileNo"
                      className="block text-sm sm:text-base font-medium mb-2"
                      style={{ 
                        color: '#1E65AD',
                        fontFamily: "'Heebo', sans-serif"
                      }}
                    >
                      Mobile No <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="mobileNo"
                      name="mobileNo"
                      value={formData.mobileNo}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]{10}"
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{
                        borderColor: 'rgba(30, 101, 173, 0.2)',
                        fontFamily: "'Heebo', sans-serif",
                        fontSize: '14px'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1E65AD'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(30, 101, 173, 0.2)'}
                      placeholder="Enter your mobile number"
                    />
                  </div>

                  {/* Email ID */}
                  <div>
                    <label 
                      htmlFor="emailId"
                      className="block text-sm sm:text-base font-medium mb-2"
                      style={{ 
                        color: '#1E65AD',
                        fontFamily: "'Heebo', sans-serif"
                      }}
                    >
                      Email ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="emailId"
                      name="emailId"
                      value={formData.emailId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all duration-300"
                      style={{
                        borderColor: 'rgba(30, 101, 173, 0.2)',
                        fontFamily: "'Heebo', sans-serif",
                        fontSize: '14px'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#1E65AD'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(30, 101, 173, 0.2)'}
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                {/* Remark */}
                <div>
                  <label 
                    htmlFor="remark"
                    className="block text-sm sm:text-base font-medium mb-2"
                    style={{ 
                      color: '#1E65AD',
                      fontFamily: "'Heebo', sans-serif"
                    }}
                  >
                    Remark <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="remark"
                    name="remark"
                    value={formData.remark}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all duration-300 resize-y min-h-[100px]"
                    style={{
                      borderColor: 'rgba(30, 101, 173, 0.2)',
                      fontFamily: "'Heebo', sans-serif",
                      fontSize: '14px'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#1E65AD'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(30, 101, 173, 0.2)'}
                    placeholder="Enter your message or query"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 sm:px-8 py-3 sm:py-4 text-white rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-sm sm:text-base md:text-lg flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ 
                    fontFamily: "'Heebo', sans-serif",
                    background: 'linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

          {/* Information Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            style={{
              border: '1px solid rgba(30, 101, 173, 0.1)',
              boxShadow: '0 4px 20px rgba(30, 101, 173, 0.1)'
            }}
          >
            <div className="p-6 sm:p-8 md:p-10">
              <h3 
                className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8"
                style={{ 
                  color: '#1E65AD', 
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700
                }}
              >
                Get in Touch
              </h3>
              
              <div className="space-y-6 sm:space-y-8">
                {/* Email */}
                <div className="flex items-start gap-4">
                  <div 
                    className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(30, 101, 173, 0.1)' }}
                  >
                    <Mail className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: '#1E65AD' }} />
                  </div>
                  <div className="flex-1">
                    <h4 
                      className="text-base sm:text-lg md:text-xl font-bold mb-2"
                      style={{ 
                        color: '#1E65AD',
                        fontFamily: "'Heebo', sans-serif",
                        fontWeight: 600
                      }}
                    >
                      Email Us
                    </h4>
                    <a 
                      href="mailto:inquiry@salhakar.com"
                      className="text-sm sm:text-base md:text-lg transition-colors duration-300 break-words"
                      style={{ 
                        color: '#8C969F',
                        fontFamily: "'Heebo', sans-serif"
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#1E65AD'}
                      onMouseLeave={(e) => e.target.style.color = '#8C969F'}
                    >
                      inquiry@salhakar.com
                    </a>
                    <p 
                      className="text-xs sm:text-sm mt-1"
                      style={{ 
                        color: '#8C969F',
                        fontFamily: "'Heebo', sans-serif"
                      }}
                    >
                      Send us an email anytime
                    </p>
                  </div>
                </div>

                {/* Response Time */}
                <div className="flex items-start gap-4">
                  <div 
                    className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(207, 155, 99, 0.1)' }}
                  >
                    <Clock className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: '#CF9B63' }} />
                  </div>
                  <div className="flex-1">
                    <h4 
                      className="text-base sm:text-lg md:text-xl font-bold mb-2"
                      style={{ 
                        color: '#1E65AD',
                        fontFamily: "'Heebo', sans-serif",
                        fontWeight: 600
                      }}
                    >
                      Response Time
                    </h4>
                    <p 
                      className="text-sm sm:text-base md:text-lg font-semibold mb-1"
                      style={{ 
                        color: '#1E65AD',
                        fontFamily: "'Heebo', sans-serif"
                      }}
                    >
                      Within 24 hours
                    </p>
                    <p 
                      className="text-xs sm:text-sm"
                      style={{ 
                        color: '#8C969F',
                        fontFamily: "'Heebo', sans-serif"
                      }}
                    >
                      We typically respond within a day
                    </p>
                  </div>
                </div>

                {/* Support Hours */}
                <div className="flex items-start gap-4">
                  <div 
                    className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(30, 101, 173, 0.1)' }}
                  >
                    <Clock className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: '#1E65AD' }} />
                  </div>
                  <div className="flex-1">
                    <h4 
                      className="text-base sm:text-lg md:text-xl font-bold mb-2"
                      style={{ 
                        color: '#1E65AD',
                        fontFamily: "'Heebo', sans-serif",
                        fontWeight: 600
                      }}
                    >
                      Support Hours
                    </h4>
                    <p 
                      className="text-sm sm:text-base md:text-lg font-semibold mb-1"
                      style={{ 
                        color: '#1E65AD',
                        fontFamily: "'Heebo', sans-serif"
                      }}
                    >
                      Mon - Fri, 9 AM - 6 PM IST
                    </p>
                    <p 
                      className="text-xs sm:text-sm"
                      style={{ 
                        color: '#8C969F',
                        fontFamily: "'Heebo', sans-serif"
                      }}
                    >
                      Our team is available during business hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
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
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontWeight: 700
              }}
            >
              Still Need Help?
            </h2>
            <p 
              className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 px-2 sm:px-0"
              style={{ 
                color: '#8C969F',
                fontFamily: "'Heebo', sans-serif",
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
                fontFamily: "'Heebo', sans-serif",
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
                    fontFamily: "'Bricolage Grotesque', sans-serif",
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
                    fontFamily: "'Heebo', sans-serif",
                    lineHeight: '1.6'
                  }}
                >
                  Live Chat feature is currently under development. We're working hard to bring you instant support. In the meantime, please use email support or check our FAQ section.
                </p>
                
                <button
                  onClick={closeComingSoon}
                  className="px-6 py-3 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg"
                  style={{
                    fontFamily: "'Heebo', sans-serif",
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
