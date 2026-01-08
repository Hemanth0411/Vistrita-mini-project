import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, Upload, X, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  onUpload: (base64: string) => Promise<void>;
  isLoading: boolean;
}

const ImageUpload = ({ onUpload, isLoading }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setPreview(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    setPreview(null);
  };

  const handleGenerate = async () => {
    if (preview) {
      await onUpload(preview);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-accent/20">
          <Eye className="w-5 h-5 text-accent" />
        </div>
        <h2 className="text-lg font-semibold">Vision Mode</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Upload a product image to generate descriptions using AI vision.
      </p>

      {!preview ? (
        <label
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-glass-border hover:border-primary/50 hover:bg-glass/50'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
          <ImagePlus className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
        </label>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Product preview"
            className="w-full h-48 object-cover rounded-xl"
          />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 p-2 rounded-full bg-background/80 hover:bg-destructive/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {preview && (
        <Button
          onClick={handleGenerate}
          variant="gradient"
          size="lg"
          className="w-full mt-4"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Generate from Image
            </>
          )}
        </Button>
      )}
    </motion.div>
  );
};

export default ImageUpload;
