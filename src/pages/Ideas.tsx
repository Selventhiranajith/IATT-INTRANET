import React, { useState, useEffect } from 'react';
import { ThumbsUp, MessageCircle, MoreHorizontal, X, Send, Trash2, Edit2, Loader2, Lightbulb } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
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
    <div className="min-h-screen bg-[#f0f2f5] py-6 animate-fade-in">
      <div className="max-w-2xl mx-auto px-4 space-y-5">

        {/* Page Header */}
        <div className="text-center pb-2">
          <h1 className="text-2xl font-bold text-slate-900">Company Innovation Hub</h1>
          <p className="text-slate-500 text-sm mt-1">Share your ideas to improve our workplace and processes</p>
        </div>

        {/* Create Post Card (Inline) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100/50 overflow-hidden">
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarFallback className="bg-amber-100 text-amber-600 font-bold">
                {user?.name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800">Create Post</span>
              <span className="text-xs text-slate-400">Share your idea with the team</span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <Input
              value={newIdea.title}
              onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
              placeholder="Title of your idea"
              className="border-none shadow-none text-lg font-semibold px-0 focus-visible:ring-0 placeholder:text-slate-400 h-auto py-1 rounded-none"
            />
            <Textarea
              value={newIdea.content}
              onChange={(e) => setNewIdea({ ...newIdea, content: e.target.value })}
              placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
              className="min-h-[100px] border-none shadow-none text-[15px] resize-none px-0 focus-visible:ring-0 placeholder:text-slate-400 py-1 rounded-none"
            />
          </div>

          <div className="p-3 border-t border-slate-100 flex justify-end">
            <Button
              onClick={handleCreate}
              disabled={!newIdea.title || !newIdea.content}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg px-6"
            >
              Post
            </Button>
          </div>
        </div>

        {/* Edit Post Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-[500px] rounded-xl border-none shadow-xl p-0 overflow-hidden bg-white gap-0">
            <div className="p-4 border-b border-slate-100 flex items-center justify-center relative">
              <DialogTitle className="text-xl font-bold text-slate-900">
                Edit Post
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3 rounded-full hover:bg-slate-100 h-9 w-9 text-slate-500"
                onClick={() => setShowEditModal(false)}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[70vh]">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-amber-100 text-amber-600 font-bold">
                    {user?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-900 text-[15px] leading-tight">{user?.name}</span>
                  <div className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-md font-semibold flex items-center gap-1 w-fit mt-0.5">
                    <Lightbulb className="w-3 h-3 text-amber-600" /> Idea
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Input
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  placeholder="Subject / Title"
                  className="border-none shadow-none text-xl font-medium px-0 focus-visible:ring-0 placeholder:text-slate-400 h-auto py-0"
                />
                <Textarea
                  value={editFormData.content}
                  onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                  placeholder={`What's on your mind?`}
                  className="min-h-[150px] border-none shadow-none text-base resize-none px-0 focus-visible:ring-0 placeholder:text-slate-400 py-0"
                />
              </div>
            </div>

            <div className="p-4 pt-0">
              <Button
                onClick={handleUpdate}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg h-10 text-[15px]"
                disabled={!editFormData.title || !editFormData.content}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Feed Items */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        ) : ideas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-slate-100">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-4">
              <Lightbulb className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No ideas yet</h3>
            <p className="text-slate-500 mt-2">Be the first to share an idea!</p>
          </div>
        ) : (
          ideas.map((idea) => (
            <div key={idea.id} className="bg-white rounded-xl shadow-sm animate-fade-in-up border border-slate-100">
              {/* Post Header */}
              <div className="p-4 pb-2 flex items-start justify-between">
                <div className="flex gap-3">
                  <Avatar className="w-10 h-10 border border-slate-100 cursor-pointer">
                    <AvatarFallback className="bg-amber-50 text-amber-600 font-bold">
                      {idea.first_name?.[0]}{idea.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-[15px] leading-snug cursor-pointer hover:underline">
                      {idea.first_name} {idea.last_name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                      <span className="hover:underline cursor-pointer">{format(new Date(idea.created_at), 'd MMM')}</span>
                      <span>•</span>
                      <span className="font-medium">{format(new Date(idea.created_at), 'h:mm a')}</span>
                      {idea.position && (
                        <>
                          <span>•</span>
                          <span className="font-medium bg-slate-100 px-1.5 rounded-[3px] uppercase tracking-wide text-[10px]">
                            {idea.position}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {Number(user?.id) === idea.user_id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-slate-500 hover:bg-slate-100 p-2 rounded-full transition-colors h-9 w-9 flex items-center justify-center -mr-2">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 rounded-lg shadow-lg">
                      <DropdownMenuItem onClick={() => openEditModal(idea)} className="cursor-pointer font-medium py-2">
                        <Edit2 className="w-4 h-4 mr-2" /> Edit Post
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(idea.id)} className="text-red-600 cursor-pointer focus:text-red-700 focus:bg-red-50 font-medium py-2">
                        <Trash2 className="w-4 h-4 mr-2" /> Move to trash
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Post Content */}
              <div className="px-4 pb-3">
                <h4 className="font-bold text-slate-900 text-[17px] mb-1 leading-snug">{idea.title}</h4>
                <p className="text-slate-900 text-[15px] leading-relaxed whitespace-pre-wrap">
                  {idea.content}
                </p>
              </div>

              {/* Stats - Like/Comment Counts */}
              <div className="px-4 py-2.5 flex items-center justify-between text-[15px] text-slate-500">
                <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
                  {idea.likes_count > 0 && (
                    <>
                      <div className="w-[18px] h-[18px] bg-amber-500 rounded-full flex items-center justify-center">
                        <ThumbsUp className="w-2.5 h-2.5 text-white fill-current" />
                      </div>
                      <span className="text-slate-600">{idea.likes_count}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="hover:underline cursor-pointer text-slate-600" onClick={() => toggleComments(idea.id)}>
                    {idea.comments_count} comments
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-3 pb-2">
                <div className="flex border-t border-slate-200/60 pt-1">
                  <button
                    onClick={() => handleVote(idea.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md transition-colors text-[15px] font-semibold
                      ${idea.is_liked ? 'text-amber-600' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    <ThumbsUp className={`w-5 h-5 ${idea.is_liked ? 'fill-current' : ''}`} />
                    Like
                  </button>
                  <button
                    onClick={() => toggleComments(idea.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md transition-colors text-[15px] font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    <MessageCircle className="w-5 h-5 transform scale-x-[-1]" />
                    Comment
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {expandedIdeaId === idea.id && (
                <div className="px-4 pb-4 animate-fade-in">
                  <div className="border-t border-slate-200/60 pt-4 space-y-4">

                    {/* Comments List */}
                    {loadingComments ? (
                      <div className="flex justify-center py-2">
                        <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                      </div>
                    ) : (
                      idea.comments && idea.comments.length > 0 ? (
                        <div className="space-y-4">
                          {idea.comments.map(comment => (
                            <div key={comment.id} className="flex gap-2 group/comment">
                              <Avatar className="w-8 h-8 cursor-pointer">
                                {comment.photo ? (
                                  <AvatarImage src={`http://localhost:5000${comment.photo}`} />
                                ) : (
                                  <AvatarFallback className="bg-amber-100 text-amber-600 text-xs font-bold">
                                    {comment.first_name[0]}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="flex items-start gap-2 max-w-[85%] group">
                                <div className="bg-slate-100 rounded-2xl px-3 py-2 relative">
                                  <p className="text-[13px] font-bold text-slate-900 cursor-pointer hover:underline mb-0.5 leading-none">
                                    {comment.first_name} {comment.last_name}
                                  </p>
                                  <p className="text-[15px] text-slate-900 leading-snug">
                                    {comment.comment}
                                  </p>
                                </div>
                                {Number(user?.id) === comment.user_id && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-all">
                                        <MoreHorizontal className="w-4 h-4" />
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem onClick={() => handleDeleteComment(comment.id, idea.id)} className="text-red-600">
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-2 text-center text-slate-500 text-sm italic">
                          No comments yet.
                        </div>
                      )
                    )}

                    {/* Add Comment Input */}
                    <div className="flex gap-2 items-start mt-2">
                      <Avatar className="w-8 h-8 mt-1">
                        <AvatarFallback className="bg-amber-100 text-amber-600 font-bold text-xs">
                          {user?.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 relative">
                        <Input
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write a comment..."
                          className="bg-slate-100 border-none rounded-2xl h-10 px-3.5 focus-visible:ring-0 placeholder:text-slate-500 pr-10 text-[15px]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(idea.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(idea.id)}
                          className={`absolute right-3 top-3 transition-colors ${commentText.trim() ? 'text-amber-600 hover:text-amber-700' : 'text-slate-400 cursor-not-allowed'}`}
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
