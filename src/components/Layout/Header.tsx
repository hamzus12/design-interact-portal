
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Moon, Sun, Menu, Shield } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from '@/components/ui/button';
import LanguageSelector from '@/components/LanguageSelector';
import { useAuth } from '@/context/AuthContext';
import { useUserRole } from '@/context/UserContext';

interface HeaderProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const Header = () => {
  const { setTheme } = useTheme();
  const { user } = useAuth();
  const { role } = useUserRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              JobPortal IA
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/jobs"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Emplois
            </Link>
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Tableau de Bord
                </Link>
                {(role === 'recruiter' || role === 'admin') && (
                  <Link
                    to="/candidates"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    Candidats
                  </Link>
                )}
                {role === 'admin' && (
                  <Link
                    to="/admin"
                    className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1"
                  >
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
              </>
            )}
            <Link
              to="/about"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              À Propos
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSelector />
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setTheme((prev) => (prev === "dark" ? "light" : "dark"))
            }
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <Briefcase className="h-6 w-6 text-primary" />
                <span className="font-bold">
                  JobPortal IA
                </span>
              </Link>
              <nav className="grid gap-6 text-sm font-medium">
                <Link
                  to="/jobs"
                  className="flex items-center space-x-2 transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  Emplois
                </Link>
                {user && (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                      Tableau de Bord
                    </Link>
                    {(role === 'recruiter' || role === 'admin') && (
                      <Link
                        to="/candidates"
                        className="flex items-center space-x-2 transition-colors hover:text-foreground/80 text-foreground/60"
                      >
                        Candidats
                      </Link>
                    )}
                    {role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 transition-colors hover:text-foreground/80 text-foreground/60"
                      >
                        <Shield className="w-4 h-4" />
                        Admin
                      </Link>
                    )}
                  </>
                )}
                <Link
                  to="/about"
                  className="flex items-center space-x-2 transition-colors hover:text-foreground/80 text-foreground/60"
                >
                  À Propos
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
