import React from 'react';
import HeroContent from './HeroContent';
import heroBackground from '@/assets/hero-background.jpg';

const HeroSection: React.FC = () => {
  return (
    <div className="relative pb-24 overflow-hidden min-h-[90vh] flex items-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Soft animated background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-[450px] h-[450px] bg-secondary/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] opacity-30"></div>
      
      {/* Content */}
      <div className="container relative mx-auto px-4 py-16 md:py-24 z-10">
        <HeroContent />
      </div>
      
      {/* Soft wave divider */}
      <div className="absolute -bottom-1 left-0 w-full">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 md:h-24">
          <path d="M0,0 C150,80 350,0 600,50 C850,100 1050,20 1200,80 L1200,120 L0,120 Z" fill="hsl(var(--background))"></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
