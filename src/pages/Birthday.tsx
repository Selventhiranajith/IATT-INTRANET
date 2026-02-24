import React, { useState, useEffect } from 'react';
import { Cake, Gift, PartyPopper } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api';

interface Birthday {
  id: string;
  name: string;
  date: string;
  department: string;
  email: string;
  rawDate?: Date;
}

const Birthday: React.FC = () => {
  const { user } = useAuth();
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users/birthdays from backend
  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const data = await authApi.getBirthdays();
        if (data.success) {
          let birthdayList = data.data.users
            .filter((u: any) => u.birth_date)
            .map((u: any) => ({
              id: u.id.toString(),
              name: `${u.first_name} ${u.last_name}`,
              date: format(new Date(u.birth_date), 'MMM d'),
              department: u.department || 'General',
              email: u.email,
              branch: u.branch,
              rawDate: new Date(u.birth_date)
            }));

          if (user?.branch) {
            birthdayList = birthdayList.filter((b: any) => b.branch === user.branch);
          }

          setBirthdays(birthdayList);
        }
      } catch (error) {
        console.error('Error fetching birthdays:', error);
        toast.error('Failed to load birthdays');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchBirthdays();
    }
  }, [user]);

  // Get today's date for comparison
  const today = format(new Date(), 'MMM d');
  const todaysBirthdays = birthdays.filter(b => b.date === today);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-pink-50">
            <Cake className="w-8 h-8 text-pink-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Birthdays</h1>
            <p className="text-slate-500 font-medium mt-1">Celebrate and manage employee birthdays</p>
          </div>
        </div>
      </div>

      {/* Today's Birthdays Banner */}
      {todaysBirthdays.length > 0 && (
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-[2.5rem] p-1 shadow-xl shadow-pink-200/50 overflow-hidden group">
          <div className="bg-white/95 backdrop-blur-sm rounded-[2.2rem] p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center animate-bounce">
                <PartyPopper className="w-6 h-6 text-pink-500" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Happening Today!</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {todaysBirthdays.map((birthday) => (
                <div key={birthday.id} className="flex items-center gap-6 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 group-hover:bg-white transition-all group-hover:shadow-md">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-pink-500 to-rose-500 p-1">
                    <div className="w-full h-full rounded-[1.2rem] bg-white flex items-center justify-center text-pink-500 text-2xl font-black">
                      {getInitials(birthday.name)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">{birthday.name}</h3>
                    <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-1">{birthday.department}</p>
                    <div className="flex items-center gap-2 mt-4 text-pink-500 font-black text-[10px] uppercase tracking-[0.2em]">
                      <Gift className="w-4 h-4" />
                      Happy Birthday!
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Birthdays Grid */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">All Birthdays</h2>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 font-medium">Loading birthdays...</div>
        ) : birthdays.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {birthdays.map((birthday) => (
              <div
                key={birthday.id}
                className="p-8 rounded-[2rem] bg-slate-50 hover:bg-white border border-slate-50 hover:border-slate-100 transition-all group hover:shadow-xl hover:shadow-slate-200/50"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary text-xl font-black group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    {getInitials(birthday.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-slate-900 font-black tracking-tight truncate transition-colors group-hover:text-primary">{birthday.name}</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{birthday.department}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100/50">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl text-pink-500 font-black text-[10px] uppercase tracking-[0.15em] border border-pink-50 shadow-sm">
                    <Cake className="w-3.5 h-3.5" />
                    <span>{birthday.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 font-medium">
            No birthdays found. Ensure users have "Date of Birth" set in their profile.
          </div>
        )}
      </div>
    </div>
  );
};

export default Birthday;
