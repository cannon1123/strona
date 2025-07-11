import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, X } from "lucide-react";
import { useLocation } from "wouter";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const [, setLocation] = useLocation();

  const handleSubscribe = () => {
    setLocation("/subscribe");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-b from-secondary-dark to-primary-dark border border-premium/30 max-w-2xl">
        <button 
          className="absolute top-4 right-4 text-gray-custom hover:text-white"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-8">
          <Crown className="text-premium text-6xl mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-2">
            Przejdź na <span className="text-premium">Premium</span>
          </h2>
          <p className="text-gray-custom text-lg">
            Odblokuj pełną bibliotekę i ciesz się najlepszym doświadczeniem
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-success-green mr-3" />
              <span>Bez reklam</span>
            </div>
            <div className="flex items-center">
              <Check className="w-5 h-5 text-success-green mr-3" />
              <span>Jakość 4K Ultra HD</span>
            </div>
            <div className="flex items-center">
              <Check className="w-5 h-5 text-success-green mr-3" />
              <span>Pobieranie offline</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <Check className="w-5 h-5 text-success-green mr-3" />
              <span>Wielokrotne urządzenia</span>
            </div>
            <div className="flex items-center">
              <Check className="w-5 h-5 text-success-green mr-3" />
              <span>Ekskluzywne treści</span>
            </div>
            <div className="flex items-center">
              <Check className="w-5 h-5 text-success-green mr-3" />
              <span>Wsparcie 24/7</span>
            </div>
          </div>
        </div>

        <div className="bg-premium/10 border border-premium/30 rounded-xl p-6 mb-6">
          <div className="text-center">
            <div className="text-premium text-3xl font-bold mb-2">19.99 zł / miesiąc</div>
            <div className="text-gray-custom">Anuluj w dowolnym momencie</div>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            className="w-full bg-premium text-black hover:bg-yellow-400 text-lg py-4"
            onClick={handleSubscribe}
          >
            <Crown className="mr-2 w-5 h-5" />
            Kup Premium Teraz
          </Button>
          
          <div className="text-center">
            <span className="text-gray-custom text-sm">Bezpieczne płatności przez </span>
            <span className="text-white font-semibold">Stripe</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
