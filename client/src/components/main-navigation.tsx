import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Video, 
  Crown, 
  Settings, 
  LogOut, 
  User, 
  Plus,
  Home,
  Film,
  Skull,
  Heart,
  Zap,
  Laugh,
  Drama,
  Grid3X3
} from "lucide-react";

interface MainNavigationProps {
  user?: any;
  onLogin?: () => void;
  onLogout?: () => void;
  onShowPremium?: () => void;
  onShow2FA?: () => void;
  onShowSettings?: () => void;
  onShowAddMovie?: () => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

const categories = [
  { value: "wszystkie", label: "Wszystkie", icon: Grid3X3 },
  { value: "polecane", label: "Polecane", icon: Heart },
  { value: "animowane", label: "Animowane", icon: Film },
  { value: "horrory", label: "Horrory", icon: Skull },
  { value: "akcja", label: "Akcja", icon: Zap },
  { value: "komedia", label: "Komedia", icon: Laugh },
  { value: "dramat", label: "Dramat", icon: Drama },
];

export default function MainNavigation({ 
  user, 
  onLogin, 
  onLogout, 
  onShowPremium, 
  onShow2FA, 
  onShowSettings,
  onShowAddMovie,
  selectedCategory = "wszystkie",
  onCategoryChange 
}: MainNavigationProps) {
  const [, setLocation] = useLocation();

  return (
    <header className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b z-50 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Video className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                StreamHub
              </span>
            </div>
          </div>

          {/* Categories Navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.value;
                return (
                  <Button
                    key={category.value}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onCategoryChange?.(category.value)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {category.label}
                  </Button>
                );
              })}
            </nav>
          )}

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Premium Status */}
                {user.isPremium && (
                  <Badge className="bg-yellow-500 text-black hover:bg-yellow-400">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      {user.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt="Profile" 
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                      <span className="hidden sm:inline">
                        {user.displayName || user.firstName || "Użytkownik"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setLocation("/")}>
                      <Home className="h-4 w-4 mr-2" />
                      Strona główna
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    
                    {(user.email === "tomaszjasi35@gmail.com" || user.isAdmin) && (
                      <DropdownMenuItem onClick={onShowAddMovie}>
                        <Plus className="h-4 w-4 mr-2" />
                        Dodaj film
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem onClick={onShowSettings}>
                      <Settings className="h-4 w-4 mr-2" />
                      Ustawienia profilu
                    </DropdownMenuItem>

                    {(user.email === "tomaszjasi35@gmail.com" || user.isAdmin) && (
                      <DropdownMenuItem onClick={() => setLocation("/admin")}>
                        <Crown className="h-4 w-4 mr-2" />
                        Panel administracyjny
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />
                    
                    {!user.isPremium && (
                      <DropdownMenuItem onClick={onShowPremium}>
                        <Crown className="h-4 w-4 mr-2" />
                        Kup Premium
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem onClick={onLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Wyloguj się
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={onLogin}>
                Zaloguj się
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Categories */}
        {user && (
          <div className="md:hidden py-2 border-t">
            <div className="flex overflow-x-auto space-x-2 pb-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = selectedCategory === category.value;
                return (
                  <Button
                    key={category.value}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onCategoryChange?.(category.value)}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <Icon className="h-4 w-4" />
                    {category.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}