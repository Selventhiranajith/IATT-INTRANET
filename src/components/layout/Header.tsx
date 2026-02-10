import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Maximize2, 
  Minimize2, 
  User, 
  Settings, 
  LogOut,
  Bell,
  ChevronDown,
  Search,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Clock as ClockIcon } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formatDate = (date: Date) => {
    return format(date, 'EEEE, d MMM yyyy, hh:mm aa');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="bg-white h-24 border-b border-slate-100 sticky top-0 z-40 flex flex-col shrink-0">
      {/* Top Gradient Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-secondary to-yellow-400 shrink-0" />
      
      <div className="flex-1 px-8 flex items-center justify-between">
        {/* Left Section - Toggle & Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={onToggleSidebar}
            className="p-3 rounded-2xl text-slate-400 hover:text-primary hover:bg-background transition-all border border-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          
        </div>

        {/* Middle Section - Search & Time */}
        <div className="flex-1 flex items-center justify-between max-w-5xl mx-auto px-4">
          <div className="relative group w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-background border border-transparent focus:bg-white focus:border-slate-100 focus:shadow-sm text-slate-600 placeholder:text-slate-400 font-bold text-sm transition-all focus:outline-none"
            />
          </div>
        </div>

        {/* Right Section - Fullscreen, Time, Notifications & User */}
        <div className="flex items-center gap-6">
          

          {/* Time Display with Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="hidden lg:flex items-center gap-2 text-slate-500 font-bold text-sm px-4 py-2 rounded-xl bg-slate-50/50 hover:bg-slate-100 transition-all cursor-pointer border border-transparent hover:border-slate-200">
                <ClockIcon className="w-4 h-4 text-primary opacity-70" />
                <span className="opacity-80">{formatDate(currentTime)}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-6 rounded-[2.5rem] bg-white border border-slate-100 shadow-2xl" align="end" sideOffset={15}>
              <div className="space-y-6">
                {/* Digital Clock Section */}
                <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                  <div className="text-3xl font-black text-primary tracking-tight">
                    {format(currentTime, 'hh:mm:ss')}
                    <span className="text-sm ml-1 uppercase opacity-60 font-bold">{format(currentTime, 'aa')}</span>
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {format(currentTime, 'EEEE, MMMM d, yyyy')}
                  </div>
                </div>

                {/* Calendar Section */}
                <div className="p-2 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <Calendar 
                    mode="single"
                    selected={currentTime}
                    className="rounded-[1.5rem]"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Fullscreen Button */}
          <button 
            onClick={toggleFullscreen}
            className="p-3 rounded-2xl text-slate-400 hover:text-primary hover:bg-slate-50 transition-all"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 pl-6 border-l border-slate-100">
             <button className="p-3 rounded-2xl text-slate-400 hover:text-primary hover:bg-slate-50 transition-all relative">
               <Bell className="w-5 h-5" />
               <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
             </button>
             
             
          </div>


          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 group">
                <Avatar className="w-12 h-12 border-2 border-slate-50 shadow-sm transition-transform group-hover:scale-105">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-black text-sm uppercase">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-900 font-black text-sm tracking-tight">{user?.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{user?.role}</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 bg-white border border-slate-100 rounded-[2rem] shadow-2xl">
              <div className="px-6 py-4 border-b border-slate-50 mb-2">
                <p className="font-black text-slate-900">{user?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400 font-bold">{user?.email}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-[10px] text-primary font-black uppercase tracking-widest">{user?.branch}</span>
                </div>
              </div>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer rounded-xl py-4 px-6 text-slate-600 font-bold hover:bg-slate-50">
                <User className="w-4 h-4 mr-3 text-primary" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="cursor-pointer rounded-xl py-4 px-6 text-red-500 font-bold hover:bg-red-50 mt-1">
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
