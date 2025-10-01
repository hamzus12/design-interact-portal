import React from 'react';
import HeroContent from './HeroContent';
import heroBackground from '@/assets/hero-background.jpg';

const HeroSection: React.FC = () => {
  return (
    <div className="relative pb-16 text-white overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(${heroBackground})`,
        }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-purple-900/50 to-indigo-900/60"></div>
      
      {/* Subtle animated overlay */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
      
      {/* Content */}
      <div className="container relative mx-auto px-4 py-20">
        <HeroContent />
      </div>
      
      {/* Bottom curve */}
      <div className="absolute -bottom-1 left-0 h-16 w-full overflow-hidden">
        <svg 
          viewBox="0 0 500 150" 
          preserveAspectRatio="none" 
          className="h-full w-full"
        >
          <path 
            d="M0.00,49.98 C150.00,150.00 349.20,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" 
            className="fill-white"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
