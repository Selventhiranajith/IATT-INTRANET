import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Send, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ManualAttendance: React.FC = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>();
  const [checkIn, setCheckIn] = useState('09:00');
  const [checkOut, setCheckOut] = useState('18:00');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Attendance Submitted', {
      description: 'Your manual attendance has been recorded successfully.',
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    });

    // Reset form
    setDate(undefined);
    setCheckIn('09:00');
    setCheckOut('18:00');
    setReason('');
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 rounded-2xl bg-primary/10">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manual Attendance</h1>
            <p className="text-slate-500 font-medium mt-1">Record your attendance manually</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Employee Name (Read-only) */}
          <div className="space-y-2">
            <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Employee Name</label>
            <div className="px-6 py-4 rounded-2xl bg-background border border-slate-100 text-slate-900 font-bold">
              {user?.name}
            </div>
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Select Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'w-full px-6 py-4 rounded-2xl bg-background border border-slate-100 text-left flex items-center justify-between hover:bg-slate-100 transition-all font-bold',
                    !date ? 'text-slate-400' : 'text-slate-900'
                  )}
                >
                  {date ? format(date, 'PPP') : 'Select date'}
                  <CalendarIcon className="w-5 h-5 text-slate-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border border-slate-100 rounded-2xl shadow-2xl" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="pointer-events-auto"
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Pickers */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Check In Time</label>
              <input
                type="time"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-background border border-slate-100 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Check Out Time</label>
              <input
                type="time"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-background border border-slate-100 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                required
              />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Reason for Manual Entry</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Biometric device was not working"
              className="w-full px-6 py-4 rounded-2xl bg-background border border-slate-100 text-slate-900 placeholder:text-slate-400 font-medium resize-none h-32 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!date || isSubmitting}
            className="w-full py-5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Attendance
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManualAttendance;
