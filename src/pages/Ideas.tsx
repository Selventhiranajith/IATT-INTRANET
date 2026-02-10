import React, { useState } from 'react';
import { Lightbulb, Send, ThumbsUp, MessageCircle, Clock, Plus, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Idea {
  id: string;
  title: string;
  description: string;
  author: string;
  department: string;
  date: string;
  votes: number;
  comments: number;
  status: 'new' | 'under-review' | 'implemented' | 'archived';
  voted?: boolean;
}

const Ideas: React.FC = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [newIdea, setNewIdea] = useState({ title: '', description: '', category: '' });
  const [ideas, setIdeas] = useState<Idea[]>([
    { id: '1', title: 'Flexible Work Hours', description: 'Allow employees to choose their working hours within a core window of 10 AM to 4 PM.', author: 'John Doe', department: 'Engineering', date: 'Jan 28, 2024', votes: 24, comments: 8, status: 'under-review' },
    { id: '2', title: 'Monthly Learning Sessions', description: 'Organize monthly sessions where team members share knowledge on various topics.', author: 'Sarah Johnson', department: 'HR', date: 'Jan 25, 2024', votes: 18, comments: 5, status: 'implemented' },
    { id: '3', title: 'Green Office Initiative', description: 'Implement eco-friendly practices like recycling stations and reducing paper usage.', author: 'Mike Chen', department: 'Operations', date: 'Jan 22, 2024', votes: 31, comments: 12, status: 'new' },
    { id: '4', title: 'Wellness Program', description: 'Introduce a comprehensive wellness program including gym memberships and mental health support.', author: 'Emily Davis', department: 'HR', date: 'Jan 20, 2024', votes: 42, comments: 15, status: 'under-review' },
  ]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      new: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
      'under-review': 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      implemented: 'bg-green-500/20 text-green-300 border-green-400/30',
      archived: 'bg-white/10 text-white/50 border-white/20',
    };
    return styles[status] || 'bg-white/10 text-white/60';
  };

  const handleVote = (ideaId: string) => {
    setIdeas(ideas.map(idea => {
      if (idea.id === ideaId) {
        return {
          ...idea,
          votes: idea.voted ? idea.votes - 1 : idea.votes + 1,
          voted: !idea.voted,
        };
      }
      return idea;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIdea.title || !newIdea.description) return;

    const idea: Idea = {
      id: String(ideas.length + 1),
      title: newIdea.title,
      description: newIdea.description,
      author: user?.name || 'Anonymous',
      department: user?.department || 'General',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      votes: 0,
      comments: 0,
      status: 'new',
    };

    setIdeas([idea, ...ideas]);
    setNewIdea({ title: '', description: '', category: '' });
    setShowForm(false);
    toast.success('Idea Submitted!', {
      description: 'Your idea has been submitted for review.',
    });
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
            <p className="text-slate-500 font-medium mt-1">Share your ideas to improve our workplace</p>
          </div>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="px-8 py-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-3 font-black uppercase tracking-[0.2em] text-sm"
        >
          <Plus className="w-5 h-5" />
          Submit Idea
        </button>
      </div>

      {/* Idea Submission Form */}
      {showForm && (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-amber-50 rounded-xl shadow-sm">
                 <Lightbulb className="w-6 h-6 text-amber-500" />
               </div>
               <h2 className="text-2xl font-black text-slate-900 tracking-tight">Submit Your Idea</h2>
            </div>
            <button 
              onClick={() => setShowForm(false)}
              className="p-3 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Title</label>
              <input
                type="text"
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                placeholder="Give your idea a catchy title"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:bg-white focus:border-primary/20 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Description</label>
              <textarea
                value={newIdea.description}
                onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                placeholder="Describe your idea in detail..."
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:bg-white focus:border-primary/20 transition-all resize-none"
                rows={4}
                required
              />
            </div>
            <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-sm">
              <Send className="w-5 h-5" />
              Submit My Idea
            </button>
          </form>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: 'Total Ideas', value: ideas.length, icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Under Review', value: ideas.filter(i => i.status === 'under-review').length, icon: Clock, color: 'text-sky-500', bg: 'bg-sky-50' },
          { label: 'Implemented', value: ideas.filter(i => i.status === 'implemented').length, icon: Send, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Total Votes', value: ideas.reduce((sum, i) => sum + i.votes, 0), icon: ThumbsUp, color: 'text-primary', bg: 'bg-primary/5' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{stat.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ideas Feed */}
      <div className="space-y-8">
        {ideas.map((idea) => (
          <div key={idea.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              {/* Vote Button */}
              <button 
                onClick={() => handleVote(idea.id)}
                className={`flex flex-col items-center p-4 rounded-2xl transition-all shrink-0 w-20 ${
                  idea.voted 
                    ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                    : 'bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 border border-slate-50 hover:border-primary/20'
                }`}
              >
                <ThumbsUp className={`w-6 h-6 ${idea.voted ? 'fill-current' : ''}`} />
                <span className="font-black mt-2 text-lg">{idea.votes}</span>
              </button>

              {/* Idea Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <h3 className="text-slate-900 font-black text-2xl tracking-tight group-hover:text-primary transition-colors">{idea.title}</h3>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm 
                    ${idea.status === 'new' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      idea.status === 'under-review' ? 'bg-sky-50 text-primary border-sky-100' :
                      idea.status === 'implemented' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      'bg-slate-50 text-slate-400 border-slate-100'}`}>
                    {idea.status.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-slate-500 text-lg font-medium leading-relaxed mb-8">{idea.description}</p>
                
                <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-slate-50">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-black">
                       {idea.author[0]}
                     </div>
                     <div className="flex flex-col">
                       <span className="text-slate-900 font-black text-xs">{idea.author}</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{idea.department}</span>
                     </div>
                   </div>

                  <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.15em] text-slate-300 ml-auto">
                    <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl">
                      <Clock className="w-3.5 h-3.5" />
                      {idea.date}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl text-primary">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {idea.comments} Comments
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ideas;
