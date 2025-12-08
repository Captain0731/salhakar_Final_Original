import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import { Copy, Share2, Users, CheckCircle, DollarSign, Clock, Gift, ArrowRight } from "lucide-react";

export default function Referral() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    successfulReferrals: 0,
    totalEarnings: 0,
    pendingRewards: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load referral data from API
    const loadReferralData = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await apiService.getReferralStats();
        // setReferralStats(response.data);
        
        // For now, initialize with empty data (or load from API if authenticated)
        if (isAuthenticated && user?.id) {
          // Load user-specific stats
          setReferralStats({
            totalReferrals: 0,
            successfulReferrals: 0,
            totalEarnings: 0,
            pendingRewards: 0
          });
        } else {
          // Show default/empty stats for non-authenticated users
          setReferralStats({
            totalReferrals: 0,
            successfulReferrals: 0,
            totalEarnings: 0,
            pendingRewards: 0
          });
        }
      } catch (error) {
        console.error('Error loading referral data:', error);
        // Set empty stats on error
        setReferralStats({
          totalReferrals: 0,
          successfulReferrals: 0,
          totalEarnings: 0,
          pendingRewards: 0
        });
      } finally {
        setLoading(false);
      }
    };

    loadReferralData();
  }, [isAuthenticated, user]);

  // Generate referral code - use user ID if authenticated, otherwise use a default/temporary code
  const referralCode = isAuthenticated && user?.id 
    ? `SALHAKAR${user.id.toString().slice(-6).toUpperCase()}` 
    : 'SALHAKAR000000';

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    // You could add a toast notification here
    alert('Referral code copied to clipboard!');
  };

  const shareReferralLink = () => {
    const referralLink = `${window.location.origin}/login?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading referral program...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9FAFC' }}>
      <Navbar />
      
      {/* Enhanced Header Section */}
      <div className="bg-white border-b border-gray-200 pt-14 sm:pt-16 md:pt-20 animate-slide-in-bottom w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 lg:py-12 w-full">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 animate-fade-in-up" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Referral Program
            </h1>
            <div className="w-12 sm:w-16 md:w-20 h-0.5 sm:h-1 mx-auto mb-3 sm:mb-4 md:mb-6 animate-fade-in-up" style={{ backgroundColor: '#CF9B63', animationDelay: '0.2s' }}></div>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl mx-auto px-2 sm:px-4 animate-fade-in-up" style={{ color: '#8C969F', fontFamily: 'Roboto, sans-serif', animationDelay: '0.4s' }}>
              Invite friends to सलहाकार and earn rewards for every successful referral. Help others access legal services while earning money for yourself
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-10 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Total Referrals
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  {referralStats.totalReferrals}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Successful Referrals
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#10B981', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  {referralStats.successfulReferrals}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Total Earnings
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#CF9B63', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  ₹{referralStats.totalEarnings}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Pending Rewards
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#F59E0B', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  ₹{referralStats.pendingRewards}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 ml-2">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Referral Code Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-5 md:p-6 lg:p-8 mb-6 sm:mb-8 md:mb-10"
        >
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4 sm:mb-5 md:mb-6" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            {isAuthenticated ? 'Your Referral Code' : 'Get Your Referral Code'}
          </h2>
          
          {!isAuthenticated && (
            <div className="mb-4 sm:mb-5 md:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800" style={{ fontFamily: 'Roboto, sans-serif' }}>
                <strong>Sign up</strong> to get your personalized referral code and start earning rewards! 
                <button
                  onClick={() => navigate('/login')}
                  className="ml-1 sm:ml-2 text-blue-600 underline font-semibold hover:text-blue-800"
                >
                  Sign up now
                </button>
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center mb-4 sm:mb-5 md:mb-6">
            <div className="flex-1 bg-gray-50 rounded-lg p-3 sm:p-4 border-2 border-dashed border-gray-300">
              <p className="text-xs sm:text-sm text-gray-600 mb-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {isAuthenticated ? 'Share this code with your friends:' : 'Sign up to get your personalized referral code:'}
              </p>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-mono font-bold break-all" style={{ color: '#1E65AD' }}>
                {referralCode}
              </p>
              {!isAuthenticated && (
                <p className="text-xs text-gray-500 mt-2" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  This is a sample code. Sign up to get your unique code.
                </p>
              )}
            </div>
            
            <button
              onClick={copyReferralCode}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium text-sm sm:text-base"
              style={{ 
                fontFamily: 'Roboto, sans-serif',
                background: 'linear-gradient(135deg, #1E65AD 0%, #CF9B63 100%)'
              }}
            >
              <Copy className="w-4 h-4" />
              Copy Code
            </button>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Or share your referral link:
            </h3>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              <div className="flex-1 bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                <p className="text-xs sm:text-sm text-gray-600 break-all" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {window.location.origin}/login?ref={referralCode}
                </p>
              </div>
              
              <button
                onClick={shareReferralLink}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium text-sm sm:text-base"
                style={{ 
                  fontFamily: 'Roboto, sans-serif',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                }}
              >
                <Share2 className="w-4 h-4" />
                Copy Link
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
          {[
            {
              icon: <Users className="w-full h-full" />,
              title: "Invite Friends",
              description: "Send personalized invitations to your friends and family",
              bgColor: "#1E65AD",
              path: "/referral/invite"
            },
            {
              icon: <Gift className="w-full h-full" />,
              title: "Earn Rewards",
              description: "Learn about our reward structure and earning potential",
              bgColor: "#CF9B63",
              path: "/referral/rewards"
            },
            {
              icon: <CheckCircle className="w-full h-full" />,
              title: "Track Referrals",
              description: "Monitor your referral activity and earnings in real-time",
              bgColor: "#10B981",
              path: "/referral/track"
            }
          ].map((action, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
              onClick={() => navigate(action.path)}
              className="group relative bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl text-left"
              style={{
                border: '1px solid rgba(30, 101, 173, 0.1)',
                boxShadow: '0 4px 20px rgba(30, 101, 173, 0.08)'
              }}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                style={{
                  background: `linear-gradient(135deg, ${action.bgColor} 0%, ${action.bgColor === '#1E65AD' ? '#CF9B63' : '#1E65AD'} 100%)`
                }}
              ></div>
              
              <div className="relative p-4 sm:p-5 md:p-6">
                <div className="flex items-start gap-4 sm:gap-6">
                  <div 
                    className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{ backgroundColor: action.bgColor }}
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8">
                      {action.icon}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="text-lg sm:text-xl font-bold mb-2 sm:mb-3"
                      style={{ 
                        color: '#1E65AD', 
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontWeight: 700
                      }}
                    >
                      {action.title}
                    </h3>
                    <p 
                      className="text-sm sm:text-base text-gray-600"
                      style={{ 
                        fontFamily: "'Heebo', sans-serif",
                        lineHeight: '1.7'
                      }}
                    >
                      {action.description}
                    </p>
                    <div className="mt-3 sm:mt-4 inline-flex items-center gap-2 text-sm sm:text-base font-medium transition-colors"
                      style={{ color: action.bgColor }}
                    >
                      Learn more
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-5 md:p-6 lg:p-8"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-center" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                number: "1",
                title: "Share Your Code",
                description: "Share your unique referral code or link with friends and family",
                bgColor: "bg-blue-100",
                textColor: "text-blue-600"
              },
              {
                number: "2",
                title: "They Sign Up",
                description: "Your friends sign up using your referral code and become active users",
                bgColor: "bg-green-100",
                textColor: "text-green-600"
              },
              {
                number: "3",
                title: "You Earn Rewards",
                description: "Earn ₹200 for each successful referral and ₹50 for each transaction they make",
                bgColor: "bg-yellow-100",
                textColor: "text-yellow-600"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 ${step.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 transition-transform duration-300 hover:scale-110`}>
                  <span className={`text-2xl sm:text-3xl md:text-4xl font-bold ${step.textColor}`}>{step.number}</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600" style={{ fontFamily: 'Roboto, sans-serif', lineHeight: '1.7' }}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      
      {/* <Footer /> */}
    </div>
  );
}
