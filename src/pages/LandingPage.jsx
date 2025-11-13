import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Stats from "../components/landing/Stats";
import Features from "../components/landing/Features";
import VideoSection from "../components/landing/VideoSection";
import Testimonials from "../components/landing/Testimonials";
import BlogSection from "../components/landing/BlogSection";
import FAQ from "../components/landing/FAQ";
// import FreeTrialPopup from "../components/landing/FreeTrialPopup"; // Disabled - not needed now

function LandingPage() {
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
    <div className="font-sans bg-white overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>
      <Navbar />
      <Hero />
      <div id="features">
        <Features />
      </div>
      <Stats />
      <VideoSection />
      <Testimonials />
      <div id="blogs">
        <BlogSection />
      </div>
      <FAQ />
      {/* <FreeTrialPopup /> */}
    </div>
  );
}

export default LandingPage;


