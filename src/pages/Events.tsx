import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar, MapPin, Clock, Plus, Loader2, Trash2, X, Upload,
  Edit3, Video, Play, Check, ChevronLeft, ChevronRight,
  Image as ImageIcon, Sparkles, ArrowRight, ZoomIn
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format, isPast, isToday } from 'date-fns';

/* ─── Types ─── */
interface EventImage {
  id: number;
  url: string;
  full_url: string;
  type: 'image' | 'video';
}

interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  image_url: string;
  image_type?: 'image' | 'video';
  created_by: number;
  images?: EventImage[];
  images_full?: string[];
}

/* ─── Helpers ─── */
const mediaUrl = (src: string) =>
  src.startsWith('http') || src.startsWith('blob:') ? src : `http://localhost:5000${src}`;

const isVideo = (src: string) =>
  src?.endsWith('.mp4') || src?.endsWith('.webm') || src?.endsWith('.mov');

const getEventStatus = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isToday(d)) return { label: 'Today', color: 'bg-emerald-500 text-white' };
    if (isPast(d)) return { label: 'Past', color: 'bg-slate-200 text-slate-500' };
    return { label: 'Upcoming', color: 'bg-amber-500 text-white' };
  } catch {
    return { label: 'Upcoming', color: 'bg-amber-500 text-white' };
  }
};

/* ─── Sub-components ─── */
const FieldGroup: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</Label>
    {children}
  </div>
);

/* ─── Main Component ─── */
const Events: React.FC = () => {
  const { isAdmin } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

  const [newItem, setNewItem] = useState({
    title: '', description: '', event_date: '', event_time: '', location: ''
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ url: string; type: 'image' | 'video' }[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);

  // Lightbox
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  /* ── API ── */
  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setEvents(data.data);
      else toast.error('Failed to load events');
    } catch {
      toast.error('Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  useEffect(() => () => { filePreviews.forEach(p => URL.revokeObjectURL(p.url)); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const newFiles = Array.from(e.target.files);
    if (selectedFiles.length + newFiles.length > 10) {
      toast.error('Max 10 files allowed.'); return;
    }
    setSelectedFiles(prev => [...prev, ...newFiles]);
    setFilePreviews(prev => [
      ...prev,
      ...newFiles.map(f => ({
        url: URL.createObjectURL(f),
        type: f.type.startsWith('video') ? 'video' : 'image' as 'image' | 'video'
      }))
    ]);
  };

  const removeFile = (i: number) => {
    URL.revokeObjectURL(filePreviews[i].url);
    setSelectedFiles(p => p.filter((_, idx) => idx !== i));
    setFilePreviews(p => p.filter((_, idx) => idx !== i));
    if (coverIndex === i) setCoverIndex(0);
    else if (coverIndex > i) setCoverIndex(p => p - 1);
  };

  const handleDeleteExistingImage = async (imageId: number) => {
    if (!confirm('Remove this image?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/events/image/${imageId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Image removed');
        if (currentEvent) setCurrentEvent({ ...currentEvent, images: currentEvent.images?.filter(img => img.id !== imageId) });
        fetchEvents();
      } else toast.error(data.message);
    } catch { toast.error('Error removing image'); }
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('title', newItem.title);
    fd.append('description', newItem.description);
    fd.append('event_date', newItem.event_date);
    fd.append('event_time', newItem.event_time);
    fd.append('location', newItem.location);
    selectedFiles.forEach(f => fd.append('images', f));
    return fd;
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const fd = buildFormData();
      fd.append('cover_index', coverIndex.toString());
      const res = await fetch('http://localhost:5000/api/events', {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd
      });
      const data = await res.json();
      if (data.success) { toast.success('Event created!'); setIsAddModalOpen(false); resetForm(); fetchEvents(); }
      else toast.error(data.message || 'Failed to create event');
    } catch { toast.error('Error connecting to server'); }
    finally { setIsSubmitting(false); }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/events/${currentEvent.id}`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: buildFormData()
      });
      const data = await res.json();
      if (data.success) { toast.success('Event updated!'); setIsEditModalOpen(false); resetForm(); fetchEvents(); }
      else toast.error(data.message || 'Failed to update event');
    } catch { toast.error('Error connecting to server'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Delete this event?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) { toast.success('Event deleted'); fetchEvents(); }
      else toast.error(data.message || 'Failed to delete');
    } catch { toast.error('Error deleting event'); }
  };

  const resetForm = () => {
    setNewItem({ title: '', description: '', event_date: '', event_time: '', location: '' });
    setSelectedFiles([]); setFilePreviews([]); setCoverIndex(0); setCurrentEvent(null);
  };

  const openEditModal = (event: Event) => {
    setCurrentEvent(event);
    setNewItem({
      title: event.title, description: event.description,
      event_date: event.event_date.split('T')[0],
      event_time: event.event_time, location: event.location
    });
    setSelectedFiles([]); setFilePreviews([]);
    setIsEditModalOpen(true);
  };

  const openGallery = (images: string[], startIdx = 0) => {
    if (!images?.length) return;
    setLightboxImages(images); setLightboxIdx(startIdx); setIsGalleryOpen(true);
  };

  const lightboxPrev = useCallback(() => setLightboxIdx(i => (i > 0 ? i - 1 : lightboxImages.length - 1)), [lightboxImages]);
  const lightboxNext = useCallback(() => setLightboxIdx(i => (i < lightboxImages.length - 1 ? i + 1 : 0)), [lightboxImages]);

  useEffect(() => {
    if (!isGalleryOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') lightboxPrev();
      else if (e.key === 'ArrowRight') lightboxNext();
      else if (e.key === 'Escape') setIsGalleryOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isGalleryOpen, lightboxPrev, lightboxNext]);

  /* ── Shared media uploader UI ── */
  const MediaUploader = ({ editMode = false }) => (
    <FieldGroup label={editMode ? 'Add New Files' : 'Event Media (Max 10)'} className="md:col-span-2">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {filePreviews.map((preview, i) => (
          <div
            key={i}
            onClick={() => !editMode && setCoverIndex(i)}
            className={`relative aspect-square rounded-2xl overflow-hidden group shadow-sm transition-all cursor-pointer ${!editMode && coverIndex === i ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}
          >
            {preview.type === 'video'
              ? <video src={preview.url} className="w-full h-full object-cover" />
              : <img src={preview.url} alt="" className="w-full h-full object-cover" />}
            {!editMode && coverIndex === i && (
              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-orange-500 text-white text-[9px] font-black uppercase rounded-lg shadow z-10">Cover</span>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
              {!editMode && coverIndex !== i && (
                <button type="button" onClick={e => { e.stopPropagation(); setCoverIndex(i); }}
                  className="p-1.5 bg-white/20 hover:bg-white text-white hover:text-orange-500 rounded-full transition-all">
                  <Check className="w-3.5 h-3.5" />
                </button>
              )}
              <button type="button" onClick={e => { e.stopPropagation(); removeFile(i); }}
                className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {selectedFiles.length < 10 && (
          <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/40 dark:hover:bg-orange-900/10 transition-all group">
            <div className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-700 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/20 transition-colors mb-1.5">
              <Upload className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 group-hover:text-orange-500 transition-colors">Upload</span>
            <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileChange} />
          </label>
        )}
      </div>
      {!editMode && <p className="text-[10px] text-slate-400 mt-1.5">* Click image to set as cover</p>}
    </FieldGroup>
  );

  /* ─────────────────── JSX ─────────────────── */
  return (
    <div className="space-y-10 animate-fade-in pb-16">

      {/* ══ HERO ══ */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl">
        {/* Mesh gradient blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-orange-600/25 rounded-full blur-[130px] -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[360px] h-[360px] bg-violet-600/15 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,rgba(0,0,0,0.6))]" />
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10 px-10 py-12">

          {/* ── Left: Text + Stats + CTA ── */}
          <div className="space-y-5 max-w-xl">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-400" />
              </span>
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">Company Events</span>
            </div>

            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.1]">
                Discover &amp; Experience<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300">
                  What's Coming Next
                </span>
              </h1>
              <p className="mt-4 text-slate-400 text-base leading-relaxed">
                Explore company gatherings, workshops, and celebrations.
                Stay connected — never miss a moment.
              </p>
            </div>

            {/* Stats strip */}
            <div className="flex items-center gap-6 pt-1">
              {[
                { value: events.length, label: 'Total' },
                { value: events.filter(e => { try { return !isPast(new Date(e.event_date)) || isToday(new Date(e.event_date)); } catch { return false; } }).length, label: 'Upcoming' },
                { value: events.filter(e => { try { return isToday(new Date(e.event_date)); } catch { return false; } }).length, label: 'Today' },
              ].map((s, i) => (
                <div key={s.label} className={`text-center ${i > 0 ? 'border-l border-white/10 pl-6' : ''}`}>
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{s.label}</p>
                </div>
              ))}
            </div>

            {isAdmin && (
              <button
                onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                className="group relative overflow-hidden flex items-center gap-3 px-7 py-3.5 bg-gradient-to-r from-orange-500 to-amber-400 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.03] transition-all duration-300 w-fit"
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                <span className="p-1.5 bg-white/20 rounded-lg"><Plus className="w-4 h-4" /></span>
                Create Event
                <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          {/* ── Right: Next Upcoming Event Card ── */}
          {(() => {
            const nextEvent = [...events]
              .filter(e => { try { return !isPast(new Date(e.event_date)) || isToday(new Date(e.event_date)); } catch { return false; } })
              .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())[0];

            return (
              <div className="shrink-0 w-full lg:w-[300px]">
                {nextEvent ? (
                  <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                    {/* Thumbnail */}
                    <div className="relative h-44 overflow-hidden">
                      {nextEvent.image_url ? (
                        isVideo(nextEvent.image_url) ? (
                          <video src={mediaUrl(nextEvent.image_url)} className="w-full h-full object-cover" muted loop autoPlay />
                        ) : (
                          <img src={mediaUrl(nextEvent.image_url)} alt={nextEvent.title} className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-600/30 to-amber-500/20 flex items-center justify-center">
                          <Calendar className="w-12 h-12 text-orange-400/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      {/* Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500 text-white text-[9px] font-black uppercase tracking-widest shadow">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Next Up
                      </div>
                      {/* Date chip */}
                      <div className="absolute bottom-3 left-3">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5">
                          <Calendar className="w-3.5 h-3.5 text-orange-300" />
                          <span className="text-xs font-bold text-white">
                            {format(new Date(nextEvent.event_date), 'EEE, MMM d yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-3 bg-white/8 backdrop-blur-xl border-t border-white/10">
                      <h3 className="text-white font-black text-[15px] leading-snug line-clamp-2">
                        {nextEvent.title}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                          <div className="p-1.5 rounded-lg bg-white/10"><Clock className="w-3 h-3 text-orange-400" /></div>
                          {nextEvent.event_time}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                          <div className="p-1.5 rounded-lg bg-white/10"><MapPin className="w-3 h-3 text-orange-400" /></div>
                          <span className="truncate">{nextEvent.location}</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {['A', 'B', 'C'].map((l, i) => (
                            <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 border-2 border-slate-900 flex items-center justify-center text-white text-[8px] font-black">{l}</div>
                          ))}
                          <div className="w-7 h-7 rounded-full bg-white/10 border-2 border-slate-900 flex items-center justify-center text-white text-[9px] font-black">+</div>
                        </div>
                        <button
                          onClick={() => openGallery(nextEvent.images_full || (nextEvent.image_url ? [nextEvent.image_url] : []))}
                          className="text-[10px] font-black text-orange-400 hover:text-orange-300 uppercase tracking-wider flex items-center gap-1 transition-colors"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-8 flex flex-col items-center justify-center gap-4 text-center min-h-[220px]">
                    <div className="p-5 rounded-2xl bg-white/10 border border-white/10">
                      <Calendar className="w-10 h-10 text-orange-400/60" />
                    </div>
                    <div>
                      <p className="text-white font-black text-sm">No Upcoming Events</p>
                      <p className="text-slate-500 text-xs mt-1">{isAdmin ? 'Create the first event!' : 'Check back soon.'}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* ══ EVENTS GRID ══ */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-80 gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-orange-500 animate-spin" />
            <div className="absolute inset-3 rounded-full bg-white dark:bg-slate-800" />
            <Calendar className="absolute inset-0 m-auto w-5 h-5 text-orange-500" />
          </div>
          <p className="text-slate-400 text-sm font-bold animate-pulse tracking-wider uppercase">Loading events…</p>
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
          {events.map((event, cardIdx) => {
            const status = getEventStatus(event.event_date);
            const cover = event.image_url;
            const allImages = event.images_full || (cover ? [cover] : []);

            return (
              <article
                key={event.id}
                style={{ animationDelay: `${cardIdx * 60}ms` }}
                className="group bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_24px_60px_-15px_rgba(0,0,0,0.5)] transition-all duration-500 flex flex-col overflow-hidden animate-fade-in hover:-translate-y-1"
              >
                {/* ── Thumbnail ── */}
                <div
                  className="relative h-56 overflow-hidden cursor-pointer bg-slate-100 dark:bg-slate-700 shrink-0"
                  onClick={() => openGallery(allImages)}
                >
                  {/* Hover overlay */}
                  <div className="absolute inset-0 z-20 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="p-4 rounded-full bg-white/20 backdrop-blur-md">
                      <ZoomIn className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10" />

                  {cover ? (
                    isVideo(cover) ? (
                      <video
                        src={mediaUrl(cover)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        muted loop
                        onMouseOver={e => e.currentTarget.play()}
                        onMouseOut={e => e.currentTarget.pause()}
                      />
                    ) : (
                      <img
                        src={mediaUrl(cover)}
                        alt={event.title}
                        onError={e => { e.currentTarget.style.display = 'none'; }}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-300 dark:text-slate-500">
                      <Calendar className="w-14 h-14 opacity-40" />
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">No Preview</span>
                    </div>
                  )}

                  {/* Date badge */}
                  <div className="absolute top-4 left-4 z-30 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col items-center min-w-[58px]">
                    <div className="w-full bg-orange-500 text-white text-center py-1">
                      <span className="text-[8px] font-black uppercase tracking-widest">
                        {format(new Date(event.event_date), 'MMM')}
                      </span>
                    </div>
                    <span className="text-2xl font-black text-slate-900 dark:text-white py-1 leading-none px-3">
                      {format(new Date(event.event_date), 'd')}
                    </span>
                  </div>

                  {/* Status badge */}
                  <div className="absolute top-4 right-4 z-30">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Media counter */}
                  {allImages.length > 1 && (
                    <div className="absolute bottom-4 right-4 z-30">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                        <ImageIcon className="w-3 h-3" />
                        {allImages.length} photos
                      </span>
                    </div>
                  )}

                  {/* Bottom meta */}
                  <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                      <Clock className="w-3 h-3 text-orange-300" />
                      {event.event_time}
                    </div>
                  </div>

                  {/* Admin controls */}
                  {isAdmin && (
                    <div className="absolute top-[calc(100%-1.25rem)] right-5 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={e => { e.stopPropagation(); openEditModal(event); }}
                        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-700 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 shadow-lg transition-all hover:scale-110"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-700 rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 shadow-lg transition-all hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* ── Content ── */}
                <div className="flex-1 flex flex-col p-6 gap-3 mt-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-300">
                    {event.title}
                  </h3>

                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 flex-1">
                    {event.description}
                  </p>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-600" />
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-500 -ml-2" />
                      <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-400 -ml-2" />
                    </div>
                    <button
                      onClick={() => openGallery(allImages)}
                      className="flex items-center gap-1.5 text-xs font-black text-orange-500 hover:text-orange-600 uppercase tracking-wider group/btn transition-colors"
                    >
                      View Gallery
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-28 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700">
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-800 shadow-sm mb-5">
            <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-slate-800 dark:text-white font-black text-xl">No events yet</p>
          <p className="text-slate-400 text-sm mt-2">Check back soon for upcoming company gatherings!</p>
          {isAdmin && (
            <button
              onClick={() => { resetForm(); setIsAddModalOpen(true); }}
              className="mt-6 flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-md shadow-orange-500/20"
            >
              <Plus className="w-4 h-4" /> Create First Event
            </button>
          )}
        </div>
      )}

      {/* ══ CREATE MODAL ══ */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[680px] rounded-[2rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          {/* Header */}
          <div className="relative bg-slate-900 px-8 py-7 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-black text-white tracking-tight">New Event</DialogTitle>
                <p className="text-slate-400 text-sm mt-1">Create an event and notify your team.</p>
              </div>
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md">
                <Calendar className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateEvent} className="p-8 space-y-6 bg-white dark:bg-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FieldGroup label="Event Title" className="md:col-span-2">
                <Input required placeholder="e.g., Annual Team Offsite 2024"
                  value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                  className="h-12 rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-orange-500 font-medium" />
              </FieldGroup>
              <FieldGroup label="Date">
                <Input required type="date" value={newItem.event_date}
                  onChange={e => setNewItem({ ...newItem, event_date: e.target.value })}
                  className="h-12 rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-orange-500" />
              </FieldGroup>
              <FieldGroup label="Time">
                <Input required type="time" value={newItem.event_time}
                  onChange={e => setNewItem({ ...newItem, event_time: e.target.value })}
                  className="h-12 rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-orange-500" />
              </FieldGroup>
              <FieldGroup label="Location" className="md:col-span-2">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input required placeholder="e.g., Main Conference Hall" value={newItem.location}
                    onChange={e => setNewItem({ ...newItem, location: e.target.value })}
                    className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-orange-500" />
                </div>
              </FieldGroup>
              <FieldGroup label="Description" className="md:col-span-2">
                <Textarea required placeholder="Describe the event details…" value={newItem.description}
                  onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                  className="min-h-[110px] rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-orange-500 resize-none p-4" />
              </FieldGroup>
              <MediaUploader />
            </div>

            <DialogFooter className="pt-5 border-t border-slate-100 dark:border-slate-700 gap-3">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl h-11 px-6 border-slate-200 dark:border-slate-600">Cancel</Button>
              <Button type="submit" disabled={isSubmitting}
                className="rounded-xl h-11 px-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold shadow-lg shadow-orange-500/25">
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publishing…</> : '🚀 Publish Event'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══ EDIT MODAL ══ */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[2rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-8 py-6 sticky top-0 z-40 flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">Edit Event</DialogTitle>
              <p className="text-slate-400 text-sm mt-0.5">Update event details and manage images.</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <Edit3 className="w-5 h-5 text-blue-500" />
            </div>
          </div>

          <div className="p-8 space-y-6 bg-white dark:bg-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FieldGroup label="Event Title" className="md:col-span-2">
                <Input required value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                  className="h-12 rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-orange-500 font-medium" />
              </FieldGroup>
              <FieldGroup label="Date">
                <Input required type="date" value={newItem.event_date}
                  onChange={e => setNewItem({ ...newItem, event_date: e.target.value })}
                  className="h-12 rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-orange-500" />
              </FieldGroup>
              <FieldGroup label="Time">
                <Input required type="time" value={newItem.event_time}
                  onChange={e => setNewItem({ ...newItem, event_time: e.target.value })}
                  className="h-12 rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-orange-500" />
              </FieldGroup>
              <FieldGroup label="Location" className="md:col-span-2">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input required value={newItem.location}
                    onChange={e => setNewItem({ ...newItem, location: e.target.value })}
                    className="h-12 pl-11 rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-orange-500" />
                </div>
              </FieldGroup>
              <FieldGroup label="Description" className="md:col-span-2">
                <Textarea required value={newItem.description}
                  onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                  className="min-h-[110px] rounded-xl bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-orange-500 resize-none p-4" />
              </FieldGroup>

              {/* Existing images */}
              <FieldGroup label="Current Images" className="md:col-span-2">
                {currentEvent?.images && currentEvent.images.length > 0 ? (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                    {currentEvent.images.map(img => (
                      <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border border-slate-100 dark:border-slate-700">
                        <img src={img.full_url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => handleDeleteExistingImage(img.id)}
                            className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-5 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/30">
                    <p className="text-xs text-slate-400">No images uploaded yet.</p>
                  </div>
                )}
              </FieldGroup>

              <MediaUploader editMode />
            </div>

            <DialogFooter className="pt-5 border-t border-slate-100 dark:border-slate-700 gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl h-11">Cancel</Button>
              <Button onClick={handleUpdateEvent} disabled={isSubmitting}
                className="rounded-xl h-11 px-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold shadow-lg shadow-orange-500/25">
                {isSubmitting ? 'Saving…' : '✓ Save Changes'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ══ LIGHTBOX GALLERY ══ */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="w-screen max-w-none h-screen bg-black/95 border-none shadow-none p-0 rounded-none flex flex-col items-center justify-center outline-none">
          {/* Close */}
          <button
            onClick={() => setIsGalleryOpen(false)}
            className="absolute top-5 right-5 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold">
            {lightboxIdx + 1} / {lightboxImages.length}
          </div>

          {/* Media */}
          <div className="w-full h-full flex items-center justify-center px-20 py-16">
            {lightboxImages[lightboxIdx] && (
              isVideo(lightboxImages[lightboxIdx]) ? (
                <video
                  key={lightboxIdx}
                  src={mediaUrl(lightboxImages[lightboxIdx])}
                  controls autoPlay
                  className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain"
                />
              ) : (
                <img
                  key={lightboxIdx}
                  src={mediaUrl(lightboxImages[lightboxIdx])}
                  alt={`Media ${lightboxIdx + 1}`}
                  className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain select-none"
                />
              )
            )}
          </div>

          {/* Prev / Next */}
          {lightboxImages.length > 1 && (
            <>
              <button onClick={lightboxPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all hover:scale-110">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={lightboxNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all hover:scale-110">
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Thumbnails strip */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto pb-1">
                {lightboxImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setLightboxIdx(i)}
                    className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${i === lightboxIdx ? 'border-orange-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    {isVideo(img)
                      ? <div className="w-full h-full bg-slate-700 flex items-center justify-center"><Play className="w-4 h-4 text-white" /></div>
                      : <img src={mediaUrl(img)} alt="" className="w-full h-full object-cover" />
                    }
                  </button>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Events;
