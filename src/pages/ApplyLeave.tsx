import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, FileText, Send, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';

const leaveTypes = [
  { value: 'casual', label: 'Casual Leave', available: 5 },
  { value: 'sick', label: 'Sick Leave', available: 7 },
  { value: 'earned', label: 'Earned Leave', available: 12 },
  { value: 'unpaid', label: 'Unpaid Leave', available: '∞' },
];

const ApplyLeave: React.FC = () => {
  const { user } = useAuth();
  const [leaveType, setLeaveType] = useState('');
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recent leave requests
  const recentRequests = [
    { id: 1, type: 'Casual Leave', from: 'Jan 15, 2024', to: 'Jan 16, 2024', status: 'approved' },
    { id: 2, type: 'Sick Leave', from: 'Jan 28, 2024', to: 'Jan 28, 2024', status: 'approved' },
    { id: 3, type: 'Earned Leave', from: 'Feb 10, 2024', to: 'Feb 14, 2024', status: 'pending' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'pending': return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-400/30';
      default: return 'bg-white/10 text-white/60';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    toast.success('Leave Request Submitted: Your leave application has been sent for approval.', {
      icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    });

    setLeaveType('');
    setFromDate(undefined);
    setToDate(undefined);
    setReason('');
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Leave Application Form */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 rounded-2xl bg-primary/10">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Apply Leave</h1>
              <p className="text-slate-500 font-medium mt-1">Submit a new leave request</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Employee Name */}
              <div className="space-y-2">
                <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Employee Name</label>
                <div className="px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold">
                  {user?.name}
                </div>
              </div>

              {/* Leave Type */}
              <div className="space-y-2">
                <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Leave Type</label>
                <div className="relative">
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    required
                  >
                    <option value="" className="bg-white">Select leave type</option>
                    {leaveTypes.map((type) => (
                      <option key={type.value} value={type.value} className="bg-white">
                        {type.label} ({type.available} available)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-left flex items-center justify-between hover:bg-slate-100 transition-all font-bold',
                        !fromDate ? 'text-slate-400' : 'text-slate-900'
                      )}
                    >
                      {fromDate ? format(fromDate, 'PP') : 'Select date'}
                      <CalendarIcon className="w-5 h-5 text-slate-400" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border border-slate-100 rounded-2xl shadow-2xl" align="start">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                      className="pointer-events-auto"
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-left flex items-center justify-between hover:bg-slate-100 transition-all font-bold',
                        !toDate ? 'text-slate-400' : 'text-slate-900'
                      )}
                    >
                      {toDate ? format(toDate, 'PP') : 'Select date'}
                      <CalendarIcon className="w-5 h-5 text-slate-400" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border border-slate-100 rounded-2xl shadow-2xl" align="start">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                      className="pointer-events-auto"
                      disabled={(date) => date < (fromDate || new Date())}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Reason for Leave</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide the reason for your leave request..."
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 placeholder:text-slate-400 font-medium resize-none h-40 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !leaveType || !fromDate || !toDate}
              className="w-full py-5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Leave Request
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar Info Panels */}
        <div className="lg:col-span-4 space-y-10">
          {/* Leave Balance */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-lg shadow-slate-200/30">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-sky-50">
                <AlertCircle className="w-5 h-5 text-sky-500" />
              </div>
              <h3 className="text-slate-900 font-black text-lg tracking-tight">Leave Balance</h3>
            </div>

            <div className="space-y-4">
              {leaveTypes.map((type) => (
                <div key={type.value} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-primary/20 transition-all">
                  <span className="text-slate-500 font-bold text-sm">{type.label}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-primary">{type.available}</span>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Requests */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-lg shadow-slate-200/30">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-emerald-50">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-slate-900 font-black text-lg tracking-tight">Recent Requests</h3>
            </div>

            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 group hover:border-primary/20 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-900 font-bold text-sm">{request.type}</span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm ${request.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      request.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-red-50 text-red-600 border-red-100'
                      }`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>{request.from} - {request.to}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-orange-100 shrink-0">
                <AlertCircle className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-orange-700 text-xs font-bold leading-relaxed">
                Leave requests should be submitted at least 3 days in advance for planned leaves. Emergency leaves can be applied post-facto.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
