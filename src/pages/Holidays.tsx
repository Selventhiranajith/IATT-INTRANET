import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  PartyPopper, Plus, Calendar, Edit2, Trash2, Loader2, History,
  CalendarDays, Sparkles, Sun, Flower2, Snowflake, Leaf,
  ChevronLeft, ChevronRight, X, Check, User
} from 'lucide-react';
import { format, isAfter, startOfDay, getMonth } from 'date-fns';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';

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

/* ── helpers ── */
const CARD_GRADIENTS = [
  { grad: 'from-violet-500 to-purple-600', soft: 'bg-violet-50 border-violet-100', accent: 'text-violet-600', pill: 'bg-violet-100 text-violet-700' },
  { grad: 'from-rose-500 to-pink-600', soft: 'bg-rose-50 border-rose-100', accent: 'text-rose-600', pill: 'bg-rose-100 text-rose-700' },
  { grad: 'from-amber-400 to-orange-500', soft: 'bg-amber-50 border-amber-100', accent: 'text-amber-600', pill: 'bg-amber-100 text-amber-700' },
  { grad: 'from-teal-500 to-emerald-600', soft: 'bg-teal-50 border-teal-100', accent: 'text-teal-600', pill: 'bg-teal-100 text-teal-700' },
  { grad: 'from-sky-500 to-blue-600', soft: 'bg-sky-50 border-sky-100', accent: 'text-sky-600', pill: 'bg-sky-100 text-sky-700' },
  { grad: 'from-fuchsia-500 to-pink-500', soft: 'bg-fuchsia-50 border-fuchsia-100', accent: 'text-fuchsia-600', pill: 'bg-fuchsia-100 text-fuchsia-700' },
  { grad: 'from-indigo-500 to-blue-600', soft: 'bg-indigo-50 border-indigo-100', accent: 'text-indigo-600', pill: 'bg-indigo-100 text-indigo-700' },
  { grad: 'from-lime-500 to-green-600', soft: 'bg-lime-50 border-lime-100', accent: 'text-lime-600', pill: 'bg-lime-100 text-lime-700' },
];

const getSeasonIcon = (month: number) => {
  if (month >= 2 && month <= 4) return <Flower2 className="w-4 h-4" />;
  if (month >= 5 && month <= 7) return <Sun className="w-4 h-4" />;
  if (month >= 8 && month <= 10) return <Leaf className="w-4 h-4" />;
  return <Snowflake className="w-4 h-4" />;
};

/* ═══════════════════════════════ COMPONENT ═══════════════════════════════ */
const Holidays: React.FC = () => {
  const { isAdmin } = useAuth();

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreatedBy, setShowCreatedBy] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  /* ── modal state ── */
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentHoliday, setCurrentHoliday] = useState<Holiday | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── form fields ── */
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState<Date | undefined>(undefined);
  const [holidayDescription, setHolidayDescription] = useState('');

  /* ─── API ─── */
  const fetchHolidays = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/holidays', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHolidays(data.data.holidays);
        setShowCreatedBy(data.data.isAdmin);
      }
    } catch {
      toast.error('Failed to load holidays');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchHolidays(); }, []);

  const resetForm = () => {
    setHolidayName('');
    setHolidayDate(undefined);
    setHolidayDescription('');
  };

  const handleCreate = async () => {
    if (!holidayName.trim() || !holidayDate) {
      toast.error('Please enter holiday name and date');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: holidayName, date: format(holidayDate, 'yyyy-MM-dd'), description: holidayDescription })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Holiday created successfully!');
        setIsAddModalOpen(false);
        resetForm();
        fetchHolidays();
      } else {
        toast.error(data.message || 'Failed to create holiday');
      }
    } catch {
      toast.error('Error creating holiday');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!currentHoliday || !holidayName.trim() || !holidayDate) {
      toast.error('Please enter holiday name and date');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/holidays/${currentHoliday.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: holidayName, date: format(holidayDate, 'yyyy-MM-dd'), description: holidayDescription })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Holiday updated successfully!');
        setIsEditModalOpen(false);
        setCurrentHoliday(null);
        resetForm();
        fetchHolidays();
      } else {
        toast.error(data.message || 'Failed to update holiday');
      }
    } catch {
      toast.error('Error updating holiday');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this holiday?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/holidays/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Holiday deleted successfully!');
        fetchHolidays();
      } else {
        toast.error(data.message || 'Failed to delete holiday');
      }
    } catch {
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

  /* ── derived data ── */
  const { filteredGroups, counts } = useMemo(() => {
    const today = startOfDay(new Date());
    const split = holidays.reduce<{ upcoming: Holiday[]; past: Holiday[] }>(
      (acc, h) => {
        const hDate = new Date(h.date);
        const isTodayOrFuture = isAfter(hDate, today) || format(hDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
        (isTodayOrFuture ? acc.upcoming : acc.past).push(h);
        return acc;
      },
      { upcoming: [], past: [] }
    );

    const list = activeTab === 'upcoming' ? split.upcoming : split.past;
    const grouped = list.reduce<Record<string, Holiday[]>>((acc, h) => {
      const key = format(new Date(h.date), 'MMMM yyyy');
      if (!acc[key]) acc[key] = [];
      acc[key].push(h);
      return acc;
    }, {});

    const sortedGroups = Object.entries(grouped).sort(([a], [b]) =>
      activeTab === 'upcoming'
        ? new Date(a).getTime() - new Date(b).getTime()
        : new Date(b).getTime() - new Date(a).getTime()
    );

    return { filteredGroups: sortedGroups, counts: { upcoming: split.upcoming.length, past: split.past.length } };
  }, [holidays, activeTab]);

  /* next holiday info */
  const nextHoliday = useMemo(() => {
    const today = startOfDay(new Date());
    return holidays.filter(h => isAfter(new Date(h.date), today) || format(new Date(h.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  }, [holidays]);


  /* ════════════════════════════ JSX ════════════════════════════ */
  return (
    <div className="space-y-8 animate-fade-in pb-16">

      {/* ── HERO BANNER ── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1e1b4b] via-[#4c1d95] to-[#6d28d9] p-8 shadow-2xl shadow-violet-900/30">
        {/* blobs */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-10 w-56 h-56 rounded-full bg-pink-500/15 blur-2xl" />
        <div className="pointer-events-none absolute top-1/2 right-1/3 w-40 h-40 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          {/* left */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Corporate Calendar
            </div>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/15 p-3.5 backdrop-blur-sm border border-white/20">
                <PartyPopper className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Holiday Calendar
                </h1>
                <p className="mt-1 text-sm font-medium text-violet-200/90">Celebrations, breaks &amp; company-wide events</p>
              </div>
            </div>

            {/* stat chips */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-white">
                <CalendarDays className="w-3.5 h-3.5 text-emerald-300" />
                {counts.upcoming} Upcoming
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-white">
                <History className="w-3.5 h-3.5 text-slate-300" />
                {counts.past} Past
              </div>
              {nextHoliday && (
                <div className="flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-400/20 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-amber-200">
                  <Calendar className="w-3.5 h-3.5" />
                  Next: {nextHoliday.name}
                </div>
              )}
            </div>
          </div>

          {/* right – add button */}
          {isAdmin && (
            <button
              onClick={() => { resetForm(); setIsAddModalOpen(true); }}
              className="inline-flex items-center gap-3 rounded-2xl border border-white/25 bg-white text-violet-700 px-6 py-3.5 text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Holiday
            </button>
          )}
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="flex items-center justify-center">
        <div className="flex gap-1.5 rounded-[1.5rem] border border-slate-200/80 bg-slate-100/60 p-1.5 backdrop-blur-sm">
          {(['upcoming', 'past'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex items-center gap-2.5 rounded-2xl px-7 py-3 text-[11px] font-black uppercase tracking-widest transition-all',
                activeTab === tab
                  ? 'bg-white text-violet-600 shadow-md ring-1 ring-slate-200/60'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              )}
            >
              {tab === 'upcoming'
                ? <CalendarDays className={cn('w-4 h-4', activeTab === tab ? 'text-violet-500' : 'text-slate-300')} />
                : <History className={cn('w-4 h-4', activeTab === tab ? 'text-violet-500' : 'text-slate-300')} />}
              {tab} Holidays
              <span className={cn(
                'rounded-lg px-2 py-0.5 text-[10px] font-black',
                activeTab === tab ? 'bg-violet-100 text-violet-600' : 'bg-slate-200 text-slate-500'
              )}>
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTENT ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-5 py-32">
          <div className="relative">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-slate-100 border-t-violet-500" />
            <PartyPopper className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-violet-500" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Organising Calendar…</p>
        </div>
      ) : filteredGroups.length > 0 ? (
        <div className="space-y-12">
          {filteredGroups.map(([month, items]) => {
            const monthIndex = new Date(items[0].date).getMonth();
            return (
              <div key={month}>
                {/* month heading */}
                <div className="mb-6 flex items-center gap-4">
                  <div className={cn('flex items-center gap-2 rounded-xl px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-500 border',
                    'bg-slate-50 border-slate-200')}>
                    {getSeasonIcon(monthIndex)}
                    {month}
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-slate-200 via-slate-100 to-transparent" />
                  <span className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {items.length} {items.length === 1 ? 'event' : 'events'}
                  </span>
                </div>

                {/* cards grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((holiday, idx) => {
                    const palette = CARD_GRADIENTS[(idx + monthIndex) % CARD_GRADIENTS.length];
                    const d = new Date(holiday.date);
                    const isPast = activeTab === 'past';
                    const isNextUp = activeTab === 'upcoming' && idx === 0 && month === filteredGroups[0][0];

                    return (
                      <div
                        key={holiday.id}
                        className={cn(
                          'group relative overflow-hidden rounded-[1.75rem] border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                          isPast ? 'border-slate-100 hover:shadow-slate-200/40' : 'border-slate-200/70 hover:shadow-violet-200/30'
                        )}
                      >
                        {/* top gradient strip */}
                        <div className={cn('h-1.5 w-full bg-gradient-to-r', isPast ? 'from-slate-300 to-slate-200' : palette.grad)} />

                        {/* card body */}
                        <div className="flex flex-col gap-4 p-6">
                          {/* date badge + actions row */}
                          <div className="flex items-start justify-between">
                            <div className={cn(
                              'flex flex-col items-center justify-center rounded-2xl px-4 py-2 shadow-sm border',
                              isPast ? 'bg-slate-100 border-slate-200' : palette.soft,
                            )}>
                              <span className={cn('text-[10px] font-black uppercase leading-none tracking-widest', isPast ? 'text-slate-400' : palette.accent)}>
                                {format(d, 'MMM')}
                              </span>
                              <span className={cn('text-3xl font-black leading-tight', isPast ? 'text-slate-400' : palette.accent)}>
                                {format(d, 'dd')}
                              </span>
                              <span className={cn('text-[9px] font-bold uppercase tracking-widest', isPast ? 'text-slate-300' : palette.accent + '/70')}>
                                {format(d, 'yyyy')}
                              </span>
                            </div>

                            {/* admin action buttons */}
                            {isAdmin && (
                              <div className="flex items-center gap-1.5 opacity-0 transition-all duration-200 group-hover:opacity-100">
                                <button
                                  onClick={() => openEditModal(holiday)}
                                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm hover:border-violet-200 hover:text-violet-600 hover:shadow-violet-100 transition-all hover:scale-110 active:scale-90"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(holiday.id)}
                                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-400 shadow-sm hover:border-red-200 hover:text-red-500 hover:shadow-red-100 transition-all hover:scale-110 active:scale-90"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* name + "Next Up" badge */}
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className={cn(
                              'text-lg font-black tracking-tight leading-tight',
                              isPast ? 'text-slate-400' : 'text-slate-900'
                            )}>
                              {holiday.name}
                            </h3>
                            {isNextUp && (
                              <span className="animate-pulse rounded-lg bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-emerald-600">
                                Next Up
                              </span>
                            )}
                            {isPast && (
                              <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                Past
                              </span>
                            )}
                          </div>

                          {/* day of week */}
                          <div className={cn('flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest',
                            isPast ? 'text-slate-300' : 'text-slate-400')}>
                            <Calendar className="h-3 w-3" />
                            {format(d, 'EEEE')}
                          </div>

                          {/* description */}
                          <p className={cn('text-sm leading-relaxed line-clamp-2 font-medium',
                            isPast ? 'text-slate-300' : 'text-slate-500')}>
                            {holiday.description || `Celebrate ${holiday.name} with your team.`}
                          </p>

                          {/* footer */}
                          <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-4">
                            <span className={cn('rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest',
                              isPast ? 'border-slate-100 bg-slate-50 text-slate-300' : palette.soft + ' ' + palette.accent)}>
                              {holiday.branch || 'All Branches'}
                            </span>

                            {showCreatedBy && holiday.creator_first_name && (
                              <div className="flex items-center gap-1.5">
                                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
                                  <User className="h-3 w-3 text-slate-400" />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {holiday.creator_first_name} {holiday.creator_last_name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* empty state */
        <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-24 text-center shadow-sm">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-50/30 to-transparent" />
          <div className="relative">
            <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-violet-100 to-slate-100 shadow-inner">
              {activeTab === 'upcoming'
                ? <CalendarDays className="h-14 w-14 text-violet-300" />
                : <History className="h-14 w-14 text-slate-300" />}
            </div>
            <h3 className="mb-3 text-2xl font-black tracking-tight text-slate-900">No {activeTab} holidays</h3>
            <p className="mx-auto mb-10 max-w-sm text-base font-medium leading-relaxed text-slate-400">
              {activeTab === 'upcoming'
                ? 'The calendar is clear. Plan the next team celebration!'
                : 'Holiday history will appear here once events pass.'}
            </p>
            {isAdmin && activeTab === 'upcoming' && (
              <button
                onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-10 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-violet-200 hover:shadow-violet-400 hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
                Add First Holiday
              </button>
            )}
          </div>
        </div>
      )}

      {/* ════════════ ADD MODAL ════════════ */}
      <Dialog open={isAddModalOpen} onOpenChange={(open) => { setIsAddModalOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white flex flex-col">
          {/* header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 p-8 shrink-0">
            <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur-sm p-3">
                <PartyPopper className="h-7 w-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight text-white">Add Holiday</DialogTitle>
                <p className="mt-0.5 text-sm font-medium text-violet-200/80">Schedule a new company holiday</p>
              </div>
            </div>
          </div>

          {/* body */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Holiday Name *</Label>
                <Input
                  placeholder="e.g., Independence Day"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white font-semibold text-slate-900 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-left flex items-center justify-between hover:bg-white transition-all font-semibold',
                        !holidayDate ? 'text-slate-400' : 'text-slate-900'
                      )}
                    >
                      {holidayDate ? format(holidayDate, 'PPP') : 'Pick a date'}
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-slate-100" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={holidayDate}
                      onSelect={(date) => setHolidayDate(date)}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Description <span className="capitalize font-normal text-slate-300">(optional)</span>
                </Label>
                <Textarea
                  placeholder="Brief description of the holiday..."
                  value={holidayDescription}
                  onChange={(e) => setHolidayDescription(e.target.value)}
                  className="min-h-[90px] rounded-xl border-slate-200 bg-slate-50 focus:bg-white font-medium resize-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="shrink-0 border-t border-slate-100 p-6 flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => { setIsAddModalOpen(false); resetForm(); }}
              className="rounded-xl font-bold text-slate-400 hover:text-slate-600 h-11 px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black uppercase tracking-widest text-[11px] shadow-md shadow-violet-500/30 h-11 px-8 hover:from-violet-700 hover:to-indigo-700 transition-all"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-2" />Publish Holiday</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ════════════ EDIT MODAL ════════════ */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) { setCurrentHoliday(null); resetForm(); } }}>
        <DialogContent className="sm:max-w-[520px] max-h-[90vh] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-white flex flex-col">
          {/* header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-8 shrink-0">
            <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur-sm p-3">
                <Edit2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight text-white">Edit Holiday</DialogTitle>
                <p className="mt-0.5 text-sm font-medium text-amber-100/80">
                  {currentHoliday?.name}
                </p>
              </div>
            </div>
          </div>

          {/* body */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Holiday Name *</Label>
                <Input
                  placeholder="e.g., Independence Day"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 focus:bg-white font-semibold text-slate-900 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-left flex items-center justify-between hover:bg-white transition-all font-semibold',
                        !holidayDate ? 'text-slate-400' : 'text-slate-900'
                      )}
                    >
                      {holidayDate ? format(holidayDate, 'PPP') : 'Pick a date'}
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-slate-100" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={holidayDate}
                      onSelect={(date) => setHolidayDate(date)}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                  Description <span className="capitalize font-normal text-slate-300">(optional)</span>
                </Label>
                <Textarea
                  placeholder="Brief description of the holiday..."
                  value={holidayDescription}
                  onChange={(e) => setHolidayDescription(e.target.value)}
                  className="min-h-[90px] rounded-xl border-slate-200 bg-slate-50 focus:bg-white font-medium resize-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* footer */}
          <div className="shrink-0 border-t border-slate-100 p-6 flex gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => { setIsEditModalOpen(false); setCurrentHoliday(null); resetForm(); }}
              className="rounded-xl font-bold text-slate-400 hover:text-slate-600 h-11 px-6"
            >
              Discard
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black uppercase tracking-widest text-[11px] shadow-md shadow-amber-400/30 h-11 px-8 hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-2" />Save Changes</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Holidays;
