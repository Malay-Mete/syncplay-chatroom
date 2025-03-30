
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useRoom } from '@/contexts/RoomContext';
import { loadYouTubeAPI, formatTime, getQualityLabel } from '@/utils/youtube';
import { 
  Play, Pause, Volume2, VolumeX,
  SkipBack, SkipForward, Maximize2,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const VideoPlayer: React.FC = () => {
  const { room, updateVideoState } = useRoom();
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [localTime, setLocalTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(100);
  const [isControllingSeek, setIsControllingSeek] = useState(false);
  const [localDuration, setLocalDuration] = useState(0);
  const [availableQualities, setAvailableQualities] = useState<string[]>([]);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  const [showQualityMenu, setShowQualityMenu] = useState(true); // Always show quality menu
  
  // Setup YouTube player
  useEffect(() => {
    if (!room?.videoState.videoId) return;
    
    const setupPlayer = async () => {
      try {
        await loadYouTubeAPI();
        
        if (!room.videoState.videoId) return;
        
        if (playerRef.current) {
          playerRef.current.destroy();
        }
        
        // Create player container
        const playerContainer = document.createElement('div');
        playerContainer.id = 'youtube-player';
        
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
          containerRef.current.appendChild(playerContainer);
        }
        
        // Initialize player with specific quality options
        playerRef.current = new window.YT.Player('youtube-player', {
          videoId: room.videoState.videoId,
          playerVars: {
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onReady: (e: any) => {
              setPlayerReady(true);
              
              // Set initial state
              const player = e.target;
              player.setVolume(room.videoState.volume);
              setLocalDuration(player.getDuration());
              
              if (room.videoState.isPlaying) {
                player.playVideo();
              } else {
                player.pauseVideo();
              }
              
              // Seek to current position
              if (room.videoState.currentTime > 0) {
                player.seekTo(room.videoState.currentTime, true);
                setLocalTime(room.videoState.currentTime);
              }
              
              // Set playback speed
              if (room.videoState.speed !== 1) {
                player.setPlaybackRate(room.videoState.speed);
              }
              
              // Get available qualities and set default qualities if API doesn't return any
              const qualities = player.getAvailableQualityLevels();
              console.log("Available qualities:", qualities);
              
              if (qualities && qualities.length > 0) {
                setAvailableQualities(['auto', ...qualities]);
              } else {
                // Set default qualities if none are returned
                setAvailableQualities([
                  'auto', 'highres', 'hd1080', 'hd720', 'large', 'medium', 'small'
                ]);
              }
              
              setCurrentQuality('auto'); // Default to auto
            },
            onStateChange: (e: any) => {
              if (e.data === window.YT.PlayerState.PLAYING) {
                updateVideoState({ isPlaying: true });
              } else if (e.data === window.YT.PlayerState.PAUSED) {
                updateVideoState({ isPlaying: false });
              } else if (e.data === window.YT.PlayerState.ENDED) {
                updateVideoState({ isPlaying: false, currentTime: 0 });
              }
            },
            onError: (e: any) => {
              console.error('YouTube player error:', e);
            },
            onPlaybackQualityChange: (e: any) => {
              console.log("Quality changed to:", e.data);
              setCurrentQuality(e.data || 'auto');
            }
          },
        });
      } catch (error) {
        console.error('Error setting up YouTube player:', error);
      }
    };
    
    setupPlayer();
    
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [room?.videoState.videoId]);
  
  // Sync with room state
  useEffect(() => {
    if (!playerReady || !playerRef.current || !room) return;
    
    const player = playerRef.current;
    
    // Handle play/pause
    if (room.videoState.isPlaying && player.getPlayerState() !== window.YT.PlayerState.PLAYING) {
      player.playVideo();
    } else if (!room.videoState.isPlaying && player.getPlayerState() === window.YT.PlayerState.PLAYING) {
      player.pauseVideo();
    }
    
    // Handle seek (if not currently being controlled locally)
    if (!isControllingSeek && Math.abs(player.getCurrentTime() - room.videoState.currentTime) > 2) {
      player.seekTo(room.videoState.currentTime, true);
      setLocalTime(room.videoState.currentTime);
    }
    
    // Handle playback speed
    if (player.getPlaybackRate() !== room.videoState.speed) {
      player.setPlaybackRate(room.videoState.speed);
    }
    
    // Handle volume
    if (player.getVolume() !== room.videoState.volume) {
      player.setVolume(room.videoState.volume);
    }
  }, [room?.videoState, playerReady, isControllingSeek]);
  
  // Time update interval
  useEffect(() => {
    if (!playerReady || !playerRef.current) return;
    
    const intervalId = setInterval(() => {
      if (!isControllingSeek && playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime() || 0;
        setLocalTime(currentTime);
        
        // Only update room state occasionally to reduce chatter
        if (Math.abs(currentTime - (room?.videoState.currentTime || 0)) > 3) {
          updateVideoState({ currentTime });
        }
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [playerReady, isControllingSeek, room?.videoState.currentTime]);
  
  const handlePlayPause = () => {
    if (!playerReady || !playerRef.current) return;
    
    const player = playerRef.current;
    const isPlaying = player.getPlayerState() === window.YT.PlayerState.PLAYING;
    
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
    
    updateVideoState({ isPlaying: !isPlaying });
  };
  
  const handleSeekChange = (value: number[]) => {
    setLocalTime(value[0]);
    setIsControllingSeek(true);
  };
  
  const handleSeekCommit = (value: number[]) => {
    if (!playerReady || !playerRef.current) return;
    
    const newTime = value[0];
    playerRef.current.seekTo(newTime, true);
    setLocalTime(newTime);
    updateVideoState({ currentTime: newTime });
    setIsControllingSeek(false);
  };
  
  const handleVolumeToggle = () => {
    if (!playerReady || !playerRef.current) return;
    
    if (isMuted) {
      playerRef.current.setVolume(prevVolume);
      updateVideoState({ volume: prevVolume });
    } else {
      setPrevVolume(playerRef.current.getVolume());
      playerRef.current.setVolume(0);
      updateVideoState({ volume: 0 });
    }
    
    setIsMuted(!isMuted);
  };
  
  const handleVolumeChange = (value: number[]) => {
    if (!playerReady || !playerRef.current) return;
    
    const newVolume = value[0];
    playerRef.current.setVolume(newVolume);
    updateVideoState({ volume: newVolume });
    
    if (newVolume === 0 && !isMuted) {
      setIsMuted(true);
    } else if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };
  
  const handleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };
  
  const skipForward = () => {
    if (!playerReady || !playerRef.current) return;
    
    const newTime = Math.min(localTime + 10, localDuration);
    playerRef.current.seekTo(newTime, true);
    setLocalTime(newTime);
    updateVideoState({ currentTime: newTime });
  };
  
  const skipBackward = () => {
    if (!playerReady || !playerRef.current) return;
    
    const newTime = Math.max(localTime - 10, 0);
    playerRef.current.seekTo(newTime, true);
    setLocalTime(newTime);
    updateVideoState({ currentTime: newTime });
  };
  
  // Handle quality change
  const changeQuality = (quality: string) => {
    if (!playerReady || !playerRef.current) return;
    console.log("Setting quality to:", quality);
    playerRef.current.setPlaybackQuality(quality);
    setCurrentQuality(quality);
  };

  if (!room?.videoState.videoId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-64 bg-card rounded-lg text-center">
        <h3 className="text-xl font-medium mb-2">No video shared yet</h3>
        <p className="text-muted-foreground mb-4">
          Share a YouTube video to start watching together
        </p>
        <div className="text-sm text-muted-foreground">
          Use the <span className="font-mono bg-muted px-1 rounded">/share [URL]</span> command or paste a YouTube link in chat
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-lg overflow-hidden bg-black">
      <div ref={containerRef} className="w-full aspect-video bg-black" />
      
      {/* Custom controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2 flex flex-col gap-2 backdrop-blur-sm">
        {/* Progress bar */}
        <Slider
          value={[localTime]}
          max={localDuration || 100}
          step={1}
          onValueChange={handleSeekChange}
          onValueCommit={handleSeekCommit}
          className="cursor-pointer"
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePlayPause}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              {room.videoState.isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            
            {/* Skip backward */}
            <Button
              variant="ghost"
              size="icon"
              onClick={skipBackward}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <SkipBack size={16} />
            </Button>
            
            {/* Skip forward */}
            <Button
              variant="ghost"
              size="icon"
              onClick={skipForward}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <SkipForward size={16} />
            </Button>
            
            {/* Time display */}
            <span className="text-xs text-white/80 min-w-[80px]">
              {formatTime(localTime)} / {formatTime(localDuration)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Quality Settings Dropdown - Force shown regardless of availableQualities */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <Settings size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-black/90 border-gray-700 text-white">
                <DropdownMenuLabel>Video Quality</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuRadioGroup value={currentQuality} onValueChange={changeQuality}>
                  {availableQualities.map(quality => (
                    <DropdownMenuRadioItem key={quality} value={quality} className="text-white focus:bg-white/20 focus:text-white">
                      {getQualityLabel(quality)}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          
            {/* Volume control */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleVolumeToggle}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                {isMuted || room.videoState.volume === 0 ? (
                  <VolumeX size={16} />
                ) : (
                  <Volume2 size={16} />
                )}
              </Button>
              
              <Slider
                value={[room.videoState.volume]}
                min={0}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-24 cursor-pointer"
              />
            </div>
            
            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFullscreen}
              className="h-8 w-8 text-white hover:bg-white/20"
            >
              <Maximize2 size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
