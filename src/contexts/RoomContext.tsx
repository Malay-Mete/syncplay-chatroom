
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Room, User, VideoState, ChatMessage, ChatCommand } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { createNewRoom, addSystemMessage, addUserToRoom, removeUserFromRoom } from '@/utils/room';
import { extractVideoId } from '@/utils/youtube';
import { v4 as uuidv4 } from 'uuid';

interface RoomContextProps {
  currentUser: User | null;
  room: Room | null;
  isJoining: boolean;
  processCommand: (command: string) => void;
  sendMessage: (content: string) => void;
  createRoom: (roomName: string, userName: string) => void;
  joinRoom: (roomId: string, userName: string) => void;
  leaveRoom: () => void;
  updateVideoState: (updates: Partial<VideoState>) => void;
  shareVideo: (url: string) => void;
}

const RoomContext = createContext<RoomContextProps | undefined>(undefined);

// Temporary mock data for local development until Supabase is connected
const mockRoom: Room = {
  id: 'DEMO123',
  name: 'Demo Room',
  users: [
    { id: 'system', name: 'System', isActive: true },
    { id: 'user1', name: 'Jane', isActive: true },
  ],
  videoState: {
    videoId: 'dQw4w9WgXcQ', // Sample video
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    speed: 1,
    volume: 100,
    lastUpdated: Date.now(),
  },
  messages: [
    {
      id: 'msg1',
      userId: 'system',
      userName: 'System',
      content: 'Welcome to SyncTube! Share YouTube videos and watch them together.',
      timestamp: Date.now() - 60000,
      isCommand: false,
    },
    {
      id: 'msg2',
      userId: 'user1',
      userName: 'Jane',
      content: 'Hi everyone! Let\'s watch something fun!',
      timestamp: Date.now() - 30000,
      isCommand: false,
    },
  ],
  createdAt: Date.now() - 120000,
};

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [isJoining, setIsJoining] = useState<boolean>(false);
  const { toast } = useToast();

  // Process command from chat
  const processCommand = (commandText: string) => {
    if (!room || !currentUser) return;
    
    const command = commandText.trim().toLowerCase();
    
    if (command.startsWith('/play')) {
      updateVideoState({ isPlaying: true });
      sendSystemMessage(`${currentUser.name} started the video`);
    } 
    else if (command.startsWith('/pause')) {
      updateVideoState({ isPlaying: false });
      sendSystemMessage(`${currentUser.name} paused the video`);
    }
    else if (command.startsWith('/seek')) {
      const timeStr = command.replace('/seek', '').trim();
      const time = parseInt(timeStr);
      
      if (!isNaN(time) && time >= 0) {
        updateVideoState({ currentTime: time });
        sendSystemMessage(`${currentUser.name} jumped to ${time} seconds`);
      }
    }
    else if (command.startsWith('/speed')) {
      const speedStr = command.replace('/speed', '').trim();
      const speed = parseFloat(speedStr);
      
      if (!isNaN(speed) && speed > 0 && speed <= 2) {
        updateVideoState({ speed });
        sendSystemMessage(`${currentUser.name} set playback speed to ${speed}x`);
      }
    }
    else if (command.startsWith('/volume')) {
      const volumeStr = command.replace('/volume', '').trim();
      const volume = parseInt(volumeStr);
      
      if (!isNaN(volume) && volume >= 0 && volume <= 100) {
        updateVideoState({ volume });
        sendSystemMessage(`${currentUser.name} set volume to ${volume}%`);
      }
    }
    else if (command.startsWith('/share')) {
      const url = command.replace('/share', '').trim();
      shareVideo(url);
    }
    else {
      // Unknown command
      toast({
        title: "Unknown Command",
        description: `Command "${command}" is not recognized.`,
        variant: "destructive",
      });
    }
  };

  const sendMessage = (content: string) => {
    if (!room || !currentUser) return;
    
    // Check if it's a command
    if (content.startsWith('/')) {
      processCommand(content);
      
      // Add the command to chat history
      const newMessage: ChatMessage = {
        id: uuidv4(),
        userId: currentUser.id,
        userName: currentUser.name,
        content,
        timestamp: Date.now(),
        isCommand: true,
      };
      
      setRoom(prevRoom => {
        if (!prevRoom) return null;
        return {
          ...prevRoom,
          messages: [...prevRoom.messages, newMessage],
        };
      });
      
      return;
    }
    
    // Regular message
    const newMessage: ChatMessage = {
      id: uuidv4(),
      userId: currentUser.id,
      userName: currentUser.name,
      content,
      timestamp: Date.now(),
      isCommand: false,
    };
    
    setRoom(prevRoom => {
      if (!prevRoom) return null;
      return {
        ...prevRoom,
        messages: [...prevRoom.messages, newMessage],
      };
    });
  };

  const sendSystemMessage = (content: string) => {
    if (!room) return;
    
    const systemMessage: ChatMessage = {
      id: `system-${Date.now()}`,
      userId: 'system',
      userName: 'System',
      content,
      timestamp: Date.now(),
      isCommand: false,
    };
    
    setRoom(prevRoom => {
      if (!prevRoom) return null;
      return {
        ...prevRoom,
        messages: [...prevRoom.messages, systemMessage],
      };
    });
  };

  const createRoom = (roomName: string, userName: string) => {
    setIsJoining(true);
    
    try {
      // Generate user ID
      const userId = uuidv4();
      
      // Create user
      const user: User = {
        id: userId,
        name: userName,
        isActive: true,
      };
      
      // Create room
      let newRoom = createNewRoom(roomName, userId, userName);
      
      // Add welcome message
      newRoom = addSystemMessage(
        newRoom, 
        `Welcome to ${roomName}! Share YouTube videos by pasting a link or using /share command.`
      );
      
      // Set state
      setCurrentUser(user);
      setRoom(newRoom);
      
      toast({
        title: "Room Created",
        description: `You've created room ${newRoom.id}`,
      });
    } catch (error) {
      console.error("Error creating room:", error);
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const joinRoom = (roomId: string, userName: string) => {
    setIsJoining(true);
    
    try {
      // For demo, we'll use the mockRoom when Supabase is not connected
      // In the final version, this would fetch the room from Supabase
      
      if (roomId.toUpperCase() === 'DEMO123') {
        // Generate user ID
        const userId = uuidv4();
        
        // Create user
        const user: User = {
          id: userId,
          name: userName,
          isActive: true,
        };
        
        // Add user to mock room
        const updatedRoom = addUserToRoom(mockRoom, user);
        
        // Add welcome message
        const roomWithMessage = addSystemMessage(
          updatedRoom,
          `${userName} joined the room.`
        );
        
        setCurrentUser(user);
        setRoom(roomWithMessage);
        
        toast({
          title: "Joined Room",
          description: `You've joined ${mockRoom.name}`,
        });
      } else {
        // For testing purposes, create a new room if it doesn't exist
        const newUser: User = {
          id: uuidv4(),
          name: userName,
          isActive: true,
        };
        
        // Create a simple room with the given ID
        const newRoom: Room = {
          id: roomId.toUpperCase(),
          name: `Room ${roomId.toUpperCase()}`,
          users: [newUser],
          videoState: {
            videoId: null, // No video initially
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            speed: 1,
            volume: 100,
            lastUpdated: Date.now(),
          },
          messages: [{
            id: 'welcome',
            userId: 'system',
            userName: 'System',
            content: 'Welcome! Share a YouTube video link to get started.',
            timestamp: Date.now(),
            isCommand: false,
          }],
          createdAt: Date.now(),
        };
        
        setCurrentUser(newUser);
        setRoom(newRoom);
        
        toast({
          title: "Room Created",
          description: `Created and joined room ${roomId.toUpperCase()}`,
        });
      }
    } catch (error) {
      console.error("Error joining room:", error);
      toast({
        title: "Error",
        description: "Failed to join room. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const leaveRoom = () => {
    if (!room || !currentUser) return;
    
    try {
      // Mark user as inactive
      const updatedRoom = removeUserFromRoom(room, currentUser.id);
      
      // Add leave message
      const roomWithMessage = addSystemMessage(
        updatedRoom,
        `${currentUser.name} left the room.`
      );
      
      setRoom(roomWithMessage);
      setCurrentUser(null);
      
      // In a real app, this would update Supabase
      
      setTimeout(() => {
        setRoom(null);
      }, 500);
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  };

  const updateVideoState = (updates: Partial<VideoState>) => {
    if (!room) return;
    
    setRoom(prevRoom => {
      if (!prevRoom) return null;
      
      return {
        ...prevRoom,
        videoState: {
          ...prevRoom.videoState,
          ...updates,
          lastUpdated: Date.now(),
        },
      };
    });
  };

  const shareVideo = (url: string) => {
    if (!room || !currentUser) return;
    
    const videoId = extractVideoId(url);
    
    if (!videoId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube video URL.",
        variant: "destructive",
      });
      return;
    }
    
    updateVideoState({
      videoId,
      isPlaying: false,
      currentTime: 0,
    });
    
    sendSystemMessage(`${currentUser.name} shared a video`);
  };

  // Handle cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentUser && room) {
        leaveRoom();
      }
    };
  }, []);

  return (
    <RoomContext.Provider
      value={{
        currentUser,
        room,
        isJoining,
        processCommand,
        sendMessage,
        createRoom,
        joinRoom,
        leaveRoom,
        updateVideoState,
        shareVideo,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};
