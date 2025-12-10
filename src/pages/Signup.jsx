import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import apiService from "../services/api";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, Phone, GraduationCap, Scale, Building2, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();
  const { showNotification } = useNotification();
  
  // Get the intended destination from location state
  const from = location.state?.from?.pathname || "/";

  // Form state
  const [selectedProfession, setSelectedProfession] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Student fields
    uni_name: "",
    uni_mail: "",
    graduation_year: "",
    // Lawyer fields
    lawyer_email: "",
    bar_id: "",
    city: "",
    // Corporate fields
    company_name: "",
    company_email: "",
    registered_id: "",
    company_size: "",
    // Other fields
    other_email: "",
    profession_type: "",
  });

  // UI state
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [expectedOtp, setExpectedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: ""
  });
  const [phoneVerificationStep, setPhoneVerificationStep] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Static data
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const years = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);
  const cities = [
    "Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad",
    "Pune", "Ahmedabad", "Jaipur", "Surat", "Lucknow", "Kanpur", "Other"
  ];
  const colleges = [
    "National Law School of India University, Bangalore",
    "National Academy of Legal Studies and Research, Hyderabad",
    "West Bengal National University of Juridical Sciences, Kolkata",
    "National Law Institute University, Bhopal",
    "Gujarat National Law University, Gandhinagar",
    "Rajiv Gandhi National University of Law, Patiala",
    "Other"
  ];
  const companySizes = ["1-5", "6-20", "21-50", "51-200", "200+"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field-specific error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    if (error) setError("");
  };

  const handleProfessionSelect = (profession) => {
    setIsAnimating(true);
    setTimeout(() => {
      setSelectedProfession(profession);
      setIsAnimating(false);
    }, 150);
  };

  const sendOTP = async () => {
    if (!formData.mobile.trim()) {
      setError("Please enter your phone number first");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("Sending OTP...");

    try {
      const data = await apiService.sendVerificationCode(formData.mobile);
      setOtpSent(true);
      setOtpTimer(60);
      setMessage(`OTP sent successfully to ${apiService.formatPhoneNumber(formData.mobile)}!`);
    } catch (err) {
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (otpValue) => {
    setEnteredOtp(otpValue);
    
    if (otpValue.length === 6) {
      try {
        const data = await apiService.verifyPhone(formData.mobile, otpValue);
        if (data.verified) {
          setOtpVerified(true);
          setMessage("Phone verified successfully!");
        } else {
          setError("Invalid OTP. Please try again.");
        }
      } catch (err) {
        setError(err.message || "Invalid OTP. Please try again.");
      }
    }
  };

  const resendOTP = () => {
    if (otpTimer === 0) {
      sendOTP();
    }
  };

  const validateForm = () => {
    const errors = {
      name: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: ""
    };

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = "Please enter a valid email address";
      }
    }
    
    if (!formData.mobile.trim()) {
      errors.mobile = "Phone number is required";
    }
    
    if (!otpVerified) {
      errors.mobile = "Please verify your phone number";
    }
    
    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters long";
    }
    
    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    
    // Check if there are any errors
    const hasErrors = Object.values(errors).some(err => err !== "");
    if (hasErrors) {
      return false;
    }

    // Profession-specific validation
    if (selectedProfession === "Student") {
      if (!formData.uni_name.trim()) {
        setError("University name is required");
        return false;
      }
      if (!formData.graduation_year.trim()) {
        setError("Graduation year is required");
        return false;
      }
    } else if (selectedProfession === "Lawyer") {
      if (!formData.bar_id.trim()) {
        setError("Bar ID is required");
        return false;
      }
      if (!formData.city.trim()) {
        setError("City is required");
        return false;
      }
    } else if (selectedProfession === "Law Firm") {
      if (!formData.company_name.trim()) {
        setError("Company name is required");
        return false;
      }
      if (!formData.registered_id.trim()) {
        setError("Registration ID is required");
        return false;
      }
      if (!formData.company_size.trim()) {
        setError("Company size is required");
        return false;
      }
    } else if (selectedProfession === "Other") {
      if (!formData.profession_type.trim()) {
        setError("Profession type is required");
        return false;
      }
    }

    return true;
  };

  // Phone verification functions
  const sendVerificationCode = async () => {
    try {
      setLoading(true);
      setError("");
      await apiService.sendVerificationCode(formData.mobile);
      setPhoneVerificationStep(true);
      setMessage("Verification code sent to your phone number");
    } catch (err) {
      setError(err.message || "Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneNumber = async () => {
    try {
      setLoading(true);
      setError("");
      await apiService.verifyPhone(formData.mobile, verificationCode);
      setPhoneVerified(true);
      setMessage("Phone number verified successfully!");
      setPhoneVerificationStep(false);
    } catch (err) {
      setError(err.message || "Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setFieldErrors({ name: "", email: "", mobile: "", password: "", confirmPassword: "" });
    setMessage("Creating your account...");

    try {
      // Map profession to user_type according to API documentation
      const userTypeMap = {
        "Student": 1,
        "Lawyer": 2,
        "Law Firm": 3, // This maps to Corporate (user_type: 3)
        "Other": 4
      };

      // Prepare API payload based on user type
      let apiPayload = {
        email: formData.email,
        password: formData.password,
        user_type: userTypeMap[selectedProfession],
        name: formData.name,
        mobile: formData.mobile
      };

      // Add profession-specific fields according to API documentation
      if (selectedProfession === "Student") {
        apiPayload = {
          ...apiPayload,
          uni_name: formData.uni_name,
          uni_mail: formData.uni_mail || formData.email, // Use university email if provided, fallback to main email
          graduation_year: parseInt(formData.graduation_year)
        };
      } else if (selectedProfession === "Lawyer") {
        apiPayload = {
          ...apiPayload,
          lawyer_email: formData.lawyer_email || formData.email, // Use lawyer email if provided, fallback to main email
          bar_id: formData.bar_id,
          city: formData.city
        };
      } else if (selectedProfession === "Law Firm") {
        apiPayload = {
          ...apiPayload,
          company_name: formData.company_name,
          company_email: formData.company_email || formData.email, // Use company email if provided, fallback to main email
          registered_id: formData.registered_id,
          company_size: parseInt(formData.company_size),
          city: formData.city
        };
      } else if (selectedProfession === "Other") {
        apiPayload = {
          ...apiPayload,
          other_email: formData.other_email || formData.email, // Use other email if provided, fallback to main email
          profession_type: formData.profession_type
        };
      }

      const data = await apiService.signup(apiPayload);
      
      // Store user data in auth context with proper field mapping
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.mobile, // Map mobile to phone for profile page
        profession: selectedProfession,
        user_type: userTypeMap[selectedProfession],
        // Map profession-specific fields
        college: formData.uni_name || "",
        collegeOther: formData.uni_name === "Other" ? formData.uni_name : "",
        passingYear: formData.graduation_year || "",
        barCouncilId: formData.bar_id || "",
        city: formData.city || "",
        cityOther: formData.city === "Other" ? formData.city : "",
        registrationNo: formData.registered_id || "",
        companySize: formData.company_size || "",
        designation: formData.profession_type || "",
        // Keep original form data for reference
        ...formData
      };
      
      // Enhanced signup with token management
      const tokens = {
        access_token: data.access_token,
        refresh_token: data.refresh_token
      };
      await signup(userData, tokens);
      
      setMessage("Account created successfully! Redirecting...");
      
      // Show success notification
      showNotification("Account created successfully! Welcome to Salhakar AI.", "success", "Welcome!");
      
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // OTP Timer
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(timer => timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);


  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#f8fafc' }}>
      {/* Skip Button - Mobile Only */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        onClick={() => navigate("/")}
        className="lg:hidden fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-md border-2 border-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
        style={{ fontFamily: 'Heebo' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowLeft className="w-4 h-4" />
        Skip
      </motion.button>

      <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            <div className="lg:grid lg:grid-cols-2 min-h-[600px]">
            {/* Left Panel - Branding - Hidden on Mobile */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="hidden lg:flex relative p-8 sm:p-12 lg:p-16 flex-col justify-center items-center text-white overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #1E65AD 0%, #1a5a9a 50%, #CF9B63 100%)',
                }}
              >
                {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-10 right-10 w-24 h-24 border-2 border-white rounded-full"
                  />
                </div>

                <div className="relative z-10 text-center w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mb-8"
                  >
                    <img
                      src="/salahakar .PNG"
                      alt="सलहाकार Logo"
                      className="mx-auto max-w-[140px] sm:max-w-[180px] lg:max-w-[220px] h-auto object-contain drop-shadow-2xl"
                    />
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 text-white drop-shadow-lg"
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                  >
                  Welcome to सलहाकार
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="text-blue-100 mb-8 text-base sm:text-lg lg:text-xl leading-relaxed max-w-md mx-auto px-4"
                    style={{ fontFamily: 'Heebo' }}
                  >
                    Join thousands of legal professionals and students exploring comprehensive legal tools in one place.
                  </motion.p>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/")}
                    className="group w-full max-w-xs mx-auto bg-white/10 backdrop-blur-md border-2 border-white/50 text-white py-3 px-6 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
                    style={{ fontFamily: 'Heebo', minHeight: '48px' }}
                  >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                  </motion.button>
                </div>
              </motion.div>

            {/* Right Panel - Signup Form */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white"
              >
                <div className="max-w-md mx-auto w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-center mb-8"
                  >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                    Create Account
                  </h2>
                    <p className="text-gray-600 text-sm sm:text-base" style={{ fontFamily: 'Heebo' }}>
                      Join our legal community today
                    </p>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '80px' }}
                      transition={{ duration: 0.6, delay: 0.7 }}
                      className="h-1 mx-auto mt-4 rounded-full"
                      style={{ backgroundColor: '#CF9B63' }}
                    />
                  </motion.div>
                
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >

                {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-3 rounded-lg mb-6 shadow-sm"
                      >
                    <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                          <span className="text-sm font-medium" style={{ fontFamily: 'Heebo' }}>{message}</span>
                    </div>
                      </motion.div>
                    )}
                    
                    {error && !fieldErrors.name && !fieldErrors.email && !fieldErrors.mobile && !fieldErrors.password && !fieldErrors.confirmPassword && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg mb-6 shadow-sm"
                      >
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium" style={{ fontFamily: 'Heebo' }}>{error}</span>
                  </div>
                      </motion.div>
                )}
                  </motion.div>

                {/* Profession Selection */}
                {!selectedProfession ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="mb-6 sm:mb-8"
                  >
                    <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center" style={{ color: '#1E65AD', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      Choose your profession
                    </h3>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { 
                          name: "Student", 
                          icon: GraduationCap, 
                          iconColor: "#1E65AD",
                          bgColor: "linear-gradient(135deg, #1E65AD 0%, #1a5a9a 50%, #CF9B63 100%)"
                        },
                        { 
                          name: "Lawyer", 
                          icon: Scale, 
                          iconColor: "#CF9B63",
                          bgColor: "transparent"
                        },
                        { 
                          name: "Law Firm", 
                          icon: Building2, 
                          iconColor: "#8C969F",
                          bgColor: "transparent"
                        },
                        { 
                          name: "Other", 
                          icon: User, 
                          iconColor: "#1E65AD",
                          bgColor: "transparent"
                        }
                      ].map((profession, index) => {
                        const IconComponent = profession.icon;
                        const isStudent = profession.name === "Student";
                        return (
                          <motion.button
                            key={profession.name}
                            type="button"
                            onClick={() => handleProfessionSelect(profession.name)}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.8 + (index * 0.1) }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`group relative p-4 sm:p-5 border-2 rounded-xl transition-all duration-300 text-center overflow-hidden ${
                              isStudent 
                                ? 'border-[#1E65AD] shadow-md' 
                                : 'border-gray-200 hover:border-[#1E65AD] hover:shadow-md'
                            }`}
                            style={{ 
                              background: isStudent ? profession.bgColor : 'white',
                              minHeight: '90px'
                            }}
                          >
                            {isStudent && (
                              <div className="absolute inset-0 opacity-10">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                  className="absolute top-2 left-2 w-12 h-12 border-2 border-white rounded-full"
                                />
                              </div>
                            )}
                            <div className="relative z-10 flex flex-col items-center justify-center h-full">
                              <div className={`mb-2 sm:mb-3 p-2 sm:p-2.5 rounded-lg transition-all duration-300 ${
                                isStudent 
                                  ? 'bg-white/20 backdrop-blur-sm' 
                                  : 'bg-gray-50 group-hover:bg-[#1E65AD]/10'
                              }`}>
                                <IconComponent 
                                  className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-300 ${
                                    isStudent ? 'text-white' : 'text-gray-600 group-hover:text-[#1E65AD]'
                                  }`}
                                  strokeWidth={2}
                                />
                              </div>
                              <div className={`font-semibold text-sm sm:text-base transition-colors duration-300 ${
                                isStudent ? 'text-white' : 'text-gray-700 group-hover:text-[#1E65AD]'
                              }`} style={{ fontFamily: 'Heebo' }}>
                                {profession.name}
                              </div>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {/* Back to profession selection */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                      <button
                        type="button"
                        onClick={() => setSelectedProfession("")}
                        className="text-xs sm:text-sm flex items-center font-medium transition-colors duration-200 self-start"
                        style={{ color: '#1E65AD', fontFamily: 'Heebo' }}
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to profession selection
                      </button>
                      <span className="text-xs sm:text-sm text-white px-3 sm:px-4 py-1 sm:py-2 rounded-full font-semibold self-start sm:self-auto" style={{ backgroundColor: '#1E65AD', fontFamily: 'Heebo' }}>
                        {selectedProfession}
                      </span>
                    </div>

                    {/* Common Fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1E65AD', fontFamily: 'Heebo' }}>
                          Full Name *
                        </label>
              <input
                type="text"
                          name="name"
                          value={formData.name}
                onChange={handleChange}
                          className={`w-full px-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base ${fieldErrors.name ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1E65AD]'}`}
                          style={{ fontFamily: 'Heebo', minHeight: '48px' }}
                          placeholder="Enter your full name"
                required
              />
              {fieldErrors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600"
                  style={{ fontFamily: 'Heebo' }}
                >
                  {fieldErrors.name}
                </motion.p>
              )}
            </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1E65AD', fontFamily: 'Heebo' }}>
                          Email Address *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base ${fieldErrors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1E65AD]'}`}
                            style={{ fontFamily: 'Heebo', minHeight: '48px' }}
                            placeholder="Enter your email address"
                            required
                          />
                        </div>
                        {fieldErrors.email && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 text-sm text-red-600"
                            style={{ fontFamily: 'Heebo' }}
                          >
                            {fieldErrors.email}
                          </motion.p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1E65AD', fontFamily: 'Heebo' }}>
                          Phone Number *
                        </label>
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <div className="relative flex-1">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Phone className="w-5 h-5 text-gray-400" />
                              </div>
                              <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base ${fieldErrors.mobile ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1E65AD]'}`}
                                style={{ fontFamily: 'Heebo', minHeight: '48px' }}
                                placeholder="Enter phone number (e.g., 9313507346)"
                                required
                              />
                            </div>
                          {!otpSent ? (
              <button
                type="button"
                onClick={sendOTP}
                disabled={loading}
                              className="px-6 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 hover:opacity-90 text-sm sm:text-base whitespace-nowrap"
                              style={{ backgroundColor: '#1E65AD', fontFamily: 'Heebo', minHeight: '48px' }}
                            >
                              {loading ? "Sending..." : "Send OTP"}
                            </button>
                          ) : (
                            <div className="px-6 py-3.5 rounded-xl text-sm font-medium whitespace-nowrap flex items-center justify-center" style={{ backgroundColor: '#CF9B63', color: 'white', fontFamily: 'Heebo', minHeight: '48px' }}>
                              OTP Sent
                            </div>
                          )}
                        </div>
                        {otpSent && !otpVerified && (
                          <div className="mt-3">
                            <input
                              type="text"
                              placeholder="Enter 6-digit OTP"
                              maxLength="6"
                              value={enteredOtp}
                              onChange={(e) => verifyOTP(e.target.value)}
                              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-center text-2xl tracking-widest"
                              style={{ fontFamily: 'Heebo', '--tw-ring-color': '#1E65AD', minHeight: '48px' }}
                            />
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 space-y-1 sm:space-y-0">
                              <span className="text-xs sm:text-sm" style={{ color: '#8C969F', fontFamily: 'Heebo' }}>
                                {otpTimer > 0 ? `Resend in ${otpTimer}s` : "OTP expired"}
                              </span>
                              {otpTimer === 0 && (
                                <button
                                  type="button"
                                  onClick={resendOTP}
                                  className="text-xs sm:text-sm font-medium hover:underline self-start sm:self-auto"
                                  style={{ color: '#1E65AD', fontFamily: 'Heebo' }}
                                >
                                  Resend OTP
              </button>
                              )}
                            </div>
                          </div>
                        )}
                          </div>
                          {fieldErrors.mobile && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 text-sm text-red-600"
                              style={{ fontFamily: 'Heebo' }}
                            >
                              {fieldErrors.mobile}
                            </motion.p>
                          )}
                          <p className="text-xs text-gray-500 mt-2" style={{ fontFamily: 'Heebo' }}>
                            Enter your 10-digit mobile number. We'll automatically add the +91 country code for India.
                          </p>
                        </div>
                      </div>

                      {/* Profession-specific fields */}
                      {selectedProfession === "Student" && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1E65AD', fontFamily: 'Heebo' }}>
                              University *
                            </label>
                            <select
                              name="uni_name"
                              value={formData.uni_name}
                              onChange={handleChange}
                              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                              style={{ fontFamily: 'Heebo', '--tw-ring-color': '#1E65AD', minHeight: '48px' }}
                              required
                            >
                              <option value="">Select college</option>
                              {colleges.map(college => (
                                <option key={college} value={college}>{college}</option>
                              ))}
                            </select>
                            {formData.college === "Other" && (
                              <input
                                type="text"
                                name="collegeOther"
                                value={formData.collegeOther}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white mt-2 text-sm sm:text-base"
                                style={{ fontFamily: 'Heebo', '--tw-ring-color': '#1E65AD', minHeight: '48px' }}
                                placeholder="Enter college name"
                                required
                              />
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div>
                              <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1E65AD', fontFamily: 'Heebo' }}>
                                Passing Month *
                              </label>
                              <select
                                name="passingMonth"
                                value={formData.passingMonth}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                                style={{ fontFamily: 'Heebo', '--tw-ring-color': '#1E65AD', minHeight: '48px' }}
                                required
                              >
                                <option value="">Select month</option>
                                {months.map(month => (
                                  <option key={month} value={month}>{month}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1E65AD', fontFamily: 'Heebo' }}>
                                Graduation Year *
                              </label>
                              <select
                                name="graduation_year"
                                value={formData.graduation_year}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base"
                                style={{ fontFamily: 'Heebo', '--tw-ring-color': '#1E65AD', minHeight: '48px' }}
                                required
                              >
                                <option value="">Select year</option>
                                {years.map(year => (
                                  <option key={year} value={year}>{year}</option>
                                ))}
                              </select>
                            </div>
              </div>
                        </>
                      )}

                      {selectedProfession === "Lawyer" && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1E65AD', fontFamily: 'Heebo' }}>
                              Bar ID *
                            </label>
                            <input
                              type="text"
                              name="bar_id"
                              value={formData.bar_id}
                onChange={handleChange}
                              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                              style={{ fontFamily: 'Heebo', '--tw-ring-color': '#1E65AD', minHeight: '48px' }}
                              placeholder="Enter Bar Council ID"
                              required
              />
            </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Heebo' }}>
                              City *
                            </label>
                            <select
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                              style={{ fontFamily: 'Heebo', '--tw-ring-color': '#1E65AD' }}
                              required
                            >
                              <option value="">Select city</option>
                              {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                              ))}
                            </select>
                            {formData.city === "Other" && (
                              <input
                                type="text"
                                name="cityOther"
                                value={formData.cityOther}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white mt-2"
                                style={{ fontFamily: 'Heebo', '--tw-ring-color': '#1E65AD', minHeight: '48px' }}
                                placeholder="Enter city name"
                                required
                              />
                            )}
                          </div>
                        </>
                      )}

                      {selectedProfession === "Law Firm" && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold mb-2" style={{ color: '#1E65AD', fontFamily: 'Heebo' }}>
                              City *
                            </label>
                            <select
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                              style={{ fontFamily: 'Heebo', '--tw-ring-color': '#1E65AD' }}
                              required
                            >
                              <option value="">Select city</option>
                              {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                              ))}
                            </select>
                            {formData.city === "Other" && (
              <input
                                type="text"
                                name="cityOther"
                                value={formData.cityOther}
                                onChange={handleChange}
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white mt-2"
                                style={{ fontFamily: 'Heebo', '--tw-ring-color': '#1E65AD', minHeight: '48px' }}
                                placeholder="Enter city name"
                required
                              />
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1E65AD', fontFamily: 'Heebo' }}>
                              Registration ID *
                            </label>
                            <input
                              type="text"
                              name="registered_id"
                              value={formData.registered_id}
                onChange={handleChange}
                              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                              style={{ fontFamily: 'Heebo', '--tw-ring-color': '#1E65AD', minHeight: '48px' }}
                              placeholder="Enter registration number"
                              required
              />
            </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1E65AD', fontFamily: 'Heebo' }}>
                              Company Size *
                            </label>
              <select
                              name="company_size"
                              value={formData.company_size}
                              onChange={handleChange}
                              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                              style={{ fontFamily: 'Heebo', '--tw-ring-color': '#1E65AD', minHeight: '48px' }}
                required
                            >
                              <option value="">Select company size</option>
                              {companySizes.map(size => (
                                <option key={size} value={size}>{size} employees</option>
                              ))}
              </select>
            </div>
                        </>
                      )}

                      {selectedProfession === "Other" && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1E65AD', fontFamily: 'Heebo' }}>
                              Profession Type *
                            </label>
                <input
                  type="text"
                              name="profession_type"
                              value={formData.profession_type}
                  onChange={handleChange}
                              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                              style={{ fontFamily: 'Heebo', '--tw-ring-color': '#1E65AD', minHeight: '48px' }}
                              placeholder="Enter your profession type"
                              required
                />
              </div>
                        </>
                      )}

                      {/* Password Fields */}
                      {otpVerified && (
                        <>
                          <div>
                            <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1E65AD', fontFamily: 'Heebo' }}>
                              Password *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="w-5 h-5 text-gray-400" />
                              </div>
            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base ${fieldErrors.password ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1E65AD]'}`}
                                style={{ fontFamily: 'Heebo', minHeight: '48px' }}
                                placeholder="Create a strong password"
                                required
                              />
              <button
                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 flex items-center justify-center p-2 rounded-lg hover:bg-gray-100"
                                style={{ minHeight: '40px', minWidth: '40px' }}
              >
                                {showPassword ? <EyeOff className="w-5 h-5 stroke-[1.5]" /> : <Eye className="w-5 h-5 stroke-[1.5]" />}
              </button>
            </div>
            {fieldErrors.password && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600"
                style={{ fontFamily: 'Heebo' }}
              >
                {fieldErrors.password}
              </motion.p>
            )}
        </div>
                          <div>
                            <label className="block text-sm font-semibold mb-2.5" style={{ color: '#1E65AD', fontFamily: 'Heebo' }}>
                              Confirm Password *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="w-5 h-5 text-gray-400" />
                              </div>
                              <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={`w-full pl-12 pr-12 py-3.5 border-2 rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white text-sm sm:text-base ${fieldErrors.confirmPassword ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-[#1E65AD]'}`}
                                style={{ fontFamily: 'Heebo', minHeight: '48px' }}
                                placeholder="Confirm your password"
                                required
                              />
              <button
                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 flex items-center justify-center p-2 rounded-lg hover:bg-gray-100"
                                style={{ minHeight: '40px', minWidth: '40px' }}
              >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5 stroke-[1.5]" /> : <Eye className="w-5 h-5 stroke-[1.5]" />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600"
                style={{ fontFamily: 'Heebo' }}
              >
                {fieldErrors.confirmPassword}
              </motion.p>
            )}
          </div>
                        </>
                      )}

                    <motion.button
                      type="submit"
                      disabled={loading || !otpVerified}
                      whileHover={{ scale: loading || !otpVerified ? 1 : 1.02 }}
                      whileTap={{ scale: loading || !otpVerified ? 1 : 0.98 }}
                      className="w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-lg hover:shadow-xl"
                      style={{
                        background: loading || !otpVerified
                          ? 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)'
                          : 'linear-gradient(135deg, #1E65AD 0%, #1a5a9a 100%)',
                        fontFamily: 'Heebo',
                        minHeight: '52px'
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Creating Account...
                        </span>
                      ) : (
                        'Create Account'
                      )}
                    </motion.button>
                  </motion.form>
                )}

                {/* Already have an account? Sign In - Right Panel, Below Form */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="text-center mt-6"
                >
                  <p className="text-sm text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="font-semibold text-[#1E65AD] hover:text-[#1a5a9a] hover:underline transition-colors"
                      style={{ fontFamily: 'Roboto, sans-serif' }}
                    >
                      Sign In
                    </button>
                  </p>
                </motion.div>
              </div>
            </motion.div>
        </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
