
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, LogOut, Users } from 'lucide-react';
import { useRoom } from '@/contexts/RoomContext';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import UserAvatar from './UserAvatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const RoomHeader: React.FC = () => {
  const { room, leaveRoom } = useRoom();
  const { toast } = useToast();
  
  if (!room) return null;

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.id);
    toast({
      title: 'Room code copied',
      description: 'You can now share it with friends to invite them.',
    });
  };
  
  const activeUsers = room.users.filter(user => user.isActive);

  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-lg border mb-4">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold">{room.name}</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <span>Room Code: {room.id}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={copyRoomCode}
            className="h-5 w-5"
          >
            <Copy size={14} />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Users size={14} />
              {activeUsers.length}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-0" align="end">
            <div className="p-2 font-medium border-b">
              Users in room
            </div>
            <ScrollArea className="max-h-56">
              {activeUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center p-2 gap-2 hover:bg-muted/50"
                >
                  <UserAvatar user={user} size="sm" showStatus />
                  <span className="text-sm">{user.name}</span>
                </div>
              ))}
            </ScrollArea>
          </PopoverContent>
        </Popover>
        
        <Button
          variant="outline"
          size="sm"
          onClick={leaveRoom}
          className="flex items-center gap-1 text-destructive hover:text-destructive"
        >
          <LogOut size={14} />
          Leave Room
        </Button>
      </div>
    </div>
  );
};

export default RoomHeader;
