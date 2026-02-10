import React, { useState } from 'react';
import { Cake, Plus, Calendar, Edit2, Trash2, X, Check, Gift, PartyPopper, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Birthday {
  id: string;
  name: string;
  date: string;
  department: string;
  email: string;
}

const Birthday: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [newBirthday, setNewBirthday] = useState({ 
    name: '', 
    date: undefined as Date | undefined, 
    department: '', 
    email: '' 
  });

  const [birthdays, setBirthdays] = useState<Birthday[]>([
    { id: '1', name: 'Sarah Johnson', date: 'Feb 2', department: 'Marketing', email: 'sarah.j@iatt.com' },
    { id: '2', name: 'Mike Chen', date: 'Feb 2', department: 'Engineering', email: 'mike.c@iatt.com' },
    { id: '3', name: 'Emily Davis', date: 'Feb 5', department: 'HR', email: 'emily.d@iatt.com' },
    { id: '4', name: 'Alex Thompson', date: 'Feb 12', department: 'Sales', email: 'alex.t@iatt.com' },
    { id: '5', name: 'Lisa Wang', date: 'Feb 18', department: 'Design', email: 'lisa.w@iatt.com' },
    { id: '6', name: 'John Doe', date: 'Feb 25', department: 'Engineering', email: 'john.d@iatt.com' },
    { id: '7', name: 'Maria Garcia', date: 'Mar 3', department: 'Finance', email: 'maria.g@iatt.com' },
    { id: '8', name: 'David Kim', date: 'Mar 10', department: 'Operations', email: 'david.k@iatt.com' },
  ]);

  // Get today's date for comparison
  const today = format(new Date(), 'MMM d');
  const todaysBirthdays = birthdays.filter(b => b.date === today || b.date === 'Feb 2'); // Simulating "today"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBirthday.name || !newBirthday.date || !newBirthday.department) return;

    const birthday: Birthday = {
      id: String(birthdays.length + 1),
      name: newBirthday.name,
      date: format(newBirthday.date, 'MMM d'),
      department: newBirthday.department,
      email: newBirthday.email,
    };

    setBirthdays([...birthdays, birthday]);
    setNewBirthday({ name: '', date: undefined, department: '', email: '' });
    setShowForm(false);
    toast.success('Birthday Added!', {
      description: `${birthday.name}'s birthday has been added.`,
    });
  };

  const handleDelete = (id: string) => {
    setBirthdays(birthdays.filter(b => b.id !== id));
    toast.success('Birthday Removed');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-pink-50">
            <Cake className="w-8 h-8 text-pink-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Birthdays</h1>
            <p className="text-slate-500 font-medium mt-1">Celebrate and manage employee birthdays</p>
          </div>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="px-8 py-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-3 font-black uppercase tracking-[0.2em] text-sm"
        >
          <Plus className="w-5 h-5" />
          Add Birthday
        </button>
      </div>

      {/* Today's Birthdays Banner */}
      {todaysBirthdays.length > 0 && (
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-[2.5rem] p-1 shadow-xl shadow-pink-200/50 overflow-hidden group">
          <div className="bg-white/95 backdrop-blur-sm rounded-[2.2rem] p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center animate-bounce">
                <PartyPopper className="w-6 h-6 text-pink-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Happening Today!</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {todaysBirthdays.map((birthday) => (
                <div key={birthday.id} className="flex items-center gap-6 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 group-hover:bg-white transition-all group-hover:shadow-md">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-pink-500 to-rose-500 p-1">
                    <div className="w-full h-full rounded-[1.2rem] bg-white flex items-center justify-center text-pink-500 text-2xl font-black">
                      {getInitials(birthday.name)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{birthday.name}</h3>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">{birthday.department}</p>
                    <div className="flex items-center gap-2 mt-4 text-pink-500 font-black text-[10px] uppercase tracking-[0.2em]">
                       <Gift className="w-4 h-4" />
                       Happy Birthday!
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Birthday Form */}
      {showForm && (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add Employee Birthday</h2>
            <button 
              onClick={() => setShowForm(false)}
              className="p-3 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Employee Name</label>
              <input
                type="text"
                value={newBirthday.name}
                onChange={(e) => setNewBirthday({ ...newBirthday, name: e.target.value })}
                placeholder="Full name"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Birthday Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-left flex items-center justify-between hover:bg-slate-100 transition-all font-bold',
                      !newBirthday.date ? 'text-slate-400' : 'text-slate-900'
                    )}
                  >
                    {newBirthday.date ? format(newBirthday.date, 'MMMM d') : 'Select date'}
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border border-slate-100 rounded-2xl shadow-2xl" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={newBirthday.date}
                    onSelect={(date) => setNewBirthday({ ...newBirthday, date })}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Department</label>
              <div className="relative">
                <select
                  value={newBirthday.department}
                  onChange={(e) => setNewBirthday({ ...newBirthday, department: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                  required
                >
                  <option value="" className="bg-white">Select department</option>
                  <option value="Engineering" className="bg-white">Engineering</option>
                  <option value="Marketing" className="bg-white">Marketing</option>
                  <option value="Sales" className="bg-white">Sales</option>
                  <option value="HR" className="bg-white">HR</option>
                  <option value="Finance" className="bg-white">Finance</option>
                  <option value="Design" className="bg-white">Design</option>
                  <option value="Operations" className="bg-white">Operations</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Work Email</label>
              <input
                type="email"
                value={newBirthday.email}
                onChange={(e) => setNewBirthday({ ...newBirthday, email: e.target.value })}
                placeholder="employee@iatt.com"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            <div className="md:col-span-2 pt-4">
              <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-sm">
                <Check className="w-5 h-5" />
                Add Birthday Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upcoming Birthdays Grid */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Upcoming Birthdays</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {birthdays.map((birthday) => (
            <div 
              key={birthday.id}
              className="p-8 rounded-[2rem] bg-slate-50 hover:bg-white border border-slate-50 hover:border-slate-100 transition-all group hover:shadow-xl hover:shadow-slate-200/50"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary text-xl font-black group-hover:bg-primary group-hover:text-white transition-all duration-300">
                  {getInitials(birthday.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-slate-900 font-black tracking-tight truncate transition-colors group-hover:text-primary">{birthday.name}</h3>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{birthday.department}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-6 border-t border-slate-100/50">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl text-pink-500 font-black text-[10px] uppercase tracking-[0.15em] border border-pink-50 shadow-sm">
                  <Cake className="w-3.5 h-3.5" />
                  <span>{birthday.date}</span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <button className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(birthday.id)}
                    className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Birthday;
