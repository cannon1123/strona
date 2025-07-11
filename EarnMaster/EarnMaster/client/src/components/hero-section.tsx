import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Plus } from "lucide-react";

interface HeroSectionProps {
  onLogin?: () => void;
}

export default function HeroSection({ onLogin }: HeroSectionProps) {
  return (
    <section className="pt-20 relative overflow-hidden">
      <div className="relative h-[70vh] flex items-center">
        {/* Background with overlays */}
        <div className="absolute inset-0 gradient-overlay z-10"></div>
        <div className="absolute inset-0 gradient-overlay-bottom z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')"
          }}
        ></div>
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-2 mb-4">
              <Badge className="bg-accent-red">NOWOŚĆ</Badge>
              <Badge className="bg-premium text-black">PREMIUM</Badge>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
              Niesamowite<br />
              <span className="text-accent-red">Przygody</span>
            </h1>
            
            <p className="text-xl text-gray-custom mb-8 max-w-lg">
              Odkryj tysiące filmów i seriali w najwyższej jakości. Oglądaj za darmo z reklamami lub kup Premium dla nieograniczonego dostępu.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                size="lg"
                className="bg-white text-black hover:bg-gray-200"
                onClick={onLogin}
              >
                <Play className="mr-2 w-5 h-5" />
                Oglądaj Teraz
              </Button>
              
              <Button 
                size="lg"
                variant="secondary"
                className="bg-secondary-dark/80 hover:bg-secondary-dark"
                onClick={onLogin}
              >
                <Plus className="mr-2 w-5 h-5" />
                Dodaj do Listy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
