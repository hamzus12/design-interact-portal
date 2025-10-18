
import React, { useState } from 'react';
import { ArrowRight, Briefcase, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const categories = [
  {
    id: 1,
    name: 'Accountancy',
    icon: '📊',
    jobs: 301,
    bgColor: 'bg-accounting',
    iconColor: 'text-red',
  },
  {
    id: 2,
    name: 'Education',
    icon: '🎓',
    jobs: 210,
    bgColor: 'bg-education',
    iconColor: 'text-blue-500',
  },
  {
    id: 3,
    name: 'Automotive Jobs',
    icon: '🚗',
    jobs: 281,
    bgColor: 'bg-automotive',
    iconColor: 'text-purple-500',
  },
  {
    id: 4,
    name: 'Business',
    icon: '💼',
    jobs: 122,
    bgColor: 'bg-business',
    iconColor: 'text-orange-500',
  },
  {
    id: 5,
    name: 'Health Care',
    icon: '❤️',
    jobs: 335,
    bgColor: 'bg-healthcare',
    iconColor: 'text-red',
  },
  {
    id: 6,
    name: 'IT & Agency',
    icon: '💻',
    jobs: 401,
    bgColor: 'bg-it',
    iconColor: 'text-blue-500',
  },
  {
    id: 7,
    name: 'Engineering',
    icon: '⚙️',
    jobs: 100,
    bgColor: 'bg-engineering',
    iconColor: 'text-red',
  },
  {
    id: 8,
    name: 'Legal',
    icon: '⚖️',
    jobs: 201,
    bgColor: 'bg-legal',
    iconColor: 'text-cyan-500',
  },
];

const CategorySection: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <section className="py-24 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge className="mb-4 inline-flex items-center px-4 py-2 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-all duration-300">
            <Briefcase className="w-4 h-4 mr-2" />
            Catégories d'Emploi
          </Badge>
          
          <h2 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-fade-in leading-tight">
            Choisissez Votre Catégorie
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground animate-fade-in leading-relaxed" style={{ animationDelay: '0.1s' }}>
            Explorez des milliers d'opportunités dans les secteurs les plus dynamiques. 
            Trouvez le poste qui correspond parfaitement à vos compétences.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <a
              key={category.id}
              href={`/jobs?category=${category.name}`}
              className="group relative block animate-fade-in"
              style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              onMouseEnter={() => setHoveredCard(category.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="relative h-full p-8 bg-card border-2 border-border rounded-2xl transition-all duration-500 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                
                <div className="relative z-10">
                  {/* Icon container with animation */}
                  <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl ${category.bgColor} transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg`}>
                    <span className="text-3xl filter group-hover:drop-shadow-lg transition-all duration-300">
                      {category.icon}
                    </span>
                  </div>
                  
                  {/* Category name */}
                  <h3 className="mb-3 text-xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300">
                    {category.name}
                  </h3>
                  
                  {/* Jobs count with icon */}
                  <div className="mb-6 flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className={`h-4 w-4 ${hoveredCard === category.id ? 'text-primary animate-bounce-gentle' : ''} transition-colors duration-300`} />
                    <p className="text-base font-semibold">
                      <span className="text-primary">{category.jobs}</span> postes ouverts
                    </p>
                  </div>
                  
                  {/* Browse button */}
                  <div className="inline-flex items-center text-sm font-bold text-primary group-hover:text-primary/80 transition-colors duration-300">
                    <span>Explorer les offres</span>
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
                  </div>
                </div>

                {/* Corner decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </a>
          ))}
        </div>

        {/* View all categories button */}
        <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <a
            href="/jobs"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30"
          >
            <span>Voir Toutes les Catégories</span>
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
