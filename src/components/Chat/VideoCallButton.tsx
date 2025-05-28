
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Video, Calendar as CalendarIcon } from 'lucide-react';

interface VideoCallButtonProps {
  conversationId: string;
  onCallScheduled?: () => void;
}

const VideoCallButton: React.FC<VideoCallButtonProps> = ({ 
  conversationId, 
  onCallScheduled 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  // Get database user ID
  const getDatabaseUserId = async (authUserId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', authUserId)
        .single();
      
      if (error || !data) return null;
      return data.id;
    } catch (err) {
      return null;
    }
  };

  const generateMeetingUrl = () => {
    // Generate a simple meeting room URL (in production, integrate with actual video service)
    const roomId = `job-interview-${Date.now()}`;
    return `https://meet.jobfinder.com/room/${roomId}`;
  };

  const handleScheduleCall = async () => {
    if (!user?.id || !selectedDate || !selectedTime) {
      toast({
        title: 'Missing Information',
        description: 'Please select a date and time for the video call',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsScheduling(true);
      
      const dbUserId = await getDatabaseUserId(user.id);
      if (!dbUserId) {
        throw new Error('Could not find your user profile');
      }

      // Combine date and time
      const scheduledDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

      const meetingUrl = generateMeetingUrl();

      const { error } = await supabase
        .from('video_calls')
        .insert({
          conversation_id: conversationId,
          scheduled_by: dbUserId,
          scheduled_for: scheduledDateTime.toISOString(),
          duration_minutes: duration,
          meeting_url: meetingUrl,
          notes: notes || null
        });

      if (error) throw error;

      // Send a message about the scheduled call
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: dbUserId,
          content: `📅 Video interview scheduled for ${scheduledDateTime.toLocaleDateString()} at ${selectedTime}. Duration: ${duration} minutes.\n\n${notes ? `Notes: ${notes}\n\n` : ''}Meeting link will be shared closer to the interview time.`
        });

      toast({
        title: 'Video Call Scheduled',
        description: `Interview scheduled for ${scheduledDateTime.toLocaleDateString()} at ${selectedTime}`,
      });

      setIsOpen(false);
      setSelectedDate(undefined);
      setSelectedTime('');
      setNotes('');
      onCallScheduled?.();
    } catch (error: any) {
      console.error('Error scheduling video call:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to schedule video call',
        variant: 'destructive'
      });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Video className="h-4 w-4 mr-2" />
          Schedule Interview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Schedule Video Interview
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Select Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>

          <div>
            <Label htmlFor="time">Select Time</Label>
            <Input
              id="time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
              min="15"
              max="180"
              step="15"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about the interview..."
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex space-x-2 pt-4">
            <Button
              onClick={handleScheduleCall}
              disabled={isScheduling || !selectedDate || !selectedTime}
              className="flex-1"
            >
              {isScheduling ? 'Scheduling...' : 'Schedule Interview'}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoCallButton;
