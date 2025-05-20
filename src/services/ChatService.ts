
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface Conversation {
  id: string;
  job_id: string;
  candidate_id: string;
  recruiter_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  job?: any;
  candidate?: any;
  recruiter?: any;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

class ChatService {
  /**
   * Get conversations for a user
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          job:jobs(*),
          candidate:users!conversations_candidate_id_fkey(*),
          recruiter:users!conversations_recruiter_id_fkey(*)
        `)
        .or(`candidate_id.eq.${userId},recruiter_id.eq.${userId}`)
        .order('last_message_at', { ascending: false });
      
      if (error) throw new Error(handleSupabaseError(error));
      
      return data || [];
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      throw new Error(err.message || 'Failed to fetch conversations');
    }
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw new Error(handleSupabaseError(error));
      
      return data || [];
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      throw new Error(err.message || 'Failed to fetch messages');
    }
  }

  /**
   * Create a new conversation or get existing one between candidate and recruiter
   */
  async createConversation(jobId: string | number, candidateId: string, recruiterId: string): Promise<Conversation> {
    try {
      // Check if conversation already exists
      const { data: existingConversation, error: checkError } = await supabase
        .from('conversations')
        .select('*')
        .eq('job_id', jobId)
        .eq('candidate_id', candidateId)
        .eq('recruiter_id', recruiterId)
        .single();
      
      if (!checkError && existingConversation) {
        console.log('Conversation already exists:', existingConversation);
        return existingConversation;
      }
      
      // Create new conversation
      const { data: newConversation, error: insertError } = await supabase
        .from('conversations')
        .insert({
          job_id: jobId,
          candidate_id: candidateId,
          recruiter_id: recruiterId
        })
        .select()
        .single();
      
      if (insertError) throw new Error(handleSupabaseError(insertError));
      
      if (!newConversation) throw new Error('Failed to create conversation');
      
      return newConversation;
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      throw new Error(err.message || 'Failed to create conversation');
    }
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(conversationId: string, senderId: string, content: string): Promise<void> {
    try {
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content: content
        });
      
      if (messageError) throw new Error(handleSupabaseError(messageError));
      
      // Update conversation's last_message_at timestamp
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
      
      if (updateError) throw new Error(handleSupabaseError(updateError));
    } catch (err: any) {
      console.error('Error sending message:', err);
      throw new Error(err.message || 'Failed to send message');
    }
  }

  /**
   * Mark all messages in a conversation as read for a user
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId);
      
      if (error) throw new Error(handleSupabaseError(error));
    } catch (err: any) {
      console.error('Error marking messages as read:', err);
      // Don't throw an error here as this is not a critical function
    }
  }
}

export const chatService = new ChatService();
