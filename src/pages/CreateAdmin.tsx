import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const CreateAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);
  const { toast } = useToast();

  const handleCreateAdmin = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://vrtorxjtxvrqxdsfrywo.supabase.co/functions/v1/create-admin-user',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setCreated(true);
        toast({
          title: 'Compte admin créé !',
          description: 'Vous pouvez maintenant vous connecter avec admin@demo.com',
        });
      } else {
        throw new Error(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-2xl py-12">
        <Card>
          <CardHeader>
            <CardTitle>Créer le compte administrateur</CardTitle>
            <CardDescription>
              Créez le compte admin de démonstration en un clic
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!created ? (
              <>
                <div className="space-y-2 text-sm">
                  <p>Ce compte sera créé avec les informations suivantes :</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Email : <strong>admin@demo.com</strong></li>
                    <li>Mot de passe : <strong>AdminDemo2024!</strong></li>
                    <li>Rôle : Administrateur</li>
                    <li>Email confirmé automatiquement</li>
                  </ul>
                </div>
                <Button 
                  onClick={handleCreateAdmin} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    'Créer le compte admin'
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    ✓ Compte créé avec succès !
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Vous pouvez maintenant vous connecter avec :
                  </p>
                  <div className="mt-2 space-y-1 text-sm font-mono">
                    <p>Email : admin@demo.com</p>
                    <p>Password : AdminDemo2024!</p>
                  </div>
                </div>
                <Button 
                  onClick={() => window.location.href = '/signin'}
                  className="w-full"
                >
                  Aller à la page de connexion
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateAdmin;
