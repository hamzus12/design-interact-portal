
import React from 'react';
import { Users, Briefcase, Building2, TrendingUp, Award, Clock } from 'lucide-react';

const StatsSection: React.FC = () => {
  const stats = [
    {
      icon: <Users className="h-8 w-8" />,
      value: "15,000+",
      label: "Candidats Actifs",
      description: "Professionnels qualifiés",
      color: "text-blue-600"
    },
    {
      icon: <Briefcase className="h-8 w-8" />,
      value: "2,500+",
      label: "Offres d'Emploi",
      description: "Postes disponibles",
      color: "text-green-600"
    },
    {
      icon: <Building2 className="h-8 w-8" />,
      value: "800+",
      label: "Entreprises Partenaires",
      description: "PME et multinationales",
      color: "text-purple-600"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      value: "95%",
      label: "Taux de Réussite",
      description: "Avec JobPersona IA",
      color: "text-orange-600"
    },
    {
      icon: <Award className="h-8 w-8" />,
      value: "4.8/5",
      label: "Satisfaction Client",
      description: "Note moyenne",
      color: "text-yellow-600"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      value: "7 jours",
      label: "Temps Moyen",
      description: "Pour trouver un emploi",
      color: "text-red-600"
    }
  ];

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-50"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pourquoi Choisir JobPersona IA ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Les chiffres parlent d'eux-mêmes. Notre plateforme révolutionne la recherche d'emploi en Tunisie.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-100"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`inline-flex p-3 rounded-full bg-gray-50 mb-4 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-gray-700 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-gray-500">
                {stat.description}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 cursor-pointer">
            🚀 Rejoignez plus de 15,000 professionnels qui ont trouvé leur emploi idéal
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
