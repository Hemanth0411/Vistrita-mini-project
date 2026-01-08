import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wand2, X, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ProductFormProps {
  onGenerate: (data: {
    title: string;
    category: string;
    features: string[];
    tone: string;
  }) => Promise<void>;
  isLoading: boolean;
}

const TONES = ['Luxury', 'Playful', 'Professional', 'Casual', 'Technical', 'Minimalist'];
const CATEGORIES = ['Electronics', 'Fashion', 'Home & Garden', 'Beauty', 'Sports', 'Food & Beverages'];

const ProductForm = ({ onGenerate, isLoading }: ProductFormProps) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [tone, setTone] = useState('');

  const addFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures([...features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (feature: string) => {
    setFeatures(features.filter((f) => f !== feature));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate({ title, category, features, tone });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 space-y-6"
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary/20">
          <Wand2 className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">Product Details</h2>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Product Title</label>
        <Input
          placeholder="e.g., Wireless Noise-Cancelling Headphones"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                category === cat
                  ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                  : 'bg-glass border border-glass-border text-muted-foreground hover:text-foreground hover:border-primary/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Key Features</label>
        <div className="flex gap-2">
          <Input
            placeholder="Add a feature..."
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
          />
          <Button type="button" variant="outline" size="icon" onClick={addFeature}>
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {features.map((feature) => (
            <motion.span
              key={feature}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-sm"
            >
              {feature}
              <button type="button" onClick={() => removeFeature(feature)}>
                <X className="w-4 h-4 hover:text-destructive transition-colors" />
              </button>
            </motion.span>
          ))}
        </div>
      </div>

      {/* Tone */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Tone</label>
        <div className="flex flex-wrap gap-2">
          {TONES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                tone === t
                  ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                  : 'bg-glass border border-glass-border text-muted-foreground hover:text-foreground hover:border-primary/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        variant="glow"
        size="lg"
        className="w-full"
        disabled={isLoading || !title || !category || !tone}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="w-5 h-5" />
            Generate Description
          </>
        )}
      </Button>
    </motion.form>
  );
};

export default ProductForm;
