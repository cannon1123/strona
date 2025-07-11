import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, Copy, Check } from "lucide-react";

interface TwoFactorSetupProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess: () => void;
}

export default function TwoFactorSetup({ isOpen, onClose, user, onSuccess }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'initial' | 'setup' | 'verify'>('initial');
  const [qrCode, setQrCode] = useState<string>('');
  const [manualKey, setManualKey] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const setupMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/2fa/setup"),
    onSuccess: (data) => {
      setQrCode(data.qrCode);
      setManualKey(data.manualEntryKey);
      setStep('setup');
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (token: string) => apiRequest("POST", "/api/auth/2fa/verify", { token }),
    onSuccess: () => {
      toast({
        title: "Sukces",
        description: "Weryfikacja dwuetapowa została włączona",
      });
      onSuccess();
      onClose();
      setStep('initial');
    },
    onError: (error) => {
      toast({
        title: "Błąd weryfikacji",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const disableMutation = useMutation({
    mutationFn: (token: string) => apiRequest("POST", "/api/auth/2fa/disable", { token }),
    onSuccess: () => {
      toast({
        title: "Sukces",
        description: "Weryfikacja dwuetapowa została wyłączona",
      });
      onSuccess();
      onClose();
      setStep('initial');
    },
    onError: (error) => {
      toast({
        title: "Błąd",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSetup = () => {
    setupMutation.mutate();
  };

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      verifyMutation.mutate(verificationCode);
    }
  };

  const handleDisable = () => {
    if (verificationCode.length === 6) {
      disableMutation.mutate(verificationCode);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(manualKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setStep('initial');
    setVerificationCode('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Weryfikacja dwuetapowa (2FA)
          </DialogTitle>
          <DialogDescription>
            {user?.twoFactorEnabled 
              ? "Zarządzaj weryfikacją dwuetapową dla swojego konta"
              : "Zwiększ bezpieczeństwo swojego konta włączając 2FA"
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'initial' && (
          <div className="space-y-4">
            {user?.twoFactorEnabled ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Weryfikacja dwuetapowa jest włączona</span>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="disable-code">Kod z aplikacji authenticator</Label>
                  <Input
                    id="disable-code"
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                </div>
                <Button 
                  onClick={handleDisable}
                  disabled={verificationCode.length !== 6 || disableMutation.isPending}
                  variant="destructive"
                  className="w-full"
                >
                  {disableMutation.isPending ? "Wyłączanie..." : "Wyłącz 2FA"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Weryfikacja dwuetapowa dodaje dodatkową warstwę bezpieczeństwa do Twojego konta.
                </p>
                <Button 
                  onClick={handleSetup}
                  disabled={setupMutation.isPending}
                  className="w-full"
                >
                  {setupMutation.isPending ? "Przygotowywanie..." : "Włącz 2FA"}
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 'setup' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Krok 1: Zeskanuj kod QR</h4>
              <p className="text-sm text-muted-foreground">
                Użyj aplikacji Google Authenticator lub podobnej, aby zeskanować kod QR:
              </p>
              {qrCode && (
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <img src={qrCode} alt="QR Code for 2FA setup" className="w-48 h-48" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Lub wprowadź klucz ręcznie:</h4>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={manualKey}
                  className="font-mono text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyToClipboard}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button onClick={() => setStep('verify')} className="w-full">
              Dalej
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Krok 2: Weryfikacja</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Wprowadź 6-cyfrowy kod z aplikacji authenticator:
              </p>
              <div className="space-y-2">
                <Label htmlFor="verification-code">Kod weryfikacyjny</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('setup')}
                className="flex-1"
              >
                Wstecz
              </Button>
              <Button 
                onClick={handleVerify}
                disabled={verificationCode.length !== 6 || verifyMutation.isPending}
                className="flex-1"
              >
                {verifyMutation.isPending ? "Weryfikacja..." : "Weryfikuj"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}