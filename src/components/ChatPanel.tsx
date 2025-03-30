
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { useRoom } from '@/contexts/RoomContext';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

const ChatPanel: React.FC = () => {
  const { room } = useRoom();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.messages]);

  return (
    <div className="flex flex-col h-full bg-card rounded-lg overflow-hidden border">
      <div className="p-3 border-b bg-card flex items-center justify-between">
        <h3 className="font-medium">Chat</h3>
        <Badge variant="outline" className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500"></span>
          {room?.users.filter(u => u.isActive).length || 0} online
        </Badge>
      </div>
      
      <div className="p-3 bg-muted/30 border-b flex items-center gap-2 text-xs text-muted-foreground">
        <Info size={14} />
        <p>
          Use <span className="font-mono bg-muted px-1 rounded">/share [URL]</span> to share videos. 
          More commands: <span className="font-mono bg-muted px-1 rounded">/play</span>, <span className="font-mono bg-muted px-1 rounded">/pause</span>, <span className="font-mono bg-muted px-1 rounded">/seek [seconds]</span>, <span className="font-mono bg-muted px-1 rounded">/speed [rate]</span>
        </p>
      </div>

      <ScrollArea className="flex-1 p-0">
        <div className="flex flex-col min-h-full">
          <div className="flex-1">
            {room?.messages.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            ) : (
              room?.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </ScrollArea>
      
      <ChatInput />
    </div>
  );
};

export default ChatPanel;
