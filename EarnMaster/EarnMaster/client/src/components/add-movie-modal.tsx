import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Upload, X } from "lucide-react";

interface AddMovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const categories = [
  { value: "polecane", label: "Polecane" },
  { value: "animowane", label: "Animowane" },
  { value: "horrory", label: "Horrory" },
  { value: "akcja", label: "Akcja" },
  { value: "komedia", label: "Komedia" },
  { value: "dramat", label: "Dramat" },
  { value: "inne", label: "Inne" },
];

const genreOptions = [
  "Akcja", "Przygodowy", "Komedia", "Dramat", "Fantasy", "Horror", 
  "Musical", "Tajemnica", "Romans", "Sci-Fi", "Thriller", "Western",
  "Animowany", "Biograficzny", "Kryminalny", "Dokumentalny", "Familijny",
  "Historia", "Wojenny", "Sport"
];

export default function AddMovieModal({ isOpen, onClose, onSuccess }: AddMovieModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [year, setYear] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [category, setCategory] = useState("inne");
  const [rating, setRating] = useState("");
  const [isPremium, setIsPremium] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addMovieMutation = useMutation({
    mutationFn: (movieData: any) => apiRequest("POST", "/api/movies", movieData),
    onSuccess: () => {
      toast({
        title: "Sukces",
        description: "Film został dodany pomyślnie",
      });
      onSuccess();
      resetForm();
      onClose();
      queryClient.invalidateQueries({ queryKey: ['/api/movies'] });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setThumbnailUrl("");
    setVideoUrl("");
    setDuration("");
    setYear("");
    setSelectedGenres([]);
    setCategory("inne");
    setRating("");
    setIsPremium(false);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast({
        title: "Błąd",
        description: "Tytuł filmu jest wymagany",
        variant: "destructive",
      });
      return;
    }

    const movieData = {
      title: title.trim(),
      description: description.trim() || undefined,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      duration: duration ? parseInt(duration) : undefined,
      year: year ? parseInt(year) : undefined,
      genre: selectedGenres.length > 0 ? selectedGenres.join(", ") : undefined,
      category,
      rating: rating ? parseFloat(rating) : undefined,
      isPremium,
    };

    addMovieMutation.mutate(movieData);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Dodaj nowy film
          </DialogTitle>
          <DialogDescription>
            Uzupełnij informacje o filmie, który chcesz dodać do platformy
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Podstawowe informacje */}
          <div className="space-y-4">
            <h4 className="font-medium">Podstawowe informacje</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tytuł filmu *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Wprowadź tytuł filmu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Rok produkcji</Label>
                <Input
                  id="year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2024"
                  min="1900"
                  max="2030"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis filmu</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Wprowadź opis filmu..."
                rows={3}
              />
            </div>
          </div>

          {/* Kategoryzacja */}
          <div className="space-y-4">
            <h4 className="font-medium">Kategoryzacja</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategoria</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz kategorię" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Gatunki (można wybrać kilka)</Label>
                <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {genreOptions.map((genre) => (
                      <div key={genre} className="flex items-center space-x-2">
                        <Checkbox
                          id={`genre-${genre}`}
                          checked={selectedGenres.includes(genre)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedGenres([...selectedGenres, genre]);
                            } else {
                              setSelectedGenres(selectedGenres.filter(g => g !== genre));
                            }
                          }}
                        />
                        <Label htmlFor={`genre-${genre}`} className="text-sm font-normal">
                          {genre}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedGenres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedGenres.map((genre) => (
                      <div key={genre} className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs flex items-center gap-1">
                        {genre}
                        <button
                          type="button"
                          onClick={() => setSelectedGenres(selectedGenres.filter(g => g !== genre))}
                          className="hover:bg-primary/20 rounded"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Ocena</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="8.5"
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h4 className="font-medium">Media</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="thumbnail">URL miniaturki</Label>
                <Input
                  id="thumbnail"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Czas trwania (minuty)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="120"
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video">URL filmu</Label>
              <Input
                id="video"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
              />
            </div>
          </div>

          {/* Ustawienia dostępu */}
          <div className="space-y-4">
            <h4 className="font-medium">Ustawienia dostępu</h4>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="premium"
                checked={isPremium}
                onCheckedChange={setIsPremium}
              />
              <Label htmlFor="premium">Film premium (tylko dla subskrybentów)</Label>
            </div>
          </div>

          {/* Przyciski */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Anuluj
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!title.trim() || addMovieMutation.isPending}
              className="flex-1"
            >
              {addMovieMutation.isPending ? "Dodawanie..." : "Dodaj film"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}