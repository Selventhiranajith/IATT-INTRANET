import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

import { Quote, Edit2, Trash2, Loader2, User as UserIcon, Sparkles, MoreHorizontal, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Thought {
    id: number;
    content: string;
    author: string;
    branch: string;
    created_by: number;
    created_at: string;
    first_name?: string;
    last_name?: string;
}

// Consistent gradient per name
const posterColors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-rose-500 to-pink-500',
    'from-indigo-500 to-blue-600',
    'from-fuchsia-500 to-pink-600',
    'from-sky-500 to-indigo-500',
];
const getPosterColor = (name: string) => {
    const idx = (name?.charCodeAt(0) || 0) % posterColors.length;
    return posterColors[idx];
};

const branchColors: Record<string, { bg: string; text: string; border: string }> = {
    Guindy: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
    Nungambakkam: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};
const getBranchStyle = (branch: string) =>
    branchColors[branch] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };

const ThoughtsPage: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const [thoughts, setThoughts] = useState<Thought[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentThought, setCurrentThought] = useState<Thought | null>(null);
    const [thoughtContent, setThoughtContent] = useState('');
    const [thoughtAuthor, setThoughtAuthor] = useState('');

    // Fetch all thoughts from all branches
    const fetchThoughts = async () => {
        setIsLoading(true);
        try {
            const data = await api.get<{ success: boolean; data: { thoughts: Thought[] } }>(`/thoughts/all`);
            if (data.success) {
                setThoughts(data.data.thoughts);
            }
        } catch (error) {
            console.error('Fetch thoughts error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to load thoughts');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchThoughts();
    }, []);

    // Create new thought
    const handleCreateThought = async () => {
        if (!thoughtContent.trim() || !thoughtAuthor.trim()) {
            toast.error("Please enter both content and author name");
            return;
        }

        try {
            const data = await api.post<any>('/thoughts', {
                content: thoughtContent,
                author: thoughtAuthor,
                branch: user?.branch
            });

            if (data.success) {
                toast.success("Thought created successfully!");
                setThoughtContent('');
                setThoughtAuthor('');
                fetchThoughts();
            } else {
                toast.error(data.message || "Failed to create thought");
            }
        } catch (error) {
            console.error('Create thought error:', error);
            toast.error(error instanceof Error ? error.message : "Error creating thought");
        }
    };

    // Update thought
    const handleUpdateThought = async () => {
        if (!currentThought || !thoughtContent.trim() || !thoughtAuthor.trim()) {
            toast.error("Please enter both content and author name");
            return;
        }

        try {
            const data = await api.put<any>(`/thoughts/${currentThought.id}`, {
                content: thoughtContent,
                author: thoughtAuthor
            });

            if (data.success) {
                toast.success("Thought updated successfully!");
                setIsEditModalOpen(false);
                setCurrentThought(null);
                setThoughtContent('');
                setThoughtAuthor('');
                fetchThoughts();
            } else {
                toast.error(data.message || "Failed to update thought");
            }
        } catch (error) {
            console.error('Update thought error:', error);
            toast.error(error instanceof Error ? error.message : "Error updating thought");
        }
    };

    // Delete thought
    const handleDeleteThought = async (id: number) => {
        if (!confirm('Are you sure you want to delete this thought?')) return;

        try {
            const data = await api.delete<any>(`/thoughts/${id}`);

            if (data.success) {
                toast.success("Thought deleted successfully!");
                fetchThoughts();
            } else {
                toast.error(data.message || "Failed to delete thought");
            }
        } catch (error) {
            console.error('Delete thought error:', error);
            toast.error(error instanceof Error ? error.message : "Error deleting thought");
        }
    };

    // Open edit modal
    const openEditModal = (thought: Thought) => {
        setCurrentThought(thought);
        setThoughtContent(thought.content);
        setThoughtAuthor(thought.author);
        setIsEditModalOpen(true);
    };

    return (
        <div className="min-h-screen animate-fade-in" style={{ background: 'linear-gradient(135deg, #f0f2f5 0%, #e8eaf0 100%)' }}>

            {/* ── Hero Header ── */}
            <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
                <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #f97316, transparent)' }} />
                <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

                <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-3">
                        <img src="/assets/favicon1.png" alt="IATT Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Thoughts of the Day</h1>
                    <p className="text-white/50 text-sm font-medium max-w-sm mx-auto">
                        Inspirational quotes and wisdom from all branches of our organisation.
                    </p>
                    <div className="flex items-center justify-center gap-6 mt-6 text-white/40 text-xs font-bold uppercase tracking-widest">
                        <span>{thoughts.length} Thoughts</span>
                        <span>•</span>
                        <span>{[...new Set(thoughts.map(t => t.branch))].length} Branches</span>
                    </div>
                </div>
            </div>

            {/* ── Feed ── */}
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

                {/* Admin — Inline Create Card (always visible at top) */}
                {isAdmin && (
                    <div className="bg-white rounded-2xl shadow-sm border border-white/60 overflow-hidden">
                        {/* Card header row */}
                        <div className="p-4 pb-4 flex items-center gap-3 border-b border-slate-100">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getPosterColor(user?.name || 'A')} flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0`}>
                                {user?.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                                <p className="text-xs text-slate-400">Share a thought with all branches</p>
                            </div>
                        </div>

                        {/* Inputs */}
                        <div className="px-4 pt-4 pb-2 space-y-3">
                            <Textarea
                                value={thoughtContent}
                                onChange={(e) => setThoughtContent(e.target.value)}
                                placeholder="Enter the inspiring thought or quote..."
                                className="min-h-[100px] border-none shadow-none bg-slate-50 rounded-xl text-[15px] resize-none px-4 py-3 focus-visible:ring-1 focus-visible:ring-orange-400/30 placeholder:text-slate-400"
                            />
                            <Input
                                value={thoughtAuthor}
                                onChange={(e) => setThoughtAuthor(e.target.value)}
                                placeholder="Author name (e.g. Winston Churchill)"
                                className="border-none shadow-none bg-slate-50 rounded-xl h-11 px-4 focus-visible:ring-1 focus-visible:ring-orange-400/30 placeholder:text-slate-400 font-medium"
                            />
                        </div>

                        {/* Post button */}
                        <div className="px-4 pb-4 flex justify-end">
                            <Button
                                onClick={handleCreateThought}
                                disabled={!thoughtContent || !thoughtAuthor}
                                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl px-8 shadow-lg shadow-orange-500/25 disabled:opacity-40 transition-all hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Post Thought
                            </Button>
                        </div>
                    </div>
                )}

                {/* Feed */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                        <p className="text-slate-400 text-sm font-medium">Loading thoughts...</p>
                    </div>
                ) : thoughts.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-white/60">
                        <div className="w-20 h-20 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <Quote className="w-10 h-10 text-orange-400" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-1">No Thoughts Yet</h3>
                        <p className="text-slate-400 text-sm">Start inspiring your team by adding the first thought above!</p>
                    </div>
                ) : (
                    thoughts.map((thought) => {
                        const posterName = thought.first_name ? `${thought.first_name} ${thought.last_name}` : thought.author;
                        const branchStyle = getBranchStyle(thought.branch);

                        return (
                            <div key={thought.id} className="bg-white rounded-2xl shadow-sm border border-white/60 overflow-hidden hover:shadow-md transition-shadow duration-200">

                                {/* Post Header */}
                                <div className="p-4 pb-3 flex items-start justify-between">
                                    <div className="flex gap-3">
                                        <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getPosterColor(posterName)} flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0`}>
                                            {posterName?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-[15px] leading-snug">
                                                {thought.first_name ? `${thought.first_name} ${thought.last_name}` : 'Admin'}
                                            </p>
                                            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                                                <span className="text-xs text-slate-400">
                                                    {new Date(thought.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                    {' · '}
                                                    {new Date(thought.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-orange-50 border border-orange-200 text-orange-500 px-2 py-0.5 rounded-full">
                                                    <Sparkles className="w-2.5 h-2.5" /> Thought
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Admin Actions */}
                                    {isAdmin && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors h-9 w-9 flex items-center justify-center -mr-1">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-xl border-none">
                                                <DropdownMenuItem onClick={() => openEditModal(thought)} className="cursor-pointer font-semibold py-2.5 rounded-lg">
                                                    <Edit2 className="w-4 h-4 mr-2 text-slate-500" /> Edit Post
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteThought(thought.id)} className="text-red-500 cursor-pointer focus:text-red-600 focus:bg-red-50 font-semibold py-2.5 rounded-lg">
                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>

                                {/* Quote Content */}
                                <div className="px-4 pb-5">
                                    <div className="pl-5 border-l-4 border-orange-400 py-1 mb-3">
                                        <p className="text-slate-800 text-[16px] font-semibold leading-relaxed italic">
                                            "{thought.content}"
                                        </p>
                                    </div>
                                    <p className="text-orange-500 font-black text-sm pl-5">
                                        — {thought.author}
                                    </p>
                                </div>

                                {/* Footer */}
                                <div className="px-4 pb-4 flex items-center justify-between">
                                    <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${branchStyle.bg} ${branchStyle.text} ${branchStyle.border}`}>
                                        {thought.branch}
                                    </span>
                                    {thought.first_name && (
                                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                                            <UserIcon className="w-3.5 h-3.5" />
                                            <span>Posted by {thought.first_name} {thought.last_name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ── Edit Thought Modal ── */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden bg-white gap-0">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, #1a1a2e, #0f3460)' }}>
                        <DialogTitle className="text-lg font-black text-white tracking-tight">Edit Thought</DialogTitle>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-3 top-3 rounded-full hover:bg-white/10 h-9 w-9 text-white/60"
                            onClick={() => { setIsEditModalOpen(false); setCurrentThought(null); setThoughtContent(''); setThoughtAuthor(''); }}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="p-5 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Thought / Quote</Label>
                            <Textarea
                                placeholder="Enter the inspiring thought or quote..."
                                value={thoughtContent}
                                onChange={(e) => setThoughtContent(e.target.value)}
                                className="min-h-[120px] rounded-xl bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-orange-400/30 font-medium text-base p-4 resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Author Name</Label>
                            <Input
                                placeholder="e.g., Winston Churchill"
                                value={thoughtAuthor}
                                onChange={(e) => setThoughtAuthor(e.target.value)}
                                className="rounded-xl h-12 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-orange-400/30 font-medium"
                            />
                        </div>
                    </div>

                    <div className="px-5 pb-5 flex gap-3">
                        <Button
                            onClick={() => { setIsEditModalOpen(false); setCurrentThought(null); setThoughtContent(''); setThoughtAuthor(''); }}
                            variant="outline"
                            className="flex-1 rounded-xl font-bold text-slate-500 border-slate-100 hover:bg-slate-50 h-11"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateThought}
                            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-black h-11 shadow-lg shadow-orange-500/20"
                        >
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ThoughtsPage;
