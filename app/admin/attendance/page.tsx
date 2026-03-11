'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar as CalendarIcon, 
    Search, 
    MoreVertical, 
    Edit2, 
    Trash2, 
    Plus,
    Loader2,
    Save,
    RefreshCw,
    Clock,
    UserCheck,
    UserMinus,
    Filter,
    ArrowUpDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface Section {
    section_id: number;
    section_name: string;
}

interface AttendanceRecord {
    id: number;
    lrn: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    grade_level: string;
    section_id: number;
    is_absent: boolean;
    is_late: boolean;
    scan_timestamp: string | null;
    created_at: string;
}

export default function AttendanceAdminPage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sectionFilter, setSectionFilter] = useState<string>('all');
    const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Manual attendance state
    const [newRecord, setNewRecord] = useState({
        lrn: '',
        is_late: false,
        is_absent: false,
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [attendanceRes, sectionsRes] = await Promise.all([
                api.get('/api/attendance', {
                    params: {
                        section_id: sectionFilter === 'all' ? null : sectionFilter
                    }
                }),
                api.get('/api/sections')
            ]);
            setRecords(attendanceRes.data.data || attendanceRes.data);
            setSections(sectionsRes.data);
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            toast.error("Failed to load records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [sectionFilter]);

    const handleCreateRecord = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.post('/api/attendance', newRecord);
            toast.success("Manual entry recorded");
            setIsCreating(false);
            setNewRecord({ lrn: '', is_late: false, is_absent: false });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Entry failed");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateRecord = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingRecord) return;
        setIsSaving(true);
        try {
            await api.put(`/api/attendance/${editingRecord.id}`, {
                is_late: editingRecord.is_late,
                is_absent: editingRecord.is_absent,
            });
            toast.success("Log updated");
            setEditingRecord(null);
            fetchData();
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteRecord = async (id: number) => {
        if (!confirm('Delete this attendance record?')) return;
        try {
            await api.delete(`/api/attendance/${id}`);
            toast.success("Record deleted");
            fetchData();
        } catch (error) {
            toast.error("Deletion failed");
        }
    };

    const filteredRecords = records.filter(r => 
        r.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.lrn.includes(searchQuery)
    );

    const stats = {
        total: records.length,
        late: records.filter(r => r.is_late).length,
        absent: records.filter(r => r.is_absent).length,
        present: records.filter(r => !r.is_absent).length,
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-12 font-sans selection:bg-emerald-500/30">
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-emerald-400 font-bold tracking-[0.2em] text-[10px] uppercase"
                        >
                            <CalendarIcon className="w-3.5 h-3.5" />
                            Attendance Logs
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60"
                        >
                            Daily Attendance
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground max-w-lg leading-relaxed text-sm"
                        >
                            Monitor student attendance and track daily arrivals.
                        </motion.p>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3"
                    >
                        <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={fetchData}
                            disabled={loading}
                            className="rounded-2xl border-border bg-muted/50 hover:bg-muted text-muted-foreground h-12 w-12"
                        >
                            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                        </Button>
                        <Button 
                            onClick={() => setIsCreating(true)}
                            className="rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white dark:text-black hover:bg-emerald-500 dark:hover:bg-emerald-400 font-bold px-8 h-12 shadow-lg shadow-emerald-500/20"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Manual Entry
                        </Button>
                    </motion.div>
                </div>

                {/* Statistics Grid */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    {[
                        { label: 'Total Records', value: stats.total, icon: ArrowUpDown, color: 'zinc' },
                        { label: 'On Time', value: stats.present - stats.late, icon: UserCheck, color: 'emerald' },
                        { label: 'Late', value: stats.late, icon: Clock, color: 'amber' },
                        { label: 'Absent', value: stats.absent, icon: UserMinus, color: 'rose' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-muted/40 border border-border/50 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                                <stat.icon className="w-16 h-16" />
                            </div>
                            <div className="text-muted-foreground text-[10px] uppercase font-black tracking-widest mb-2">{stat.label}</div>
                            <div className="text-3xl font-black text-foreground leading-none">{stat.value}</div>
                            <div className={cn("mt-4 h-1 w-8 rounded-full", {
                                'bg-emerald-500': stat.color === 'emerald',
                                'bg-amber-500': stat.color === 'amber',
                                'bg-rose-500': stat.color === 'rose',
                                'bg-muted-foreground/30': stat.color === 'zinc',
                            })} />
                        </div>
                    ))}
                </motion.div>

                {/* Filters & Actions */}
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 group w-full">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-emerald-500 transition-colors">
                            <Search className="w-4 h-4" />
                        </div>
                        <Input 
                            placeholder="Search by name or LRN..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 h-14 bg-muted/20 border-border/80 focus:border-emerald-500/50 rounded-2xl transition-all"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <Select value={sectionFilter} onValueChange={setSectionFilter}>
                            <SelectTrigger className="w-full md:w-48 h-14 bg-muted/20 border-border/80 rounded-2xl text-foreground">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                                    <SelectValue placeholder="All Sections" />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                <SelectItem value="all">All Sections</SelectItem>
                                {sections.map(s => (
                                    <SelectItem key={s.section_id} value={s.section_id.toString()}>
                                        {s.section_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Manifest Table */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-[2.5rem] border border-border bg-card/50 backdrop-blur-2xl overflow-hidden shadow-2xl relative"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="border-border/50 hover:bg-transparent bg-muted/60 h-16">
                                <TableHead className="pl-8 text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Time & Date</TableHead>
                                <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Student</TableHead>
                                <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
                                <TableHead className="text-right pr-8 text-muted-foreground font-bold text-[10px] uppercase tracking-widest">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [0, 1, 2, 3, 4].map((i) => (
                                    <TableRow key={`skeleton-${i}`} className="border-border animate-pulse h-20">
                                        <TableCell className="pl-8"><div className="h-4 w-32 bg-muted rounded-full" /></TableCell>
                                        <TableCell><div className="h-4 w-48 bg-muted rounded-full" /></TableCell>
                                        <TableCell><div className="h-6 w-24 bg-muted rounded-full" /></TableCell>
                                        <TableCell />
                                    </TableRow>
                                ))
                            ) : filteredRecords.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
                                                <Search className="w-6 h-6 text-muted-foreground" />
                                            </div>
                                            <p className="text-muted-foreground font-medium">No records found for current criteria.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                <AnimatePresence mode="popLayout">
                                    {filteredRecords.map((record) => (
                                        <motion.tr 
                                            key={record.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            className="group border-border/50 hover:bg-muted/30 transition-colors h-20"
                                        >
                                            <TableCell className="pl-8">
                                                <div className="flex flex-col">
                                                    <span className="text-foreground font-mono text-xs font-bold">
                                                        {record.created_at ? new Date(record.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : '--:--:--'}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                                                        {record.created_at ? new Date(record.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-black text-muted-foreground border border-border/50">
                                                        {record.last_name[0]}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-foreground font-bold tracking-tight">
                                                            {record.last_name}, {record.first_name}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-mono">
                                                            LRN: {record.lrn}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-2">
                                                    {record.is_late && (
                                                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] font-black tracking-widest rounded-md uppercase">
                                                            Late
                                                        </Badge>
                                                    )}
                                                    {record.is_absent && (
                                                        <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[9px] font-black tracking-widest rounded-md uppercase">
                                                            Absent
                                                        </Badge>
                                                    )}
                                                    {!record.is_late && !record.is_absent && (
                                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black tracking-widest rounded-md uppercase">
                                                            On Time
                                                        </Badge>
                                                    )}
                                                    <div className="px-2 py-0.5 rounded-md border border-border text-[9px] text-muted-foreground font-black tracking-widest uppercase">
                                                        {sections.find(s => s.section_id === record.section_id)?.section_name || '??'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all rounded-xl">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground rounded-2xl min-w-[160px] p-2">
                                                        <DropdownMenuItem 
                                                            onClick={() => setEditingRecord(record)}
                                                            className="cursor-pointer rounded-xl h-10 gap-2"
                                                        >
                                                            <Edit2 className="w-3.5 h-3.5" />
                                                            Edit Record
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDeleteRecord(record.id)}
                                                            className="text-destructive cursor-pointer rounded-xl h-10 gap-2 focus:text-destructive"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                            Delete Record
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </TableBody>
                    </Table>
                </motion.div>
            </div>

            {/* Manual Entry Dialog */}
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent className="bg-card border-border text-foreground max-w-md rounded-[2rem] overflow-hidden shadow-2xl border-t-2 border-t-emerald-500">
                    <DialogHeader className="pt-4 px-6 text-center">
                        <DialogTitle className="text-2xl font-black tracking-tighter">Add Attendance</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm">
                            Manually add an attendance record for a student.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateRecord} className="space-y-6 p-6">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground">Student LRN</Label>
                                <Input 
                                    required
                                    placeholder="Enter 12-digit LRN"
                                    value={newRecord.lrn}
                                    onChange={(e) => setNewRecord({...newRecord, lrn: e.target.value})}
                                    className="h-14 bg-muted/30 border-border rounded-2xl focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1 bg-muted/20 border border-border p-4 rounded-2xl flex items-center justify-between group hover:border-amber-500/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <Clock className={cn("w-4 h-4 text-muted-foreground", newRecord.is_late && "text-amber-600 dark:text-amber-500 animate-pulse")} />
                                        <span className="text-xs font-bold text-muted-foreground">Late Mode</span>
                                    </div>
                                    <Switch 
                                        checked={newRecord.is_late}
                                        onCheckedChange={(val) => setNewRecord({...newRecord, is_late: val})}
                                    />
                                </div>
                                <div className="flex-1 bg-muted/20 border border-border p-4 rounded-2xl flex items-center justify-between group hover:border-rose-500/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <UserMinus className={cn("w-4 h-4 text-muted-foreground", newRecord.is_absent && "text-destructive")} />
                                        <span className="text-xs font-bold text-muted-foreground">Absent</span>
                                    </div>
                                    <Switch 
                                        checked={newRecord.is_absent}
                                        onCheckedChange={(val) => setNewRecord({...newRecord, is_absent: val})}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button 
                                type="submit" 
                                disabled={isSaving}
                                className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 font-black rounded-2xl shadow-xl transition-all"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add Record"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Amend Record Dialog */}
            <Dialog open={!!editingRecord} onOpenChange={(open) => !open && setEditingRecord(null)}>
                <DialogContent className="bg-card border-border text-foreground max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border-t-2 border-t-blue-500">
                    <DialogHeader className="pt-4 px-6 text-center">
                        <DialogTitle className="text-2xl font-black tracking-tighter">Edit Attendance</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm">
                            Update attendance details for {editingRecord?.first_name} {editingRecord?.last_name}.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleUpdateRecord} className="space-y-8 p-6">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="bg-muted/20 border border-border p-6 rounded-3xl flex items-center justify-between group hover:border-amber-500/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-colors", editingRecord?.is_late ? "bg-amber-500/10" : "bg-muted")}>
                                        <Clock className={cn("w-5 h-5", editingRecord?.is_late ? "text-amber-600 dark:text-amber-500 animate-pulse" : "text-muted-foreground")} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-foreground">Late</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Mark student as late</span>
                                    </div>
                                </div>
                                <Switch 
                                    checked={editingRecord?.is_late || false}
                                    onCheckedChange={(val) => editingRecord && setEditingRecord({...editingRecord, is_late: val})}
                                />
                            </div>

                            <div className="bg-muted/20 border border-border p-6 rounded-3xl flex items-center justify-between group hover:border-rose-500/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-colors", editingRecord?.is_absent ? "bg-rose-500/10" : "bg-muted")}>
                                        <UserMinus className={cn("w-5 h-5", editingRecord?.is_absent ? "text-destructive" : "text-muted-foreground")} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-foreground">Absent</span>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Mark student as absent</span>
                                    </div>
                                </div>
                                <Switch 
                                    checked={editingRecord?.is_absent || false}
                                    onCheckedChange={(val) => editingRecord && setEditingRecord({...editingRecord, is_absent: val})}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-2">
                            <Button 
                                type="submit" 
                                disabled={isSaving}
                                className="w-full h-16 bg-primary text-primary-foreground hover:bg-primary/90 font-black rounded-3xl shadow-xl transition-all gap-3"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
