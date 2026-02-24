import React, { useState, useEffect } from 'react';
import { ThumbsUp, MessageCircle, MoreHorizontal, X, Send, Trash2, Edit2, Loader2, Lightbulb } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  is_liked: boolean;
  comments?: Comment[];
}

// Generate a consistent avatar color from a name
const avatarColors = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-rose-500 to-pink-500',
  'from-indigo-500 to-blue-600',
];
const getAvatarColor = (name: string) => {
  const idx = (name?.charCodeAt(0) || 0) % avatarColors.length;
  return avatarColors[idx];
};

const Ideas: React.FC = () => {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Form State
  const [newIdea, setNewIdea] = useState({ title: '', content: '' });

  // Edit Form State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ title: '', content: '' });
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
            const newLiked = data.data.liked;
            return {
              ...idea,
              is_liked: newLiked,
              likes_count: newLiked ? (idea.likes_count + 1) : Math.max(0, idea.likes_count - 1)
            };
          }
          return idea;
        }));
      }
    } catch (error) {
      toast.error("Failed to vote");
    }
  };

  const handleCreate = async () => {
    if (!newIdea.title || !newIdea.content) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newIdea)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Idea submitted successfully!');
        setNewIdea({ title: '', content: '' });
        fetchIdeas();
      } else {
        toast.error(data.message || "Failed to submit idea");
      }
    } catch (error) {
      console.error('Submit idea error:', error);
      toast.error("Error submitting idea");
    }
  };

  const handleUpdate = async () => {
    if (!editingIdea || !editFormData.title || !editFormData.content) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/ideas/${editingIdea.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editFormData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Idea updated successfully!');
        setEditFormData({ title: '', content: '' });
        setShowEditModal(false);
        setEditingIdea(null);
        fetchIdeas();
      } else {
        toast.error(data.message || "Failed to update idea");
      }
    } catch (error) {
      console.error('Update idea error:', error);
      toast.error("Error updating idea");
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
    setEditFormData({ title: idea.title, content: idea.content });
    setShowEditModal(true);
  };

  const toggleComments = async (ideaId: number) => {
    if (expandedIdeaId === ideaId) {
      setExpandedIdeaId(null);
      return;
    }

    setExpandedIdeaId(ideaId);
    setLoadingComments(true);

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
    <div className="min-h-screen animate-fade-in" style={{ background: 'linear-gradient(135deg, #f0f2f5 0%, #e8eaf0 100%)' }}>

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
        {/* Decorative blobs */}
        <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
        <div className="absolute bottom-[-40px] left-[10%] w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />

        <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-3">
            <img src="/assets/favicon1.png" alt="IATT Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Company Innovation Hub</h1>
          <p className="text-white/50 text-sm font-medium max-w-sm mx-auto">
            Share your ideas, spark conversations, and shape the future of our workplace.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-white/40 text-xs font-bold uppercase tracking-widest">
            <span>{ideas.length} Ideas</span>
            <span>•</span>
            <span>{ideas.reduce((sum, i) => sum + i.likes_count, 0)} Likes</span>
            <span>•</span>
            <span>{ideas.reduce((sum, i) => sum + i.comments_count, 0)} Comments</span>
          </div>
        </div>
      </div>

      {/* ── Feed ── */}
      <div className="max-w-2x1 mx-auto px-4 py-6 space-y-4">

        {/* Create Post Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-white/60 overflow-hidden">
          {/* Card Top */}
          <div className="p-4 flex items-center gap-3 border-b border-slate-100">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(user?.name || 'U')} flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0`}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-400">Share an idea with the team</p>
            </div>
          </div>

          {/* Inputs */}
          <div className="px-4 pt-4 pb-2 space-y-2">
            <Input
              value={newIdea.title}
              onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
              placeholder="Give your idea a title..."
              className="border-none shadow-none bg-slate-50 rounded-xl text-base font-semibold px-4 focus-visible:ring-1 focus-visible:ring-amber-400/30 placeholder:text-slate-400 h-11"
            />
            <Textarea
              value={newIdea.content}
              onChange={(e) => setNewIdea({ ...newIdea, content: e.target.value })}
              placeholder={`What's your big idea, ${user?.name?.split(' ')[0]}?`}
              className="min-h-[90px] border-none shadow-none bg-slate-50 rounded-xl text-[15px] resize-none px-4 py-3 focus-visible:ring-1 focus-visible:ring-amber-400/30 placeholder:text-slate-400"
            />
          </div>

          {/* Post button */}
          <div className="px-4 pb-4 flex justify-end">
            <Button
              onClick={handleCreate}
              disabled={!newIdea.title || !newIdea.content}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl px-8 shadow-lg shadow-amber-500/25 disabled:opacity-40 transition-all hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              Post Idea
            </Button>
          </div>
        </div>

        {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-[500px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden bg-white gap-0">
            <div className="p-5 border-b border-slate-100 flex items-center justify-center relative">
              <DialogTitle className="text-lg font-black text-slate-900">Edit Post</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 rounded-full hover:bg-slate-100 h-9 w-9 text-slate-500"
                onClick={() => setShowEditModal(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[70vh]">
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(user?.name || 'U')} flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0`}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm leading-tight">{user?.name}</p>
                  <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold mt-0.5">
                    <Lightbulb className="w-3 h-3" /> Idea
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Input
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  placeholder="Subject / Title"
                  className="border-none shadow-none bg-slate-50 rounded-xl text-lg font-bold px-4 focus-visible:ring-1 focus-visible:ring-amber-400/30 h-12"
                />
                <Textarea
                  value={editFormData.content}
                  onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                  placeholder="What's on your mind?"
                  className="min-h-[150px] border-none shadow-none bg-slate-50 rounded-xl text-[15px] resize-none px-4 py-3 focus-visible:ring-1 focus-visible:ring-amber-400/30"
                />
              </div>
            </div>

            <div className="px-5 pb-5">
              <Button
                onClick={handleUpdate}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl h-11 text-[15px] shadow-lg shadow-amber-500/20"
                disabled={!editFormData.title || !editFormData.content}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Feed Items */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            <p className="text-slate-400 text-sm font-medium">Loading ideas...</p>
          </div>
        ) : ideas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-white/60">
            <div className="w-20 h-20 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Lightbulb className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">No ideas yet</h3>
            <p className="text-slate-400 text-sm">Be the first to spark something great!</p>
          </div>
        ) : (
          ideas.map((idea) => (
            <div key={idea.id} className="bg-white rounded-2xl shadow-sm border border-white/60 overflow-hidden hover:shadow-md transition-shadow duration-200">

              {/* Post Header */}
              <div className="p-4 pb-3 flex items-start justify-between">
                <div className="flex gap-3">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${getAvatarColor(idea.first_name)} flex items-center justify-center text-white font-black text-sm shadow-md flex-shrink-0`}>
                    {idea.first_name?.[0]?.toUpperCase()}{idea.last_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-[15px] leading-snug">
                      {idea.first_name} {idea.last_name}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span className="text-xs text-slate-400">{format(new Date(idea.created_at), 'd MMM · h:mm a')}</span>
                      {idea.position && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          {idea.position}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {Number(user?.id) === idea.user_id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors h-9 w-9 flex items-center justify-center -mr-1">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 rounded-xl shadow-xl border-none">
                      <DropdownMenuItem onClick={() => openEditModal(idea)} className="cursor-pointer font-semibold py-2.5 rounded-lg">
                        <Edit2 className="w-4 h-4 mr-2 text-slate-500" /> Edit Post
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(idea.id)} className="text-red-500 cursor-pointer focus:text-red-600 focus:bg-red-50 font-semibold py-2.5 rounded-lg">
                        <Trash2 className="w-4 h-4 mr-2" /> Move to Trash
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Post Content */}
              <div className="px-4 pb-4">
                {/* Title with accent left border */}
                <div className="pl-3 border-l-4 border-amber-400 mb-3">
                  <h4 className="font-black text-slate-900 text-[18px] leading-snug">{idea.title}</h4>
                </div>
                <p className="text-slate-700 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {idea.content}
                </p>
              </div>

              {/* Stats Row */}
              {(idea.likes_count > 0 || idea.comments_count > 0) && (
                <div className="px-4 py-2 flex items-center justify-between border-t border-slate-50">
                  <div className="flex items-center gap-1.5">
                    {idea.likes_count > 0 && (
                      <>
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                          <ThumbsUp className="w-2.5 h-2.5 text-white fill-current" />
                        </div>
                        <span className="text-sm text-slate-500 font-medium">{idea.likes_count}</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => toggleComments(idea.id)}
                    className="text-sm text-slate-400 hover:text-slate-600 hover:underline font-medium transition-colors"
                  >
                    {idea.comments_count} {idea.comments_count === 1 ? 'comment' : 'comments'}
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="px-3 py-1 border-t border-slate-100">
                <div className="flex">
                  {/* Like Button */}
                  <button
                    onClick={() => handleVote(idea.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-200 text-[15px] font-bold group
                      ${idea.is_liked
                        ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                      }`}
                  >
                    <ThumbsUp className={`w-5 h-5 transition-transform group-hover:scale-110 ${idea.is_liked ? 'fill-current' : ''}`} />
                    <span>{idea.is_liked ? 'Liked' : 'Like'}</span>
                  </button>

                  {/* Divider */}
                  <div className="w-px bg-slate-100 my-1.5" />

                  {/* Comment Button */}
                  <button
                    onClick={() => toggleComments(idea.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-200 text-[15px] font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 group"
                  >
                    <MessageCircle className="w-5 h-5 transform scale-x-[-1] transition-transform group-hover:scale-x-[-1.1] group-hover:scale-y-110" />
                    Comment
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {expandedIdeaId === idea.id && (
                <div className="px-4 pb-4 animate-fade-in">
                  <div className="pt-4 space-y-4 border-t border-slate-100">

                    {loadingComments ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                      </div>
                    ) : (
                      idea.comments && idea.comments.length > 0 ? (
                        <div className="space-y-3">
                          {idea.comments.map(comment => (
                            <div key={comment.id} className="flex gap-2.5 group/comment">
                              {/* Comment Author Avatar */}
                              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(comment.first_name)} flex items-center justify-center text-white font-black text-xs shadow flex-shrink-0 mt-0.5`}>
                                {comment.first_name?.[0]?.toUpperCase()}
                              </div>

                              <div className="flex items-start gap-2 flex-1 min-w-0">
                                {/* Comment Bubble */}
                                <div className="bg-slate-100 rounded-2xl px-4 py-2.5 flex-1 min-w-0">
                                  <p className="text-[12px] font-black text-slate-900 mb-1 leading-none">
                                    {comment.first_name} {comment.last_name}
                                  </p>
                                  <p className="text-[14px] text-slate-800 leading-snug break-words">
                                    {comment.comment}
                                  </p>
                                </div>

                                {/* Comment Actions */}
                                {Number(user?.id) === comment.user_id && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className="opacity-0 group-hover/comment:opacity-100 p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-all flex-shrink-0 mt-1">
                                        <MoreHorizontal className="w-4 h-4" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-none w-36">
                                      <DropdownMenuItem onClick={() => handleDeleteComment(comment.id, idea.id)} className="text-red-500 cursor-pointer font-semibold py-2 rounded-lg">
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-3 text-center text-slate-400 text-sm italic">
                          No comments yet. Be the first to reply!
                        </div>
                      )
                    )}

                    {/* Add Comment */}
                    <div className="flex gap-2.5 items-center pt-1">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(user?.name || 'U')} flex items-center justify-center text-white font-black text-xs shadow flex-shrink-0`}>
                        {user?.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 relative">
                        <Input
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a comment..."
                          className="bg-slate-100 border-none rounded-full h-10 px-4 pr-10 focus-visible:ring-1 focus-visible:ring-amber-400/30 placeholder:text-slate-400 text-[14px] font-medium"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(idea.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(idea.id)}
                          className={`absolute right-3 top-1/2 -translate-y-1/2 transition-all ${commentText.trim()
                            ? 'text-amber-500 hover:text-amber-600 hover:scale-110'
                            : 'text-slate-300 cursor-not-allowed'
                            }`}
                          disabled={!commentText.trim()}
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Ideas;
