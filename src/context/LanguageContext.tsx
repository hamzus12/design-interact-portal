
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Simple translations for demonstration
const translations = {
  en: {
    'nav.home': 'Home',
    'nav.jobs': 'Jobs',
    'nav.about': 'About Us',
    'nav.contact': 'Contact',
    'nav.signin': 'Sign In',
    'nav.signup': 'Sign Up',
    'nav.dashboard': 'Dashboard',
    'jobs.title': 'Browse Jobs',
    'jobs.post': 'Post a Job',
    'jobs.noJobs': 'No jobs found',
    'jobs.adjust': 'Try adjusting your search filters.',
    'home.featuredJobs': 'Jobs You May Be Interested In'
    // Add more translations as needed
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.jobs': 'Emplois',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    'nav.signin': 'Se connecter',
    'nav.signup': 'S\'inscrire',
    'nav.dashboard': 'Tableau de bord',
    'jobs.title': 'Parcourir les emplois',
    'jobs.post': 'Publier un emploi',
    'jobs.noJobs': 'Aucun emploi trouvé',
    'jobs.adjust': 'Essayez d\'ajuster vos filtres de recherche.',
    'home.featuredJobs': 'Emplois qui pourraient vous intéresser'
    // Add more translations as needed
  },
  ar: {
    'nav.home': 'الرئيسية',
    'nav.jobs': 'الوظائف',
    'nav.about': 'من نحن',
    'nav.contact': 'اتصل بنا',
    'nav.signin': 'تسجيل الدخول',
    'nav.signup': 'إنشاء حساب',
    'nav.dashboard': 'لوحة التحكم',
    'jobs.title': 'تصفح الوظائف',
    'jobs.post': 'نشر وظيفة',
    'jobs.noJobs': 'لم يتم العثور على وظائف',
    'jobs.adjust': 'حاول ضبط عوامل تصفية البحث.',
    'home.featuredJobs': 'وظائف قد تهمك'
    // Add more translations as needed
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get language from localStorage or default to English
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return (savedLanguage && ['en', 'fr', 'ar'].includes(savedLanguage)) 
      ? savedLanguage as Language 
      : 'en';
  });

  useEffect(() => {
    // Save language preference to localStorage
    localStorage.setItem('language', language);
    
    // Set document direction for RTL language (Arabic)
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    
    // Set lang attribute
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
