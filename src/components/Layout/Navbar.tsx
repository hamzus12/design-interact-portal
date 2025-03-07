
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/clerk-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, ChevronDown, Briefcase, User, LogIn, Users } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';
import { useUserRole } from '@/context/UserContext';

const Navbar = () => {
  const isMobile = useMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading, user, role } = useUserRole();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string): boolean => location.pathname === path;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'Candidates', path: '/candidates' },
    { name: 'Blog', path: '/blog' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const MobileMenu = () => (
    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
            <span className="text-xl font-bold">JobConnect</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="mt-8 flex flex-col space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 ${
                isActive(link.path) ? 'bg-gray-100 text-primary' : 'text-gray-700'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {!isLoading && !user && (
            <>
              <Link
                to="/signin"
                className="rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-primary px-3 py-2 text-center text-sm font-medium text-white hover:bg-primary/90"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
          {!isLoading && user && (
            <>
              <Link
                to="/dashboard"
                className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 ${
                  isActive('/dashboard') ? 'bg-gray-100 text-primary' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              {role === 'candidate' && (
                <Link
                  to="/my-applications"
                  className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 ${
                    isActive('/my-applications') ? 'bg-gray-100 text-primary' : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Applications
                </Link>
              )}
              {(role === 'recruiter' || role === 'admin') && (
                <Link
                  to="/add-job"
                  className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 ${
                    isActive('/add-job') ? 'bg-gray-100 text-primary' : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Post a Job
                </Link>
              )}
              {role === 'admin' && (
                <Link
                  to="/manage-users"
                  className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 ${
                    isActive('/manage-users') ? 'bg-gray-100 text-primary' : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Manage Users
                </Link>
              )}
              <Link
                to="/profile"
                className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 ${
                  isActive('/profile') ? 'bg-gray-100 text-primary' : 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Profile
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="flex h-16 items-center border-b bg-white">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">JobConnect</span>
          </Link>

          {!isMobile && (
            <nav className="flex space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium hover:text-primary ${
                    isActive(link.path) ? 'text-primary' : 'text-gray-700'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {!isLoading && user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary">
                      <span>More</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex w-full cursor-pointer items-center">
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {role === 'candidate' && (
                      <DropdownMenuItem asChild>
                        <Link to="/my-applications" className="flex w-full cursor-pointer items-center">
                          My Applications
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {(role === 'recruiter' || role === 'admin') && (
                      <DropdownMenuItem asChild>
                        <Link to="/add-job" className="flex w-full cursor-pointer items-center">
                          Post a Job
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link to="/manage-users" className="flex w-full cursor-pointer items-center">
                          Manage Users
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex w-full cursor-pointer items-center">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {isMobile ? (
            <MobileMenu />
          ) : (
            <>
              {!isLoading && !user ? (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/signin" className="hidden sm:flex">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/signup" className="hidden sm:flex">
                      <User className="mr-2 h-4 w-4" />
                      Sign Up
                    </Link>
                  </Button>
                </>
              ) : (
                !isLoading && (
                  <div className="flex items-center space-x-4">
                    {(role === 'recruiter' || role === 'admin') && (
                      <Button asChild>
                        <Link to="/add-job">Post a Job</Link>
                      </Button>
                    )}
                    <UserButton afterSignOutUrl="/" />
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
