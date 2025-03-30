
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useRoom } from '@/contexts/RoomContext';
import { UserPlus, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateRoomFormProps {
  onToggleForm: () => void;
}

const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ onToggleForm }) => {
  const [roomName, setRoomName] = useState('');
  const [name, setName] = useState('');
  const { createRoom, isJoining } = useRoom();
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      toast({
        title: "Room name required",
        description: "Please enter a room name",
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
    
    createRoom(roomName.trim(), name.trim());
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="room-name">Room Name</Label>
        <Input
          id="room-name"
          placeholder="Enter room name (e.g. Movie Night)"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          maxLength={30}
          required
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
              <span className="animate-pulse">Creating room...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <UserPlus size={16} />
              Create Room
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
          <LogIn size={16} className="mr-2" />
          Join an existing room
        </Button>
      </div>
    </form>
  );
};

export default CreateRoomForm;
