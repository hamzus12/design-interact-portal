
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Video, Calendar, Clock, ExternalLink, Phone } from 'lucide-react';

interface VideoCall {
  id: string;
  scheduled_for: string;
  duration_minutes: number;
  meeting_url: string;
  status: string;
  notes: string;
  scheduled_by: string;
  created_at: string;
}

interface VideoCallsListProps {
  conversationId: string;
  currentUserId: string;
}

const VideoCallsList: React.FC<VideoCallsListProps> = ({ 
  conversationId, 
  currentUserId 
}) => {
  const { toast } = useToast();
  const [videoCalls, setVideoCalls] = useState<VideoCall[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideoCalls = async () => {
      try {
        const { data, error } = await supabase
          .from('video_calls')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('scheduled_for', { ascending: true });

        if (error) throw error;
        setVideoCalls(data || []);
      } catch (error) {
        console.error('Error fetching video calls:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoCalls();

    // Set up realtime subscription for video calls
    const channel = supabase
      .channel('video-calls-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'video_calls',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => fetchVideoCalls()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const handleStartCall = async (callId: string, meetingUrl: string) => {
    try {
      // Update call status to ongoing
      const { error } = await supabase
        .from('video_calls')
        .update({ status: 'ongoing' })
        .eq('id', callId);

      if (error) throw error;

      // Open the meeting URL
      window.open(meetingUrl, '_blank');

      toast({
        title: 'Appel vidéo démarré',
        description: 'L\'entretien vidéo a commencé avec succès',
      });
    } catch (error) {
      console.error('Error starting video call:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de démarrer l\'appel vidéo',
        variant: 'destructive'
      });
    }
  };

  const handleJoinCall = (meetingUrl: string) => {
    window.open(meetingUrl, '_blank');
  };

  const handleEndCall = async (callId: string) => {
    try {
      const { error } = await supabase
        .from('video_calls')
        .update({ status: 'completed' })
        .eq('id', callId);

      if (error) throw error;

      toast({
        title: 'Appel terminé',
        description: 'L\'entretien vidéo a été marqué comme terminé',
      });
    } catch (error) {
      console.error('Error ending video call:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de terminer l\'appel vidéo',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string, scheduledFor: string) => {
    const now = new Date();
    const callTime = new Date(scheduledFor);
    const isCallTime = Math.abs(now.getTime() - callTime.getTime()) < 15 * 60 * 1000; // 15 minutes window

    if (status === 'cancelled') {
      return <Badge variant="destructive">Annulé</Badge>;
    } else if (status === 'completed') {
      return <Badge variant="outline" className="bg-green-50 text-green-700">Terminé</Badge>;
    } else if (status === 'ongoing') {
      return <Badge className="bg-red-600">En cours</Badge>;
    } else if (callTime < now && status !== 'ongoing') {
      return <Badge variant="outline" className="bg-gray-50 text-gray-700">Manqué</Badge>;
    } else if (isCallTime) {
      return <Badge className="bg-blue-600">Prêt à démarrer</Badge>;
    } else {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Planifié</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getCallActions = (call: VideoCall) => {
    const now = new Date();
    const callTime = new Date(call.scheduled_for);
    const isCallTime = Math.abs(now.getTime() - callTime.getTime()) < 15 * 60 * 1000; // 15 minutes window

    if (call.status === 'ongoing') {
      return (
        <div className="flex space-x-2">
          <Button
            onClick={() => handleJoinCall(call.meeting_url)}
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Rejoindre
          </Button>
          <Button
            onClick={() => handleEndCall(call.id)}
            variant="outline"
            size="sm"
          >
            <Phone className="h-4 w-4 mr-2" />
            Terminer
          </Button>
        </div>
      );
    } else if (isCallTime && call.status === 'scheduled') {
      return (
        <Button
          onClick={() => handleStartCall(call.id, call.meeting_url)}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          <Video className="h-4 w-4 mr-2" />
          Démarrer l'Entretien
        </Button>
      );
    } else if (call.status === 'scheduled' && call.meeting_url) {
      return (
        <Button
          onClick={() => handleJoinCall(call.meeting_url)}
          className="w-full"
          variant="outline"
          size="sm"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Lien de Réunion
        </Button>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (videoCalls.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Entretiens Vidéo</h3>
      {videoCalls.map((call) => {
        const { date, time } = formatDateTime(call.scheduled_for);

        return (
          <Card key={call.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center">
                  <Video className="h-4 w-4 mr-2" />
                  Entretien Vidéo
                </CardTitle>
                {getStatusBadge(call.status, call.scheduled_for)}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  {date}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4 mr-2" />
                  {time} ({call.duration_minutes} minutes)
                </div>
                {call.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {call.notes}
                  </p>
                )}
                <div className="mt-3">
                  {getCallActions(call)}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default VideoCallsList;
