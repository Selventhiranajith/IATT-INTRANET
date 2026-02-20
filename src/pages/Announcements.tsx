import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import {
    Megaphone,
    Calendar,
    Trash2,
    Plus,
    AlertCircle,
    CheckCircle2,
    Info,
    Loader2,
    Clock,
    Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Announcement {
    id: number;
    title: string;
    content: string;
    created_by: number;
    created_at: string;
    priority: 'Normal' | 'High' | 'Urgent';
    publish_at: string | null;
    expiry_at: string | null;
    first_name?: string;
    last_name?: string;
}

const defaultForm = {
    title: '',
    content: '',
    priority: 'Normal' as 'Normal' | 'High' | 'Urgent',
    publish_at: '',
    expiry_at: '',
};

const Announcements: React.FC = () => {
    const { user, isAdmin, isSuperAdmin } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState(defaultForm);

    const fetchAnnouncements = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/announcements', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (Array.isArray(data)) {
                setAnnouncements(data);
            } else {
                setAnnouncements([]);
                if (data.message) toast.error(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error fetching announcements:', error);
            toast.error('Failed to load announcements');
            setAnnouncements([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.content.trim()) {
            toast.error('Title and Content are required.');
            return;
        }

        if (form.expiry_at && form.publish_at && form.expiry_at < form.publish_at) {
            toast.error('Expiry date cannot be before Publish date.');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/announcements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: form.title,
                    content: form.content,
                    priority: form.priority,
                    publish_at: form.publish_at || null,
                    expiry_at: form.expiry_at || null,
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                toast.success('Announcement published successfully!');
                setShowForm(false);
                setForm(defaultForm);
                fetchAnnouncements();
            } else {
                toast.error(result.message || 'Failed to create announcement.');
            }
        } catch (error) {
            console.error('Error creating announcement:', error);
            toast.error('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/announcements/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                toast.success('Announcement deleted.');
                setAnnouncements(prev => prev.filter(a => a.id !== id));
            } else {
                toast.error(result.message || 'Failed to delete announcement.');
            }
        } catch (error) {
            toast.error('Network error. Could not delete announcement.');
        }
    };

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case 'Urgent':
                return { color: 'bg-red-100 text-red-800 border-red-200', icon: <AlertCircle className="w-3 h-3" />, accent: 'border-l-red-500' };
            case 'High':
                return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: <Info className="w-3 h-3" />, accent: 'border-l-orange-500' };
            default:
                return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: <CheckCircle2 className="w-3 h-3" />, accent: 'border-l-amber-500' };
        }
    };

    return (
        <div className="space-y-6 animate-fade-in p-6 max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-amber-600" />
                        Announcements
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">Company-wide updates, news and alerts</p>
                </div>

                {(isAdmin || isSuperAdmin) && (
                    <Button
                        onClick={() => setShowForm(true)}
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Announcement
                    </Button>
                )}
            </div>

            {/* Create Announcement Dialog */}
            <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) setForm(defaultForm); }}>
                <DialogContent className="sm:max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                            <Megaphone className="w-5 h-5 text-amber-600" />
                            Create New Announcement
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Title */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g. Office closed on Monday"
                            />
                        </div>

                        {/* Priority */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Priority</label>
                            <Select
                                value={form.priority}
                                onValueChange={(value: 'Normal' | 'High' | 'Urgent') =>
                                    setForm({ ...form, priority: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Normal">🔵 Normal</SelectItem>
                                    <SelectItem value="High">🟠 High</SelectItem>
                                    <SelectItem value="Urgent">🔴 Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Content */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">
                                Content <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                value={form.content}
                                onChange={(e) => setForm({ ...form, content: e.target.value })}
                                placeholder="Write your announcement message here..."
                                className="min-h-[120px]"
                            />
                        </div>

                        {/* Publish Date & Expiry Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    Publish Date & Time
                                </label>
                                <Input
                                    type="datetime-local"
                                    value={form.publish_at}
                                    onChange={(e) => setForm({ ...form, publish_at: e.target.value })}
                                    className="text-sm"
                                />
                                <p className="text-xs text-slate-400">Leave blank to publish immediately</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                                    <Timer className="w-3.5 h-3.5 text-red-500" />
                                    Expiry Date
                                </label>
                                <Input
                                    type="datetime-local"
                                    value={form.expiry_at}
                                    onChange={(e) => setForm({ ...form, expiry_at: e.target.value })}
                                    className="text-sm"
                                />
                                <p className="text-xs text-slate-400">Leave blank for no expiry</p>
                            </div>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</>
                            ) : (
                                <><Megaphone className="w-4 h-4 mr-2" /> Publish Announcement</>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Announcements Feed */}
            {isLoading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
                </div>
            ) : announcements.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Megaphone className="w-7 h-7 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">No Announcements Yet</h3>
                    <p className="text-slate-500 mt-1 text-sm">There are no announcements to display at this time.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map((ann) => {
                        const cfg = getPriorityConfig(ann.priority);
                        return (
                            <Card key={ann.id} className={`border-l-4 ${cfg.accent} hover:shadow-md transition-shadow`}>
                                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4 px-5">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className={`${cfg.color} flex items-center gap-1 text-xs font-semibold`}>
                                                {cfg.icon}
                                                {ann.priority}
                                            </Badge>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {format(new Date(ann.created_at), 'PPp')}
                                            </span>
                                            {ann.publish_at && (
                                                <span className="text-xs text-green-600 flex items-center gap-1 font-medium">
                                                    <Clock className="w-3 h-3" />
                                                    Publishes: {format(new Date(ann.publish_at), 'PPp')}
                                                </span>
                                            )}
                                            {ann.expiry_at && (
                                                <span className="text-xs text-red-500 flex items-center gap-1 font-medium">
                                                    <Timer className="w-3 h-3" />
                                                    Expires: {format(new Date(ann.expiry_at), 'PPp')}
                                                </span>
                                            )}
                                        </div>
                                        <CardTitle className="text-lg font-bold text-slate-900 leading-snug">
                                            {ann.title}
                                        </CardTitle>
                                    </div>
                                    {(isAdmin || isSuperAdmin) && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 ml-2 flex-shrink-0"
                                            onClick={() => handleDelete(ann.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="px-5 pb-4">
                                    <p className="text-slate-600 whitespace-pre-wrap leading-relaxed text-[15px]">
                                        {ann.content}
                                    </p>
                                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400">
                                        Posted by <span className="font-medium text-slate-600">{ann.first_name} {ann.last_name}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Announcements;
