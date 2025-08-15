
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const SearchSection: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword && !location) {
      toast.warning("Veuillez entrer un mot-clé ou un lieu pour rechercher");
      return;
    }
    
    navigate(`/jobs?keyword=${encodeURIComponent(keyword)}&location=${encodeURIComponent(location)}`);
  };

  return (
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
  );
};

export default SearchSection;
