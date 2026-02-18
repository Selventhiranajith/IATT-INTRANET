import React, { useState, useEffect } from 'react';
import { ScrollText, ChevronRight, FileText, Clock, Shield, Users, Plus, Pencil, Trash2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Policy {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  doc_no?: string;
  version?: string;
  effective_date?: string;
  prepared_by?: string;
  approved_by?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  icon?: React.ElementType; // Optional for backend data
}

const HRPolicy: React.FC = () => {
  const { isAdmin, isSuperAdmin } = useAuth();
  const canManage = isAdmin || isSuperAdmin;

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Policy>>({
    title: '',
    category: 'General',
    description: '',
    content: '',
    doc_no: '',
    version: '1.0',
    effective_date: new Date().toISOString().split('T')[0],
    prepared_by: '',
    approved_by: '',
    status: 'Active'
  });

  const categories = ['All', 'General', 'Training', 'Diversity', 'Ethics', 'Leave', 'Benefits', 'Security'];

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/hr', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPolicies(data.data);
      }
    } catch (error) {
      console.error('Fetch policies error:', error);
      toast.error("Failed to load policies");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPolicies = activeCategory === 'All'
    ? policies
    : policies.filter(policy => policy.category === activeCategory);

  const handlePolicyClick = (policy: Policy) => {
    setSelectedPolicy(policy);
    setIsViewerOpen(true);
  };

  const handleAddNew = () => {
    setFormData({
      title: '',
      category: 'General',
      description: '',
      content: '',
      version: '1.0',
      effective_date: new Date().toISOString().split('T')[0],
      prepared_by: '',
      approved_by: '',
      status: 'Active'
    });
    setSelectedPolicy(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (policy: Policy, e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData({
      ...policy,
      effective_date: policy.effective_date ? new Date(policy.effective_date).toISOString().split('T')[0] : ''
    });
    setSelectedPolicy(policy);
    setIsEditorOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this policy?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/hr/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Policy deleted successfully");
        fetchPolicies();
        if (selectedPolicy?.id === id) {
          setIsViewerOpen(false);
          setSelectedPolicy(null);
        }
      } else {
        toast.error(data.message || "Failed to delete policy");
      }
    } catch (error) {
      console.error('Delete policy error:', error);
      toast.error("Error deleting policy");
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Title and Content are required");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const url = selectedPolicy
        ? `http://localhost:5000/api/hr/update/${selectedPolicy.id}`
        : 'http://localhost:5000/api/hr/create';

      const method = selectedPolicy ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success(selectedPolicy ? "Policy updated successfully" : "Policy created successfully");
        setIsEditorOpen(false);
        fetchPolicies();
      } else {
        toast.error(data.message || "Failed to save policy");
      }
    } catch (error) {
      console.error('Save policy error:', error);
      toast.error("Error saving policy");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-5">
          <div className="bg-gradient-to-br from-primary to-primary/80 p-4 rounded-2xl shadow-lg shadow-primary/20 text-white">
            <ScrollText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Policies</h1>
            <p className="text-slate-500 font-medium text-sm">Official company regulations and guidelines</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Category Filters */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl self-start md:self-auto overflow-x-auto max-w-[500px]">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${category === activeCategory
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
          {canManage && (
            <Button onClick={handleAddNew} className="rounded-xl px-6 font-bold shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              New Policy
            </Button>
          )}
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="text-center py-20 text-slate-400">Loading policies...</div>
        ) : filteredPolicies.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No policies found for this category.</div>
        ) : (
          filteredPolicies.map((policy) => (
            <div
              key={policy.id}
              onClick={() => handlePolicyClick(policy)}
              className="group bg-white rounded-[2rem] border border-slate-100 p-1 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer overflow-hidden relative"
            >
              {canManage && (
                <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleEdit(policy, e)}
                    className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-primary hover:text-white transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(policy.id, e)}
                    className="p-2 bg-slate-100 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex flex-col md:flex-row h-full">
                {/* Visual Strip */}
                <div className="hidden md:flex w-24 bg-slate-50 flex-col items-center justify-center border-r border-slate-50 rounded-l-[1.8rem] group-hover:bg-primary/5 transition-colors">
                  <Users className="w-8 h-8 text-slate-300 group-hover:text-primary transition-colors duration-300" />
                </div>

                {/* Content */}
                <div className="flex-1 p-7 flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {policy.category}
                      </span>
                      {policy.doc_no && (
                        <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">
                          {policy.doc_no}
                        </span>
                      )}
                      {policy.status === 'Draft' && (
                        <span className="text-orange-400 text-[10px] font-black uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded">
                          Draft
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">
                      {policy.title}
                    </h3>

                    <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-2xl line-clamp-2">
                      {policy.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-8 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                    <div className="text-right hidden md:block">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Last Updated</p>
                      <div className="flex items-center justify-end gap-2 text-slate-700 font-bold text-xs">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {policy.updated_at ? new Date(policy.updated_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>

                    <button className="w-full md:w-auto px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-colors shadow-lg shadow-slate-900/20 group-hover:shadow-primary/30 flex items-center justify-center gap-2">
                      View Policy
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Editor Modal */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPolicy ? 'Edit Policy' : 'Create New Policy'}</DialogTitle>
            <DialogDescription>
              Fill in the details for the policy.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Policy Title *</Label>
                <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Leave Policy" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== 'All').map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief summary of the policy" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Full Content * (Markdown supported)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Full policy text..."
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input id="version" value={formData.version} onChange={(e) => setFormData({ ...formData, version: e.target.value })} placeholder="1.0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="effective_date">Effective Date</Label>
                <Input id="effective_date" type="date" value={formData.effective_date} onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Policy'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modern Document Viewer Modal */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl bg-[#f8fafc]">

          {/* Document Header Bar */}
          <div className="bg-white border-b border-slate-100 p-6 flex items-center justify-between sticky top-0 z-10 shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-sm leading-none mb-1">{selectedPolicy?.title}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedPolicy?.doc_no || 'INTERNAL DOC'}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsViewerOpen(false)}
              className="rounded-full hover:bg-slate-100"
            >
              Close Preview
            </Button>
          </div>

          <div className="flex flex-col md:flex-row h-full overflow-hidden">

            {/* Sidebar Info - Desktop */}
            <div className="hidden md:block w-64 bg-slate-50 border-r border-slate-100 p-8 overflow-y-auto shrink-0">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Details</h3>

              <div className="space-y-6">
                {selectedPolicy && (
                  <>
                    <div className="group">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Version</span>
                      <span className="text-sm font-semibold text-slate-700">{selectedPolicy.version}</span>
                    </div>
                    <div className="group">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Effective Date</span>
                      <span className="text-sm font-semibold text-slate-700">{selectedPolicy.effective_date ? new Date(selectedPolicy.effective_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <div className="group">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Prepared By</span>
                      <span className="text-sm font-semibold text-slate-700">{selectedPolicy.prepared_by || 'N/A'}</span>
                    </div>
                    <div className="group">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Approved By</span>
                      <span className="text-sm font-semibold text-slate-700">{selectedPolicy.approved_by || 'N/A'}</span>
                    </div>
                  </>
                )}
                <div className="pt-6 border-t border-slate-200/50">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                    <Shield className="w-4 h-4" />
                    Official Document
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <ScrollArea className="flex-1 h-[calc(90vh-80px)] bg-white">
              <div className="max-w-3xl mx-auto p-8 md:p-12">
                {/* Document Paper Effect */}
                <div className="bg-white">

                  {/* Document Title Header */}
                  <div className="border-b-2 border-slate-900 pb-6 mb-8 text-center">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight mb-4">
                      {selectedPolicy?.title}
                    </h1>
                    <div className="flex justify-center gap-8 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                      <span>{selectedPolicy?.category}</span>
                      <span>•</span>
                      <span>{selectedPolicy?.effective_date ? new Date(selectedPolicy.effective_date).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="prose prose-slate prose-headings:font-black prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:font-medium prose-p:leading-relaxed max-w-none">
                    {selectedPolicy?.content ? (
                      <div className="whitespace-pre-line text-justify">
                        {selectedPolicy.content}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <FileText className="w-16 h-16 mb-4 opacity-20" />
                        <p className="italic">Content unavailable</p>
                      </div>
                    )}
                  </div>

                  {/* Document Footer */}
                  <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    <span>Confidential - Internal Use Only</span>
                    <span>{selectedPolicy?.id}</span>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HRPolicy;
