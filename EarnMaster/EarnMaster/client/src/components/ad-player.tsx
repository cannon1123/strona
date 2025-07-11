import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Volume2, VolumeX } from "lucide-react";

interface AdPlayerProps {
  onAdComplete: () => void;
  adsRemaining: number;
  movieTitle: string;
}

export default function AdPlayer({ onAdComplete, adsRemaining, movieTitle }: AdPlayerProps) {
  const [adDuration] = useState(15); // 15 seconds per ad
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentTime < adDuration) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1;
          
          // Allow skipping after 10 seconds
          if (newTime >= 10) {
            setCanSkip(true);
          }
          
          // Auto-complete ad after full duration
          if (newTime >= adDuration) {
            setTimeout(() => {
              onAdComplete();
              setCurrentTime(0);
              setIsPlaying(false);
              setCanSkip(false);
            }, 500);
            return adDuration;
          }
          
          return newTime;
        });
      }, 100);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, currentTime, adDuration, onAdComplete]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSkip = () => {
    if (canSkip) {
      onAdComplete();
      setCurrentTime(0);
      setIsPlaying(false);
      setCanSkip(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (currentTime / adDuration) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Oglądanie: <span className="text-accent-red">{movieTitle}</span>
          </h2>
          <div className="text-sm text-gray-custom">
            Pozostało reklam: <span className="text-premium font-semibold">{adsRemaining}</span>
          </div>
        </div>
      </div>

      <Card className="bg-secondary-dark border-gray-700">
        <CardContent className="p-0">
          {/* Ad Video Player */}
          <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
            {/* Simulated Ad Content */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-4">
                  StreamHub Premium
                </div>
                <div className="text-xl text-gray-200 mb-6">
                  Oglądaj bez reklam już dziś!
                </div>
                <div className="bg-premium text-black px-6 py-3 rounded-lg font-semibold">
                  Wypróbuj za 19.99 zł/miesiąc
                </div>
              </div>
            </div>

            {/* Ad Controls Overlay */}
            <div className="absolute inset-0 bg-black/20">
              {/* Top Bar */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <div className="bg-black/60 px-3 py-1 rounded text-sm text-white">
                  Reklama {adsRemaining > 1 ? `(${adsRemaining - 1 + 1} z ${adsRemaining + (adsRemaining - 1)})` : "(ostatnia)"}
                </div>
                {canSkip && (
                  <Button 
                    size="sm"
                    variant="secondary"
                    onClick={handleSkip}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    Pomiń reklamę
                  </Button>
                )}
              </div>

              {/* Center Play Button */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="lg"
                    onClick={handlePlayPause}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-full w-16 h-16"
                  >
                    <Play className="w-8 h-8" />
                  </Button>
                </div>
              )}

              {/* Bottom Controls */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/60 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white/20"
                    >
                      <Play className={`w-4 h-4 ${isPlaying ? 'hidden' : 'block'}`} />
                      <div className={`w-4 h-4 ${isPlaying ? 'block' : 'hidden'}`}>⏸️</div>
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>

                    <div className="flex-1 flex items-center space-x-2">
                      <span className="text-white text-sm min-w-[40px]">
                        {formatTime(currentTime)}
                      </span>
                      <Progress 
                        value={progressPercentage} 
                        className="flex-1 h-2"
                      />
                      <span className="text-white text-sm min-w-[40px]">
                        {formatTime(adDuration)}
                      </span>
                    </div>

                    {!canSkip && (
                      <div className="text-white text-sm">
                        Pomiń za {Math.max(0, Math.ceil(10 - currentTime))}s
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ad Info */}
      <div className="mt-4 text-center">
        <p className="text-gray-custom">
          {adsRemaining > 1 
            ? `Po tej reklamie zostanie jeszcze ${adsRemaining - 1} reklam(a)`
            : "To ostatnia reklama przed filmem!"
          }
        </p>
        <p className="text-sm text-gray-custom mt-2">
          Chcesz oglądać bez reklam? 
          <span className="text-premium font-semibold ml-1 cursor-pointer hover:underline">
            Kup Premium
          </span>
        </p>
      </div>

      {/* Auto-start ad */}
      {!isPlaying && currentTime === 0 && (
        <div className="mt-4 text-center">
          <Button 
            onClick={handlePlayPause}
            className="bg-accent-red hover:bg-red-700"
          >
            <Play className="mr-2 w-4 h-4" />
            Rozpocznij reklamę
          </Button>
        </div>
      )}
    </div>
  );
}
