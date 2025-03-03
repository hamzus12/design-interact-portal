
import React from 'react';
import Layout from '@/components/Layout/Layout';

const About = () => {
  return (
    <Layout>
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-6 text-center text-4xl font-bold text-gray-900 animate-fade-in">About Jovie</h1>
            
            <div className="rounded-lg bg-white p-8 shadow-md animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <p className="mb-4 text-gray-700">
                Jovie is a leading job portal connecting employers with talented individuals across various industries. Our platform is designed to simplify the job search process while providing valuable resources for career development.
              </p>
              
              <p className="mb-4 text-gray-700">
                Our mission is to bridge the gap between talented professionals and great companies. We believe that the right job can change a person's life, and the right talent can transform a business.
              </p>

              <h2 className="mb-4 mt-8 text-2xl font-semibold text-gray-900">What We Offer</h2>
              
              <ul className="mb-6 list-inside list-disc space-y-2 text-gray-700">
                <li>Comprehensive job listings across industries</li>
                <li>Advanced search and filtering tools</li>
                <li>Premium employer profiles</li>
                <li>Career advice and industry insights</li>
                <li>Resume building and optimization</li>
                <li>Interview preparation resources</li>
              </ul>

              <p className="text-gray-700">
                Whether you're a job seeker looking for your next career move or an employer searching for the perfect candidate, Jovie provides the tools and resources you need to succeed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
