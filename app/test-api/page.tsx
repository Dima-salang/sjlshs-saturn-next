'use client';

import { useState } from 'react';
import api, { getCsrfToken } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RefreshCcw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TestApiPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const testConnection = async () => {
        setStatus('loading');
        setError(null);
        try {
            await getCsrfToken();
            const response = await api.get('/api/me');
            setData(response.data);
            setStatus('success');
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401) {
                setData({ authenticated: false, message: 'Connected to API (Unauthenticated)' });
                setStatus('success');
            } else {
                setError(err.message || 'An error occurred');
                setStatus('error');
            }
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center justify-center font-sans">
            <Card className="w-full max-w-2xl border-border bg-card/50 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-blue-500/50 to-primary/50" />
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <RefreshCcw className={cn("w-6 h-6", status === 'loading' && "animate-spin text-primary")} />
                        System Connection Test
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Check if the system is connected correctly.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-6">
                    <div className="flex justify-center">
                        <Button
                            onClick={testConnection}
                            disabled={status === 'loading'}
                            className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-bold rounded-xl shadow-lg shadow-primary/20"
                        >
                            {status === 'loading' ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Testing Connection...
                                </span>
                            ) : 'Run System Test'}
                        </Button>
                    </div>

                    <div className={cn(
                        "rounded-2xl border p-6 transition-all duration-500",
                        status === 'idle' && "border-border bg-muted/20",
                        status === 'loading' && "border-primary/30 bg-primary/5 animate-pulse",
                        status === 'success' && "border-emerald-500/30 bg-emerald-500/5",
                        status === 'error' && "border-destructive/30 bg-destructive/5"
                    )}>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Test Results</h3>
                        
                        {status === 'idle' && (
                            <div className="flex flex-col items-center py-8 text-muted-foreground/40">
                                <RefreshCcw className="w-12 h-12 mb-4 opacity-10" />
                                <p className="font-medium">Ready to test.</p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="font-bold underline underline-offset-4">Connection Successful!</span>
                                </div>
                                <pre className="text-xs bg-muted/50 p-4 rounded-xl border border-border overflow-auto max-h-64 text-foreground/80 font-mono">
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-destructive">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="font-bold underline underline-offset-4">Connection Failed</span>
                                </div>
                                <div className="text-sm text-foreground/70 bg-destructive/10 p-4 rounded-xl border border-destructive/20">
                                    {error}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-muted/30 rounded-2xl p-6 border border-border/50">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">How to fix this</h4>
                        <ul className="text-xs space-y-3 text-muted-foreground">
                            <li className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                Check if the backend server is running.
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                Check your internet connection.
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                Contact an administrator if the issue persists.
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
