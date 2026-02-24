import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ChevronLeft, Calendar, MapPin, Clock, Play, Volume2, VolumeX,
    Maximize2, Image as ImageIcon, Film, Loader2, ChevronRight, ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';
import { api, mediaUrl } from '@/lib/api';

/* ─── Types ─── */
interface Event {
    id: number;
    title: string;
    description: string;
    event_date: string;
    event_time: string;
    location: string;
    image_url: string;
    image_type?: 'image' | 'video';
    images_full?: string[];
}

/* ─── Helpers ─── */
const isVideo = (src: string) =>
    src?.toLowerCase().endsWith('.mp4') ||
    src?.toLowerCase().endsWith('.webm') ||
    src?.toLowerCase().endsWith('.mov');

const buildMediaList = (event: Event): { url: string; type: 'image' | 'video' }[] => {
    // If we have images_full (array of string URLs)
    if (event.images_full && event.images_full.length > 0) {
        return event.images_full.map(url => ({
            url: url,
            type: isVideo(url) ? 'video' : 'image'
        }));
    }
    // Fallback to single image_url
    if (event.image_url) {
        return [{
            url: event.image_url,
            type: isVideo(event.image_url) ? 'video' : 'image'
        }];
    }
    return [];
};

/* ─── Main Component ─── */
const EventGallery: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const [event, setEvent] = useState<Event | null>((location.state as any)?.event || null);
    const [isLoading, setIsLoading] = useState(!event);
    const [isExpanded, setIsExpanded] = useState(false);

    /* ── Fetch event if not passed via state ── */
    useEffect(() => {
        if (!event && id) {
            const fetchEvent = async () => {
                try {
                    const data = await api.get<any>(`/events/${id}`);
                    if (data.success) setEvent(data.data);
                } catch {
                    // fall through
                } finally {
                    setIsLoading(false);
                }
            };
            fetchEvent();
        }
    }, [id]);

    const mediaList = event ? buildMediaList(event) : [];

    /* ── Loading / not found ── */
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-full border-4 border-slate-700 border-t-orange-500 animate-spin" />
                    <p className="text-slate-400 font-bold tracking-wider text-sm uppercase">Loading Gallery…</p>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <ImageIcon className="w-16 h-16 text-slate-600 mx-auto" />
                    <p className="text-slate-400 font-bold text-lg">Event not found</p>
                    <button
                        onClick={() => navigate('/events')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition-all mx-auto"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back to Events
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f0f0f] text-slate-900 dark:text-white pb-20">

            {/* ── TOP NAV BAR ── */}
            <div className="sticky top-0 z-50 bg-white/80 dark:bg-[#0f0f0f]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/5 px-6 py-4 flex items-center justify-between">
                <button
                    onClick={() => navigate('/events')}
                    className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors group"
                >
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 group-hover:bg-slate-200 dark:group-hover:bg-white/10 transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold hidden sm:block">Back to Events</span>
                </button>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-1.5 rounded-full bg-orange-500 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 shadow-lg shadow-orange-500/20">
                        Event Gallery
                    </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                    <Film className="w-3.5 h-3.5" />
                    {mediaList.length} items
                </div>
            </div>

            {/* ── HERO HEADER ── */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 mb-10 px-6 py-12 lg:px-12">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 -translated-x-1/4" />

                <div className="relative z-10 max-w-5xl mx-auto space-y-6">
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(event.event_date), 'MMMM d, yyyy')}
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                            </div>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                            {event.title}
                        </h1>
                    </div>

                    <div className="max-w-3xl">
                        <p className={`text-slate-500 dark:text-slate-400 text-base leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
                            {event.description}
                        </p>
                        {event.description && event.description.length > 250 && (
                            <button
                                onClick={() => setIsExpanded(e => !e)}
                                className="mt-4 flex items-center gap-1.5 text-xs font-black text-orange-500 hover:text-orange-600 uppercase tracking-widest transition-colors"
                            >
                                {isExpanded ? 'Show less' : 'Read more'}
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── MEDIA GRID ── */}
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {mediaList.map((media, idx) => (
                        <div
                            key={idx}
                            className="group relative rounded-[2rem] overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 aspect-video animate-fade-in"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {media.type === 'video' ? (
                                <>
                                    <video
                                        src={mediaUrl(media.url)}
                                        className="w-full h-full object-cover"
                                        controls
                                        muted
                                        poster={event.image_url}
                                    />
                                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-black uppercase tracking-widest text-white border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Film className="w-3 h-3" /> Video Content
                                    </div>
                                </>
                            ) : (
                                <>
                                    <img
                                        src={mediaUrl(media.url)}
                                        alt={`Event content ${idx + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-[9px] font-black uppercase tracking-widest text-white border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ImageIcon className="w-3 h-3" /> Photo #{idx + 1}
                                    </div>

                                    {/* Action Hover */}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-300">
                                            <Maximize2 className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {mediaList.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900 shadow-inner rounded-3xl border border-slate-100 dark:border-white/5">
                        <ImageIcon className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No media files found for this event</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventGallery;
