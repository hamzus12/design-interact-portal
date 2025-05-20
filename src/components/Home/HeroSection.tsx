
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const HeroSection: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword && !location) {
      toast.warning("Please enter a keyword or location to search");
      return;
    }
    
    // Navigate to jobs page with search parameters
    navigate(`/jobs?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`);
  };

  return (
    <div className="relative bg-gradient-to-r from-blue-600 to-primary pb-10 text-white">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ 
          backgroundImage: "url('/lovable-uploads/e5eb958d-d8b1-4f73-816a-be9a76386f2e.png')",
        }}
      ></div>
      
      {/* Content */}
      <div className="container relative mx-auto px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h3 className="mb-4 text-lg font-medium animate-fade-in">
            Trouvez des Emplois, Opportunités de Carrière
          </h3>
          
          <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl md:text-6xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Déposez Votre CV & <br /> Trouvez Votre Job Idéal!
          </h1>
          
          {/* Search Box */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <form onSubmit={handleSearch} className="mx-auto max-w-3xl overflow-hidden rounded-xl bg-white shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-7">
                {/* Keyword Search */}
                <div className="col-span-3 p-4">
                  <label htmlFor="keyword" className="mb-1 block text-left text-sm font-medium text-gray-700">
                    Mot-clé:
                  </label>
                  <input
                    type="text"
                    id="keyword"
                    placeholder="Titre du poste"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none"
                  />
                </div>
                
                {/* Location Search */}
                <div className="col-span-3 border-t md:border-l md:border-t-0 p-4">
                  <label htmlFor="location" className="mb-1 block text-left text-sm font-medium text-gray-700">
                    Lieu:
                  </label>
                  <input
                    type="text"
                    id="location"
                    placeholder="Ville ou Région"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none"
                  />
                </div>
                
                {/* Search Button */}
                <div className="col-span-1 flex items-end p-4">
                  <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90">
                    <Search className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">RECHERCHER</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
          
          {/* Trending Keywords */}
          <div className="mt-8 text-sm animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <p className="text-white/80">
              Recherches populaires: 
              <span className="ml-2 space-x-2">
                <a href="#" className="text-white underline decoration-dotted hover:text-primary-foreground">Informatique</a>,
                <a href="#" className="text-white underline decoration-dotted hover:text-primary-foreground">Éducation</a>,
                <a href="#" className="text-white underline decoration-dotted hover:text-primary-foreground">Santé</a> et
                <a href="#" className="text-white underline decoration-dotted hover:text-primary-foreground">Ingénierie</a>
              </span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Bottom curve */}
      <div className="absolute -bottom-1 left-0 h-10 w-full overflow-hidden">
        <svg 
          viewBox="0 0 500 150" 
          preserveAspectRatio="none" 
          style={{ height: '100%', width: '100%' }}
        >
          <path 
            d="M0.00,49.98 C150.00,150.00 349.20,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" 
            style={{ stroke: 'none', fill: 'white' }}
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
