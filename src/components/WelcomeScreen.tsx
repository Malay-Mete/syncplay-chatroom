
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import JoinRoomForm from './JoinRoomForm';
import CreateRoomForm from './CreateRoomForm';
import { Play, Users, MessagesSquare } from 'lucide-react';

const WelcomeScreen: React.FC = () => {
  const [formType, setFormType] = useState<'join' | 'create'>('join');
  
  const handleToggleForm = () => {
    setFormType(formType === 'join' ? 'create' : 'join');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Play size={24} className="text-synctube-purple" fill="currentColor" />
            <h1 className="text-3xl font-bold">SyncTube</h1>
          </div>
          <p className="text-muted-foreground">Watch YouTube videos together with friends in real-time</p>
        </div>
        
        <div className="bg-card border rounded-lg p-6">
          {formType === 'join' ? (
            <JoinRoomForm onToggleForm={handleToggleForm} />
          ) : (
            <CreateRoomForm onToggleForm={handleToggleForm} />
          )}
        </div>
        
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-card border rounded-lg p-4 text-center flex flex-col items-center gap-2">
            <Users size={24} className="text-synctube-purple mb-2" />
            <h3 className="font-medium">Watch Together</h3>
            <p className="text-sm text-muted-foreground">Synchronized playback for everyone in the room</p>
          </div>
          
          <div className="bg-card border rounded-lg p-4 text-center flex flex-col items-center gap-2">
            <MessagesSquare size={24} className="text-synctube-purple mb-2" />
            <h3 className="font-medium">Chat & Commands</h3>
            <p className="text-sm text-muted-foreground">Use chat commands to control playback</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
