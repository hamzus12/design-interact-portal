
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

// Navbar component
const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'Candidates', path: '/candidates' },
    { name: 'Pages', path: '/pages', hasDropdown: true },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full bg-navy shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="text-xl font-bold text-white">
            <span className="flex items-center">
              <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-red"></span>
              Jovie
            </span>
          </div>
        </Link>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="text-white hover:text-gray-300"
            aria-controls="mobile-menu"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            {!isOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {navItems.map((item) => (
            <div key={item.name} className="relative">
              <Link
                to={item.path}
                className="nav-link flex items-center px-2 py-2 text-sm text-white transition-colors hover:text-gray-300"
              >
                {item.name}
                {item.hasDropdown && <ChevronDown className="ml-1 h-4 w-4" />}
              </Link>
            </div>
          ))}
        </div>

        {/* Sign In / Sign Up */}
        <div className="hidden items-center space-x-2 md:flex">
          <Button className="border border-white bg-transparent text-white hover:bg-white/10" variant="outline" asChild>
            <Link to="/signin">Sign In</Link>
          </Button>
          <Button className="bg-red text-white hover:bg-red/90" asChild>
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
        <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-navy-light"
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="mt-4 flex flex-col space-y-2 px-3">
            <Button className="w-full justify-center border border-white bg-transparent text-white hover:bg-white/10" variant="outline" asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
            <Button className="w-full justify-center bg-red text-white hover:bg-red/90" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
