
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface Conversation {
  id: string;
  job_id: string | null;
  candidate_id: string;
  recruiter_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  job?: {
    title: string;
    company: string;
  };
  candidate?: {
    first_name: string;
    last_name: string;
    profile_image: string | null;
  };
  recruiter?: {
    first_name: string;
    last_name: string;
    profile_image: string | null;
  };
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export const chatService = {
  // Get all conversations for the current user
  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        job:job_id (
          title,
          company
        )
      `)
      .or(`candidate_id.eq.${userId},recruiter_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  },

  // Get a specific conversation by ID
  async getConversation(id: string): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        job:job_id (
          title,
          company
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Get all messages for a conversation
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at');

    if (error) throw new Error(error.message);
    return data || [];
  },

  // Send a message in a conversation
  async sendMessage(conversationId: string, senderId: string, content: string): Promise<ChatMessage> {
    const message = {
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    };

    const { data, error } = await supabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    // Update the conversation's last_message_at timestamp
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data;
  },

  // Create a new conversation between a candidate and recruiter
  async createConversation(jobId: string, candidateId: string, recruiterId: string): Promise<Conversation> {
    const conversation = {
      job_id: jobId,
      candidate_id: candidateId,
      recruiter_id: recruiterId,
    };

    const { data, error } = await supabase
      .from('conversations')
      .insert(conversation)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // Mark messages as read
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('chat_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);

    if (error) throw new Error(error.message);
  },
};
