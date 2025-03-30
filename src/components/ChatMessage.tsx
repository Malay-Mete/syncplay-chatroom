
import React from 'react';
import { ChatMessage as ChatMessageType } from '@/types';
import UserAvatar from './UserAvatar';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isSystem = message.userId === 'system';
  
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format message content to highlight commands
  const formatContent = (content: string) => {
    if (message.isCommand) {
      return (
        <span className="chat-command">{content}</span>
      );
    }
    
    if (isSystem) {
      return (
        <span className="italic text-muted-foreground">{content}</span>
      );
    }
    
    return <span>{content}</span>;
  };

  return (
    <div className={cn(
      "flex gap-2 p-2 rounded hover:bg-secondary/50 transition-colors",
      isSystem && "bg-secondary/20"
    )}>
      {!isSystem && (
        <UserAvatar user={{ id: message.userId, name: message.userName, isActive: true }} size="sm" />
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className={cn(
            "font-medium text-sm",
            isSystem && "text-synctube-purple"
          )}>
            {message.userName}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatTime(message.timestamp)}
          </span>
        </div>
        
        <div className="text-sm mt-0.5">
          {formatContent(message.content)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
