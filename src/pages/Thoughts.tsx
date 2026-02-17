import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Quote, Plus, Edit2, Trash2, Loader2, Calendar, User as UserIcon, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

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

const ThoughtsPage: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const [thoughts, setThoughts] = useState<Thought[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentThought, setCurrentThought] = useState<Thought | null>(null);
    const [thoughtContent, setThoughtContent] = useState('');
    const [thoughtAuthor, setThoughtAuthor] = useState('');

    // Fetch all thoughts from all branches
    const fetchThoughts = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/thoughts/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setThoughts(data.data.thoughts);
            }
        } catch (error) {
            console.error('Fetch thoughts error:', error);
            toast.error('Failed to load thoughts');
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
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/thoughts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: thoughtContent,
                    author: thoughtAuthor,
                    branch: user?.branch
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Thought created successfully!");
                setIsAddModalOpen(false);
                setThoughtContent('');
                setThoughtAuthor('');
                fetchThoughts();
            } else {
                toast.error(data.message || "Failed to create thought");
            }
        } catch (error) {
            console.error('Create thought error:', error);
            toast.error("Error creating thought");
        }
    };

    // Update thought
    const handleUpdateThought = async () => {
        if (!currentThought || !thoughtContent.trim() || !thoughtAuthor.trim()) {
            toast.error("Please enter both content and author name");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/thoughts/${currentThought.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    content: thoughtContent,
                    author: thoughtAuthor
                })
            });

            const data = await response.json();

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
            toast.error("Error updating thought");
        }
    };

    // Delete thought
    const handleDeleteThought = async (id: number) => {
        if (!confirm('Are you sure you want to delete this thought?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/thoughts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                toast.success("Thought deleted successfully!");
                fetchThoughts();
            } else {
                toast.error(data.message || "Failed to delete thought");
            }
        } catch (error) {
            console.error('Delete thought error:', error);
            toast.error("Error deleting thought");
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
        <div className="space-y-10 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-orange-50">
                        <Quote className="w-8 h-8 text-orange-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Thoughts of the Day</h1>
                        <p className="text-slate-500 font-medium mt-1">Inspirational quotes and thoughts from all branches</p>
                    </div>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="px-8 py-4 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-3 font-black uppercase tracking-[0.2em] text-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Add Thought
                    </button>
                )}
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Thoughts...</p>
                </div>
            ) : thoughts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {thoughts.map((thought, index) => (
                        <div
                            key={thought.id}
                            className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-orange-100/50 transition-all duration-300 group flex flex-col relative overflow-hidden"
                        >
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-50 to-transparent rounded-bl-[3rem] opacity-50 group-hover:opacity-100 transition-opacity" />

                            {/* Number badge */}
                            <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center z-10">
                                <span className="text-orange-500 font-black text-sm">#{index + 1}</span>
                            </div>

                            {/* Quote icon */}
                            <div className="mb-6 relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-7 h-7" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-4 relative z-10">
                                <p className="text-slate-800 font-bold italic text-base leading-relaxed">
                                    "{thought.content}"
                                </p>
                                <p className="text-orange-500 font-black text-sm">
                                    – {thought.author}
                                </p>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                                    <span className="text-primary font-black text-[10px] uppercase tracking-widest">
                                        {thought.branch}
                                    </span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-2 text-slate-400 text-xs">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span className="font-bold">{new Date(thought.created_at).toLocaleDateString()}</span>
                                </div>
                                {thought.first_name && (
                                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                                        <UserIcon className="w-3.5 h-3.5" />
                                        <span className="font-bold">{thought.first_name} {thought.last_name}</span>
                                    </div>
                                )}
                            </div>

                            {/* Admin actions */}
                            {isAdmin && (
                                <div className="mt-4 flex items-center gap-2 relative z-10">
                                    <button
                                        onClick={() => openEditModal(thought)}
                                        className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-orange-500 hover:border-orange-500 hover:bg-orange-50 transition-all flex items-center justify-center gap-2 font-bold text-xs"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteThought(thought.id)}
                                        className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-2 font-bold text-xs"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-20 text-center">
                    <div className="w-20 h-20 mx-auto rounded-full bg-orange-50 flex items-center justify-center mb-6">
                        <Quote className="w-10 h-10 text-orange-500" />
                    </div>
                    <h3 className="text-slate-900 font-black text-xl mb-2">No Thoughts Yet</h3>
                    <p className="text-slate-400 font-medium mb-6">Start inspiring your team by adding the first thought!</p>
                    {isAdmin && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all"
                        >
                            Add First Thought
                        </button>
                    )}
                </div>
            )}

            {/* Add Thought Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[525px] rounded-[2rem] border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Add New Thought</DialogTitle>
                        <p className="text-slate-500 font-medium text-sm mt-2">Share an inspiring thought with your team</p>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Content</Label>
                            <Textarea
                                placeholder="Enter the inspiring thought or quote..."
                                value={thoughtContent}
                                onChange={(e) => setThoughtContent(e.target.value)}
                                className="min-h-[120px] rounded-xl border-slate-100 focus:border-orange-500/20 focus:ring-orange-500/10 font-medium text-base p-4 resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Author Name</Label>
                            <Input
                                placeholder="e.g., Winston Churchill"
                                value={thoughtAuthor}
                                onChange={(e) => setThoughtAuthor(e.target.value)}
                                className="rounded-xl h-12 border-slate-100 focus:border-orange-500/20 focus:ring-orange-500/10 font-medium"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-3">
                        <Button
                            onClick={() => {
                                setIsAddModalOpen(false);
                                setThoughtContent('');
                                setThoughtAuthor('');
                            }}
                            variant="outline"
                            className="rounded-xl font-bold border-slate-100 text-slate-500 hover:bg-slate-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateThought}
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black uppercase tracking-widest px-8 shadow-lg shadow-orange-500/25"
                        >
                            Add Thought
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Thought Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[525px] rounded-[2rem] border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Edit Thought</DialogTitle>
                        <p className="text-slate-500 font-medium text-sm mt-2">Update the thought content and author</p>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Content</Label>
                            <Textarea
                                placeholder="Enter the inspiring thought or quote..."
                                value={thoughtContent}
                                onChange={(e) => setThoughtContent(e.target.value)}
                                className="min-h-[120px] rounded-xl border-slate-100 focus:border-orange-500/20 focus:ring-orange-500/10 font-medium text-base p-4 resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Author Name</Label>
                            <Input
                                placeholder="e.g., Winston Churchill"
                                value={thoughtAuthor}
                                onChange={(e) => setThoughtAuthor(e.target.value)}
                                className="rounded-xl h-12 border-slate-100 focus:border-orange-500/20 focus:ring-orange-500/10 font-medium"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-3">
                        <Button
                            onClick={() => {
                                setIsEditModalOpen(false);
                                setCurrentThought(null);
                                setThoughtContent('');
                                setThoughtAuthor('');
                            }}
                            variant="outline"
                            className="rounded-xl font-bold border-slate-100 text-slate-500 hover:bg-slate-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateThought}
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black uppercase tracking-widest px-8 shadow-lg shadow-orange-500/25"
                        >
                            Update Thought
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ThoughtsPage;
