import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PartyPopper, Plus, Calendar, Edit2, Trash2, X, Check, Loader2, User, Sparkles, MapPin, ChevronRight, History, CalendarDays } from 'lucide-react';
import { format, isAfter, startOfDay } from 'date-fns';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Holiday {
  id: number;
  name: string;
  date: string;
  description?: string;
  branch: string;
  created_by: number;
  creator_first_name?: string;
  creator_last_name?: string;
  created_at: string;
}

const THEME_PALETTES = [
  { bg: 'from-violet-500 to-purple-600', text: 'text-violet-600', light: 'bg-violet-50' },
  { bg: 'from-rose-500 to-pink-600', text: 'text-rose-600', light: 'bg-rose-50' },
  { bg: 'from-amber-500 to-orange-500', text: 'text-amber-600', light: 'bg-amber-50' },
  { bg: 'from-teal-500 to-emerald-600', text: 'text-teal-600', light: 'bg-teal-50' },
  { bg: 'from-sky-500 to-blue-600', text: 'text-sky-600', light: 'bg-sky-50' },
  { bg: 'from-fuchsia-500 to-pink-500', text: 'text-fuchsia-600', light: 'bg-fuchsia-50' },
];

const Holidays: React.FC = () => {
  const { isAdmin } = useAuth();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentHoliday, setCurrentHoliday] = useState<Holiday | null>(null);
  const [showCreatedBy, setShowCreatedBy] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // Form state
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState<Date | undefined>(undefined);
  const [holidayDescription, setHolidayDescription] = useState('');

  const fetchHolidays = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/holidays', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        setHolidays(data.data.holidays);
        setShowCreatedBy(data.data.isAdmin);
      }
    } catch (error) {
      console.error('Fetch holidays error:', error);
      toast.error('Failed to load holidays');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleCreateHoliday = async () => {
    if (!holidayName.trim() || !holidayDate) {
      toast.error('Please enter holiday name and date');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/holidays', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: holidayName,
          date: format(holidayDate, 'yyyy-MM-dd'),
          description: holidayDescription
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Holiday created successfully!');
        setIsAddModalOpen(false);
        setHolidayName('');
        setHolidayDate(undefined);
        setHolidayDescription('');
        fetchHolidays();
      } else {
        toast.error(data.message || 'Failed to create holiday');
      }
    } catch (error) {
      console.error('Create holiday error:', error);
      toast.error('Error creating holiday');
    }
  };

  const handleUpdateHoliday = async () => {
    if (!currentHoliday || !holidayName.trim() || !holidayDate) {
      toast.error('Please enter holiday name and date');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/holidays/${currentHoliday.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: holidayName,
          date: format(holidayDate, 'yyyy-MM-dd'),
          description: holidayDescription
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Holiday updated successfully!');
        setIsEditModalOpen(false);
        setCurrentHoliday(null);
        setHolidayName('');
        setHolidayDate(undefined);
        setHolidayDescription('');
        fetchHolidays();
      } else {
        toast.error(data.message || 'Failed to update holiday');
      }
    } catch (error) {
      console.error('Update holiday error:', error);
      toast.error('Error updating holiday');
    }
  };

  const handleDeleteHoliday = async (id: number) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/holidays/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Holiday deleted successfully!');
        fetchHolidays();
      } else {
        toast.error(data.message || 'Failed to delete holiday');
      }
    } catch (error) {
      console.error('Delete holiday error:', error);
      toast.error('Error deleting holiday');
    }
  };

  const openEditModal = (holiday: Holiday) => {
    setCurrentHoliday(holiday);
    setHolidayName(holiday.name);
    setHolidayDate(new Date(holiday.date));
    setHolidayDescription(holiday.description || '');
    setIsEditModalOpen(true);
  };

  // Split and group holidays
  const { filteredGroups, counts } = useMemo(() => {
    const today = startOfDay(new Date());

    const split = holidays.reduce<{ upcoming: Holiday[], past: Holiday[] }>(
      (acc, h) => {
        const hDate = new Date(h.date);
        if (isAfter(hDate, today) || format(hDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
          acc.upcoming.push(h);
        } else {
          acc.past.push(h);
        }
        return acc;
      },
      { upcoming: [], past: [] }
    );

    const targetList = activeTab === 'upcoming' ? split.upcoming : split.past;

    const grouped = targetList.reduce<Record<string, Holiday[]>>((acc, h) => {
      const key = format(new Date(h.date), 'MMMM yyyy');
      if (!acc[key]) acc[key] = [];
      acc[key].push(h);
      return acc;
    }, {});

    const sortedGroups = Object.entries(grouped).sort(([a], [b]) => {
      return activeTab === 'upcoming'
        ? new Date(a).getTime() - new Date(b).getTime()
        : new Date(b).getTime() - new Date(a).getTime();
    });

    return {
      filteredGroups: sortedGroups,
      counts: { upcoming: split.upcoming.length, past: split.past.length }
    };
  }, [holidays, activeTab]);

  const ModalFields = () => (
    <div className="py-6 space-y-5">
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Holiday Name</Label>
        <Input
          placeholder="e.g., Independence Day"
          value={holidayName}
          onChange={(e) => setHolidayName(e.target.value)}
          className="h-12 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 font-medium text-slate-900 transition-all"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                'w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left flex items-center justify-between hover:bg-white hover:border-violet-400 hover:ring-4 hover:ring-violet-100 transition-all font-medium',
                !holidayDate ? 'text-slate-400' : 'text-slate-900'
              )}
            >
              {holidayDate ? format(holidayDate, 'PPP') : 'Select date'}
              <Calendar className="w-5 h-5 text-slate-400" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white border border-slate-100 rounded-2xl shadow-2xl" align="start">
            <CalendarPicker
              mode="single"
              selected={holidayDate}
              onSelect={(date) => setHolidayDate(date)}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Description <span className="text-slate-300 normal-case font-medium">(Optional)</span></Label>
        <Textarea
          placeholder="Brief description of the holiday..."
          value={holidayDescription}
          onChange={(e) => setHolidayDescription(e.target.value)}
          className="min-h-[90px] rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 font-medium resize-none transition-all"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in pb-16">
      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-10 shadow-2xl shadow-violet-200/50">
        <div className="pointer-events-none absolute -top-10 -right-10 w-80 h-80 rounded-full bg-white/10 blur-3xl opacity-50" />
        <div className="pointer-events-none absolute bottom-0 left-20 w-64 h-64 rounded-full bg-pink-400/20 blur-2xl opacity-40" />

        <div className="relative flex items-center justify-between flex-wrap gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20 transform hover:rotate-6 transition-transform">
              <PartyPopper className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight drop-shadow">Holidays</h1>
              <p className="text-violet-100 font-medium mt-1 text-lg opacity-90">Corporate holiday calendar & celebrations</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-black/10 backdrop-blur-xl p-2 rounded-[2rem] border border-white/10">
            {isAdmin && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-8 py-4 bg-white text-violet-700 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-3 group"
              >
                <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                Add Holiday
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── SEPARATION TABS ── */}
      <div className="flex items-center justify-center">
        <div className="bg-slate-100/50 p-1.5 rounded-[1.5rem] flex gap-2 border border-slate-100 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={cn(
              "flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
              activeTab === 'upcoming'
                ? "bg-white text-violet-600 shadow-md ring-1 ring-slate-100"
                : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
            )}
          >
            <CalendarDays className={cn("w-4 h-4", activeTab === 'upcoming' ? "text-violet-500" : "text-slate-300")} />
            Upcoming Holidays
            <span className={cn(
              "ml-1 px-2 py-0.5 rounded-lg text-[10px]",
              activeTab === 'upcoming' ? "bg-violet-100 text-violet-600" : "bg-slate-200 text-slate-500"
            )}>{counts.upcoming}</span>
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={cn(
              "flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
              activeTab === 'past'
                ? "bg-white text-violet-600 shadow-md ring-1 ring-slate-100"
                : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
            )}
          >
            <History className={cn("w-4 h-4", activeTab === 'past' ? "text-violet-500" : "text-slate-300")} />
            Past Holidays
            <span className={cn(
              "ml-1 px-2 py-0.5 rounded-lg text-[10px]",
              activeTab === 'past' ? "bg-violet-100 text-violet-600" : "bg-slate-200 text-slate-500"
            )}>{counts.past}</span>
          </button>
        </div>
      </div>

      {/* ── CONTENT (SEPARATE VIEW) ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-violet-500 animate-spin" />
            <PartyPopper className="w-8 h-8 text-violet-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">Organizing Calendar...</p>
        </div>
      ) : filteredGroups.length > 0 ? (
        <div className="space-y-16">
          {filteredGroups.map(([month, items]) => (
            <div key={month} className="animate-slide-up relative">
              <div className="flex items-center gap-6 mb-8 group">
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Calendar Range</span>
                  <span className="text-2xl font-black text-slate-900 tracking-tight">{month}</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  {items.length} {items.length === 1 ? 'Event' : 'Events'}
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 ring-1 ring-slate-50">
                <div className="overflow-x-auto">
                  <table className="w-full text-left table-fixed">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="w-[20%] py-6 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Day</th>
                        <th className="w-[20%] py-6 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Holiday Name</th>
                        <th className="w-[35%] py-6 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">About</th>
                        {showCreatedBy && <th className="w-[15%] py-6 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400">Created By</th>}
                        {isAdmin && <th className="w-[10%] py-6 px-10 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Settings</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {items.map((holiday, idx) => {
                        const palette = THEME_PALETTES[idx % THEME_PALETTES.length];
                        const d = new Date(holiday.date);

                        return (
                          <tr key={holiday.id} className="group hover:bg-slate-50/50 transition-all duration-300">
                            <td className="py-8 px-10">
                              <div className="flex items-center gap-4">
                                <div className={cn("shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br flex flex-col items-center justify-center text-white shadow-lg",
                                  activeTab === 'past' ? "grayscale opacity-80" : "", palette.bg)}>
                                  <span className="text-[10px] font-black uppercase leading-none mb-1 opacity-80">{format(d, 'MMM')}</span>
                                  <span className="text-xl font-black leading-none">{format(d, 'dd')}</span>
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-slate-900 font-black text-sm tracking-tight truncate">{format(d, 'EEEE')}</span>
                                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{format(d, 'yyyy')}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-8 px-10">
                              <div className="flex items-center gap-3">
                                <span className={cn("text-lg font-black tracking-tight",
                                  activeTab === 'past' ? "text-slate-400" : "text-slate-900")}>
                                  {holiday.name}
                                </span>
                                {activeTab === 'upcoming' && idx === 0 && month === filteredGroups[0][0] && (
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-md animate-pulse">Next Up</span>
                                )}
                              </div>
                            </td>
                            <td className="py-8 px-10">
                              <p className={cn("text-sm font-medium leading-relaxed italic line-clamp-3",
                                activeTab === 'past' ? "text-slate-300" : "text-slate-500")}>
                                {holiday.description || `Celebrate ${holiday.name} with your team members.`}
                              </p>
                            </td>
                            {showCreatedBy && (
                              <td className="py-8 px-10">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                                    <User className="w-4 h-4 text-slate-400" />
                                  </div>
                                  <span className="text-slate-600 text-[11px] font-black truncate">{holiday.creator_first_name}</span>
                                </div>
                              </td>
                            )}
                            {isAdmin && (
                              <td className="py-8 px-10 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                  <button
                                    onClick={() => openEditModal(holiday)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-violet-600 hover:border-violet-200 hover:shadow-violet-100 hover:scale-110 active:scale-90 transition-all"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteHoliday(holiday.id)}
                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm text-slate-400 hover:text-red-500 hover:border-red-200 hover:shadow-red-100 hover:scale-110 active:scale-90 transition-all"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[3rem] p-32 text-center shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="w-32 h-32 mx-auto rounded-[3rem] bg-gradient-to-br from-slate-100 to-indigo-50 flex items-center justify-center mb-10 shadow-inner group-hover:scale-110 transition-transform duration-500">
              {activeTab === 'upcoming' ? (
                <CalendarDays className="w-16 h-16 text-slate-300" />
              ) : (
                <History className="w-16 h-16 text-slate-300" />
              )}
            </div>
            <h3 className="text-slate-900 font-black text-3xl mb-4 tracking-tight">No {activeTab} holidays</h3>
            <p className="text-slate-400 font-medium mb-12 max-w-sm mx-auto leading-relaxed text-lg">
              {activeTab === 'upcoming'
                ? "The upcoming calendar looks clear for now. Why not plan the next team break?"
                : "Your holiday history begins once an event starts and completes!"}
            </p>
            {isAdmin && activeTab === 'upcoming' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-4 px-12 py-5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-violet-200 hover:shadow-violet-400 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
                Plan First Event
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── MODALS (SAME LOGIC, PREMIUM RE-STYLE) ── */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
          <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-10 pb-14">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-inner">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-black text-white tracking-tight">Project Holiday</DialogTitle>
                <p className="text-violet-100/60 text-sm font-bold uppercase tracking-widest mt-1">Calendar Initialization</p>
              </div>
            </div>
          </div>
          <div className="p-10 -mt-8 rounded-t-[3rem] bg-white relative shadow-2xl">
            <ModalFields />
            <DialogFooter className="mt-10 gap-4 sm:flex-row flex-col">
              <Button
                onClick={() => setIsAddModalOpen(false)}
                variant="ghost"
                className="flex-1 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-slate-600 hover:bg-slate-50 h-16 transition-all"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateHoliday}
                className="flex-[2] bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-violet-200 h-16 hover:scale-[1.03] active:scale-95 transition-all"
              >
                Publish Holiday
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[550px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-white">
          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 p-10 pb-14">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-inner">
                <Edit2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-black text-white tracking-tight">Edit Event</DialogTitle>
                <p className="text-amber-100/60 text-sm font-bold uppercase tracking-widest mt-1">Update Schedule Details</p>
              </div>
            </div>
          </div>
          <div className="p-10 -mt-8 rounded-t-[3rem] bg-white relative shadow-2xl">
            <ModalFields />
            <DialogFooter className="mt-10 gap-4 sm:flex-row flex-col">
              <Button
                onClick={() => setIsEditModalOpen(false)}
                variant="ghost"
                className="flex-1 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-slate-600 hover:bg-slate-50 h-16 transition-all"
              >
                Discard
              </Button>
              <Button
                onClick={handleUpdateHoliday}
                className="flex-[2] bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-amber-200 h-16 hover:scale-[1.03] active:scale-95 transition-all"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Holidays;
