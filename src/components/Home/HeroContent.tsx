
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
      {/* Enhanced announcement badge */}
      <div className="mb-8 animate-fade-in">
        <Badge className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-white/20 to-white/10 text-white border border-white/30 hover:from-white/30 hover:to-white/20 backdrop-blur-xl transition-all duration-500 shadow-lg hover:shadow-2xl hover:scale-105 glow-button">
          <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
          <span className="font-semibold">Nouveau : IA JobPersona Disponible</span>
        </Badge>
      </div>
      
      <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-xl md:text-2xl font-semibold text-white/95 mb-6 flex items-center justify-center gap-2 animate-bounce-gentle">
          <span className="text-3xl">🇹🇳</span>
          <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
            Première Plateforme d'Emploi IA en Tunisie
          </span>
        </h3>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-8 tracking-tight">
          <span className="block mb-2 animate-fade-in">Trouvez Votre</span>
          <span className="block hero-gradient-text text-6xl md:text-8xl lg:text-9xl mb-2 filter drop-shadow-2xl">
            Emploi Idéal
          </span>
          <span className="block text-4xl md:text-6xl lg:text-7xl bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Avec l'Intelligence Artificielle
          </span>
        </h1>
      </div>
      
      <p className="text-xl md:text-2xl lg:text-3xl text-white/90 max-w-4xl mx-auto mb-10 leading-relaxed animate-fade-in font-light" style={{ animationDelay: '0.3s' }}>
        Révolutionnez votre recherche d'emploi avec notre 
        <span className="font-semibold text-yellow-300"> IA avancée</span>. 
        <br className="hidden md:block" />
        Matching intelligent, candidatures automatisées, et coaching personnalisé.
      </p>
      
      {/* Enhanced quick stats */}
      <div className="flex flex-wrap justify-center gap-6 mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        {quickStats.map((stat, index) => (
          <div 
            key={index} 
            className="group flex items-center space-x-3 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-110 hover:shadow-2xl cursor-pointer"
            style={{ animationDelay: `${0.5 + index * 0.1}s` }}
          >
            <div className="text-yellow-300 group-hover:scale-125 transition-transform duration-300">{stat.icon}</div>
            <span className="font-black text-2xl bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">{stat.value}</span>
            <span className="text-white/90 text-base font-medium">{stat.label}</span>
          </div>
        ))}
      </div>
      
      <SearchSection />
      
      {/* Enhanced action buttons */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <Button 
          size="lg"
          className="group relative bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 hover:from-yellow-500 hover:via-orange-600 hover:to-yellow-500 text-gray-900 font-black px-10 py-7 rounded-2xl shadow-2xl hover:shadow-yellow-500/50 transition-all duration-500 hover:scale-110 glow-button text-lg overflow-hidden"
          onClick={() => navigate('/create-job-persona')}
          style={{ animation: 'glow-pulse 2s ease-in-out infinite' }}
        >
          <Sparkles className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
          <span className="relative z-10">Créer Mon IA JobPersona</span>
        </Button>
        
        <VideoDemo />
      </div>
      
      {/* Enhanced trending keywords */}
      <div className="text-center animate-fade-in" style={{ animationDelay: '0.7s' }}>
        <p className="text-white/90 mb-6 text-xl font-semibold flex items-center justify-center gap-2">
          <span className="text-2xl animate-pulse">🔥</span>
          <span>Recherches populaires</span>
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {trendingKeywords.map((keyword, index) => (
            <button
              key={index}
              onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(keyword)}`)}
              className="group px-6 py-3 bg-gradient-to-br from-white/15 to-white/5 hover:from-white/25 hover:to-white/15 backdrop-blur-xl text-white rounded-full text-base font-semibold transition-all duration-500 hover:scale-110 border border-white/20 hover:border-white/40 shadow-lg hover:shadow-2xl"
              style={{ animationDelay: `${0.8 + index * 0.05}s` }}
            >
              <span className="relative z-10">{keyword}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
