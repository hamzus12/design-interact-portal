
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import ConversationList from '@/components/Chat/ConversationList';
import MessageList from '@/components/Chat/MessageList';
import MessageInput from '@/components/Chat/MessageInput';
import VideoCallButton from '@/components/Chat/VideoCallButton';
import VideoCallsList from '@/components/Chat/VideoCallsList';
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
  const [dbUserId, setDbUserId] = useState<string | null>(null);

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

  // Load conversations
  useEffect(() => {
    if (!user?.id) return;

    const loadConversations = async () => {
      try {
        setLoading(true);
        
        const userId = await getDatabaseUserId(user.id);
        if (!userId) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not find your user profile. Please make sure you're properly logged in."
          });
          return;
        }
        
        setDbUserId(userId);
        const conversationsData = await chatService.getConversations(userId);
        setConversations(conversationsData);
        
        // If a conversation ID is provided in the URL, set it as active
        if (conversationId) {
          const conversation = conversationsData.find(c => c.id === conversationId);
          if (conversation) {
            setActiveConversation(conversation);
          } else {
            // If conversation not found, redirect to main chat page
            navigate('/chat');
            toast({
              variant: "destructive",
              title: "Conversation not found",
              description: "The requested conversation could not be found."
            });
          }
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error('Error loading conversations:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load conversations."
        });
        setLoading(false);
      }
    };

    loadConversations();
  }, [user?.id, conversationId, navigate, toast]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversation || !dbUserId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        setLoading(true);
        const messagesData = await chatService.getMessages(activeConversation.id);
        setMessages(messagesData);
        
        // Mark messages as read
        await chatService.markMessagesAsRead(activeConversation.id, dbUserId);
        
        setLoading(false);
      } catch (error: any) {
        console.error('Error loading messages:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message || "Failed to load messages."
        });
        setLoading(false);
      }
    };

    loadMessages();
  }, [activeConversation, dbUserId, toast]);

  // Setup real-time updates for new messages
  useEffect(() => {
    if (!activeConversation || !supabase || !dbUserId) return;

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
          if (newMessage.sender_id !== dbUserId) {
            await chatService.markMessagesAsRead(activeConversation.id, dbUserId);
          }
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversation, dbUserId]);

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    // Update URL to include conversation ID
    navigate(`/chat/${conversation.id}`);
  };

  const handleSendMessage = async (content: string) => {
    if (!dbUserId || !activeConversation) return;
    
    try {
      setSendingMessage(true);
      await chatService.sendMessage(activeConversation.id, dbUserId, content);
      setSendingMessage(false);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send message."
      });
      setSendingMessage(false);
    }
  };

  const handleCallScheduled = () => {
    // Refresh conversations to update any counters
    if (dbUserId) {
      chatService.getConversations(dbUserId).then(setConversations);
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
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    </div>
                  ) : (
                    <ConversationList 
                      conversations={conversations} 
                      activeConversationId={activeConversation?.id || null}
                      onSelectConversation={handleSelectConversation}
                    />
                  )}
                </div>
              </div>
            </Card>
          </div>
          
          {/* Chat area */}
          <div className="md:col-span-2 lg:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main chat */}
              <div className="lg:col-span-2">
                <Card className="h-[calc(100vh-200px)] overflow-hidden">
                  {!activeConversation ? (
                    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                      <h3 className="text-lg font-semibold">Select a conversation</h3>
                      <p className="text-gray-500">Choose a conversation from the list to start chatting</p>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col">
                      <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
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
                          <VideoCallButton 
                            conversationId={activeConversation.id}
                            onCallScheduled={handleCallScheduled}
                          />
                        </div>
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

              {/* Video calls sidebar */}
              {activeConversation && dbUserId && (
                <div className="lg:col-span-1">
                  <Card className="h-[calc(100vh-200px)] overflow-hidden">
                    <div className="p-4 h-full overflow-y-auto">
                      <VideoCallsList 
                        conversationId={activeConversation.id}
                        currentUserId={dbUserId}
                      />
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chat;
