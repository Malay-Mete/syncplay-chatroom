
import { Room, User, VideoState, ChatMessage } from '@/types';

/**
 * Generates a random 6-character room code
 */
export function generateRoomCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Creates a new room with default settings
 */
export function createNewRoom(roomName: string, creatorId: string, creatorName: string): Room {
  const roomId = generateRoomCode();
  
  const creator: User = {
    id: creatorId,
    name: creatorName,
    isActive: true,
  };
  
  const initialVideoState: VideoState = {
    videoId: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    speed: 1,
    volume: 100,
    lastUpdated: Date.now(),
  };
  
  const room: Room = {
    id: roomId,
    name: roomName,
    users: [creator],
    videoState: initialVideoState,
    messages: [],
    createdAt: Date.now(),
  };
  
  return room;
}

/**
 * Adds a welcome message to the room
 */
export function addSystemMessage(room: Room, content: string): Room {
  const systemMessage: ChatMessage = {
    id: `system-${Date.now()}`,
    userId: 'system',
    userName: 'System',
    content,
    timestamp: Date.now(),
    isCommand: false,
  };
  
  return {
    ...room,
    messages: [...room.messages, systemMessage],
  };
}

/**
 * Adds a user to the room
 */
export function addUserToRoom(room: Room, user: User): Room {
  // Check if user already exists
  const existingUserIndex = room.users.findIndex(u => u.id === user.id);
  
  if (existingUserIndex >= 0) {
    // Update existing user
    const updatedUsers = [...room.users];
    updatedUsers[existingUserIndex] = {
      ...updatedUsers[existingUserIndex],
      isActive: true,
    };
    
    return {
      ...room,
      users: updatedUsers,
    };
  }
  
  // Add new user
  return {
    ...room,
    users: [...room.users, user],
  };
}

/**
 * Removes a user from the room (marks as inactive)
 */
export function removeUserFromRoom(room: Room, userId: string): Room {
  const updatedUsers = room.users.map(user => 
    user.id === userId 
      ? { ...user, isActive: false } 
      : user
  );
  
  return {
    ...room,
    users: updatedUsers,
  };
}

/**
 * Gets active users in the room
 */
export function getActiveUsers(room: Room): User[] {
  return room.users.filter(user => user.isActive);
}
