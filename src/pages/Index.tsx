
import React, { useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import HeroSection from '@/components/Home/HeroSection';
import CategorySection from '@/components/Home/CategorySection';
import JobsSection from '@/components/Home/JobsSection';
import HowItWorks from '@/components/Home/HowItWorks';

const Index = () => {
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Layout>
      <HeroSection />
      <CategorySection />
      <JobsSection />
      <HowItWorks />
    </Layout>
  );
};

export default Index;
