
import { useState, useCallback } from 'react';
import { useJobPersona } from '@/context/JobPersonaContext';
import { toast } from '@/components/ui/use-toast';

export interface Message {
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp?: Date;
}

export function useConversation() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);

  const { simulateConversation } = useJobPersona();

  const initializeConversation = useCallback((jobTitle: string, company: string) => {
    const systemMessage: Message = {
      role: 'system',
      content: `Simulation d'entretien initiée pour le poste de ${jobTitle} chez ${company}`,
      timestamp: new Date()
    };

    const welcomeMessage: Message = {
      role: 'ai',
      content: `Bonjour ! Je suis ravi de vous rencontrer pour discuter du poste de ${jobTitle}. Comment allez-vous aujourd'hui ?`,
      timestamp: new Date()
    };

    setMessages([systemMessage, welcomeMessage]);
    setConversationHistory([]);
  }, []);

  const sendMessage = useCallback(async (jobId: string, content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsResponding(true);

    try {
      const response = await simulateConversation(jobId, content, conversationHistory);

      const aiMessage: Message = {
        role: 'ai',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setConversationHistory(prev => [...prev, userMessage, aiMessage]);

    } catch (error) {
      console.error("Error in conversation:", error);
      
      const errorMessage: Message = {
        role: 'ai',
        content: "Je suis désolé, je rencontre des difficultés techniques. Pourriez-vous reformuler votre question ?",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Erreur de conversation",
        description: "Problème de communication avec l'IA",
        variant: "destructive"
      });
    } finally {
      setIsResponding(false);
    }
  }, [simulateConversation, conversationHistory]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setConversationHistory([]);
  }, []);

  return {
    messages,
    isResponding,
    initializeConversation,
    sendMessage,
    clearConversation
  };
}
