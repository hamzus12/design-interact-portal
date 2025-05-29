
import React, { useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import HeroSection from '@/components/Home/HeroSection';
import CategorySection from '@/components/Home/CategorySection';
import JobsSection from '@/components/Home/JobsSection';
import HowItWorks from '@/components/Home/HowItWorks';
import JobPersonaReel from '@/components/JobPersona/JobPersonaReel';

const Index = () => {
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <HeroSection />
      <CategorySection />
      
      {/* JobPersona AI Reel Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Experience the Future of Job Hunting
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how JobPersona AI revolutionizes your job search with intelligent automation, 
              personalized matching, and continuous learning capabilities.
            </p>
          </div>
          <JobPersonaReel />
        </div>
      </section>
      
      <JobsSection />
      <HowItWorks />
    </Layout>
  );
};

export default Index;
