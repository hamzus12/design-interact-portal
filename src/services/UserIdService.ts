
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface UserIdMapping {
  authUserId: string;
  dbUserId: string;
  isValid: boolean;
}

class UserIdService {
  private static instance: UserIdService;
  private userIdCache = new Map<string, string>();

  private constructor() {}

  static getInstance(): UserIdService {
    if (!UserIdService.instance) {
      UserIdService.instance = new UserIdService();
    }
    return UserIdService.instance;
  }

  /**
   * Récupère l'ID de base de données correspondant à l'ID d'authentification
   * avec mise en cache et validation
   */
  async getUserDatabaseId(authUserId: string): Promise<string | null> {
    if (!authUserId) {
      console.error('Auth user ID is required');
      return null;
    }

    // Vérifier le cache d'abord
    if (this.userIdCache.has(authUserId)) {
      return this.userIdCache.get(authUserId)!;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', authUserId)
        .single();

      if (error) {
        console.error('Error getting database user ID:', error);
        return null;
      }

      if (!data) {
        console.error('No database user found for auth ID:', authUserId);
        return null;
      }

      // Mettre en cache le résultat
      this.userIdCache.set(authUserId, data.id);
      return data.id;
    } catch (err) {
      console.error('Exception getting database user ID:', err);
      return null;
    }
  }

  /**
   * Valide qu'un utilisateur existe avant une opération de base de données
   */
  async validateUserExists(authUserId: string): Promise<UserIdMapping> {
    const dbUserId = await this.getUserDatabaseId(authUserId);
    
    return {
      authUserId,
      dbUserId: dbUserId || '',
      isValid: dbUserId !== null
    };
  }

  /**
   * Crée un utilisateur dans la table users si il n'existe pas
   */
  async ensureUserExists(authUser: any): Promise<string | null> {
    if (!authUser?.id) {
      return null;
    }

    try {
      // Vérifier si l'utilisateur existe déjà
      let dbUserId = await this.getUserDatabaseId(authUser.id);
      
      if (dbUserId) {
        return dbUserId;
      }

      // Créer l'utilisateur s'il n'existe pas
      const { data, error } = await supabase
        .from('users')
        .insert({
          user_id: authUser.id,
          email: authUser.email || '',
          first_name: authUser.user_metadata?.first_name || '',
          last_name: authUser.user_metadata?.last_name || '',
          role: authUser.user_metadata?.role || 'candidate'
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating user:', error);
        toast({
          title: "Erreur",
          description: "Impossible de créer le profil utilisateur",
          variant: "destructive"
        });
        return null;
      }

      // Mettre en cache le nouvel ID
      this.userIdCache.set(authUser.id, data.id);
      return data.id;
    } catch (err) {
      console.error('Exception ensuring user exists:', err);
      return null;
    }
  }

  /**
   * Nettoie le cache pour un utilisateur
   */
  invalidateUserCache(authUserId: string): void {
    this.userIdCache.delete(authUserId);
  }

  /**
   * Nettoie tout le cache
   */
  clearCache(): void {
    this.userIdCache.clear();
  }

  /**
   * Méthode helper pour les opérations qui nécessitent un ID utilisateur valide
   */
  async withValidUserId<T>(
    authUserId: string | undefined,
    operation: (dbUserId: string) => Promise<T>,
    errorMessage: string = "Utilisateur non trouvé"
  ): Promise<T | null> {
    if (!authUserId) {
      toast({
        title: "Erreur",
        description: "Utilisateur non connecté",
        variant: "destructive"
      });
      return null;
    }

    const validation = await this.validateUserExists(authUserId);
    
    if (!validation.isValid) {
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }

    try {
      return await operation(validation.dbUserId);
    } catch (error) {
      console.error('Operation failed:', error);
      toast({
        title: "Erreur",
        description: "Opération échouée",
        variant: "destructive"
      });
      return null;
    }
  }
}

export const userIdService = UserIdService.getInstance();
