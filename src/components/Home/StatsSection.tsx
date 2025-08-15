
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Briefcase, MapPin, TrendingUp } from 'lucide-react';

const StatsSection = () => {
  const stats = [
    {
      icon: <Users className="h-8 w-8" />,
      number: "50,000+",
      label: "Candidats Actifs",
      description: "Professionnels qualifiés",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Briefcase className="h-8 w-8" />,
      number: "15,000+",
      label: "Offres d'Emploi",
      description: "Nouvelles opportunités chaque semaine",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      number: "200+",
      label: "Villes Couvertes",
      description: "Partout en Tunisie",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      number: "95%",
      label: "Taux de Réussite",
      description: "Candidats placés avec succès",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Plateforme de Confiance en Tunisie
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Des milliers de professionnels nous font confiance pour leur carrière
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="group hover:scale-105 transition-all duration-300 border-0 shadow-lg hover:shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${stat.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                    {stat.number}
                  </h3>
                  <p className="font-semibold text-gray-700">{stat.label}</p>
                  <p className="text-sm text-gray-500">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
