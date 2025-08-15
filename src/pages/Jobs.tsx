
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import JobCard from '@/components/Jobs/JobCard';
import FilterSection from '@/components/Jobs/FilterSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Briefcase, MapPin, Filter, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/Job';
import { useAuth } from '@clerk/clerk-react';

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Popular categories for quick filtering
  const popularCategories = [
    { name: 'Développement Web', count: '150+', color: 'bg-blue-100 text-blue-700' },
    { name: 'Marketing Digital', count: '89+', color: 'bg-green-100 text-green-700' },
    { name: 'Design UI/UX', count: '65+', color: 'bg-purple-100 text-purple-700' },
    { name: 'Data Science', count: '42+', color: 'bg-orange-100 text-orange-700' },
    { name: 'Chef de Projet', count: '38+', color: 'bg-pink-100 text-pink-700' },
  ];

  const jobStats = [
    { icon: <Briefcase className="h-5 w-5" />, value: '2,500+', label: 'Offres Actives' },
    { icon: <Users className="h-5 w-5" />, value: '850+', label: 'Entreprises' },
    { icon: <TrendingUp className="h-5 w-5" />, value: '95%', label: 'Taux de Réussite' },
  ];

  useEffect(() => {
    const keyword = searchParams.get('keyword');
    const category = searchParams.get('category');
    
    if (keyword) {
      setSearchQuery(keyword);
    }
    if (category) {
      setSelectedCategory(category);
    }
    
    fetchJobs();
  }, [searchParams]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('jobs')
        .select(`
          *,
          applications:applications(count)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      
      if (error) throw error;
      
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    const matchesCategory = !selectedCategory || job.category === selectedCategory;
    
    return matchesSearch && matchesLocation && matchesCategory;
  });

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-10 animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-overlay filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          
          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">
                {jobs.length} Offres d'Emploi Disponibles
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Trouvez Votre 
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent"> Emploi Idéal</span>
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
                Découvrez les meilleures opportunités d'emploi en Tunisie avec notre IA avancée
              </p>
              
              {/* Search Bar */}
              <div className="max-w-4xl mx-auto mb-8">
                <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Rechercher un poste..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Localisation..."
                          value={locationFilter}
                          onChange={(e) => setLocationFilter(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => setShowFilters(!showFilters)}
                          variant="outline"
                          className="flex-1 bg-gray-50 hover:bg-gray-100 border-gray-200"
                        >
                          <Filter className="h-4 w-4 mr-2" />
                          Filtres
                        </Button>
                        <Button 
                          onClick={fetchJobs}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          Rechercher
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-6 mb-8">
                {jobStats.map((stat, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                    <div className="text-yellow-300">{stat.icon}</div>
                    <div>
                      <div className="font-bold text-xl">{stat.value}</div>
                      <div className="text-white/80 text-sm">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {/* Popular Categories */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Catégories Populaires</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {popularCategories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === category.name 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : `${category.color} hover:shadow-md`
                  }`}
                >
                  {category.name} <span className="ml-2 text-sm">({category.count})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="lg:col-span-1">
                <Card className="sticky top-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Filtres Avancés</h3>
                    <FilterSection />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Jobs List */}
            <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {filteredJobs.length} Offres Trouvées
                  </h2>
                  {(searchQuery || locationFilter || selectedCategory) && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery('');
                        setLocationFilter('');
                        setSelectedCategory('');
                      }}
                      className="text-sm"
                    >
                      Effacer les filtres
                    </Button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredJobs.length === 0 ? (
                <Card className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50 border-0">
                  <CardContent>
                    <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune offre trouvée</h3>
                    <p className="text-gray-600 mb-6">Essayez de modifier vos critères de recherche</p>
                    <Button 
                      onClick={() => {
                        setSearchQuery('');
                        setLocationFilter('');
                        setSelectedCategory('');
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      Voir toutes les offres
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredJobs.map((job, index) => (
                    <div 
                      key={job.id} 
                      className="animate-fade-in hover:scale-105 transition-all duration-300"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <JobCard job={job} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Jobs;
