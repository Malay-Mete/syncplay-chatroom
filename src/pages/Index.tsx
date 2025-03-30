
import React from 'react';
import { RoomProvider } from '@/contexts/RoomContext';
import WelcomeScreen from '@/components/WelcomeScreen';
import RoomScreen from '@/components/RoomScreen';

// Moving RoomWrapper inside the Index component
const Index = () => {
  // Defining the RoomWrapper component inside the main component
  // so it can properly access the RoomProvider context
  const RoomWrapper = () => {
    const { useRoom } = require('@/contexts/RoomContext');
    const { room } = useRoom();
    return room ? <RoomScreen /> : <WelcomeScreen />;
  };

  return (
    <RoomProvider>
      <RoomWrapper />
    </RoomProvider>
  );
};

export default Index;
