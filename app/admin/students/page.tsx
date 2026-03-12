'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    Search, 
    MoreVertical, 
    Edit2, 
    Trash2, 
    UserPlus,
    Loader2,
    Save,
    RefreshCw,
    Upload,
    FileSpreadsheet,
    Download,
    X,
    CheckCircle2,
    AlertCircle
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

interface Section {
    section_id: number;
    section_name: string;
    grade_level: string;
}

interface Teacher {
    id: number;
    full_name: string;
}

interface Student {
    lrn: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    section_id: number;
    gender: string;
    grade_level: string;
    adviser_id: number | null;
    section?: Section;
}

import { useAuth } from '@/context/AuthContext';

export default function StudentsPage() {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importFile, setImportFile] = useState<File | null>(null);
    const [importLoading, setImportLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Form state for new student
    const [newStudent, setNewStudent] = useState<Partial<Student>>({
        lrn: '',
        first_name: '',
        last_name: '',
        middle_name: '',
        section_id: undefined,
        gender: '',
        grade_level: '',
        adviser_id: null
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentsRes, sectionsRes, teachersRes] = await Promise.all([
                api.get('/api/students'),
                api.get('/api/sections'),
                api.get('/api/teachers')
            ]);
            setStudents(studentsRes.data);
            setSections(sectionsRes.data);
            setTeachers(teachersRes.data.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error("Failed to load student data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateStudent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await api.post('/api/students', newStudent);
            setStudents(prev => [...prev, response.data]);
            setIsCreating(false);
            setNewStudent({
                lrn: '',
                first_name: '',
                last_name: '',
                middle_name: '',
                section_id: undefined,
                gender: '',
                grade_level: '',
                adviser_id: null
            });
            toast.success("Student added successfully");
        } catch (error) {
            console.error('Failed to create student:', error);
            toast.error("Failed to add student");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateStudent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingStudent) return;

        setIsSaving(true);
        try {
            const response = await api.put(`/api/students/${editingStudent.lrn}`, {
                lrn: editingStudent.lrn,
                first_name: editingStudent.first_name,
                last_name: editingStudent.last_name,
                middle_name: editingStudent.middle_name,
                section_id: editingStudent.section_id,
                gender: editingStudent.gender,
                grade_level: editingStudent.grade_level,
                adviser_id: editingStudent.adviser_id,
            });
            
            setStudents(prev => prev.map(s => s.lrn === editingStudent.lrn ? response.data : s));
            setEditingStudent(null);
            toast.success("Student updated successfully");
        } catch (error) {
            console.error('Failed to update student:', error);
            toast.error("Failed to update student");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteStudent = async (lrn: string) => {
        if (!confirm('Are you sure you want to delete this student record?')) return;

        try {
            await api.delete(`/api/students/${lrn}`);
            setStudents(prev => prev.filter(s => s.lrn !== lrn));
            toast.success("Student removed from system");
        } catch (error) {
            console.error('Failed to delete student:', error);
            toast.error("Failed to delete student");
        }
    };

    const handleImportCSV = async () => {
        if (!importFile) return;
        setImportLoading(true);
        
        try {
            const text = await importFile.text();
            const rows = text.split('\n').filter(row => row.trim() !== '');
            const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
            
            const studentsToImport = rows.slice(1).map(row => {
                const values = row.split(',').map(v => v.trim());
                const student: Record<string, string> = {};
                headers.forEach((header, index) => {
                    student[header] = values[index];
                });
                return student;
            });

            const response = await api.post('/api/students/bulk', { students: studentsToImport });
            toast.success(response.data.message);
            setIsImporting(false);
            setImportFile(null);
            fetchData();
        } catch (error: any) {
            console.error('Bulk import failed:', error);
            const message = error.response?.data?.message || "Import failed";
            toast.error(message);
        } finally {
            setImportLoading(false);
        }
    };

    const downloadTemplate = () => {
        const headers = "lrn,first_name,last_name,middle_name,section_id,gender,grade_level,adviser_id";
        const example = "123456789012,John,Doe,M,1,Male,10,1";
        const blob = new Blob([headers + "\n" + example], { type: 'text/csv' });
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_import_template.csv';
        a.click();
    };

    const filteredStudents = students.filter(s => 
        s.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.lrn.includes(searchQuery) ||
        sections.find(sec => sec.section_id === s.section_id)?.section_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background text-foreground p-6 md:p-12 font-sans overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-emerald-400 font-medium tracking-widest text-xs uppercase"
                        >
                            <Users className="w-4 h-4" />
                            Students
                        </motion.div>
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60"
                        >
                            Manage Students
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-muted-foreground max-w-lg"
                        >
                            Manage student records, assign sections, and import data.
                        </motion.p>
                    </div>

                    {user?.is_admin && (
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
                                variant="outline"
                                onClick={() => setIsImporting(true)}
                                className="rounded-full border-border bg-muted/50 hover:bg-muted text-foreground px-6"
                            >
                                <Upload className="w-4 h-4 mr-2" />
                                Bulk Import
                            </Button>
                            <Button 
                                onClick={() => setIsCreating(true)}
                                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6 shadow-lg shadow-primary/20"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Student
                            </Button>
                        </motion.div>
                    )}
                    {!user?.is_admin && (
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
                     </motion.div>
                    )}
                </div>

                {/* Search & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-3 relative group">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-emerald-500 transition-colors">
                            <Search className="w-4 h-4" />
                        </div>
                        <Input 
                            placeholder="Search by LRN, name, or section..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 h-12 bg-muted/30 border-border focus:ring-2 focus:ring-emerald-500/20 rounded-xl transition-all"
                        />
                    </div>
                    <div className="bg-muted/30 border border-border rounded-xl px-4 flex items-center justify-between backdrop-blur-sm">
                        <div className="text-sm text-muted-foreground">Student Count</div>
                        <div className="text-xl font-bold text-foreground">{students.length}</div>
                    </div>
                </div>

                {/* Table Container */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-border bg-card/50 backdrop-blur-md overflow-hidden shadow-2xl"
                >
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent bg-muted/50">
                                    <TableHead className="py-4 text-muted-foreground">Student Name</TableHead>
                                    <TableHead className="text-muted-foreground">LRN</TableHead>
                                    <TableHead className="text-muted-foreground">Section</TableHead>
                                    <TableHead className="text-muted-foreground">Level</TableHead>
                                    <TableHead className="text-muted-foreground">Gender</TableHead>
                                    {user?.is_admin && <TableHead className="text-right px-6 text-muted-foreground">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && (
                                    [0, 1, 2, 3, 4].map((i) => (
                                    <TableRow key={`skeleton-${i}`} className="border-border animate-pulse">
                                            <TableCell><div className="h-10 w-48 bg-muted rounded-lg" /></TableCell>
                                            <TableCell><div className="h-6 w-24 bg-muted rounded-lg" /></TableCell>
                                            <TableCell><div className="h-6 w-20 bg-muted rounded-lg" /></TableCell>
                                            <TableCell><div className="h-6 w-12 bg-muted rounded-lg" /></TableCell>
                                            <TableCell><div className="h-6 w-16 bg-muted rounded-lg" /></TableCell>
                                            <TableCell className="text-right"><div className="h-8 w-8 bg-muted rounded-full ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                )}

                                {!loading && filteredStudents.length > 0 && (
                                    <AnimatePresence mode="popLayout">
                                        {filteredStudents.map((student) => (
                                            <motion.tr 
                                                className="group border-border hover:bg-muted/50 transition-colors"
                                            >
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                                                            {student.first_name[0]}{student.last_name[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-foreground">{student.first_name} {student.last_name}</div>
                                                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{student.middle_name || '-'}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-muted-foreground text-sm">
                                                    {student.lrn}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-foreground/80">
                                                        {sections.find(sec => sec.section_id === student.section_id)?.section_name || 'N/A'}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-muted-foreground text-xs">G{student.grade_level}</span>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-xs uppercase">
                                                    {student.gender}
                                                </TableCell>
                                                {user?.is_admin && (
                                                    <TableCell className="text-right px-6">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground rounded-xl min-w-[160px] p-2">
                                                                <DropdownMenuItem 
                                                                    onClick={() => setEditingStudent(student)}
                                                                    className="cursor-pointer rounded-lg px-3 py-2.5 h-auto transition-colors"
                                                                >
                                                                    <Edit2 className="w-4 h-4 mr-2 text-emerald-600 dark:text-emerald-400" />
                                                                    Edit Profile
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    onClick={() => handleDeleteStudent(student.lrn)}
                                                                    className="text-destructive cursor-pointer rounded-lg px-3 py-2.5 h-auto transition-colors focus:text-destructive"
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Decommission
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                )}
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </motion.div>
            </div>

            {/* Create/Edit Modal */}
            <Dialog 
                open={isCreating || !!editingStudent} 
                onOpenChange={(open) => {
                    if (!open) {
                        setIsCreating(false);
                        setEditingStudent(null);
                    }
                }}
            >
                <DialogContent className="bg-card border-border text-foreground max-w-2xl rounded-3xl p-0 overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
                    
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle className="text-2xl font-bold tracking-tight">
                            {isCreating ? "Add Student" : "Edit Student"}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Update student details and section assignment.
                        </DialogDescription>
                    </DialogHeader>

                    <form 
                        onSubmit={isCreating ? handleCreateStudent : handleUpdateStudent} 
                        className="space-y-6 p-6"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="lrn" className="text-muted-foreground text-xs uppercase tracking-widest font-bold">LRN (Unique ID)</Label>
                                    <Input 
                                        id="lrn"
                                        required
                                        disabled={!!editingStudent}
                                        value={isCreating ? newStudent.lrn : editingStudent?.lrn || ''}
                                        onChange={(e) => {
                                            if (isCreating) setNewStudent({...newStudent, lrn: e.target.value});
                                        }}
                                        placeholder="12-digit number"
                                        className="bg-muted/30 border-border focus:ring-2 focus:ring-emerald-500/20 h-12 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="first_name" className="text-muted-foreground text-xs uppercase tracking-widest font-bold">First Name</Label>
                                    <Input 
                                        id="first_name"
                                        required
                                        value={isCreating ? newStudent.first_name : editingStudent?.first_name || ''}
                                        onChange={(e) => {
                                            if (isCreating) setNewStudent({...newStudent, first_name: e.target.value});
                                            else if (editingStudent) setEditingStudent({...editingStudent, first_name: e.target.value});
                                        }}
                                        className="bg-muted/30 border-border focus:ring-2 focus:ring-emerald-500/20 h-12 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name" className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Last Name</Label>
                                    <Input 
                                        id="last_name"
                                        required
                                        value={isCreating ? newStudent.last_name : editingStudent?.last_name || ''}
                                        onChange={(e) => {
                                            if (isCreating) setNewStudent({...newStudent, last_name: e.target.value});
                                            else if (editingStudent) setEditingStudent({...editingStudent, last_name: e.target.value});
                                        }}
                                        className="bg-muted/30 border-border focus:ring-2 focus:ring-emerald-500/20 h-12 rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="middle_name" className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Middle Name</Label>
                                    <Input 
                                        id="middle_name"
                                        value={isCreating ? (newStudent.middle_name ?? '') : (editingStudent?.middle_name ?? '')}
                                        onChange={(e) => {
                                            if (isCreating) setNewStudent({...newStudent, middle_name: e.target.value});
                                            else if (editingStudent) setEditingStudent({...editingStudent, middle_name: e.target.value});
                                        }}
                                        className="bg-muted/30 border-border focus:ring-2 focus:ring-emerald-500/20 h-12 rounded-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Gender</Label>
                                    <Select 
                                        value={isCreating ? newStudent.gender : editingStudent?.gender || ''}
                                        onValueChange={(val: string) => {
                                            if (isCreating) setNewStudent({...newStudent, gender: val});
                                            else if (editingStudent) setEditingStudent({...editingStudent, gender: val});
                                        }}
                                    >
                                        <SelectTrigger className="bg-muted/30 border-border h-12 rounded-xl">
                                            <SelectValue placeholder="Select Gender" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border text-popover-foreground">
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Grade Level</Label>
                                    <Select 
                                        value={isCreating ? newStudent.grade_level : editingStudent?.grade_level || ''}
                                        onValueChange={(val: string) => {
                                            if (isCreating) setNewStudent({...newStudent, grade_level: val});
                                            else if (editingStudent) setEditingStudent({...editingStudent, grade_level: val});
                                        }}
                                    >
                                        <SelectTrigger className="bg-muted/30 border-border h-12 rounded-xl">
                                            <SelectValue placeholder="Select Grade" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border text-popover-foreground">
                                            {['11', '12'].map(g => (
                                                <SelectItem key={g} value={g}>Grade {g}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Section Assignment</Label>
                                    <Select 
                                        value={isCreating ? newStudent.section_id?.toString() : editingStudent?.section_id?.toString() || ''}
                                        onValueChange={(val: string) => {
                                            if (isCreating) setNewStudent({...newStudent, section_id: Number.parseInt(val, 10)});
                                            else if (editingStudent) setEditingStudent({...editingStudent, section_id: Number.parseInt(val, 10)});
                                        }}
                                    >
                                        <SelectTrigger className="bg-muted/30 border-border h-12 rounded-xl">
                                            <SelectValue placeholder="Select Section" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border text-popover-foreground">
                                            {sections.filter(sec => 
                                                sec.grade_level === (isCreating ? newStudent.grade_level : editingStudent?.grade_level)
                                            ).map(sec => (
                                                <SelectItem key={sec.section_id} value={sec.section_id.toString()}>
                                                    {sec.section_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Adviser Assignment</Label>
                                    <Select 
                                        value={isCreating ? newStudent.adviser_id?.toString() : editingStudent?.adviser_id?.toString() || ''}
                                        onValueChange={(val: string) => {
                                            if (isCreating) setNewStudent({...newStudent, adviser_id: Number.parseInt(val, 10)});
                                            else if (editingStudent) setEditingStudent({...editingStudent, adviser_id: Number.parseInt(val, 10)});
                                        }}
                                    >
                                        <SelectTrigger className="bg-muted/30 border-border h-12 rounded-xl">
                                            <SelectValue placeholder="Select Adviser" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border text-popover-foreground">
                                            {teachers.map(t => (
                                                <SelectItem key={t.id} value={t.id.toString()}>
                                                    {t.full_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button 
                                type="button" 
                                variant="ghost" 
                                onClick={() => {
                                    setIsCreating(false);
                                    setEditingStudent(null);
                                }}
                                className="rounded-xl hover:bg-muted"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={isSaving}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-12 rounded-xl shadow-lg shadow-primary/20 transition-all"
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

            {/* Bulk Import Modal */}
            <Dialog open={isImporting} onOpenChange={setIsImporting}>
                <DialogContent className="bg-card border-border text-card-foreground max-w-md rounded-3xl overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
                    
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <FileSpreadsheet className="w-6 h-6 text-blue-400" />
                            Bulk Student Import
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Upload a CSV file to mass-import students into the system.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    fileInputRef.current?.click();
                                }
                            }}
                            role="button"
                            aria-label="Upload CSV file"
                            tabIndex={0}
                            className={cn(
                                "border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500",
                                importFile ? "border-emerald-500/50 bg-emerald-500/5" : "border-border hover:border-muted-foreground/40 hover:bg-muted/50"
                            )}
                        >
                            <input 
                                type="file" 
                                accept=".csv" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                            />
                            
                            {importFile ? (
                                <>
                                    <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-in zoom-in duration-300" />
                                    <div className="text-center">
                                        <div className="font-semibold text-foreground">{importFile.name}</div>
                                        <div className="text-xs text-muted-foreground">{(importFile.size / 1024).toFixed(2)} KB</div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setImportFile(null);
                                        }}
                                        className="h-8 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-900/20"
                                    >
                                        <X className="w-4 h-4 mr-1" /> Remove
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                        <Download className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <div className="text-center">
                                        <div className="font-medium text-foreground">Drop your CSV here</div>
                                        <div className="text-xs text-muted-foreground mt-1">Maximum file size: 5MB</div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="bg-muted/50 border border-border rounded-2xl p-4 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-foreground uppercase tracking-wider">CSV Headers Required</div>
                                <div className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                                    lrn, first_name, last_name, middle_name, section_id, gender, grade_level, adviser_id
                                </div>
                                <button 
                                    onClick={downloadTemplate}
                                    className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-bold underline decoration-blue-500/30"
                                >
                                    Download Starter Template
                                </button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button 
                            variant="ghost" 
                            onClick={() => setIsImporting(false)}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleImportCSV}
                            disabled={!importFile || importLoading}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 rounded-xl shadow-lg shadow-blue-500/20"
                        >
                            {importLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Upload className="w-4 h-4 mr-2" />
                            )}
                            Import Data
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
