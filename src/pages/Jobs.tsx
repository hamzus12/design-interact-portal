import React, { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout/Layout';
import JobCard from '@/components/Jobs/JobCard';
import FilterSection from '@/components/Jobs/FilterSection';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  MapPin, 
  Filter,
  Briefcase,
  TrendingUp,
  Users,
  Star,
  Building,
  Clock
} from 'lucide-react';
import { useDatabase } from '@/context/DatabaseContext';
import { Navigate } from 'react-router-dom';

const Jobs = () => {
  const { user } = useAuth();
  const { jobs, loading } = useDatabase();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    keyword: '',
    category: [],
    jobType: [],
    location: []
  });

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  // Popular categories based on available jobs
  const popularCategories = [
    { name: 'Technology', count: 3, color: 'bg-blue-100 text-blue-800' },
    { name: 'Finance', count: 2, color: 'bg-green-100 text-green-800' },
    { name: 'Design', count: 1, color: 'bg-purple-100 text-purple-800' },
    { name: 'Marketing', count: 1, color: 'bg-orange-100 text-orange-800' },
    { name: 'Sales', count: 1, color: 'bg-red-100 text-red-800' },
    { name: 'Healthcare', count: 1, color: 'bg-teal-100 text-teal-800' }
  ];

  const jobStats = [
    { icon: <Briefcase className="h-5 w-5" />, value: jobs.length.toString(), label: 'Offres Disponibles' },
    { icon: <Building className="h-5 w-5" />, value: '25+', label: 'Entreprises' },
    { icon: <Users className="h-5 w-5" />, value: '500+', label: 'Candidats' },
    { icon: <TrendingUp className="h-5 w-5" />, value: '95%', label: 'Taux de Satisfaction' }
  ];

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName === selectedCategory ? '' : categoryName);
  };

  // Filter jobs based on search criteria
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = !searchQuery || 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLocation = !locationFilter || 
        job.location.toLowerCase().includes(locationFilter.toLowerCase());

      const matchesCategory = !selectedCategory || 
        job.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesKeyword = !filters.keyword ||
        job.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.keyword.toLowerCase());

      const matchesFilterCategory = filters.category.length === 0 ||
        filters.category.some(cat => job.category.toLowerCase().includes(cat.toLowerCase()));

      const matchesJobType = filters.jobType.length === 0 ||
        filters.jobType.some(type => (job as any).job_type?.toLowerCase().includes(type.toLowerCase()));

      const matchesFilterLocation = filters.location.length === 0 ||
        filters.location.some(loc => job.location.toLowerCase().includes(loc.toLowerCase()));

      return matchesSearch && matchesLocation && matchesCategory && 
             matchesKeyword && matchesFilterCategory && matchesJobType && matchesFilterLocation;
    });
  }, [jobs, searchQuery, locationFilter, selectedCategory, filters]);

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
                          className="flex-1 bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          <Filter className="w-4 h-4 mr-2" />
                          Filtres
                        </Button>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8">
                          <Search className="w-4 h-4 mr-2" />
                          Rechercher
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Job Stats */}
              <div className="flex flex-wrap justify-center gap-6">
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
                    <FilterSection 
                      filters={filters}
                      onFilterChange={setFilters}
                      onClearFilters={() => setFilters({ keyword: '', category: [], jobType: [], location: [] })}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Jobs List */}
            <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {filteredJobs.length} offre{filteredJobs.length !== 1 ? 's' : ''} trouvée{filteredJobs.length !== 1 ? 's' : ''}
                  </h2>
                  <p className="text-gray-600">
                    {selectedCategory && `Catégorie: ${selectedCategory} • `}
                    {searchQuery && `Recherche: "${searchQuery}" • `}
                    {locationFilter && `Lieu: "${locationFilter}"`}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Mis à jour maintenant</span>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <Card key={index} className="animate-pulse bg-white/80 backdrop-blur-sm">
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
                        setFilters({ keyword: '', category: [], jobType: [], location: [] });
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
                      <JobCard job={job as any} />
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