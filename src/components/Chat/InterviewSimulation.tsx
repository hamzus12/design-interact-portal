import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Bot, 
  User, 
  Send, 
  Loader2, 
  MessageCircle,
  Clock,
  CheckCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
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
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      if (inputMessage.trim()) {
        sendMessage(inputMessage);
      }
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
    <div className="h-full flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Header élégant avec gradient */}
      <div className="flex-shrink-0 bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                  <Bot className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
            </div>
            <div>
              <h2 className="font-bold text-lg">{jobTitle}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <span>{company}</span>
                <span className="text-xs">• Recruteur IA</span>
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Zone de messages scrollable avec padding adapté */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-fade-in ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-muted">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={`flex flex-col gap-1 max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`rounded-2xl px-5 py-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-sm'
                      : 'bg-card border-2 border-muted rounded-tl-sm'
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground px-2">
                  {message.timestamp.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {message.role === 'user' && (
                <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start animate-fade-in">
              <Avatar className="h-10 w-10 border-2 border-muted">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                  <Bot className="h-5 w-5 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-card border-2 border-muted rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Le recruteur réfléchit...</span>
                </div>
              </div>
            </div>
          )}
          
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-12 animate-fade-in">
              <Bot className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-muted-foreground">La conversation va commencer...</p>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Zone d'input moderne avec boutons */}
      <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="max-w-4xl mx-auto px-6 py-4">
          {interviewStatus === 'active' && messages.length > 2 && (
            <div className="flex justify-end mb-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={endInterview}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                Terminer l'entretien
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  interviewStatus === 'active' 
                    ? "Écrivez votre réponse..." 
                    : "L'entretien est terminé"
                }
                disabled={isLoading || interviewStatus === 'completed'}
                className="pr-12 h-12 rounded-full border-2 focus:border-primary transition-all"
              />
            </div>
            <Button
              onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isLoading || interviewStatus === 'completed'}
              size="icon"
              className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          {interviewStatus === 'active' && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Appuyez sur Entrée pour envoyer • Shift + Entrée pour une nouvelle ligne
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewSimulation;