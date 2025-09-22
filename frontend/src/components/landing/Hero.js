

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StudyingIllustration from '../../Studying-illustration.svg';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 to-blue-200 px-6 flex items-center justify-center">
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left side: Text */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-left px-4"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-blue-800 leading-tight mb-6">
            Welcome to <span className="text-cyan-600">TrackMate</span>
          </h1>
          <p className="text-gray-700 text-lg mb-8">
            Your academic companion to track GPA, study sessions, and weekly progress effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/register')}
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

        {/* Right side: Image */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="flex justify-center"
        >
          <img
              src={StudyingIllustration}
              alt="Student studying"
              className="w-full max-w-md"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;