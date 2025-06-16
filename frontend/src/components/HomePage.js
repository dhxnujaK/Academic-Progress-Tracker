import React from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from './landing/Hero';
import Features from './landing/Features';
import CTASection from './landing/CTASection';

const HomePage = () => {
    const navigate = useNavigate();

    return (
      <>
        <Hero />
        <Features />
        <CTASection />
      </>
    );
};

export default HomePage;