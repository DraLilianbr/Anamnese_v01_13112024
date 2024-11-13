import { useEffect, useRef, useState } from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  onEnded?: () => void;
  autoplay?: boolean;
  playsinline?: boolean;
}

declare global {
  interface Window {
    YT: {
      Player: any;
      PlayerState: {
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
    YTReady: boolean;
  }
}

export function YouTubeEmbed({ 
  videoId, 
  onEnded, 
  autoplay = true,
  playsinline = true 
}: YouTubeEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentVideoId = useRef(videoId);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player || !containerRef.current) {
        timeoutId = setTimeout(initPlayer, 100);
        return;
      }

      try {
        if (!playerRef.current) {
          playerRef.current = new window.YT.Player(containerRef.current, {
            height: '100%',
            width: '100%',
            videoId: videoId,
            playerVars: {
              autoplay: autoplay ? 1 : 0,
              controls: 1,
              modestbranding: 1,
              rel: 0,
              showinfo: 0,
              fs: 1,
              playsinline: playsinline ? 1 : 0,
              origin: window.location.origin,
              enablejsapi: 1
            },
            events: {
              onReady: () => {
                setIsLoading(false);
                if (playsinline && playerRef.current.getIframe()) {
                  playerRef.current.getIframe().setAttribute('playsinline', '1');
                }
              },
              onStateChange: (event: any) => {
                if (event.data === window.YT.PlayerState.ENDED && onEnded) {
                  onEnded();
                }
              },
              onError: () => {
                setError('Erro ao carregar o vídeo. Por favor, tente novamente.');
                setIsLoading(false);
              }
            },
          });
        } else if (currentVideoId.current !== videoId) {
          // Só atualiza o vídeo se o ID mudou
          currentVideoId.current = videoId;
          playerRef.current.loadVideoById({
            videoId: videoId,
            playerVars: {
              playsinline: playsinline ? 1 : 0
            }
          });
        }
      } catch (err) {
        console.error('Error initializing YouTube player:', err);
        setError('Erro ao inicializar o player. Por favor, recarregue a página.');
        setIsLoading(false);
      }
    };

    initPlayer();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [videoId, onEnded, autoplay, playsinline]);

  // Cleanup apenas quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (err) {
          console.error('Error destroying player:', err);
        }
      }
    };
  }, []);

  return (
    <div className="relative w-full pb-[56.25%] h-0 rounded-lg overflow-hidden bg-gray-100">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1594a4]"></div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 p-4">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      )}
      
      <div
        ref={containerRef}
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
}