import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import ConversationList from '@/components/Chat/ConversationList';
import MessageList from '@/components/Chat/MessageList';
import MessageInput from '@/components/Chat/MessageInput';
import { useAuth } from '@/context/AuthContext';
import { chatService, Conversation, ChatMessage } from '@/services/ChatService';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { useUserRole } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';

const Chat: React.FC = () => {
  const { id: conversationId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { role } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Load conversations
  useEffect(() => {
    if (!user?.id) return;

    const loadConversations = async () => {
      try {
        setLoading(true);
        const conversationsData = await chatService.getConversations(user.id);
        setConversations(conversationsData);
        
        // If a conversation ID is provided in the URL, set it as active
        if (conversationId) {
          const conversation = conversationsData.find(c => c.id === conversationId);
          if (conversation) {
            setActiveConversation(conversation);
          } else {
            // If conversation not found, redirect to main chat page
            navigate('/chat');
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load conversations."
        });
        setLoading(false);
      }
    };

    loadConversations();
  }, [user?.id, conversationId, navigate, toast]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        setLoading(true);
        const messagesData = await chatService.getMessages(activeConversation.id);
        setMessages(messagesData);
        
        // Mark messages as read
        if (user?.id) {
          await chatService.markMessagesAsRead(activeConversation.id, user.id);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load messages."
        });
        setLoading(false);
      }
    };

    loadMessages();
  }, [activeConversation, user?.id, toast]);

  // Setup real-time updates for new messages
  useEffect(() => {
    if (!activeConversation || !supabase) return;

    const channel = supabase
      .channel('chat-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${activeConversation.id}`
        },
        async (payload) => {
          // Add the new message to the messages array
          const newMessage = payload.new as ChatMessage;
          setMessages((prevMessages) => [...prevMessages, newMessage]);
          
          // Mark messages as read if the message is from someone else
          if (user?.id && newMessage.sender_id !== user.id) {
            await chatService.markMessagesAsRead(activeConversation.id, user.id);
          }
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation, user?.id]);

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    // Update URL to include conversation ID
    navigate(`/chat/${conversation.id}`);
  };

  const handleSendMessage = async (content: string) => {
    if (!user?.id || !activeConversation) return;
    
    try {
      setSendingMessage(true);
      await chatService.sendMessage(activeConversation.id, user.id, content);
      setSendingMessage(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message."
      });
      setSendingMessage(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="mb-6 text-2xl font-bold">Messages</h1>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {/* Conversations sidebar */}
          <div className="md:col-span-1">
            <Card className="h-[calc(100vh-200px)] overflow-hidden">
              <div className="flex h-full flex-col">
                <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                  <h2 className="font-semibold">Conversations</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <ConversationList 
                    conversations={conversations} 
                    activeConversationId={activeConversation?.id || null}
                    onSelectConversation={handleSelectConversation}
                  />
                </div>
              </div>
            </Card>
          </div>
          
          {/* Chat area */}
          <div className="md:col-span-2 lg:col-span-3">
            <Card className="h-[calc(100vh-200px)] overflow-hidden">
              {!activeConversation ? (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <h3 className="text-lg font-semibold">Select a conversation</h3>
                  <p className="text-gray-500">Choose a conversation from the list to start chatting</p>
                </div>
              ) : (
                <div className="flex h-full flex-col">
                  <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                    <h2 className="font-semibold">
                      {role === 'candidate' 
                        ? activeConversation.recruiter?.first_name 
                        : activeConversation.candidate?.first_name} 
                      {" "}
                      {role === 'candidate' 
                        ? activeConversation.recruiter?.last_name 
                        : activeConversation.candidate?.last_name}
                    </h2>
                    {activeConversation.job && (
                      <p className="text-sm text-gray-500">
                        {activeConversation.job.title} at {activeConversation.job.company}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto">
                    <MessageList messages={messages} isLoading={loading} />
                  </div>
                  
                  <MessageInput 
                    onSendMessage={handleSendMessage}
                    isDisabled={sendingMessage}
                  />
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
