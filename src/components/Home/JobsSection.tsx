
import React, { useState, useEffect } from 'react';
import { MapPin, Building, Clock, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { useDatabase } from '@/context/DatabaseContext';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import JobCard from '@/components/Jobs/JobCard';

const JobsSection: React.FC = () => {
  const { jobs, loading, favorites, toggleFavorite, fetchJobs } = useDatabase();
  const [displayedJobs, setDisplayedJobs] = useState([]);
  const { language } = useLanguage();

  useEffect(() => {
    // Fetch jobs when component mounts
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    // Set displayed jobs to maximum 6 from fetched jobs
    setDisplayedJobs(jobs.slice(0, 6));
  }, [jobs]);

  // Translations based on selected language
  const sectionTitle = {
    'en': 'Jobs You May Be Interested In',
    'fr': 'Emplois Qui Pourraient Vous Intéresser',
    'ar': 'وظائف قد تهمك'
  }[language] || 'Jobs You May Be Interested In';

  const sectionSubtitle = {
    'en': 'Explore our curated selection of job openings across various industries and locations.',
    'fr': 'Explorez notre sélection d\'offres d\'emploi dans différentes industries et localisations.',
    'ar': 'استكشف مجموعة مختارة من فرص العمل عبر مختلف الصناعات والمواقع.'
  }[language] || 'Explore our curated selection of job openings across various industries and locations.';

  const browseBtnText = {
    'en': 'Browse All Jobs',
    'fr': 'Parcourir Tous les Emplois',
    'ar': 'تصفح جميع الوظائف'
  }[language] || 'Browse All Jobs';

  const noJobsText = {
    'en': 'No jobs available',
    'fr': 'Aucun emploi disponible',
    'ar': 'لا توجد وظائف متاحة'
  }[language] || 'No jobs available';

  const checkBackText = {
    'en': 'Check back soon for new opportunities.',
    'fr': 'Revenez bientôt pour de nouvelles opportunités.',
    'ar': 'تحقق قريبًا للحصول على فرص جديدة.'
  }[language] || 'Check back soon for new opportunities.';

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl animate-fade-in dark:text-white">
            {sectionTitle}
          </h2>
          <p className="text-gray-600 animate-fade-in dark:text-gray-300" style={{ animationDelay: '0.1s' }}>
            {sectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-3 flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : displayedJobs.length > 0 ? (
            displayedJobs.map((job, index) => (
              <div
                key={job.id}
                className="animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <JobCard 
                  job={job} 
                  isFavorite={favorites.includes(job.id)}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            ))
          ) : (
            <div className="col-span-3 flex h-40 flex-col items-center justify-center space-y-2 rounded-lg bg-white p-8 text-center shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold dark:text-white">{noJobsText}</h3>
              <p className="text-gray-500 dark:text-gray-400">{checkBackText}</p>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/jobs"
            className="inline-block rounded-md bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90 animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            {browseBtnText}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default JobsSection;
