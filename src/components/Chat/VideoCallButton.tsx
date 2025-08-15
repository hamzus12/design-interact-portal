
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
import { useUserRole } from '@/context/UserContext';
import { Video, Calendar as CalendarIcon, Lock } from 'lucide-react';

interface VideoCallButtonProps {
  conversationId: string;
  onCallScheduled?: () => void;
}

const VideoCallButton: React.FC<VideoCallButtonProps> = ({ 
  conversationId, 
  onCallScheduled 
}) => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  // Only recruiters can schedule video calls
  if (role !== 'recruiter') {
    return (
      <Button variant="outline" size="sm" disabled>
        <Lock className="h-4 w-4 mr-2" />
        Réservé aux Recruteurs
      </Button>
    );
  }

  // Get database user ID
  const getDatabaseUserId = async (authUserId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('user_id', authUserId)
        .single();
      
      if (error || !data) {
        console.error('Error getting database user ID:', error);
        return null;
      }
      return data.id;
    } catch (err) {
      console.error('Exception getting database user ID:', err);
      return null;
    }
  };

  const generateMeetingUrl = () => {
    // Generate a simple meeting room URL with a random ID
    const roomId = `interview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return `https://meet.google.com/${roomId}`;
  };

  const handleScheduleCall = async () => {
    if (!user?.id || !selectedDate || !selectedTime) {
      toast({
        title: 'Information manquante',
        description: 'Veuillez sélectionner une date et une heure pour l\'appel vidéo',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsScheduling(true);
      
      const dbUserId = await getDatabaseUserId(user.id);
      if (!dbUserId) {
        throw new Error('Impossible de trouver votre profil utilisateur');
      }

      // Combine date and time
      const scheduledDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));

      // Check if the selected time is in the future
      if (scheduledDateTime <= new Date()) {
        toast({
          title: 'Date invalide',
          description: 'Veuillez sélectionner une date et heure futures',
          variant: 'destructive'
        });
        return;
      }

      const meetingUrl = generateMeetingUrl();

      console.log('Scheduling video call with data:', {
        conversation_id: conversationId,
        scheduled_by: dbUserId,
        scheduled_for: scheduledDateTime.toISOString(),
        duration_minutes: duration,
        meeting_url: meetingUrl,
        notes: notes || null
      });

      const { error: insertError } = await supabase
        .from('video_calls')
        .insert({
          conversation_id: conversationId,
          scheduled_by: dbUserId,
          scheduled_for: scheduledDateTime.toISOString(),
          duration_minutes: duration,
          meeting_url: meetingUrl,
          notes: notes || null,
          status: 'scheduled'
        });

      if (insertError) {
        console.error('Error inserting video call:', insertError);
        throw insertError;
      }

      // Send a message about the scheduled call
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: dbUserId,
          content: `📅 Entretien vidéo planifié pour le ${scheduledDateTime.toLocaleDateString('fr-FR')} à ${selectedTime}. Durée: ${duration} minutes.\n\n${notes ? `Notes: ${notes}\n\n` : ''}Le lien de réunion sera partagé plus près de l'heure de l'entretien.`
        });

      if (messageError) {
        console.error('Error sending message:', messageError);
        // Don't throw here as the call was scheduled successfully
      }

      toast({
        title: 'Appel vidéo planifié',
        description: `Entretien planifié pour le ${scheduledDateTime.toLocaleDateString('fr-FR')} à ${selectedTime}`,
      });

      // Reset form and close dialog
      setIsOpen(false);
      setSelectedDate(undefined);
      setSelectedTime('');
      setNotes('');
      setDuration(60);
      onCallScheduled?.();

    } catch (error: any) {
      console.error('Error scheduling video call:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Échec de la planification de l\'appel vidéo',
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
          Planifier Entretien
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Planifier un Entretien Vidéo
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Sélectionner la date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>

          <div>
            <Label htmlFor="time">Sélectionner l'heure</Label>
            <Input
              id="time"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="duration">Durée (minutes)</Label>
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
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajoutez des notes sur l'entretien..."
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
              {isScheduling ? 'Planification...' : 'Planifier l\'Entretien'}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoCallButton;
