import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, Loader2 } from 'lucide-react';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect based on auth state
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent glow-primary animate-pulse">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-bold gradient-text mb-4">Vistrita</h1>
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
      </div>
    </div>
  );
};

export default Index;
