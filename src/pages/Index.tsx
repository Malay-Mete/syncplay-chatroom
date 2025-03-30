import React from 'react';
import { RoomProvider, useRoom } from '@/contexts/RoomContext';
import WelcomeScreen from '@/components/WelcomeScreen';
import RoomScreen from '@/components/RoomScreen';

const Index = () => {
  // Moving the RoomWrapper component outside the main component render
  // to avoid hook issues but still keeping it in the same file
  const RoomWrapper = () => {
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
