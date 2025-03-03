
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-navy py-12 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Jovie</h3>
            <p className="mb-4 text-gray-300">
              Find Jobs, Employment & Career Opportunities. Browse our jobs and apply for your next career opportunity today.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-300 transition-colors hover:text-red">About Us</Link>
              </li>
              <li>
                <Link to="/jobs" className="text-gray-300 transition-colors hover:text-red">Browse Jobs</Link>
              </li>
              <li>
                <Link to="/candidates" className="text-gray-300 transition-colors hover:text-red">Find Candidates</Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 transition-colors hover:text-red">Career Advice</Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">For Employers</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/post-job" className="text-gray-300 transition-colors hover:text-red">Post a Job</Link>
              </li>
              <li>
                <Link to="/employer-dashboard" className="text-gray-300 transition-colors hover:text-red">Employer Dashboard</Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 transition-colors hover:text-red">Pricing Plans</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-300">
                <span className="mr-2">📍</span> 123 Job Avenue, Career City
              </li>
              <li className="flex items-center text-gray-300">
                <span className="mr-2">📧</span> hello@jovie.com
              </li>
              <li className="flex items-center text-gray-300">
                <span className="mr-2">📞</span> +1 (555) 123-4567
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-gray-300">
          <p>© {new Date().getFullYear()} Jovie. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
