import React, { useState } from 'react';
import { PartyPopper, Plus, Calendar, Edit2, Trash2, X, Check, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'national' | 'company' | 'optional';
  description?: string;
}

const Holidays: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ name: '', date: undefined as Date | undefined, type: 'company', description: '' });

  const [holidays, setHolidays] = useState<Holiday[]>([
    { id: '1', name: 'New Year\'s Day', date: 'Jan 1, 2024', type: 'national', description: 'New Year celebration' },
    { id: '2', name: 'Republic Day', date: 'Jan 26, 2024', type: 'national', description: 'National holiday' },
    { id: '3', name: 'Company Foundation Day', date: 'Feb 14, 2024', type: 'company', description: 'IATT anniversary celebration' },
    { id: '4', name: 'Good Friday', date: 'Mar 29, 2024', type: 'national' },
    { id: '5', name: 'Easter Monday', date: 'Apr 1, 2024', type: 'optional' },
    { id: '6', name: 'Labor Day', date: 'May 1, 2024', type: 'national' },
    { id: '7', name: 'Independence Day', date: 'Aug 15, 2024', type: 'national' },
    { id: '8', name: 'Diwali', date: 'Nov 1, 2024', type: 'national', description: 'Festival of lights' },
    { id: '9', name: 'Christmas', date: 'Dec 25, 2024', type: 'national' },
  ]);

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
      national: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      company: 'bg-primary/20 text-primary border-primary/30',
      optional: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    };
    return styles[type] || 'bg-white/10 text-white/60';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHoliday.name || !newHoliday.date) return;

    const holiday: Holiday = {
      id: String(holidays.length + 1),
      name: newHoliday.name,
      date: format(newHoliday.date, 'MMM d, yyyy'),
      type: newHoliday.type as 'national' | 'company' | 'optional',
      description: newHoliday.description,
    };

    setHolidays([...holidays, holiday]);
    setNewHoliday({ name: '', date: undefined, type: 'company', description: '' });
    setShowForm(false);
    toast.success('Holiday Added!', {
      description: `${holiday.name} has been added to the calendar.`,
    });
  };

  const handleDelete = (id: string) => {
    setHolidays(holidays.filter(h => h.id !== id));
    toast.success('Holiday Removed');
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-primary/10">
            <PartyPopper className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Holidays</h1>
            <p className="text-slate-500 font-medium mt-1">Manage company holidays calendar</p>
          </div>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="px-8 py-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-3 font-black uppercase tracking-[0.2em] text-sm"
        >
          <Plus className="w-5 h-5" />
          Add Holiday
        </button>
      </div>

      {/* Add Holiday Form */}
      {showForm && (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add New Holiday</h2>
            <button 
              onClick={() => setShowForm(false)}
              className="p-3 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Holiday Name</label>
              <input
                type="text"
                value={newHoliday.name}
                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                placeholder="e.g., Company Day"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-left flex items-center justify-between hover:bg-slate-100 transition-all font-bold',
                      !newHoliday.date ? 'text-slate-400' : 'text-slate-900'
                    )}
                  >
                    {newHoliday.date ? format(newHoliday.date, 'PPP') : 'Select date'}
                    <Calendar className="w-5 h-5 text-slate-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border border-slate-100 rounded-2xl shadow-2xl" align="start">
                  <CalendarPicker
                    mode="single"
                    selected={newHoliday.date}
                    onSelect={(date) => setNewHoliday({ ...newHoliday, date })}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Type</label>
              <div className="relative">
                <select
                  value={newHoliday.type}
                  onChange={(e) => setNewHoliday({ ...newHoliday, type: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                >
                  <option value="national" className="bg-white">National</option>
                  <option value="company" className="bg-white">Company</option>
                  <option value="optional" className="bg-white">Optional</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Description (Optional)</label>
              <input
                type="text"
                value={newHoliday.description}
                onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                placeholder="Brief description"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>

            <div className="md:col-span-2 pt-4">
              <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-sm">
                <Check className="w-5 h-5" />
                Add Holiday to Calendar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'National Holidays', value: holidays.filter(h => h.type === 'national').length, icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Company Holidays', value: holidays.filter(h => h.type === 'company').length, icon: PartyPopper, color: 'text-primary', bg: 'bg-sky-50' },
          { label: 'Optional Holidays', value: holidays.filter(h => h.type === 'optional').length, icon: Plus, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-primary tracking-tighter leading-none">{stat.value}</span>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Days</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Holidays Table */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Holiday</th>
              <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Date</th>
              <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Type</th>
              <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px] hidden md:table-cell">Description</th>
              <th className="text-right py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((holiday) => (
              <tr key={holiday.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                <td className="py-6 px-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                      <PartyPopper className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-slate-900 font-black tracking-tight">{holiday.name}</span>
                  </div>
                </td>
                <td className="py-6 px-8 text-slate-500 font-bold">{holiday.date}</td>
                <td className="py-6 px-8">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm ${
                    holiday.type === 'national' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    holiday.type === 'company' ? 'bg-sky-50 text-primary border-sky-100' :
                    'bg-purple-50 text-purple-600 border-purple-100'
                  }`}>
                    {holiday.type}
                  </span>
                </td>
                <td className="py-6 px-8 text-slate-400 text-sm font-medium hidden md:table-cell">{holiday.description || '-'}</td>
                <td className="py-6 px-8">
                  <div className="flex items-center justify-end gap-3">
                    <button className="p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 text-slate-400 hover:text-primary transition-all">
                      <Edit2 className="w-4.5 h-4.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(holiday.id)}
                      className="p-3 rounded-xl hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100 text-slate-400 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Holidays;
