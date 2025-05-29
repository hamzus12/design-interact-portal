
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  const features = [
    {
      icon: <Sparkles className="h-5 w-5" />,
      text: "IA Avancée"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      text: "100% Sécurisé"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      text: "Résultats Rapides"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300 rounded-full mix-blend-overlay filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Offre Limitée - Rejoignez-nous Maintenant
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Prêt à Transformer Votre 
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Carrière ?</span>
              </h2>
              
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                Rejoignez des milliers de professionnels marocains qui ont déjà trouvé leur emploi idéal 
                grâce à notre IA révolutionnaire. Votre nouveau chapitre professionnel commence ici.
              </p>
              
              {/* Features list */}
              <div className="flex flex-wrap justify-center gap-6 mb-10">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-gray-700">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full">
                      {feature.icon}
                    </div>
                    <span className="font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                asChild
              >
                <Link to="/sign-up">
                  Créer Mon Profil Gratuit
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-blue-600 px-8 py-4 text-lg font-semibold transition-all duration-300"
                asChild
              >
                <Link to="/jobs">
                  Explorer les Offres
                </Link>
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-6">
              ✨ Inscription gratuite • Aucune carte de crédit requise • Démarrez en 2 minutes
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CTASection;
