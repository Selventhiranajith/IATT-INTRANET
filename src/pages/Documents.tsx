import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Files,
  Search,
  Upload,
  Download,
  Folder,
  FileText,
  FileImage,
  FileSpreadsheet,
  Trash2,
  MoreVertical,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'spreadsheet' | 'folder';
  size: string;
  modified: string;
  owner: string;
  shared: boolean;
  section?: 'admin' | 'management';
}

interface DocumentsProps {
  section?: 'admin' | 'management';
}

const Documents: React.FC<DocumentsProps> = ({ section }) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Admin Login State
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [showLoginModal, setShowLoginModal] = useState(section === 'admin');

  const allDocuments: Document[] = [
    // Standard Docs
    { id: '1', name: 'Company Policies', type: 'folder', size: '--', modified: 'Feb 1, 2024', owner: 'HR Team', shared: true },
    { id: '2', name: 'Q4 Financial Report.pdf', type: 'pdf', size: '2.4 MB', modified: 'Jan 28, 2024', owner: 'Finance', shared: false },
    // Admin Docs
    { id: 'a1', name: 'Employee Contracts.pdf', type: 'pdf', size: '12.4 MB', modified: 'Feb 3, 2024', owner: 'Admin', shared: false, section: 'admin' },
    { id: 'a2', name: 'Payroll 2024.xlsx', type: 'spreadsheet', size: '5.2 MB', modified: 'Feb 2, 2024', owner: 'Accounts', shared: false, section: 'admin' },
    { id: 'a3', name: 'Confidential Audit', type: 'folder', size: '--', modified: 'Jan 15, 2024', owner: 'Admin', shared: false, section: 'admin' },
    // Management Docs
    { id: 'm1', name: 'Strategy 2025.pptx', type: 'doc', size: '8.1 MB', modified: 'Feb 4, 2024', owner: 'Management', shared: true, section: 'management' },
    { id: 'm2', name: 'Board Meeting Minutes', type: 'folder', size: '--', modified: 'Jan 30, 2024', owner: 'CEO Office', shared: false, section: 'management' },

    { id: '3', name: 'Project Guidelines.docx', type: 'doc', size: '456 KB', modified: 'Jan 25, 2024', owner: 'PMO', shared: true },
    { id: '4', name: 'Employee Handbook.pdf', type: 'pdf', size: '3.2 MB', modified: 'Jan 20, 2024', owner: 'HR Team', shared: true },
    { id: '5', name: 'Inventory Sheet.xlsx', type: 'spreadsheet', size: '1.1 MB', modified: 'Jan 18, 2024', owner: 'Operations', shared: false },
    { id: '6', name: 'Brand Assets', type: 'folder', size: '--', modified: 'Jan 15, 2024', owner: 'Marketing', shared: true },
    { id: '7', name: 'Team Photo.jpg', type: 'image', size: '4.5 MB', modified: 'Jan 10, 2024', owner: 'HR Team', shared: true },
    { id: '8', name: 'Training Materials', type: 'folder', size: '--', modified: 'Jan 5, 2024', owner: 'Learning', shared: true },
  ];

  // Filter documents based on section
  const documents = allDocuments.filter(doc => {
    if (!section) return !doc.section;
    return doc.section === section;
  });

  const getFileIcon = (type: string) => {
    const icons: Record<string, { icon: React.ElementType; color: string }> = {
      folder: { icon: Folder, color: 'text-amber-400' },
      pdf: { icon: FileText, color: 'text-red-400' },
      doc: { icon: FileText, color: 'text-orange-400' },
      image: { icon: FileImage, color: 'text-purple-400' },
      spreadsheet: { icon: FileSpreadsheet, color: 'text-green-400' },
    };
    return icons[type] || { icon: FileText, color: 'text-white/60' };
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.username === 'admin' && loginData.password === 'admin123') {
      setIsAdminAuth(true);
      setShowLoginModal(false);
      toast.success("Authenticated Successfully");
    } else {
      toast.error("Invalid Admin Credentials");
    }
  };

  // If section is admin and not authenticated, show nothing but the modal handler
  if (section === 'admin' && !isAdminAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Dialog open={showLoginModal} onOpenChange={(open) => {
          if (!open) navigate('/dashboard');
        }}>
          <DialogContent className="sm:max-w-[400px] border-none shadow-2xl rounded-[2.5rem] p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight text-center">Admin Access</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdminLogin} className="space-y-6 py-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Username</Label>
                <Input
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  placeholder="Enter admin username"
                  className="rounded-xl border-slate-100 h-12 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</Label>
                <Input
                  type="password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="••••••••"
                  className="rounded-xl border-slate-100 h-12 font-bold"
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 font-black uppercase tracking-widest">
                Login to Admin Panel
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400 animate-pulse">
            <Eye className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Protected Section</h2>
          <p className="text-slate-500">Please authenticate to view admin documents.</p>
          <Button variant="outline" onClick={() => setShowLoginModal(true)} className="rounded-xl">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-primary/10">
            <Files className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight capitalize">
              {section || 'All'} Documents
            </h1>
            <p className="text-slate-500 font-medium mt-1">Access and manage {section || 'company'} level files</p>
          </div>
        </div>
        {isAdmin && (
          <button className="px-8 py-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-3 font-black uppercase tracking-[0.2em] text-sm">
            <Upload className="w-5 h-5" />
            Upload Document
          </button>
        )}
      </div>

      {/* Search & Filters Toolbar */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-50 text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:bg-white focus:border-primary/20 transition-all shadow-inner"
            />
          </div>
          <div className="flex items-center gap-3">
            {['All Files', 'Shared', 'Recent'].map((label, idx) => (
              <button
                key={label}
                className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${idx === 0 ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-white border border-slate-100 text-slate-500 hover:bg-slate-50'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: 'Total Files', value: documents.length, icon: Files, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'Shared Files', value: documents.filter(d => d.shared).length, icon: Files, color: 'text-sky-500', bg: 'bg-sky-50' },
          { label: 'Folders', value: documents.filter(d => d.type === 'folder').length, icon: Folder, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Storage Used', value: '2.4 GB', icon: Files, color: 'text-emerald-500', bg: 'bg-emerald-50' },
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

      {/* Documents List Table */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/30">
              <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Name</th>
              <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px] hidden md:table-cell">Owner</th>
              <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px] hidden md:table-cell">Modified</th>
              <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px] hidden sm:table-cell">Size</th>
              <th className="text-right py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.length > 0 ? documents.map((doc) => {
              const { icon: FileIcon, color } = getFileIcon(doc.type);

              return (
                <tr key={doc.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group">
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors">
                        <FileIcon className={`w-6 h-6 ${color}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 font-black tracking-tight group-hover:text-primary transition-colors truncate">{doc.name}</span>
                          {doc.shared && (
                            <span className="shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary">
                              Shared
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest mt-0.5 md:hidden">{doc.owner} • {doc.modified}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-8 text-slate-500 font-bold hidden md:table-cell">{doc.owner}</td>
                  <td className="py-6 px-8 text-slate-400 font-medium hidden md:table-cell">{doc.modified}</td>
                  <td className="py-6 px-8 hidden sm:table-cell">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-200/50">{doc.size}</span>
                  </td>
                  <td className="py-6 px-8">
                    <div className="flex items-center justify-end gap-3">
                      {doc.type !== 'folder' && (
                        <button className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary transition-all">
                          <Download className="w-4.5 h-4.5" />
                        </button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all">
                            <MoreVertical className="w-4.5 h-4.5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 min-w-[160px]">
                          <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl text-slate-600 font-bold focus:bg-primary/5 focus:text-primary cursor-pointer">
                            <Eye className="w-4 h-4" />
                            {doc.type === 'folder' ? 'Open Folder' : 'Preview File'}
                          </DropdownMenuItem>
                          {doc.type !== 'folder' && (
                            <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl text-slate-600 font-bold focus:bg-primary/5 focus:text-primary cursor-pointer">
                              <Download className="w-4 h-4" />
                              Download
                            </DropdownMenuItem>
                          )}
                          {isAdmin && (
                            <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-xl text-red-500 font-black uppercase tracking-widest text-[10px] focus:bg-red-50 focus:text-red-500 cursor-pointer border-t border-slate-50 mt-2">
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto text-slate-300 mb-4">
                    <Files className="w-8 h-8" />
                  </div>
                  <p className="text-slate-500 font-bold">No documents found in this section.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Documents;
