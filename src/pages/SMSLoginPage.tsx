import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSMSAuth } from '@/contexts/SMSAuthContext';
import { toast } from 'sonner';
import { Phone, KeySquare } from 'lucide-react';

export const SMSLoginPage = () => {
  const [numero, setNumero] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useSMSAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!numero || !code) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await login(numero, code);
      toast.success('Connexion réussie !');
      navigate('/');
    } catch (error) {
      toast.error('Code d\'abonnement invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-dreamflow">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            DreamFlow
          </CardTitle>
          <CardDescription className="text-base">
            Connectez-vous avec votre code d'abonnement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="numero" className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Numéro de téléphone
              </label>
              <Input
                id="numero"
                type="tel"
                placeholder="+241065119788"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                className="text-base"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium flex items-center gap-2">
                <KeySquare className="h-4 w-4" />
                Code d'abonnement
              </label>
              <Input
                id="code"
                type="text"
                placeholder="000001"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-base font-mono tracking-wider"
                disabled={loading}
                maxLength={6}
              />
            </div>

            <Button
              type="submit"
              className="w-full text-base py-6"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-4">
              <p>Codes de test disponibles :</p>
              <p className="font-mono text-xs mt-1">000001 • 000002 • 000003</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SMSLoginPage;