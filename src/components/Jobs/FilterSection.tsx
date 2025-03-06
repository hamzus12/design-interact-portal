
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface FilterSectionProps {
  filters: {
    category: string[];
    jobType: string[];
    location: string[];
  };
  toggleFilter: (type: 'category' | 'jobType' | 'location', value: string) => void;
  clearFilters: () => void;
  onApplyFilters: () => void;
}

const categories = [
  'Accountancy', 'Education', 'Automotive', 'Business', 
  'Healthcare', 'IT & Agency', 'Engineering', 'Legal'
];

const jobTypes = [
  'Full Time', 'Part Time', 'Remote', 'Contract', 'Internship'
];

const locations = [
  'London', 'New York', 'San Francisco', 'Berlin', 'Paris', 'Tokyo'
];

const FilterSection: React.FC<FilterSectionProps> = ({ 
  filters, 
  toggleFilter, 
  clearFilters,
  onApplyFilters
}) => {
  return (
    <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Categories */}
        <div>
          <h3 className="mb-3 font-semibold">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center">
                <Checkbox 
                  id={`category-${category}`} 
                  checked={filters.category.includes(category)}
                  onCheckedChange={() => toggleFilter('category', category)}
                  className="data-[state=checked]:bg-red data-[state=checked]:border-red"
                />
                <label htmlFor={`category-${category}`} className="ml-2 text-sm">
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Job Types */}
        <div>
          <h3 className="mb-3 font-semibold">Job Type</h3>
          <div className="space-y-2">
            {jobTypes.map((type) => (
              <div key={type} className="flex items-center">
                <Checkbox 
                  id={`type-${type}`} 
                  checked={filters.jobType.includes(type)}
                  onCheckedChange={() => toggleFilter('jobType', type)}
                  className="data-[state=checked]:bg-red data-[state=checked]:border-red"
                />
                <label htmlFor={`type-${type}`} className="ml-2 text-sm">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {/* Locations */}
        <div>
          <h3 className="mb-3 font-semibold">Location</h3>
          <div className="space-y-2">
            {locations.map((location) => (
              <div key={location} className="flex items-center">
                <Checkbox 
                  id={`location-${location}`} 
                  checked={filters.location.includes(location)}
                  onCheckedChange={() => toggleFilter('location', location)}
                  className="data-[state=checked]:bg-red data-[state=checked]:border-red"
                />
                <label htmlFor={`location-${location}`} className="ml-2 text-sm">
                  {location}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <Button
          variant="outline"
          onClick={clearFilters}
          className="mr-2"
        >
          Clear Filters
        </Button>
        <Button
          className="bg-red text-white hover:bg-red/90"
          onClick={onApplyFilters}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterSection;
