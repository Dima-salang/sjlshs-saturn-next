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
            const response = await api.get('/api/user');
            setData(response.data);
            setStatus('success');
        } catch (err: any) {
            console.error(err);
            if (err.response?.status === 401) {
                setData({ message: 'Connected to API (Unauthorized, which is expected for /api/user without login)' });
                setStatus('success');
            } else {
                setError(err.message || 'An error occurred');
                setStatus('error');
            }
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 flex flex-col items-center justify-center font-sans">
            <Card className="w-full max-w-2xl border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <RefreshCcw className={cn("w-6 h-6", status === 'loading' && "animate-spin text-blue-400")} />
                        API Connection Bridge
                    </CardTitle>
                    <CardDescription className="text-zinc-500">
                        Diagnostics for the link between Next.js and Laravel.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center">
                        <Button
                            onClick={testConnection}
                            disabled={status === 'loading'}
                            className="w-full h-12 bg-white text-black hover:bg-zinc-200 transition-all font-semibold"
                        >
                            {status === 'loading' ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Testing Bridge...
                                </span>
                            ) : 'Test Connection'}
                        </Button>
                    </div>

                    <div className={cn(
                        "rounded-xl border p-4 transition-all duration-500",
                        status === 'idle' && "border-zinc-800 bg-zinc-900/40",
                        status === 'loading' && "border-blue-500/30 bg-blue-500/5 animate-pulse",
                        status === 'success' && "border-green-500/30 bg-green-500/5",
                        status === 'error' && "border-red-500/30 bg-red-500/5"
                    )}>
                        <h3 className="text-sm font-medium uppercase tracking-widest text-zinc-500 mb-4">Diagnostic Output</h3>
                        
                        {status === 'idle' && (
                            <div className="flex flex-col items-center py-8 text-zinc-600">
                                <RefreshCcw className="w-12 h-12 mb-4 opacity-10" />
                                <p>Ready to initialize handshake.</p>
                            </div>
                        )}

                        {status === 'success' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-green-400">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="font-semibold underline underline-offset-4">Success! Bridge is operational.</span>
                                </div>
                                <pre className="text-xs bg-black/40 p-4 rounded-lg border border-zinc-800 overflow-auto max-h-64 text-zinc-300">
                                    {JSON.stringify(data, null, 2)}
                                </pre>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-red-400">
                                    <AlertCircle className="w-5 h-5" />
                                    <span className="font-semibold underline underline-offset-4">Handshake Failed</span>
                                </div>
                                <div className="text-sm text-zinc-400 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                                    {error}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-zinc-900/80 rounded-xl p-4 border border-zinc-800/50">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Recovery Protocols</h4>
                        <ul className="text-xs space-y-2 text-zinc-500">
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                Confirm <code>php artisan serve</code> is active at port 8000.
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                Check <code>NEXT_PUBLIC_API_URL</code> in <code>.env.local</code>.
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-zinc-700" />
                                Verify <code>config/cors.php</code> allows <code>localhost:3000</code>.
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
