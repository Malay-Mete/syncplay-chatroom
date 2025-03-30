
/**
 * Extracts YouTube video ID from various YouTube URL formats
 */
export function extractVideoId(url: string): string | null {
  // Handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^?&]+)/,
    /youtube\.com\/watch\?.*v=([^&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validates if a string is a valid YouTube video ID
 */
export function isValidYoutubeId(id: string): boolean {
  // YouTube IDs are typically 11 characters with specific allowed characters
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
}

/**
 * Generates thumbnail URL for a YouTube video
 */
export function getYoutubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

/**
 * Loads the YouTube IFrame API asynchronously
 */
export function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT) {
      resolve();
      return;
    }

    // Initialize YouTube API callback
    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };

    // Load YouTube IFrame API script
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
  });
}

// Define YouTube player interface
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

/**
 * Creates an embedded YouTube player
 */
export function createYouTubePlayer(
  containerId: string,
  videoId: string,
  onReady: (player: any) => void,
  onStateChange: (event: any) => void,
  onError: (event: any) => void
): void {
  // Ensure the API is loaded
  loadYouTubeAPI().then(() => {
    new window.YT.Player(containerId, {
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 0, // Hide default controls
        rel: 0,
        showinfo: 0,
        modestbranding: 1,
        enablejsapi: 1,
      },
      events: {
        onReady,
        onStateChange,
        onError,
      },
    });
  });
}

/**
 * Formats seconds into MM:SS format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

/**
 * Maps YouTube quality labels to readable text
 */
export function getQualityLabel(quality: string): string {
  const qualityMap: Record<string, string> = {
    'highres': '4K',
    'hd2160': '4K',
    'hd1440': '1440p',
    'hd1080': '1080p',
    'hd720': '720p',
    'large': '480p',
    'medium': '360p',
    'small': '240p',
    'tiny': '144p',
    'auto': 'Auto'
  };

  return qualityMap[quality] || quality;
}
