import { motion } from 'framer-motion';
import { Copy, Check, FileText, List, AlignLeft, AlertTriangle, Hash, Type } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ResultDisplayProps {
  result: {
    titles: string[];
    description_short: string;
    description_long: string;
    bullets: string[];
    warnings: string[];
    keywords?: string[];
  } | null;
}

const ResultDisplay = ({ result }: ResultDisplayProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: 'Copied!', description: 'Text copied to clipboard.' });
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!result) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center"
      >
        <div className="w-20 h-20 rounded-full bg-glass flex items-center justify-center mb-4">
          <FileText className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Results Yet</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          Fill in the product details or upload an image to generate beautiful descriptions.
        </p>
      </motion.div>
    );
  }

  const sections = [
    {
      key: 'short',
      icon: AlignLeft,
      title: 'Short Description',
      content: result.description_short,
      delay: 0
    },
    {
      key: 'long',
      icon: FileText,
      title: 'Long Description',
      content: result.description_long,
      delay: 0.1
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Generated Titles */}
      {result.titles && result.titles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20">
                <Type className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold">Suggested Titles</h3>
            </div>
          </div>
          <div className="space-y-2">
            {result.titles.map((title, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <span className="text-sm font-medium">{title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(title, `title-${i}`)}
                  className="h-8 w-8"
                >
                  {copiedField === `title-${i}` ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {sections.map(({ key, icon: Icon, title, content, delay }) =>
        content ? (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">{title}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(content, key)}
                className="gap-2"
              >
                {copiedField === key ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                Copy
              </Button>
            </div>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
          </motion.div>
        ) : null
      )}

      {/* Bullets */}
      {result.bullets && result.bullets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <List className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold">Key Highlights</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(result.bullets!.join('\n'), 'bullets')}
              className="gap-2"
            >
              {copiedField === 'bullets' ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              Copy
            </Button>
          </div>
          <ul className="space-y-3">
            {result.bullets.map((bullet, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-3 text-muted-foreground"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <span className="leading-relaxed">{bullet}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Keywords */}
      {result.keywords && result.keywords.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Hash className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="font-semibold">SEO Keywords</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(result.keywords!.join(', '), 'keywords')}
              className="gap-2"
            >
              {copiedField === 'keywords' ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              Copy
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.keywords.map((kw, i) => (
              <span key={i} className="px-3 py-1 rounded-full bg-secondary/50 text-xs font-medium text-foreground border border-white/10">
                #{kw}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Warnings */}
      {result.warnings && result.warnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-6 border-l-4 border-l-amber-500"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="font-semibold text-amber-500">Safety & Compliance</h3>
          </div>
          <ul className="space-y-2">
            {result.warnings.map((warn, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {warn}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

    </motion.div>
  );
};

export default ResultDisplay;
