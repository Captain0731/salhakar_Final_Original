import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import { 
  Send, User, X, RotateCcw, Mic, MicOff, Upload, 
  Code, Image, BookOpen, Globe, Copy, ThumbsUp, 
  ThumbsDown, Save, MoreVertical, ArrowLeft, RefreshCw, 
  Edit, Paperclip, ChevronRight, HelpCircle, Building2, 
  SquareStack, Lightbulb, Settings, Share2, Shuffle, Square,
  Plus, Search, FolderOpen, MessageSquare, ChevronLeft, Menu
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
  const abortControllerRef = useRef(null);
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock chat history
  const [chatHistory] = useState([
    { id: 1, title: 'Property Registration Query', date: 'Today', messages: 5 },
    { id: 2, title: 'Tenant Rights Discussion', date: 'Yesterday', messages: 8 },
    { id: 3, title: 'Consumer Complaint Process', date: '2 days ago', messages: 12 },
    { id: 4, title: 'Business Registration Help', date: '3 days ago', messages: 6 },
    { id: 5, title: 'Divorce Proceedings Info', date: 'Last week', messages: 15 },
  ]);
  
  const filteredChats = chatHistory.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    // Use requestAnimationFrame to ensure DOM is updated - fast scroll
    requestAnimationFrame(() => {
      setTimeout(() => {
        // Try scrolling the messages container first - fast smooth scroll
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
        // Also try scrolling to the end ref element - fast smooth scroll
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }, 50); // Reduced timeout for faster response
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

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setIsTyping(false);
    
    // Add a message indicating the generation was stopped
    const stoppedMessage = {
      id: Date.now() + 1,
      text: "Response generation stopped.",
      sender: "bot",
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, stoppedMessage]);
    
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

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

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // Call the AI Assistant API with abort signal
      const baseURL = apiService.baseURL || 'https://operantly-unchattering-ernie.ngrok-free.dev';
      const token = localStorage.getItem('access_token') || localStorage.getItem('accessToken') || localStorage.getItem('token');
      const endpoint = `${baseURL}/ai_assistant`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ 
          message: currentInput,
          limit: 10
        }),
        signal: signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const botResponse = {
        id: Date.now() + 1,
        text: data.reply || "I'm sorry, I couldn't process your request. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        usedTools: data.used_tools || false,
        toolUsed: data.tool_used || null,
        searchInfo: data.search_info || null
      };

      setMessages(prev => [...prev, botResponse]);
      
      // Scroll to bottom after bot response
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      // Don't show error if request was aborted
      if (error.name === 'AbortError') {
        console.log('Request aborted by user');
        return;
      }
      
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
      abortControllerRef.current = null;
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

  const handleNewChat = () => {
    clearChat();
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

  return (
    <div className="h-screen flex flex-col overflow-hidden overflow-x-hidden" style={{ backgroundColor: '#F9FAFC', scrollBehavior: 'smooth' }}>
      <Navbar />

      {/* Main Layout with Sidebar */}
      <div className="flex-1 flex pt-14 sm:pt-16 md:pt-20 w-full overflow-hidden" style={{ backgroundColor: '#F9FAFC' }}>
        
        {/* Sidebar */}
        <div 
          className={`${sidebarOpen ? 'w-72' : 'w-16'} transition-all duration-300 ease-in-out flex-shrink-0 hidden sm:block`}
          style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #E5E7EB' }}
        >
          <div className="h-full flex flex-col">
            {/* Sidebar Header - Toggle Button */}
            <div className="p-3 border-b flex justify-end" style={{ borderColor: '#E5E7EB' }}>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100"
                title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {sidebarOpen ? (
                  <ChevronLeft className="w-5 h-5" style={{ color: '#6B7280' }} />
                ) : (
                  <Menu className="w-5 h-5" style={{ color: '#6B7280' }} />
                )}
              </button>
            </div>

            {/* New Chat Button */}
            <div className={`${sidebarOpen ? 'p-4' : 'p-2'} border-b`} style={{ borderColor: '#E5E7EB' }}>
              <button
                onClick={handleNewChat}
                className={`${sidebarOpen ? 'w-full flex items-center gap-3 px-4 py-3' : 'w-10 h-10 flex items-center justify-center mx-auto'} rounded-xl transition-all duration-200 hover:shadow-md`}
                style={{ 
                  background: 'linear-gradient(135deg, #1E65AD 0%, #2A7BC8 100%)',
                  color: '#FFFFFF'
                }}
                title="New Chat"
              >
                <Plus className="w-5 h-5" />
                {sidebarOpen && <span className="font-semibold" style={{ fontFamily: 'Heebo, sans-serif' }}>New Chat</span>}
              </button>
            </div>

            {/* Search */}
            <div className={`${sidebarOpen ? 'p-4' : 'p-2'}`}>
              {sidebarOpen ? (
                <div 
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                  style={{ backgroundColor: '#F3F4F6' }}
                >
                  <Search className="w-4 h-4" style={{ color: '#8C969F' }} />
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                    style={{ 
                      fontFamily: 'Heebo, sans-serif',
                      color: '#374151'
                    }}
                  />
                </div>
              ) : (
                <button
                  className="w-10 h-10 flex items-center justify-center mx-auto rounded-xl transition-all duration-200 hover:bg-gray-100"
                  title="Search Chats"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Search className="w-5 h-5" style={{ color: '#8C969F' }} />
                </button>
              )}
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto px-2 pb-4">
              {sidebarOpen ? (
                <div className="mb-3 px-1">
                  <div className="flex items-center gap-2 px-2 py-2">
                    <FolderOpen className="w-4 h-4" style={{ color: '#8C969F' }} />
                    <span 
                      className="text-xs font-semibold uppercase tracking-wide"
                      style={{ color: '#8C969F', fontFamily: 'Heebo, sans-serif' }}
                    >
                      Your Chats
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    {filteredChats.map((chat) => (
                      <button
                        key={chat.id}
                        className="w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-gray-50 text-left group"
                      >
                        <MessageSquare 
                          className="w-4 h-4 mt-0.5 flex-shrink-0" 
                          style={{ color: '#1E65AD' }} 
                        />
                        <div className="flex-1 min-w-0">
                          <p 
                            className="text-sm font-medium truncate"
                            style={{ color: '#374151', fontFamily: 'Heebo, sans-serif' }}
                          >
                            {chat.title}
                          </p>
                          <p 
                            className="text-xs mt-0.5"
                            style={{ color: '#8C969F', fontFamily: 'Heebo, sans-serif' }}
                          >
                            {chat.date} · {chat.messages} messages
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded-xl"
                    title="Your Chats"
                  >
                    <FolderOpen className="w-5 h-5" style={{ color: '#8C969F' }} />
                  </div>
                  {/* Show chat icons when collapsed */}
                  {filteredChats.slice(0, 5).map((chat) => (
                    <div
                      key={chat.id}
                      className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-gray-100 cursor-pointer"
                      title={chat.title}
                    >
                      <MessageSquare className="w-4 h-4" style={{ color: '#1E65AD' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: '#F9FAFC' }}>
          {/* Chat Interface - Always Show */}
          <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col w-full"
          style={{ 
              height: 'calc(100vh - 56px)'
            }}
          >
          {/* Messages Container - Modern Chat Layout */}
                <div 
                  id="chatbot-scroll-area"
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 sm:py-8 md:py-10 lg:py-12 pb-32 sm:pb-32 md:pb-36 lg:pb-40 space-y-5 sm:space-y-6 md:space-y-8 w-auto h-auto"
                  style={{ 
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#CBD5E1 #F9FAFC',
                    backgroundColor: '#F9FAFC',
                    scrollBehavior: 'smooth',
                    scrollPaddingTop: '0'
                  }}
                >
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.sender === 'user' ? (
                          /* User Message - Brand Blue Bubble */
                          <div className="max-w-[80%] sm:max-w-[70%] md:max-w-[60%] flex items-end gap-2">
                            <div 
                              className="rounded-2xl rounded-br-md px-5 py-3.5" 
                              style={{ 
                                background: 'linear-gradient(135deg, #1E65AD 0%, #2A7BC8 100%)',
                                boxShadow: '0 4px 15px rgba(30, 101, 173, 0.3)'
                              }}
                            >
                              <p style={{ 
                                fontFamily: "'Heebo', sans-serif",
                                color: '#FFFFFF',
                                fontSize: '15px',
                                lineHeight: '1.6',
                                fontWeight: '400'
                              }}>
                                {message.text}
                              </p>
                            </div>
                          </div>
                        ) : (
                          /* AI Response - Simple Bubble */
                          <div className="max-w-[85%] sm:max-w-[80%] md:max-w-[70%]">
                            <div 
                              className="rounded-2xl px-5 py-4"
                              style={{
                                backgroundColor: '#FFFFFF',
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
                              }}
                            >
                              <div style={{ 
                                fontFamily: "'Heebo', sans-serif", 
                                color: '#374151',
                                fontSize: '15px',
                                lineHeight: '1.7'
                              }}>
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => <p style={{ marginBottom: '0.5rem', marginTop: '0' }}>{children}</p>,
                                    h1: ({ children }) => <h1 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', marginTop: '1rem', color: '#1F2937' }}>{children}</h1>,
                                    h2: ({ children }) => <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', marginTop: '0.75rem', color: '#1F2937' }}>{children}</h2>,
                                    h3: ({ children }) => <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.375rem', marginTop: '0.5rem', color: '#1F2937' }}>{children}</h3>,
                                    ul: ({ children }) => <ul style={{ marginLeft: '1.25rem', marginBottom: '0.75rem', marginTop: '0.5rem', listStyleType: 'disc' }}>{children}</ul>,
                                    ol: ({ children }) => <ol style={{ marginLeft: '1.25rem', marginBottom: '0.75rem', marginTop: '0.5rem', listStyleType: 'decimal' }}>{children}</ol>,
                                    li: ({ children }) => <li style={{ marginBottom: '0.375rem', color: '#374151', paddingLeft: '0.25rem' }}>{children}</li>,
                                    code: ({ children, className }) => {
                                      const isInline = !className;
                                      return isInline ? (
                                        <code style={{ 
                                          backgroundColor: '#F3F4F6', 
                                          padding: '0.2rem 0.4rem', 
                                          borderRadius: '0.375rem',
                                          fontSize: '0.875em',
                                          fontFamily: 'monospace',
                                          color: '#1E65AD'
                                        }}>{children}</code>
                                      ) : (
                                        <code style={{ 
                                          display: 'block',
                                          backgroundColor: '#F8FAFC', 
                                          padding: '0.75rem', 
                                          borderRadius: '0.5rem',
                                          fontSize: '0.8125em',
                                          fontFamily: 'monospace',
                                          overflowX: 'auto',
                                          marginTop: '0.5rem',
                                          marginBottom: '0.5rem',
                                          color: '#1F2937',
                                          border: '1px solid #E5E7EB'
                                        }}>{children}</code>
                                      );
                                    },
                                    blockquote: ({ children }) => (
                                      <blockquote style={{ 
                                        borderLeft: '3px solid #1E65AD', 
                                        paddingLeft: '1rem', 
                                        marginLeft: '0',
                                        marginTop: '0.75rem',
                                        marginBottom: '0.75rem',
                                        color: '#6B7280',
                                        backgroundColor: '#F8FAFC',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '0 0.5rem 0.5rem 0',
                                        fontSize: '0.9375rem'
                                      }}>{children}</blockquote>
                                    ),
                                    a: ({ href, children }) => (
                                      <a 
                                        href={href} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ 
                                          color: '#1E65AD', 
                                          textDecoration: 'none',
                                          fontWeight: '500',
                                          borderBottom: '1px solid #1E65AD'
                                        }}
                                      >
                                        {children}
                                      </a>
                                    ),
                                    strong: ({ children }) => <strong style={{ fontWeight: '600', color: '#1F2937' }}>{children}</strong>,
                                    em: ({ children }) => <em style={{ fontStyle: 'italic', color: '#4B5563' }}>{children}</em>,
                                  }}
                                >
                                  {message.text}
                                </ReactMarkdown>
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
                       <div 
                         className="inline-flex items-center gap-1.5 px-5 py-4 rounded-2xl"
                         style={{
                           backgroundColor: '#FFFFFF',
                           boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
                         }}
                       >
                         <motion.div 
                           className="w-2 h-2 rounded-full"
                           style={{ backgroundColor: '#1E65AD' }}
                           animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                           transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                         />
                         <motion.div 
                           className="w-2 h-2 rounded-full"
                           style={{ backgroundColor: '#1E65AD' }}
                           animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                           transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
                         />
                         <motion.div 
                           className="w-2 h-2 rounded-full"
                           style={{ backgroundColor: '#1E65AD' }}
                           animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                           transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
                         />
                       </div>
                     </motion.div>
                   )}
                  
                  <div ref={messagesEndRef} />
                </div>

            {/* Modern Input Area - Fixed Bottom */}
            <div 
              className={`fixed bottom-0 right-0 left-0 px-4 sm:px-6 md:px-8 py-3 sm:py-4 z-50 transition-all duration-300`}
              style={{ 
                backgroundColor: 'transparent'
              }}
            >
              {/* White Input Bar with Border & Shadow */}
              <div className="w-full max-w-4xl mx-auto">
                <div 
                  className="relative rounded-2xl transition-all duration-300"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #1E65AD',
                    boxShadow: '0 4px 20px rgba(30, 101, 173, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <div className="flex items-center h-14 px-3">
                    {/* Animated Orb Icon */}
                    <div className="flex items-center justify-center w-12 h-12 flex-shrink-0">
                      <img 
                        src="/uit3.GIF" 
                        alt="AI" 
                        className="w-10 h-10 object-contain"
                      />
                    </div>

                    {/* Input Field or Recording Waveform */}
                    {isRecording ? (
                      <div className="flex-1 h-full flex items-center justify-center ml-2">
                        <div className="flex items-center gap-1">
                          {[...Array(30)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-1 rounded-full"
                              style={{ backgroundColor: '#1E65AD' }}
                              animate={{
                                height: [
                                  `${Math.random() * 4 + 2}px`,
                                  `${Math.random() * 20 + 10}px`,
                                  `${Math.random() * 4 + 2}px`
                                ],
                              }}
                              transition={{
                                duration: 0.4 + Math.random() * 0.3,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.03
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask anything"
                        className="flex-1 h-full bg-transparent border-none outline-none text-base ml-2 placeholder-gray-400"
                        style={{ 
                          fontFamily: "'Heebo', sans-serif",
                          color: '#1F2937',
                          fontSize: '15px'
                        }}
                        disabled={loading || isProcessingVoice}
                      />
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* File Attach Button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading || isProcessingVoice}
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-blue-50"
                        title="Attach file"
                      >
                        <Paperclip className="w-5 h-5" style={{ color: '#1E65AD' }} />
                      </button>

                      {/* Microphone Button */}
                      {isRecording ? (
                        <motion.button
                          onClick={stopRecording}
                          className="w-9 h-9 rounded-lg flex items-center justify-center relative"
                          style={{ backgroundColor: '#FEE2E2' }}
                          animate={{ 
                            scale: [1, 1.1, 1],
                            boxShadow: [
                              '0 0 0 0 rgba(239, 68, 68, 0.4)',
                              '0 0 0 10px rgba(239, 68, 68, 0)',
                              '0 0 0 0 rgba(239, 68, 68, 0)'
                            ]
                          }}
                          transition={{ 
                            duration: 1.2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          title="Stop recording"
                        >
                          <motion.div
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          >
                            <MicOff className="w-5 h-5" style={{ color: '#EF4444' }} />
                          </motion.div>
                        </motion.button>
                      ) : (
                        <button
                          onClick={startRecording}
                          disabled={loading || isProcessingVoice}
                          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-blue-50"
                          title="Voice input"
                        >
                          <Mic className="w-5 h-5" style={{ color: '#1E65AD' }} />
                        </button>
                      )}

                      {/* Send Button */}
                      {(loading || isTyping) ? (
                        <motion.button
                          onClick={handleStopGeneration}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-9 h-9 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: '#EF4444' }}
                          title="Stop generation"
                        >
                          <Square className="w-4 h-4" fill="#FFFFFF" style={{ color: '#FFFFFF' }} />
                        </motion.button>
                      ) : isRecording ? (
                        <motion.div
                          className="w-9 h-9 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: '#1E65AD' }}
                          animate={{ 
                            scale: [1, 1.1, 1],
                            boxShadow: [
                              '0 0 0 0 rgba(30, 101, 173, 0.4)',
                              '0 0 0 8px rgba(30, 101, 173, 0)',
                              '0 0 0 0 rgba(30, 101, 173, 0)'
                            ]
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          title="Recording..."
                        >
                          <motion.div
                            className="flex items-center gap-0.5"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <motion.div 
                              className="w-1 rounded-full bg-white"
                              animate={{ height: ['8px', '14px', '8px'] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div 
                              className="w-1 rounded-full bg-white"
                              animate={{ height: ['14px', '8px', '14px'] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                            />
                            <motion.div 
                              className="w-1 rounded-full bg-white"
                              animate={{ height: ['8px', '14px', '8px'] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                            />
                          </motion.div>
                        </motion.div>
                      ) : (
                        <motion.button
                          onClick={handleSendMessage}
                          disabled={isProcessingVoice || !inputMessage.trim()}
                          whileHover={{ scale: !isProcessingVoice && inputMessage.trim() ? 1.05 : 1 }}
                          whileTap={{ scale: !isProcessingVoice && inputMessage.trim() ? 0.95 : 1 }}
                          className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
                          style={{ 
                            backgroundColor: '#1E65AD'
                          }}
                          title="Send message"
                        >
                          {isProcessingVoice ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Send className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                          )}
                        </motion.button>
                      )}
                    </div>
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
          </motion.div>
        </div>
      </div>

      {/* Custom Styles */}
      <style>{`
        /* Custom Scrollbar */
        .scrollbar-hide::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-hide::-webkit-scrollbar-track {
          background: #F9FAFC;
          border-radius: 10px;
        }
        
        .scrollbar-hide::-webkit-scrollbar-thumb {
          background: #CBD5E1;
          border-radius: 10px;
        }
        
        .scrollbar-hide::-webkit-scrollbar-thumb:hover {
          background: #94A3B8;
        }
        
        /* Smooth transitions */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Mobile input safe area support */
        @media (max-width: 640px) {
          .mobile-input-safe-area {
            padding-bottom: max(0.75rem, calc(0.75rem + env(safe-area-inset-bottom))) !important;
          }
        }
        
        /* Focus styles */
        input:focus {
          outline: none;
        }
        
        /* Selection styles */
        ::selection {
          background-color: rgba(30, 101, 173, 0.2);
        }
      `}</style>
    </div>
  );
}
