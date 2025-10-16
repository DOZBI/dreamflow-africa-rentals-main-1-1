import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Shield, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PhoneAuthFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

const PhoneAuthForm = ({ onBack, onSuccess }: PhoneAuthFormProps) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters except '+'
    const cleaned = phone.replace(/[^0-9+]/g, '');

    if (cleaned.startsWith('+')) {
      return cleaned; // Already in international format
    }
    
    // Handle Congolese numbers (e.g., 06... or 6...)
    if (cleaned.startsWith('0')) {
      // Remove leading 0 and add +242
      return `+242${cleaned.slice(1)}`;
    }
    
    // Assume it's a local number without leading 0
    return `+242${cleaned}`;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);

      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (error) throw error;

      setStep('otp');
      toast({
        title: "Code envoyé",
        description: `Un code de vérification a été envoyé au ${formattedPhone}`,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);

      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Code invalide",
        description: error.message || "Veuillez vérifier votre code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="absolute left-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Phone className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl">
          {step === 'phone' ? 'Connexion par téléphone' : 'Vérification'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === 'phone' ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone</Label>
              <div className="flex items-center rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <span className="pl-3 pr-2 text-muted-foreground">+242</span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="6 123 45 67"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="border-0 h-9 focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 px-1">
                L'indicatif du Congo (+242) est utilisé par défaut.
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Envoi..." : "Envoyer le code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">Code de vérification</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="pl-10 text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Code envoyé au {formatPhoneNumber(phoneNumber)}
              </p>
            </div>
            
            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Vérification..." : "Vérifier"}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setStep('phone')}
              >
                Changer de numéro
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default PhoneAuthForm;
