
import React, { useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import HeroSection from '@/components/Home/HeroSection';
import CategorySection from '@/components/Home/CategorySection';
import JobsSection from '@/components/Home/JobsSection';
import HowItWorks from '@/components/Home/HowItWorks';
import JobPersonaReel from '@/components/JobPersona/JobPersonaReel';
import StatsSection from '@/components/Home/StatsSection';
import TestimonialsSection from '@/components/Home/TestimonialsSection';
import CTASection from '@/components/Home/CTASection';

const Index = () => {
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <HeroSection />
      
      {/* Stats Section */}
      <StatsSection />
      
      <CategorySection />
      
      {/* JobPersona AI Reel Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-medium mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
              Nouvelle Technologie IA
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Découvrez l'Avenir de la 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Recherche d'Emploi</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Voyez comment JobPersona AI révolutionne votre recherche d'emploi avec une automatisation intelligente, 
              un matching personnalisé et des capacités d'apprentissage continu qui s'adaptent à vos besoins.
            </p>
          </div>
          <JobPersonaReel />
        </div>
      </section>
      
      <JobsSection />
      <HowItWorks />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* Call to Action Section */}
      <CTASection />
    </Layout>
  );
};

export default Index;
