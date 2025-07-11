import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Video, Search, Crown, Settings, LogOut } from "lucide-react";
import { useLocation } from "wouter";

interface NavigationProps {
  user?: any;
  onLogin?: () => void;
  onLogout?: () => void;
  onShowPremium?: () => void;
  onShow2FA?: () => void;
  onShowSettings?: () => void;
}

export default function Navigation({ user, onLogin, onLogout, onShowPremium, onShow2FA, onShowSettings }: NavigationProps) {
  const [, setLocation] = useLocation();

  return (
    <header className="fixed top-0 w-full bg-primary-dark/95 backdrop-blur-sm border-b border-gray-800 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div 
              className="text-2xl font-bold text-accent-red cursor-pointer flex items-center"
              onClick={() => setLocation("/")}
            >
              <Video className="mr-2" />
              StreamHub
            </div>
            {user && (
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-white hover:text-accent-red transition-colors">Filmy</a>
                <a href="#" className="text-white hover:text-accent-red transition-colors">Seriale</a>
                <a href="#" className="text-white hover:text-accent-red transition-colors">Premium</a>
                <a href="#" className="text-white hover:text-accent-red transition-colors">O nas</a>
              </nav>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden md:flex items-center space-x-2 bg-secondary-dark rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-gray-custom" />
                <Input 
                  type="text" 
                  placeholder="Szukaj filmów..." 
                  className="bg-transparent text-white placeholder-gray-custom border-none outline-none focus:ring-0 focus:border-none"
                />
              </div>
            )}
            
            {!user ? (
              <>
                <Button 
                  className="bg-premium text-black hover:bg-yellow-400"
                  onClick={onShowPremium}
                >
                  <Crown className="mr-2 w-4 h-4" />
                  Premium
                </Button>
                <Button 
                  className="bg-accent-red hover:bg-red-700"
                  onClick={onLogin}
                >
                  Zaloguj
                </Button>
              </>
            ) : (
              <>
                {!user.isPremium && (
                  <Button 
                    className="bg-premium text-black hover:bg-yellow-400"
                    onClick={onShowPremium}
                  >
                    <Crown className="mr-2 w-4 h-4" />
                    Premium
                  </Button>
                )}
                
                {user.isPremium && (
                  <Badge className="bg-premium text-black">
                    <Crown className="mr-1 w-3 h-3" />
                    Premium
                  </Badge>
                )}
                
                {user.isAdmin && (
                  <Button 
                    variant="outline"
                    onClick={() => setLocation("/admin")}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="cursor-pointer">
                      <AvatarImage src={user.profileImageUrl} />
                      <AvatarFallback>
                        {user.firstName?.[0] || user.email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-secondary-dark border-gray-700" align="end">
                    <DropdownMenuItem 
                      onClick={() => setLocation("/subscribe")}
                      className="hover:bg-gray-700"
                    >
                      <Crown className="mr-2 w-4 h-4" />
                      {user.isPremium ? "Manage Premium" : "Upgrade to Premium"}
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <DropdownMenuItem 
                        onClick={() => setLocation("/admin")}
                        className="hover:bg-gray-700"
                      >
                        <Settings className="mr-2 w-4 h-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      onClick={onLogout}
                      className="hover:bg-gray-700"
                    >
                      <LogOut className="mr-2 w-4 h-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
