
import React from 'react';
import { RoomProvider } from '@/contexts/RoomContext';
import WelcomeScreen from '@/components/WelcomeScreen';
import RoomScreen from '@/components/RoomScreen';
import { useRoom } from '@/contexts/RoomContext';

const RoomWrapper: React.FC = () => {
  const { room } = useRoom();
  return room ? <RoomScreen /> : <WelcomeScreen />;
};

const Index = () => {
  return (
    <RoomProvider>
      <RoomWrapper />
    </RoomProvider>
  );
};

export default Index;
