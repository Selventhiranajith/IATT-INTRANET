import React, { useState } from 'react';
import { Fingerprint, ClipboardList, FileText, Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface AttendanceRecord {
  id: number;
  employee: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'late' | 'absent' | 'half-day';
  type?: 'bio' | 'manual';
}

interface LeaveRecord {
  id: number;
  employee: string;
  type: string;
  from: string;
  to: string;
  days: number;
  status: 'approved' | 'pending' | 'rejected';
  reason: string;
}

const ViewAttendance: React.FC = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Determine which tab to show based on route
  const getDefaultTab = () => {
    if (location.pathname.includes('bio')) return 'bio';
    if (location.pathname.includes('view-manual')) return 'manual';
    if (location.pathname.includes('view-leave')) return 'leave';
    return 'bio';
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());

  // Update active tab when route changes
  React.useEffect(() => {
    setActiveTab(getDefaultTab());
  }, [location.pathname]);

  const bioAttendance: AttendanceRecord[] = [
    { id: 1, employee: 'John Doe', date: 'Feb 1, 2024', checkIn: '09:02 AM', checkOut: '06:15 PM', status: 'present', type: 'bio' },
    { id: 2, employee: 'Sarah Johnson', date: 'Feb 1, 2024', checkIn: '09:30 AM', checkOut: '06:00 PM', status: 'late', type: 'bio' },
    { id: 3, employee: 'Mike Chen', date: 'Feb 1, 2024', checkIn: '08:55 AM', checkOut: '06:30 PM', status: 'present', type: 'bio' },
    { id: 4, employee: 'Emily Davis', date: 'Feb 1, 2024', checkIn: '-', checkOut: '-', status: 'absent', type: 'bio' },
    { id: 5, employee: 'Alex Thompson', date: 'Feb 1, 2024', checkIn: '09:00 AM', checkOut: '01:30 PM', status: 'half-day', type: 'bio' },
  ];

  const manualAttendance: AttendanceRecord[] = [
    { id: 1, employee: 'John Doe', date: 'Jan 28, 2024', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'present', type: 'manual' },
    { id: 2, employee: 'Lisa Wang', date: 'Jan 29, 2024', checkIn: '09:15 AM', checkOut: '05:45 PM', status: 'present', type: 'manual' },
    { id: 3, employee: 'Tom Wilson', date: 'Jan 30, 2024', checkIn: '08:45 AM', checkOut: '06:30 PM', status: 'present', type: 'manual' },
  ];

  const leaveRecords: LeaveRecord[] = [
    { id: 1, employee: 'John Doe', type: 'Casual Leave', from: 'Feb 5, 2024', to: 'Feb 6, 2024', days: 2, status: 'approved', reason: 'Personal work' },
    { id: 2, employee: 'Sarah Johnson', type: 'Sick Leave', from: 'Feb 8, 2024', to: 'Feb 8, 2024', days: 1, status: 'pending', reason: 'Doctor appointment' },
    { id: 3, employee: 'Mike Chen', type: 'Earned Leave', from: 'Feb 15, 2024', to: 'Feb 20, 2024', days: 6, status: 'approved', reason: 'Family vacation' },
    { id: 4, employee: 'Emily Davis', type: 'Casual Leave', from: 'Feb 12, 2024', to: 'Feb 12, 2024', days: 1, status: 'rejected', reason: 'Personal' },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      present: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      late: 'bg-amber-50 text-amber-600 border-amber-100',
      absent: 'bg-red-50 text-red-600 border-red-100',
      'half-day': 'bg-orange-50 text-orange-600 border-orange-100',
      approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      pending: 'bg-amber-50 text-amber-600 border-amber-100',
      rejected: 'bg-red-50 text-red-600 border-red-100',
    };
    return styles[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const renderAttendanceTable = (data: AttendanceRecord[]) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-4 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Employee</th>
            <th className="text-left py-4 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Date</th>
            <th className="text-left py-4 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Check In</th>
            <th className="text-left py-4 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Check Out</th>
            <th className="text-left py-4 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((record) => (
            <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
              <td className="py-4 px-4 text-slate-900 font-bold">{record.employee}</td>
              <td className="py-4 px-4 text-slate-500 font-medium">{record.date}</td>
              <td className="py-4 px-4 text-slate-500 font-medium">{record.checkIn}</td>
              <td className="py-4 px-4 text-slate-500 font-medium">{record.checkOut}</td>
              <td className="py-4 px-4">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${getStatusBadge(record.status)}`}>
                  {record.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderLeaveTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-4 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Employee</th>
            <th className="text-left py-4 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Type</th>
            <th className="text-left py-4 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">From</th>
            <th className="text-left py-4 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">To</th>
            <th className="text-left py-4 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Days</th>
            <th className="text-left py-4 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Status</th>
            <th className="text-left py-4 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Reason</th>
          </tr>
        </thead>
        <tbody>
          {leaveRecords.map((record) => (
            <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
              <td className="py-4 px-4 text-slate-900 font-bold">{record.employee}</td>
              <td className="py-4 px-4 text-slate-500 font-medium">{record.type}</td>
              <td className="py-4 px-4 text-slate-500 font-medium">{record.from}</td>
              <td className="py-4 px-4 text-slate-500 font-medium">{record.to}</td>
              <td className="py-4 px-4 text-slate-500 font-medium">{record.days}</td>
              <td className="py-4 px-4">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${getStatusBadge(record.status)}`}>
                  {record.status}
                </span>
              </td>
              <td className="py-4 px-4 text-slate-400 text-sm font-medium max-w-[200px] truncate">{record.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-primary/10">
            <ClipboardList className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Attendance Logs</h1>
            <p className="text-slate-500 font-medium mt-1">Review biometric, manual, and leave history</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-6 py-4 bg-white border border-slate-100 text-slate-500 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-3 font-black uppercase tracking-widest text-[10px]">
            <Download className="w-4 h-4" />
            Export Monthly Report
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <TabsList className="bg-slate-100/50 border border-slate-100 p-1.5 rounded-[1.5rem] w-fit">
              <TabsTrigger value="bio" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-slate-400 font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-[1.25rem] transition-all">
                <Fingerprint className="w-3.5 h-3.5 mr-2" />
                Biometric
              </TabsTrigger>
              <TabsTrigger value="manual" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-slate-400 font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-[1.25rem] transition-all">
                <ClipboardList className="w-3.5 h-3.5 mr-2" />
                Manual
              </TabsTrigger>
              {/* <TabsTrigger value="leave" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm text-slate-400 font-black uppercase tracking-widest text-[10px] px-8 py-4 rounded-[1.25rem] transition-all">
                <FileText className="w-3.5 h-3.5 mr-2" />
                Leave history
              </TabsTrigger> */}
            </TabsList>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Search */}
              <div className="relative group w-full sm:w-auto">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Quick search..."
                  className="pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-50 text-slate-900 placeholder:text-slate-400 font-bold w-full sm:w-48 focus:sm:w-80 transition-all focus:outline-none focus:bg-white focus:border-primary/20 shadow-inner"
                />
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Filter */}
                <button className="flex-1 sm:flex-none p-4 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary transition-all">
                  <Filter className="w-5 h-5" />
                </button>

                {/* Export Mobile/Icon */}
                <button className="flex-1 sm:flex-none p-4 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-all">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <TabsContent value="bio" className="mt-0 ring-offset-transparent focus-visible:ring-0">
            <div className="bg-slate-50/30 rounded-[2rem] border border-slate-50 overflow-hidden">
               {renderAttendanceTable(bioAttendance)}
            </div>
          </TabsContent>

          <TabsContent value="manual" className="mt-0 ring-offset-transparent focus-visible:ring-0">
            <div className="bg-slate-50/30 rounded-[2rem] border border-slate-50 overflow-hidden">
              {renderAttendanceTable(manualAttendance)}
            </div>
          </TabsContent>

          <TabsContent value="leave" className="mt-0 ring-offset-transparent focus-visible:ring-0">
            <div className="bg-slate-50/30 rounded-[2rem] border border-slate-50 overflow-hidden">
              {renderLeaveTable()}
            </div>
          </TabsContent>

          {/* Pagination Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-slate-50">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] leading-none">Showing 1 to 5 of 24 entries</p>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="p-4 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary transition-all disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:border-slate-100"
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl">
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-12 h-12 rounded-xl text-xs font-black transition-all",
                      currentPage === page 
                        ? 'bg-white text-primary shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600'
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-4 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ViewAttendance;
