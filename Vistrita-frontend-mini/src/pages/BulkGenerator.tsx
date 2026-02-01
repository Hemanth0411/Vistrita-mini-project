import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthenticatedFetch } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

const BulkGenerator = () => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const authFetch = useAuthenticatedFetch();

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (file: File) => {
        if (file.type !== "application/json" && !file.name.endsWith('.json')) {
            toast({
                title: "Invalid file type",
                description: "Please upload a JSON file.",
                variant: "destructive"
            });
            return;
        }
        setFile(file);
        setResults([]);
        setMetrics(null);
    };

    const handleGenerate = async () => {
        if (!file) return;

        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const json = JSON.parse(text);

                // Handle format: { products: [...] } or just [...]
                const payload = Array.isArray(json)
                    ? { products: json }
                    : json.products ? json : { products: [json] }; // fallback for single obj

                if (!payload.products || !Array.isArray(payload.products)) {
                    throw new Error("Invalid JSON format. Expected { products: [...] }");
                }

                const response = await authFetch('/generator/generate/bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    throw new Error('Bulk generation failed');
                }

                const data = await response.json();
                setResults(data.results);
                setMetrics(data.metrics);
                toast({ title: 'Success!', description: `Processed ${data.metrics.total} products.` });

            } catch (error) {
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to process file",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <Layout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold gradient-text mb-2">Bulk Generator</h1>
                <p className="text-muted-foreground">
                    Upload a JSON file containing multiple products to generate descriptions in bulk.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Section */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload JSON</CardTitle>
                            <CardDescription>
                                File should contain a list of products under a "products" key.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors
                  ${dragActive ? "border-primary bg-primary/5" : "border-border"}
                  ${file ? "bg-accent/5" : ""}
                `}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept=".json"
                                    onChange={handleChange}
                                />

                                <div className="flex flex-col items-center gap-4">
                                    {file ? (
                                        <>
                                            <FileText className="w-12 h-12 text-primary" />
                                            <div>
                                                <p className="font-medium">{file.name}</p>
                                                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                                            </div>
                                            <Button variant="outline" onClick={() => setFile(null)}>Remove File</Button>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-12 h-12 text-muted-foreground" />
                                            <div>
                                                <p className="font-medium">Drag & drop or click to upload</p>
                                                <p className="text-sm text-muted-foreground">JSON files only</p>
                                            </div>
                                            <Button asChild>
                                                <label htmlFor="file-upload" className="cursor-pointer">Select File</label>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {file && (
                                <Button
                                    className="w-full mt-6"
                                    onClick={handleGenerate}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Processing..." : "Generate Descriptions"}
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Instructions Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">Expected JSON Format</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                                {`{
  "products": [
    {
      "title": "Product Name",
      "category": "Category",
      "features": ["Feature 1", "Feature 2"],
      "tone": "neutral"
    },
    ...
  ]
}`}
                            </pre>
                        </CardContent>
                    </Card>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                    {metrics && (
                        <div className="grid grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <div className="text-2xl font-bold">{metrics.total}</div>
                                    <div className="text-xs text-muted-foreground">Total</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <div className="text-2xl font-bold text-green-500">{metrics.successful}</div>
                                    <div className="text-xs text-muted-foreground">Successful</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6 text-center">
                                    <div className="text-2xl font-bold text-red-500">{metrics.failed}</div>
                                    <div className="text-xs text-muted-foreground">Failed</div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {results.length > 0 && (
                        <ScrollArea className="h-[600px] rounded-md border p-4">
                            <div className="space-y-4">
                                {results.map((item, index) => (
                                    <Card key={index} className="overflow-hidden">
                                        <div className="p-4 border-b bg-muted/50 flex justify-between items-center">
                                            <span className="font-medium">Result #{index + 1}</span>
                                            {item.titles && !item.titles[0].startsWith("Error") ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <AlertCircle className="w-4 h-4 text-red-500" />
                                            )}
                                        </div>
                                        <CardContent className="p-4 space-y-2">
                                            {item.titles && (
                                                <div>
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase">Title</span>
                                                    <p>{item.titles[0]}</p>
                                                </div>
                                            )}
                                            {item.description_short && (
                                                <div>
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase">Description</span>
                                                    <p className="text-sm text-muted-foreground line-clamp-3">{item.description_short}</p>
                                                </div>
                                            )}
                                            {item.warnings && item.warnings.length > 0 && (
                                                <div className="bg-yellow-500/10 p-2 rounded text-xs text-yellow-600 dark:text-yellow-400">
                                                    {item.warnings.join(", ")}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    )}

                    {!metrics && !isLoading && (
                        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed rounded-xl">
                            <p>Generated results will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default BulkGenerator;
