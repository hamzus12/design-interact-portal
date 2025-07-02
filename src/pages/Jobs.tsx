
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import FilterSection from '@/components/Jobs/FilterSection';
import JobCard from '@/components/Jobs/JobCard';
import { useDatabase } from '@/context/DatabaseContext';
import { useUserRole } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Jobs = () => {
  const { jobs, loading, error, fetchJobs, fetchJobsByFilters, favorites, toggleFavorite } = useDatabase();
  const { user, role } = useUserRole();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    keyword: '',
    category: [],
    jobType: [],
    location: []
  });
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer les paramètres de recherche depuis l'URL
    const keywordFromUrl = searchParams.get('keyword') || '';
    const locationFromUrl = searchParams.get('location') || '';
    
    if (keywordFromUrl || locationFromUrl) {
      const initialFilters = {
        keyword: keywordFromUrl,
        category: [],
        jobType: [],
        location: locationFromUrl ? [locationFromUrl] : []
      };
      setFilters(initialFilters);
      
      // Appliquer les filtres de recherche
      if (keywordFromUrl || locationFromUrl) {
        fetchJobsByFilters(initialFilters);
      } else {
        fetchJobs();
      }
    } else {
      // Charger tous les emplois si aucun paramètre de recherche
      fetchJobs();
    }
    
    // Essayer d'obtenir la géolocalisation de l'utilisateur
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setCurrentLocation(`${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`);
          toast({
            title: "Localisation détectée",
            description: "Nous pouvons vous montrer les opportunités locales",
          });
        },
        error => {
          console.log("Erreur de géolocalisation:", error);
        }
      );
    }
  }, [fetchJobs, fetchJobsByFilters, searchParams, toast]);

  const handleFilterChange = (newFilters) => {
    console.log('Filtres appliqués:', newFilters);
    setFilters(newFilters);
    
    // Appliquer les filtres ou charger tous les emplois si aucun filtre
    const hasActiveFilters = newFilters.keyword || 
                            newFilters.category.length > 0 || 
                            newFilters.jobType.length > 0 || 
                            newFilters.location.length > 0;
    
    if (hasActiveFilters) {
      fetchJobsByFilters(newFilters);
    } else {
      fetchJobs();
    }
  };

  const clearFilters = () => {
    const emptyFilters = {
      keyword: '',
      category: [],
      jobType: [],
      location: []
    };
    setFilters(emptyFilters);
    fetchJobs();
  };

  return (
    <Layout>
      <div className="bg-gray-50 py-8 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl dark:text-white">Parcourir les Emplois</h1>
              {currentLocation && (
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>Votre localisation: {currentLocation}</span>
                </div>
              )}
            </div>
            
            {user && (role === 'recruiter' || role === 'admin') && (
              <Button asChild className="bg-primary text-white">
                <Link to="/add-job">
                  <Plus className="mr-2 h-4 w-4" /> Publier une Offre
                </Link>
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <FilterSection
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
              />
            </div>
            
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : error ? (
                <div className="rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  {error}
                </div>
              ) : jobs.length > 0 ? (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <JobCard 
                      key={job.id} 
                      job={{
                        id: job.id,
                        title: job.title,
                        company: job.company,
                        company_logo: job.companyLogo,
                        location: job.location,
                        category: job.category,
                        job_type: job.jobType || job.type,
                        salary_range: job.salaryRange,
                        description: job.description,
                        created_at: job.timeAgo || new Date().toISOString(),
                        recruiter_id: job.recruiterId,
                        is_active: job.isActive
                      }}
                      isFavorite={favorites.includes(job.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex h-40 flex-col items-center justify-center space-y-2 rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800 dark:text-gray-200">
                  <h3 className="text-lg font-semibold">Aucun emploi trouvé</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {filters.keyword || filters.category.length > 0 || filters.jobType.length > 0 || filters.location.length > 0
                      ? "Essayez d'ajuster vos filtres de recherche."
                      : "Aucune offre d'emploi disponible pour le moment."
                    }
                  </p>
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
