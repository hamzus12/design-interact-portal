
import { supabase } from '@/integrations/supabase/client';

export interface Conversation {
  id: string;
  job_id: string | null;
  candidate_id: string;
  recruiter_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  job?: {
    id: string;
    title: string;
    company: string;
  };
  candidate?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  recruiter?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  unread_count?: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

class ChatService {
  async createConversation(jobId: string, candidateId: string, recruiterId: string): Promise<Conversation> {
    try {
      console.log('Creating conversation with params:', { jobId, candidateId, recruiterId });
      
      // First, check if a conversation already exists for this job and users
      const { data: existingConversation, error: searchError } = await supabase
        .from('conversations')
        .select(`
          *,
          job:jobs(id, title, company),
          candidate:users!conversations_candidate_id_fkey(id, first_name, last_name, email),
          recruiter:users!conversations_recruiter_id_fkey(id, first_name, last_name, email)
        `)
        .eq('job_id', jobId)
        .eq('candidate_id', candidateId)
        .eq('recruiter_id', recruiterId)
        .maybeSingle();

      if (searchError) {
        console.error('Error searching for existing conversation:', searchError);
        // Don't throw error, continue to create new conversation
        console.log('Continuing to create new conversation despite search error');
      }

      if (existingConversation && !searchError) {
        console.log('Found existing conversation:', existingConversation);
        return existingConversation as Conversation;
      }

      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          job_id: jobId,
          candidate_id: candidateId,
          recruiter_id: recruiterId,
          last_message_at: new Date().toISOString()
        })
        .select(`
          *,
          job:jobs(id, title, company),
          candidate:users!conversations_candidate_id_fkey(id, first_name, last_name, email),
          recruiter:users!conversations_recruiter_id_fkey(id, first_name, last_name, email)
        `)
        .single();

      if (createError) {
        console.error('Error creating conversation:', createError);
        throw new Error(`Failed to create conversation: ${createError.message}`);
      }

      console.log('Created new conversation:', newConversation);
      return newConversation as Conversation;
    } catch (error) {
      console.error('Error in createConversation:', error);
      throw error;
    }
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      console.log('Fetching conversations for user:', userId);
      
      // First verify the user exists
      const { data: userCheck, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError || !userCheck) {
        console.error('User not found:', userError);
        throw new Error('User profile not found');
      }

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          job:jobs(id, title, company),
          candidate:users!conversations_candidate_id_fkey(id, first_name, last_name, email),
          recruiter:users!conversations_recruiter_id_fkey(id, first_name, last_name, email)
        `)
        .or(`candidate_id.eq.${userId},recruiter_id.eq.${userId}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        throw new Error(`Failed to fetch conversations: ${error.message}`);
      }

      console.log('Fetched conversations:', data?.length || 0);
      return (data || []) as Conversation[];
    } catch (error) {
      console.error('Error in getConversations:', error);
      throw error;
    }
  }

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      console.log('Fetching messages for conversation:', conversationId);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:users!chat_messages_sender_id_fkey(id, first_name, last_name, email)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw new Error(`Failed to fetch messages: ${error.message}`);
      }

      console.log('Fetched messages:', data?.length || 0);
      return (data || []) as ChatMessage[];
    } catch (error) {
      console.error('Error in getMessages:', error);
      throw error;
    }
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<ChatMessage> {
    try {
      console.log('Sending message:', { conversationId, senderId, content: content.substring(0, 50) + '...' });
      
      // Insert the message
      const { data: message, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content: content
        })
        .select(`
          *,
          sender:users!chat_messages_sender_id_fkey(id, first_name, last_name, email)
        `)
        .single();

      if (messageError) {
        console.error('Error sending message:', messageError);
        throw new Error(`Failed to send message: ${messageError.message}`);
      }

      // Update conversation's last_message_at
      const { error: updateError } = await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      if (updateError) {
        console.error('Error updating conversation timestamp:', updateError);
        // Don't throw here as the message was sent successfully
      }

      console.log('Message sent successfully:', message);
      return message as ChatMessage;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      console.log('Marking messages as read:', { conversationId, userId });
      
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error marking messages as read:', error);
        throw new Error(`Failed to mark messages as read: ${error.message}`);
      }

      console.log('Messages marked as read successfully');
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
