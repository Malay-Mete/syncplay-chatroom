
import React from 'react';
import { useRoom } from '@/contexts/RoomContext';
import RoomHeader from './RoomHeader';
import VideoPlayer from './VideoPlayer';
import ChatPanel from './ChatPanel';

const RoomScreen: React.FC = () => {
  const { room } = useRoom();
  
  if (!room) return null;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <RoomHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <VideoPlayer />
        </div>
        
        <div className="lg:col-span-1 h-[600px]">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
};

export default RoomScreen;
