
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Benali",
      role: "Développeuse Frontend",
      company: "TechCorp Tunisia",
      image: "/placeholder.svg",
      rating: 5,
      text: "JobPersona AI m'a aidée à trouver le poste parfait en moins de 2 semaines. L'IA a parfaitement analysé mes compétences et m'a proposé des offres sur mesure.",
      location: "Tunis"
    },
    {
      name: "Ahmed Kari",
      role: "Chef de Projet",
      company: "Digital Solutions",
      image: "/placeholder.svg", 
      rating: 5,
      text: "Impressionnant ! La simulation d'entretien m'a permis de me préparer efficacement. J'ai décroché mon emploi de rêve grâce à cette plateforme innovante.",
      location: "Sfax"
    },
    {
      name: "Fatima Zahra",
      role: "Designer UX/UI",
      company: "Creative Agency",
      image: "/placeholder.svg",
      rating: 5,
      text: "Interface intuitive et IA révolutionnaire. En tant que recruteure, j'ai trouvé les meilleurs talents en un temps record. Hautement recommandé !",
      location: "Sousse"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-2">
            Témoignages
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ce Que Disent Nos 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Utilisateurs</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez comment JobPersona AI transforme la vie professionnelle de milliers de Tunisiens
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="group hover:scale-105 transition-all duration-300 border-0 shadow-lg hover:shadow-2xl bg-white/90 backdrop-blur-sm relative overflow-hidden">
              {/* Quote decoration */}
              <div className="absolute top-4 right-4 text-blue-200 group-hover:text-blue-300 transition-colors">
                <Quote className="h-8 w-8" />
              </div>
              
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                {/* Testimonial text */}
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                
                {/* User info */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-sm text-blue-600 font-medium">{testimonial.company}</p>
                    <p className="text-xs text-gray-500 mt-1">{testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
