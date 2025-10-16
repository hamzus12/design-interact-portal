import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  User, 
  Send, 
  Loader2, 
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface InterviewSimulationProps {
  jobId?: string;
  jobTitle?: string;
  company?: string;
  onComplete?: (messages: Message[]) => void;
}

const InterviewSimulation: React.FC<InterviewSimulationProps> = ({
  jobId,
  jobTitle = "Entretien général",
  company = "Entreprise",
  onComplete
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStarted, setIsStarted] = useState(true);
  const [interviewStatus, setInterviewStatus] = useState<'waiting' | 'active' | 'completed'>('active');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isStarted && messages.length === 0) {
      const welcomeMessage: Message = {
        id: `assistant-welcome-${Date.now()}`,
        role: 'assistant',
        content: `Bonjour ! Je suis ravi(e) de vous rencontrer pour cet entretien concernant le poste de ${jobTitle} chez ${company}. Pourriez-vous commencer par vous présenter brièvement ?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isStarted]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare conversation history for API
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Get candidate profile from user metadata
      const candidateProfile = user ? {
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name,
        email: user.email
      } : null;

      const { data, error } = await supabase.functions.invoke('interview-simulation', {
        body: {
          message: messageText,
          conversationHistory,
          jobId,
          candidateProfile
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message. Veuillez réessayer.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };


  const endInterview = () => {
    setInterviewStatus('completed');
    if (onComplete) {
      onComplete(messages);
    }
    
    toast({
      title: 'Entretien terminé',
      description: 'L\'entretien de simulation a été terminé avec succès.'
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  const getStatusBadge = () => {
    switch (interviewStatus) {
      case 'waiting':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'active':
        return <Badge variant="default"><MessageCircle className="w-3 h-3 mr-1" />En cours</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Terminé</Badge>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header fixe */}
      <div className="flex-shrink-0 border-b bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-base">{jobTitle}</h2>
              <p className="text-sm text-muted-foreground">{company}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Zone de messages avec scroll */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex gap-3 max-w-[85%] ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-60 mt-1.5 block">
                    {message.timestamp.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-card border rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Le recruteur réfléchit...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Zone d'input fixe en bas */}
      <div className="flex-shrink-0 border-t bg-background p-4">
        <div className="max-w-3xl mx-auto">
          {interviewStatus === 'active' && (
            <div className="flex justify-end mb-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={endInterview}
                className="text-muted-foreground hover:text-destructive"
              >
                Terminer l'entretien
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                interviewStatus === 'active' 
                  ? "Tapez votre réponse..." 
                  : "L'entretien est terminé"
              }
              disabled={isLoading || interviewStatus === 'completed'}
              className="flex-1 rounded-full"
            />
            <Button
              onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isLoading || interviewStatus === 'completed'}
              size="icon"
              className="rounded-full"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewSimulation;