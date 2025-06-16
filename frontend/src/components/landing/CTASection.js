

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 py-16 px-6 text-white text-center">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl sm:text-4xl font-extrabold mb-4"
      >
        Ready to boost your academic journey?
      </motion.h2>
      <p className="text-lg mb-8">
        Join thousands of students using TrackMate to track their GPA, manage modules, and stay on top of study sessions.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={() => navigate('/register')}
          className="bg-white text-blue-600 font-semibold py-2 px-6 rounded-lg hover:bg-blue-50 transition"
        >
          Get Started
        </button>
        <button
          onClick={() => navigate('/login')}
          className="border border-white text-white font-semibold py-2 px-6 rounded-lg hover:bg-white hover:text-blue-600 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default CTASection;