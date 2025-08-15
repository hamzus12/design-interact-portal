
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Star, Send, Lightbulb, Bug, Heart } from 'lucide-react';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface FeedbackFormProps {
  jobId?: string;
  onSubmit?: () => void;
}

export function FeedbackForm({ jobId, onSubmit }: FeedbackFormProps) {
  const [feedbackType, setFeedbackType] = useState<string>('general');
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToastNotifications();
  const { user } = useAuth();

  const feedbackTypes = [
    { value: 'general', label: 'Général', icon: Heart },
    { value: 'suggestion', label: 'Suggestion', icon: Lightbulb },
    { value: 'bug', label: 'Problème technique', icon: Bug },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      error({ title: 'Erreur', description: 'Vous devez être connecté pour envoyer un feedback' });
      return;
    }

    if (!message.trim()) {
      error({ title: 'Erreur', description: 'Veuillez saisir votre message' });
      return;
    }

    setIsSubmitting(true);

    try {
      // For now, we'll just simulate storing feedback
      // In a real app, you'd have a feedback table
      console.log('Feedback submitted:', {
        userId: user.id,
        jobId,
        type: feedbackType,
        rating,
        message: message.trim(),
        timestamp: new Date().toISOString()
      });

      success({ 
        title: 'Merci !', 
        description: 'Votre feedback a été envoyé avec succès' 
      });

      // Reset form
      setMessage('');
      setRating(0);
      setFeedbackType('general');
      
      onSubmit?.();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      error({ 
        title: 'Erreur', 
        description: 'Impossible d\'envoyer le feedback' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Votre avis nous intéresse
        </CardTitle>
        <CardDescription>
          Aidez-nous à améliorer votre expérience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-base font-medium">Type de feedback</Label>
            <RadioGroup value={feedbackType} onValueChange={setFeedbackType} className="mt-2">
              {feedbackTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <div key={type.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value} className="flex items-center gap-2 cursor-pointer">
                      <Icon className="w-4 h-4" />
                      {type.label}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <div>
            <Label className="text-base font-medium">Note globale (optionnel)</Label>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="message" className="text-base font-medium">
              Votre message *
            </Label>
            <Textarea
              id="message"
              placeholder="Partagez vos impressions, suggestions ou problèmes rencontrés..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2 min-h-[100px]"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !message.trim()}
          >
            {isSubmitting ? (
              'Envoi en cours...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer le feedback
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
