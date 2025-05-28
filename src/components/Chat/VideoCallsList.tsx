
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Video, Calendar, Clock, ExternalLink } from 'lucide-react';

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

  const handleJoinCall = (meetingUrl: string) => {
    window.open(meetingUrl, '_blank');
  };

  const getStatusBadge = (status: string, scheduledFor: string) => {
    const now = new Date();
    const callTime = new Date(scheduledFor);
    const isCallTime = Math.abs(now.getTime() - callTime.getTime()) < 15 * 60 * 1000; // 15 minutes window

    if (status === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    } else if (status === 'completed') {
      return <Badge variant="outline" className="bg-green-50 text-green-700">Completed</Badge>;
    } else if (callTime < now && status !== 'ongoing') {
      return <Badge variant="outline" className="bg-gray-50 text-gray-700">Missed</Badge>;
    } else if (isCallTime || status === 'ongoing') {
      return <Badge className="bg-blue-600">Ready to Join</Badge>;
    } else {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Scheduled</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
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
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Video Interviews</h3>
      {videoCalls.map((call) => {
        const { date, time } = formatDateTime(call.scheduled_for);
        const now = new Date();
        const callTime = new Date(call.scheduled_for);
        const isCallTime = Math.abs(now.getTime() - callTime.getTime()) < 15 * 60 * 1000;
        const canJoin = isCallTime || call.status === 'ongoing';

        return (
          <Card key={call.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center">
                  <Video className="h-4 w-4 mr-2" />
                  Video Interview
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
                {canJoin && call.meeting_url && (
                  <Button
                    onClick={() => handleJoinCall(call.meeting_url)}
                    className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Join Interview
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default VideoCallsList;
