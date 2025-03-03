
import React from 'react';
import { FileCheck, Search, UserCheck } from 'lucide-react';

const steps = [
  {
    id: 1,
    title: 'Create Account',
    description: 'Post a job to tell us about your project. We\'ll quickly match you with the right freelancers.',
    icon: FileCheck,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    id: 2,
    title: 'Find Jobs',
    description: 'Browse profiles, reviews, and proposals then interview top candidates for your job.',
    icon: Search,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    id: 3,
    title: 'Save & Apply',
    description: 'Use the Jovie platform to chat, share files, and collaborate from your desktop or on the go.',
    icon: UserCheck,
    color: 'bg-red-100 text-red-600',
  },
];

const HowItWorks = () => {
  return (
    <section className="relative overflow-hidden bg-navy py-24 text-white">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ 
          backgroundImage: "url('/lovable-uploads/e5eb958d-d8b1-4f73-816a-be9a76386f2e.png')",
        }}
      ></div>
      
      <div className="container relative mx-auto px-4">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl animate-fade-in">
            Easiest Way To Use
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className="relative rounded-lg border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 animate-fade-in"
              style={{ animationDelay: `${0.1 + index * 0.1}s` }}
            >
              <div className="mb-4">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${step.color}`}>
                  <step.icon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
              <p className="text-white/80">{step.description}</p>
              <div className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-lg font-bold">
                {step.id}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
