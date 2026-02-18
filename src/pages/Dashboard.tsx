import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import {
  Quote,
  Calendar,
  Users,
  Building2,
  Cake,
  Gift,
  Check,
  X,
  PartyPopper,
  TrendingUp,
  Clock,
  UserCheck,
  Loader2,
  Settings,
  Send,
  FileText,
  Package,
  Bell,
  Files,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  GraduationCap,
  Factory,
  ScrollText,
  Lightbulb,
  ShieldCheck
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval
} from 'date-fns';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
// import { eventsData } from '@/data/eventsData';

interface WidgetCardProps {
  title: string;
  icon: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
}

const WidgetCard: React.FC<WidgetCardProps> = ({
  title,
  icon: Icon,
  iconColor = 'text-primary',
  children,
  className = ''
}) => (
  <div className={`bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
    <div className="flex items-center gap-4 mb-8">
      <div className={`p-3 rounded-2xl bg-slate-50 ${iconColor}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-slate-900 font-bold text-lg tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    desc: '',
    date: '',
    time: '',
    location: ''
  });

  const [recentMembers, setRecentMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  // Events state
  const [realEvents, setRealEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Birthdays state
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [isLoadingBirthdays, setIsLoadingBirthdays] = useState(true);

  // Thought state

  const [currentThought, setCurrentThought] = useState<any>(null);
  const [isLoadingThought, setIsLoadingThought] = useState(true);

  // Fetch the most recent thought
  const fetchRecentThought = async () => {
    setIsLoadingThought(true);
    try {
      const token = localStorage.getItem('token');
      let url = '';

      if (user?.branch) {
        // Fetch thoughts for this branch (backend returns newest first)
        url = `http://localhost:5000/api/thoughts/branch/${user.branch}`;
      } else {
        // Fallback for anyone without a branch (like superadmin)
        url = `http://localhost:5000/api/thoughts/all`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success && data.data.thoughts && data.data.thoughts.length > 0) {
        // Select the very latest one
        setCurrentThought(data.data.thoughts[0]);
      } else {
        // Fallback to a random one if the branch list is empty for some reason
        const randomResponse = await fetch(`http://localhost:5000/api/thoughts/random/${user?.branch || 'all'}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const randomData = await randomResponse.json();

        if (randomData.success && randomData.data.thought) {
          setCurrentThought(randomData.data.thought);
        } else {
          // Default thought
          setCurrentThought({
            content: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
            author: 'Winston Churchill'
          });
        }
      }
    } catch (error) {
      console.error('Fetch thought error:', error);
      setCurrentThought({
        content: 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
        author: 'Winston Churchill'
      });
    } finally {
      setIsLoadingThought(false);
    }
  };

  const fetchRecentMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/recent-joined', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setRecentMembers(data.data.users);
      }
    } catch (error) {
      console.error('Fetch recent members error:', error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const fetchRealEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setRealEvents(data.data);
      }
    } catch (error) {
      console.error('Fetch events error:', error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const fetchBirthdays = async () => {
    setIsLoadingBirthdays(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/birthdays', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBirthdays(data.data.users);
      }
    } catch (error) {
      console.error('Fetch birthdays error:', error);
    } finally {
      setIsLoadingBirthdays(false);
    }
  };

  useEffect(() => {
    fetchRecentMembers();
    fetchRecentThought();
    fetchRealEvents();
    fetchBirthdays();
  }, [user?.branch]);

  // Carousel State
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  // Carousel Effect
  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api, realEvents]);

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const employeeStats = {
    total: recentMembers.length,
    present: recentMembers.length, // Placeholder logic since we don't have real-time attendance yet
    onLeave: 0,
    remote: 0,
  };



  const saveEvent = () => {
    if (!newEvent.title || !newEvent.date) {
      toast.error("Please fill in the required fields");
      return;
    }
    // In a real app, this would update a database or global state
    toast.success("New event added successfully!");
    setIsAddingEvent(false);
    setNewEvent({ title: '', desc: '', date: '', time: '', location: '' });
  };

  return (
    <div className="space-y-8 pb-4">
      {/* Top Section: Welcome Hero & Calendar */}
      {/* Top Section: Welcome, Apps & Thought (Dense 4-Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Welcome Section (2/4 slot) */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="flex flex-col md:flex-row h-full">

            {/* Left Content */}
            <div className="flex-1 p-5 flex flex-col justify-center relative z-10">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Welcome, <span className="text-primary">{user?.branch === 'Guindy' ? 'IAT Technologies' : user?.branch === 'Nungambakkam' ? 'IAT Solutions' : user?.name?.split(" ")[0]}</span>
              </h1>

              {isSuperAdmin && (
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-secondary font-black text-[10px] uppercase tracking-widest w-fit">
                  <ShieldAlert className="w-3 h-3" />
                  System SuperAdmin
                </div>
              )}

              <p className="text-slate-500 font-medium text-base mt-3 leading-relaxed opacity-80">
                Manage all the things from single Dashboard.
              </p>

              <div className="mt-5 flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-primary/5 border border-primary/10 text-primary font-bold text-[10px]">
                  {user?.branch} Branch
                </div>

                <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 italic font-medium text-[10px] uppercase tracking-widest">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </div>
              </div>
            </div>

            {/* Right Video */}
            <div className="flex-1 relative min-h-[180px] md:min-h-0 overflow-hidden rounded-r-[2rem]">
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/30 to-transparent z-10 hidden md:block" />

              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
              >
                <source
                  src="https://player.vimeo.com/external/370331493.sd.mp4?s=7b9050864e4cc7d51a09fbc57bc67537b9bc917d&profile_id=139&oauth2_token_id=57447761"
                  type="video/mp4"
                />
              </video>
            </div>
          </div>
        </div>

        {/* My Apps Section (1/4 slot) */}
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm relative overflow-hidden group">
          <h3 className="text-slate-900 font-black text-[10px] uppercase tracking-widest mb-6 ml-1 opacity-50">
            Tools & Apps
          </h3>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: GraduationCap, label: "LMS", path: "/projects/lms" },
              { icon: Factory, label: "PROD", path: "/projects/production" },
              { icon: Package, label: "PRD", path: "/projects/products" },
              { icon: Files, label: "DOC", path: "/projects/documents" },
              { icon: ScrollText, label: "HR", path: "/misc/hr-policy" },
              { icon: Lightbulb, label: "IDEA", path: "/misc/ideas" },
            ].map((app, i) => (
              <button
                key={i}
                onClick={() => navigate(app.path)}
                className="flex flex-col items-center gap-2 group/app transition-all hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-primary bg-primary/5 group-hover/app:bg-primary group-hover/app:text-white transition-all shadow-sm">
                  <app.icon className="w-5 h-5" />
                </div>

                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter group-hover/app:text-primary transition-colors">
                  {app.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Thought of the Day (1/4 slot) */}
        <div
          onClick={() => navigate('/misc/thoughts')}
          className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col group cursor-pointer hover:shadow-xl hover:shadow-orange-100/50 transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
              <Quote className="w-4.5 h-4.5" />
            </div>
            <span className="text-orange-500 font-black text-[10px] uppercase tracking-widest">
              Thought
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {isLoadingThought ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              </div>
            ) : currentThought ? (
              <>
                <p className="text-slate-800 font-bold italic text-sm leading-relaxed line-clamp-3">
                  "{currentThought.content}"
                </p>
                <p className="text-slate-500 font-bold text-xs mt-2">
                  - {currentThought.author}
                </p>
              </>
            ) : (
              <p className="text-slate-400 text-xs">No thought available</p>
            )}
          </div>



        </div>
      </div>


      {/* IATT Events Section */}
      <div className="bg-white rounded-[2.5rem] p-4 border border-slate-50 shadow-sm relative overflow-hidden">
        <div className="flex items-center mb-10">
          <h2 className="text-3xl font-black tracking-tight text-yellow-400 uppercase">
            IATT EVENT
          </h2>
        </div>

        <div className="relative px-12">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 3000,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {isLoadingEvents ? (
                <div className="w-full flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
              ) : realEvents.length > 0 ? (
                realEvents.map((event, i) => (
                  <CarouselItem key={event.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <div
                      onClick={() => navigate('/events')}
                      className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden group h-full flex flex-col cursor-pointer"
                    >
                      {/* Image */}
                      <div className="h-48 overflow-hidden shrink-0 bg-slate-100">
                        {event.image_url ? (
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <PartyPopper className="w-12 h-12" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-4 flex flex-col flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-slate-900 font-black text-lg leading-snug line-clamp-2">
                            {event.title}
                          </h3>
                          <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-lg shrink-0">
                            {format(new Date(event.event_date), 'MMM d')}
                          </span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-auto">
                          {event.description}
                        </p>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/events');
                          }}
                          className="text-orange-500 font-black text-sm hover:underline text-left pt-2"
                        >
                          Read More
                        </button>
                      </div>
                    </div>
                  </CarouselItem>
                ))
              ) : (
                <div className="w-full flex flex-col items-center justify-center py-20 text-slate-400">
                  <PartyPopper className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-bold">No events scheduled yet</p>
                </div>
              )}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 bg-orange-500 text-white border-none hover:bg-orange-600 hover:text-white h-12 w-12 rounded-full shadow-lg transition-transform hover:scale-110" />
            <CarouselNext className="hidden md:flex -right-4 bg-orange-500 text-white border-none hover:bg-orange-600 hover:text-white h-12 w-12 rounded-full shadow-lg transition-transform hover:scale-110" />
          </Carousel>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3 mt-8">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              className={cn(
                "rounded-full transition-all duration-300",
                index + 1 === current ? "w-3 h-3 bg-orange-500" : "w-3 h-3 bg-orange-200 hover:bg-orange-300"
              )}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      </div>

      {/* Middle Section: User Profile & Schedules & Task Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-white rounded-[2.5rem] p-7 border border-slate-50 shadow-sm flex flex-col gap-6 relative group overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <h3 className="text-slate-900 font-black text-xl tracking-tight">Recent Joined Member</h3>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full">New</span>
          </div>

          {isLoadingMembers ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Loading Members...</p>
            </div>
          ) : recentMembers.length > 0 ? (
            <Carousel
              opts={{ align: "start", loop: true }}
              plugins={[Autoplay({ delay: 4000 })]}
              className="w-full flex-1"
            >
              <CarouselContent>
                {recentMembers.map((member, i) => (
                  <CarouselItem key={i}>
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center gap-6 pb-6 border-b border-slate-50">
                        <Avatar className="w-20 h-20 border-4 border-slate-50 shadow-sm transition-transform group-hover:scale-105">
                          {member.photo && (
                            <AvatarImage src={`http://localhost:5000${member.photo}`} />
                          )}
                          <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
                            {member.first_name[0]}{member.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-slate-900 font-black text-xl tracking-tight leading-tight">{member.first_name} {member.last_name}</h3>
                          <p className="text-primary font-bold text-xs uppercase tracking-widest mt-1 opacity-80">{member.position || 'Staff'}</p>
                        </div>
                      </div>
                      <div className="space-y-5">
                        {[
                          { label: 'Email-ID', value: member.email },
                          { label: 'Designation', value: member.position || 'Staff' },
                          { label: 'Joined at', value: new Date(member.created_at).toLocaleDateString() },
                        ].map((item, j) => (
                          <div key={j} className="flex items-center justify-between">
                            <span className="text-slate-400 font-bold text-sm">{item.label}:</span>
                            <span className="text-slate-900 font-black text-sm tracking-tight">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              <div className="flex justify-between items-center mt-6">
                <div className="flex gap-2">
                  <CarouselPrevious className="relative h-8 w-8 -left-0 translate-y-0 border-slate-100 hover:bg-primary hover:text-white transition-all" />
                  <CarouselNext className="relative h-8 w-8 -right-0 translate-y-0 border-slate-100 hover:bg-primary hover:text-white transition-all" />
                </div>
                <button className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-primary transition-all border border-transparent hover:border-slate-100">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </Carousel>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No recent members found.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2.5rem] p-7 border border-slate-50 shadow-sm flex flex-col group">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-pink-50 text-pink-500">
                <Cake className="w-5 h-5" />
              </div>
              <h3 className="text-slate-900 font-black text-xl tracking-tight">Upcoming Birthday</h3>
            </div>
            <button className="text-[10px] font-black text-pink-500 uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="space-y-6 flex-1 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
            {isLoadingBirthdays ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Checking Dates...</p>
              </div>
            ) : birthdays.length > 0 ? (
              birthdays.map((birthday, i) => (
                <div key={i} className="flex items-center gap-4 group/item cursor-pointer">
                  <Avatar className="w-12 h-12 border-2 border-slate-50 shadow-sm group-hover/item:scale-110 transition-transform">
                    {birthday.photo && (
                      <AvatarImage src={`http://localhost:5000${birthday.photo}`} />
                    )}
                    <AvatarFallback className="bg-pink-50 text-pink-500 font-black text-sm">{birthday.first_name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-slate-900 font-black text-sm tracking-tight truncate group-hover/item:text-pink-500 transition-colors">{birthday.first_name} {birthday.last_name}</h4>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-0.5">{birthday.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-900 font-black text-xs tracking-tight leading-none">
                      {format(new Date(birthday.birth_date), 'MMM d')}
                    </p>
                    <p className="text-[8px] font-black text-pink-400 uppercase tracking-widest mt-1">Birthday</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                <Cake className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">No upcoming birthdays</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-7 border border-slate-50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-slate-900 font-black text-xl tracking-tight">Announcements</h3>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                <Bell className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">No new announcements</p>
              </div>
            </div>
          </div>

          <button disabled className="w-full mt-8 py-4 rounded-2xl bg-slate-50 text-slate-300 font-black text-xs uppercase tracking-widest cursor-not-allowed">
            No More Announcements
          </button>
        </div>
      </div>
      {/* HR Policy Section (Carousel) */}
      <div className="bg-white rounded-[2.5rem] p-6 border border-slate-50 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-500">
              <ScrollText className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              HR POLICY
            </h2>
          </div>
          <button
            onClick={() => navigate('/misc/hr-policy')}
            className="px-6 py-2.5 rounded-2xl bg-indigo-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
          >
            Explore All
          </button>
        </div>

        <div className="relative px-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {[
                { title: "Trainer-Trainee Relations Policy", desc: "Guidelines for professional conduct, equal opportunity, and conflict resolution.", icon: Users, color: "text-indigo-500 bg-indigo-50" },
                { title: "Equal Opportunity Policy", desc: "Commitment to providing equal opportunities and maintaining a discrimination-free environment.", icon: ShieldCheck, color: "text-emerald-500 bg-emerald-50" }
              ].map((policy, i) => (
                <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/2">
                  <div
                    onClick={() => navigate('/misc/hr-policy')}
                    className="bg-slate-50/50 rounded-[2rem] border border-slate-100 p-6 h-full flex items-center gap-6 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                  >
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm", policy.color)}>
                      <policy.icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-slate-900 font-black text-sm tracking-tight mb-1 group-hover:text-primary transition-colors truncate">
                        {policy.title}
                      </h3>
                      <p className="text-slate-500 text-[10px] leading-relaxed font-medium line-clamp-2">
                        {policy.desc}
                      </p>
                      <div className="mt-2 flex items-center text-[8px] font-black text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                        View Details
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 bg-white border-slate-100 text-slate-400 hover:text-primary hover:border-primary transition-all h-12 w-12" />
            <CarouselNext className="hidden md:flex -right-4 bg-white border-slate-100 text-slate-400 hover:text-primary hover:border-primary transition-all h-12 w-12" />
          </Carousel>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{format(new Date(), 'yyyy')} © GLASS AURA PORTAL</p>
        <div className="flex gap-4">
          <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Privacy Policy</button>
          <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Contact Support</button>
        </div>
      </div>


      <AddEventModal
        isOpen={isAddingEvent}
        onClose={() => setIsAddingEvent(false)}
        onSave={saveEvent}
        event={newEvent}
        setEvent={setNewEvent}
      />
    </div>
  );
};

// Add Event Modal
const AddEventModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  event: any;
  setEvent: (event: any) => void;
}> = ({ isOpen, onClose, onSave, event, setEvent }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-[2.5rem] p-8">
      <DialogHeader>
        <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Add New Event</DialogTitle>
      </DialogHeader>
      <div className="space-y-6 py-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-slate-400">Event Title</Label>
          <Input
            id="title"
            value={event.title}
            onChange={(e) => setEvent({ ...event, title: e.target.value })}
            placeholder="Enter event title"
            className="rounded-xl border-slate-100 focus:ring-primary h-12"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-xs font-black uppercase tracking-widest text-slate-400">Date</Label>
            <Input
              id="date"
              type="date"
              value={event.date}
              onChange={(e) => setEvent({ ...event, date: e.target.value })}
              className="rounded-xl border-slate-100 focus:ring-primary h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time" className="text-xs font-black uppercase tracking-widest text-slate-400">Time</Label>
            <Input
              id="time"
              type="time"
              value={event.time}
              onChange={(e) => setEvent({ ...event, time: e.target.value })}
              className="rounded-xl border-slate-100 focus:ring-primary h-12"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location" className="text-xs font-black uppercase tracking-widest text-slate-400">Location</Label>
          <Input
            id="location"
            value={event.location}
            onChange={(e) => setEvent({ ...event, location: e.target.value })}
            placeholder="e.g. Main Hall"
            className="rounded-xl border-slate-100 focus:ring-primary h-12"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc" className="text-xs font-black uppercase tracking-widest text-slate-400">Description</Label>
          <Textarea
            id="desc"
            value={event.desc}
            onChange={(e) => setEvent({ ...event, desc: e.target.value })}
            placeholder="Brief event description..."
            className="rounded-xl border-slate-100 focus:ring-primary min-h-[100px] resize-none"
          />
        </div>
      </div>
      <DialogFooter className="gap-3">
        <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">Cancel</Button>
        <Button onClick={onSave} className="rounded-xl bg-orange-500 hover:bg-orange-600 font-bold px-8">Save Event</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default Dashboard;
