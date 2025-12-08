import React, { useState, useLayoutEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import apiService from "../services/api";
import { motion } from "framer-motion";

export default function YoutubeVideoSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState(null);
  const [videoInfo, setVideoInfo] = useState(null);

  // Fast scroll to top on route change
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [location.pathname]);


  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const validateYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
    return youtubeRegex.test(url);
  };

  const handleSummarize = async () => {
    if (!videoUrl.trim()) {
      setError("Please enter a YouTube video URL");
      return;
    }

    if (!validateYouTubeUrl(videoUrl)) {
      setError("Please enter a valid YouTube video URL");
      return;
    }

    setLoading(true);
    setError("");
    setSummary(null);
    setVideoInfo(null);

    try {
      const response = await apiService.summarizeYouTubeVideo(videoUrl);
      
      if (response.success) {
        // Parse the summary text (assuming it's a 5-point summary)
        const summaryText = response.summary || "";
        
        // Extract video ID for thumbnail
        const videoId = extractVideoId(videoUrl);
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
        
        // Set summary data
        setSummary({
          summary: summaryText,
          // Split summary into key points if it contains bullet points
          keyPoints: summaryText.split('\n').filter(line => line.trim().length > 0).slice(0, 5),
          tags: [],
          confidence: 0.95,
          processingTime: "Few seconds"
        });

        // Set basic video info
        setVideoInfo({
          title: "YouTube Video",
          channel: "Unknown",
          duration: "Unknown",
          views: "Unknown",
          publishedAt: new Date().toISOString(),
          description: "",
          thumbnail: thumbnailUrl
        });
      } else {
        setError(response.detail || "Failed to generate summary. Please try again.");
      }
    } catch (err) {
      console.error("Error summarizing video:", err);
      setError(err.message || "An error occurred while generating the summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setVideoUrl("");
    setSummary(null);
    setVideoInfo(null);
    setError("");
  };

  const copySummary = () => {
    if (summary) {
      const keyPointsText = summary.keyPoints && summary.keyPoints.length > 0 
        ? `\n\nKey Points:\n${summary.keyPoints.map((point, index) => `${index + 1}. ${point.replace(/^[•\-\*]\s*/, '').trim()}`).join('\n')}`
        : '';
      const textToCopy = `YouTube Video Summary\n\n${summary.summary}${keyPointsText}\n\nGenerated on: ${new Date().toLocaleString()}`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        // Show success message
        const button = document.activeElement;
        const originalText = button.textContent;
        button.textContent = "Copied!";
        button.style.backgroundColor = '#10b981';
        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = '';
        }, 2000);
      }).catch(() => {
        alert("Failed to copy to clipboard");
      });
    }
  };

  const downloadSummary = () => {
    if (summary) {
      const keyPointsText = summary.keyPoints && summary.keyPoints.length > 0 
        ? `\n\nKey Points:\n${summary.keyPoints.map((point, index) => `${index + 1}. ${point.replace(/^[•\-\*]\s*/, '').trim()}`).join('\n')}`
        : '';
      const tagsText = summary.tags && summary.tags.length > 0 
        ? `\n\nTags: ${summary.tags.join(', ')}`
        : '';
      const content = `YouTube Video Summary\n\nURL: ${videoUrl}\n\nSummary:\n${summary.summary}${keyPointsText}${tagsText}\n\nGenerated on: ${new Date().toLocaleString()}`;
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const videoId = extractVideoId(videoUrl);
      a.download = `youtube_summary_${videoId || 'video'}_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };


  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#F9FAFC', scrollBehavior: 'smooth' }}>
      <Navbar />
      
      {/* Enhanced Header Section */}
      <div className="bg-white border-b border-gray-200 pt-14 sm:pt-16 md:pt-20 animate-slide-in-bottom w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 lg:py-12 w-full">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 animate-fade-in-up" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              YouTube Video Summary
            </h1>
            <div className="w-12 sm:w-16 md:w-20 h-0.5 sm:h-1 mx-auto mb-3 sm:mb-4 md:mb-6 animate-fade-in-up" style={{ backgroundColor: '#CF9B63', animationDelay: '0.2s' }}></div>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl mx-auto px-2 sm:px-4 animate-fade-in-up" style={{ color: '#8C969F', fontFamily: 'Roboto, sans-serif', animationDelay: '0.4s' }}>
              Get AI-powered summaries of YouTube videos to quickly understand key content and insights
            </p>
          </div>
        </div>
      </div>
      
      <div className="py-8 sm:py-12 md:py-16" style={{ scrollBehavior: 'smooth' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Modern Input Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8"
                style={{
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)'
                }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      YouTube Video URL
                    </h2>
                    <p className="text-sm text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Paste your video link to get started
                    </p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-[#1E65AD] transition-all duration-200 bg-gray-50 focus:bg-white text-base"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                      onKeyPress={(e) => e.key === 'Enter' && handleSummarize()}
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-red-700 text-sm font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {error}
                      </p>
                    </div>
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSummarize}
                    disabled={loading}
                    className="flex-1 px-6 py-3.5 rounded-lg font-bold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ 
                      backgroundColor: '#1E65AD',
                      fontFamily: 'Roboto, sans-serif',
                      minHeight: '48px'
                    }}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        <span>Generate Summary</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={clearForm}
                    className="px-6 py-3.5 rounded-lg font-semibold transition-all duration-200 hover:bg-gray-50 border border-gray-300 flex items-center justify-center gap-2 bg-white"
                    style={{ 
                      color: '#6B7280', 
                      fontFamily: 'Roboto, sans-serif',
                      minHeight: '48px'
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Clear</span>
                  </button>
                </div>
              </motion.div>

              {/* Loading State */}
              {loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-12 mb-8"
                  style={{
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-20 h-20 mx-auto mb-6"
                    >
                      <div className="w-full h-full bg-gradient-to-br from-[#1E65AD] to-[#2A7BC8] rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    </motion.div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      Analyzing Video Content
                    </h3>
                    <p className="text-gray-600 mb-8 text-base sm:text-lg max-w-2xl mx-auto" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Our AI is processing the video to extract key information and generate a comprehensive summary...
                    </p>
                    
                    {/* Progress indicators */}
                    <div className="space-y-4 max-w-md mx-auto">
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="h-full bg-gradient-to-r from-[#1E65AD] via-[#2A7BC8] to-[#1E65AD] rounded-full"
                          style={{ backgroundSize: '200% 100%' }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          This may take a few moments
                        </motion.span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Video Info */}
              {videoInfo && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 mb-8 overflow-hidden"
                  style={{
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#1E65AD] to-[#2A7BC8] rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      Video Information
                    </h2>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      <div className="relative rounded-xl overflow-hidden shadow-lg group">
                        <img
                          src={videoInfo.thumbnail}
                          alt={videoInfo.title}
                          className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/320x180/1E65AD/FFFFFF?text=Video+Thumbnail';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>
                    <div className="md:w-2/3">
                      <h3 className="text-lg sm:text-xl font-bold mb-3 leading-tight" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        {videoInfo.title}
                      </h3>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>Channel</div>
                          <div className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{videoInfo.channel}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>Duration</div>
                          <div className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{videoInfo.duration}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>Views</div>
                          <div className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{videoInfo.views}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>Published</div>
                          <div className="text-sm font-semibold text-gray-900" style={{ fontFamily: 'Roboto, sans-serif' }}>{new Date(videoInfo.publishedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      {videoInfo.description && (
                        <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 rounded-lg p-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          {videoInfo.description}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Summary Results */}
              {summary && !loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 overflow-hidden"
                  style={{
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 pb-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#1E65AD] to-[#2A7BC8] rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                          AI-Generated Summary
                        </h2>
                        <p className="text-sm text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                          Comprehensive analysis of your video
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={copySummary}
                        className="px-5 py-2.5 bg-[#1E65AD] text-white rounded-xl hover:bg-[#185a9a] transition-all duration-200 text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </button>
                      <button
                        onClick={downloadSummary}
                        className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </button>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-1 h-6 bg-gradient-to-b from-[#1E65AD] to-[#2A7BC8] rounded-full"></div>
                      <h3 className="font-bold text-lg" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>Summary</h3>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {summary.summary}
                      </p>
                    </div>
                  </div>

                  {summary.keyPoints && summary.keyPoints.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-gradient-to-b from-[#1E65AD] to-[#2A7BC8] rounded-full"></div>
                        <h3 className="font-bold text-lg" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>Key Points</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {summary.keyPoints.map((point, index) => (
                          <motion.div 
                            key={index} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:border-[#1E65AD] hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-[#1E65AD] to-[#2A7BC8] rounded-lg flex-shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-md">
                                {index + 1}
                              </div>
                              <p className="text-gray-700 flex-1 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                {point.replace(/^[•\-\*]\s*/, '').trim()}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {summary.tags && summary.tags.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3 text-lg" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {summary.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                            style={{ fontFamily: 'Roboto, sans-serif' }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm pt-6 mt-6 border-t border-gray-200 gap-3">
                    <div className="flex items-center gap-2 text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      <svg className="w-4 h-4 text-[#1E65AD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span><strong>Generated:</strong> {new Date().toLocaleString()}</span>
                    </div>
                    {summary.processingTime && (
                      <div className="flex items-center gap-2 text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        <svg className="w-4 h-4 text-[#1E65AD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span><strong>Processing Time:</strong> {summary.processingTime}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Tips Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-blue-100 sticky top-24"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#1E65AD] to-[#2A7BC8] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    Tips for Better Summaries
                  </h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Use videos with clear audio and speech",
                    "Educational and informational videos work best",
                    "Longer videos (10+ minutes) provide more detailed summaries",
                    "Videos with subtitles are processed more accurately"
                  ].map((tip, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-6 h-6 bg-[#1E65AD] rounded-full flex-shrink-0 flex items-center justify-center mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-700 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {tip}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
