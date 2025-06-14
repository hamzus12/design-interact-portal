
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Play, TrendingUp, Users, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const HeroSection: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword && !location) {
      toast.warning("Veuillez entrer un mot-clé ou un lieu pour rechercher");
      return;
    }
    
    // Navigate to jobs page with search parameters
    navigate(`/jobs?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`);
  };

  const trendingKeywords = [
    "Développeur Web", "Marketing Digital", "Data Analyst", "Chef de Projet", "Designer UX/UI"
  ];

  const quickStats = [
    { icon: <Users className="h-4 w-4" />, value: "50K+", label: "Candidats" },
    { icon: <TrendingUp className="h-4 w-4" />, value: "95%", label: "Réussite" },
    { icon: <Sparkles className="h-4 w-4" />, value: "AI", label: "Powered" }
  ];

  return (
    <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 pb-16 text-white overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ 
          backgroundImage: "url('/lovable-uploads/e5eb958d-d8b1-4f73-816a-be9a76386f2e.png')",
        }}
      ></div>
      
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      
      {/* Content */}
      <div className="container relative mx-auto px-4 py-20">
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
          
          {/* Search Box */}
          <div className="mt-8 mb-10 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <form onSubmit={handleSearch} className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-7">
                {/* Keyword Search */}
                <div className="col-span-3 p-6">
                  <label htmlFor="keyword" className="mb-2 block text-left text-sm font-medium text-gray-700">
                    💼 Poste recherché:
                  </label>
                  <input
                    type="text"
                    id="keyword"
                    placeholder="Ex: Développeur, Marketing, Designer..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                
                {/* Location Search */}
                <div className="col-span-3 border-t md:border-l md:border-t-0 p-6">
                  <label htmlFor="location" className="mb-2 block text-left text-sm font-medium text-gray-700">
                    📍 Lieu:
                  </label>
                  <input
                    type="text"
                    id="location"
                    placeholder="Tunis, Sfax, Sousse, Kairouan..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                
                {/* Search Button */}
                <div className="col-span-1 flex items-end p-6">
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    <span className="hidden sm:inline">RECHERCHER</span>
                    <span className="sm:hidden">GO</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
          
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
            
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm px-8 py-4 rounded-xl font-semibold transition-all duration-300"
            >
              <Play className="mr-2 h-5 w-5" />
              Voir la Démo
            </Button>
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
      </div>
      
      {/* Bottom curve */}
      <div className="absolute -bottom-1 left-0 h-16 w-full overflow-hidden">
        <svg 
          viewBox="0 0 500 150" 
          preserveAspectRatio="none" 
          className="h-full w-full"
        >
          <path 
            d="M0.00,49.98 C150.00,150.00 349.20,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" 
            className="fill-white"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
