import React from 'react';
import { useNavigate } from 'react-router-dom';
import Spline from '@splinetool/react-spline';

const Chatbot = () => {
  const navigate = useNavigate();

  const handleChatbotClick = () => {
    navigate('/legal-chatbot');
  };

  return (
    <div 
      className="fixed bottom-8 sm:bottom-6 md:bottom-2 right-3 sm:right-4 z-50 transition-transform duration-300 hover:scale-110 cursor-pointer"
      onClick={handleChatbotClick}
      style={{
        width: '200px',
        height: '150px',
        backgroundColor: 'transparent',
      }}
    >
      <Spline
        scene="https://prod.spline.design/vZcNPvy5-bMhs2LF/scene.splinecode"
        style={{
          width: '200px',
          height: '150px'
        }}
      />
    </div>
  );
};

export default Chatbot;

