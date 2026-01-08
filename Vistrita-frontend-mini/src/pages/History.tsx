import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, Search, Calendar, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
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
  created_at: string;
}

const History = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const authFetch = useAuthenticatedFetch();

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
            <div className="flex gap-2 mb-4">
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
            {selectedLog.description && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{selectedLog.description}</p>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {formatDate(selectedLog.created_at)}
            </div>
            <Button variant="outline" className="mt-6" onClick={() => setSelectedLog(null)}>
              Close
            </Button>
          </motion.div>
        </motion.div>
      )}
    </Layout>
  );
};

export default History;
