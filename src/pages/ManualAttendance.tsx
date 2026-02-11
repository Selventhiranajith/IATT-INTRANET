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
    <div className="max-w-5xl mx-auto py-8 space-y-8 animate-fade-in">
      {/* Header Card */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Today's Attendance</h1>
                <p className="text-slate-500 font-medium mt-1">{format(currentTime, 'EEEE, MMMM do, yyyy')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={cn(
                "px-4 py-2 rounded-xl border flex items-center gap-2 font-black uppercase tracking-widest text-[10px]",
                status === 'active'
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-slate-50 text-slate-500 border-slate-100"
              )}>
                <div className={cn("w-2 h-2 rounded-full", status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-slate-400")} />
                {status === 'active' ? "Currently Working" : "Not Checked In"}
              </div>
              {status === 'active' && activeSession && (
                <div className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 font-bold text-xs flex items-center gap-2">
                  <Timer className="w-3.5 h-3.5" />
                  Running: {calculateSessionDuration(activeSession.check_in)}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">Current Time</p>
              <p className="text-4xl font-black text-slate-900 tracking-tight font-mono">
                {format(currentTime, 'hh:mm:ss a')}
              </p>
            </div>

            <button
              onClick={handleActionClick}
              className={cn(
                "px-10 py-5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 font-black uppercase tracking-[0.2em] text-sm",
                status === 'inactive'
                  ? "bg-primary text-white shadow-primary/25 hover:shadow-primary/30"
                  : "bg-red-500 text-white shadow-red-500/25 hover:shadow-red-500/30"
              )}
            >
              {status === 'inactive' ? (
                <>
                  <LogIn className="w-5 h-5" />
                  Check In
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  Check Out
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Summary */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm h-full">
          <h3 className="text-slate-900 font-black text-lg tracking-tight mb-8 flex items-center gap-3">
            <Timer className="w-5 h-5 text-slate-400" />
            Daily Summary
          </h3>

          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-48 h-48 rounded-full border-[6px] border-slate-50 flex flex-col items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-[6px] border-primary border-t-transparent border-r-transparent -rotate-45 opacity-20" />
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">Total Hours</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{formattedTotal}</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50">
              <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Sessions</span>
              <span className="text-slate-900 font-black">{logs.length}</span>
            </div>
            {/* Add more stats if needed */}
          </div>
        </div>

        {/* Today's Logs */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm h-full">
          <h3 className="text-slate-900 font-black text-lg tracking-tight mb-8 flex items-center gap-3">
            <History className="w-5 h-5 text-slate-400" />
            Today's Timeline
          </h3>

          <div className="space-y-6">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={log.id} className="relative pl-8 pb-8 last:pb-0 border-l-2 border-slate-100 last:border-transparent">
                  {/* Timeline Dot */}
                  <div className={cn(
                    "absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2",
                    log.status === 'completed'
                      ? "bg-slate-100 border-slate-300"
                      : "bg-emerald-100 border-emerald-500 animate-pulse"
                  )} />

                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between bg-slate-50/50 p-6 rounded-2xl hover:bg-slate-50 transition-colors">
                    <div className="space-y-4 flex-1">
                      {/* Check In Info */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-emerald-600 font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg">Check In</span>
                          <span className="text-slate-900 font-bold font-mono">
                            {format(new Date(log.check_in), 'hh:mm a')}
                          </span>
                        </div>
                        <p className="text-slate-500 text-sm italic">"{log.check_in_remarks}"</p>
                      </div>

                      {/* Check Out Info (if exists) */}
                      {log.check_out && (
                        <div className="pt-4 border-t border-slate-200/50">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-red-500 font-black text-[10px] uppercase tracking-widest bg-red-50 px-2 py-1 rounded-lg">Check Out</span>
                            <span className="text-slate-900 font-bold font-mono">
                              {format(new Date(log.check_out), 'hh:mm a')}
                            </span>
                          </div>
                          <p className="text-slate-500 text-sm italic">"{log.check_out_remarks}"</p>
                        </div>
                      )}
                    </div>

                    {/* Duration Badge */}
                    <div className="flex shrink-0">
                      {log.status === 'completed' ? (
                        <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs shadow-sm">
                          {Math.floor((log.duration_minutes || 0) / 60)}h {(log.duration_minutes || 0) % 60}m
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-bold text-xs animate-pulse">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                <History className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-400 font-bold">No activity recorded today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remarks Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              {status === 'inactive' ? <LogIn className="w-6 h-6 text-emerald-500" /> : <LogOut className="w-6 h-6 text-red-500" />}
              {status === 'inactive' ? 'Check In Confirmation' : 'Check Out Confirmation'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-primary" />
              <p className="text-slate-600 text-sm font-medium">
                {status === 'inactive'
                  ? "Please state your reason for checking in (e.g. 'Starting work')."
                  : "Please state your reason for checking out (e.g. 'Lunch Break', 'End of Day')."}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Remarks</label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter your remarks here..."
                className="min-h-[120px] rounded-[1.5rem] border-slate-200 focus:border-primary/20 focus:ring-4 focus:ring-primary/5 p-5 font-medium resize-none text-base"
                autoFocus
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !remarks.trim()}
              className={cn(
                "rounded-xl font-black uppercase tracking-widest px-8 shadow-lg transition-all hover:scale-105 active:scale-95",
                status === 'inactive'
                  ? "bg-primary hover:bg-primary/90 shadow-primary/25"
                  : "bg-red-500 hover:bg-red-600 shadow-red-500/25"
              )}
            >
              {isLoading ? "Processing..." : (status === 'inactive' ? "Confirm Check In" : "Confirm Check Out")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManualAttendance;
