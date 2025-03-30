
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRoom } from '@/contexts/RoomContext';
import { UserPlus, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JoinRoomFormProps {
  onToggleForm: () => void;
}

const JoinRoomForm: React.FC<JoinRoomFormProps> = ({ onToggleForm }) => {
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');
  const { joinRoom, isJoining } = useRoom();
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomCode.trim()) {
      toast({
        title: "Room code required",
        description: "Please enter a valid room code",
        variant: "destructive",
      });
      return;
    }
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }
    
    joinRoom(roomCode.trim(), name.trim());
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="room-code">Room Code</Label>
        <Input
          id="room-code"
          placeholder="Enter 6-digit code (e.g. ABC123)"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          maxLength={6}
          required
          autoComplete="off"
          className="text-center font-mono uppercase tracking-widest"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="username">Your Name</Label>
        <Input
          id="username"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={20}
        />
      </div>
      
      <div className="pt-2 space-y-2">
        <Button 
          type="submit" 
          className="w-full"
          disabled={isJoining}
        >
          {isJoining ? (
            <span className="flex items-center gap-2">
              <span className="animate-pulse">Joining room...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <LogIn size={16} />
              Join Room
            </span>
          )}
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          className="w-full"
          onClick={onToggleForm}
          disabled={isJoining}
        >
          <UserPlus size={16} className="mr-2" />
          Create a new room
        </Button>
      </div>
    </form>
  );
};

export default JoinRoomForm;
