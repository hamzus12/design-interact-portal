
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, ChevronDown, Briefcase, User, LogIn, Users, PlusCircle, FileEdit, LayoutDashboard, LogOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserRole } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Navbar = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading, user, role, signOut } = useUserRole();
  const { user: authUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string): boolean => location.pathname === path;

  // Define navigation links based on user role
  const getNavLinks = () => {
    const baseLinks = [
      { name: 'Home', path: '/' },
      { name: 'Jobs', path: '/jobs' },
    ];
    
    // Add role-specific links
    if (role === 'admin') {
      return [
        ...baseLinks,
        { name: 'Candidates', path: '/candidates' },
        { name: 'Manage Users', path: '/manage-users' },
        { name: 'Blog', path: '/blog' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' },
      ];
    } else if (role === 'recruiter') {
      return [
        ...baseLinks,
        { name: 'Candidates', path: '/candidates' },
        { name: 'Post Job', path: '/add-job' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' },
      ];
    } else if (role === 'candidate') {
      return [
        ...baseLinks,
        { name: 'My Applications', path: '/my-applications' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' },
      ];
    } else {
      // Guest user
      return [
        ...baseLinks,
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' },
      ];
    }
  };

  const navLinks = getNavLinks();

  // Define dashboard links based on user role
  const getDashboardLinks = () => {
    const baseLinks = [
      { 
        name: 'Dashboard', 
        path: '/dashboard', 
        icon: LayoutDashboard 
      },
      { 
        name: 'Profile', 
        path: '/profile', 
        icon: User 
      },
    ];

    if (role === 'admin') {
      return [
        ...baseLinks,
        { name: 'Manage Users', path: '/manage-users', icon: Users },
        { name: 'Post Job', path: '/add-job', icon: PlusCircle },
      ];
    } else if (role === 'recruiter') {
      return [
        ...baseLinks,
        { name: 'Post Job', path: '/add-job', icon: PlusCircle },
      ];
    } else if (role === 'candidate') {
      return [
        ...baseLinks,
        { name: 'My Applications', path: '/my-applications', icon: FileEdit },
      ];
    }
    
    return baseLinks;
  };

  const dashboardLinks = getDashboardLinks();

  // Function to get user initials for avatar
  const getUserInitials = () => {
    if (user) {
      return ((user.firstName || '')[0] || '') + ((user.lastName || '')[0] || '');
    }
    return 'U';
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

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
            <Briefcase className="h-6 w-6 text-primary" />
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
          {!isLoading && !authUser && (
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
          {!isLoading && authUser && (
            <>
              {dashboardLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-gray-100 ${
                    isActive(link.path) ? 'bg-gray-100 text-primary' : 'text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.name}
                </Link>
              ))}
              <button
                className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-red-600 hover:bg-gray-100"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </button>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-white">
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
              {!isLoading && authUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary">
                      <span>Dashboard</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {dashboardLinks.map((link) => (
                      <DropdownMenuItem key={link.path} asChild>
                        <Link to={link.path} className="flex w-full cursor-pointer items-center">
                          <link.icon className="mr-2 h-4 w-4" />
                          {link.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
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
              {!isLoading && !authUser ? (
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
                !isLoading && authUser && (
                  <div className="flex items-center space-x-4">
                    {(role === 'recruiter' || role === 'admin') && (
                      <Button asChild>
                        <Link to="/add-job">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Post a Job
                        </Link>
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Avatar className="h-9 w-9 cursor-pointer">
                          <AvatarImage src={user?.profileImage} />
                          <AvatarFallback className="bg-primary text-white">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to="/profile" className="flex cursor-pointer items-center">
                            <User className="mr-2 h-4 w-4" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/dashboard" className="flex cursor-pointer items-center">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
