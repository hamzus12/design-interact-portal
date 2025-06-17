
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
    <div className="mx-auto max-w-5xl text-center">
      {/* Announcement badge */}
      <div className="mb-8 animate-fade-in">
        <Badge className="inline-flex items-center px-4 py-2 bg-white/20 text-white border-white/30 hover:bg-white/30 transition-all duration-300">
          <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
          Nouveau : IA JobPersona Disponible
        </Badge>
      </div>
      
      <div className="mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-lg md:text-xl font-medium text-white/90 mb-4">
          🇹🇳 Première Plateforme d'Emploi IA en Tunisie
        </h3>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
          Trouvez Votre 
          <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"> Emploi Idéal</span>
          <br />Avec l'Intelligence Artificielle
        </h1>
      </div>
      
      <p className="text-xl md:text-2xl text-white/80 max-w-4xl mx-auto mb-8 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
        Révolutionnez votre recherche d'emploi avec notre IA avancée. 
        Matching intelligent, candidatures automatisées, et coaching personnalisé.
      </p>
      
      {/* Quick stats */}
      <div className="flex flex-wrap justify-center gap-6 mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        {quickStats.map((stat, index) => (
          <div key={index} className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="text-yellow-300">{stat.icon}</div>
            <span className="font-bold text-lg">{stat.value}</span>
            <span className="text-white/80 text-sm">{stat.label}</span>
          </div>
        ))}
      </div>
      
      <SearchSection />
      
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <Button 
          size="lg"
          className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          onClick={() => navigate('/create-job-persona')}
        >
          <Sparkles className="mr-2 h-5 w-5" />
          Créer Mon IA JobPersona
        </Button>
        
        <VideoDemo />
      </div>
      
      {/* Trending Keywords */}
      <div className="text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <p className="text-white/80 mb-4 text-lg">
          🔥 Recherches populaires: 
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {trendingKeywords.map((keyword, index) => (
            <button
              key={index}
              onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(keyword)}`)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
            >
              {keyword}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
