import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Crown, X, Plus, Info } from "lucide-react";
import { useLocation } from "wouter";

interface MovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie?: {
    id: number;
    title: string;
    description?: string;
    duration?: number;
    year?: number;
    genre?: string;
    isPremium: boolean;
    thumbnailUrl?: string;
  };
}

export default function MovieModal({ isOpen, onClose, movie }: MovieModalProps) {
  const [, setLocation] = useLocation();

  if (!movie) return null;

  const handleWatch = () => {
    setLocation(`/movie/${movie.id}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-secondary-dark border-gray-700 max-w-4xl max-h-[90vh] overflow-y-auto">
        <button 
          className="absolute top-4 right-4 text-gray-custom hover:text-white z-10"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Movie Poster */}
          <div className="relative">
            {movie.thumbnailUrl ? (
              <img 
                src={movie.thumbnailUrl} 
                alt={movie.title}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                <Info className="w-16 h-16 text-gray-500" />
              </div>
            )}
            
            <div className="absolute top-4 right-4">
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

          {/* Movie Info */}
          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-4">{movie.title}</h2>
              
              <div className="flex items-center gap-4 text-gray-custom mb-4">
                {movie.year && <span>{movie.year}</span>}
                {movie.duration && (
                  <>
                    <span>•</span>
                    <span>{movie.duration} min</span>
                  </>
                )}
                {movie.genre && (
                  <>
                    <span>•</span>
                    <span>{movie.genre}</span>
                  </>
                )}
              </div>

              <p className="text-gray-300 leading-relaxed mb-6">
                {movie.description || "Brak dostępnego opisu dla tego filmu."}
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full bg-white text-black hover:bg-gray-200"
                onClick={handleWatch}
              >
                <Play className="mr-2 w-5 h-5" />
                Oglądaj Teraz
              </Button>
              
              <Button 
                variant="outline"
                className="w-full border-gray-600 hover:bg-gray-700"
                onClick={() => {}}
              >
                <Plus className="mr-2 w-5 h-5" />
                Dodaj do Listy
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
