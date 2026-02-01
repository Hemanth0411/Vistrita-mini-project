import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Search, Calendar, ChevronRight, Loader2, RefreshCw, Copy, Check } from 'lucide-react';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthenticatedFetch } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface LogEntry {
  id: number;
  product_name: string;
  category: string;
  tone: string;
  description: string;
  titles?: string[];
  description_short?: string;
  description_long?: string;
  bullets?: string[];
  warnings?: string[];
  keywords?: string[];
  created_at: string;
}

const History = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const authFetch = useAuthenticatedFetch();

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: 'Copied!', description: 'Text copied to clipboard.' });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch('/history/logs');
      if (!response.ok) throw new Error('Failed to fetch logs');
      const data = await response.json();
      setLogs(data);
      setFilteredLogs(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch history logs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    const filtered = logs.filter(
      (log) =>
        log.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.tone?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLogs(filtered);
  }, [searchQuery, logs]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Generation History</h1>
            <p className="text-muted-foreground">
              View and manage your past product descriptions.
            </p>
          </div>
          <Button variant="outline" onClick={fetchLogs} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by title, category, or tone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11"
          />
        </div>
      </motion.div>

      {/* Logs Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredLogs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-2xl p-12 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-glass flex items-center justify-center mx-auto mb-4">
            <HistoryIcon className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No History Found</h3>
          <p className="text-muted-foreground text-sm">
            {searchQuery
              ? 'No results match your search.'
              : 'Generate some product descriptions to see them here.'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredLogs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedLog(log)}
              className="glass-card rounded-xl p-5 cursor-pointer hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {log.product_name || 'Untitled'}
                </h3>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {log.category && (
                  <span className="px-2 py-1 rounded-md bg-primary/20 text-primary text-xs font-medium">
                    {log.category}
                  </span>
                )}
                {log.tone && (
                  <span className="px-2 py-1 rounded-md bg-accent/20 text-accent text-xs font-medium">
                    {log.tone}
                  </span>
                )}
              </div>

              {log.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {log.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {formatDate(log.created_at)}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Log Detail Modal */}
      {selectedLog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedLog(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="glass-card rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold gradient-text mb-4">{selectedLog.product_name}</h2>
            <div className="flex gap-2 mb-6">
              {selectedLog.category && (
                <span className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-sm font-medium">
                  {selectedLog.category}
                </span>
              )}
              {selectedLog.tone && (
                <span className="px-3 py-1.5 rounded-lg bg-accent/20 text-accent text-sm font-medium">
                  {selectedLog.tone}
                </span>
              )}
            </div>

            {/* Reusing ResultDisplay would be best, but for now we manually render the extensive details */}
            <div className="space-y-6">
              {/* Titles */}
              {selectedLog.titles && selectedLog.titles.length > 0 && (
                <div className="p-4 rounded-xl bg-secondary/30">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      Suggested Titles
                    </h4>
                  </div>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedLog.titles.map((t: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex justify-between items-center group">
                        <span className="flex-1">{t}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(t, `title-${i}`)}>
                          {copiedField === `title-${i}` ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Short Description */}
              {selectedLog.description_short && (
                <div className="relative group/section">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Short Description</h4>
                    <Button variant="ghost" size="sm" className="h-6 px-2 opacity-0 group-hover/section:opacity-100 transition-opacity" onClick={() => copyToClipboard(selectedLog.description_short!, 'short')}>
                      {copiedField === 'short' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      <span className="ml-1 text-xs">Copy</span>
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{selectedLog.description_short}</p>
                </div>
              )}

              {/* Long Description (fallback to 'description' if description_long is empty) */}
              {(selectedLog.description_long || selectedLog.description) && (
                <div className="relative group/section">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Long Description</h4>
                    <Button variant="ghost" size="sm" className="h-6 px-2 opacity-0 group-hover/section:opacity-100 transition-opacity" onClick={() => copyToClipboard(selectedLog.description_long || selectedLog.description, 'long')}>
                      {copiedField === 'long' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      <span className="ml-1 text-xs">Copy</span>
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedLog.description_long || selectedLog.description}
                  </p>
                </div>
              )}

              {/* Bullets */}
              {selectedLog.bullets && selectedLog.bullets.length > 0 && (
                <div className="relative group/section">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Key Highlights</h4>
                    <Button variant="ghost" size="sm" className="h-6 px-2 opacity-0 group-hover/section:opacity-100 transition-opacity" onClick={() => copyToClipboard(selectedLog.bullets!.join('\n'), 'bullets')}>
                      {copiedField === 'bullets' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      <span className="ml-1 text-xs">Copy</span>
                    </Button>
                  </div>
                  <ul className="space-y-2">
                    {selectedLog.bullets.map((b: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-primary">•</span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Keywords */}
              {selectedLog.keywords && selectedLog.keywords.length > 0 && (
                <div className="relative group/section">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Keywords</h4>
                    <Button variant="ghost" size="sm" className="h-6 px-2 opacity-0 group-hover/section:opacity-100 transition-opacity" onClick={() => copyToClipboard(selectedLog.keywords!.join(', '), 'keywords')}>
                      {copiedField === 'keywords' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      <span className="ml-1 text-xs">Copy</span>
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedLog.keywords.map((k: string, i: number) => (
                      <span key={i} className="px-2 py-1 rounded-md bg-secondary text-xs text-muted-foreground border border-white/5">
                        #{k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {selectedLog.warnings && selectedLog.warnings.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <h4 className="font-semibold mb-2 text-amber-500">Warnings</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedLog.warnings.map((w: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground">{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-8 pt-4 border-t border-white/10">
              <Calendar className="w-4 h-4" />
              {formatDate(selectedLog.created_at)}
            </div>
            <Button variant="outline" className="mt-4 w-full" onClick={() => setSelectedLog(null)}>
              Close
            </Button>
          </motion.div>
        </motion.div>
      )}
    </Layout>
  );
};

export default History;
