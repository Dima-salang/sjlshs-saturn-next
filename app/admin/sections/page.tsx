'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Layout, 
    Search, 
    MoreVertical, 
    Edit2, 
    Trash2, 
    Plus,
    Loader2,
    Save,
    Settings2,
    RefreshCw
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

interface Teacher {
    id: number;
    full_name: string;
}

interface Section {
    section_id: number;
    section_name: string;
    grade_level: string;
    adviser_id: number;
    adviser?: Teacher;
}

export default function SectionsPage() {
    const [sections, setSections] = useState<Section[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Form state for new section
    const [newSection, setNewSection] = useState({
        section_name: '',
        grade_level: '',
        adviser_id: ''
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sectionsRes, teachersRes] = await Promise.all([
                api.get('/api/sections'),
                api.get('/api/teachers')
            ]);
            setSections(sectionsRes.data);
            setTeachers(teachersRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error("Failed to load section data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateSection = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await api.post('/api/sections', newSection);
            setSections(prev => [...prev, response.data]);
            setIsCreating(false);
            setNewSection({ section_name: '', grade_level: '', adviser_id: '' });
            toast.success("Section created successfully");
        } catch (error) {
            console.error('Failed to create section:', error);
            toast.error("Failed to create section");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateSection = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingSection) return;

        setIsSaving(true);
        try {
            const response = await api.put(`/api/sections/${editingSection.section_id}`, {
                section_name: editingSection.section_name,
                grade_level: editingSection.grade_level,
                adviser_id: editingSection.adviser_id,
            });
            
            setSections(prev => prev.map(s => s.section_id === editingSection.section_id ? response.data : s));
            setEditingSection(null);
            toast.success("Section updated successfully");
        } catch (error) {
            console.error('Failed to update section:', error);
            toast.error("Failed to update section");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteSection = async (id: number) => {
        if (!confirm('Are you sure you want to delete this section?')) return;

        try {
            await api.delete(`/api/sections/${id}`);
            setSections(prev => prev.filter(s => s.section_id !== id));
            toast.success("Section deleted successfully");
        } catch (error) {
            console.error('Failed to delete section:', error);
            toast.error("Failed to delete section");
        }
    };

    const filteredSections = sections.filter(s => 
        s.section_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.grade_level.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teachers.find(t => t.id === s.adviser_id)?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-12 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-indigo-400 font-medium tracking-widest text-xs uppercase"
                        >
                            <Settings2 className="w-4 h-4" />
                            Sections
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60"
                        >
                            Manage Sections
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground max-w-lg"
                        >
                            Create and manage class sections and assign faculty advisers.
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
                        <Button 
                            onClick={() => setIsCreating(true)}
                            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6 shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Section
                        </Button>
                    </motion.div>
                </div>

                {/* Search & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3 relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-indigo-400 transition-colors">
                            <Search className="w-4 h-4" />
                        </div>
                        <Input 
                            placeholder="Search sections, grades, or advisers..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 h-12 bg-muted/30 border-border focus:ring-2 focus:ring-indigo-500/20 rounded-xl transition-all"
                        />
                    </div>
                    <div className="bg-muted/30 border border-border rounded-xl px-4 flex items-center justify-between backdrop-blur-sm">
                        <div className="text-sm text-muted-foreground">Total Sections</div>
                        <div className="text-xl font-bold text-foreground">{sections.length}</div>
                    </div>
                </div>

                {/* Table Container */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-md overflow-hidden shadow-2xl"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent bg-zinc-900/50">
                                <TableHead className="py-4">Section Name</TableHead>
                                <TableHead>Grade Level</TableHead>
                                <TableHead>Adviser</TableHead>
                                <TableHead className="text-right px-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && (
                                [0, 1, 2, 3].map((i) => (
                                    <TableRow key={`skeleton-${i}`} className="border-zinc-800 animate-pulse">
                                        <TableCell><div className="h-6 w-32 bg-zinc-800/50 rounded-lg" /></TableCell>
                                        <TableCell><div className="h-6 w-16 bg-zinc-800/50 rounded-lg" /></TableCell>
                                        <TableCell><div className="h-6 w-48 bg-zinc-800/50 rounded-lg" /></TableCell>
                                        <TableCell className="text-right"><div className="h-8 w-8 bg-zinc-800/50 rounded-full ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            )}

                            {!loading && filteredSections.length > 0 && (
                                <AnimatePresence mode="popLayout">
                                    {filteredSections.map((section) => (
                                        <motion.tr 
                                            key={section.section_id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="group border-zinc-800 hover:bg-zinc-800/30 transition-colors"
                                        >
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                                        <Layout className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <span className="font-semibold text-foreground">{section.section_name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-xs font-medium inline-block">
                                                    Grade {section.grade_level}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {teachers.find(t => t.id === section.adviser_id)?.full_name || (
                                                    <span className="text-muted-foreground/30 italic">Not Assigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right px-6">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white hover:bg-zinc-700 rounded-full">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground rounded-xl min-w-[160px] p-2">
                                                        <DropdownMenuItem 
                                                            onClick={() => setEditingSection(section)}
                                                            className="cursor-pointer rounded-lg px-3 py-2.5 h-auto transition-colors"
                                                        >
                                                            <Edit2 className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                                                            Modify Section
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDeleteSection(section.section_id)}
                                                            className="text-destructive cursor-pointer rounded-lg px-3 py-2.5 h-auto transition-colors focus:text-destructive"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete Section
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

            {/* Create/Edit Modal */}
            <Dialog 
                open={isCreating || !!editingSection} 
                onOpenChange={(open) => {
                    if (!open) {
                        setIsCreating(false);
                        setEditingSection(null);
                    }
                }}
            >
                <DialogContent className="bg-card border-border text-foreground max-w-md rounded-3xl p-0 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                    
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-2xl font-bold tracking-tight">
                            {isCreating ? "Create Section" : "Edit Section"}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Update the details for this section.
                        </DialogDescription>
                    </DialogHeader>

                    <form 
                        onSubmit={isCreating ? handleCreateSection : handleUpdateSection} 
                        className="space-y-6 p-6"
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="section_name" className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Section Name</Label>
                                <Input 
                                    id="section_name"
                                    required
                                    value={isCreating ? newSection.section_name : editingSection?.section_name || ''}
                                    onChange={(e) => {
                                        if (isCreating) setNewSection({...newSection, section_name: e.target.value});
                                        else if (editingSection) setEditingSection({...editingSection, section_name: e.target.value});
                                    }}
                                    placeholder="e.g. Einstein"
                                    className="bg-muted/30 border-border focus:ring-2 focus:ring-indigo-500/20 h-12 rounded-xl transition-all"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="grade_level" className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Grade Level</Label>
                                <Select 
                                    value={isCreating ? newSection.grade_level : editingSection?.grade_level || ''}
                                    onValueChange={(val: string) => {
                                        if (isCreating) setNewSection({...newSection, grade_level: val});
                                        else if (editingSection) setEditingSection({...editingSection, grade_level: val});
                                    }}
                                >
                                    <SelectTrigger className="bg-muted/30 border-border h-12 rounded-xl">
                                        <SelectValue placeholder="Select Grade" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border text-popover-foreground">
                                        {['11', '12'].map(grade => (
                                            <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="adviser" className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Adviser</Label>
                                <Select 
                                    value={isCreating ? newSection.adviser_id : editingSection?.adviser_id?.toString() || ''}
                                    onValueChange={(val: string) => {
                                        if (isCreating) setNewSection({...newSection, adviser_id: val});
                                        else if (editingSection) setEditingSection({...editingSection, adviser_id: Number.parseInt(val, 10)});
                                    }}
                                >
                                    <SelectTrigger className="bg-muted/30 border-border h-12 rounded-xl">
                                        <SelectValue placeholder="Select Teacher" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border text-popover-foreground">
                                        {teachers.map(teacher => (
                                            <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                {teacher.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => {
                                    setIsCreating(false);
                                    setEditingSection(null);
                                }}
                                className="rounded-xl hover:bg-muted"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSaving}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8 rounded-xl shadow-lg transition-all"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                {isCreating ? "Create" : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
