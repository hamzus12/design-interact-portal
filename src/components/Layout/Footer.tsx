
import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">JobFinder</span>
            </Link>
            <p className="text-gray-300 leading-relaxed">
              Connecting talented professionals with amazing opportunities. 
              Find your dream job or discover the perfect candidate for your team.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:scale-110">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:scale-110">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:scale-110">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:scale-110">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">For Job Seekers</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/jobs" className="text-gray-300 transition-colors hover:text-white hover:underline">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-gray-300 transition-colors hover:text-white hover:underline">
                  Create Profile
                </Link>
              </li>
              <li>
                <Link to="/my-applications" className="text-gray-300 transition-colors hover:text-white hover:underline">
                  My Applications
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-gray-300 transition-colors hover:text-white hover:underline">
                  Career Chat
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">For Employers</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/add-job" className="text-gray-300 transition-colors hover:text-white hover:underline">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link to="/candidates" className="text-gray-300 transition-colors hover:text-white hover:underline">
                  Find Talent
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 transition-colors hover:text-white hover:underline">
                  Employer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 transition-colors hover:text-white hover:underline">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-300">
                <MapPin className="mr-3 h-5 w-5 text-blue-400" />
                <span>123 Innovation Drive, Tech City, TC 12345</span>
              </li>
              <li className="flex items-center text-gray-300">
                <Mail className="mr-3 h-5 w-5 text-blue-400" />
                <a href="mailto:hello@jobfinder.com" className="hover:text-white transition-colors">
                  hello@jobfinder.com
                </a>
              </li>
              <li className="flex items-center text-gray-300">
                <Phone className="mr-3 h-5 w-5 text-blue-400" />
                <a href="tel:+1234567890" className="hover:text-white transition-colors">
                  +1 (234) 567-8900
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-700 pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} JobFinder. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
