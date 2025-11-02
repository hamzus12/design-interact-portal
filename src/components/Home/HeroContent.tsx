
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchSection from './SearchSection';
import VideoDemo from './VideoDemo';

const HeroContent: React.FC = () => {
  const navigate = useNavigate();

  const quickStats = [
    { icon: <Users className="h-4 w-4" />, value: "50K+", label: "Candidats" },
    { icon: <TrendingUp className="h-4 w-4" />, value: "95%", label: "Réussite" },
    { icon: <Sparkles className="h-4 w-4" />, value: "IA", label: "Powered" }
  ];

  const trendingKeywords = [
    "Développeur Web", "Marketing Digital", "Data Analyst", "Chef de Projet", "Designer UX/UI"
  ];

  return (
    <div className="mx-auto max-w-6xl text-center">
      {/* Modern announcement badge */}
      <div className="mb-10 animate-fade-in">
        <Badge variant="soft" className="inline-flex items-center px-6 py-2.5 text-sm">
          <Sparkles className="w-4 h-4 mr-2" />
          <span className="font-semibold">Nouveau : IA JobPersona Disponible</span>
        </Badge>
      </div>
      
      <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-4xl">🇹🇳</span>
          <h3 className="text-lg md:text-xl font-medium text-muted-foreground">
            Première Plateforme d'Emploi IA en Tunisie
          </h3>
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight">
          <span className="block mb-3 text-foreground">Trouvez Votre</span>
          <span className="block bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent text-6xl md:text-7xl lg:text-8xl mb-3">
            Emploi Idéal
          </span>
          <span className="block text-3xl md:text-4xl lg:text-5xl text-muted-foreground font-normal">
            Avec l'Intelligence Artificielle
          </span>
        </h1>
      </div>
      
      <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
        Révolutionnez votre recherche d'emploi avec notre 
        <span className="font-semibold text-primary"> IA avancée</span>. 
        <br className="hidden md:block" />
        Matching intelligent, candidatures automatisées, et coaching personnalisé.
      </p>
      
      {/* Clean quick stats */}
      <div className="flex flex-wrap justify-center gap-8 mb-14 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        {quickStats.map((stat, index) => (
          <div 
            key={index} 
            className="flex items-center gap-3 group"
          >
            <div className="text-primary group-hover:scale-110 transition-transform duration-200">{stat.icon}</div>
            <div className="text-left">
              <div className="font-bold text-2xl text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
      
      <SearchSection />
      
      {/* Clean action buttons */}
      <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-16 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <Button 
          size="lg"
          className="group px-8 py-6 h-auto text-base"
          onClick={() => navigate('/create-job-persona')}
        >
          <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
          Créer Mon IA JobPersona
        </Button>
        
        <VideoDemo />
      </div>
      
      {/* Clean trending keywords */}
      <div className="text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <p className="text-muted-foreground mb-6 text-sm font-medium flex items-center justify-center gap-2">
          <span>🔥</span>
          <span>Recherches populaires</span>
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {trendingKeywords.map((keyword, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 hover:border-primary transition-all px-4 py-2"
              onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(keyword)}`)}
            >
              {keyword}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
