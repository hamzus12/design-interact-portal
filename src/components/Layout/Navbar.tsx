
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUserRole } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  User, 
  LogOut, 
  Menu, 
  X, 
  MessageSquare,
  Users,
  Settings,
  Bell
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { role } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [applicationCount, setApplicationCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Get database user ID
  const getDatabaseUserId = async (authUserId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', authUserId)
        .single();
      
      if (error || !data) return null;
      return data.id;
    } catch (err) {
      return null;
    }
  };

  // Load application count for candidates
  useEffect(() => {
    const loadApplicationCount = async () => {
      if (!user?.id || role !== 'candidate') return;
      
      try {
        const dbUserId = await getDatabaseUserId(user.id);
        if (!dbUserId) return;
        
        const { data, error } = await supabase
          .from('applications')
          .select('id')
          .eq('candidate_id', dbUserId);
        
        if (!error && data) {
          setApplicationCount(data.length);
        }
      } catch (error) {
        console.error('Error loading application count:', error);
      }
    };

    loadApplicationCount();
  }, [user?.id, role]);

  // Load unread messages count
  useEffect(() => {
    const loadUnreadCount = async () => {
      if (!user?.id) return;
      
      try {
        const dbUserId = await getDatabaseUserId(user.id);
        if (!dbUserId) return;
        
        // Get conversations for this user
        const { data: conversations } = await supabase
          .from('conversations')
          .select('id')
          .or(`candidate_id.eq.${dbUserId},recruiter_id.eq.${dbUserId}`);
        
        if (!conversations) return;
        
        const conversationIds = conversations.map(c => c.id);
        
        // Count unread messages in these conversations
        const { data: unreadData } = await supabase
          .from('chat_messages')
          .select('id')
          .in('conversation_id', conversationIds)
          .neq('sender_id', dbUserId)
          .eq('is_read', false);
        
        if (unreadData) {
          setUnreadMessages(unreadData.length);
        }
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();
    
    // Set up realtime subscription for new messages
    if (user?.id) {
      const channel = supabase
        .channel('navbar-updates')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages' },
          () => loadUnreadCount()
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'applications' },
          () => {
            if (role === 'candidate') {
              setApplicationCount(prev => prev + 1);
            }
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, role]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/jobs', label: 'Jobs' },
    ...(user ? [
      { path: '/chat', label: 'Messages', badge: unreadMessages },
      ...(role === 'candidate' ? [
        { path: '/my-applications', label: 'Applications', badge: applicationCount },
        { path: '/interview-practice', label: 'Simulation' }
      ] : []),
      ...(role === 'recruiter' || role === 'admin' ? [
        { path: '/candidates', label: 'Candidates' }
      ] : []),
      { path: '/dashboard', label: 'Dashboard' }
    ] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-lg dark:border-gray-700/50 dark:bg-gray-900/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              JobFinder
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link relative px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                }`}
              >
                <span className="flex items-center space-x-1">
                  <span>{link.label}</span>
                  {link.badge && link.badge > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">
                      {link.badge}
                    </Badge>
                  )}
                </span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                        {user.user_metadata?.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {unreadMessages > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">
                        {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <Badge variant="outline" className="w-fit text-xs">
                        {role}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/chat" className="cursor-pointer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Messages
                      {unreadMessages > 0 && (
                        <Badge className="ml-auto h-5 w-5 p-0 text-xs">
                          {unreadMessages}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  {(role === 'recruiter' || role === 'admin') && (
                    <DropdownMenuItem asChild>
                      <Link to="/candidates" className="cursor-pointer">
                        <Users className="mr-2 h-4 w-4" />
                        Candidates
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Link to="/signup">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-1 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center justify-between">
                    <span>{link.label}</span>
                    {link.badge && link.badge > 0 && (
                      <Badge variant="secondary" className="h-5 min-w-[20px] px-1.5 text-xs">
                        {link.badge}
                      </Badge>
                    )}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
