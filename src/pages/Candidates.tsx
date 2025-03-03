
import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Briefcase, Heart } from 'lucide-react';

// Sample candidate data
const candidatesData = [
  {
    id: 1,
    name: 'Jennifer Adams',
    title: 'UX/UI Designer',
    location: 'London, UK',
    skills: ['Figma', 'Adobe XD', 'Sketch', 'UI Design', 'User Research'],
    experience: '5 years',
    avatar: 'J',
    avatarColor: 'bg-purple-500',
  },
  {
    id: 2,
    name: 'Michael Johnson',
    title: 'Full Stack Developer',
    location: 'New York, USA',
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'AWS'],
    experience: '7 years',
    avatar: 'M',
    avatarColor: 'bg-blue-500',
  },
  {
    id: 3,
    name: 'Emma Wilson',
    title: 'Digital Marketing Specialist',
    location: 'Berlin, Germany',
    skills: ['SEO', 'Content Strategy', 'Social Media', 'Google Analytics', 'PPC'],
    experience: '4 years',
    avatar: 'E',
    avatarColor: 'bg-red',
  },
  {
    id: 4,
    name: 'David Chen',
    title: 'Product Manager',
    location: 'San Francisco, USA',
    skills: ['Product Strategy', 'Agile', 'User Research', 'Data Analysis', 'Roadmapping'],
    experience: '8 years',
    avatar: 'D',
    avatarColor: 'bg-green-500',
  },
  {
    id: 5,
    name: 'Sarah Parker',
    title: 'Graphic Designer',
    location: 'Melbourne, Australia',
    skills: ['Adobe Creative Suite', 'Branding', 'Typography', 'Illustration', 'Print Design'],
    experience: '6 years',
    avatar: 'S',
    avatarColor: 'bg-yellow-500',
  },
  {
    id: 6,
    name: 'James Wilson',
    title: 'Data Scientist',
    location: 'Toronto, Canada',
    skills: ['Python', 'Machine Learning', 'SQL', 'Data Visualization', 'Statistics'],
    experience: '5 years',
    avatar: 'J',
    avatarColor: 'bg-indigo-500',
  },
  {
    id: 7,
    name: 'Olivia Martinez',
    title: 'Content Writer',
    location: 'Madrid, Spain',
    skills: ['Copywriting', 'Blogging', 'SEO Writing', 'Editing', 'Research'],
    experience: '3 years',
    avatar: 'O',
    avatarColor: 'bg-pink-500',
  },
  {
    id: 8,
    name: 'Thomas Wright',
    title: 'Frontend Developer',
    location: 'Paris, France',
    skills: ['HTML/CSS', 'JavaScript', 'React', 'Vue.js', 'Responsive Design'],
    experience: '4 years',
    avatar: 'T',
    avatarColor: 'bg-cyan-500',
  },
];

const Candidates = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);

  const toggleFavorite = (candidateId: number) => {
    if (favorites.includes(candidateId)) {
      setFavorites(favorites.filter(id => id !== candidateId));
    } else {
      setFavorites([...favorites, candidateId]);
    }
  };

  const filteredCandidates = candidatesData.filter(candidate => 
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
                    
                    <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${candidate.avatarColor} text-2xl font-bold text-white`}>
                      {candidate.avatar}
                    </div>
                    
                    <h3 className="mb-1 text-lg font-semibold text-gray-900">
                      {candidate.name}
                    </h3>
                    
                    <p className="mb-3 text-sm text-gray-600">{candidate.title}</p>
                    
                    <div className="mb-3 flex items-center justify-center text-sm text-gray-600">
                      <MapPin className="mr-1 h-4 w-4 text-gray-400" />
                      {candidate.location}
                    </div>
                    
                    <div className="mb-4 flex items-center justify-center text-sm text-gray-600">
                      <Briefcase className="mr-1 h-4 w-4 text-gray-400" />
                      {candidate.experience}
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-2">
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
