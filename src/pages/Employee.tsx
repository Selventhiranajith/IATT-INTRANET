import React, { useState, useEffect } from 'react';
import { User, Search, Filter, Grid, List, Plus, Edit2, Trash2, Mail, Briefcase, Building2, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';
import { authApi } from '@/api';

interface Employee {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  name: string;
  role: string;
  category: 'Admin' | 'User';
  department: string;
  branch: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  birth_date: string;
  phone: string;
  joinDate: string;
  image?: string;
}

const EmployeePage: React.FC = () => {
  const { user, isAdmin: isAuthAdmin } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const data = await authApi.getUsers();
      if (data.success) {
        let mappedEmployees: Employee[] = data.data.users.map((user: any) => ({
          id: user.id.toString(),
          employee_id: user.employee_id || 'N/A',
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          name: `${user.first_name} ${user.last_name}`,
          role: user.position || 'Staff',
          category: (user.role === 'admin' || user.role === 'manager' || user.role === 'hr') ? 'Admin' : 'User',
          department: user.department || 'General',
          branch: user.branch || 'None',
          email: user.email,
          status: user.status === 'suspended' ? 'suspended' : (user.status === 'active' ? 'active' : 'inactive'),
          birth_date: user.birth_date || '',
          phone: user.phone || '',
          joinDate: user.created_at || new Date().toISOString()
        }));
        setEmployees(mappedEmployees);
      } else {
        toast.error(data.message || 'Failed to fetch employees');
      }
    } catch (error) {
      console.error('Fetch employees error:', error);
      toast.error('Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [user]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<{
    employee_id: string;
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
    department: string;
    position: string;
    branch: string;
    birth_date: string;
    phone: string;
  }>({
    employee_id: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'employee',
    department: '',
    position: '',
    branch: user?.branch || '',
    birth_date: '',
    phone: ''
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [editEmployee, setEditEmployee] = useState<{
    employee_id: string;
    email: string;
    first_name: string;
    last_name: string;
    department: string;
    position: string;
    branch: string;
    birth_date: string;
    phone: string;
    status: 'active' | 'inactive' | 'suspended';
  }>({
    employee_id: '',
    email: '',
    first_name: '',
    last_name: '',
    department: '',
    position: '',
    branch: '',
    birth_date: '',
    phone: '',
    status: 'active',
  });

  useEffect(() => {
    if (user?.branch) {
      setNewEmployee(prev => ({ ...prev, branch: user.branch! }));
    }
  }, [user]);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.email || !newEmployee.first_name || !newEmployee.last_name || !newEmployee.password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const data = await authApi.createUser(newEmployee);
      if (data.success) {
        toast.success("Employee registered successfully!");
        setIsAddModalOpen(false);
        setNewEmployee({
          employee_id: '',
          email: '',
          password: '',
          first_name: '',
          last_name: '',
          role: 'employee',
          department: '',
          position: '',
          branch: user?.branch || '',
          birth_date: '',
          phone: ''
        });
        fetchEmployees();
      } else {
        toast.error(data.message || "Failed to register employee");
      }
    } catch (error) {
      toast.error("Error connecting to server");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'suspended':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'inactive':
        return 'bg-red-50 text-red-600 border-red-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getCardGradient = (status: string) => {
    switch (status) {
      case 'active':
        return 'from-emerald-50 via-cyan-50 to-white';
      case 'suspended':
        return 'from-amber-50 via-orange-50 to-white';
      case 'inactive':
        return 'from-rose-50 via-red-50 to-white';
      default:
        return 'from-white via-slate-50 to-white';
    }
  };

  const handleOpenEditModal = (employee: Employee) => {
    setEditingEmployeeId(employee.id);
    setEditEmployee({
      employee_id: employee.employee_id === 'N/A' ? '' : employee.employee_id,
      email: employee.email,
      first_name: employee.first_name,
      last_name: employee.last_name,
      department: employee.department === 'General' ? '' : employee.department,
      position: employee.role === 'Staff' ? '' : employee.role,
      branch: employee.branch || '',
      birth_date: employee.birth_date ? employee.birth_date.slice(0, 10) : '',
      phone: employee.phone || '',
      status: employee.status,
    });
    setIsEditModalOpen(true);
  };

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployeeId) return;

    if (!editEmployee.email || !editEmployee.first_name || !editEmployee.last_name) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const data = await authApi.updateUser(editingEmployeeId, editEmployee);
      if (data.success) {
        toast.success("Employee updated successfully!");
        setIsEditModalOpen(false);
        setEditingEmployeeId(null);
        fetchEmployees();
      } else {
        toast.error(data.message || "Failed to update employee");
      }
    } catch (error) {
      toast.error("Error connecting to server");
    }
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    const confirmed = window.confirm(`Delete ${employee.name}? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      const data = await authApi.deleteUser(employee.id);
      if (data.success) {
        toast.success("Employee deleted successfully!");
        fetchEmployees();
      } else {
        toast.error(data.message || "Failed to delete employee");
      }
    } catch (error) {
      toast.error("Error connecting to server");
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminEmployees = filteredEmployees.filter(emp => emp.category === 'Admin');
  const userEmployees = filteredEmployees.filter(emp => emp.category === 'User');
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const departmentsCount = new Set(employees.map(emp => emp.department)).size;

  const renderEmployeeGrid = (empList: Employee[]) => (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {empList.map((employee) => (
        <div key={employee.id} className={`group relative overflow-hidden rounded-[1.6rem] border border-slate-200/70 bg-gradient-to-br ${getCardGradient(employee.status)} p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/30 flex flex-col`}>
          <div className="pointer-events-none absolute -right-16 -top-14 h-40 w-40 rounded-full bg-white/50 blur-2xl" />
          {/* Employee Avatar Area */}
          <div className="relative mb-5 flex items-start justify-between">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 transition-colors group-hover:bg-primary/5">
              <User className="h-7 w-7 text-slate-400 transition-colors group-hover:text-primary" />
            </div>
            <div className={`rounded-full border px-3.5 py-1 text-[9px] font-black uppercase tracking-[0.16em] shadow-sm ${getStatusBadge(employee.status)}`}>
              {employee.status.replace('-', ' ')}
            </div>
          </div>

          {/* Employee Info */}
          <div className="flex flex-1 flex-col space-y-5">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-black leading-tight tracking-tight text-slate-900 transition-colors group-hover:text-primary">{employee.name}</h3>
              <p className="mt-1 text-sm font-bold text-primary">{employee.role}</p>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-slate-500">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-sm font-semibold">{employee.department}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-500">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate text-sm font-semibold">{employee.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-sm font-semibold">Joined {new Date(employee.joinDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                ID: {employee.employee_id}
              </span>
              {isAuthAdmin && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(employee)}
                    className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 p-2 text-white shadow-md shadow-cyan-500/25 transition-all hover:from-cyan-600 hover:to-blue-600"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(employee)}
                    className="rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 p-2 text-white shadow-md shadow-rose-500/25 transition-all hover:from-rose-600 hover:to-orange-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEmployeeList = (empList: Employee[]) => (
    <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Employee</th>
              <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Role / Dept</th>
              <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Email</th>
              <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Join Date</th>
              <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Status</th>
              {isAuthAdmin && <th className="text-right py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {empList.map((employee) => (
              <tr key={employee.id} className="group border-b border-slate-100 transition-colors hover:bg-slate-50/80">
                <td className="py-6 px-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 transition-colors group-hover:bg-white">
                      <User className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-black tracking-tight">{employee.name}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID: {employee.employee_id}</span>
                    </div>
                  </div>
                </td>
                <td className="py-6 px-8">
                  <div className="flex flex-col">
                    <span className="text-slate-900 font-bold text-sm">{employee.role}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{employee.department}</span>
                  </div>
                </td>
                <td className="py-6 px-8 text-slate-500 font-medium text-sm">{employee.email}</td>
                <td className="py-6 px-8 text-slate-500 font-medium text-sm">{new Date(employee.joinDate).toLocaleDateString()}</td>
                <td className="py-6 px-8">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm ${getStatusBadge(employee.status)}`}>
                    {employee.status.replace('-', ' ')}
                  </span>
                </td>
                {isAuthAdmin && (
                  <td className="py-6 px-8">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => handleOpenEditModal(employee)}
                        className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 p-2.5 text-white shadow-md shadow-cyan-500/20 transition-all hover:from-cyan-600 hover:to-blue-600"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(employee)}
                        className="rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 p-2.5 text-white shadow-md shadow-rose-500/20 transition-all hover:from-rose-600 hover:to-orange-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-sky-300/40 bg-gradient-to-br from-[#162d6b] via-[#135f8f] to-[#0f8d7f] p-7 text-white shadow-xl shadow-sky-900/20">
        <div className="pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              <Briefcase className="h-3.5 w-3.5" />
              Workforce Control
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/15 p-3 backdrop-blur">
                <User className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                  {user?.branch ? `${user.branch} Branch ` : ""}Employees
                </h1>
                <p className="mt-1 text-sm font-medium text-cyan-50/95">Manage, search, and onboard team members in one place</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="rounded-full border border-white/35 bg-white/15 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-white">
                Total {employees.length}
              </div>
              <div className="rounded-full border border-emerald-200/50 bg-emerald-300/20 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-50">
                Active {activeEmployees}
              </div>
              <div className="rounded-full border border-sky-200/50 bg-sky-200/20 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-sky-50">
                Departments {departmentsCount}
              </div>
            </div>
          </div>
          {isAuthAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-3 rounded-2xl border border-white/30 bg-gradient-to-r from-fuchsia-500 to-orange-400 px-6 py-3 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-fuchsia-500/30 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-fuchsia-500/40 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/25">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Admins</p>
            <div className="rounded-xl border border-primary/15 bg-primary/10 p-2 text-primary">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <p className="relative mt-3 text-4xl font-black tracking-tight text-slate-900">{adminEmployees.length}</p>
          <div className="relative mt-3 h-1.5 w-20 rounded-full bg-gradient-to-r from-primary to-amber-400" />
          <p className="relative mt-3 text-sm font-semibold text-slate-500">Administrative users</p>
        </div>
        <div className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-gradient-to-br from-white via-white to-emerald-50/30 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-200/35">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-200/40 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Members</p>
            <div className="rounded-xl border border-emerald-200 bg-emerald-100/70 p-2 text-emerald-700">
              <User className="h-4 w-4" />
            </div>
          </div>
          <p className="relative mt-3 text-4xl font-black tracking-tight text-slate-900">{userEmployees.length}</p>
          <div className="relative mt-3 h-1.5 w-20 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
          <p className="relative mt-3 text-sm font-semibold text-slate-500">Standard employee accounts</p>
        </div>
        <div className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-gradient-to-br from-white via-white to-sky-50/50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-200/35">
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-sky-200/45 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Departments</p>
            <div className="rounded-xl border border-sky-200 bg-sky-100/80 p-2 text-sky-700">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="relative mt-3 text-4xl font-black tracking-tight text-slate-900">{departmentsCount}</p>
          <div className="relative mt-3 h-1.5 w-20 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" />
          <p className="relative mt-3 text-sm font-semibold text-slate-500">Unique teams in directory</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-gradient-to-r from-white via-slate-50 to-white p-2.5 shadow-sm">
        <div className="pointer-events-none absolute -top-20 left-1/3 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-3 md:flex-row md:items-center">
          <div className="group relative flex-1 rounded-[1.45rem] border border-slate-200/80 bg-white/95 px-1.5 py-1.5 shadow-[inset_0_1px_10px_rgba(15,23,42,0.06)] transition-all focus-within:border-primary/40 focus-within:shadow-[0_0_0_4px_rgba(249,115,22,0.14)]">
            <div className="pointer-events-none absolute left-3.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-focus-within:bg-primary/10 group-focus-within:text-primary">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employees by name, email, role..."
              className="h-10 w-full rounded-xl border border-transparent bg-transparent pl-12 pr-3 text-sm font-bold tracking-tight text-slate-800 placeholder:text-slate-400/90 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="h-10 rounded-[1.2rem] border border-slate-200/90 bg-white px-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </button>

            <div className="flex items-center gap-1 rounded-[1.2rem] border border-slate-200/90 bg-slate-100/90 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`h-9 w-9 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm ring-1 ring-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid className="mx-auto h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`h-9 w-9 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm ring-1 ring-primary/20' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="mx-auto h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Fetching Team Data...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {adminEmployees.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1.5 bg-primary rounded-full" />
                  <h2 className="text-lg font-black uppercase tracking-widest text-slate-500">Admin</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{adminEmployees.length} members</span>
              </div>
              {viewMode === 'grid' ? renderEmployeeGrid(adminEmployees) : renderEmployeeList(adminEmployees)}
            </div>
          )}

          {userEmployees.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-1.5 bg-slate-300 rounded-full" />
                  <h2 className="text-lg font-black uppercase tracking-widest text-slate-500">User</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">{userEmployees.length} members</span>
              </div>
              {viewMode === 'grid' ? renderEmployeeGrid(userEmployees) : renderEmployeeList(userEmployees)}
            </div>
          )}

          {filteredEmployees.length === 0 && (
            <div className="rounded-[2.5rem] border border-slate-200 bg-white p-20 text-center shadow-sm">
              <p className="text-slate-500 font-bold uppercase tracking-widest">No employees found.</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Employee Modal */}
      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) setEditingEmployeeId(null);
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white flex flex-col">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-8 text-white shrink-0">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-white tracking-tight">Edit Employee</DialogTitle>
              <p className="text-white/85 font-medium">Update employee details</p>
            </DialogHeader>
          </div>

          <form onSubmit={handleEditEmployee} className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Employee ID</Label>
                <Input
                  placeholder="EMP001"
                  value={editEmployee.employee_id}
                  onChange={(e) => setEditEmployee({ ...editEmployee, employee_id: e.target.value })}
                  className="rounded-xl h-12 font-bold bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Email</Label>
                <Input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={editEmployee.email}
                  onChange={(e) => setEditEmployee({ ...editEmployee, email: e.target.value })}
                  className="rounded-xl h-12 font-bold bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">First Name</Label>
                <Input
                  required
                  placeholder="First name"
                  value={editEmployee.first_name}
                  onChange={(e) => setEditEmployee({ ...editEmployee, first_name: e.target.value })}
                  className="rounded-xl h-12 font-bold bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Last Name</Label>
                <Input
                  required
                  placeholder="Last name"
                  value={editEmployee.last_name}
                  onChange={(e) => setEditEmployee({ ...editEmployee, last_name: e.target.value })}
                  className="rounded-xl h-12 font-bold bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Department</Label>
                <Input
                  placeholder="e.g. Operations"
                  value={editEmployee.department}
                  onChange={(e) => setEditEmployee({ ...editEmployee, department: e.target.value })}
                  className="rounded-xl h-12 font-bold bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Position</Label>
                <Input
                  placeholder="e.g. Branch Manager"
                  value={editEmployee.position}
                  onChange={(e) => setEditEmployee({ ...editEmployee, position: e.target.value })}
                  className="rounded-xl h-12 font-bold bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Phone Number</Label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={editEmployee.phone}
                  onChange={(e) => setEditEmployee({ ...editEmployee, phone: e.target.value })}
                  className="rounded-xl h-12 font-bold bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Date of Birth</Label>
                <Input
                  type="date"
                  value={editEmployee.birth_date}
                  onChange={(e) => setEditEmployee({ ...editEmployee, birth_date: e.target.value })}
                  className="rounded-xl h-12 font-bold bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Status</Label>
              <Select
                value={editEmployee.status}
                onValueChange={(value: 'active' | 'inactive' | 'suspended') => setEditEmployee({ ...editEmployee, status: value })}
              >
                <SelectTrigger className="rounded-xl h-12 font-bold bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4 gap-3 sm:w-full sm:justify-end">
              <Button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-full font-black uppercase text-[11px] tracking-widest h-11 px-7 shadow-md shadow-cyan-500/30"
              >
                Update Employee
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Employee Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white flex flex-col">
          <div className="bg-primary p-8 text-white shrink-0">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-white tracking-tight">Register Employee</DialogTitle>
              <p className="text-primary-foreground/80 font-medium">Add a new member to your organization</p>
            </DialogHeader>
          </div>

          <form onSubmit={handleAddEmployee} className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Employee ID</Label>
                <Input
                  placeholder="EMP001"
                  value={newEmployee.employee_id}
                  onChange={(e) => setNewEmployee({ ...newEmployee, employee_id: e.target.value })}
                  className="rounded-xl h-12 font-bold bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Email</Label>
                <Input
                  type="email"
                  placeholder="name@company.com"
                  required
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  className="rounded-xl h-12 font-bold bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">First Name</Label>
                <Input
                  placeholder="First name"
                  required
                  value={newEmployee.first_name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, first_name: e.target.value })}
                  className="rounded-xl h-12 font-bold bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Last Name</Label>
                <Input
                  placeholder="Last name"
                  required
                  value={newEmployee.last_name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, last_name: e.target.value })}
                  className="rounded-xl h-12 font-bold bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Temporary Password</Label>
              <Input
                type="text"
                placeholder="Set password"
                required
                value={newEmployee.password}
                onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                className="rounded-xl h-12 font-bold bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Date of Birth</Label>
                <Input
                  type="date"
                  value={newEmployee.birth_date}
                  onChange={(e) => setNewEmployee({ ...newEmployee, birth_date: e.target.value })}
                  className="rounded-xl h-12 font-bold bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Phone Number</Label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={newEmployee.phone}
                  onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                  className="rounded-xl h-12 font-bold bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Department</Label>
                <Input
                  placeholder="e.g. Engineering"
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                  className="rounded-xl h-12 font-bold bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Position</Label>
                <Input
                  placeholder="e.g. Lead Dev"
                  value={newEmployee.position}
                  onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                  className="rounded-xl h-12 font-bold bg-slate-50 border-transparent focus:bg-white focus:border-primary/20 transition-all"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 gap-3 sm:w-full sm:justify-end">
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-white rounded-full font-black uppercase text-[11px] tracking-widest h-11 px-7 shadow-md shadow-primary/30"
              >
                Create Employee
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeePage;