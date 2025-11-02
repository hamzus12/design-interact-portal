import React from 'react';
import HeroContent from './HeroContent';
import heroBackground from '@/assets/hero-background.jpg';

const HeroSection: React.FC = () => {
  return (
    <div className="relative pb-16 text-white overflow-hidden min-h-screen flex items-center">
      {/* Enhanced background with parallax effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
        style={{ 
          backgroundImage: `url(${heroBackground})`,
        }}
      ></div>
      
      {/* Multi-layer gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-purple-900/60 to-indigo-900/70"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
      
      {/* Animated mesh gradient blobs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-[550px] h-[550px] bg-indigo-500/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-pink-500/15 rounded-full mix-blend-overlay filter blur-3xl float-slow"></div>
      
      {/* Sparkle effects */}
      <div className="absolute top-[20%] left-[15%] w-2 h-2 bg-yellow-300 rounded-full sparkle" style={{ animationDelay: '0s' }}></div>
      <div className="absolute top-[40%] right-[20%] w-3 h-3 bg-blue-300 rounded-full sparkle" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-[30%] left-[70%] w-2 h-2 bg-purple-300 rounded-full sparkle" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[60%] left-[40%] w-2 h-2 bg-pink-300 rounded-full sparkle" style={{ animationDelay: '1.5s' }}></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* Content */}
      <div className="container relative mx-auto px-4 py-20 z-10">
        <HeroContent />
      </div>
      
      {/* Enhanced bottom curve with gradient */}
      <div className="absolute -bottom-1 left-0 h-24 w-full overflow-hidden">
        <svg 
          viewBox="0 0 500 150" 
          preserveAspectRatio="none" 
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
              <stop offset="100%" stopColor="white" />
            </linearGradient>
          </defs>
          <path 
            d="M0.00,49.98 C150.00,150.00 349.20,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" 
            fill="url(#curveGradient)"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
