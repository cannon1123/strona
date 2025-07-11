import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Crown, Film } from "lucide-react";
import { useLocation } from "wouter";

interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    duration?: number;
    year?: number;
    isPremium: boolean;
    thumbnailUrl?: string;
  };
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation(`/movie/${movie.id}`);
  };

  return (
    <Card 
      className="group cursor-pointer transform hover:scale-105 transition-all duration-300 overflow-hidden bg-transparent border-none movie-card-hover"
      onClick={handleClick}
    >
      <div className="relative overflow-hidden rounded-lg">
        {movie.thumbnailUrl ? (
          <img 
            src={movie.thumbnailUrl} 
            alt={movie.title}
            className="w-full h-64 object-cover"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.removeAttribute('style');
            }}
          />
        ) : null}
        
        {/* Fallback placeholder */}
        <div 
          className="w-full h-64 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center"
          style={{ display: movie.thumbnailUrl ? 'none' : 'flex' }}
        >
          <Film className="w-12 h-12 text-gray-500" />
        </div>
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
          <Play className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <div className="absolute top-2 right-2">
          <Badge 
            className={movie.isPremium ? "bg-premium text-black" : "bg-accent-red"}
          >
            {movie.isPremium ? (
              <>
                <Crown className="w-3 h-3 mr-1" />
                PREMIUM
              </>
            ) : (
              "DARMOWY"
            )}
          </Badge>
        </div>
      </div>
      
      <div className="mt-2">
        <h3 className="font-semibold text-sm text-white truncate">{movie.title}</h3>
        <p className="text-xs text-gray-custom">
          {movie.year && movie.duration 
            ? `${movie.year} • ${movie.duration}min`
            : movie.year || `${movie.duration}min` || ""}
        </p>
      </div>
    </Card>
  );
}
