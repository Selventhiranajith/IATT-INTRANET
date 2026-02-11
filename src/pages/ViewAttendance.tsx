import React, { useState, useEffect } from 'react';
import { Fingerprint, ClipboardList, Search, Filter, Download, Loader2, X, History, Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from 'date-fns';
import { toast } from 'sonner';

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

const ViewAttendance: React.FC = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // History Modal State
  const [selectedUser, setSelectedUser] = useState<AttendanceRecord | null>(null);
  const [historyData, setHistoryData] = useState<AttendanceRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Determine which tab to show based on route
  const getDefaultTab = () => {
    if (location.pathname.includes('bio')) return 'bio';
    if (location.pathname.includes('view-manual')) return 'manual';
    return 'manual';
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());

  // Update active tab when route changes
  useEffect(() => {
    setActiveTab(getDefaultTab());
  }, [location.pathname]);

  // Fetch all data
  const fetchAttendanceLogs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      if (searchQuery) queryParams.append('search', searchQuery);

      const response = await fetch(`http://localhost:5000/api/attendance/all?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAttendanceData(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch attendance logs');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'manual') {
      fetchAttendanceLogs();
    }
  }, [activeTab, searchQuery]);

  // Fetch history for specific user
  const fetchUserHistory = async (userId: string) => {
    setIsHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Currently reusing all endpoint with employee_id filter
      // Ideally backend should support user_id directly, but employee_id works if unique
      // The backend model supports employee_id filter on users table join

      // Wait, the API supports employee_id which is the string ID like "EMP001"
      // But here I'm passing the string ID from the record

      const response = await fetch(`http://localhost:5000/api/attendance/all?employee_id=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setHistoryData(data.data);
      }
    } catch (error) {
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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      completed: 'bg-slate-50 text-slate-600 border-slate-100',
    };
    return styles[status] || 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const renderAttendanceTable = (data: AttendanceRecord[], isInteractive = true) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-4 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Employee</th>
            <th className="text-left py-4 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Date</th>
            <th className="text-left py-4 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Check In</th>
            <th className="text-left py-4 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Check Out</th>
            <th className="text-left py-4 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Duration</th>
            <th className="text-left py-4 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Status</th>
            <th className="text-left py-4 px-4 text-slate-400 font-black uppercase tracking-widest text-[10px]">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((record) => (
              <tr
                key={record.id}
                onClick={() => isInteractive && handleRowClick(record)}
                className={`border-b border-slate-50 transition-colors group ${isInteractive ? 'hover:bg-slate-50 cursor-pointer' : ''}`}
              >
                <td className="py-4 px-4">
                  <div>
                    <p className="text-slate-900 font-bold text-sm">{record.first_name} {record.last_name}</p>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{record.employee_id}</p>
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-500 font-medium text-sm">
                  {format(new Date(record.date), 'MMM d, yyyy')}
                </td>
                <td className="py-4 px-4 text-slate-500 font-medium text-sm font-mono">
                  {format(new Date(record.check_in), 'hh:mm a')}
                </td>
                <td className="py-4 px-4 text-slate-500 font-medium text-sm font-mono">
                  {record.check_out ? format(new Date(record.check_out), 'hh:mm a') : '-'}
                </td>
                <td className="py-4 px-4 text-slate-900 font-bold text-sm">
                  {record.status === 'completed' ? formatDuration(record.duration_minutes) : <span className="text-emerald-500 animate-pulse">Running...</span>}
                </td>
                <td className="py-4 px-4">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${getStatusBadge(record.status)}`}>
                    {record.status === 'active' ? 'Working' : 'Completed'}
                  </span>
                </td>
                <td className="py-4 px-4 max-w-[200px]">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">In:</span>
                    <span className="text-slate-600 text-xs truncate" title={record.check_in_remarks}>{record.check_in_remarks}</span>
                    {record.check_out_remarks && (
                      <>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Out:</span>
                        <span className="text-slate-600 text-xs truncate" title={record.check_out_remarks}>{record.check_out_remarks}</span>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                {isLoading || isHistoryLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading Data...
                  </div>
                ) : "No records found."}
              </td>
            </tr>
          )}
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
            </TabsList>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Search */}
              <div className="relative group w-full sm:w-auto">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name..."
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
            <div className="bg-slate-50/30 rounded-[2rem] border border-slate-50 overflow-hidden flex flex-col items-center justify-center p-20 text-center">
              <Fingerprint className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Biometric integration pending</p>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="mt-0 ring-offset-transparent focus-visible:ring-0">
            <div className="bg-slate-50/30 rounded-[2rem] border border-slate-50 overflow-hidden">
              {renderAttendanceTable(attendanceData)}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* History Modal */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="sm:max-w-4xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden max-h-[85vh] flex flex-col">
          <DialogHeader className="p-8 pb-4 border-b border-slate-50 bg-white">
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <History className="w-6 h-6 text-primary" />
              Attendance History
            </DialogTitle>
            {selectedUser && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-slate-500 font-bold text-sm">{selectedUser.first_name} {selectedUser.last_name}</span>
                <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-wider">{selectedUser.employee_id}</span>
              </div>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-8 pt-4">
            {renderAttendanceTable(historyData, false)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewAttendance;
