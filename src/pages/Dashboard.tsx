import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import {
  Quote, Calendar, Users, Building2, Cake, Gift, Check, X,
  PartyPopper, TrendingUp, Clock, UserCheck, Loader2, Settings,
  Send, FileText, Package, Bell, Files, ChevronLeft, ChevronRight,
  ShieldAlert, GraduationCap, Factory, ScrollText, Lightbulb,
  ShieldCheck, Sparkles, ArrowRight, MapPin, Star, Zap, Users2
} from 'lucide-react';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, eachDayOfInterval, isPast, isToday
} from 'date-fns';
import {
  Carousel, CarouselContent, CarouselItem,
  CarouselNext, CarouselPrevious, type CarouselApi
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

/* ─── helpers ─── */
const mediaUrl = (src: string) =>
  src?.startsWith('http') || src?.startsWith('blob:') ? src : `http://localhost:5000${src}`;

const getEventStatus = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isToday(d)) return { label: 'Today', cls: 'bg-emerald-100 text-emerald-600 border-emerald-200' };
    if (isPast(d)) return { label: 'Past', cls: 'bg-slate-100 text-slate-400 border-slate-200' };
    return { label: 'Upcoming', cls: 'bg-amber-100 text-amber-600 border-amber-200' };
  } catch { return { label: 'Upcoming', cls: 'bg-amber-100 text-amber-600 border-amber-200' }; }
};

/* ─── Dashboard ─── */
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', desc: '', date: '', time: '', location: '' });

  const [recentMembers, setRecentMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  const [realEvents, setRealEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [isLoadingBirthdays, setIsLoadingBirthdays] = useState(true);

  const [currentThought, setCurrentThought] = useState<any>(null);
  const [isLoadingThought, setIsLoadingThought] = useState(true);

  /* ── API calls (unchanged) ── */
  const fetchRecentThought = async () => {
    setIsLoadingThought(true);
    try {
      const token = localStorage.getItem('token');
      const url = user?.branch
        ? `http://localhost:5000/api/thoughts/branch/${user.branch}`
        : `http://localhost:5000/api/thoughts/all`;
      const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await response.json();
      if (data.success && data.data.thoughts?.length > 0) {
        setCurrentThought(data.data.thoughts[0]);
      } else {
        const rr = await fetch(`http://localhost:5000/api/thoughts/random/${user?.branch || 'all'}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const rd = await rr.json();
        setCurrentThought(rd.success && rd.data.thought
          ? rd.data.thought
          : { content: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' }
        );
      }
    } catch {
      setCurrentThought({ content: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' });
    } finally { setIsLoadingThought(false); }
  };

  const fetchRecentMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/recent-joined', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setRecentMembers(data.data.users);
    } catch { } finally { setIsLoadingMembers(false); }
  };

  const fetchRealEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/events', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setRealEvents(data.data);
    } catch { } finally { setIsLoadingEvents(false); }
  };

  const fetchBirthdays = async () => {
    setIsLoadingBirthdays(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/birthdays', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setBirthdays(data.data.users);
    } catch { } finally { setIsLoadingBirthdays(false); }
  };

  useEffect(() => {
    fetchRecentMembers();
    fetchRecentThought();
    fetchRealEvents();
    fetchBirthdays();
  }, [user?.branch]);

  /* ── Carousel state ── */
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => setCurrent(api.selectedScrollSnap() + 1));
  }, [api, realEvents]);

  /* ── Calendar ── */
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  const saveEvent = () => {
    if (!newEvent.title || !newEvent.date) { toast.error("Please fill in the required fields"); return; }
    toast.success("New event added successfully!");
    setIsAddingEvent(false);
    setNewEvent({ title: '', desc: '', date: '', time: '', location: '' });
  };

  /* ────────────────────── JSX ────────────────────── */
  return (
    <div className="space-y-6 pb-8">

      {/* ══════════════════════════════════════════════════
          ROW 1 — CINEMATIC HERO + QUICK TOOLS + THOUGHT
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── HERO (7 cols) ── */}
        <div className="lg:col-span-7 relative rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl min-h-[260px] group">
          {/* background blobs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-orange-600/20 rounded-full blur-[120px]" />
            <div className="absolute -bottom-10 -left-10 w-[300px] h-[300px] bg-violet-700/10 rounded-full blur-[100px]" />
          </div>
          {/* dot grid */}
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

          {/* background video */}
          <video autoPlay loop muted playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-1000 scale-105">
            <source src="https://player.vimeo.com/external/370331493.sd.mp4?s=7b9050864e4cc7d51a09fbc57bc67537b9bc917d&profile_id=139&oauth2_token_id=57447761" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />

          {/* content */}
          <div className="relative z-10 h-full flex flex-col justify-between p-8">
            <div className="flex items-center justify-between">
              {/* live chip */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Online</span>
              </div>
              {isSuperAdmin && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 backdrop-blur-sm">
                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                  <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">SuperAdmin</span>
                </div>
              )}
            </div>

            <div className="space-y-4 max-w-lg">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 w-fit">
                <Sparkles className="w-3 h-3 text-orange-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-orange-300">
                  {user?.branch} Branch
                </span>
              </div>

              <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
                Welcome back,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200">
                  {user?.branch === 'Guindy' ? 'IAT Technologies' : user?.branch === 'Nungambakkam' ? 'IAT Solutions' : user?.name?.split(" ")[0]}
                </span>
              </h1>

              <p className="text-slate-400 text-sm leading-relaxed">
                {format(new Date(), "EEEE, MMMM d, yyyy")} · Manage everything from your command center.
              </p>

              {/* date/time live row */}
              <div className="flex items-center gap-3 pt-1">
                {[
                  { icon: Clock, label: format(new Date(), 'hh:mm a') },
                  { icon: Calendar, label: format(new Date(), 'MMM d, yyyy') },
                ].map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/8 border border-white/10 backdrop-blur-sm">
                    <c.icon className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-xs font-bold text-white">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── QUICK TOOLS (2.5 cols) ── */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Tools & Apps</p>
            <h3 className="text-slate-900 dark:text-white font-black text-base mt-0.5">Quick Access</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 flex-1">
            {[
              { icon: GraduationCap, label: "LMS", external: "https://lms.iattechnologies.com/loginhome", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-500" },
              { icon: Factory, label: "PROD", path: "/projects/production", color: "bg-orange-50 dark:bg-orange-900/20 text-orange-500" },
              { icon: Users2, label: "CRM", external: "https://crm.iattechnologies.com/", color: "bg-violet-50 dark:bg-violet-900/20 text-violet-500" },
              { icon: Files, label: "DOC", path: "/projects/documents", color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500" },
              { icon: ScrollText, label: "HR POLICY", path: "/misc/hr-policy", color: "bg-pink-50 dark:bg-pink-900/20 text-pink-500" },
              { icon: Lightbulb, label: "IDEAS", path: "/misc/ideas", color: "bg-amber-50 dark:bg-amber-900/20 text-amber-500" },
            ].map((app, i) => (
              <button
                key={i}
                onClick={() => {
                  if ('external' in app && app.external) {
                    window.open(app.external, '_blank', 'noopener,noreferrer');
                  } else if ('path' in app && app.path) {
                    navigate(app.path);
                  }
                }}
                className="flex flex-col items-center gap-2 group/app transition-all hover:-translate-y-1"
              >
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${app.color} group-hover/app:bg-opacity-80 group-hover/app:shadow-lg transition-all`}>
                  <app.icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter group-hover/app:text-slate-700 dark:group-hover/app:text-slate-300 transition-colors">
                  {app.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── THOUGHT + IDEAS stacked (2 cols) ── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Top half — Thought of the Day */}
          <div
            onClick={() => navigate('/misc/thoughts')}
            className="relative rounded-[2rem] overflow-hidden cursor-pointer group bg-gradient-to-br from-orange-500 to-amber-400 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-[1.01] transition-all duration-300 flex-1"
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute top-3 right-3 opacity-10 text-7xl font-serif select-none leading-none">"</div>

            <div className="relative z-10 flex flex-col p-5 gap-3 h-full">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Quote className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Thought of the Day</span>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {isLoadingThought ? (
                  <Loader2 className="w-5 h-5 text-white/70 animate-spin" />
                ) : currentThought ? (
                  <>
                    <p className="text-white font-black italic text-xs leading-relaxed line-clamp-3">
                      "{currentThought.content}"
                    </p>
                    <p className="text-white/70 font-bold text-[10px] mt-2">— {currentThought.author}</p>
                  </>
                ) : (
                  <p className="text-white/60 text-xs">No thought available</p>
                )}
              </div>

              <div className="flex items-center gap-1 text-white/60 text-[9px] font-black uppercase tracking-widest group-hover:text-white transition-colors">
                Read more <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

          {/* Bottom half — Ideas quick-link */}
          <div
            onClick={() => navigate('/misc/ideas')}
            className="relative rounded-[2rem] overflow-hidden cursor-pointer group bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 hover:scale-[1.01] transition-all duration-300 flex-1"
          >
            <div className="absolute -bottom-8 -right-8 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute top-3 right-3 opacity-[0.08]">
              <Lightbulb className="w-16 h-16 text-white" />
            </div>

            <div className="relative z-10 flex flex-col p-5 gap-3 h-full">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Lightbulb className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/80">Ideas Board</span>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <p className="text-white font-black text-sm leading-snug">
                  Share your brilliant ideas with the team
                </p>
                <p className="text-white/60 text-[10px] mt-1.5 font-medium leading-relaxed">
                  Vote, discuss & bring ideas to life.
                </p>
              </div>

              <div className="flex items-center gap-1 text-white/60 text-[9px] font-black uppercase tracking-widest group-hover:text-white transition-colors">
                Explore ideas <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>

        </div>
      </div>


      {/* ══════════════════════════════════════════════════
          ROW 2 — IATT EVENTS CAROUSEL
      ══════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">

        {/* Decorative top accent band */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400" />

        <div className="p-7 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-7">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30">
                <PartyPopper className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase leading-none">
                  IATT{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">EVENT</span>
                </h2>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest font-bold mt-0.5">Company gatherings &amp; celebrations</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/events')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 text-white text-[10px] font-black uppercase tracking-wider hover:from-orange-600 hover:to-amber-500 transition-all shadow-md shadow-orange-500/20 hover:scale-[1.02] hover:shadow-orange-500/30"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Carousel */}
          <div className="relative px-12">
            <Carousel
              setApi={setApi}
              opts={{ align: "start", loop: true }}
              plugins={[Autoplay({ delay: 3000 })]}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {isLoadingEvents ? (
                  <div className="w-full flex items-center justify-center py-20 pl-4">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                  </div>
                ) : realEvents.length > 0 ? (
                  realEvents.map((event) => {
                    const status = getEventStatus(event.event_date);
                    return (
                      <CarouselItem key={event.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <div
                          onClick={() => navigate('/events')}
                          className="group relative rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1.5 cursor-pointer transition-all duration-500 flex flex-col h-full bg-white dark:bg-slate-700"
                        >
                          {/* Thumbnail */}
                          <div className="relative h-48 overflow-hidden shrink-0 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-600 dark:to-slate-700">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                            {event.image_url ? (
                              <img
                                src={event.image_url.startsWith('http') ? event.image_url : `http://localhost:5000${event.image_url}`}
                                alt={event.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                <PartyPopper className="w-12 h-12 text-orange-200" />
                                <span className="text-orange-300 text-xs font-bold">No Image</span>
                              </div>
                            )}

                            {/* Date badge — white calendar widget */}
                            <div className="absolute top-3 left-3 z-20 bg-white rounded-2xl overflow-hidden shadow-lg border border-orange-100">
                              <div className="bg-orange-500 text-center px-3 py-0.5">
                                <span className="text-[8px] font-black uppercase text-white tracking-widest">
                                  {format(new Date(event.event_date), 'MMM')}
                                </span>
                              </div>
                              <div className="px-3 py-1 text-center">
                                <span className="text-xl font-black text-slate-900 leading-none">
                                  {format(new Date(event.event_date), 'd')}
                                </span>
                              </div>
                            </div>

                            {/* Status pill */}
                            <div className="absolute top-3 right-3 z-20">
                              <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${status.cls}`}>
                                {status.label}
                              </span>
                            </div>

                            {/* Time chip */}
                            <div className="absolute bottom-3 left-3 z-20">
                              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/90 backdrop-blur-md border border-orange-100 rounded-xl text-[10px] font-bold text-slate-700 shadow">
                                <Clock className="w-3 h-3 text-orange-500" />
                                {event.event_time}
                              </div>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-5 flex flex-col flex-1 gap-3">
                            <h3 className="text-slate-900 dark:text-white font-black text-base leading-snug line-clamp-2 group-hover:text-orange-500 transition-colors">
                              {event.title}
                            </h3>

                            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                              <MapPin className="w-3 h-3 shrink-0 text-orange-400" />
                              <span className="truncate">{event.location}</span>
                            </div>

                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2 flex-1">
                              {event.description}
                            </p>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-600 flex items-center justify-between">
                              <div className="flex -space-x-1.5">
                                {['A', 'B', 'C'].map((l, i) => (
                                  <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 border-2 border-white dark:border-slate-700 flex items-center justify-center text-white text-[7px] font-black shadow-sm">{l}</div>
                                ))}
                              </div>
                              <span className="flex items-center gap-1 text-[10px] font-black text-orange-500 group-hover:text-orange-600 uppercase tracking-wider transition-colors">
                                View <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            </div>
                          </div>
                        </div>
                      </CarouselItem>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 pl-4">
                    <div className="p-5 rounded-2xl bg-orange-50 mb-4">
                      <PartyPopper className="w-10 h-10 text-orange-300" />
                    </div>
                    <p className="font-bold text-sm">No events scheduled yet</p>
                  </div>
                )}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex -left-4 bg-white border border-slate-200 text-orange-500 hover:bg-orange-500 hover:text-white hover:border-orange-500 h-11 w-11 rounded-full shadow-md transition-all hover:scale-110" />
              <CarouselNext className="hidden md:flex -right-4 bg-white border border-slate-200 text-orange-500 hover:bg-orange-500 hover:text-white hover:border-orange-500 h-11 w-11 rounded-full shadow-md transition-all hover:scale-110" />
            </Carousel>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  index + 1 === current
                    ? "w-6 h-2.5 bg-orange-500"
                    : "w-2.5 h-2.5 bg-slate-200 hover:bg-orange-300"
                )}
              />
            ))}
          </div>
        </div>
      </div>


      {/* ══════════════════════════════════════════════════
          ROW 3 — RECENT MEMBERS · BIRTHDAYS · ANNOUNCEMENTS
      ══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* ── Recent Members ── */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-7 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent pointer-events-none rounded-[2.5rem]" />
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-white font-black text-base tracking-tight">Recent Members</h3>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Newly joined</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-800">New</span>
          </div>

          {isLoadingMembers ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Loading…</p>
            </div>
          ) : recentMembers.length > 0 ? (
            <Carousel opts={{ align: "start", loop: true }} plugins={[Autoplay({ delay: 4000 })]} className="w-full flex-1">
              <CarouselContent>
                {recentMembers.map((member, i) => (
                  <CarouselItem key={i}>
                    <div className="flex flex-col gap-5">
                      {/* Avatar row */}
                      <div className="flex items-center gap-4 pb-5 border-b border-slate-100 dark:border-slate-700">
                        <Avatar className="w-16 h-16 border-4 border-slate-50 dark:border-slate-700 shadow-md group-hover:scale-105 transition-transform ring-2 ring-primary/20">
                          {member.photo && <AvatarImage src={`http://localhost:5000${member.photo}`} />}
                          <AvatarFallback className="bg-primary/10 text-primary font-black text-lg">
                            {member.first_name[0]}{member.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="text-slate-900 dark:text-white font-black text-lg tracking-tight leading-tight">
                            {member.first_name} {member.last_name}
                          </h4>
                          <p className="text-primary font-bold text-[10px] uppercase tracking-widest mt-1 opacity-80">
                            {member.position || 'Staff'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { label: 'Email', value: member.email },
                          { label: 'Role', value: member.position || 'Staff' },
                          { label: 'Joined', value: new Date(member.created_at).toLocaleDateString() },
                        ].map((item, j) => (
                          <div key={j} className="flex items-center justify-between">
                            <span className="text-slate-400 dark:text-slate-500 font-bold text-xs">{item.label}</span>
                            <span className="text-slate-800 dark:text-slate-200 font-black text-xs truncate max-w-[140px]">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex gap-2">
                  <CarouselPrevious className="relative h-8 w-8 -left-0 translate-y-0 border-slate-100 dark:border-slate-700 hover:bg-primary hover:text-white transition-all" />
                  <CarouselNext className="relative h-8 w-8 -right-0 translate-y-0 border-slate-100 dark:border-slate-700 hover:bg-primary hover:text-white transition-all" />
                </div>
                <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-primary transition-all">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </Carousel>
          ) : (
            <div className="flex-1 flex items-center justify-center py-10">
              <p className="text-slate-400 text-xs font-bold">No recent members found.</p>
            </div>
          )}
        </div>

        {/* ── Upcoming Birthdays ── */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-7 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/3 to-transparent pointer-events-none rounded-[2.5rem]" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-500">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-white font-black text-base tracking-tight">Birthdays</h3>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Upcoming</p>
              </div>
            </div>
            <button className="text-[9px] font-black text-pink-500 uppercase tracking-widest hover:underline">View All</button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[320px] pr-1 custom-scrollbar">
            {isLoadingBirthdays ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <Loader2 className="w-7 h-7 text-pink-500 animate-spin" />
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Checking dates…</p>
              </div>
            ) : birthdays.length > 0 ? (
              birthdays.map((bday, i) => (
                <div key={i} className="flex items-center gap-3 group/b cursor-pointer p-2 rounded-2xl hover:bg-pink-50 dark:hover:bg-pink-900/10 transition-colors">
                  <Avatar className="w-11 h-11 border-2 border-slate-50 dark:border-slate-700 shadow-sm group-hover/b:scale-110 transition-transform ring-1 ring-pink-100 dark:ring-pink-900/30">
                    {bday.photo && <AvatarImage src={`http://localhost:5000${bday.photo}`} />}
                    <AvatarFallback className="bg-pink-50 dark:bg-pink-900/20 text-pink-500 font-black text-sm">
                      {bday.first_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-slate-900 dark:text-white font-black text-sm truncate group-hover/b:text-pink-500 transition-colors">
                      {bday.first_name} {bday.last_name}
                    </h4>
                    <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">{bday.department}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-slate-900 dark:text-white font-black text-xs leading-none">
                      {format(new Date(bday.birth_date), 'MMM d')}
                    </p>
                    <p className="text-[8px] font-black text-pink-400 uppercase tracking-widest mt-1 flex items-center gap-0.5 justify-end">
                      <Gift className="w-2.5 h-2.5" /> BD
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 opacity-40">
                <Cake className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">No upcoming birthdays</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Announcements ── */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-7 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-slate-900 dark:text-white font-black text-base tracking-tight">Announcements</h3>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Latest updates</p>
              </div>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inset-0 rounded-full bg-red-400 opacity-75" />
              <span className="relative rounded-full h-2 w-2 bg-red-500" />
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center gap-4 opacity-40">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-700">
              <Bell className="w-8 h-8 text-slate-300 dark:text-slate-500" />
            </div>
            <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest">No new announcements</p>
          </div>

          <button disabled
            className="mt-auto py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-700 text-slate-300 dark:text-slate-600 font-black text-[10px] uppercase tracking-widest cursor-not-allowed">
            No More Announcements
          </button>
        </div>
      </div>


      {/* ══════════════════════════════════════════════════
          ROW 4 — HR POLICY CAROUSEL
      ══════════════════════════════════════════════════ */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-7 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/3 to-transparent pointer-events-none rounded-[2.5rem]" />
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500">
              <ScrollText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">HR POLICY</h2>
              <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mt-0.5">Guidelines & Compliance</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/misc/hr-policy')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-500 text-white font-black text-[10px] uppercase tracking-wider hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20 hover:scale-[1.02]">
            Explore All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative px-12">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4">
              {[
                { title: "Trainer-Trainee Relations Policy", desc: "Guidelines for professional conduct, equal opportunity, and conflict resolution.", icon: Users, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400" },
                { title: "Equal Opportunity Policy", desc: "Commitment to providing equal opportunities and maintaining a discrimination-free environment.", icon: ShieldCheck, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" },
              ].map((policy, i) => (
                <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/2">
                  <div
                    onClick={() => navigate('/misc/hr-policy')}
                    className="bg-slate-50/60 dark:bg-slate-700/40 rounded-[2rem] border border-slate-100 dark:border-slate-700 p-6 h-full flex items-center gap-5 hover:bg-white dark:hover:bg-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm", policy.color)}>
                      <policy.icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-slate-900 dark:text-white font-black text-sm tracking-tight mb-1 group-hover:text-indigo-500 transition-colors truncate">
                        {policy.title}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px] leading-relaxed font-medium line-clamp-2">
                        {policy.desc}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-[9px] font-black text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                        View Details <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 bg-white dark:bg-slate-700 border-slate-100 dark:border-slate-600 text-slate-400 hover:text-indigo-500 hover:border-indigo-300 transition-all h-11 w-11" />
            <CarouselNext className="hidden md:flex -right-4 bg-white dark:bg-slate-700 border-slate-100 dark:border-slate-600 text-slate-400 hover:text-indigo-500 hover:border-indigo-300 transition-all h-11 w-11" />
          </Carousel>
        </div>
      </div>


      {/* ── Footer ── */}
      <div className="flex items-center justify-between pt-6 mt-2 border-t border-slate-100 dark:border-slate-700/50">
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">{format(new Date(), 'yyyy')} © IATT INTRANET PORTAL</p>
        <div className="flex gap-4">
          <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Privacy Policy</button>
          <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Contact Support</button>
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

/* ── Add Event Modal (unchanged) ── */
const AddEventModal: React.FC<{
  isOpen: boolean; onClose: () => void; onSave: () => void;
  event: any; setEvent: (event: any) => void;
}> = ({ isOpen, onClose, onSave, event, setEvent }) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-[2.5rem] p-8">
      <DialogHeader>
        <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Add New Event</DialogTitle>
      </DialogHeader>
      <div className="space-y-6 py-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-slate-400">Event Title</Label>
          <Input id="title" value={event.title} onChange={e => setEvent({ ...event, title: e.target.value })}
            placeholder="Enter event title" className="rounded-xl border-slate-100 focus:ring-primary h-12" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-xs font-black uppercase tracking-widest text-slate-400">Date</Label>
            <Input id="date" type="date" value={event.date} onChange={e => setEvent({ ...event, date: e.target.value })}
              className="rounded-xl border-slate-100 focus:ring-primary h-12" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time" className="text-xs font-black uppercase tracking-widest text-slate-400">Time</Label>
            <Input id="time" type="time" value={event.time} onChange={e => setEvent({ ...event, time: e.target.value })}
              className="rounded-xl border-slate-100 focus:ring-primary h-12" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location" className="text-xs font-black uppercase tracking-widest text-slate-400">Location</Label>
          <Input id="location" value={event.location} onChange={e => setEvent({ ...event, location: e.target.value })}
            placeholder="e.g. Main Hall" className="rounded-xl border-slate-100 focus:ring-primary h-12" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desc" className="text-xs font-black uppercase tracking-widest text-slate-400">Description</Label>
          <Textarea id="desc" value={event.desc} onChange={e => setEvent({ ...event, desc: e.target.value })}
            placeholder="Brief event description..." className="rounded-xl border-slate-100 focus:ring-primary min-h-[100px] resize-none" />
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
