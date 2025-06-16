

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-100 to-blue-200 px-6 relative overflow-hidden">
      <div className="absolute text-[7rem] sm:text-[9rem] lg:text-[11rem] font-black text-blue-800 opacity-10 rotate-12 select-none">
        TrackMate
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="z-10 text-center max-w-xl"
      >
        <h1 className="text-5xl sm:text-6xl font-extrabold text-blue-800 mb-4">
          Welcome to <span className="text-cyan-600">TrackMate</span>
        </h1>
        <p className="text-gray-700 text-lg mb-8">
          Your academic companion to track GPA, study sessions, and weekly progress effortlessly.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            Get Started
          </button>
          <button
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="bg-white border border-blue-600 text-blue-700 font-semibold py-2 px-6 rounded-lg hover:bg-blue-50 transition-all"
          >
            Learn More
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;