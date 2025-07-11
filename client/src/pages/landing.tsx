import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";
import { Crown, Video, Download, HdmiPort, Users, DollarSign, Film } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-primary-dark text-white">
      <Navigation onLogin={handleLogin} />
      
      <HeroSection onLogin={handleLogin} />

      {/* Movie Catalog Preview */}
      <section className="py-16 bg-primary-dark">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold">Popularne Filmy</h2>
              <Button variant="outline" onClick={handleLogin}>
                Zobacz wszystkie
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="group cursor-pointer transform hover:scale-105 transition-all duration-300">
                  <div className="relative overflow-hidden rounded-lg">
                    <div className="w-full h-64 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <Film className="w-12 h-12 text-gray-500" />
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
                      <Video className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="bg-accent-red px-2 py-1 rounded text-xs font-semibold">DARMOWY</span>
                    </div>
                  </div>
                  <h3 className="mt-2 font-semibold text-sm">Film {i}</h3>
                  <p className="text-xs text-gray-custom">2024 • 2h 15min</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features */}
      <section className="py-16 bg-gradient-to-b from-primary-dark to-secondary-dark">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Wybierz Swój <span className="text-premium">Plan Premium</span>
            </h2>
            <p className="text-xl text-gray-custom max-w-2xl mx-auto">
              Odblokuj pełną bibliotekę filmów, usuń reklamy i ciesz się najwyższą jakością streaming'u
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <Card className="bg-secondary-dark border-gray-700">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Basic</h3>
                  <div className="text-4xl font-bold text-accent-red mb-4">
                    9.99 zł<span className="text-lg font-normal text-gray-custom">/miesiąc</span>
                  </div>
                  <p className="text-gray-custom mb-6">Idealne na początek</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Crown className="w-5 h-5 text-success-green mr-3" />
                    <span>Bez reklam</span>
                  </li>
                  <li className="flex items-center">
                    <HdmiPort className="w-5 h-5 text-success-green mr-3" />
                    <span>HD 1080p</span>
                  </li>
                  <li className="flex items-center">
                    <Video className="w-5 h-5 text-success-green mr-3" />
                    <span>1 urządzenie jednocześnie</span>
                  </li>
                </ul>
                
                <Button 
                  className="w-full bg-accent-red hover:bg-red-700" 
                  onClick={handleLogin}
                >
                  Wybierz Plan
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="bg-gradient-to-b from-premium/20 to-yellow-600/20 border-2 border-premium transform scale-105">
              <CardContent className="p-8 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-premium text-black px-4 py-2 rounded-full font-semibold text-sm">
                    NAJPOPULARNIEJSZY
                  </span>
                </div>
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Premium</h3>
                  <div className="text-4xl font-bold text-premium mb-4">
                    19.99 zł<span className="text-lg font-normal text-gray-custom">/miesiąc</span>
                  </div>
                  <p className="text-gray-custom mb-6">Najlepsza wartość</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Crown className="w-5 h-5 text-success-green mr-3" />
                    <span>Bez reklam</span>
                  </li>
                  <li className="flex items-center">
                    <HdmiPort className="w-5 h-5 text-success-green mr-3" />
                    <span>4K Ultra HD</span>
                  </li>
                  <li className="flex items-center">
                    <Video className="w-5 h-5 text-success-green mr-3" />
                    <span>4 urządzenia jednocześnie</span>
                  </li>
                  <li className="flex items-center">
                    <Download className="w-5 h-5 text-success-green mr-3" />
                    <span>Pobieranie offline</span>
                  </li>
                </ul>
                
                <Button 
                  className="w-full bg-premium text-black hover:bg-yellow-400" 
                  onClick={handleLogin}
                >
                  Wybierz Plan
                </Button>
              </CardContent>
            </Card>

            {/* Family Plan */}
            <Card className="bg-secondary-dark border-gray-700">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Family</h3>
                  <div className="text-4xl font-bold text-blue-400 mb-4">
                    29.99 zł<span className="text-lg font-normal text-gray-custom">/miesiąc</span>
                  </div>
                  <p className="text-gray-custom mb-6">Dla całej rodziny</p>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Crown className="w-5 h-5 text-success-green mr-3" />
                    <span>Bez reklam</span>
                  </li>
                  <li className="flex items-center">
                    <HdmiPort className="w-5 h-5 text-success-green mr-3" />
                    <span>4K Ultra HD</span>
                  </li>
                  <li className="flex items-center">
                    <Video className="w-5 h-5 text-success-green mr-3" />
                    <span>6 urządzeń jednocześnie</span>
                  </li>
                  <li className="flex items-center">
                    <Users className="w-5 h-5 text-success-green mr-3" />
                    <span>Profile rodzinne</span>
                  </li>
                </ul>
                
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  onClick={handleLogin}
                >
                  Wybierz Plan
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-premium mb-2">10,000+</div>
              <div className="text-gray-custom">Filmów i Seriali</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent-red mb-2">50,000+</div>
              <div className="text-gray-custom">Zadowolonych Użytkowników</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-success-green mb-2">4K</div>
              <div className="text-gray-custom">Ultra HD Jakość</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-dark border-t border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-accent-red mb-4">
                <Video className="inline mr-2" />
                StreamHub
              </div>
              <p className="text-gray-custom mb-4">
                Najlepsza platforma streaming'owa w Polsce. Oglądaj tysiące filmów i seriali w najwyższej jakości.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Platforma</h4>
              <ul className="space-y-2 text-gray-custom">
                <li><a href="#" className="hover:text-white transition-colors">Filmy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Seriale</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Nowości</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Popularne</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Pomoc</h4>
              <ul className="space-y-2 text-gray-custom">
                <li><a href="#" className="hover:text-white transition-colors">Centrum Pomocy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kontakt</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Regulamin</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Polityka Prywatności</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Newsletter</h4>
              <p className="text-gray-custom mb-4">Otrzymuj informacje o nowościach</p>
              <Button onClick={handleLogin} className="w-full">
                Zaloguj się aby subskrybować
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-custom">
            <p>&copy; 2024 StreamHub. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
