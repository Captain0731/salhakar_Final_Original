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
      <div className="p-6 pt-24" style={{ scrollBehavior: 'smooth' }}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              YouTube Video Summary
            </h1>
            <p className="text-lg" style={{ color: '#8C969F', fontFamily: 'Roboto, sans-serif' }}>
              Get AI-powered summaries of YouTube videos to quickly understand key content and insights
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Input Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  Enter YouTube Video URL
                </h2>
                
                <div className="mb-4">
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    style={{ fontFamily: 'Roboto, sans-serif', '--tw-ring-color': '#1E65AD' }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSummarize()}
                  />
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {error}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSummarize}
                    disabled={loading}
                    className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    style={{ backgroundColor: '#1E65AD', fontFamily: 'Roboto, sans-serif', minHeight: '44px' }}
                  >
                    {loading ? "Generating Summary..." : "Generate Summary"}
                  </button>
                  <button
                    onClick={clearForm}
                    className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 border-2"
                    style={{ 
                      color: '#8C969F', 
                      borderColor: '#8C969F', 
                      fontFamily: 'Roboto, sans-serif' 
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 md:p-12 mb-8"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 mx-auto mb-6"
                    >
                      <svg className="w-full h-full text-blue-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </motion.div>
                    <h3 className="text-xl md:text-2xl font-semibold mb-3" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      Analyzing Video Content
                    </h3>
                    <p className="text-gray-600 mb-6 text-base md:text-lg" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Our AI is processing the video to extract key information and generate a comprehensive summary...
                    </p>
                    
                    {/* Progress indicators */}
                    <div className="space-y-3 max-w-md mx-auto">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="h-2 bg-blue-100 rounded-full overflow-hidden"
                      >
                        <motion.div
                          initial={{ x: "-100%" }}
                          animate={{ x: "100%" }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                          style={{ width: "40%" }}
                        />
                      </motion.div>
                      
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          ⏳ This may take a few moments
                        </motion.span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Video Info */}
              {videoInfo && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    Video Information
                  </h2>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                      <img
                        src={videoInfo.thumbnail}
                        alt={videoInfo.title}
                        className="w-full rounded-lg shadow-sm"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/320x180/1E65AD/FFFFFF?text=Video+Thumbnail';
                        }}
                      />
                    </div>
                    <div className="md:w-2/3">
                      <h3 className="text-lg font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        {videoInfo.title}
                      </h3>
                      <div className="space-y-2 text-sm" style={{ color: '#8C969F', fontFamily: 'Roboto, sans-serif' }}>
                        <div><strong>Channel:</strong> {videoInfo.channel}</div>
                        <div><strong>Duration:</strong> {videoInfo.duration}</div>
                        <div><strong>Views:</strong> {videoInfo.views}</div>
                        <div><strong>Published:</strong> {new Date(videoInfo.publishedAt).toLocaleDateString()}</div>
                      </div>
                      <p className="mt-3 text-gray-600 text-sm" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {videoInfo.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Results */}
              {summary && !loading && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <h2 className="text-xl md:text-2xl font-semibold" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      AI-Generated Summary
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={copySummary}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </button>
                      <button
                        onClick={downloadSummary}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-lg" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>Summary</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-600">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Roboto, sans-serif' }}>
                        {summary.summary}
                      </p>
                    </div>
                  </div>

                  {summary.keyPoints && summary.keyPoints.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3 text-lg" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>Key Points</h3>
                      <ul className="space-y-3">
                        {summary.keyPoints.map((point, index) => (
                          <motion.li 
                            key={index} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 bg-blue-50 rounded-lg p-3"
                          >
                            <span className="w-6 h-6 bg-blue-600 rounded-full mt-0.5 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                              {index + 1}
                            </span>
                            <span className="text-gray-700 flex-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                              {point.replace(/^[•\-\*]\s*/, '').trim()}
                            </span>
                          </motion.li>
                        ))}
                      </ul>
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

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm pt-4 border-t border-gray-200 gap-2" style={{ color: '#8C969F', fontFamily: 'Roboto, sans-serif' }}>
                    <div>
                      <strong>Generated:</strong> {new Date().toLocaleString()}
                    </div>
                    {summary.processingTime && (
                      <div>
                        <strong>Processing Time:</strong> {summary.processingTime}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">

              {/* Tips */}
              <div className="bg-blue-50 rounded-xl p-6 mt-6">
                <h3 className="font-semibold mb-3" style={{ color: '#1E65AD' }}>Tips for Better Summaries</h3>
                <ul className="space-y-2 text-sm" style={{ color: '#8C969F', fontFamily: 'Roboto, sans-serif' }}>
                  <li>• Use videos with clear audio and speech</li>
                  <li>• Educational and informational videos work best</li>
                  <li>• Longer videos (10+ minutes) provide more detailed summaries</li>
                  <li>• Videos with subtitles are processed more accurately</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
