import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import ProductForm from '@/components/ProductForm';
import ResultDisplay from '@/components/ResultDisplay';
import { useAuthenticatedFetch } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface GenerationResult {
  titles: string[];
  description_short: string;
  description_long: string;
  bullets: string[];
  warnings: string[];
}

const Dashboard = () => {
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const authFetch = useAuthenticatedFetch();

  const handleGenerate = async (data: {
    title: string;
    category: string;
    features: string[];
    tone: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await authFetch('/generator/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const resultData = await response.json();
      setResult(resultData);
      toast({ title: 'Success!', description: 'Description generated successfully.' });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Generation failed',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold gradient-text mb-2">Product Generator</h1>
        <p className="text-muted-foreground">
          Create compelling product descriptions with AI-powered generation.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Forms */}
        <div className="space-y-6">
          <ProductForm onGenerate={handleGenerate} isLoading={isLoading} />
        </div>

        {/* Right Column - Results */}
        <div>
          <ResultDisplay result={result} />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
