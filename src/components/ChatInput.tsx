
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useRoom } from '@/contexts/RoomContext';
import { extractVideoId } from '@/utils/youtube';

const ChatInput: React.FC = () => {
  const { sendMessage, shareVideo } = useRoom();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    
    try {
      // Check if it's a YouTube link (not starting with command)
      if (!message.startsWith('/') && (
        message.includes('youtube.com/') || 
        message.includes('youtu.be/')
      )) {
        const videoId = extractVideoId(message);
        
        if (videoId) {
          // It's a YouTube link, share it
          shareVideo(message);
          
          // Also send the message
          sendMessage(message);
        } else {
          // Not a valid YouTube link, just send as message
          sendMessage(message);
        }
      } else {
        // Regular message or command
        sendMessage(message);
      }
      
      // Clear input
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
      
      // Focus input again
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-card border-t">
      <Input
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message or paste a YouTube link..."
        className="flex-1"
        disabled={isSending}
      />
      
      <Button
        size="icon"
        onClick={handleSendMessage}
        disabled={!message.trim() || isSending}
        className="shrink-0"
      >
        <Send size={16} />
      </Button>
    </div>
  );
};

export default ChatInput;
