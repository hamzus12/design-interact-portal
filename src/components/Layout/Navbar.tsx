
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Menu, 
  X, 
  ChevronDown, 
  Briefcase, 
  User, 
  LogIn, 
  Users, 
  PlusCircle, 
  FileEdit, 
  LayoutDashboard, 
  LogOut,
  Search,
  MessageCircle,
  Bell
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserRole } from '@/context/UserContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '@/context/LanguageContext';

const Navbar = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading, user, role, signOut } = useUserRole();
  const { user: authUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  const isActive = (path: string): boolean => location.pathname === path;

  // Define navigation links based on user role
  const getNavLinks = () => {
    const baseLinks = [
      { name: 'Home', path: '/', icon: LayoutDashboard },
      { name: 'Jobs', path: '/jobs', icon: Search },
    ];
    
    // Add role-specific links
    if (role === 'admin') {
      return [
        ...baseLinks,
        { name: 'Candidates', path: '/candidates', icon: Users },
        { name: 'Chat', path: '/chat', icon: MessageCircle },
        { name: 'About', path: '/about', icon: FileEdit },
      ];
    } else if (role === 'recruiter') {
      return [
        ...baseLinks,
        { name: 'Candidates', path: '/candidates', icon: Users },
        { name: 'Chat', path: '/chat', icon: MessageCircle },
        { name: 'About', path: '/about', icon: FileEdit },
      ];
    } else if (role === 'candidate') {
      return [
        ...baseLinks,
        { name: 'Applications', path: '/my-applications', icon: FileEdit },
        { name: 'Chat', path: '/chat', icon: MessageCircle },
        { name: 'About', path: '/about', icon: FileEdit },
      ];
    } else {
      // Guest user
      return [
        ...baseLinks,
        { name: 'About', path: '/about', icon: FileEdit },
        { name: 'Contact', path: '/contact', icon: MessageCircle },
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
      <SheetContent side="left" className="w-80">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3" onClick={() => setIsMenuOpen(false)}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              JobFinder
            </span>
          </Link>
        </div>
        <nav className="mt-8 flex flex-col space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-800 ${
                isActive(link.path) 
                  ? 'bg-blue-50 text-blue-600 dark:bg-gray-800 dark:text-blue-400' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <link.icon className="mr-3 h-5 w-5" />
              {t(`nav.${link.name.toLowerCase().replace(' ', '')}`)}
            </Link>
          ))}
          
          {!isLoading && !authUser && (
            <div className="mt-6 space-y-2">
              <Link
                to="/signin"
                className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                <LogIn className="mr-3 h-5 w-5" />
                {t('nav.signin')}
              </Link>
              <Link
                to="/signup"
                className="flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-center text-sm font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="mr-3 h-5 w-5" />
                {t('nav.signup')}
              </Link>
            </div>
          )}
          
          {!isLoading && authUser && (
            <div className="mt-6 space-y-2">
              {dashboardLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-800 ${
                    isActive(link.path) 
                      ? 'bg-blue-50 text-blue-600 dark:bg-gray-800 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <link.icon className="mr-3 h-5 w-5" />
                  {link.name}
                </Link>
              ))}
              <button
                className="flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                onClick={handleSignOut}
              >
                <LogOut className="mr-3 h-5 w-5" />
                {t('nav.signout')}
              </button>
            </div>
          )}
          
          <div className="mt-8 flex items-center justify-center space-x-4 border-t pt-6">
            <ThemeToggle />
            <LanguageSelector />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-200/50 dark:bg-gray-900/80 dark:border-gray-800/50">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              JobFinder
            </span>
          </Link>

          {!isMobile && (
            <nav className="flex space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 dark:hover:bg-gray-800 ${
                    isActive(link.path) 
                      ? 'text-blue-600 bg-blue-50 dark:bg-gray-800 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <link.icon className="mr-2 h-4 w-4" />
                  {t(`nav.${link.name.toLowerCase().replace(' ', '')}`)}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {!isMobile && (
            <>
              <ThemeToggle />
              <LanguageSelector />
            </>
          )}
          
          {isMobile ? (
            <MobileMenu />
          ) : (
            <>
              {!isLoading && !authUser ? (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" asChild className="hidden sm:flex">
                    <Link to="/signin">
                      <LogIn className="mr-2 h-4 w-4" />
                      {t('nav.signin')}
                    </Link>
                  </Button>
                  <Button asChild className="hidden sm:flex bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
                    <Link to="/signup">
                      <User className="mr-2 h-4 w-4" />
                      {t('nav.signup')}
                    </Link>
                  </Button>
                </div>
              ) : (
                !isLoading && authUser && (
                  <div className="flex items-center space-x-4">
                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-xs"></span>
                    </Button>
                    
                    {(role === 'recruiter' || role === 'admin') && (
                      <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200">
                        <Link to="/add-job">
                          <PlusCircle className="mr-2 h-4 w-4" />
                          {t('jobs.post')}
                        </Link>
                      </Button>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="flex items-center space-x-3 cursor-pointer rounded-xl p-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200">
                          <Avatar className="h-9 w-9 ring-2 ring-blue-100 dark:ring-gray-700">
                            <AvatarImage src={user?.profileImage} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold">
                              {getUserInitials()}
                            </AvatarFallback>
                          </Avatar>
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-xl border-gray-200/50 dark:bg-gray-900/95 dark:border-gray-700/50">
                        <div className="px-3 py-2">
                          <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-gray-500 capitalize">{role}</p>
                        </div>
                        <DropdownMenuSeparator />
                        {dashboardLinks.map((link) => (
                          <DropdownMenuItem key={link.path} asChild>
                            <Link to={link.path} className="flex w-full cursor-pointer items-center dark:text-gray-300 dark:hover:text-white">
                              <link.icon className="mr-3 h-4 w-4" />
                              {link.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 dark:text-red-400">
                          <LogOut className="mr-3 h-4 w-4" />
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
