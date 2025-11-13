import React, { useState } from "react";

const FAQ = () => {
  const [openItems, setOpenItems] = useState({});

  const faqData = [
    {
      id: 1,
      question: "What is सलहाकार and how does it help legal professionals?",
      answer: "सलहाकार is an AI-powered legal technology platform designed to revolutionize legal research and practice management. It provides comprehensive access to judgments, legal templates, AI chatbot assistance, and advanced search capabilities to help lawyers, law students, and legal professionals work more efficiently and effectively."
    },
    {
      id: 2,
      question: "How accurate is the AI chatbot for legal queries?",
      answer: "Our AI chatbot is trained on extensive legal databases and continuously updated with the latest legal precedents and regulations. While it provides highly accurate information for general legal queries, we always recommend consulting with qualified legal professionals for specific case advice. The chatbot serves as a powerful research assistant and starting point for legal analysis."
    },
    {
      id: 3,
      question: "Is my data secure and confidential?",
      answer: "Absolutely. We take data security and confidentiality very seriously. All data is encrypted using industry-standard protocols, and we comply with relevant data protection regulations. We never share your personal information or case details with third parties. Our platform is designed with privacy-by-design principles to ensure your sensitive legal information remains secure."
    },
    {
      id: 4,
      question: "How do I get started with सलहाकार?",
      answer: "Getting started is easy! Simply sign up for a free trial account, choose your profession (Student, Lawyer, Law Firm, or Other), and complete the verification process. Once verified, you'll have access to all features for 14 days. You can upgrade to a paid plan anytime during or after your trial period."
    },
    {
      id: 5,
      question: "What types of legal documents and templates are available?",
      answer: "We offer a comprehensive library of legal templates including contracts, agreements, court filings, legal notices, and procedural documents. Our templates cover various practice areas such as corporate law, civil litigation, criminal law, family law, and more. All templates are regularly updated to reflect current legal requirements and best practices."
    },
    {
      id: 6,
      question: "How does the judgment search feature work?",
      answer: "Our judgment search feature uses advanced AI algorithms to search through thousands of legal judgments from various courts across India. You can search by keywords, case numbers, judge names, dates, or legal concepts. The system provides relevant results with highlighted excerpts and case summaries to help you quickly find the information you need."
    }
  ];

  const toggleItem = (id) => {
    setOpenItems(prev => {
      // If clicking the same item that's open, close it
      if (prev[id]) {
        return {};
      } else {
        // If opening a new item, close all others and open this one
        return { [id]: true };
      }
    });
  };

  return (
    <section id="faq" className="py-10 md:py-20 bg-[#F9FAFC]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-14 xl:px-18">
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12"
          style={{
            color: "#1E65AD",
            fontFamily: "'Heebo', 'Helvetica Hebrew Bold', sans-serif",
            fontWeight: 700,
            letterSpacing: "-0.02em"
          }}
        >
          FAQ's
        </h2>
        
        <div className="space-y-0 grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
          {faqData.map((item, index) => (
            <div
              key={item.id}
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full py-5 md:py-6 px-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200 group"
              >
                <span
                  className="text-base md:text-lg font-semibold flex-1 pr-4"
                  style={{
                    color: "#1E65AD",
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: 600
                  }}
                >
                  {item.question}
                </span>
                <div className="flex-shrink-0">
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 ${
                      openItems[item.id] ? "rotate-180" : ""
                    }`}
                    style={{
                      color: openItems[item.id] ? "#1E65AD" : "#8C969F"
                    }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {openItems[item.id] ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    )}
                  </svg>
                </div>
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openItems[item.id] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-4 pb-5 md:pb-6">
                  <p
                    className="text-sm md:text-base leading-relaxed"
                    style={{
                      color: "#8C969F",
                      fontFamily: "'Roboto', sans-serif",
                      fontWeight: 400
                    }}
                  >
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;