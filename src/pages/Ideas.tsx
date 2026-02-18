import React, { useState, useEffect } from 'react';
import { Lightbulb, Send, ThumbsUp, MessageCircle, Clock, Plus, X, Trash2, Edit2, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Comment {
  id: number;
  user_id: number;
  idea_id: number;
  comment: string;
  created_at: string;
  first_name: string;
  last_name: string;
  photo?: string;
  position?: string;
}

interface Idea {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
  first_name: string;
  last_name: string;
  position?: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean; // boolean (0 or 1 from backend)
  comments?: Comment[];
}

const Ideas: React.FC = () => {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: '', content: '' });
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);

  // Comment state
  const [expandedIdeaId, setExpandedIdeaId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const fetchIdeas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ideas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        // Convert is_liked from 0/1 to boolean if needed, though JS handles truthy/falsy
        setIdeas(data.data);
      }
    } catch (error) {
      console.error('Fetch ideas error:', error);
      toast.error("Failed to load ideas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const handleVote = async (ideaId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/ideas/${ideaId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setIdeas(ideas.map(idea => {
          if (idea.id === ideaId) {
            const wasLiked = idea.is_liked;
            const newLiked = data.data.liked;
            return {
              ...idea,
              is_liked: newLiked,
              likes_count: newLiked ? idea.likes_count + 1 : Math.max(0, idea.likes_count - 1)
            };
          }
          return idea;
        }));
      }
    } catch (error) {
      toast.error("Failed to vote");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdea.title || !newIdea.content) return;

    try {
      const token = localStorage.getItem('token');
      const url = editingIdea
        ? `http://localhost:5000/api/ideas/${editingIdea.id}`
        : 'http://localhost:5000/api/ideas';

      const method = editingIdea ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newIdea)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(editingIdea ? 'Idea updated successfully!' : 'Idea submitted successfully!');
        setNewIdea({ title: '', content: '' });
        setShowForm(false);
        setEditingIdea(null);
        fetchIdeas();
      } else {
        toast.error(data.message || "Failed to submit idea");
      }
    } catch (error) {
      console.error('Submit idea error:', error);
      toast.error("Error submitting idea");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this idea?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/ideas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Idea deleted successfully");
        setIdeas(ideas.filter(i => i.id !== id));
      } else {
        toast.error(data.message || "Failed to delete idea");
      }
    } catch (error) {
      toast.error("Error deleting idea");
    }
  };

  const openEditModal = (idea: Idea) => {
    setEditingIdea(idea);
    setNewIdea({ title: idea.title, content: idea.content });
    setShowForm(true);
  };

  const toggleComments = async (ideaId: number) => {
    if (expandedIdeaId === ideaId) {
      setExpandedIdeaId(null);
      return;
    }

    setExpandedIdeaId(ideaId);
    setLoadingComments(true);

    // Fetch details including comments
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/ideas/${ideaId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setIdeas(ideas.map(i => i.id === ideaId ? { ...i, comments: data.data.comments } : i));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (ideaId: number) => {
    if (!commentText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/ideas/${ideaId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment: commentText })
      });
      const data = await response.json();

      if (data.success) {
        const newComment = data.data;
        setIdeas(ideas.map(i => {
          if (i.id === ideaId) {
            return {
              ...i,
              comments: [...(i.comments || []), newComment],
              comments_count: i.comments_count + 1
            };
          }
          return i;
        }));
        setCommentText('');
        toast.success("Comment added");
      }
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId: number, ideaId: number) => {
    if (!confirm("Delete this comment?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/ideas/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setIdeas(ideas.map(i => {
          if (i.id === ideaId) {
            return {
              ...i,
              comments: i.comments?.filter(c => c.id !== commentId),
              comments_count: Math.max(0, i.comments_count - 1)
            };
          }
          return i;
        }));
        toast.success("Comment deleted");
      }
    } catch (error) {
      toast.error("Error deleting comment");
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-amber-50">
            <Lightbulb className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Ideas Hub</h1>
            <p className="text-slate-500 font-medium mt-1">Share and discuss ideas to improve our workplace</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingIdea(null);
            setNewIdea({ title: '', content: '' });
            setShowForm(true);
          }}
          className="px-8 py-4 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-3 font-black uppercase tracking-[0.2em] text-sm"
        >
          <Plus className="w-5 h-5" />
          Submit Idea
        </button>
      </div>

      {/* Idea Submission/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="p-8 bg-slate-50 border-b border-slate-100/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <div className="p-2.5 bg-amber-100/50 rounded-xl text-amber-600">
                  <Lightbulb className="w-6 h-6" />
                </div>
                {editingIdea ? 'Edit Your Idea' : 'Submit New Idea'}
              </DialogTitle>
              <p className="text-slate-500 font-medium ml-[3.25rem]">
                {editingIdea ? 'Update your idea details below' : 'Share your innovative thoughts with the team'}
              </p>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Idea Title</Label>
              <Input
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                placeholder="Give your idea a catchy title..."
                className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-lg focus:ring-amber-500/20 focus:border-amber-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Detailed Description</Label>
              <Textarea
                value={newIdea.content}
                onChange={(e) => setNewIdea({ ...newIdea, content: e.target.value })}
                placeholder="Describe your idea in detail. What problem does it solve? How does it help?"
                className="min-h-[150px] rounded-2xl bg-slate-50 border-slate-100 font-medium text-base leading-relaxed focus:ring-amber-500/20 focus:border-amber-500/50 resize-none p-4"
              />
            </div>
          </div>

          <DialogFooter className="p-8 pt-0 gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowForm(false)}
              className="rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-black uppercase tracking-widest px-8 shadow-lg shadow-amber-500/20"
            >
              {editingIdea ? 'Save Changes' : 'Submit Idea'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ideas Feed */}
      <div className="max-w-5xl mx-auto space-y-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Ideas...</p>
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-6">
              <Lightbulb className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900">No ideas yet</h3>
            <p className="text-slate-500 mt-2">Be the first to share an idea!</p>
          </div>
        ) : (
          ideas.map((idea) => (
            <div key={idea.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-amber-500/5 transition-all group animate-fade-in-up">
              <div className="flex gap-8">
                {/* Vote Button */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => handleVote(idea.id)}
                    className={`flex flex-col items-center p-4 rounded-2xl transition-all shrink-0 w-20 group/vote
                                ${idea.is_liked
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25 scale-105'
                        : 'bg-slate-50 text-slate-400 hover:text-amber-500 hover:bg-amber-50 hover:scale-105'
                      }`}
                  >
                    <ThumbsUp className={`w-6 h-6 ${idea.is_liked ? 'fill-current' : ''}`} />
                    <span className="font-black mt-2 text-lg">{idea.likes_count}</span>
                  </button>
                  {/* Owner Actions */}
                  {Number(user?.id) === idea.user_id && (
                    <div className="flex flex-col gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(idea)} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-sky-500 hover:bg-sky-50 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(idea.id)} className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{idea.title}</h3>
                    <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-lg shrink-0">
                      {format(new Date(idea.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>

                  <p className="text-slate-600 font-medium text-lg leading-relaxed mb-6 whitespace-pre-wrap">
                    {idea.content}
                  </p>

                  {/* Author & Footer */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-white shadow-sm bg-slate-100">
                        <AvatarFallback className="bg-amber-50 text-amber-600 font-black">
                          {idea.first_name?.[0]}{idea.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-slate-900 font-black text-xs leading-none">
                          {idea.first_name} {idea.last_name}
                        </p>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-wider mt-1">
                          {idea.position || 'Staff'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleComments(idea.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all
                                  ${expandedIdeaId === idea.id ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-600'}`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      {idea.comments_count} Comments
                    </button>
                  </div>

                  {/* Comments Section */}
                  {expandedIdeaId === idea.id && (
                    <div className="mt-8 pt-6 border-t border-slate-50 animate-fade-in-down">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Discussion ({idea.comments_count})</h4>

                      {loadingComments ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {idea.comments && idea.comments.length > 0 ? (
                            idea.comments.map(comment => (
                              <div key={comment.id} className="flex gap-4 group/comment">
                                <Avatar className="w-8 h-8 border border-slate-100">
                                  {comment.photo ? (
                                    <AvatarImage src={`http://localhost:5000${comment.photo}`} />
                                  ) : (
                                    <AvatarFallback className="bg-slate-100 text-slate-500 text-xs font-bold">
                                      {comment.first_name[0]}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                                <div className="flex-1">
                                  <div className="bg-slate-50 rounded-2xl p-4 relative group-hover/comment:bg-slate-100/80 transition-colors">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-black text-slate-900">
                                        {comment.first_name} {comment.last_name}
                                      </span>
                                      <span className="text-[10px] text-slate-400 font-bold">
                                        {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                                      </span>
                                    </div>
                                    <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                      {comment.comment}
                                    </p>

                                    {/* Delete Comment */}
                                    {Number(user?.id) === comment.user_id && (
                                      <button
                                        onClick={() => handleDeleteComment(comment.id, idea.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-white text-slate-300 rounded-lg opacity-0 group-hover/comment:opacity-100 hover:text-red-500 shadow-sm transition-all"
                                        title="Delete comment"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-400 italic text-sm text-center py-4">No comments yet. Be the first to start the discussion!</p>
                          )}

                          {/* Add Comment Input */}
                          <div className="flex gap-4 mt-6">
                            <Avatar className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 font-bold text-xs ring-4 ring-white shadow-sm">
                              <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 flex gap-2">
                              <Input
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add to the discussion..."
                                className="h-10 rounded-xl border-slate-200 bg-white focus:ring-amber-500/20"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment(idea.id);
                                  }
                                }}
                              />
                              <Button
                                onClick={() => handleAddComment(idea.id)}
                                disabled={!commentText.trim()}
                                className="bg-amber-500 text-white rounded-xl hover:bg-amber-600 w-10 px-0 shadow-lg shadow-amber-500/20"
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Ideas;
