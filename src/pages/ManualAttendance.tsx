import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Send, CheckCircle2, LogIn, LogOut, Timer, History, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AttendanceLog {
  id: number;
  check_in: string;
  check_out?: string;
  check_in_remarks?: string;
  check_out_remarks?: string;
  status: 'active' | 'completed';
  duration_minutes?: number;
}

const ManualAttendance: React.FC = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState<'active' | 'inactive'>('inactive');
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [formattedTotal, setFormattedTotal] = useState('0h 0m');
  const [activeSession, setActiveSession] = useState<AttendanceLog | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isinitializing, setIsInitializing] = useState(true);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's status on mount
  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/attendance/today', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStatus(data.data.status);
        setLogs(data.data.logs);
        setTotalMinutes(data.data.totalMinutes);
        setFormattedTotal(data.data.formattedTotal);
        setActiveSession(data.data.activeSession);
      }
    } catch (error) {
      console.error('Fetch status error:', error);
      toast.error('Failed to load attendance status');
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleActionClick = () => {
    setRemarks('');
    setIsModalOpen(true);
  };

  const calculateSessionDuration = (checkInStr: string) => {
    const checkIn = new Date(checkInStr);
    const now = currentTime;
    const diffMs = now.getTime() - checkIn.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  const handleSubmit = async () => {
    if (!remarks.trim()) {
      toast.error('Please enter a remark (e.g. "Starting work", "Lunch break")');
      return;
    }

    setIsLoading(true);
    const endpoint = status === 'inactive' ? 'check-in' : 'check-out';

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/attendance/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ remarks })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(status === 'inactive' ? 'Checked In Successfully' : 'Checked Out Successfully');
        setIsModalOpen(false);
        fetchStatus(); // Refresh data
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch (error) {
      console.error('Attendance action error:', error);
      toast.error('Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  if (isinitializing) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6 animate-fade-in">

      {/* ── Hero / Check-In Card ── YouTube channel banner style */}
      <div className={cn(
        "relative rounded-2xl overflow-hidden shadow-lg",
        status === 'active'
          ? "bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400"
          : "bg-gradient-to-br from-primary via-primary/90 to-blue-600"
      )}>
        {/* Decorative blobs */}
        <div className="absolute top-[-30%] right-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-40%] left-[-5%] w-72 h-72 bg-black/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Left: Title + status + date */}
          <div className="text-white space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight leading-none">Today's Attendance</h1>
                <p className="text-white/70 text-sm font-medium mt-0.5">{format(currentTime, 'EEEE, MMMM do, yyyy')}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {/* Status pill */}
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm border",
                status === 'active'
                  ? "bg-white/20 text-white border-white/30"
                  : "bg-black/20 text-white/80 border-white/20"
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full", status === 'active' ? "bg-white animate-pulse" : "bg-white/50")} />
                {status === 'active' ? 'Currently Working' : 'Not Checked In'}
              </span>

              {/* Live session timer */}
              {status === 'active' && activeSession && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black/20 text-white border border-white/20 backdrop-blur-sm">
                  <Timer className="w-3 h-3" />
                  {calculateSessionDuration(activeSession.check_in)}
                </span>
              )}
            </div>
          </div>

          {/* Right: Clock + Action button */}
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="text-center">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Current Time</p>
              <p className="text-4xl font-black tracking-tight font-mono tabular-nums">
                {format(currentTime, 'hh:mm:ss a')}
              </p>
            </div>

            <button
              onClick={handleActionClick}
              className={cn(
                "px-8 py-3.5 rounded-xl font-black uppercase tracking-[0.15em] text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg",
                status === 'inactive'
                  ? "bg-white text-primary hover:bg-white/90 shadow-black/20"
                  : "bg-red-500 text-white hover:bg-red-400 shadow-red-900/30"
              )}
            >
              {status === 'inactive' ? (
                <><LogIn className="w-4 h-4" /> Check In</>
              ) : (
                <><LogOut className="w-4 h-4" /> Check Out</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats + Timeline (YouTube sidebar + feed layout) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Daily Summary Card — like a YouTube "channel info" sidebar card */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          {/* Card thumbnail strip */}
          <div className="h-2 bg-gradient-to-r from-primary to-blue-400" />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Timer className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-black text-slate-900 text-base tracking-tight">Daily Summary</h3>
            </div>

            {/* Total hours — like a video thumbnail with play time overlay */}
            <div className="bg-slate-50 rounded-xl p-5 flex flex-col items-center justify-center mb-4">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Hours</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{formattedTotal}</p>
            </div>

            {/* Meta row — like video view count / date */}
            <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Sessions Today</span>
              <span className="text-slate-900 font-black text-lg">{logs.length}</span>
            </div>
          </div>
        </div>

        {/* Today's Timeline — like YouTube video feed cards */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-400" />
          <div className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <History className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-black text-slate-900 text-base tracking-tight">Today's Timeline</h3>
            </div>

            <div className="space-y-3">
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  /* Each session as a YouTube-style horizontal video card */
                  <div
                    key={log.id}
                    className="flex gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-default group"
                  >
                    {/* Thumbnail / status column */}
                    <div className={cn(
                      "w-20 h-20 rounded-xl flex-shrink-0 flex flex-col items-center justify-center text-center font-black text-xs relative overflow-hidden",
                      log.status === 'completed'
                        ? "bg-slate-100 text-slate-600"
                        : "bg-emerald-50 text-emerald-700"
                    )}>
                      {log.status === 'completed' ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 mb-1 text-slate-400" />
                          <span className="uppercase tracking-wider text-[9px]">Done</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mb-1.5" />
                          <span className="uppercase tracking-wider text-[9px]">Live</span>
                        </>
                      )}
                      {/* Duration overlay — like video length badge in YouTube */}
                      <div className={cn(
                        "absolute bottom-0 inset-x-0 py-1 text-center text-[9px] font-black uppercase",
                        log.status === 'completed'
                          ? "bg-slate-700 text-white"
                          : "bg-emerald-500 text-white"
                      )}>
                        {log.status === 'completed'
                          ? `${Math.floor((log.duration_minutes || 0) / 60)}h ${(log.duration_minutes || 0) % 60}m`
                          : calculateSessionDuration(log.check_in)
                        }
                      </div>
                    </div>

                    {/* Card metadata — like YouTube title + channel + views */}
                    <div className="flex flex-col justify-between py-0.5 flex-1 min-w-0">
                      <div>
                        {/* Session number — like video title */}
                        <p className="text-slate-900 font-bold text-[13px] leading-tight mb-1.5">
                          Session {index + 1}
                        </p>

                        {/* Check-in row */}
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">IN</span>
                          <span className="text-slate-700 font-bold font-mono text-xs">{format(new Date(log.check_in), 'hh:mm a')}</span>
                          {log.check_in_remarks && (
                            <span className="text-slate-400 text-[11px] italic truncate">· "{log.check_in_remarks}"</span>
                          )}
                        </div>

                        {/* Check-out row (if exists) */}
                        {log.check_out && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">OUT</span>
                            <span className="text-slate-700 font-bold font-mono text-xs">{format(new Date(log.check_out), 'hh:mm a')}</span>
                            {log.check_out_remarks && (
                              <span className="text-slate-400 text-[11px] italic truncate">· "{log.check_out_remarks}"</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                    <History className="w-7 h-7 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold text-sm">No activity recorded today</p>
                  <p className="text-slate-300 text-xs mt-1">Check in to start tracking</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Remarks Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[460px] rounded-2xl border-none shadow-2xl p-0 overflow-hidden">

          {/* ── Gradient Banner Header (like YouTube video card top) ── */}
          <div className={cn(
            "relative px-8 pt-8 pb-10 flex flex-col items-center text-center overflow-hidden",
            status === 'inactive'
              ? "bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400"
              : "bg-gradient-to-br from-red-600 via-red-500 to-rose-400"
          )}>
            {/* Decorative blobs */}
            <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-[-30%] left-[-10%] w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />

            {/* Icon circle */}
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 shadow-lg">
              {status === 'inactive'
                ? <LogIn className="w-7 h-7 text-white" />
                : <LogOut className="w-7 h-7 text-white" />}
            </div>

            <div className="relative z-10">
              <h2 className="text-xl font-black text-white tracking-tight">
                {status === 'inactive' ? 'Check In' : 'Check Out'}
              </h2>
              <p className="text-white/70 text-sm font-medium mt-1">
                {format(currentTime, 'hh:mm:ss a')} · {format(currentTime, 'MMM do, yyyy')}
              </p>
            </div>
          </div>

          {/* ── Card Body ── */}
          <div className="bg-white px-7 pt-5 pb-7 space-y-5">

            {/* Info hint row */}
            <div className={cn(
              "flex items-start gap-3 p-3.5 rounded-xl border text-sm font-medium",
              status === 'inactive'
                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                : "bg-red-50 border-red-100 text-red-800"
            )}>
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <p>
                {status === 'inactive'
                  ? "State your reason for checking in (e.g. 'Starting work', 'Back from break')."
                  : "State your reason for checking out (e.g. 'Lunch break', 'End of day')."}
              </p>
            </div>

            {/* Remarks textarea */}
            <div className="space-y-1.5">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Remarks</label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter your remarks here..."
                className="min-h-[110px] rounded-xl border-slate-200 focus:border-primary/30 focus:ring-2 focus:ring-primary/10 p-4 font-medium resize-none text-sm"
                autoFocus
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                Cancel
              </Button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !remarks.trim()}
                className={cn(
                  "flex-1 py-3 rounded-xl font-black uppercase tracking-[0.12em] text-sm text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg",
                  status === 'inactive'
                    ? "bg-gradient-to-r from-emerald-600 to-teal-500 shadow-emerald-500/30"
                    : "bg-gradient-to-r from-red-600 to-rose-500 shadow-red-500/30"
                )}
              >
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</>
                ) : status === 'inactive' ? (
                  <><LogIn className="w-4 h-4" /> Confirm Check In</>
                ) : (
                  <><LogOut className="w-4 h-4" /> Confirm Check Out</>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManualAttendance;
