'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    Search, 
    MoreVertical, 
    Edit2, 
    Trash2, 
    CheckCircle2, 
    XCircle,
    Loader2,
    Save,
    Settings2,
    UserPlus,
    RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface Section {
    section_id: number;
    section_name: string;
}

interface Teacher {
    id: number;
    user_id: string;
    full_name: string;
    section_id: number | null;
    section_name: string | null;
    is_active: boolean;
    is_admin: boolean;
    is_nonFaculty: boolean;
    user: {
        email: string;
        avatar: string | null;
    };
    created_at: string;
}

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const [sections, setSections] = useState<Section[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [teachersRes, sectionsRes] = await Promise.all([
                api.get('/api/teachers'),
                api.get('/api/sections')
            ]);
            setTeachers(teachersRes.data.data);
            setSections(sectionsRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateTeacher = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingTeacher) return;

        setIsUpdating(true);
        try {
            const response = await api.put(`/api/teachers/${editingTeacher.id}`, {
                full_name: editingTeacher.full_name,
                section_id: editingTeacher.section_id,
                is_active: editingTeacher.is_active,
                is_admin: editingTeacher.is_admin,
                is_nonFaculty: editingTeacher.is_nonFaculty,
            });
            
            setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? response.data.data : t));
            setEditingTeacher(null);
            toast.success('Educator core updated successfully');
        } catch (error: any) {
            console.error('Failed to update teacher:', error);
            const message = error.response?.data?.message || 'Failed to update educator core';
            toast.error(message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteTeacher = async (id: number) => {
        if (!confirm('Are you sure you want to delete this teacher? This will also delete the associated user account.')) return;

        try {
            await api.delete(`/api/teachers/${id}`);
            setTeachers(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error('Failed to delete teacher:', error);
        }
    };

    const filteredTeachers = teachers.filter(t => 
        t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.section_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <ProtectedRoute adminOnly={true}>
            <div className="min-h-screen bg-background text-foreground p-6 md:p-12 font-sans">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-blue-400 font-medium tracking-widest text-xs uppercase"
                            >
                                <Settings2 className="w-4 h-4" />
                                Personnel Management
                            </motion.div>
                            <motion.h1 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60"
                            >
                                Teacher Management
                            </motion.h1>
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-muted-foreground max-w-lg"
                            >
                                Manage the teaching staff. Activate accounts, assign advisory sections, and maintain faculty records.
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
                                className="rounded-full border-border bg-muted/50 hover:bg-muted text-muted-foreground"
                            >
                                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                            </Button>
                            {/* <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Invite Teacher
                            </Button> */}
                        </motion.div>
                    </div>

                    {/* Search & Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-3 relative group">
                            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                                <Search className="w-4 h-4" />
                            </div>
                            <Input 
                                placeholder="Search by name, email, or section..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-12 bg-muted/30 border-border focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all"
                            />
                        </div>
                        <div className="bg-muted/30 border border-border rounded-xl px-4 flex items-center justify-between backdrop-blur-sm">
                            <div className="text-sm text-muted-foreground">Total Teachers</div>
                            <div className="text-xl font-bold text-foreground">{teachers.length}</div>
                        </div>
                    </div>

                    {/* Table Container */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-2xl border border-border bg-card/50 backdrop-blur-md overflow-hidden"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent bg-muted/30">
                                    <TableHead className="w-[300px]">Teacher Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Advisory Section</TableHead>
                                    <TableHead>Service Start</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && (
                                    [0, 1, 2, 3, 4].map((i) => (
                                        <TableRow key={`skeleton-${i}`} className="border-border animate-pulse">
                                            <TableCell><div className="h-10 w-48 bg-muted rounded-lg" /></TableCell>
                                            <TableCell><div className="h-6 w-20 bg-muted rounded-full" /></TableCell>
                                            <TableCell><div className="h-6 w-32 bg-muted rounded-lg" /></TableCell>
                                            <TableCell><div className="h-6 w-24 bg-muted rounded-lg" /></TableCell>
                                            <TableCell className="text-right"><div className="h-8 w-8 bg-muted rounded-full ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                )}

                                {!loading && filteredTeachers.length > 0 && (
                                    <AnimatePresence mode="popLayout">
                                        {filteredTeachers.map((teacher) => (
                                            <motion.tr 
                                                key={teacher.id}
                                                layout
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="group border-border hover:bg-muted/50 transition-colors"
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden text-muted-foreground">
                                                                {teacher.user.avatar ? (
                                                                    <img src={teacher.user.avatar} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <Users className="w-5 h-5 transition-colors" />
                                                                )}
                                                            </div>
                                                            <div className={cn(
                                                                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                                                                teacher.is_active ? "bg-emerald-500" : "bg-muted-foreground/30"
                                                            )} />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-foreground">{teacher.full_name}</div>
                                                            <div className="text-xs text-muted-foreground truncate max-w-[180px]">{teacher.user.email}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={teacher.is_active ? "success" : "secondary"} className="rounded-full">
                                                        {teacher.is_active ? (
                                                            <span className="flex items-center gap-1">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                Active
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1">
                                                                <XCircle className="w-3 h-3" />
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-foreground font-mono text-xs text-center">
                                                    {teacher.section_name ? (
                                                        <Badge variant="outline" className="border-border text-muted-foreground font-mono">
                                                            {teacher.section_name}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground/40">None</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs">
                                                    {new Date(teacher.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground rounded-xl min-w-[160px] p-2">
                                                            <DropdownMenuItem 
                                                                onClick={() => setEditingTeacher(teacher)}
                                                                className="cursor-pointer rounded-lg px-3 py-2.5 h-auto"
                                                            >
                                                                <Edit2 className="w-4 h-4 mr-2 text-blue-500" />
                                                                Edit Teacher
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleDeleteTeacher(teacher.id)}
                                                                className="text-destructive cursor-pointer rounded-lg px-3 py-2.5 h-auto focus:text-destructive"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete Teacher
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                )}

                                {!loading && filteredTeachers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center text-muted-foreground">
                                                <Users className="w-12 h-12 mb-4 opacity-20" />
                                                <p>No teachers found matching your criteria.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </motion.div>
                </div>

                {/* Edit Dialog */}
                <Dialog open={!!editingTeacher} onOpenChange={(open) => !open && setEditingTeacher(null)}>
                    <DialogContent className="bg-card border-border text-foreground max-w-md rounded-2xl p-0 overflow-hidden shadow-2xl">
                        <DialogHeader className="p-6 pb-0">
                            <DialogTitle className="text-2xl font-bold tracking-tight">Edit Teacher</DialogTitle>
                            <DialogDescription className="text-muted-foreground">
                                Update teacher account details and system permissions.
                            </DialogDescription>
                        </DialogHeader>

                        {editingTeacher && (
                            <form onSubmit={handleUpdateTeacher} className="space-y-6 p-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Full Name</Label>
                                        <Input 
                                            id="name"
                                            value={editingTeacher.full_name}
                                            onChange={(e) => setEditingTeacher({ ...editingTeacher, full_name: e.target.value })}
                                            className="bg-muted/30 border-border focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Advisory Assignment</Label>
                                        <Select 
                                            value={editingTeacher.section_id?.toString() || "none"} 
                                            onValueChange={(val) => setEditingTeacher({ ...editingTeacher, section_id: val === "none" ? null : Number.parseInt(val) })}
                                        >
                                            <SelectTrigger className="bg-muted/30 border-border focus:ring-2 focus:ring-blue-500/20">
                                                <SelectValue placeholder="Assign Advisory" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                                <SelectItem value="none">No Advisory</SelectItem>
                                                {sections.map(s => (
                                                    <SelectItem key={s.section_id} value={s.section_id.toString()}>
                                                        {s.section_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-xl">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-bold">Administrator</Label>
                                                <p className="text-[10px] text-muted-foreground">Full system access</p>
                                            </div>
                                            <Switch 
                                                checked={editingTeacher.is_admin}
                                                onCheckedChange={(checked) => setEditingTeacher({ ...editingTeacher, is_admin: checked })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-xl">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-bold">Non-Faculty</Label>
                                                <p className="text-[10px] text-muted-foreground">Staff or partner account</p>
                                            </div>
                                            <Switch 
                                                checked={editingTeacher.is_nonFaculty}
                                                onCheckedChange={(checked) => setEditingTeacher({ ...editingTeacher, is_nonFaculty: checked })}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-muted/20 border border-border rounded-xl">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-bold">Account Status</Label>
                                            <p className="text-[10px] text-muted-foreground">Enable or disable system access</p>
                                        </div>
                                        <Switch 
                                            checked={editingTeacher.is_active}
                                            onCheckedChange={(checked) => setEditingTeacher({ ...editingTeacher, is_active: checked })}
                                        />
                                    </div>
                                </div>

                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        onClick={() => setEditingTeacher(null)}
                                        className="rounded-full hover:bg-muted"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit" 
                                        disabled={isUpdating}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 rounded-full shadow-lg shadow-primary/20"
                                    >
                                        {isUpdating ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-2" />
                                        )}
                                        Save Changes
                                    </Button>
                                </DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </ProtectedRoute>
    );
}
