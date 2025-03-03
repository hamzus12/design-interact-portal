
import React from 'react';
import { ArrowRight } from 'lucide-react';

const categories = [
  {
    id: 1,
    name: 'Accountancy',
    icon: '📊',
    jobs: 301,
    bgColor: 'bg-accounting',
    iconColor: 'text-red',
  },
  {
    id: 2,
    name: 'Education',
    icon: '🎓',
    jobs: 210,
    bgColor: 'bg-education',
    iconColor: 'text-blue-500',
  },
  {
    id: 3,
    name: 'Automotive Jobs',
    icon: '🚗',
    jobs: 281,
    bgColor: 'bg-automotive',
    iconColor: 'text-purple-500',
  },
  {
    id: 4,
    name: 'Business',
    icon: '💼',
    jobs: 122,
    bgColor: 'bg-business',
    iconColor: 'text-orange-500',
  },
  {
    id: 5,
    name: 'Health Care',
    icon: '❤️',
    jobs: 335,
    bgColor: 'bg-healthcare',
    iconColor: 'text-red',
  },
  {
    id: 6,
    name: 'IT & Agency',
    icon: '💻',
    jobs: 401,
    bgColor: 'bg-it',
    iconColor: 'text-blue-500',
  },
  {
    id: 7,
    name: 'Engineering',
    icon: '⚙️',
    jobs: 100,
    bgColor: 'bg-engineering',
    iconColor: 'text-red',
  },
  {
    id: 8,
    name: 'Legal',
    icon: '⚖️',
    jobs: 201,
    bgColor: 'bg-legal',
    iconColor: 'text-cyan-500',
  },
];

const CategorySection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl animate-fade-in">
            Choose Your Category
          </h2>
          <p className="text-gray-600 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
            labore et dolore magna aliqua. Quis ipsum suspendisse ultrices.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <div 
              key={category.id} 
              className="category-card animate-fade-in hover:border-red" 
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
            >
              <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full ${category.bgColor}`}>
                <span className="text-2xl">{category.icon}</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">{category.name}</h3>
              <p className="mb-4 text-gray-500">{category.jobs} open position</p>
              <a 
                href={`/jobs?category=${category.name}`} 
                className="group inline-flex items-center text-sm font-medium text-red"
              >
                Browse Jobs
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
