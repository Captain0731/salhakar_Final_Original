import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import { 
  Send, User, X, RotateCcw, Mic, MicOff, Upload, 
  Code, Image, BookOpen, Globe, Copy, ThumbsUp, 
  ThumbsDown, Save, MoreVertical, ArrowLeft, RefreshCw, 
  Edit, Paperclip, ChevronRight, HelpCircle, Building2, 
  SquareStack, Lightbulb, Settings, Share2, Shuffle, Square,
  Plus, FolderOpen, MessageSquare, ChevronLeft, Menu, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import apiService from "../services/api";
import ChatFeedbackButton from "../components/ChatFeedbackButton";

export default function LegalChatbot() {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null); // Session management for conversation continuity
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  // Store previous language to restore when leaving chatbot
  const previousLanguageRef = useRef(null);
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Track window size for responsive sidebar calculation
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 640);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);
  
  // Chat history - loaded from API
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  
  // Menu state for chat options
  const [openMenuId, setOpenMenuId] = useState(null);
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [renameInput, setRenameInput] = useState('');
  const menuRef = useRef(null);

  // Load chat sessions from API
  const loadChatSessions = useCallback(async () => {
    try {
      setLoadingSessions(true);
      const sessions = await apiService.getChatSessions();
      console.log('📋 Loaded chat sessions:', sessions);
      
      // Format sessions to match the expected structure
      const formattedSessions = sessions.map(session => ({
        id: session.id,
        title: session.title || 'Untitled Chat',
        date: new Date(session.last_message_at || session.created_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        messages: session.message_count || 0,
        lastMessageAt: session.last_message_at || session.created_at,
        createdAt: session.created_at
      }));
      
      // Sort by last_message_at (most recent first)
      formattedSessions.sort((a, b) => {
        const dateA = new Date(a.lastMessageAt);
        const dateB = new Date(b.lastMessageAt);
        return dateB - dateA;
      });
      
      setChatHistory(formattedSessions);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      // Don't show error to user, just log it
    } finally {
      setLoadingSessions(false);
    }
  }, []);

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

  // Force English language when entering chatbot page
  useEffect(() => {
    // Helper function to clear cookie with proper domain handling
    const clearCookie = (name) => {
      if (typeof window === 'undefined') return;
      
      const hostname = window.location.hostname;
      const domain = hostname.includes('localhost') || hostname.includes('127.0.0.1') 
        ? '' 
        : hostname.split('.').slice(-2).join('.');
      
      // Get current cookie value to save it
      const cookie = document.cookie
        .split('; ')
        .find(row => row.trim().startsWith(`${name}=`));
      
      if (cookie) {
        try {
          const value = decodeURIComponent(cookie.split('=').slice(1).join('='));
          if (value && value !== '/en/en' && value !== '') {
            // Save previous language (excluding English)
            const lang = value.replace('/en/', '').toLowerCase().split(';')[0].trim();
            if (lang && lang !== 'en') {
              previousLanguageRef.current = lang;
              // Also save to localStorage for persistence across page reloads
              try {
                localStorage.setItem('previousLanguageBeforeChatbot', lang);
              } catch (e) {
                console.warn('localStorage not available:', e);
              }
            }
          }
        } catch (e) {
          console.warn('Error parsing cookie:', e);
        }
      }
      
      // Clear cookie with all possible combinations
      const clearOptions = [
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`,
        `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`,
      ];
      
      if (domain && !hostname.includes('localhost')) {
        clearOptions.push(`${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain};`);
      }
      
      if (window.location.protocol === 'https:') {
        clearOptions.forEach(opt => {
          document.cookie = opt + ' Secure;';
        });
      } else {
        clearOptions.forEach(opt => {
          document.cookie = opt;
        });
      }
      
      // Also clear from localStorage
      try {
        localStorage.removeItem('selectedLanguage');
      } catch (e) {
        console.warn('localStorage not available:', e);
      }
    };
    
    // Save current language and force English
    clearCookie('googtrans');
    
    // Reload page to apply English (only if language was changed)
    if (previousLanguageRef.current) {
      // Small delay to ensure cookie is cleared before reload
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
    
    // Cleanup: Restore previous language when leaving chatbot
    return () => {
      if (previousLanguageRef.current) {
        const langCode = previousLanguageRef.current;
        
        // Helper function to set cookie with proper attributes
        const setCookie = (name, value, days = 365) => {
          if (typeof window === 'undefined') return;
          
          const expires = new Date();
          expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
          
          const hostname = window.location.hostname;
          const domain = hostname.includes('localhost') || hostname.includes('127.0.0.1') 
            ? '' 
            : hostname.split('.').slice(-2).join('.');
          
          let cookieString = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
          
          if (window.location.protocol === 'https:') {
            cookieString += '; Secure';
          }
          
          if (domain && !hostname.includes('localhost')) {
            cookieString += `; domain=.${domain}`;
          }
          
          document.cookie = cookieString;
          
          try {
            localStorage.setItem('selectedLanguage', langCode);
          } catch (e) {
            console.warn('localStorage not available:', e);
          }
        };
        
        // Restore previous language
        setCookie('googtrans', `/en/${langCode}`, 365);
        
        // Clear the stored previous language
        previousLanguageRef.current = null;
      }
    };
  }, []);

  // Note: Language restoration is handled in App.js to avoid conflicts

  useEffect(() => {
    // Load chat sessions on mount
    loadChatSessions();
    
    // Load saved session and messages from localStorage on mount
    const savedSessionId = localStorage.getItem('currentChatSessionId');
    const savedMessages = localStorage.getItem('currentChatMessages');
    
    if (savedSessionId && savedMessages) {
      try {
        // Restore session and messages
        setCurrentSessionId(parseInt(savedSessionId));
        const parsedMessages = JSON.parse(savedMessages);
        if (Array.isArray(parsedMessages) && parsedMessages.length > 0) {
          setMessages(parsedMessages);
          return; // Don't show welcome message if we have saved messages
        }
      } catch (error) {
        console.error('Error loading saved chat:', error);
        // Clear invalid data
        localStorage.removeItem('currentChatSessionId');
        localStorage.removeItem('currentChatMessages');
      }
    }
    
    // Initialize with welcome message only if no saved session
    setMessages([
      {
        id: 1,
        text: "Hello! I'm Kiki, your AI Legal Assistant. I can help you with various legal questions and provide guidance on legal matters. How can I assist you today?",
        sender: "bot",
        timestamp: new Date().toISOString()
      }
    ]);
  }, []);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('currentChatMessages', JSON.stringify(messages));
    }
  }, [messages]);

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

  // Handle initial question from redirect (from Search With Kiki AI)
  useEffect(() => {
    const initialQuestion = location.state?.initialQuestion;
    const judgmentId = location.state?.judgmentId;
    
    if (initialQuestion && initialQuestion.trim()) {
      // Store values before clearing state
      const question = initialQuestion.trim();
      const jId = judgmentId;
      
      // Clear the state to prevent re-sending on re-renders
      navigate(location.pathname, { replace: true, state: {} });
      
      // Small delay to ensure component is fully mounted
      setTimeout(() => {
        sendInitialQuestion(question, jId);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.initialQuestion, location.state?.judgmentId]);

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

  // Send initial question from redirect (for judgment Q&A or regular questions)
  const sendInitialQuestion = useCallback(async (question, judgmentId = null) => {
    if (!question || !question.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: question,
      sender: "user",
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    
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
      let data;
      
      if (judgmentId) {
        // Use judgment-specific endpoint
        console.log(`📚 Asking question about judgment ${judgmentId}:`, question);
        const apiOptions = {
          temperature: 0.3,
          max_tokens: 20000,
          signal: signal
        };
        data = await apiService.askJudgmentQuestion(judgmentId, question, apiOptions);
      } else {
        // Use regular AI assistant endpoint
        const apiOptions = {
          limit: 10,
          max_tokens: 2000,
          temperature: 0.3,
          signal: signal
        };
        data = await apiService.llmChat(question, apiOptions);
      }
      
      // Save session_id from response for conversation continuity
      if (data.session_id) {
        console.log('✅ Session created/continued:', data.session_id);
        setCurrentSessionId(data.session_id);
        // Save to localStorage for persistence across page refreshes
        localStorage.setItem('currentChatSessionId', data.session_id.toString());
        
        // Reload chat sessions to update sidebar
        loadChatSessions();
      } else {
        console.warn('⚠️ No session_id in response:', data);
      }
      
      const botResponse = {
        id: Date.now() + 1,
        text: data.reply || "I'm sorry, I couldn't process your request. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        usedTools: data.used_tools || false,
        toolUsed: data.tool_used || null,
        searchInfo: data.search_info || null,
        sessionId: data.session_id || currentSessionId
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
      
      // If session becomes invalid, reset it
      if (error.message.includes('404') || error.message.includes('invalid session')) {
        setCurrentSessionId(null);
        localStorage.removeItem('currentChatSessionId');
      }
      
      const errorResponse = {
        id: Date.now() + 1,
        text: error.message || "I'm sorry, there was an error processing your message. Please try again.",
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
  }, [loading, scrollToBottom, currentSessionId, loadChatSessions]);

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
      // Call the AI Assistant API using the updated apiService method
      // Only include session_id if we have an active session (for new chat, don't include it)
      const apiOptions = {
        limit: 10,
        max_tokens: 2000,
        temperature: 0.3,
        signal: signal // Pass abort signal for request cancellation
      };
      
      // Only add session_id if we have an active session (null/undefined means new chat)
      if (currentSessionId !== null && currentSessionId !== undefined) {
        apiOptions.session_id = currentSessionId;
        console.log('💬 Continuing existing session:', currentSessionId);
      } else {
        console.log('🆕 Creating new session (no session_id provided)');
      }
      
      const data = await apiService.llmChat(currentInput, apiOptions);
      
      // Save session_id from response for conversation continuity
      if (data.session_id) {
        console.log('✅ Session created/continued:', data.session_id);
        setCurrentSessionId(data.session_id);
        // Save to localStorage for persistence across page refreshes
        localStorage.setItem('currentChatSessionId', data.session_id.toString());
        
        // Reload chat sessions to update sidebar
        loadChatSessions();
      } else {
        console.warn('⚠️ No session_id in response:', data);
      }
      
      const botResponse = {
        id: Date.now() + 1,
        text: data.reply || "I'm sorry, I couldn't process your request. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        usedTools: data.used_tools || false,
        toolUsed: data.tool_used || null,
        searchInfo: data.search_info || null,
        sessionId: data.session_id || currentSessionId
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
      
      // If session becomes invalid, reset it
      if (error.message.includes('404') || error.message.includes('invalid session')) {
        setCurrentSessionId(null);
        localStorage.removeItem('currentChatSessionId');
      }
      
      const errorResponse = {
        id: Date.now() + 1,
        text: error.message || "I'm sorry, there was an error processing your message. Please try again.",
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

      // Save session_id if provided in response (if voice API supports it)
      if (response.session_id) {
        setCurrentSessionId(response.session_id);
        localStorage.setItem('currentChatSessionId', response.session_id.toString());
      }

      // Add bot response
      const botResponse = {
        id: Date.now() + 1,
        text: response.reply || "I'm sorry, I couldn't process your voice input. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        usedTools: response.used_tools || false,
        toolUsed: response.tool_used || null,
        searchInfo: response.search_info || null,
        sessionId: response.session_id || currentSessionId
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

      // Save session_id if provided in response
      if (response.session_id) {
        setCurrentSessionId(response.session_id);
        localStorage.setItem('currentChatSessionId', response.session_id.toString());
      }

      // Add bot response
      const botResponse = {
        id: Date.now() + 1,
        text: response.reply || "I'm sorry, I couldn't process your audio file. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        usedTools: response.used_tools || false,
        toolUsed: response.tool_used || null,
        searchInfo: response.search_info || null,
        sessionId: response.session_id || currentSessionId
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
    // Shift+Enter allows new line (default behavior for textarea)
    // If Shift is pressed, allow default behavior (new line)
  };

  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const maxHeight = 200; // Maximum height in pixels (about 8-10 lines)
      const scrollHeight = inputRef.current.scrollHeight;
      const newHeight = Math.min(scrollHeight, maxHeight);
      inputRef.current.style.height = `${newHeight}px`;
      
      // If content exceeds maxHeight, enable scrolling
      if (scrollHeight > maxHeight) {
        inputRef.current.style.overflowY = 'auto';
      } else {
        inputRef.current.style.overflowY = 'hidden';
      }
    }
  };

  // Handle input change - no auto-wrapping, just update value and adjust height
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputMessage(value);
    // Adjust height for typing
    setTimeout(() => {
      adjustTextareaHeight();
    }, 0);
  };

  // Adjust textarea height when inputMessage changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  const clearChat = () => {
    // Reset session for new conversation
    setCurrentSessionId(null);
    localStorage.removeItem('currentChatSessionId');
    localStorage.removeItem('currentChatMessages');
    
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
    console.log('🆕 Creating new chat - clearing session');
    clearChat();
    // Ensure session is cleared
    setCurrentSessionId(null);
    // Reload sessions to show updated list
    loadChatSessions();
  };

  // Load messages for a specific session
  const loadSessionMessages = async (sessionId) => {
    try {
      setLoading(true);
      const sessionMessages = await apiService.getSessionMessages(sessionId);
      console.log('📨 Loaded messages for session:', sessionId, sessionMessages);
      
      // Convert API messages to our format
      const formattedMessages = sessionMessages.map(msg => ({
        id: msg.id,
        text: msg.content,
        sender: msg.role === 'user' ? 'user' : 'bot',
        timestamp: msg.created_at
      }));
      
      setMessages(formattedMessages);
      setCurrentSessionId(sessionId);
      localStorage.setItem('currentChatSessionId', sessionId.toString());
      localStorage.setItem('currentChatMessages', JSON.stringify(formattedMessages));
      
      // Scroll to bottom
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('Error loading session messages:', error);
      // Show error message
      const errorMessage = {
        id: Date.now(),
        text: "Failed to load chat history. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString()
      };
      setMessages([errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Delete a chat session
  const handleDeleteChat = async (sessionId, e) => {
    e.stopPropagation(); // Prevent loading the chat
    try {
      await apiService.deleteSession(sessionId);
      console.log('🗑️ Deleted session:', sessionId);
      
      // If deleted session was current, start new chat
      if (currentSessionId === sessionId) {
        clearChat();
      }
      
      // Reload sessions
      loadChatSessions();
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete chat. Please try again.');
    }
  };

  // Start renaming a chat
  const handleStartRename = (chat, e) => {
    e.stopPropagation(); // Prevent loading the chat
    setRenamingChatId(chat.id);
    setRenameInput(chat.title);
    setOpenMenuId(null);
  };

  // Save renamed chat
  const handleSaveRename = async (sessionId) => {
    if (!renameInput.trim()) {
      setRenamingChatId(null);
      return;
    }

    try {
      await apiService.updateSessionTitle(sessionId, renameInput.trim());
      console.log('✏️ Renamed session:', sessionId, 'to', renameInput.trim());
      
      // Reload sessions
      loadChatSessions();
      setRenamingChatId(null);
      setRenameInput('');
    } catch (error) {
      console.error('Error renaming session:', error);
      alert('Failed to rename chat. Please try again.');
    }
  };

  // Cancel renaming
  const handleCancelRename = () => {
    setRenamingChatId(null);
    setRenameInput('');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openMenuId]);

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
      // Use the updated AI Assistant API method for regeneration
      const apiOptions = {
        limit: 10,
        max_tokens: 2000,
        temperature: 0.3
      };
      
      // Only add session_id if we have an active session
      if (currentSessionId !== null && currentSessionId !== undefined) {
        apiOptions.session_id = currentSessionId;
      }
      
      const data = await apiService.llmChat(userMessage.text, apiOptions);
      
      // Save session_id from response
      if (data.session_id) {
        setCurrentSessionId(data.session_id);
        localStorage.setItem('currentChatSessionId', data.session_id.toString());
      }
      
      const botResponse = {
        id: Date.now() + 1,
        text: data.reply || "I'm sorry, I couldn't process your request. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        usedTools: data.used_tools || false,
        toolUsed: data.tool_used || null,
        searchInfo: data.search_info || null,
        sessionId: data.session_id || currentSessionId
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
      <style>{`
        .user-message-text::selection {
          background-color: rgba(255, 255, 255, 0.5);
          color: #FFFFFF;
        }
        .user-message-text::-moz-selection {
          background-color: rgba(255, 255, 255, 0.5);
          color: #FFFFFF;
        }
        .user-message-text::-webkit-selection {
          background-color: rgba(255, 255, 255, 0.5);
          color: #FFFFFF;
        }
      `}</style>
      <Navbar />

      {/* Main Layout with Sidebar */}
      <div className="flex-1 flex pt-14 sm:pt-16 md:pt-20 w-full" style={{ backgroundColor: '#F9FAFC', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>
        
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-[60] sm:hidden"
                onClick={() => setMobileSidebarOpen(false)}
              />
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-200 z-[70] sm:hidden overflow-y-auto"
                style={{ 
                  boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
                  paddingTop: '56px'
                }}
              >
              <div className="h-full flex flex-col overflow-hidden">
                {/* Mobile Sidebar Header */}
                <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
                  <h3 className="font-semibold" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>Chats</h3>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 active:bg-gray-200 flex items-center justify-center"
                    title="Close sidebar"
                    style={{ minWidth: '36px', minHeight: '36px' }}
                  >
                    <X className="w-5 h-5 flex-shrink-0" style={{ color: '#6B7280' }} />
                  </button>
                </div>

                {/* New Chat Button - Mobile */}
                <div className="p-4 border-b" style={{ borderColor: '#E5E7EB' }}>
                  <button
                    onClick={() => {
                      handleNewChat();
                      setMobileSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:shadow-md"
                    style={{ 
                      background: 'linear-gradient(135deg, #1E65AD 0%, #2A7BC8 100%)',
                      color: '#FFFFFF'
                    }}
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-semibold" style={{ fontFamily: 'Heebo, sans-serif' }}>New Chat</span>
                  </button>
                </div>

                {/* Chat History - Mobile */}
                <div className="flex-1 overflow-y-auto px-2 pb-4">
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
                      {loadingSessions ? (
                        <div className="px-3 py-4 text-center">
                          <p className="text-xs" style={{ color: '#8C969F', fontFamily: 'Heebo, sans-serif' }}>
                            Loading chats...
                          </p>
                        </div>
                      ) : chatHistory.length === 0 ? (
                        <div className="px-3 py-4 text-center">
                          <p className="text-xs" style={{ color: '#8C969F', fontFamily: 'Heebo, sans-serif' }}>
                            No chats yet. Start a new conversation!
                          </p>
                        </div>
                      ) : (
                        chatHistory.map((chat) => (
                          <div
                            key={chat.id}
                            className={`relative w-full rounded-xl transition-all duration-200 hover:bg-gray-50 group ${
                              currentSessionId === chat.id ? 'bg-blue-50' : ''
                            }`}
                          >
                            {renamingChatId === chat.id ? (
                              <div className="flex items-center gap-2 px-3 py-3">
                                <input
                                  type="text"
                                  value={renameInput}
                                  onChange={(e) => setRenameInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleSaveRename(chat.id);
                                    } else if (e.key === 'Escape') {
                                      handleCancelRename();
                                    }
                                  }}
                                  className="flex-1 px-2 py-1 text-sm rounded border outline-none"
                                  style={{ 
                                    fontFamily: 'Heebo, sans-serif',
                                    color: '#374151'
                                  }}
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveRename(chat.id)}
                                  className="p-1 rounded hover:bg-gray-200"
                                  title="Save"
                                >
                                  <Save className="w-4 h-4" style={{ color: '#1E65AD' }} />
                                </button>
                                <button
                                  onClick={handleCancelRename}
                                  className="p-1 rounded hover:bg-gray-200"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" style={{ color: '#6B7280' }} />
                                </button>
                              </div>
                            ) : (
                              <div className="w-full flex items-start gap-3 px-3 py-3 group">
                                <button
                                  onClick={() => {
                                    loadSessionMessages(chat.id);
                                    setMobileSidebarOpen(false);
                                  }}
                                  className="flex-1 flex items-start gap-3 text-left min-w-0"
                                >
                                  <MessageSquare 
                                    className="w-4 h-4 mt-0.5 flex-shrink-0" 
                                    style={{ color: '#1E65AD' }} 
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p 
                                      className="text-sm font-medium break-words"
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
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(openMenuId === chat.id ? null : chat.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-opacity flex-shrink-0"
                                  title="More options"
                                  style={{ minWidth: '24px', minHeight: '24px' }}
                                >
                                  <MoreVertical className="w-4 h-4" style={{ color: '#6B7280' }} />
                                </button>
                              </div>
                            )}
                            
                            {/* Dropdown Menu - Mobile */}
                            <AnimatePresence>
                              {openMenuId === chat.id && (
                                <>
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-40"
                                    onClick={() => setOpenMenuId(null)}
                                  />
                                  <motion.div
                                    ref={menuRef}
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]"
                                    style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                                  >
                                    <button
                                      onClick={(e) => handleStartRename(chat, e)}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 text-left transition-colors"
                                      style={{ color: '#374151', fontFamily: 'Heebo, sans-serif' }}
                                    >
                                      <Edit className="w-4 h-4" style={{ color: '#6B7280' }} />
                                      <span>Rename</span>
                                    </button>
                                    <div className="border-t border-gray-200 my-1"></div>
                                    <button
                                      onClick={(e) => handleDeleteChat(chat.id, e)}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 text-left transition-colors"
                                      style={{ color: '#DC2626', fontFamily: 'Heebo, sans-serif' }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span>Delete</span>
                                    </button>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Close Button at Bottom - Mobile */}
                <div className="p-3 border-t bg-gray-50 flex-shrink-0" style={{ borderColor: '#E5E7EB' }}>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-gray-200 active:bg-gray-300"
                    title="Close sidebar"
                    style={{ 
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB'
                    }}
                  >
                    <X className="w-4 h-4" style={{ color: '#6B7280' }} />
                    <span className="text-sm font-medium" style={{ color: '#6B7280', fontFamily: "'Heebo', sans-serif" }}>Close</span>
                  </button>
                </div>
              </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        {/* Desktop Sidebar - Fixed, No Scroll */}
        <div 
          className={`${sidebarOpen ? 'w-72' : 'w-16'} transition-all duration-300 ease-in-out flex-shrink-0 hidden sm:block`}
          style={{ backgroundColor: '#FFFFFF', borderRight: '1px solid #E5E7EB', height: '100%' }}
        >
          <div className="h-full flex flex-col overflow-hidden">
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
                    {loadingSessions ? (
                      <div className="px-3 py-4 text-center">
                        <p className="text-xs" style={{ color: '#8C969F', fontFamily: 'Heebo, sans-serif' }}>
                          Loading chats...
                        </p>
                      </div>
                    ) : chatHistory.length === 0 ? (
                      <div className="px-3 py-4 text-center">
                        <p className="text-xs" style={{ color: '#8C969F', fontFamily: 'Heebo, sans-serif' }}>
                          No chats yet. Start a new conversation!
                        </p>
                      </div>
                    ) : (
                      chatHistory.map((chat) => (
                        <div
                          key={chat.id}
                          className={`relative w-full rounded-xl transition-all duration-200 hover:bg-gray-50 group ${
                            currentSessionId === chat.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          {renamingChatId === chat.id ? (
                            <div className="flex items-center gap-2 px-3 py-3">
                              <input
                                type="text"
                                value={renameInput}
                                onChange={(e) => setRenameInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveRename(chat.id);
                                  } else if (e.key === 'Escape') {
                                    handleCancelRename();
                                  }
                                }}
                                className="flex-1 px-2 py-1 text-sm rounded border outline-none"
                                style={{ 
                                  fontFamily: 'Heebo, sans-serif',
                                  color: '#374151'
                                }}
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveRename(chat.id)}
                                className="p-1 rounded hover:bg-gray-200"
                                title="Save"
                              >
                                <Save className="w-4 h-4" style={{ color: '#1E65AD' }} />
                              </button>
                              <button
                                onClick={handleCancelRename}
                                className="p-1 rounded hover:bg-gray-200"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" style={{ color: '#6B7280' }} />
                              </button>
                            </div>
                          ) : (
                            <div className="w-full flex items-start gap-3 px-3 py-3 group">
                              <button
                                onClick={() => loadSessionMessages(chat.id)}
                                className="flex-1 flex items-start gap-3 text-left min-w-0"
                              >
                                <MessageSquare 
                                  className="w-4 h-4 mt-0.5 flex-shrink-0" 
                                  style={{ color: '#1E65AD' }} 
                                />
                                <div className="flex-1 min-w-0">
                                  <p 
                                    className="text-sm font-medium break-words"
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
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === chat.id ? null : chat.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-opacity flex-shrink-0"
                                title="More options"
                                style={{ minWidth: '24px', minHeight: '24px' }}
                              >
                                <MoreVertical className="w-4 h-4" style={{ color: '#6B7280' }} />
                              </button>
                            </div>
                          )}
                          
                          {/* Dropdown Menu */}
                          <AnimatePresence>
                            {openMenuId === chat.id && (
                              <>
                                {/* Backdrop */}
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="fixed inset-0 z-40"
                                  onClick={() => setOpenMenuId(null)}
                                />
                                {/* Menu */}
                                <motion.div
                                  ref={menuRef}
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]"
                                  style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                                >
                                  <button
                                    onClick={(e) => handleStartRename(chat, e)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 text-left transition-colors"
                                    style={{ color: '#374151', fontFamily: 'Heebo, sans-serif' }}
                                  >
                                    <Edit className="w-4 h-4" style={{ color: '#6B7280' }} />
                                    <span>Rename</span>
                                  </button>
                                  <div className="border-t border-gray-200 my-1"></div>
                                  <button
                                    onClick={(e) => handleDeleteChat(chat.id, e)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 text-left transition-colors"
                                    style={{ color: '#DC2626', fontFamily: 'Heebo, sans-serif' }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete</span>
                                  </button>
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      ))
                    )}
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
                  {!loadingSessions && chatHistory.slice(0, 5).map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => loadSessionMessages(chat.id)}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 hover:bg-gray-100 ${
                        currentSessionId === chat.id ? 'bg-blue-50' : ''
                      }`}
                      title={chat.title}
                    >
                      <MessageSquare className="w-4 h-4" style={{ color: '#1E65AD' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Area - Scrollable */}
        <div className="flex-1 flex flex-col overflow-hidden sm:pt-0 pt-14" style={{ backgroundColor: '#F9FAFC', height: '100%', minHeight: 0 }}>
          {/* Mobile Header with Menu Button */}
          <div className="sm:hidden bg-white border-b border-gray-200 px-3 py-2.5 flex items-center justify-between flex-shrink-0 fixed top-14 left-0 right-0 z-[55]">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 active:bg-gray-200"
              title="Open menu"
            >
              <Menu className="w-5 h-5" style={{ color: '#1E65AD' }} />
            </button>
            <h2 className="font-semibold text-base" style={{ color: '#1E65AD', fontFamily: "'Heebo', sans-serif" }}>Legal Chat</h2>
            <button
              onClick={handleNewChat}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-blue-50 active:bg-blue-100"
              title="New Chat"
              style={{ 
                background: 'linear-gradient(135deg, #1E65AD 0%, #2A7BC8 100%)',
                color: '#FFFFFF'
              }}
            >
              <Plus className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            </button>
          </div>

        {/* Chat Interface - Always Show */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
            className="flex flex-col w-full h-full"
          style={{ 
              height: '100%',
              minHeight: 0,
              overflow: 'hidden'
            }}
          >
          {/* Messages Container - Modern Chat Layout - Scrollable */}
                <div 
                  id="chatbot-scroll-area"
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-scroll overflow-x-hidden px-3 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-8 md:py-10 lg:py-12 pb-20 sm:pb-32 md:pb-36 lg:pb-40 space-y-4 sm:space-y-6 md:space-y-8"
                  style={{ 
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#CBD5E1 #F9FAFC',
                    backgroundColor: '#F9FAFC',
                    scrollBehavior: 'smooth',
                    scrollPaddingTop: '0',
                    height: '100%',
                    maxHeight: '100%',
                    overflowY: 'scroll',
                    overflowX: 'hidden',
                    WebkitOverflowScrolling: 'touch'
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
                          <div className="max-w-[90%] sm:max-w-[70%] md:max-w-[60%] flex items-end gap-2">
                            <div 
                              className="rounded-xl sm:rounded-2xl rounded-br-md px-4 py-2.5 sm:px-5 sm:py-3.5" 
                              style={{ 
                                background: 'linear-gradient(135deg, #1E65AD 0%, #2A7BC8 100%)',
                                boxShadow: '0 4px 15px rgba(30, 101, 173, 0.3)'
                              }}
                            >
                              <p 
                                style={{ 
                                  fontFamily: "'Heebo', sans-serif",
                                  color: '#FFFFFF',
                                  fontSize: '14px',
                                  lineHeight: '1.6',
                                  fontWeight: '400',
                                  userSelect: 'text',
                                  WebkitUserSelect: 'text',
                                  MozUserSelect: 'text',
                                  msUserSelect: 'text'
                                }}
                                className="sm:text-[15px] user-message-text"
                              >
                        {message.text}
                      </p>
                    </div>
                  </div>
                ) : (
                          /* AI Response - Simple Bubble */
                          <div className="max-w-[90%] sm:max-w-[80%] md:max-w-[70%]">
                            <div className="flex items-start gap-2">
                              {/* Bot Avatar */}
                              <div className="flex-shrink-0 mt-1">
                                <img 
                                  src="/uit3.GIF" 
                                  alt="AI Assistant" 
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-contain"
                                />
                              </div>
                            <div 
                                className="rounded-xl sm:rounded-2xl px-4 py-3 sm:px-5 sm:py-4 flex-1"
                          style={{ 
                                backgroundColor: '#FFFFFF',
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)'
                              }}
                            >
                              <div style={{ 
                            fontFamily: "'Heebo', sans-serif", 
                                color: '#374151',
                                fontSize: '14px',
                                lineHeight: '1.7'
                          }}
                              className="sm:text-[15px]"
                              >
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    p: ({ children }) => <p style={{ marginBottom: '0.5rem', marginTop: '0' }}>{children}</p>,
                                    h1: ({ children }) => <h1 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', marginTop: '1rem', color: '#1F2937' }}>{children}</h1>,
                                    h2: ({ children }) => <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', marginTop: '0.75rem', color: '#1F2937' }}>{children}</h2>,
                                    h3: ({ children }) => <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.375rem', marginTop: '0.5rem', color: '#1F2937' }}>{children}</h3>,
                                    ul: ({ children }) => <ul style={{ marginLeft: '1.25rem', marginBottom: '0.75rem', marginTop: '0.5rem', listStyleType: 'disc' }}>{children}</ul>,
                                    ol: ({ children }) => <ol style={{ marginLeft: '1.25rem', marginBottom: '0.75rem', marginTop: '0.5rem', listStyleType: 'decimal' }}>{children}</ol>,
                                    li: ({ children }) => <li style={{ marginBottom: '0.375rem', color: '#374151', paddingLeft: '0.25rem' }}>{children}</li>,
                                    table: ({ children }) => (
                                      <div style={{ overflowX: 'auto', marginTop: '1rem', marginBottom: '1rem' }}>
                                        <table style={{
                                          width: '100%',
                                          borderCollapse: 'collapse',
                                          border: '1px solid #E5E7EB',
                                          borderRadius: '0.5rem',
                                          overflow: 'hidden',
                                          backgroundColor: '#FFFFFF',
                                          fontFamily: "'Heebo', sans-serif"
                                        }}>
                                          {children}
                                        </table>
                                      </div>
                                    ),
                                    thead: ({ children }) => (
                                      <thead style={{ backgroundColor: '#1E65AD', color: '#FFFFFF' }}>
                                        {children}
                                      </thead>
                                    ),
                                    tbody: ({ children }) => (
                                      <tbody>
                                        {children}
                                      </tbody>
                                    ),
                                    tr: ({ children, isHeader }) => (
                                      <tr style={{
                                        borderBottom: '1px solid #E5E7EB',
                                        ...(isHeader ? {} : { '&:hover': { backgroundColor: '#F9FAFC' } })
                                      }}>
                                        {children}
                                      </tr>
                                    ),
                                    th: ({ children }) => (
                                      <th style={{
                                        padding: '0.75rem 1rem',
                                        textAlign: 'left',
                                        fontWeight: '600',
                                        fontSize: '0.875rem',
                                        color: '#FFFFFF',
                                        borderRight: '1px solid rgba(255, 255, 255, 0.2)'
                                      }}>
                                        {children}
                                      </th>
                                    ),
                                    td: ({ children }) => (
                                      <td style={{
                                        padding: '0.75rem 1rem',
                                        fontSize: '0.875rem',
                                        color: '#374151',
                                        borderRight: '1px solid #E5E7EB',
                                        verticalAlign: 'top'
                                      }}>
                                        {children}
                                      </td>
                                    ),
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
                      
                            {/* Feedback Button for Assistant Messages - Below message bubble, outside text area */}
                      {message.sender === 'bot' && message.id && (
                              <div className="mt-2 ml-12 sm:ml-14">
                          <ChatFeedbackButton 
                            messageId={message.id}
                                  messageText={message.text}
                            onFeedbackSubmitted={() => {
                              // Optional: Show notification or update UI
                              console.log('Feedback submitted for message:', message.id);
                            }}
                          />
                        </div>
                      )}
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
              className={`fixed bottom-0 py-2.5 sm:py-3 md:py-4 z-[80] transition-all duration-300 mobile-input-safe-area ${mobileSidebarOpen ? 'hidden sm:flex' : 'flex'}`}
              style={{ 
                backgroundColor: 'transparent',
                backdropFilter: 'none',
                WebkitBackdropFilter: 'none',
                left: isDesktop ? (sidebarOpen ? '288px' : '64px') : '0',
                right: '0',
                paddingLeft: isDesktop ? 'clamp(1.5rem, 3vw, 2rem)' : 'clamp(0.75rem, 2vw, 2rem)',
                paddingRight: isDesktop ? 'clamp(1.5rem, 3vw, 2rem)' : 'clamp(0.75rem, 2vw, 2rem)',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {/* White Input Bar with Border & Shadow */}
              <div className="w-full max-w-4xl mx-auto">
                <div 
                  className="relative rounded-xl sm:rounded-2xl transition-all duration-300"
                  style={{ 
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #1E65AD',
                    boxShadow: '0 4px 20px rgba(30, 101, 173, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <div className="flex items-center min-h-[48px] sm:min-h-[56px] px-2 sm:px-2.5 gap-1.5 sm:gap-2 py-1.5 sm:py-2">
                    {/* Plus Icon Button for File Attachment */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading || isProcessingVoice}
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-blue-50 active:bg-blue-100 flex-shrink-0"
                      title="Attach file"
                      style={{ minWidth: '32px', minHeight: '32px' }}
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: '#1E65AD' }} />
                    </button>

                    {/* Input Field or Recording Waveform */}
                    {isRecording ? (
                      <div className="flex-1 h-full flex items-center justify-center min-w-0">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                      key={i}
                              className="w-0.5 sm:w-1 rounded-full"
                              style={{ backgroundColor: '#1E65AD' }}
                        animate={{
                                height: [
                                  `${Math.random() * 3 + 2}px`,
                                  `${Math.random() * 15 + 8}px`,
                                  `${Math.random() * 3 + 2}px`
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
                    <textarea
                      ref={inputRef}
                      value={inputMessage}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyPress}
                        placeholder="Ask Your Legal Question Here"
                      className="flex-1 bg-transparent border-none outline-none text-sm sm:text-base placeholder-gray-400 min-w-0 resize-none"
                      style={{ 
                        fontFamily: "'Heebo', sans-serif",
                        color: '#1F2937',
                          fontSize: '14px',
                        lineHeight: '1.6',
                        minHeight: '24px',
                        maxHeight: '200px',
                        padding: '2px 0',
                        margin: '0',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        wordWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        verticalAlign: 'middle'
                      }}
                      disabled={loading || isProcessingVoice}
                      rows={1}
                    />
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                      {/* Microphone Button */}
                      {isRecording ? (
                        <motion.button
                          onClick={stopRecording}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center relative flex-shrink-0"
                          style={{ backgroundColor: '#FEE2E2', minWidth: '32px', minHeight: '32px' }}
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
                            className="flex-shrink-0"
                          >
                            <MicOff className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: '#EF4444' }} />
                          </motion.div>
                        </motion.button>
                      ) : (
                      <button
                          onClick={startRecording}
                        disabled={loading || isProcessingVoice}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-blue-50 flex-shrink-0"
                          title="Voice input"
                          style={{ minWidth: '32px', minHeight: '32px' }}
                    >
                          <Mic className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" style={{ color: '#1E65AD' }} />
                      </button>
                      )}

                      {/* Send Button */}
                      {(loading || isTyping) ? (
                        <motion.button
                          onClick={handleStopGeneration}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#EF4444', minWidth: '32px', minHeight: '32px' }}
                          title="Stop generation"
                        >
                          <Square className="w-4 h-4 flex-shrink-0" fill="#FFFFFF" style={{ color: '#FFFFFF' }} />
                        </motion.button>
                      ) : isRecording ? (
                        <motion.div
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#1E65AD', minWidth: '32px', minHeight: '32px' }}
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
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
                          style={{ 
                            backgroundColor: '#1E65AD',
                            minWidth: '32px',
                            minHeight: '32px'
                          }}
                          title="Send message"
                        >
                          {isProcessingVoice ? (
                            <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                          ) : (
                            <Send className="w-4 h-4 flex-shrink-0" style={{ color: '#FFFFFF' }} />
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
