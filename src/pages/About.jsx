import React, { useEffect } from "react";
import Navbar from "../components/landing/Navbar";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useLocation } from "react-router-dom";

const About = () => {
  // const features = [
  //   "AI-Powered Legal Research",
  //   "Multilingual Support",
  //   "Comprehensive Legal Database",
  //   "Advanced Search & Mapping"
  // ];

  const location = useLocation();

  useEffect(() => {
    // Scroll to section if hash is present
    if (location.hash) {
      setTimeout(() => {
        const hash = location.hash.substring(1); // Remove the # symbol
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
      <Navbar />
      
      {/* Enhanced Header Section */}
      <div className="bg-white border-b border-gray-200 pt-14 sm:pt-16 md:pt-20 animate-slide-in-bottom w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 lg:py-12 w-full">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 animate-fade-in-up" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              About Us
            </h1>
            <div className="w-12 sm:w-16 md:w-20 h-0.5 sm:h-1 mx-auto mb-3 sm:mb-4 md:mb-6 animate-fade-in-up" style={{ backgroundColor: '#CF9B63', animationDelay: '0.2s' }}></div>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl mx-auto px-2 sm:px-4 animate-fade-in-up" style={{ color: '#8C969F', fontFamily: 'Roboto, sans-serif', animationDelay: '0.4s' }}>
              Learn about our mission to revolutionize legal research and make justice accessible to all
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 -mt-8 sm:-mt-12">
          {/* Section 1: About Salhakar */}
          <section className="mb-8 sm:mb-12 md:mb-16 lg:mb-20 xl:mb-24 relative">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-lg mx-2 sm:mx-0"
              style={{
                border: '1px solid rgba(30, 101, 173, 0.1)',
                boxShadow: '0 4px 20px rgba(30, 101, 173, 0.08)'
              }}
            >
              <h2
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 md:mb-6"
                style={{
                  color: '#1E65AD',
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  letterSpacing: '-0.02em'
                }}
              >
                About <span style={{
                  color: '#1E65AD',
                  fontFamily: "'Bricolage Grotesque', sans-serif"
                }}>Salhakar</span>
              </h2>
              <div className="w-12 sm:w-14 md:w-16 h-0.5 sm:h-1 rounded-full mb-3 sm:mb-4 md:mb-6"
                style={{ backgroundColor: '#CF9B63' }}
              ></div>
              <p 
                className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed break-words"
                style={{ 
                  color: '#8C969F', 
              fontFamily: "'Heebo', sans-serif",
                  lineHeight: '1.8',
              fontWeight: 400
            }}
          >
                India's legal world is changing and with Salhakar, it will change for everyone. We built
                Salhakar to break down the old barriers of language, complexity, and slow-moving
                tradition. We at Salhakar believe that advanced AI and technology, can make legal
                research instant, conversational, and accessible - giving every legal mind, from firstyear student to leading advocate, the tools to succeed.
              </p>
        </div>
      </section>

          {/* Section 2: Mission & Vision */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16 lg:mb-20 xl:mb-24 px-2 sm:px-0">
            <section className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-lg transition-transform duration-300 hover:scale-[1.02]"
              style={{
                border: '1px solid rgba(30, 101, 173, 0.1)',
                boxShadow: '0 4px 20px rgba(30, 101, 173, 0.08)'
              }}
            >
              <div className="mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg mb-3 sm:mb-4 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(30, 101, 173, 0.1)' }}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 md:mb-4"
                  style={{
                    color: '#1E65AD',
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    letterSpacing: '-0.02em'
                  }}
                >
                  Our <span style={{
                    color: '#1E65AD',
                    fontFamily: "'Bricolage Grotesque', sans-serif"
                  }}>Mission</span>
                </h2>
                <div className="w-10 sm:w-12 h-0.5 sm:h-1 rounded-full mb-2 sm:mb-3 md:mb-4"
                  style={{ backgroundColor: '#CF9B63' }}
                ></div>
              </div>
              <p
                className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed break-words"
            style={{
                  color: '#8C969F', 
                  fontFamily: "'Heebo', sans-serif",
                  lineHeight: '1.8',
                  fontWeight: 400
                }}
              >
                To transform how India discovers and applies the law, making every judgment,
                statute, and legal answer just a click, a question, or a voice command away. We
                are redefining research by putting clarity, reliability, and the human experience
                first.
              </p>
            </section>

            {/* Section 3: Vision */}
            <section className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-lg transition-transform duration-300 hover:scale-[1.02]"
              style={{
                border: '1px solid rgba(30, 101, 173, 0.1)',
                boxShadow: '0 4px 20px rgba(30, 101, 173, 0.08)'
              }}
            >
              <div className="mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg mb-3 sm:mb-4 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(30, 101, 173, 0.1)' }}
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#1E65AD' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h2
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-2 sm:mb-3 md:mb-4"
                  style={{
                    color: '#1E65AD',
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    letterSpacing: '-0.02em'
                  }}
                >
                  Our <span style={{
                    color: '#1E65AD',
                    fontFamily: "'Bricolage Grotesque', sans-serif"
                  }}>Vision</span>
                </h2>
                <div className="w-10 sm:w-12 h-0.5 sm:h-1 rounded-full mb-2 sm:mb-3 md:mb-4"
                  style={{ backgroundColor: '#CF9B63' }}
                ></div>
              </div>
              <p 
                className="text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed break-words"
                style={{ 
                  color: '#8C969F', 
              fontFamily: "'Heebo', sans-serif",
                  lineHeight: '1.8',
              fontWeight: 400
            }}
          >
                A future where law in India is transparent, understandable, and reachable for all.
                Salhakar envisions a nation where legal knowledge flows freely across every
                language, device, and demographic - empowering smarter, faster, and fairer
                justice everywhere.
              </p>
            </section>
          </div>

          {/* Team Section */}
          <section id="our-team" className="mt-8 sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28 mb-8 sm:mb-12 md:mb-16 lg:mb-20 xl:mb-24">
           <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16 px-2">
                 <h2
                   className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4"
                   style={{
                     color: '#1E65AD',
                     fontFamily: "'Bricolage Grotesque', sans-serif",
                     fontWeight: 700,
                     letterSpacing: '-0.02em'
                   }}
                 >
                   Our Team
               </h2>
               <div className="w-16 sm:w-20 md:w-24 h-1 sm:h-1.5 mx-auto rounded-full mb-3 sm:mb-4 md:mb-6"
                 style={{ backgroundColor: '#CF9B63' }}
               ></div>
                 <p
                   className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl max-w-3xl mx-auto px-2"
                   style={{
                     color: '#8C969F',
                     fontFamily: "'Heebo', sans-serif",
                     fontWeight: 400,
                     lineHeight: '1.75'
                   }}
                 >
                   Our dedicated team at Salhakar is committed for providing the best fusion of tech and AI to our valued customers.
                 </p>
               </div>


              {/* Bottom Row - 2 Cards Centered */}
              <div className="flex justify-center px-2 sm:px-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12 max-w-4xl w-full">
                {/* Team Member 4 */}
                <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
                  style={{
                    border: '1px solid rgba(30, 101, 173, 0.1)',
                    boxShadow: '0 4px 20px rgba(30, 101, 173, 0.08)'
                  }}
                >
                  <div className="h-48 sm:h-56 md:h-64 flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(30, 101, 173, 0.1) 0%, rgba(207, 155, 99, 0.1) 100%)'
                    }}
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center">
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#1E65AD' }}>
                      PS
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 md:p-6 text-center">
                    <h3
                      className="text-lg sm:text-xl font-bold mb-1 sm:mb-2"
                      style={{
                        color: '#1E65AD',
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontWeight: 700
                      }}
                    >
                      Pratham Shah
                    </h3>
                    <p
                      className="text-sm sm:text-base mb-2 sm:mb-3 md:mb-4"
                      style={{
                        color: '#8C969F',
                        fontFamily: "'Heebo', sans-serif",
                        fontWeight: 400
                      }}
                    >
                      Chief  Executive Officer
                    </p>
                    <p
                      className="text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed break-words"
                      style={{
                        color: '#8C969F',
                        fontFamily: "'Heebo', sans-serif",
                        fontWeight: 400,
                        lineHeight: '1.6'
                      }}
                    >
                      I'm Pratham Shah, the Founder & CEO at Salhakar. My focus is on shaping the vision of what we're building and understanding the real challenges lawyers & Law students face every day in their life. I believe technology can solve that especially AI, it can solve many of these pain points and make legal research far more accessible and efficient.
                    </p>
                    <div className="flex justify-center gap-3 sm:gap-4">
                      <a
                        href="https://linkedin.com/in/amit-patel"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1E65AD] hover:text-[#CF9B63] transition-colors duration-200"
                        aria-label="LinkedIn"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                      <a
                        href="mailto:amit@salhakar.com"
                        className="text-[#1E65AD] hover:text-[#CF9B63] transition-colors duration-200"
                        aria-label="Email"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Team Member 5 */}
                <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
                  style={{
                    border: '1px solid rgba(30, 101, 173, 0.1)',
                    boxShadow: '0 4px 20px rgba(30, 101, 173, 0.08)'
                  }}
                >
                  <div className="h-48 sm:h-56 md:h-64 flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(30, 101, 173, 0.1) 0%, rgba(207, 155, 99, 0.1) 100%)'
                    }}
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center">
                      <span className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#1E65AD' }}>
                        PC
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5 md:p-6 text-center">
                    <h3
                      className="text-lg sm:text-xl font-bold mb-1 sm:mb-2"
                      style={{
                        color: '#1E65AD',
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontWeight: 700
                      }}
                    >
                      Parth Chelani
                    </h3>
                    <p
                      className="text-sm sm:text-base mb-2 sm:mb-3 md:mb-4"
                      style={{
                        color: '#8C969F',
                        fontFamily: "'Heebo', sans-serif",
                        fontWeight: 400
                      }}
                    >
                      Chief Operating Officer
                    </p>
                    <p
                      className="text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed break-words"
                      style={{
                        color: '#8C969F',
                        fontFamily: "'Heebo', sans-serif",
                        fontWeight: 400,
                        lineHeight: '1.6'
                      }}
                    >
                      I'm Parth Chelani, Salhakar's Co-founder and COO. I'm focused on making that idea into actual reality. My responsibility is to provide structure and execution to our ideas, ensuring that what we create is unique, practical for lawyers and law students. I'm excited about bridging the gap between concepts and real-world solutions so that Salhakar may actually make an effect in the legal field.
                    </p>
                    <div className="flex justify-center gap-3 sm:gap-4">
                      <a
                        href="https://linkedin.com/in/sneha-reddy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1E65AD] hover:text-[#CF9B63] transition-colors duration-200"
                        aria-label="LinkedIn"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                      <a
                        href="mailto:sneha@salhakar.com"
                        className="text-[#1E65AD] hover:text-[#CF9B63] transition-colors duration-200"
                        aria-label="Email"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </a>
            </div>
          </div>
        </div>
      </div>
            </div>

            {/* Top Row - 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-12 max-w-6xl mx-auto mb-4 sm:mb-6 md:mb-8 lg:mb-12 pt-4 sm:pt-6 md:pt-10 px-2 sm:px-0">
              {/* Team Member 1 */}
              <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
                style={{
                  border: '1px solid rgba(30, 101, 173, 0.1)',
                  boxShadow: '0 4px 20px rgba(30, 101, 173, 0.08)'
                }}
              >
                <div className="h-48 sm:h-56 md:h-64 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 101, 173, 0.1) 0%, rgba(207, 155, 99, 0.1) 100%)'
                  }}
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#1E65AD' }}>
                      AB
                    </span>
                  </div>
                </div>
                <div className="p-4 sm:p-5 md:p-6 text-center">
                  <h3
                    className="text-lg sm:text-xl font-bold mb-1 sm:mb-2"
                    style={{
                      color: '#1E65AD',
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      fontWeight: 700
                    }}
                  >
                   Aditya Barasiya
                  </h3>
                  <p
                    className="text-sm sm:text-base mb-2 sm:mb-3 md:mb-4"
                    style={{
                      color: '#8C969F',
                      fontFamily: "'Heebo', sans-serif",
                      fontWeight: 400
                    }}
                  >
                    Technical Lead
                  </p>
                  <p
                    className="text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed break-words"
                    style={{
                      color: '#8C969F',
                      fontFamily: "'Heebo', sans-serif",
                      fontWeight: 400,
                      lineHeight: '1.6'
                    }}
                  >
                    Senior legal counsel with expertise in Indian law and regulatory compliance. Former Supreme Court advocate with 12+ years of experience.
                  </p>
                  <div className="flex justify-center gap-3 sm:gap-4">
                    <a
                      href="https://linkedin.com/in/anjali-mehta"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1E65AD] hover:text-[#CF9B63] transition-colors duration-200"
                      aria-label="LinkedIn"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                    <a
                      href="mailto:anjali@salhakar.com"
                      className="text-[#1E65AD] hover:text-[#CF9B63] transition-colors duration-200"
                      aria-label="Email"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Team Member 2 */}
              <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
                style={{
                  border: '1px solid rgba(30, 101, 173, 0.1)',
                  boxShadow: '0 4px 20px rgba(30, 101, 173, 0.08)'
                }}
              >
                <div className="h-48 sm:h-56 md:h-64 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 101, 173, 0.1) 0%, rgba(207, 155, 99, 0.1) 100%)'
                  }}
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#1E65AD' }}>
                      HG
                    </span>
                  </div>
                </div>
                <div className="p-4 sm:p-5 md:p-6 text-center">
                  <h3
                    className="text-lg sm:text-xl font-bold mb-1 sm:mb-2"
                    style={{
                      color: '#1E65AD',
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      fontWeight: 700
                    }}
                  >
                    Harshil Gajjar
                  </h3>
                  <p
                    className="text-sm sm:text-base mb-2 sm:mb-3 md:mb-4"
                    style={{
                      color: '#8C969F',
                      fontFamily: "'Heebo', sans-serif",
                      fontWeight: 400
                    }}
                  >
                    Full Stack Developer
                  </p>
                  <p
                    className="text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed break-words"
            style={{
                      color: '#8C969F',
                      fontFamily: "'Heebo', sans-serif",
                      fontWeight: 400,
                      lineHeight: '1.6'
                    }}
                  >
                    Full-stack developer and AI specialist with expertise in natural language processing and legal document analysis.
                  </p>
                  <div className="flex justify-center gap-3 sm:gap-4">
                    <a
                      href="https://linkedin.com/in/rajesh-kumar"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1E65AD] hover:text-[#CF9B63] transition-colors duration-200"
                      aria-label="LinkedIn"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                    <a
                      href="mailto:rajesh@salhakar.com"
                      className="text-[#1E65AD] hover:text-[#CF9B63] transition-colors duration-200"
                      aria-label="Email"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

                  {/* Team Member 3 */}
              <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
                style={{
                  border: '1px solid rgba(30, 101, 173, 0.1)',
                  boxShadow: '0 4px 20px rgba(30, 101, 173, 0.08)'
                }}
              >
                <div className="h-48 sm:h-56 md:h-64 flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(30, 101, 173, 0.1) 0%, rgba(207, 155, 99, 0.1) 100%)'
                  }}
                >
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#1E65AD' }}>
                      PS
                    </span>
                  </div>
                </div>
                <div className="p-4 sm:p-5 md:p-6 text-center">
                  <h3
                    className="text-lg sm:text-xl font-bold mb-1 sm:mb-2"
                    style={{
                      color: '#1E65AD',
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      fontWeight: 700
                    }}
                  >
                    Khushi Kothadia
                  </h3>
                  <p
                    className="text-sm sm:text-base mb-2 sm:mb-3 md:mb-4"
                    style={{
                      color: '#8C969F',
              fontFamily: "'Heebo', sans-serif",
              fontWeight: 400
            }}
          >
                    App Developer
                  </p>
                  <p
                    className="text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed break-words"
                    style={{
                      color: '#8C969F',
                      fontFamily: "'Heebo', sans-serif",
                      fontWeight: 400,
                      lineHeight: '1.6'
                    }}
                  >
                    Product strategist with a background in legal tech and user experience design. Focused on creating intuitive legal solutions.
                  </p>
                  <div className="flex justify-center gap-3 sm:gap-4">
                    <a
                      href="https://linkedin.com/in/priya-sharma"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1E65AD] hover:text-[#CF9B63] transition-colors duration-200"
                      aria-label="LinkedIn"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                    <a
                      href="mailto:priya@salhakar.com"
                      className="text-[#1E65AD] hover:text-[#CF9B63] transition-colors duration-200"
                      aria-label="Email"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
        </div>

          
          </section>

          {/* Career Section */}
          <section id="careers" className="mt-8 sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28 mb-8 sm:mb-12 md:mb-16 lg:mb-20 xl:mb-24">
            <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16">
                <h2
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4"
                  style={{
                    color: '#1E65AD',
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontWeight: 700,
                    letterSpacing: '-0.02em'
                  }}
                >
                  Join Our Team
              </h2>
              <div className="w-16 sm:w-20 md:w-24 h-1 sm:h-1.5 mx-auto rounded-full mb-3 sm:mb-4 md:mb-6"
                style={{ backgroundColor: '#CF9B63' }}
              ></div>
              <p 
                  className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl max-w-3xl mx-auto px-2"
                  style={{
                    color: '#8C969F',
                    fontFamily: "'Heebo', sans-serif",
                    fontWeight: 400,
                    lineHeight: '1.75'
                  }}
                >
                  We're always looking for talented individuals who share our passion for making legal services 
                  more accessible and efficient. Join us in building the future of legal technology.
                </p>
              </div>

              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 shadow-lg mx-2 sm:mx-0"
                style={{
                  border: '1px solid rgba(30, 101, 173, 0.1)',
                  boxShadow: '0 4px 20px rgba(30, 101, 173, 0.08)'
                }}
              >
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
                  <div>
                    <h3
                      className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-5 md:mb-6"
                      style={{
                        color: '#1E65AD',
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontWeight: 700
                      }}
                    >
                      Why Join Salhakar?
                    </h3>
                    <ul className="space-y-3 sm:space-y-4">
                <li className="flex items-start">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E65AD] mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p
                          className="text-xs sm:text-sm md:text-base break-words"
                          style={{
                            color: '#8C969F',
                            fontFamily: "'Heebo', sans-serif",
                            fontWeight: 400,
                            lineHeight: '1.75'
                          }}
                        >
                          Work on cutting-edge AI and legal technology projects
                        </p>
                </li>
                <li className="flex items-start">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E65AD] mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p
                          className="text-xs sm:text-sm md:text-base break-words"
                          style={{
                            color: '#8C969F',
                            fontFamily: "'Heebo', sans-serif",
                            fontWeight: 400,
                            lineHeight: '1.75'
                          }}
                        >
                          Collaborative and innovative work environment
                        </p>
                </li>
                <li className="flex items-start">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E65AD] mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p
                          className="text-xs sm:text-sm md:text-base break-words"
                          style={{
                            color: '#8C969F',
                            fontFamily: "'Heebo', sans-serif",
                            fontWeight: 400,
                            lineHeight: '1.75'
                          }}
                        >
                          Opportunities for professional growth and development
                        </p>
                </li>
                <li className="flex items-start">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#1E65AD] mr-2 sm:mr-3 flex-shrink-0 mt-0.5 sm:mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p
                          className="text-xs sm:text-sm md:text-base break-words"
                          style={{
                            color: '#8C969F',
                            fontFamily: "'Heebo', sans-serif",
                            fontWeight: 400,
                            lineHeight: '1.75'
                          }}
                        >
                          Make a meaningful impact on legal accessibility
                        </p>
                </li>
              </ul>
                  </div>

                  <div>
                    <h3
                      className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-5 md:mb-6"
                      style={{
                        color: '#1E65AD',
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontWeight: 700
                      }}
                    >
                      Open Positions
                    </h3>
                    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 md:mb-8">
                      <div className="p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-md"
                        style={{
                          backgroundColor: '#F9FAFC',
                          border: '1px solid rgba(30, 101, 173, 0.1)'
                        }}
                      >

                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-2">
                        <h4
                          className="text-base sm:text-lg font-semibold"
                          style={{
                            color: '#1E65AD',
                            fontFamily: "'Heebo', sans-serif",
                            fontWeight: 600
                          }}
                        >
                          Software Engineer
                        </h4>
                        <a
                          href="mailto:careers@salhakar.com?subject=Application for Software Engineer Position"
                          className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-200 w-full sm:w-auto"
                          style={{
                            backgroundColor: '#1E65AD',
                            color: '#FFFFFF'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#CF9B63'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#1E65AD'}
                        >
                          Apply Now
                        </a>
                        </div>
                        
                        <p
                          className="text-xs sm:text-sm mb-1 sm:mb-2 break-words"
                          style={{
                            color: '#8C969F',
                            fontFamily: "'Heebo', sans-serif",
                            fontWeight: 400
                          }}
                        >
                          Full-time • Remote/On-site
                        </p>
                        <p
                          className="text-xs sm:text-sm mb-2 sm:mb-4 break-words"
                          style={{
                            color: '#8C969F',
                            fontFamily: "'Heebo', sans-serif",
                            fontWeight: 400
                          }}
                        >
                          We're looking for experienced developers to help build our AI-powered legal platform.
                        </p>
                       
                      </div>
                      <div className="p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-md"
                        style={{
                          backgroundColor: '#F9FAFC',
                          border: '1px solid rgba(30, 101, 173, 0.1)'
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mb-2">
                        <h4
                          className="text-base sm:text-lg font-semibold"
                          style={{
                            color: '#1E65AD',
                            fontFamily: "'Heebo', sans-serif",
                            fontWeight: 600
                          }}
                        >
                          Legal Researcher
                        </h4>
                        
                        <a
                          href="mailto:careers@salhakar.com?subject=Application for Legal Researcher Position"
                          className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-200 w-full sm:w-auto"
                          style={{
                            backgroundColor: '#1E65AD',
                            color: '#FFFFFF'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#CF9B63'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#1E65AD'}
                        >
                          Apply Now
                        </a>
                        </div>  
                        <p
                          className="text-xs sm:text-sm mb-1 sm:mb-2 break-words"
                          style={{
                            color: '#8C969F',
                            fontFamily: "'Heebo', sans-serif",
                            fontWeight: 400
                          }}
                        >
                          Full-time • Remote/On-site
                        </p>
                        <p
                          className="text-xs sm:text-sm mb-2 sm:mb-4 break-words"
                          style={{
                            color: '#8C969F',
                            fontFamily: "'Heebo', sans-serif",
                            fontWeight: 400
                          }}
                        >
                          Join our team to help curate and organize legal content for our platform.
                        </p>
                        
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </section>
        </div>
      </div>
  );
};

export default About;

