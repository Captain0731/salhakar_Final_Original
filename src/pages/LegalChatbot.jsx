import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import { 
  Send, Bot, User, X, RotateCcw, Mic, MicOff, Upload, 
  Search, Code, Image, BookOpen, Globe, Copy, ThumbsUp, 
  ThumbsDown, Save, MoreVertical, ArrowLeft, RefreshCw, 
  Edit, Paperclip, ChevronRight, HelpCircle, Building2, 
  SquareStack, Lightbulb, Settings, Share2, Shuffle
} from "lucide-react";
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

  const regenerate = async (messageId) => {
    // Find the user message that triggered this bot response
    const botMessageIndex = messages.findIndex(m => m.id === messageId);
    if (botMessageIndex === -1 || botMessageIndex === 0) return;
    
    const userMessage = messages[botMessageIndex - 1];
    if (userMessage.sender !== 'user') return;

    // Remove the old bot response
    const updatedMessages = messages.slice(0, botMessageIndex);
    setMessages(updatedMessages);

    // Regenerate response
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await apiService.llmChat(userMessage.text);
      
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
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error regenerating response:', error);
      const errorResponse = {
        id: Date.now() + 1,
        text: "I'm sorry, there was an error processing your message. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorResponse]);
      setTimeout(() => scrollToBottom(), 100);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const hasUserMessages = messages.some(m => m.sender === 'user');

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
      <Navbar />

      {/* Perplexity Pro Inspired Interface */}
      <div className="flex-1 flex flex-col pt-14 sm:pt-16 md:pt-20 w-full overflow-hidden" style={{ backgroundColor: '#FFFFFF' }}>
        {!hasUserMessages ? (
          /* Initial State - Logo and Input */
          <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-200px)] pb-6 sm:pb-12 md:pb-16 lg:pb-20 px-4">
            {/* Centered Logo */}
            <div className="mb-6 sm:mb-8 md:mb-12 flex items-center justify-center gap-2 sm:gap-3">
              <img 
                src="/logo31.png" 
                alt="Kiki AI Logo" 
                className="h-6 sm:h-8 md:h-10 lg:h-12 w-auto"
                style={{ objectFit: 'contain' }}
              />
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight" style={{ 
                color: '#000000knwv',
                fontFamily: "'Helvetica Hebrew Bold', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
              }}>
                Kiki AI
              </h1>
            </div>

            {/* Voice Recording Waveform Indicator */}
            {isRecording && (
              <div className="w-full sm:w-[90%] md:w-[70%] max-w-3xl mx-auto mb-3 sm:mb-4 flex items-center justify-center gap-0.5 sm:gap-1 px-4">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 sm:w-1 bg-cyan-500 rounded-full"
                    style={{
                      height: `${Math.random() * 20 + 8}px`,
                      animation: `wave ${0.5 + Math.random() * 0.5}s ease-in-out infinite`,
                      animationDelay: `${i * 0.05}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* Input Box - Responsive width, centered */}
            <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[70%] max-w-3xl mx-auto">
              <div className="relative rounded-xl sm:rounded-2xl shadow-sm" style={{ 
                backgroundColor: '#F7F7F7',
                border: '1px solid #E5E7EB',
                minHeight: '60px',
                height: 'auto'
              }}>
                <div className="flex flex-col">
                  {/* Input Field Row */}
                  <div className="flex items-center h-[60px] sm:h-[70px] px-2 sm:px-3 md:px-4">
                    {/* Left Icon - uit3.gif */}
                    <div className="flex items-center flex-shrink-0">
                      <img 
                        src="/uit3.GIF" 
                        alt="Input" 
                        className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>

                    {/* Input Field */}
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask anything About Legal Matters."
                      className="flex-1 h-full px-2 sm:px-3 md:px-4 bg-transparent border-none outline-none text-xs sm:text-sm md:text-base placeholder-gray-500"
                      style={{ 
                        fontFamily: "'Roboto', sans-serif",
                        color: '#1F2937'
                      }}
                      disabled={loading || isProcessingVoice}
                    />

                    {/* Right Icons */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1 sm:p-1.5 hover:bg-gray-200 rounded-lg transition-colors" 
                        title="Attachment"
                        disabled={loading || isProcessingVoice}
                      >
                        <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#6B7280' }} />
                      </button>
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={loading || isProcessingVoice}
                        className="p-1 sm:p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                        title={isRecording ? "Stop recording" : "Voice input"}
                      >
                        {isRecording ? (
                          <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#EF4444' }} />
                        ) : (
                          <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#6B7280' }} />
                        )}
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={loading || isProcessingVoice || !inputMessage.trim()}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ 
                          backgroundColor: loading || isProcessingVoice || !inputMessage.trim() ? '#E5E7EB' : '#06B6D4',
                          color: 'white'
                        }}
                        title="Send"
                      >
                        {(loading || isProcessingVoice) ? (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="audio-file-input"
                  disabled={loading || isProcessingVoice}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Chat Interface After First Message */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col w-full"
          style={{ 
              height: 'calc(100vh - 56px)'
            }}
          >

                {/* Messages Container */}
                <div 
                  ref={messagesContainerRef}
              className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-6 md:py-8 lg:py-12 pb-24 sm:pb-6 md:pb-8 lg:pb-12 space-y-4 sm:space-y-6 md:space-y-8 w-full scrollbar-hide"
                  style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                backgroundColor: '#FFFFFF'
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
                {message.sender === 'user' ? (
                  /* User Message Bubble - Right Side, Light Gray Background */
                  <div className="max-w-[85%] sm:max-w-[75%] md:max-w-[70%] lg:max-w-[60%] ml-auto">
                    <div className="rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 shadow-sm" style={{ 
                      backgroundColor: '#F3F4F6',
                      border: '1px solid #E5E7EB'
                    }}>
                      <p className="text-xs sm:text-sm md:text-base leading-relaxed break-words" style={{ 
                        fontFamily: "'Roboto', sans-serif",
                        color: '#1F2937'
                      }}>
                        {message.text}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* AI Response Box */
                  <div className="max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[80%] w-full">
                    <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                      {/* Answer Section Header */}
                      <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs sm:text-sm font-semibold" style={{ color: '#1F2937' }}>
                            Answer
                          </h3>
                        </div>
                        <p className="text-[10px] sm:text-xs mt-1 sm:mt-2" style={{ color: '#9CA3AF' }}>
                          With the help of Kiki AI
                        </p>
                          </div>
                          
                      {/* AI Response Content */}
                      <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5">
                        <div 
                          className="text-xs sm:text-sm md:text-base leading-relaxed break-words" 
                          style={{ 
                            fontFamily: "'Roboto', sans-serif", 
                            color: '#1F2937'
                          }}
                              >
                                <ReactMarkdown
                                  components={{
                              p: ({ children }) => <p style={{ marginBottom: '0.75rem', marginTop: '0.75rem' }}>{children}</p>,
                              h1: ({ children }) => <h1 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', marginTop: '0.75rem', color: '#1F2937' }}>{children}</h1>,
                              h2: ({ children }) => <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', marginTop: '0.75rem', color: '#1F2937' }}>{children}</h2>,
                              h3: ({ children }) => <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', marginTop: '0.5rem', color: '#1F2937' }}>{children}</h3>,
                              ul: ({ children }) => <ul style={{ marginLeft: '1rem', marginBottom: '0.75rem', marginTop: '0.75rem', listStyleType: 'disc' }}>{children}</ul>,
                              ol: ({ children }) => <ol style={{ marginLeft: '1rem', marginBottom: '0.75rem', marginTop: '0.75rem', listStyleType: 'decimal' }}>{children}</ol>,
                              li: ({ children }) => <li style={{ marginBottom: '0.375rem', color: '#1F2937' }}>{children}</li>,
                                    code: ({ children, className }) => {
                                      const isInline = !className;
                                      return isInline ? (
                                        <code style={{ 
                                    backgroundColor: '#F3F4F6', 
                                    padding: '0.125rem 0.375rem', 
                                          borderRadius: '0.25rem',
                                          fontSize: '0.875em',
                                          fontFamily: 'monospace',
                                    color: '#1F2937'
                                        }}>{children}</code>
                                      ) : (
                                        <code style={{ 
                                          display: 'block',
                                    backgroundColor: '#F9FAFB', 
                                    padding: '0.75rem', 
                                    borderRadius: '0.375rem',
                                          fontSize: '0.8125em',
                                          fontFamily: 'monospace',
                                          overflowX: 'auto',
                                    marginTop: '0.75rem',
                                    marginBottom: '0.75rem',
                                    color: '#1F2937',
                                    border: '1px solid #E5E7EB'
                                        }}>{children}</code>
                                      );
                                    },
                                    blockquote: ({ children }) => (
                                      <blockquote style={{ 
                                  borderLeft: '3px solid #E5E7EB', 
                                  paddingLeft: '0.75rem', 
                                        marginLeft: '0',
                                  marginTop: '0.75rem',
                                  marginBottom: '0.75rem',
                                  color: '#6B7280',
                                  backgroundColor: '#F9FAFB',
                                  padding: '0.5rem 0.75rem',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.875rem'
                                      }}>{children}</blockquote>
                                    ),
                                    a: ({ href, children }) => (
                                      <a 
                                        href={href} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ 
                                    color: '#06B6D4', 
                                          textDecoration: 'underline',
                                    wordBreak: 'break-all'
                                        }}
                                      >
                                        {children}
                                      </a>
                                    ),
                              strong: ({ children }) => <strong style={{ fontWeight: '600', color: '#1F2937' }}>{children}</strong>,
                                    em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
                                  }}
                                >
                                  {message.text}
                                </ReactMarkdown>
                              </div>
                      </div>
                      </div>
                    </div>
                )}
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
                  <div className="max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[80%] w-full">
                    <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white shadow-sm px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex space-x-1.5 sm:space-x-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce bg-gray-400" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce bg-gray-400" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce bg-gray-400" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

            {/* Input Area - Bottom Fixed */}
            <div className="fixed sm:relative bottom-0 left-0 right-0 sm:left-auto sm:right-auto border-t bg-white px-3 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-3 sm:py-4 md:py-6 pb-3 sm:pb-6 md:pb-8 lg:pb-10 z-50 mobile-input-safe-area" style={{ 
              borderColor: '#E5E7EB',
              boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)'
            }}>
              {/* Voice Recording Waveform Indicator */}
              {isRecording && (
                <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[70%] max-w-3xl mx-auto mb-3 sm:mb-4 flex items-center justify-center gap-0.5 sm:gap-1 px-4">
                  {[...Array(15)].map((_, i) => (
                    <div
                      key={i}
                      className="w-0.5 sm:w-1 bg-cyan-500 rounded-full"
                      style={{
                        height: `${Math.random() * 20 + 8}px`,
                        animation: `wave ${0.5 + Math.random() * 0.5}s ease-in-out infinite`,
                        animationDelay: `${i * 0.05}s`
                      }}
                    />
                  ))}
                </div>
              )}
              
              {/* Input Box - Same as initial state */}
              <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[70%] max-w-3xl mx-auto">
                <div className="relative rounded-xl sm:rounded-2xl shadow-sm" style={{ 
                  backgroundColor: '#F7F7F7',
                  border: '1px solid #E5E7EB',
                  minHeight: '60px',
                  height: 'auto'
                }}>
                  <div className="flex items-center h-[60px] sm:h-[70px] px-2 sm:px-3 md:px-4">
                     {/* Left Icon - uit3.gif */}
                     <div className="flex items-center flex-shrink-0">
                       <img 
                         src="/uit3.GIF" 
                         alt="Input" 
                         className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10"
                         style={{ objectFit: 'contain' }}
                       />
                        </div>

                    {/* Input Field */}
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask anything About Legal Matters."
                      className="flex-1 h-full px-2 sm:px-3 md:px-4 bg-transparent border-none outline-none text-xs sm:text-sm md:text-base"
                      style={{ 
                        fontFamily: "'Roboto', sans-serif",
                        color: '#1F2937'
                      }}
                      disabled={loading || isProcessingVoice}
                    />

                    {/* Right Icons */}
                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1 sm:p-1.5 hover:bg-gray-200 rounded-lg transition-colors" 
                        title="Attachment"
                        disabled={loading || isProcessingVoice}
                      >
                        <Paperclip className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#6B7280' }} />
                      </button>
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={loading || isProcessingVoice}
                        className="p-1 sm:p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                        title={isRecording ? "Stop recording" : "Voice input"}
                    >
                      {isRecording ? (
                          <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#EF4444' }} />
                        ) : (
                          <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: '#6B7280' }} />
                        )}
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={loading || isProcessingVoice || !inputMessage.trim()}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ 
                          backgroundColor: loading || isProcessingVoice || !inputMessage.trim() ? '#E5E7EB' : '#06B6D4',
                          color: 'white'
                        }}
                        title="Send"
                      >
                        {(loading || isProcessingVoice) ? (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      )}
                    </button>
                    </div>
                  </div>

                  {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="audio-file-input"
                      disabled={loading || isProcessingVoice}
                    />
                    </div>
                  </div>
                </div>
        </motion.div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        /* Hide scrollbar for messages container */
        .scrollbar-hide {
          -ms-overflow-style: none;  /* Internet Explorer 10+ */
          scrollbar-width: none;  /* Firefox */
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;  /* Chrome, Safari, Opera */
        }
        
        /* Voice Recording Waveform Animation */
        @keyframes wave {
          0%, 100% {
            transform: scaleY(0.3);
            opacity: 0.7;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
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
        
        /* Mobile input safe area support */
        @media (max-width: 640px) {
          .mobile-input-safe-area {
            padding-bottom: max(0.75rem, calc(0.75rem + env(safe-area-inset-bottom))) !important;
          }
        }
      `}</style>
    </div>
  );
}
