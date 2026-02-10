import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { eventsData, type Event } from '@/data/eventsData';

const Events: React.FC = () => {
  const { isAdmin } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-orange-500/10">
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Events</h1>
            <p className="text-slate-500 font-medium mt-1">Upcoming and past company events</p>
          </div>
        </div>
        
        {isAdmin && (
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="px-8 py-4 bg-orange-500 text-white rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-3 font-black uppercase tracking-[0.2em] text-sm"
          >
            <Plus className="w-5 h-5" />
            Add Event
          </button>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {eventsData.map((event) => (
          <div key={event.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 group flex flex-col h-full">
            {/* Image */}
            <div className="h-56 rounded-[2rem] overflow-hidden relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
              <img
                src={event.img}
                alt={event.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=60';
                }}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 z-20">
                <span className="px-3 py-1.5 rounded-xl bg-white/90 backdrop-blur-md text-orange-600 font-black text-xs uppercase tracking-wider">
                  {event.date}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="px-2 pb-2 flex-1 flex flex-col space-y-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug group-hover:text-orange-500 transition-colors">
                {event.title}
              </h3>
              
              <div className="space-y-2">
                 <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <MapPin className="w-4 h-4 text-orange-400" />
                    {event.location}
                 </div>
                 <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                    <Clock className="w-4 h-4 text-orange-400" />
                    {event.time}
                 </div>
              </div>

              <p className="text-slate-500 leading-relaxed text-sm line-clamp-3">
                {event.desc}
              </p>
              
              <button className="mt-auto w-full py-3 rounded-xl bg-orange-50 text-orange-600 font-bold hover:bg-orange-500 hover:text-white transition-all">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Event Modal Placeholder - Logic to be implemented if requested */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Add New Event</DialogTitle>
          </DialogHeader>
          <div className="py-6">
             <p className="text-center text-slate-500 font-medium">Event creation form goes here.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Events;
