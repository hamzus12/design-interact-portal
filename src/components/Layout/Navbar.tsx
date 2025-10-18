
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
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <nav className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 ${
      scrolled 
        ? 'border-b border-border/60 bg-background/95 backdrop-blur-xl shadow-lg shadow-primary/5' 
        : 'border-b border-transparent bg-transparent backdrop-blur-md'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Enhanced Logo */}
          <Link to="/" className="group flex items-center space-x-3 transition-transform duration-300 hover:scale-105">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-purple-600 to-primary shadow-lg shadow-primary/30 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/50 group-hover:rotate-6">
              <Briefcase className="h-6 w-6 text-white transition-transform duration-300 group-hover:scale-110" />
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-purple-600 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-50"></div>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
              JobFinder
            </span>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`group relative px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-xl ${
                  isActive(link.path)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }`}
              >
                <span className="flex items-center space-x-2 relative z-10">
                  <span>{link.label}</span>
                  {link.badge && link.badge > 0 && (
                    <Badge className="h-5 min-w-[20px] px-1.5 text-xs bg-primary text-primary-foreground animate-pulse">
                      {link.badge}
                    </Badge>
                  )}
                </span>
                
                {/* Animated underline */}
                {isActive(link.path) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-gradient-to-r from-primary to-purple-600 rounded-full"></span>
                )}
                
                {/* Hover effect */}
                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Link>
            ))}
          </div>

          {/* Enhanced Right Section */}
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:scale-110 transition-transform duration-300">
                    <Avatar className="h-10 w-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-primary via-purple-600 to-primary text-white font-bold">
                        {user.user_metadata?.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {unreadMessages > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-red-500 to-orange-500 border-2 border-background animate-pulse">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-background/95 backdrop-blur-xl border-border/50 shadow-xl" align="end" forceMount>
                  <div className="flex items-center justify-start gap-3 p-3 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-lg mb-2">
                    <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-bold">
                        {user.user_metadata?.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-bold text-foreground">
                        {user.user_metadata?.first_name} {user.user_metadata?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</p>
                      <Badge className="w-fit text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                        {role}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/10 transition-colors duration-200">
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-3 h-4 w-4" />
                      <span className="font-medium">Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/10 transition-colors duration-200">
                    <Link to="/chat" className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MessageSquare className="mr-3 h-4 w-4" />
                        <span className="font-medium">Messages</span>
                      </div>
                      {unreadMessages > 0 && (
                        <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-red-500 to-orange-500 animate-pulse">
                          {unreadMessages}
                        </Badge>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  {(role === 'recruiter' || role === 'admin') && (
                    <DropdownMenuItem asChild className="cursor-pointer hover:bg-primary/10 transition-colors duration-200">
                      <Link to="/candidates" className="flex items-center">
                        <Users className="mr-3 h-4 w-4" />
                        <span className="font-medium">Candidates</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors duration-200 font-semibold">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Button asChild variant="ghost" className="font-semibold hover:bg-primary/10 hover:text-primary transition-all duration-300">
                  <Link to="/signin">Sign In</Link>
                </Button>
                <Button asChild className="group relative bg-gradient-to-r from-primary via-purple-600 to-primary hover:from-primary/90 hover:via-purple-600/90 hover:to-primary/90 font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105 overflow-hidden">
                  <Link to="/signup">
                    <span className="relative z-10">Get Started</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  </Link>
                </Button>
              </div>
            )}

            {/* Enhanced Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-primary/10 transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-primary transition-transform duration-300 rotate-90" />
              ) : (
                <Menu className="h-6 w-6 transition-transform duration-300" />
              )}
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl animate-fade-in">
            <div className="space-y-2 py-6 px-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`group flex items-center justify-between px-4 py-3 text-base font-semibold rounded-xl transition-all duration-300 ${
                    isActive(link.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-1 h-6 rounded-full transition-all duration-300 ${
                      isActive(link.path) ? 'bg-primary' : 'bg-transparent group-hover:bg-primary/50'
                    }`}></span>
                    <span>{link.label}</span>
                  </span>
                  {link.badge && link.badge > 0 && (
                    <Badge className="h-6 min-w-[24px] px-2 text-xs bg-primary text-primary-foreground animate-pulse">
                      {link.badge}
                    </Badge>
                  )}
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
