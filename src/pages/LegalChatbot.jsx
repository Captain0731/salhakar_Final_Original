import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import { Send, Bot, User, X, RotateCcw, Mic, MicOff, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import apiService from "../services/api";

export default function LegalChatbot() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  const quickQuestions = [
    "What are my rights as a tenant?",
    "How do I file a consumer complaint?",
    "What is the process for property registration?",
    "How to draft a legal notice?",
    "What are the grounds for divorce?",
    "How to register a business?",
    "What is the procedure for will registration?",
    "How to file an RTI application?"
  ];

  useEffect(() => {
    // Initialize with welcome message
    setMessages([
      {
        id: 1,
        text: "Hello! I'm Kiki, your AI Legal Assistant. I can help you with various legal questions and provide guidance on legal matters. How can I assist you today?",
        sender: "bot",
        timestamp: new Date().toISOString()
      }
    ]);
  }, []);

  const scrollToBottom = useCallback(() => {
    // Use requestAnimationFrame to ensure DOM is updated
    requestAnimationFrame(() => {
      setTimeout(() => {
        // Try scrolling the messages container first
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
        // Also try scrolling to the end ref element
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }, 150);
    });
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added or typing state changes
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isTyping, scrollToBottom]);

  // Additional scroll when typing indicator appears/disappears
  useEffect(() => {
    if (isTyping) {
      scrollToBottom();
    }
  }, [isTyping, scrollToBottom]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage("");
    
    // Scroll to bottom immediately after adding user message
    setTimeout(() => {
      scrollToBottom();
    }, 50);
    
    setLoading(true);
    setIsTyping(true);

    try {
      // Call the AI Assistant API
      const response = await apiService.llmChat(currentInput);
      
      const botResponse = {
        id: Date.now() + 1,
        text: response.reply || "I'm sorry, I couldn't process your request. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        usedTools: response.used_tools || false,
        toolUsed: response.tool_used || null,
        searchInfo: response.search_info || null
      };

      setMessages(prev => [...prev, botResponse]);
      
      // Scroll to bottom after bot response
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorResponse = {
        id: Date.now() + 1,
        text: "I'm sorry, there was an error processing your message. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorResponse]);
      
      // Scroll to bottom after error response
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  // Voice Recording Functions
  const startRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      const streamRef = stream; // Store stream reference

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleVoiceInput(audioBlob);
        
        // Stop all tracks
        streamRef.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const handleVoiceInput = async (audioBlob) => {
    setIsProcessingVoice(true);
    setIsTyping(true);

    try {
      // Create a File object from the blob
      const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
      
      // Call the Speech API
      const response = await apiService.speechToGemini(audioFile);

      // Note: The new API doesn't return transcription separately
      // The transcription is handled internally and only the AI reply is returned
      // We'll show a placeholder message for voice input
      const userMessage = {
        id: Date.now(),
        text: "[Voice message]",
        sender: "user",
        timestamp: new Date().toISOString(),
        isVoice: true
      };
      setMessages(prev => [...prev, userMessage]);
      setTimeout(() => scrollToBottom(), 50);

      // Add bot response
      const botResponse = {
        id: Date.now() + 1,
        text: response.reply || "I'm sorry, I couldn't process your voice input. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        usedTools: response.used_tools || false,
        toolUsed: response.tool_used || null,
        searchInfo: response.search_info || null
      };
      setMessages(prev => [...prev, botResponse]);
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error processing voice input:', error);
      const errorResponse = {
        id: Date.now() + 1,
        text: "I'm sorry, there was an error processing your voice input. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsProcessingVoice(false);
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an audio file
    if (!file.type.startsWith('audio/')) {
      alert('Please upload an audio file.');
      return;
    }

    setIsProcessingVoice(true);
    setIsTyping(true);

    try {
      const response = await apiService.speechToGemini(file);

      // Note: The new API doesn't return transcription separately
      // The transcription is handled internally and only the AI reply is returned
      // We'll show a placeholder message for uploaded audio
      const userMessage = {
        id: Date.now(),
        text: "[Audio file uploaded]",
        sender: "user",
        timestamp: new Date().toISOString(),
        isVoice: true
      };
      setMessages(prev => [...prev, userMessage]);
      setTimeout(() => scrollToBottom(), 50);

      // Add bot response
      const botResponse = {
        id: Date.now() + 1,
        text: response.reply || "I'm sorry, I couldn't process your audio file. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        usedTools: response.used_tools || false,
        toolUsed: response.tool_used || null,
        searchInfo: response.search_info || null
      };
      setMessages(prev => [...prev, botResponse]);
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error processing audio file:', error);
      const errorResponse = {
        id: Date.now() + 1,
        text: "I'm sorry, there was an error processing your audio file. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsProcessingVoice(false);
      setIsTyping(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm Kiki, your AI Legal Assistant. I can help you with various legal questions and provide guidance on legal matters. How can I assist you today?",
        sender: "bot",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F9FAFC' }}>
      <Navbar />

      {/* Chat Interface - Full Page */}
      <div className="flex-1 flex flex-col pt-16 sm:pt-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
          style={{ 
            height: 'calc(100vh - 64px)'
          }}
        >
                {/* Chat Header with Gradient */}
                <div className="p-4 sm:p-5 md:p-6 border-b shadow-lg" style={{ 
                  background: 'linear-gradient(135deg, #1E65AD 0%, #2563eb 50%, #1E65AD 100%)',
                  borderColor: '#1E65AD'
                }}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-xl" style={{ 
                          background: 'linear-gradient(135deg, #CF9B63 0%, #d4a574 100%)'
                        }}>
                          <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-3 border-white shadow-lg">
                          <div className="w-full h-full bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl font-bold truncate text-white" style={{ 
                          fontFamily: "'Heebo', 'Helvetica Hebrew Bold', sans-serif",
                          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          Kiki AI Assistant
                        </h3>
                        <p className="text-sm sm:text-base flex items-center gap-2 truncate text-white/90" style={{ fontFamily: "'Roboto', sans-serif" }}>
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0 shadow-sm"></span>
                          <span className="truncate">Online • Ready to help</span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={clearChat}
                      className="px-4 py-2 text-sm text-white border border-white/30 rounded-lg hover:bg-white/20 transition-all duration-200 font-medium flex items-center gap-2 flex-shrink-0 shadow-md hover:shadow-lg backdrop-blur-sm"
                      style={{ fontFamily: "'Roboto', sans-serif" }}
                      title="Clear Chat"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span className="hidden sm:inline">Clear</span>
                    </button>
                  </div>
                </div>

                {/* Messages Container */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5"
                  style={{ 
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#CBD5E0 #F7FAFC',
                    background: 'linear-gradient(to bottom, #F9FAFC 0%, #ffffff 100%)'
                  }}
                >
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                      key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] md:max-w-[75%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          {/* Avatar */}
                          <div className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-md ${
                            message.sender === 'user' 
                              ? '' 
                              : ''
                          }`} style={message.sender === 'user' ? {
                            background: 'linear-gradient(135deg, #1E65AD 0%, #2563eb 100%)'
                          } : {
                            background: 'linear-gradient(135deg, #CF9B63 0%, #d4a574 100%)'
                          }}>
                            {message.sender === 'user' ? (
                              <User className="w-5 h-5 text-white" />
                            ) : (
                              <Bot className="w-5 h-5 text-white" />
                            )}
                          </div>
                          
                          {/* Message Bubble */}
                          <div className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-lg ${
                            message.sender === 'user'
                              ? 'rounded-tr-sm'
                              : 'rounded-tl-sm'
                          }`} style={message.sender === 'user' ? {
                            background: 'linear-gradient(135deg, #1E65AD 0%, #2563eb 100%)',
                            color: 'white'
                          } : {
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                            color: '#1E65AD',
                            border: '1px solid #E5E7EB'
                          }}>
                            {message.isVoice && (
                              <div className="flex items-center gap-2 mb-2">
                                <Mic className="w-4 h-4" style={{ color: message.sender === 'user' ? 'rgba(255,255,255,0.8)' : '#CF9B63' }} />
                                <span className="text-xs italic" style={{ color: message.sender === 'user' ? 'rgba(255,255,255,0.8)' : '#CF9B63' }}>Voice input</span>
                              </div>
                            )}
                            {message.sender === 'bot' ? (
                              <div 
                                className="text-sm sm:text-base leading-relaxed break-words chatbot-markdown" 
                                style={{ fontFamily: "'Roboto', sans-serif", color: '#1E65AD' }}
                              >
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => <p style={{ marginBottom: '0.5rem', marginTop: '0.5rem' }}>{children}</p>,
                                    h1: ({ children }) => <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: '0.75rem', color: '#1E65AD', fontFamily: "'Heebo', 'Helvetica Hebrew Bold', sans-serif" }}>{children}</h1>,
                                    h2: ({ children }) => <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: '0.75rem', color: '#1E65AD', fontFamily: "'Heebo', 'Helvetica Hebrew Bold', sans-serif" }}>{children}</h2>,
                                    h3: ({ children }) => <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop: '0.75rem', color: '#1E65AD', fontFamily: "'Heebo', 'Helvetica Hebrew Bold', sans-serif" }}>{children}</h3>,
                                    ul: ({ children }) => <ul style={{ marginLeft: '1rem', marginBottom: '0.5rem', marginTop: '0.5rem', listStyleType: 'disc' }}>{children}</ul>,
                                    ol: ({ children }) => <ol style={{ marginLeft: '1rem', marginBottom: '0.5rem', marginTop: '0.5rem', listStyleType: 'decimal' }}>{children}</ol>,
                                    li: ({ children }) => <li style={{ marginBottom: '0.25rem' }}>{children}</li>,
                                    code: ({ children, className }) => {
                                      const isInline = !className;
                                      return isInline ? (
                                        <code style={{ 
                                          backgroundColor: 'rgba(30, 101, 173, 0.1)', 
                                          padding: '0.125rem 0.25rem', 
                                          borderRadius: '0.25rem',
                                          fontSize: '0.875em',
                                          fontFamily: 'monospace',
                                          color: '#1E65AD'
                                        }}>{children}</code>
                                      ) : (
                                        <code style={{ 
                                          display: 'block',
                                          background: 'linear-gradient(135deg, rgba(30, 101, 173, 0.05) 0%, rgba(30, 101, 173, 0.1) 100%)', 
                                          padding: '0.5rem', 
                                          borderRadius: '0.25rem',
                                          fontSize: '0.875em',
                                          fontFamily: 'monospace',
                                          overflowX: 'auto',
                                          marginTop: '0.5rem',
                                          marginBottom: '0.5rem',
                                          color: '#1E65AD',
                                          border: '1px solid rgba(30, 101, 173, 0.2)'
                                        }}>{children}</code>
                                      );
                                    },
                                    blockquote: ({ children }) => (
                                      <blockquote style={{ 
                                        borderLeft: '4px solid #CF9B63', 
                                        paddingLeft: '0.75rem', 
                                        marginLeft: '0',
                                        marginTop: '0.5rem',
                                        marginBottom: '0.5rem',
                                        fontStyle: 'italic',
                                        color: '#1E65AD',
                                        background: 'linear-gradient(90deg, rgba(207, 155, 99, 0.1) 0%, transparent 100%)',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '0.25rem'
                                      }}>{children}</blockquote>
                                    ),
                                    a: ({ href, children }) => (
                                      <a 
                                        href={href} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ 
                                          color: '#CF9B63', 
                                          textDecoration: 'underline',
                                          wordBreak: 'break-all',
                                          fontWeight: '500'
                                        }}
                                      >
                                        {children}
                                      </a>
                                    ),
                                    strong: ({ children }) => <strong style={{ fontWeight: 'bold' }}>{children}</strong>,
                                    em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
                                  }}
                                >
                                  {message.text}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-sm sm:text-base leading-relaxed break-words" style={{ fontFamily: "'Roboto', sans-serif" }}>
                                {message.text}
                              </p>
                            )}
                            <p className={`text-xs mt-2 ${
                          message.sender === 'user' ? 'text-white/80' : 'text-gray-500'
                            }`} style={{ fontFamily: "'Roboto', sans-serif" }}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md" style={{ 
                          background: 'linear-gradient(135deg, #CF9B63 0%, #d4a574 100%)'
                        }}>
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg" style={{
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                          border: '1px solid #E5E7EB'
                        }}>
                          <div className="flex space-x-1.5">
                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#1E65AD', animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#1E65AD', animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: '#1E65AD', animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 sm:p-5 md:p-6 border-t bg-white shadow-lg" style={{ 
                  borderColor: '#E5E7EB',
                  background: 'linear-gradient(to top, #ffffff 0%, #f8f9fa 100%)'
                }}>
                  {/* Voice Recording Animation Overlay */}
                  <AnimatePresence>
                    {isRecording && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-lg sm:rounded-xl flex items-center gap-3 sm:gap-4"
                      >
                        <div className="flex-shrink-0">
                          <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                            <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-full flex items-center justify-center">
                              <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-red-700 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                            Recording...
                          </p>
                          <div className="flex items-center gap-1">
                            <div className="flex items-end gap-0.5 sm:gap-1" style={{ height: '20px' }}>
                              <div className="w-0.5 sm:w-1 bg-red-500 rounded-full animate-voice-bar" style={{ animationDelay: '0s', height: '8px' }}></div>
                              <div className="w-0.5 sm:w-1 bg-red-500 rounded-full animate-voice-bar" style={{ animationDelay: '0.1s', height: '12px' }}></div>
                              <div className="w-0.5 sm:w-1 bg-red-500 rounded-full animate-voice-bar" style={{ animationDelay: '0.2s', height: '16px' }}></div>
                              <div className="w-0.5 sm:w-1 bg-red-500 rounded-full animate-voice-bar" style={{ animationDelay: '0.3s', height: '20px' }}></div>
                              <div className="w-0.5 sm:w-1 bg-red-500 rounded-full animate-voice-bar" style={{ animationDelay: '0.4s', height: '16px' }}></div>
                              <div className="w-0.5 sm:w-1 bg-red-500 rounded-full animate-voice-bar" style={{ animationDelay: '0.5s', height: '12px' }}></div>
                              <div className="w-0.5 sm:w-1 bg-red-500 rounded-full animate-voice-bar" style={{ animationDelay: '0.6s', height: '8px' }}></div>
                            </div>
                            <p className="text-xs sm:text-sm text-red-600 ml-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                              Click mic button to stop
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-3">
                    {/* Voice Recording Button */}
                    <button
                      onClick={startRecording}
                      disabled={loading || isProcessingVoice}
                      className={`w-12 h-12 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center flex-shrink-0 ${
                        isRecording 
                          ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
                          : 'disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                      style={!isRecording ? {
                        background: 'linear-gradient(135deg, #CF9B63 0%, #d4a574 100%)',
                        color: 'white'
                      } : {}}
                      title={isRecording ? "Click to stop recording" : "Click to start recording"}
                    >
                      {isRecording ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </button>

                    {/* File Upload Button */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="audio-file-input"
                      disabled={loading || isProcessingVoice}
                    />
                    <label
                      htmlFor="audio-file-input"
                      className={`w-12 h-12 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center flex-shrink-0 cursor-pointer ${
                        loading || isProcessingVoice
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                      style={{
                        background: 'linear-gradient(135deg, #CF9B63 0%, #d4a574 100%)',
                        color: 'white'
                      }}
                      title="Upload audio file"
                    >
                      <Upload className="w-5 h-5" />
                    </label>

                    <div className="flex-1 relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                        <img 
                          src="/uit3.GIF" 
                          alt="Message" 
                          className="w-10 h-15"
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                      <textarea
                        ref={inputRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask your legal question..."
                        rows={1}
                        className="w-full pr-11 py-3.5 text-sm sm:text-base border-2 rounded-xl focus:ring-2 transition-all resize-none overflow-hidden"
                        style={{ 
                          fontFamily: "'Roboto', sans-serif",
                          minHeight: '48px',
                          maxHeight: '120px',
                          borderColor: '#E5E7EB',
                          backgroundColor: '#F9FAFC',
                          paddingLeft: '56px'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#1E65AD';
                          e.target.style.backgroundColor = 'white';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#E5E7EB';
                          e.target.style.backgroundColor = '#F9FAFC';
                        }}
                        disabled={loading || isProcessingVoice}
                        onInput={(e) => {
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                      />
                      {inputMessage && (
                        <button
                          onClick={() => setInputMessage("")}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={loading || isProcessingVoice || !inputMessage.trim()}
                      className="w-12 h-12 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center flex-shrink-0"
                      style={{ 
                        fontFamily: "'Roboto', sans-serif",
                        background: 'linear-gradient(135deg, #1E65AD 0%, #2563eb 100%)'
                      }}
                    >
                      {(loading || isProcessingVoice) ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                 
                </div>
        </motion.div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #F7FAFC;
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #CBD5E0;
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #A0AEC0;
        }
        
        /* Voice Recording Animation */
        @keyframes voice-bar {
          0%, 100% {
            transform: scaleY(0.4);
            opacity: 0.7;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
        
        .animate-voice-bar {
          animation: voice-bar 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
