import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Briefcase, Heart, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface CandidateProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  bio: string;
  skills: string[];
  experience_years: number;
  location: string;
  avatar_color: string;
  resume_url: string;
}

const Candidates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Fetch candidates from database
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('candidate_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching candidates:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les candidats",
          variant: "destructive"
        });
        return;
      }

      setCandidates(data || []);
    } catch (error) {
      console.error('Error:', error);
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

  const filteredCandidates = candidates.filter(candidate => 
    candidate.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const getJobTitle = (bio: string) => {
    // Extract job title from bio (first sentence usually contains it)
    const sentences = bio.split('.');
    if (sentences.length > 0) {
      const firstSentence = sentences[0];
      const match = firstSentence.match(/^(.+?)\s+avec/);
      return match ? match[1].trim() : 'Professionnel';
    }
    return 'Professionnel';
  };

  if (loading) {
    return (
      <Layout>
        <div className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red"></div>
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
            Parcourir les Candidats
          </h1>
          
          {/* Search Bar */}
          <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="mx-auto flex max-w-xl rounded-md border border-gray-300 bg-white">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Rechercher par nom, compétence ou localisation"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 pl-10 focus-visible:ring-0 focus-visible:ring-transparent"
                />
              </div>
              <Button className="rounded-l-none bg-red text-white hover:bg-red/90">
                Rechercher
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="mb-8 text-center">
            <p className="text-gray-600">
              {filteredCandidates.length} candidat{filteredCandidates.length > 1 ? 's' : ''} trouvé{filteredCandidates.length > 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Candidates Grid */}
          {filteredCandidates.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow-md">
              <p className="text-gray-600">
                {searchTerm ? 'Aucun candidat trouvé pour votre recherche.' : 'Aucun candidat disponible.'}
              </p>
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
                    
                    <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${candidate.avatar_color} text-2xl font-bold text-white`}>
                      {getInitials(candidate.first_name, candidate.last_name)}
                    </div>
                    
                    <h3 className="mb-1 text-lg font-semibold text-gray-900">
                      {candidate.first_name} {candidate.last_name}
                    </h3>
                    
                    <p className="mb-3 text-sm text-gray-600">{getJobTitle(candidate.bio)}</p>
                    
                    <div className="mb-3 flex items-center justify-center text-sm text-gray-600">
                      <MapPin className="mr-1 h-4 w-4 text-gray-400" />
                      {candidate.location}
                    </div>
                    
                    <div className="mb-3 flex items-center justify-center text-sm text-gray-600">
                      <Briefcase className="mr-1 h-4 w-4 text-gray-400" />
                      {candidate.experience_years} an{candidate.experience_years > 1 ? 's' : ''} d'expérience
                    </div>

                    <div className="mb-4 flex items-center justify-center text-sm text-gray-600">
                      <Mail className="mr-1 h-4 w-4 text-gray-400" />
                      {candidate.email}
                    </div>
                    
                    <div className="mb-4 flex flex-wrap justify-center gap-2">
                      {candidate.skills.slice(0, 3).map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="font-normal"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {candidate.skills.length > 3 && (
                        <Badge variant="outline" className="font-normal">
                          +{candidate.skills.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Bio preview */}
                    <p className="mb-4 text-xs text-gray-500 line-clamp-2">
                      {candidate.bio}
                    </p>
                    
                    <div className="flex gap-2 w-full">
                      <Button
                        className="flex-1 bg-red text-white hover:bg-red/90 text-sm"
                        asChild
                      >
                        <a href={`/candidate/${candidate.id}`}>Voir Profil</a>
                      </Button>
                      {candidate.resume_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer">
                            CV
                          </a>
                        </Button>
                      )}
                    </div>
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