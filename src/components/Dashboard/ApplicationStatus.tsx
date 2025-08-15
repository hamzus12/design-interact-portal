
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Clock, Eye, RefreshCw } from 'lucide-react';

interface ApplicationStatusProps {
  jobId: string;
  onStatusChange?: (status: string) => void;
}

const ApplicationStatus: React.FC<ApplicationStatusProps> = ({ 
  jobId, 
  onStatusChange 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);

  const fetchApplicationStatus = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get database user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (userError || !userData) {
        console.error('Error getting user data:', userError);
        return;
      }

      // Get application status
      const { data, error } = await supabase
        .from('applications')
        .select('status')
        .eq('job_id', jobId)
        .eq('candidate_id', userData.id)
        .single();

      if (error) {
        console.error('Error fetching application status:', error);
        return;
      }

      const newStatus = data?.status || 'pending';
      setStatus(newStatus);
      onStatusChange?.(newStatus);

    } catch (error) {
      console.error('Error in fetchApplicationStatus:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationStatus();

    // Set up real-time subscription for status changes
    const channel = supabase
      .channel('application-status-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'applications',
          filter: `job_id=eq.${jobId}`
        },
        (payload) => {
          console.log('Application status updated:', payload);
          fetchApplicationStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId, user?.id]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'accepted':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Acceptée',
          description: 'Votre candidature a été acceptée !'
        };
      case 'refused':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <XCircle className="h-4 w-4" />,
          text: 'Refusée',
          description: 'Votre candidature a été refusée.'
        };
      case 'pending':
      default:
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="h-4 w-4" />,
          text: 'En attente',
          description: 'Votre candidature est en cours d\'examen.'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300"></div>
        <span className="text-sm text-gray-500">Chargement du statut...</span>
      </div>
    );
  }

  const statusConfig = getStatusConfig(status);

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${statusConfig.color} border flex items-center gap-1`}>
        {statusConfig.icon}
        {statusConfig.text}
      </Badge>
      <Button
        variant="ghost"
        size="sm"
        onClick={fetchApplicationStatus}
        className="h-6 w-6 p-0"
      >
        <RefreshCw className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default ApplicationStatus;
