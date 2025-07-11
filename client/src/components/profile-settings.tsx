import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Palette, Mail, Shield, Save, Copy, Check } from "lucide-react";

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess: () => void;
}

const themes = [
  { value: "dark", label: "Ciemny", preview: "bg-gray-900 text-white" },
  { value: "light", label: "Jasny", preview: "bg-white text-black border" },
  { value: "blue", label: "Niebieski", preview: "bg-blue-900 text-blue-100" },
  { value: "purple", label: "Fioletowy", preview: "bg-purple-900 text-purple-100" },
  { value: "red", label: "Czerwony", preview: "bg-red-900 text-red-100" },
];

const accentColors = [
  { value: "blue", label: "Niebieski", color: "bg-blue-500" },
  { value: "purple", label: "Fioletowy", color: "bg-purple-500" },
  { value: "red", label: "Czerwony", color: "bg-red-500" },
  { value: "green", label: "Zielony", color: "bg-green-500" },
  { value: "yellow", label: "Żółty", color: "bg-yellow-500" },
];

export default function ProfileSettings({ isOpen, onClose, user, onSuccess }: ProfileSettingsProps) {
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [newEmail, setNewEmail] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { theme, accentColor, setTheme, setAccentColor } = useTheme();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setBio(user.bio || "");
      if (user.theme && user.theme !== theme) {
        setTheme(user.theme);
      }
      if (user.accentColor && user.accentColor !== accentColor) {
        setAccentColor(user.accentColor);
      }
    }
  }, [user, theme, accentColor, setTheme, setAccentColor]);

  const updateProfileMutation = useMutation({
    mutationFn: (updates: any) => apiRequest("PUT", "/api/profile", updates),
    onSuccess: () => {
      toast({
        title: "Sukces",
        description: "Profil został zaktualizowany",
      });
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const changeEmailMutation = useMutation({
    mutationFn: (email: string) => apiRequest("POST", "/api/profile/change-email", { newEmail: email }),
    onSuccess: (data) => {
      toast({
        title: "Email wysłany",
        description: "Sprawdź swoją skrzynkę pocztową i kliknij link weryfikacyjny",
      });
      setVerificationToken(data.verificationToken); // Remove in production
      setNewEmail("");
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      displayName: displayName.trim() || undefined,
      bio: bio.trim() || undefined,
      theme,
      accentColor,
    });
  };

  const handleChangeEmail = () => {
    if (newEmail && newEmail !== user?.email) {
      changeEmailMutation.mutate(newEmail);
    }
  };

  const copyVerificationLink = () => {
    const link = `${window.location.origin}/api/profile/verify-email/${verificationToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setVerificationToken("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Ustawienia profilu
          </DialogTitle>
          <DialogDescription>
            Personalizuj swój profil i zarządzaj ustawieniami konta
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="appearance">Wygląd</TabsTrigger>
            <TabsTrigger value="account">Konto</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informacje o profilu</CardTitle>
                <CardDescription>
                  Ustaw swoją nazwę wyświetlaną i opis profilu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Nazwa wyświetlana</Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Twoja nazwa wyświetlana"
                    maxLength={50}
                  />
                  <p className="text-xs text-muted-foreground">
                    {displayName.length}/50 znaków
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Opis profilu</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Opowiedz coś o sobie..."
                    maxLength={500}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    {bio.length}/500 znaków
                  </p>
                </div>

                <Button 
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? "Zapisywanie..." : "Zapisz profil"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Personalizacja wyglądu
                </CardTitle>
                <CardDescription>
                  Dostosuj motyw i kolory do swoich preferencji
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Motyw</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {themes.map((themeOption) => (
                      <div
                        key={themeOption.value}
                        className={`
                          relative cursor-pointer rounded-lg border-2 p-4 
                          ${theme === themeOption.value ? 'border-primary' : 'border-muted'}
                          ${themeOption.preview}
                        `}
                        onClick={() => setTheme(themeOption.value)}
                      >
                        <div className="text-center">
                          <div className="font-medium">{themeOption.label}</div>
                          <div className="text-sm opacity-70">Przykład tekstu</div>
                        </div>
                        {theme === themeOption.value && (
                          <div className="absolute top-2 right-2">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Kolor akcentu</Label>
                  <div className="flex gap-3">
                    {accentColors.map((color) => (
                      <button
                        key={color.value}
                        className={`
                          relative w-12 h-12 rounded-full ${color.color}
                          ${accentColor === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''}
                        `}
                        onClick={() => setAccentColor(color.value)}
                        title={color.label}
                      >
                        {accentColor === color.value && (
                          <Check className="h-4 w-4 text-white absolute inset-0 m-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? "Zapisywanie..." : "Zastosuj zmiany"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Zmiana adresu email
                </CardTitle>
                <CardDescription>
                  Zmień swój adres email - wymagana jest weryfikacja
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Aktualny email</Label>
                  <Input value={user?.email || ""} disabled />
                </div>

                {user?.pendingEmail && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Oczekuje na weryfikację: <strong>{user.pendingEmail}</strong>
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                      Sprawdź swoją skrzynkę pocztową i kliknij link weryfikacyjny
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="new-email">Nowy adres email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nowy@email.com"
                  />
                </div>

                <Button 
                  onClick={handleChangeEmail}
                  disabled={!newEmail || newEmail === user?.email || changeEmailMutation.isPending}
                  className="w-full"
                >
                  {changeEmailMutation.isPending ? "Wysyłanie..." : "Wyślij email weryfikacyjny"}
                </Button>

                {verificationToken && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                      Link weryfikacyjny (tylko do testów):
                    </p>
                    <div className="flex items-center gap-2">
                      <Input
                        value={`${window.location.origin}/api/profile/verify-email/${verificationToken}`}
                        readOnly
                        className="text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copyVerificationLink}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}