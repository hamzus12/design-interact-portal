
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { useUserRole } from '@/context/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

// Navbar component
const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, role, isLoading, signOut } = useUserRole();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'Candidates', path: '/candidates' },
    { name: 'Pages', path: '/pages', hasDropdown: true },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact Us', path: '/contact' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = () => {
    if (!user) return 'U';
    return ((user.firstName || '')[0] || '') + ((user.lastName || '')[0] || '');
  };

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

        {/* Sign In / Sign Up OR User Profile */}
        <div className="hidden items-center space-x-3 md:flex">
          <SignedIn>
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="text-white hover:text-gray-300 text-sm">
                Dashboard
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage} alt={user?.firstName} />
                      <AvatarFallback className="bg-primary text-white">{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground mt-1 capitalize">
                      Role: {role}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SignedIn>
          <SignedOut>
            <Button className="border border-white bg-transparent text-white hover:bg-white/10" variant="outline" asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
            <Button className="bg-red text-white hover:bg-red/90" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </SignedOut>
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
          
          <SignedIn>
            <div className="mt-3 space-y-1 border-t border-gray-700 pt-3">
              <Link 
                to="/dashboard" 
                className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-navy-light"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/profile" 
                className="block rounded-md px-3 py-2 text-base font-medium text-white hover:bg-navy-light"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
              <button 
                className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-red-400 hover:bg-navy-light"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          </SignedIn>
          <SignedOut>
            <div className="mt-4 flex flex-col space-y-2 px-3">
              <Button className="w-full justify-center border border-white bg-transparent text-white hover:bg-white/10" variant="outline" asChild>
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button className="w-full justify-center bg-red text-white hover:bg-red/90" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
