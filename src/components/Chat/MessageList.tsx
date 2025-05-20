
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '@/services/ChatService';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading = false }) => {
  const { user } = useAuth();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">No messages yet</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Start the conversation by sending a message below
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 p-4">
      {messages.map((message) => {
        const isSelf = message.sender_id === user?.id;
        
        return (
          <div 
            key={message.id}
            className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                isSelf 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
              }`}
            >
              <p className="break-words">{message.content}</p>
              <p className={`mt-1 text-right text-xs ${
                isSelf ? 'text-primary-foreground/70' : 'text-gray-500 dark:text-gray-400'
              }`}>
                {format(new Date(message.created_at), 'h:mm a')}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;
