import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import MainNavigation from "@/components/main-navigation";
import HeroSection from "@/components/hero-section";
import MovieCard from "@/components/movie-card";
import PremiumModal from "@/components/premium-modal";
import TwoFactorSetup from "@/components/two-factor-setup";
import ProfileSettings from "@/components/profile-settings";
import AddMovieModal from "@/components/add-movie-modal";
import { Button } from "@/components/ui/button";
import { Crown, Gift, Shield, Settings, Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("wszystkie");
  const [premiumCode, setPremiumCode] = useState("");

  const { data: movies, isLoading: moviesLoading } = useQuery({
    queryKey: ["/api/movies", selectedCategory],
    queryFn: () => {
      const params = selectedCategory !== "wszystkie" ? `?category=${selectedCategory}` : "";
      return fetch(`/api/movies${params}`).then(res => res.json());
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const redeemMutation = useMutation({
    mutationFn: (code: string) => apiRequest("POST", "/api/premium-codes/redeem", { code }),
    onSuccess: () => {
      toast({
        title: "Sukces",
        description: "Kod został wykorzystany pomyślnie!",
      });
      setShowCodeModal(false);
      setPremiumCode("");
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRedeemCode = () => {
    if (premiumCode.trim()) {
      redeemMutation.mutate(premiumCode.trim());
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Movies are already filtered by category from the API

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MainNavigation 
        user={user}
        onLogin={() => window.location.href = "/api/login"} 
        onLogout={handleLogout}
        onShowPremium={() => setShowPremiumModal(true)}
        onShow2FA={() => setShow2FAModal(true)}
        onShowSettings={() => setShowProfileSettings(true)}
        onShowAddMovie={() => setShowAddMovie(true)}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      <div className="pt-16">
        <HeroSection />
      </div>

      {/* Movies Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">
                {selectedCategory === "wszystkie" ? "Wszystkie filmy" : 
                 selectedCategory === "polecane" ? "Polecane filmy" :
                 selectedCategory === "animowane" ? "Filmy animowane" :
                 selectedCategory === "horrory" ? "Horrory" :
                 selectedCategory === "akcja" ? "Filmy akcji" :
                 selectedCategory === "komedia" ? "Komedie" :
                 selectedCategory === "dramat" ? "Dramaty" : "Inne filmy"}
              </h2>
            </div>
            
            {moviesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-secondary-dark rounded-lg animate-pulse" />
                ))}
              </div>
            ) : movies && movies.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {movies.map((movie: any) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {selectedCategory === "wszystkie" 
                    ? "Brak filmów do wyświetlenia" 
                    : `Brak filmów w kategorii "${selectedCategory}"`}
                </p>
                {(user.email === "tomaszjasi35@gmail.com" || user.isAdmin) && (
                  <Button 
                    onClick={() => setShowAddMovie(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj pierwszy film
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Premium Promotion Section for Non-Premium Users */}
          {!user.isPremium && (
            <div className="mb-12">
              <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-8 text-center">
                <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-4">Przejdź na Premium</h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Oglądaj bez reklam, w jakości 4K i uzyskaj dostęp do ekskluzywnych treści premium
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    className="bg-yellow-500 text-black hover:bg-yellow-400"
                    onClick={() => setShowPremiumModal(true)}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Kup Premium
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      console.log("Opening code modal from promotion");
                      setShowCodeModal(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Gift className="h-4 w-4" />
                    Mam kod premium
                  </Button>
                </div>
              </div>
            </div>
          )}


        </div>
      </section>

      <PremiumModal 
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
      />

      {/* Modal kodu premium - prostszy overlay */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">Wykorzystaj kod premium</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Wprowadź swój kod premium aby aktywować subskrypcję.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="redeem-code">Kod premium</Label>
                <Input
                  id="redeem-code"
                  value={premiumCode}
                  onChange={(e) => {
                    console.log("Input change:", e.target.value);
                    setPremiumCode(e.target.value);
                  }}
                  placeholder="Wprowadź kod (np. koD123)"
                  className="text-center font-mono text-lg"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowCodeModal(false);
                    setPremiumCode("");
                  }}
                  className="flex-1"
                >
                  Anuluj
                </Button>
                <Button 
                  onClick={() => {
                    console.log("Redeem button clicked with code:", premiumCode);
                    handleRedeemCode();
                  }}
                  disabled={!premiumCode.trim() || redeemMutation.isPending}
                  className="flex-1"
                >
                  {redeemMutation.isPending ? "Wykorzystywanie..." : "Wykorzystaj"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TwoFactorSetup
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        user={user}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] })}
      />

      <ProfileSettings
        isOpen={showProfileSettings}
        onClose={() => setShowProfileSettings(false)}
        user={user}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] })}
      />

      {(user.email === "tomaszjasi35@gmail.com" || user.isAdmin) && (
        <AddMovieModal
          isOpen={showAddMovie}
          onClose={() => setShowAddMovie(false)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['/api/movies'] })}
        />
      )}
    </div>
  );
}
