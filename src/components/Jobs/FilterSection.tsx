
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-react';

export interface FilterSectionProps {
  filters: {
    keyword: string;
    category: any[];
    jobType: any[];
    location: any[];
  };
  onFilterChange: (newFilters: any) => void;
  onClearFilters: () => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  // Filter categories
  const categories = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Marketing",
    "Sales",
    "Design",
    "Customer Service",
  ];

  // Job types
  const jobTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Temporary",
    "Internship",
    "Remote",
  ];

  // Locations
  const locations = [
    "New York",
    "San Francisco",
    "Los Angeles",
    "Chicago",
    "Austin",
    "Boston",
    "Seattle",
    "Remote",
  ];

  // Handle keyword search
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, keyword: e.target.value };
    onFilterChange(newFilters);
  };

  // Handle checkbox filters
  const handleCheckboxChange = (
    type: 'category' | 'jobType' | 'location',
    value: string,
    checked: boolean
  ) => {
    let newArray = [...filters[type]];

    if (checked) {
      newArray.push(value);
    } else {
      newArray = newArray.filter((item) => item !== value);
    }

    const newFilters = { ...filters, [type]: newArray };
    onFilterChange(newFilters);
  };

  // Clear individual filter section
  const clearFilterSection = (type: 'category' | 'jobType' | 'location') => {
    const newFilters = { ...filters, [type]: [] };
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-6 rounded-lg border bg-white p-5 shadow-sm">
      {/* Keyword search */}
      <div>
        <h3 className="mb-3 font-medium text-gray-900">Search</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Job title, company..."
            className="pl-10"
            value={filters.keyword}
            onChange={handleKeywordChange}
          />
          {filters.keyword && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full p-0"
              onClick={() => onFilterChange({ ...filters, keyword: "" })}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Categories</h3>
          {filters.category.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 p-0 text-xs text-gray-500"
              onClick={() => clearFilterSection('category')}
            >
              Clear
            </Button>
          )}
        </div>
        <ScrollArea className="h-40">
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.category.includes(category)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('category', category, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`category-${category}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {category}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Job Types */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Job Type</h3>
          {filters.jobType.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 p-0 text-xs text-gray-500"
              onClick={() => clearFilterSection('jobType')}
            >
              Clear
            </Button>
          )}
        </div>
        <ScrollArea className="h-40">
          <div className="space-y-2">
            {jobTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={filters.jobType.includes(type)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('jobType', type, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`type-${type}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Locations */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Location</h3>
          {filters.location.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 p-0 text-xs text-gray-500"
              onClick={() => clearFilterSection('location')}
            >
              Clear
            </Button>
          )}
        </div>
        <ScrollArea className="h-40">
          <div className="space-y-2">
            {locations.map((location) => (
              <div key={location} className="flex items-center space-x-2">
                <Checkbox
                  id={`location-${location}`}
                  checked={filters.location.includes(location)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange('location', location, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`location-${location}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {location}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Reset all filters */}
      <Button
        variant="outline"
        className="w-full"
        onClick={onClearFilters}
        disabled={
          !filters.keyword &&
          filters.category.length === 0 &&
          filters.jobType.length === 0 &&
          filters.location.length === 0
        }
      >
        Reset All Filters
      </Button>
    </div>
  );
};

export default FilterSection;
