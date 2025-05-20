
import React from 'react';
import { Conversation } from '@/services/ChatService';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  activeConversationId, 
  onSelectConversation 
}) => {
  const { user } = useAuth();

  if (!conversations.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">No conversations yet</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Your conversations with recruiters or candidates will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {conversations.map((conversation) => {
        // Determine if the current user is the candidate or recruiter
        const isCandidate = user?.id === conversation.candidate_id;
        const otherPartyName = isCandidate 
          ? `${conversation.recruiter?.first_name || ''} ${conversation.recruiter?.last_name || ''}` 
          : `${conversation.candidate?.first_name || ''} ${conversation.candidate?.last_name || ''}`;
        
        return (
          <div
            key={conversation.id}
            className={`cursor-pointer p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
              activeConversationId === conversation.id ? 'bg-gray-100 dark:bg-gray-800' : ''
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700">
                  {/* Profile image would go here */}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-gray-900 dark:text-white">
                    {otherPartyName || 'Unknown User'}
                  </p>
                  {conversation.job && (
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      {conversation.job.title} at {conversation.job.company}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end">
                {conversation.last_message_at && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {format(new Date(conversation.last_message_at), 'MMM d')}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
