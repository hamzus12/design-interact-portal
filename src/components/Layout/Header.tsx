
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useUserRole } from '@/context/UserContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  LogOut, 
  Settings, 
  Briefcase, 
  MessageSquare,
  Plus,
  Search,
  Bell,
  ChevronDown
} from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();
  const { role } = useUserRole();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-lg group-hover:shadow-lg transition-all duration-300">
              J
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              JobPortal
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button variant="ghost" asChild className="text-gray-600 hover:text-blue-600 hover:bg-blue-50">
              <Link to="/jobs" className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Browse Jobs</span>
              </Link>
            </Button>
            
            {user && role === 'candidate' && (
              <Button variant="ghost" asChild className="text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                <Link to="/my-applications" className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4" />
                  <span>My Applications</span>
                </Link>
              </Button>
            )}
            
            {user && role === 'recruiter' && (
              <>
                <Button variant="ghost" asChild className="text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                  <Link to="/recruiter/dashboard" className="flex items-center space-x-2">
                    <Briefcase className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </Button>
                <Button variant="ghost" asChild className="text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                  <Link to="/recruiter/post-job" className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Post Job</span>
                  </Link>
                </Button>
              </>
            )}
            
            {user && (
              <Button variant="ghost" asChild className="text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                <Link to="/chat" className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Messages</span>
                </Link>
              </Button>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-blue-600 hover:bg-blue-50">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 hover:bg-red-500">
                    3
                  </Badge>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-50">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                          {getUserInitials(user.email || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium">{user.email?.split('@')[0]}</span>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {role}
                        </Badge>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-sm border-gray-200/50">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center space-x-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center space-x-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
