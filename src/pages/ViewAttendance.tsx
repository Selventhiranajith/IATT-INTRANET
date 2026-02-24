import React, { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList, Search, Download, Loader2, History,
  Clock, CheckCircle2, Users, Activity, LogIn, LogOut,
  ChevronLeft, ChevronRight, Calendar, Timer, FileText,
  TrendingUp, X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, isToday, differenceInMinutes } from 'date-fns';
import { toast } from 'react-toastify';

interface AttendanceRecord {
  id: number;
  user_id: number;
  date: string;
  check_in: string;
  check_out: string | null;
  check_in_remarks: string;
  check_out_remarks: string | null;
  status: 'active' | 'completed';
  duration_minutes: number;
  first_name: string;
  last_name: string;
  employee_id: string;
}

const ROWS_PER_PAGE = 10;

/* ─── helpers ─── */
const getInitials = (first: string, last: string) =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();

const avatarColor = (name: string) => {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-rose-500 to-pink-500',
    'from-indigo-500 to-blue-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const formatDuration = (minutes: number) => {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

/* ─── stat card ─── */
interface StatProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  gradient: string;
  sub?: string;
}
const StatCard: React.FC<StatProps> = ({ label, value, icon: Icon, gradient, sub }) => (
  <div className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-lg bg-gradient-to-br ${gradient}`}>
    <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full bg-white/10" />
    <div className="absolute -right-2 -bottom-6 w-20 h-20 rounded-full bg-white/5" />
    <Icon className="w-7 h-7 opacity-90 mb-4" />
    <p className="text-4xl font-black tracking-tight">{value}</p>
    <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">{label}</p>
    {sub && <p className="text-white/60 text-[10px] mt-1">{sub}</p>}
  </div>
);

/* ─── main component ─── */
const ViewAttendance: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // History modal
  const [selectedUser, setSelectedUser] = useState<AttendanceRecord | null>(null);
  const [historyData, setHistoryData] = useState<AttendanceRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  /* debounce search */
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(searchQuery); setCurrentPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  /* fetch */
  const fetchAttendanceLogs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (debouncedSearch) params.append('search', debouncedSearch);
      const res = await fetch(`http://localhost:5000/api/attendance/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setAttendanceData(data.data);
      else toast.error(data.message || 'Failed to fetch attendance logs');
    } catch {
      toast.error('Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAttendanceLogs(); }, [debouncedSearch]);

  const fetchUserHistory = async (employeeId: string) => {
    setIsHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/attendance/all?employee_id=${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setHistoryData(data.data);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleRowClick = (record: AttendanceRecord) => {
    setSelectedUser(record);
    setIsHistoryOpen(true);
    fetchUserHistory(record.employee_id);
  };

  /* stats */
  const stats = useMemo(() => {
    const total = attendanceData.length;
    const active = attendanceData.filter(r => r.status === 'active').length;
    const completed = attendanceData.filter(r => r.status === 'completed').length;
    const todayCount = attendanceData.filter(r => {
      try { return isToday(new Date(r.date)); } catch { return false; }
    }).length;
    const avgDuration = completed > 0
      ? Math.round(attendanceData.filter(r => r.duration_minutes).reduce((s, r) => s + r.duration_minutes, 0) / completed)
      : 0;
    return { total, active, completed, todayCount, avgDuration };
  }, [attendanceData]);

  /* pagination */
  const totalPages = Math.max(1, Math.ceil(attendanceData.length / ROWS_PER_PAGE));
  const paginated = attendanceData.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  return (
    <div className="space-y-8 animate-fade-in pb-14">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25">
            <ClipboardList className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight dark:text-white">
              Manual Attendance Logs
            </h1>
            <p className="text-slate-500 text-sm font-medium dark:text-slate-400">
              Track & review employee check-in / check-out history
            </p>
          </div>
        </div>
        <button
          onClick={fetchAttendanceLogs}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest shadow-sm hover:shadow-md hover:border-primary/30 hover:text-primary transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Records"
          value={stats.total}
          icon={Users}
          gradient="from-violet-600 to-purple-700"
          sub="All time entries"
        />
        <StatCard
          label="Currently Active"
          value={stats.active}
          icon={Activity}
          gradient="from-emerald-500 to-teal-600"
          sub="Live sessions"
        />
        <StatCard
          label="Today's Check-Ins"
          value={stats.todayCount}
          icon={TrendingUp}
          gradient="from-blue-500 to-indigo-600"
          sub={format(new Date(), 'MMM d, yyyy')}
        />
        <StatCard
          label="Avg Duration"
          value={formatDuration(stats.avgDuration)}
          icon={Timer}
          gradient="from-orange-500 to-amber-600"
          sub="Completed sessions"
        />
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden dark:bg-slate-800 dark:border-slate-700">

        {/* Table toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-8 py-6 border-b border-slate-100 dark:border-slate-700">
          <div>
            <p className="text-slate-900 font-black text-base dark:text-white">All Entries</p>
            <p className="text-slate-400 text-xs font-medium mt-0.5">
              {attendanceData.length} records found
            </p>
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or ID…"
              className="pl-11 pr-10 py-3 rounded-2xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-900 placeholder:text-slate-400 w-full sm:w-64 focus:sm:w-80 transition-all duration-300 focus:outline-none focus:bg-white focus:border-primary/30 focus:shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading records…</p>
            </div>
          ) : attendanceData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-700">
                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-500" />
              </div>
              <div className="text-center">
                <p className="text-slate-500 font-bold text-sm dark:text-slate-400">No records found</p>
                <p className="text-slate-400 text-xs mt-1 dark:text-slate-500">Try adjusting your search query</p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-700/40">
                  {['Employee', 'Date', 'Check In', 'Check Out', 'Duration', 'Status', 'Remarks'].map(h => (
                    <th key={h} className="text-left py-3 px-6 text-slate-400 font-black uppercase tracking-widest text-[10px] dark:text-slate-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((record, idx) => {
                  const name = `${record.first_name} ${record.last_name}`;
                  const initials = getInitials(record.first_name, record.last_name);
                  const color = avatarColor(name);
                  const isActive = record.status === 'active';
                  return (
                    <tr
                      key={record.id}
                      onClick={() => handleRowClick(record)}
                      style={{ animationDelay: `${idx * 30}ms` }}
                      className="border-b border-slate-50 hover:bg-primary/3 cursor-pointer transition-all duration-150 group animate-fade-in dark:border-slate-700 dark:hover:bg-primary/10"
                    >
                      {/* Employee */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-xs font-black shadow-sm shrink-0`}>
                            {initials}
                          </div>
                          <div>
                            <p className="text-slate-900 font-bold text-sm leading-tight group-hover:text-primary transition-colors dark:text-white">
                              {name}
                            </p>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider dark:text-slate-500">
                              {record.employee_id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-300 dark:text-slate-500 shrink-0" />
                          <span className="text-slate-600 text-sm font-medium dark:text-slate-300">
                            {format(new Date(record.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </td>

                      {/* Check In */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <span className="text-slate-700 text-sm font-mono font-semibold dark:text-slate-200">
                            {format(new Date(record.check_in), 'hh:mm a')}
                          </span>
                        </div>
                      </td>

                      {/* Check Out */}
                      <td className="py-4 px-6">
                        {record.check_out ? (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                            <span className="text-slate-700 text-sm font-mono font-semibold dark:text-slate-200">
                              {format(new Date(record.check_out), 'hh:mm a')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-sm font-mono dark:text-slate-500">—</span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="py-4 px-6">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 text-xs font-black">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live
                          </span>
                        ) : (
                          <span className="text-slate-800 text-sm font-bold dark:text-slate-200">
                            {formatDuration(record.duration_minutes)}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${isActive
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400'
                          : 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400'
                          }`}>
                          {isActive
                            ? <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Working</>
                            : <><CheckCircle2 className="w-3 h-3" />Done</>
                          }
                        </span>
                      </td>

                      {/* Remarks */}
                      <td className="py-4 px-6 max-w-[180px]">
                        <p className="text-slate-500 text-xs truncate dark:text-slate-400" title={record.check_in_remarks}>
                          {record.check_in_remarks || <span className="text-slate-300">—</span>}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && attendanceData.length > ROWS_PER_PAGE && (
          <div className="flex items-center justify-between px-8 py-5 border-t border-slate-100 dark:border-slate-700">
            <p className="text-slate-400 text-xs font-bold">
              Page <span className="text-slate-700 dark:text-slate-300">{currentPage}</span> of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed dark:border-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | '…')[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-slate-300 text-sm">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${currentPage === p
                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                        : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-400'
                        }`}
                    >
                      {p}
                    </button>
                  )
                )}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:text-primary hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed dark:border-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── History Modal ── */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-3xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden max-h-[88vh] flex flex-col">

          {/* Modal Header */}
          <DialogHeader className="relative p-8 pb-6 bg-gradient-to-br from-primary to-primary/80 text-white shrink-0">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <DialogTitle className="text-xl font-black flex items-center gap-3 relative z-10">
              <div className="p-2.5 rounded-xl bg-white/15">
                <History className="w-5 h-5" />
              </div>
              Attendance History
            </DialogTitle>
            {selectedUser && (
              <div className="flex items-center gap-3 mt-3 relative z-10">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColor(`${selectedUser.first_name} ${selectedUser.last_name}`)} flex items-center justify-center text-white text-sm font-black shadow-md`}>
                  {getInitials(selectedUser.first_name, selectedUser.last_name)}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{selectedUser.first_name} {selectedUser.last_name}</p>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{selectedUser.employee_id}</p>
                </div>
              </div>
            )}
          </DialogHeader>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900">
            {isHistoryLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-primary" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading history…</p>
              </div>
            ) : historyData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-slate-500 text-sm font-bold dark:text-slate-400">No history found</p>
              </div>
            ) : (
              <div className="p-6 space-y-3">
                {/* Summary strip */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Total Sessions', value: historyData.length, icon: ClipboardList, color: 'text-violet-600 bg-violet-50 dark:bg-violet-900/20' },
                    { label: 'Completed', value: historyData.filter(r => r.status === 'completed').length, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
                    { label: 'Avg Duration', value: formatDuration(historyData.filter(r => r.duration_minutes).reduce((s, r) => s + r.duration_minutes, 0) / (historyData.filter(r => r.duration_minutes).length || 1)), icon: Timer, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
                  ].map(s => (
                    <div key={s.label} className={`flex items-center gap-3 p-4 rounded-2xl ${s.color}`}>
                      <s.icon className={`w-5 h-5 ${s.color.split(' ')[0]}`} />
                      <div>
                        <p className={`text-xl font-black ${s.color.split(' ')[0]}`}>{s.value}</p>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Timeline */}
                <div className="relative space-y-3 pl-4">
                  <div className="absolute left-[1.6rem] top-3 bottom-3 w-px bg-slate-200 dark:bg-slate-700" />
                  {historyData.map((record, i) => {
                    const isActive = record.status === 'active';
                    return (
                      <div
                        key={record.id}
                        style={{ animationDelay: `${i * 40}ms` }}
                        className="relative flex gap-4 animate-fade-in"
                      >
                        {/* dot */}
                        <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-3 z-10 shadow-sm ${isActive ? 'bg-emerald-400 border-emerald-300' : 'bg-white border-slate-300 dark:bg-slate-700 dark:border-slate-500'}`} />

                        {/* card */}
                        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="text-slate-900 font-bold text-sm dark:text-white">
                                {format(new Date(record.date), 'EEEE, MMM d yyyy')}
                              </span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isActive
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-400'
                              : 'bg-slate-50 text-slate-500 border border-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400'
                              }`}>
                              {isActive ? '🟢 Working' : '✔ Done'}
                            </span>
                          </div>

                          <div className="flex items-center gap-6 mt-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                                <LogIn className="w-3.5 h-3.5 text-emerald-500" />
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">In</p>
                                <p className="text-slate-800 font-mono font-bold text-sm dark:text-slate-200">
                                  {format(new Date(record.check_in), 'hh:mm a')}
                                </p>
                              </div>
                            </div>
                            {record.check_out && (
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-900/20">
                                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Out</p>
                                  <p className="text-slate-800 font-mono font-bold text-sm dark:text-slate-200">
                                    {format(new Date(record.check_out), 'hh:mm a')}
                                  </p>
                                </div>
                              </div>
                            )}
                            {record.status === 'completed' && record.duration_minutes > 0 && (
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                  <Timer className="w-3.5 h-3.5 text-blue-500" />
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Duration</p>
                                  <p className="text-slate-800 font-bold text-sm dark:text-slate-200">
                                    {formatDuration(record.duration_minutes)}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* remarks */}
                          {(record.check_in_remarks || record.check_out_remarks) && (
                            <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-700 space-y-1">
                              {record.check_in_remarks && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  <span className="font-bold text-slate-400 dark:text-slate-500">In note: </span>
                                  {record.check_in_remarks}
                                </p>
                              )}
                              {record.check_out_remarks && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  <span className="font-bold text-slate-400 dark:text-slate-500">Out note: </span>
                                  {record.check_out_remarks}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewAttendance;
