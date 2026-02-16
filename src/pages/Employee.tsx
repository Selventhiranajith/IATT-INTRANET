import React, { useState, useEffect } from 'react';
import { User, Search, Filter, Grid, List, Plus, Edit2, Trash2, Mail, Briefcase, Building2, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Employee {
  id: string;
  employee_id: string;
  name: string;
  role: string;
  category: 'Admin' | 'User';
  department: string;
  email: string;
  status: 'active' | 'on-leave' | 'inactive';
  joinDate: string;
  image?: string;
}

const EmployeePage: React.FC = () => {
  const { isAdmin: isAuthAdmin } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const mappedEmployees: Employee[] = data.data.users.map((user: any) => ({
          id: user.id.toString(),
          employee_id: user.employee_id || 'N/A',
          name: `${user.first_name} ${user.last_name}`,
          role: user.position || 'Staff',
          category: user.role === 'admin' ? 'Admin' : 'User',
          department: user.department || 'General',
          email: user.email,
          status: user.status === 'active' ? 'active' : 'inactive',
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
    fetchEmployees();
  }, []);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    employee_id: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'employee',
    department: '',
    position: '',
    birth_date: '',
    phone: ''
  });

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployee.email || !newEmployee.first_name || !newEmployee.last_name || !newEmployee.password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEmployee)
      });

      const data = await response.json();

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
      case 'on-leave':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'inactive':
        return 'bg-red-50 text-red-600 border-red-100';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
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

  const renderEmployeeGrid = (empList: Employee[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {empList.map((employee) => (
        <div key={employee.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group flex flex-col">
          {/* Employee Avatar Area */}
          <div className="flex items-start justify-between mb-6">
            <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center group-hover:bg-primary/5 transition-colors relative overflow-hidden border border-slate-100">
              <User className="w-10 h-10 text-slate-300 group-hover:text-primary transition-colors" />
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm ${getStatusBadge(employee.status)}`}>
              {employee.status.replace('-', ' ')}
            </div>
          </div>

          {/* Employee Info */}
          <div className="space-y-6 flex-1 flex flex-col">
            <div className="min-w-0">
              <h3 className="text-slate-900 font-black text-xl tracking-tight leading-tight group-hover:text-primary transition-colors truncate">{employee.name}</h3>
              <p className="text-primary font-bold text-sm mt-1">{employee.role}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-500">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium">{employee.department}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium truncate">{employee.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium">Joined {new Date(employee.joinDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                ID: {employee.employee_id}
              </span>
              {isAuthAdmin && (
                <div className="flex items-center gap-2">
                  <button className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-500 transition-all">
                    <Trash2 className="w-4 h-4" />
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
    <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
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
              <tr key={employee.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                <td className="py-6 px-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
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
                      <button className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary transition-all">
                        <Edit2 className="w-4.5 h-4.5" />
                      </button>
                      <button className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-500 transition-all">
                        <Trash2 className="w-4.5 h-4.5" />
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
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-primary/10">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Employees</h1>
            <p className="text-slate-500 font-medium mt-1">Manage and view your team members</p>
          </div>
        </div>
        {isAuthAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-8 py-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-3 font-black uppercase tracking-[0.2em] text-sm"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employees by name, email, role..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-50 text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:bg-white focus:border-primary/20 transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="px-6 py-4 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 hover:bg-slate-50 transition-all">
              <Filter className="w-4 h-4" />
              Filters
            </button>

            <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-slate-100/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="w-5 h-5" />
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
              <div className="flex items-center gap-3">
                <div className="h-6 w-1.5 bg-primary rounded-full" />
                <h2 className="text-lg font-black uppercase tracking-widest text-slate-400">Admin</h2>
              </div>
              {viewMode === 'grid' ? renderEmployeeGrid(adminEmployees) : renderEmployeeList(adminEmployees)}
            </div>
          )}

          {userEmployees.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1.5 bg-slate-200 rounded-full" />
                <h2 className="text-lg font-black uppercase tracking-widest text-slate-400">User</h2>
              </div>
              {viewMode === 'grid' ? renderEmployeeGrid(userEmployees) : renderEmployeeList(userEmployees)}
            </div>
          )}

          {filteredEmployees.length === 0 && (
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-20 text-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest">No employees found.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Employee Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
          <div className="bg-primary p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-white tracking-tight">Register Employee</DialogTitle>
              <p className="text-primary-foreground/80 font-medium">Add a new member to your organization</p>
            </DialogHeader>
          </div>

          <form onSubmit={handleAddEmployee} className="p-8 space-y-6">
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

            <DialogFooter className="pt-4 gap-4">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl font-black uppercase text-xs tracking-widest h-14 flex-1">Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-xl font-black uppercase text-xs tracking-widest h-14 flex-1 shadow-lg shadow-primary/25">Create Employee</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeePage;
