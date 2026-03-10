'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CheckCircle2, AlertCircle, ArrowLeft, Scan, Loader2, Clock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import api from '@/lib/api';

export default function QRScannerPage() {
    const [status, setStatus] = useState<'idle' | 'scanning' | 'processing' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string | null>(null);
    const [isLate, setIsLate] = useState(false);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const scannerId = "reader";

    const handleScanSuccess = useCallback(async (decodedText: string) => {
        // Stop scanning immediately
        if (html5QrCodeRef.current?.isScanning) {
            try {
                await html5QrCodeRef.current.stop();
            } catch (e) {
                console.warn("Failed to stop scanner", e);
            }
        }

        setStatus('processing');

        try {
            let lrnCandidate = decodedText;
            
            try {
                // Support both JSON and raw text
                const normalizedJson = decodedText.replaceAll("'", '"');
                const parsed = JSON.parse(normalizedJson);
                if (parsed && typeof parsed === 'object' && parsed.lrn) {
                    lrnCandidate = String(parsed.lrn);
                }
            } catch (e) {
                // Not JSON, use as-is
            }

            await api.get('/sanctum/csrf-cookie');
            await api.post('/api/attendance', {
                lrn: lrnCandidate,
                timestamp: new Date().toISOString(),
                is_late: isLate
            });

            setStatus('success');
            setMessage(`LRN Verified: ${lrnCandidate}`);
            
            // Auto-reset after successful scan
            setTimeout(() => {
                setStatus(prev => prev === 'success' ? 'scanning' : prev);
                if (html5QrCodeRef.current && !html5QrCodeRef.current.isScanning) {
                    resetScanner();
                }
            }, 2000);
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            const serverMsg = err.response?.data?.message || 'Check connection to school server.';
            setMessage(`${serverMsg} (${decodedText})`);
            
            // Auto-reset after error to keep the flow going
            setTimeout(() => {
                setStatus(prev => prev === 'error' ? 'scanning' : prev);
                if (html5QrCodeRef.current && !html5QrCodeRef.current.isScanning) {
                    resetScanner();
                }
            }, 4000);
        }
    }, []);

    const startScanner = async () => {
        setStatus('scanning');
        setMessage(null);

        try {
            const html5QrCode = new Html5Qrcode(scannerId);
            html5QrCodeRef.current = html5QrCode;

            const config = { 
                fps: 20, 
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1
            };

            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                handleScanSuccess,
                () => {} // silent ignore errors during scan
            );
        } catch (err) {
            console.error("Scanner start error:", err);
            setStatus('error');
            setMessage("Could not access camera. Please check permissions.");
        }
    };

    const resetScanner = () => {
        startScanner();
    };

    useEffect(() => {
        return () => {
            html5QrCodeRef.current?.stop().catch(console.error);
        };
    }, []);

    return (
        <div className="relative min-h-[calc(100vh-64px)] bg-[#050508] text-zinc-100 flex flex-col items-center justify-center overflow-hidden font-sans p-4">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-[50%] h-[50%] bg-indigo-500/5 blur-[120px] rounded-full" />
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-xl"
            >
                <div className="flex flex-col items-center mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500 mb-2">
                        Student Scanner
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        Scan the student's QR code to record attendance.
                    </p>
                </div>

                <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-xl shadow-2xl overflow-hidden rounded-3xl">
                    <CardHeader className="border-b border-zinc-800/50 py-4 px-6 flex flex-row items-center justify-between space-y-0">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "w-2 h-2 rounded-full",
                                    status === 'scanning' ? "bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-zinc-700"
                                )} />
                                <span className="text-xs font-medium text-zinc-400 capitalize">
                                    {status}
                                </span>
                            </div>
                            
                            {/* Late Mode Toggle */}
                            <button 
                                onClick={() => setIsLate(!isLate)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border",
                                    isLate 
                                        ? "bg-amber-500/10 border-amber-500/50 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]" 
                                        : "bg-zinc-800/50 border-zinc-700 text-zinc-500 hover:text-zinc-400"
                                )}
                            >
                                <Clock className={cn("w-3 h-3", isLate && "animate-pulse")} />
                                Late Mode {isLate ? "ON" : "OFF"}
                            </button>
                        </div>
                        
                        {status === 'scanning' && (
                            <span className={cn(
                                "text-[10px] uppercase tracking-widest font-bold flex items-center gap-1.5 transition-colors",
                                isLate ? "text-amber-500" : "text-blue-500/70"
                            )}>
                                <Scan className="w-3 h-3" />
                                {isLate ? "Scanning Lates" : "Ready to Scan"}
                            </span>
                        )}
                    </CardHeader>
                    
                    <CardContent className="p-0">
                        <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
                            {status === 'idle' && (
                                <Button 
                                    onClick={startScanner}
                                    className="bg-white text-black hover:bg-zinc-200 h-14 px-8 rounded-2xl text-base font-bold shadow-2xl shadow-white/5 active:scale-95 transition-all"
                                >
                                    <Camera className="w-5 h-5 mr-3" />
                                    Start Camera
                                </Button>
                            )}
                            
                            {/* The Scanner Container */}
                            <div 
                                id={scannerId} 
                                className={cn(
                                    "w-full h-full object-cover [&_video]:w-full [&_video]:h-full [&_video]:object-cover",
                                    status !== 'scanning' && "hidden"
                                )} 
                            />

                            {/* Scanner Overlay UI */}
                            {status === 'scanning' && (
                                <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
                                    <div className="w-[280px] h-[280px] border border-white/10 rounded-3xl overflow-hidden relative">
                                        {/* Corners */}
                                        <div className={cn("absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-xl transition-colors", isLate ? "border-amber-500" : "border-blue-500")} />
                                        <div className={cn("absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 rounded-tr-xl transition-colors", isLate ? "border-amber-500" : "border-blue-500")} />
                                        <div className={cn("absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 rounded-bl-xl transition-colors", isLate ? "border-amber-500" : "border-blue-500")} />
                                        <div className={cn("absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-xl transition-colors", isLate ? "border-amber-500" : "border-blue-500")} />
                                        
                                        {/* Animated Laser */}
                                        <motion.div 
                                            animate={{ top: ['0%', '100%', '0%'] }}
                                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                                            className={cn(
                                                "absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-current to-transparent shadow-lg transition-colors",
                                                isLate ? "text-amber-400 shadow-amber-500/50" : "text-blue-400 shadow-blue-500/50"
                                            )}
                                        />
                                    </div>
                                    
                                    {/* Scanline pattern */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
                                </div>
                            )}

                            {/* Processing/Result Overlay */}
                            <AnimatePresence>
                                {(status === 'success' || status === 'error' || status === 'processing') && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-20 bg-[#050508]/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                                    >
                                        {status === 'processing' && (
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                                                <p className="text-zinc-400 font-medium tracking-wide">Recording attendance...</p>
                                            </div>
                                        )}

                                        {status === 'success' && (
                                            <motion.div 
                                                initial={{ scale: 0.9, y: 10 }}
                                                animate={{ scale: 1, y: 0 }}
                                                className="flex flex-col items-center"
                                            >
                                                <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Check-in Successful</h3>
                                                <p className="text-zinc-500 mb-8">{message}</p>
                                                <Button 
                                                    onClick={resetScanner}
                                                    className="bg-zinc-100 text-black hover:bg-white rounded-2xl px-8 h-12 font-bold transition-all group"
                                                >
                                                    Next Student
                                                    <span className="ml-2 text-[10px] text-zinc-400 group-hover:text-zinc-600 transition-colors animate-pulse">(Auto in 2s)</span>
                                                </Button>
                                            </motion.div>
                                        )}

                                        {status === 'error' && (
                                            <motion.div 
                                                initial={{ scale: 0.9, y: 10 }}
                                                animate={{ scale: 1, y: 0 }}
                                                className="flex flex-col items-center"
                                            >
                                                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                                                    <AlertCircle className="w-10 h-10 text-red-500" />
                                                </div>
                                                <h3 className="text-2xl font-bold text-white mb-2">Scan Error</h3>
                                                <p className="text-zinc-500 mb-8 max-w-[280px] break-words">{message}</p>
                                                <Button 
                                                    onClick={resetScanner}
                                                    variant="outline"
                                                    className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 rounded-2xl px-8 h-12 font-bold transition-all"
                                                >
                                                    Try Again
                                                    <span className="ml-2 text-[10px] text-zinc-500 animate-pulse">(Auto in 4s)</span>
                                                </Button>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </CardContent>
                    
                    <div className="px-6 py-4 bg-zinc-900/50 flex items-center justify-center border-t border-zinc-800/50">
                        <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 flex items-center gap-2 transition-colors">
                            <ArrowLeft className="w-3 h-3" />
                            Return to Dashboard
                        </Link>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
