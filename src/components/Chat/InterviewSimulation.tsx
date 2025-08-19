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
  const [isStarted, setIsStarted] = useState(false);
  const [interviewStatus, setInterviewStatus] = useState<'waiting' | 'active' | 'completed'>('waiting');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const startInterview = async () => {
    setIsStarted(true);
    setInterviewStatus('active');
    
    await sendMessage('Bonjour, je suis prêt(e) pour l\'entretien. Pouvez-vous commencer?');
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
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Simulation d'entretien
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {jobTitle} - {company}
            </p>
          </div>
          {getStatusBadge()}
        </div>
        <Separator />
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {!isStarted ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center space-y-4">
              <Bot className="w-16 h-16 text-primary mx-auto" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Prêt pour votre entretien ?</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Cette simulation vous permettra de pratiquer un entretien d'embauche 
                  avec un recruteur virtuel expérimenté.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                  <AlertCircle className="w-4 h-4" />
                  <span>L'entretien sera adapté au poste et à votre profil</span>
                </div>
              </div>
              <Button onClick={startInterview} size="lg" className="px-8">
                <MessageCircle className="w-4 h-4 mr-2" />
                Commencer l'entretien
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`flex gap-3 max-w-[80%] ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      <div
                        className={`rounded-lg px-4 py-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <span className="text-xs opacity-70 mt-1 block">
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
                    <div className="bg-muted rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Le recruteur réfléchit...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2 mb-3">
                {interviewStatus === 'active' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={endInterview}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Terminer l'entretien
                  </Button>
                )}
              </div>
              
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
                  className="flex-1"
                />
                <Button
                  onClick={() => sendMessage(inputMessage)}
                  disabled={!inputMessage.trim() || isLoading || interviewStatus === 'completed'}
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InterviewSimulation;