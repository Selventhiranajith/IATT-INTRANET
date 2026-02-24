import { useAuth } from "@/contexts/AuthContext";
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { api as apiClient, mediaUrl } from '@/lib/api';
import { ShieldCheck, UserPlus, Search, Edit2, Trash2, Mail, Building2, Loader2, Key, Phone, User as UserIcon, MapPin, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";

interface User {
  id: string;
  employee_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  branch?: string;
  department: string;
  position: string;
  status: string;
  birth_date?: string;
  last_login?: string;
}

const UserManagement: React.FC = () => {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    employee_id: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'employee',
    branch: 'Guindy',
    department: '',
    position: '',
    birth_date: '',
    phone: ''
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<any>('/auth/admin/users');
      if (data.success) {
        setUsers(data.data.users);
      } else {
        toast.error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
      toast.error(error instanceof Error ? error.message : 'Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (currentUser && !isSuperAdmin && currentUser.branch) {
      setFormData(prev => ({ ...prev, branch: currentUser.branch || 'Guindy' }));
    }
  }, [currentUser, isSuperAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleBranchChange = (value: string) => {
    setFormData(prev => ({ ...prev, branch: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingUser(true);
    try {
      const payload = { ...formData };
      const data = await apiClient.post<any>('/auth/admin/users', payload);

      if (data.success) {
        toast.success('User created successfully');
        setIsModalOpen(false);
        setFormData({
          employee_id: '',
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          role: 'employee',
          branch: 'Guindy',
          department: '',
          position: '',
          birth_date: '',
          phone: ''
        });
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Create user error:', error);
      toast.error(error instanceof Error ? error.message : 'Error connecting to server');
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const data = await apiClient.delete<any>(`/auth/admin/users/${id}`);
      if (data.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error(error instanceof Error ? error.message : 'Error connecting to server');
    }
  };

  const handleEdit = (user: User) => {
    // For now, just a toast or basic prep
    toast.info(`Editing ${user.first_name}... (Feature coming soon)`);
  };

  const filteredUsers = users.filter(user =>
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.employee_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-primary/10">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h1>
            <p className="text-slate-500 font-medium mt-1">Manage system access and roles</p>
          </div>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <button className="px-8 py-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-3 font-black uppercase tracking-[0.2em] text-sm">
              <UserPlus className="w-5 h-5" />
              Add User
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
            <div className="bg-primary p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <DialogHeader className="relative z-10">
                <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                  <UserPlus className="w-8 h-8" />
                  Create New User
                </DialogTitle>
                <p className="text-primary-foreground/80 font-medium mt-2">Enter credentials and details for the new employee</p>
              </DialogHeader>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest pl-1">Employee ID</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input name="employee_id" value={formData.employee_id} onChange={handleInputChange} placeholder="EMP001" className="pl-12 h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest pl-1">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="email@company.com" required className="pl-12 h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest pl-1">First Name</Label>
                  <Input name="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="John" required className="h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest pl-1">Last Name</Label>
                  <Input name="last_name" value={formData.last_name} onChange={handleInputChange} placeholder="Doe" required className="h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest pl-1">Temporary Password</Label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input name="password" type="text" value={formData.password} onChange={handleInputChange} placeholder="••••••••" required className="pl-12 h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest pl-1">Role</Label>
                  <Select onValueChange={handleRoleChange} value={formData.role}>
                    <SelectTrigger className="h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="hr">HR Personnel</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      {isSuperAdmin && <SelectItem value="superadmin">Superadmin</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>

                {isSuperAdmin ? (
                  <div className="space-y-2">
                    <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest pl-1">Branch</Label>
                    <Select onValueChange={handleBranchChange} value={formData.branch}>
                      <SelectTrigger className="h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold">
                        <SelectValue placeholder="Select Branch" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                        <SelectItem value="Guindy">Guindy</SelectItem>
                        <SelectItem value="Nungambakkam">Nungambakkam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest pl-1">Branch</Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input value={currentUser?.branch || 'Your Branch'} disabled className="pl-12 h-14 rounded-xl border-slate-100 bg-slate-100 text-slate-500 font-bold" />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest pl-1">Department</Label>
                  <Input name="department" value={formData.department} onChange={handleInputChange} placeholder="IT / Sales / HR" className="h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest pl-1">Position</Label>
                  <Input name="position" value={formData.position} onChange={handleInputChange} placeholder="Junior Developer" className="h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest pl-1">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input name="birth_date" type="date" value={formData.birth_date} onChange={handleInputChange} className="pl-12 h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest pl-1">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 XXXX XXXX" className="pl-12 h-14 rounded-xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all font-bold" />
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button type="submit" disabled={isAddingUser} className="w-full h-16 rounded-[1.25rem] bg-primary text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-3">
                  {isAddingUser ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating User...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Register User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Users', value: users.length.toString(), color: 'bg-blue-500' },
          { label: 'Admin Roles', value: users.filter(u => u.role === 'admin' || u.role === 'SUPERADMIN').length.toString(), color: 'bg-primary' },
          { label: 'Active Status', value: users.filter(u => u.status === 'active').length.toString(), color: 'bg-emerald-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm transition-all hover:shadow-md group">
            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">{stat.label}</p>
            <p className="text-4xl font-black text-slate-900 mt-2 tracking-tighter group-hover:scale-105 transition-transform origin-left">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all font-medium"
            />
          </div>
          <div className="flex gap-4">
            <select className="px-6 py-4 rounded-2xl bg-slate-50 border-transparent font-bold text-sm text-slate-600 focus:bg-white focus:border-primary/20 transition-all outline-none cursor-pointer">
              <option>All Roles</option>
              <option>Admin</option>
              <option>Employee</option>
              <option>Manager</option>
              <option>HR</option>
            </select>
            <select className="px-6 py-4 rounded-2xl bg-slate-50 border-transparent font-bold text-sm text-slate-600 focus:bg-white focus:border-primary/20 transition-all outline-none cursor-pointer">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Personnel Data...</p>
            </div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-4">
              <thead>
                <tr className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
                  <th className="px-8 pb-4">User</th>
                  <th className="px-8 pb-4">Role</th>
                  <th className="px-8 pb-4">Department</th>
                  <th className="px-8 pb-4">Status</th>
                  {isSuperAdmin && <th className="px-8 pb-4">Last Login</th>}
                  <th className="px-8 pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                  <tr key={user.id} className="group transition-all">
                    <td className="bg-slate-50/50 group-hover:bg-primary/5 rounded-l-[1.5rem] px-8 py-6 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center font-black text-primary uppercase">
                          {user.first_name[0]}
                        </div>
                        <div>
                          <p className="text-slate-900 font-black tracking-tight">{user.first_name} {user.last_name}</p>
                          <p className="text-slate-400 text-xs font-bold flex items-center gap-1 mt-1">
                            {user.branch && (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-500 mr-1 uppercase">
                                <MapPin className="w-2.5 h-2.5" />
                                {user.branch}
                              </span>
                            )}
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="bg-slate-50/50 group-hover:bg-primary/5 px-8 py-6 transition-all">
                      <span className={`px-4 py-1.5 rounded-xl font-black text-[10px] tracking-widest uppercase ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-600'
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="bg-slate-50/50 group-hover:bg-primary/5 px-8 py-6 transition-all">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                        <Building2 className="w-4 h-4 opacity-50" />
                        {user.department || 'N/A'}
                      </div>
                    </td>
                    <td className="bg-slate-50/50 group-hover:bg-primary/5 px-8 py-6 transition-all">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        <span className={`font-bold text-sm ${user.status === 'active' ? 'text-emerald-500' : 'text-slate-400'}`}>
                          {user.status}
                        </span>
                      </div>
                    </td>
                    {isSuperAdmin && (
                      <td className="bg-slate-50/50 group-hover:bg-primary/5 px-8 py-6 transition-all">
                        <div className="flex flex-col gap-1">
                          <p className="text-slate-900 font-bold text-xs uppercase tracking-tight">
                            {user.last_login ? format(new Date(user.last_login), 'MMM d, yyyy') : 'Never'}
                          </p>
                          {user.last_login && (
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {format(new Date(user.last_login), 'hh:mm a')}
                            </p>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="bg-slate-50/50 group-hover:bg-primary/5 rounded-r-[1.5rem] px-8 py-6 text-right transition-all">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-3 rounded-xl bg-white text-slate-400 hover:text-primary hover:shadow-lg border border-transparent hover:border-slate-100 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-3 rounded-xl bg-white text-slate-400 hover:text-red-500 hover:shadow-lg border border-transparent hover:border-slate-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-400 font-bold">
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Helper Icons ── */
const Clock = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default UserManagement;
