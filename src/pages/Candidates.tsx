
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Briefcase, Heart, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface Candidate {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
  resume_url: string;
  created_at: string;
}

const Candidates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'candidate')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les candidats",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (candidateId: string) => {
    if (favorites.includes(candidateId)) {
      setFavorites(favorites.filter(id => id !== candidateId));
    } else {
      setFavorites([...favorites, candidateId]);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-purple-500', 'bg-blue-500', 'bg-red-500', 'bg-green-500', 
      'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-cyan-500'
    ];
    return colors[parseInt(id.slice(-1), 16) % colors.length];
  };

  const filteredCandidates = candidates.filter(candidate => 
    `${candidate.first_name} ${candidate.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (candidate.bio && candidate.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Layout>
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-600">Chargement des candidats...</div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h1 className="mb-8 text-center text-4xl font-bold text-gray-900 animate-fade-in">
            Browse Candidates
          </h1>
          
          {/* Search Bar */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="mx-auto flex max-w-xl rounded-md border border-gray-300 bg-white">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search candidates by name, skill, or location"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 pl-10 focus-visible:ring-0 focus-visible:ring-transparent"
                />
              </div>
              <Button className="rounded-l-none bg-red text-white hover:bg-red/90">
                Search
              </Button>
            </div>
          </div>
          
          {/* Candidates Grid */}
          {filteredCandidates.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow-md">
              <p className="text-gray-600">No candidates found matching your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCandidates.map((candidate, index) => (
                <div
                  key={candidate.id}
                  className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md animate-fade-in"
                  style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                >
                  <div className="relative flex flex-col items-center p-6 text-center">
                    <button
                      onClick={() => toggleFavorite(candidate.id)}
                      className="absolute right-4 top-4 rounded-full p-1 transition-colors hover:bg-gray-100"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          favorites.includes(candidate.id) ? 'fill-red text-red' : 'text-gray-400'
                        } transition-colors`}
                      />
                    </button>
                    
                    <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${getAvatarColor(candidate.id)} text-2xl font-bold text-white`}>
                      {getInitials(candidate.first_name, candidate.last_name)}
                    </div>
                    
                    <h3 className="mb-1 text-lg font-semibold text-gray-900">
                      {candidate.first_name} {candidate.last_name}
                    </h3>
                    
                    <div className="mb-3 flex items-center justify-center text-sm text-gray-600">
                      <Mail className="mr-1 h-4 w-4 text-gray-400" />
                      {candidate.email}
                    </div>
                    
                    {candidate.bio && (
                      <p className="mb-4 text-sm text-gray-600 line-clamp-3">
                        {candidate.bio}
                      </p>
                    )}
                    
                    <div className="mb-4 flex items-center justify-center text-sm text-gray-600">
                      <Briefcase className="mr-1 h-4 w-4 text-gray-400" />
                      Membre depuis {new Date(candidate.created_at).toLocaleDateString('fr-FR', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </div>
                    
                    {candidate.resume_url && (
                      <div className="flex flex-wrap justify-center gap-2 mb-4">
                        <Badge variant="outline" className="font-normal">
                          CV disponible
                        </Badge>
                      </div>
                    )}
                    
                    <Button
                      className="mt-4 w-full bg-red text-white hover:bg-red/90"
                      asChild
                    >
                      <a href={`/candidate/${candidate.id}`}>View Profile</a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Candidates;
