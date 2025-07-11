import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AdPlayer from "@/components/ad-player";
import { ArrowLeft, Play, Crown } from "lucide-react";
import { useState, useEffect } from "react";

export default function MoviePlayer() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showAds, setShowAds] = useState(false);
  const [adsRemaining, setAdsRemaining] = useState(0);
  const [canPlayMovie, setCanPlayMovie] = useState(false);

  const { data: movieData, isLoading } = useQuery({
    queryKey: [`/api/movies/${id}/watch`],
    enabled: !!id,
    retry: false,
  });

  const recordAdViewMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/ads/view", { movieId: parseInt(id!) });
    },
    onSuccess: () => {
      toast({
        title: "Ad completed",
        description: "Thanks for watching the ad!",
      });
    },
  });

  useEffect(() => {
    if (movieData) {
      if (movieData.requiresAds && movieData.adsCount > 0) {
        setShowAds(true);
        setAdsRemaining(movieData.adsCount);
      } else {
        setCanPlayMovie(true);
      }
    }
  }, [movieData]);

  const handleAdComplete = () => {
    recordAdViewMutation.mutate();
    const remaining = adsRemaining - 1;
    setAdsRemaining(remaining);
    
    if (remaining <= 0) {
      setShowAds(false);
      setCanPlayMovie(true);
    }
  };

  const handleBack = () => {
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!movieData) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-500 mb-4">Movie Not Found</h1>
              <p className="text-gray-custom mb-4">
                The movie you're looking for doesn't exist or is not available.
              </p>
              <Button onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { movie } = movieData;

  if (showAds && adsRemaining > 0) {
    return (
      <div className="min-h-screen bg-primary-dark">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          
          <AdPlayer 
            onAdComplete={handleAdComplete}
            adsRemaining={adsRemaining}
            movieTitle={movie.title}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-dark">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Video Player */}
          <div className="relative mb-8">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {canPlayMovie ? (
                movie.videoUrl ? (
                  <video 
                    className="w-full h-full" 
                    controls 
                    autoPlay
                    poster={movie.thumbnailUrl}
                  >
                    <source src={movie.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-custom">Video not available</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-custom">Loading movie...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Movie Info */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl font-bold">{movie.title}</h1>
                {movie.isPremium && (
                  <span className="bg-premium text-black px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Crown className="w-4 h-4 mr-1" />
                    PREMIUM
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-gray-custom mb-6">
                <span>{movie.year}</span>
                <span>•</span>
                <span>{movie.duration} min</span>
                <span>•</span>
                <span>{movie.genre}</span>
              </div>

              <p className="text-gray-300 leading-relaxed">
                {movie.description || "No description available."}
              </p>
            </div>

            <div>
              <Card className="bg-secondary-dark border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Movie Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-custom">Views:</span>
                      <span>{movie.viewCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-custom">Genre:</span>
                      <span>{movie.genre}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-custom">Duration:</span>
                      <span>{movie.duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-custom">Year:</span>
                      <span>{movie.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-custom">Type:</span>
                      <span className={movie.isPremium ? "text-premium" : "text-success-green"}>
                        {movie.isPremium ? "Premium" : "Free"}
                      </span>
                    </div>
                  </div>
                  
                  {!user?.isPremium && (
                    <div className="mt-6 p-4 bg-premium/10 border border-premium/30 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Crown className="w-5 h-5 text-premium mr-2" />
                        <span className="font-semibold">Upgrade to Premium</span>
                      </div>
                      <p className="text-sm text-gray-custom mb-3">
                        Watch without ads and unlock exclusive content
                      </p>
                      <Button 
                        className="w-full bg-premium text-black hover:bg-yellow-400"
                        onClick={() => setLocation("/subscribe")}
                      >
                        Get Premium
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
