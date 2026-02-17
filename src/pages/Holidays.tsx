import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PartyPopper, Plus, Calendar, Edit2, Trash2, X, Check, Loader2, User } from 'lucide-react';
import { format } from 'date-fns';
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

const Holidays: React.FC = () => {
  const { isAdmin } = useAuth();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentHoliday, setCurrentHoliday] = useState<Holiday | null>(null);
  const [showCreatedBy, setShowCreatedBy] = useState(false);

  // Form state
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState<Date | undefined>(undefined);
  const [holidayDescription, setHolidayDescription] = useState('');

  // Fetch holidays from backend
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

  // Create new holiday
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

  // Update holiday
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

  // Delete holiday
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

  // Open edit modal
  const openEditModal = (holiday: Holiday) => {
    setCurrentHoliday(holiday);
    setHolidayName(holiday.name);
    setHolidayDate(new Date(holiday.date));
    setHolidayDescription(holiday.description || '');
    setIsEditModalOpen(true);
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
            <p className="text-slate-500 font-medium mt-1">Company holidays calendar</p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-8 py-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-3 font-black uppercase tracking-[0.2em] text-sm"
          >
            <Plus className="w-5 h-5" />
            Add New Holiday
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Holidays...</p>
        </div>
      ) : holidays.length > 0 ? (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Holiday Name</th>
                <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Date</th>
                <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px] hidden md:table-cell">Description</th>
                {showCreatedBy && (
                  <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px] hidden lg:table-cell">Created By</th>
                )}
                {isAdmin && (
                  <th className="text-right py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday) => (
                <tr key={holiday.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                        <PartyPopper className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-slate-900 font-black tracking-tight">{holiday.name}</span>
                    </div>
                  </td>
                  <td className="py-6 px-8 text-slate-700 font-bold">
                    {format(new Date(holiday.date), 'MMM d, yyyy')}
                  </td>
                  <td className="py-6 px-8 text-slate-500 text-sm font-medium hidden md:table-cell">
                    {holiday.description || '–'}
                  </td>
                  {showCreatedBy && (
                    <td className="py-6 px-8 hidden lg:table-cell">
                      <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
                        <User className="w-4 h-4 text-slate-400" />
                        {holiday.creator_first_name} {holiday.creator_last_name}
                      </div>
                    </td>
                  )}
                  {isAdmin && (
                    <td className="py-6 px-8">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEditModal(holiday)}
                          className="p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100 text-slate-400 hover:text-primary transition-all"
                        >
                          <Edit2 className="w-4.5 h-4.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteHoliday(holiday.id)}
                          className="p-3 rounded-xl hover:bg-red-50 hover:shadow-sm border border-transparent hover:border-red-100 text-slate-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-20 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <PartyPopper className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-slate-900 font-black text-xl mb-2">No Holidays Yet</h3>
          <p className="text-slate-400 font-medium mb-6">Start adding holidays to the calendar!</p>
          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
            >
              Add First Holiday
            </button>
          )}
        </div>
      )}

      {/* Add Holiday Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[525px] rounded-[2rem] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Add New Holiday</DialogTitle>
            <p className="text-slate-500 font-medium text-sm mt-2">Add a holiday to the company calendar</p>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Holiday Name</Label>
              <Input
                placeholder="e.g., Independence Day"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                className="rounded-xl h-12 border-slate-100 focus:border-primary/20 focus:ring-primary/10 font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'w-full px-6 py-3.5 rounded-xl bg-slate-50 border border-slate-100 text-left flex items-center justify-between hover:bg-slate-100 transition-all font-medium',
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
              <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Description (Optional)</Label>
              <Textarea
                placeholder="Brief description of the holiday..."
                value={holidayDescription}
                onChange={(e) => setHolidayDescription(e.target.value)}
                className="min-h-[100px] rounded-xl border-slate-100 focus:border-primary/20 focus:ring-primary/10 font-medium resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              onClick={() => {
                setIsAddModalOpen(false);
                setHolidayName('');
                setHolidayDate(undefined);
                setHolidayDescription('');
              }}
              variant="outline"
              className="rounded-xl font-bold border-slate-100 text-slate-500 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateHoliday}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl font-black uppercase tracking-widest px-8 shadow-lg shadow-primary/25"
            >
              Add Holiday
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Holiday Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[525px] rounded-[2rem] border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Edit Holiday</DialogTitle>
            <p className="text-slate-500 font-medium text-sm mt-2">Update holiday details</p>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Holiday Name</Label>
              <Input
                placeholder="e.g., Independence Day"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                className="rounded-xl h-12 border-slate-100 focus:border-primary/20 focus:ring-primary/10 font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'w-full px-6 py-3.5 rounded-xl bg-slate-50 border border-slate-100 text-left flex items-center justify-between hover:bg-slate-100 transition-all font-medium',
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
              <Label className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Description (Optional)</Label>
              <Textarea
                placeholder="Brief description of the holiday..."
                value={holidayDescription}
                onChange={(e) => setHolidayDescription(e.target.value)}
                className="min-h-[100px] rounded-xl border-slate-100 focus:border-primary/20 focus:ring-primary/10 font-medium resize-none"
              />
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              onClick={() => {
                setIsEditModalOpen(false);
                setCurrentHoliday(null);
                setHolidayName('');
                setHolidayDate(undefined);
                setHolidayDescription('');
              }}
              variant="outline"
              className="rounded-xl font-bold border-slate-100 text-slate-500 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateHoliday}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl font-black uppercase tracking-widest px-8 shadow-lg shadow-primary/25"
            >
              Update Holiday
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Holidays;
