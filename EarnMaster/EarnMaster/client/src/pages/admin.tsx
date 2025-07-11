import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Shield, 
  Users, 
  Crown, 
  DollarSign, 
  Film, 
  Plus, 
  Edit, 
  Trash2, 
  Gift,
  BarChart3,
  ArrowLeft 
} from "lucide-react";
import { useLocation } from "wouter";

export default function Admin() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!user || (user.email !== "tomaszjasi35@gmail.com" && !user.isAdmin))) {
      toast({
        title: "Brak dostępu",
        description: "Panel administracyjny jest dostępny tylko dla administratorów.",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/");
      }, 500);
      return;
    }
  }, [user, isLoading, toast, setLocation]);
  
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<any>(null);
  const [movieForm, setMovieForm] = useState({
    title: "",
    description: "",
    thumbnailUrl: "",
    videoUrl: "",
    duration: "",
    year: "",
    genre: "",
    isPremium: false,
  });
  const [codeForm, setCodeForm] = useState({
    durationDays: "",
    quantity: "",
  });

  // Check admin access
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive",
      });
      setLocation("/");
      return;
    }
  }, [user, isLoading, toast, setLocation]);

  const { data: analytics } = useQuery({
    queryKey: ["/api/admin/analytics"],
    enabled: !!user?.isAdmin,
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
      }
    },
  });

  const { data: movies } = useQuery({
    queryKey: ["/api/movies"],
    enabled: !!user?.isAdmin,
  });

  const { data: premiumCodes } = useQuery({
    queryKey: ["/api/admin/premium-codes"],
    enabled: !!user?.isAdmin,
  });

  const createMovieMutation = useMutation({
    mutationFn: async (movieData: any) => {
      const data = {
        ...movieData,
        duration: parseInt(movieData.duration),
        year: parseInt(movieData.year),
      };
      await apiRequest("POST", "/api/admin/movies", data);
    },
    onSuccess: () => {
      toast({ title: "Movie created successfully" });
      setShowMovieModal(false);
      resetMovieForm();
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create movie",
        variant: "destructive",
      });
    },
  });

  const updateMovieMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const movieData = {
        ...data,
        duration: parseInt(data.duration),
        year: parseInt(data.year),
      };
      await apiRequest("PUT", `/api/admin/movies/${id}`, movieData);
    },
    onSuccess: () => {
      toast({ title: "Movie updated successfully" });
      setShowMovieModal(false);
      resetMovieForm();
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update movie",
        variant: "destructive",
      });
    },
  });

  const deleteMovieMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/movies/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Movie deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/movies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete movie",
        variant: "destructive",
      });
    },
  });

  const createCodesMutation = useMutation({
    mutationFn: async (data: { durationDays: number; quantity: number }) => {
      await apiRequest("POST", "/api/admin/premium-codes", data);
    },
    onSuccess: () => {
      toast({ title: "Premium codes generated successfully" });
      setShowCodeModal(false);
      setCodeForm({ durationDays: "", quantity: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/premium-codes"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate codes",
        variant: "destructive",
      });
    },
  });

  const resetMovieForm = () => {
    setMovieForm({
      title: "",
      description: "",
      thumbnailUrl: "",
      videoUrl: "",
      duration: "",
      year: "",
      genre: "",
      isPremium: false,
    });
    setEditingMovie(null);
  };

  const handleEditMovie = (movie: any) => {
    setEditingMovie(movie);
    setMovieForm({
      title: movie.title || "",
      description: movie.description || "",
      thumbnailUrl: movie.thumbnailUrl || "",
      videoUrl: movie.videoUrl || "",
      duration: movie.duration?.toString() || "",
      year: movie.year?.toString() || "",
      genre: movie.genre || "",
      isPremium: movie.isPremium || false,
    });
    setShowMovieModal(true);
  };

  const handleSubmitMovie = () => {
    if (editingMovie) {
      updateMovieMutation.mutate({ id: editingMovie.id, data: movieForm });
    } else {
      createMovieMutation.mutate(movieForm);
    }
  };

  const handleGenerateCodes = () => {
    createCodesMutation.mutate({
      durationDays: parseInt(codeForm.durationDays),
      quantity: parseInt(codeForm.quantity),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-dark flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-primary-dark text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="text-blue-400 mr-3" />
            Panel Administratora
          </h1>
          <Button variant="outline" onClick={() => setLocation("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Analytics Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-secondary-dark border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Users className="text-blue-400 text-2xl" />
                <Badge variant="outline" className="text-green-400 border-green-400">
                  +12%
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1">
                {analytics?.userCount || 0}
              </div>
              <div className="text-gray-custom text-sm">Aktywni Użytkownicy</div>
            </CardContent>
          </Card>

          <Card className="bg-secondary-dark border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Crown className="text-premium text-2xl" />
                <Badge variant="outline" className="text-green-400 border-green-400">
                  +8%
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1">
                {analytics?.premiumUserCount || 0}
              </div>
              <div className="text-gray-custom text-sm">Subskrypcje Premium</div>
            </CardContent>
          </Card>

          <Card className="bg-secondary-dark border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="text-success-green text-2xl" />
                <Badge variant="outline" className="text-green-400 border-green-400">
                  +15%
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1">
                {analytics?.adRevenue?.thisMonth || "0"} zł
              </div>
              <div className="text-gray-custom text-sm">Przychody Miesiąc</div>
            </CardContent>
          </Card>

          <Card className="bg-secondary-dark border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Film className="text-accent-red text-2xl" />
                <Badge variant="outline" className="text-green-400 border-green-400">
                  +3
                </Badge>
              </div>
              <div className="text-2xl font-bold mb-1">
                {analytics?.movieCount || 0}
              </div>
              <div className="text-gray-custom text-sm">Filmy w Bazie</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Content Management */}
          <Card className="bg-secondary-dark border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Film className="text-accent-red mr-3" />
                Zarządzanie Treścią
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full bg-accent-red hover:bg-red-700"
                onClick={() => setShowMovieModal(true)}
              >
                <Plus className="mr-2" />
                Dodaj Nowy Film
              </Button>
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => {}}
              >
                <BarChart3 className="mr-2" />
                Statystyki Oglądania
              </Button>
            </CardContent>
          </Card>

          {/* Monetization */}
          <Card className="bg-secondary-dark border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="text-premium mr-3" />
                Monetyzacja
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary-dark rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Opłata za Reklamę</span>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-2xl font-bold text-premium">0.15 zł/wyświetlenie</div>
              </div>
              
              <Button 
                className="w-full bg-premium text-black hover:bg-yellow-400"
                onClick={() => setShowCodeModal(true)}
              >
                <Gift className="mr-2" />
                Generuj Kody Premium
              </Button>
              
              <div className="bg-primary-dark rounded-lg p-4">
                <div className="text-center">
                  <div className="text-lg font-semibold mb-1">Całkowite Przychody</div>
                  <div className="text-2xl font-bold text-success-green">
                    {analytics?.adRevenue?.total || "0"} zł
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Movies Table */}
        <Card className="bg-secondary-dark border-gray-700 mt-8">
          <CardHeader>
            <CardTitle>Lista Filmów</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tytuł</TableHead>
                  <TableHead>Gatunek</TableHead>
                  <TableHead>Rok</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Wyświetlenia</TableHead>
                  <TableHead>Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movies?.map((movie: any) => (
                  <TableRow key={movie.id}>
                    <TableCell className="font-medium">{movie.title}</TableCell>
                    <TableCell>{movie.genre}</TableCell>
                    <TableCell>{movie.year}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={movie.isPremium ? "default" : "secondary"}
                        className={movie.isPremium ? "bg-premium text-black" : ""}
                      >
                        {movie.isPremium ? "Premium" : "Free"}
                      </Badge>
                    </TableCell>
                    <TableCell>{movie.viewCount}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditMovie(movie)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteMovieMutation.mutate(movie.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Premium Codes Table */}
        <Card className="bg-secondary-dark border-gray-700 mt-8">
          <CardHeader>
            <CardTitle>Kody Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kod</TableHead>
                  <TableHead>Dni</TableHead>
                  <TableHead>Pozostałe użycia</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data utworzenia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {premiumCodes?.map((code: any) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono">{code.code}</TableCell>
                    <TableCell>{code.durationDays}</TableCell>
                    <TableCell>{code.usesLeft}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={code.isActive ? "default" : "secondary"}
                        className={code.isActive ? "bg-success-green" : ""}
                      >
                        {code.isActive ? "Active" : "Used"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(code.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Movie Modal */}
      <Dialog open={showMovieModal} onOpenChange={setShowMovieModal}>
        <DialogContent className="bg-secondary-dark border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingMovie ? "Edytuj Film" : "Dodaj Nowy Film"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Tytuł</Label>
              <Input
                id="title"
                value={movieForm.title}
                onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                className="bg-primary-dark border-gray-700"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Opis</Label>
              <Textarea
                id="description"
                value={movieForm.description}
                onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                className="bg-primary-dark border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="genre">Gatunek</Label>
              <Input
                id="genre"
                value={movieForm.genre}
                onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                className="bg-primary-dark border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="year">Rok</Label>
              <Input
                id="year"
                type="number"
                value={movieForm.year}
                onChange={(e) => setMovieForm({ ...movieForm, year: e.target.value })}
                className="bg-primary-dark border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="duration">Czas trwania (min)</Label>
              <Input
                id="duration"
                type="number"
                value={movieForm.duration}
                onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                className="bg-primary-dark border-gray-700"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isPremium"
                checked={movieForm.isPremium}
                onCheckedChange={(checked) => setMovieForm({ ...movieForm, isPremium: checked })}
              />
              <Label htmlFor="isPremium">Premium</Label>
            </div>
            <div className="col-span-2">
              <Label htmlFor="thumbnailUrl">URL Miniaturki</Label>
              <Input
                id="thumbnailUrl"
                value={movieForm.thumbnailUrl}
                onChange={(e) => setMovieForm({ ...movieForm, thumbnailUrl: e.target.value })}
                className="bg-primary-dark border-gray-700"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="videoUrl">URL Filmu</Label>
              <Input
                id="videoUrl"
                value={movieForm.videoUrl}
                onChange={(e) => setMovieForm({ ...movieForm, videoUrl: e.target.value })}
                className="bg-primary-dark border-gray-700"
              />
            </div>
            <div className="col-span-2 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowMovieModal(false)}>
                Anuluj
              </Button>
              <Button 
                onClick={handleSubmitMovie}
                disabled={createMovieMutation.isPending || updateMovieMutation.isPending}
              >
                {editingMovie ? "Aktualizuj" : "Dodaj"} Film
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Premium Code Modal */}
      <Dialog open={showCodeModal} onOpenChange={setShowCodeModal}>
        <DialogContent className="bg-secondary-dark border-gray-700">
          <DialogHeader>
            <DialogTitle>Generuj Kody Premium</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="durationDays">Czas ważności (dni)</Label>
              <Input
                id="durationDays"
                type="number"
                value={codeForm.durationDays}
                onChange={(e) => setCodeForm({ ...codeForm, durationDays: e.target.value })}
                className="bg-primary-dark border-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="quantity">Ilość kodów</Label>
              <Input
                id="quantity"
                type="number"
                max="100"
                value={codeForm.quantity}
                onChange={(e) => setCodeForm({ ...codeForm, quantity: e.target.value })}
                className="bg-primary-dark border-gray-700"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCodeModal(false)}>
                Anuluj
              </Button>
              <Button 
                onClick={handleGenerateCodes}
                disabled={createCodesMutation.isPending}
                className="bg-premium text-black hover:bg-yellow-400"
              >
                Generuj Kody
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
