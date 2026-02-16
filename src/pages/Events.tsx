import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Plus, Loader2, Trash2, X, Upload, Edit3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface EventImage {
  id: number;
  url: string;
  full_url: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  image_url: string;
  created_by: number;
  images?: EventImage[];
  images_full?: string[]; // For backward compat/simple use
}

const Events: React.FC = () => {
  const { isAdmin } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);

  // Form State
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: ''
  });

  // File Upload State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Gallery View State
  const [selectedEventImages, setSelectedEventImages] = useState<string[] | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      } else {
        toast.error('Failed to load events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Error connecting to server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Handle File Selection with Preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Validate max files (e.g., 10 including existing? Let's say 10 new files per upload)
      if (selectedFiles.length + newFiles.length > 10) {
        toast.error('You can only upload up to 10 new images at a time.');
        return;
      }

      setSelectedFiles(prev => [...prev, ...newFiles]);

      // Create previews
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    // Revoke URL to avoid memory leak
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingImage = async (imageId: number) => {
    if (!confirm('Remove this image from the event?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/events/image/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Image removed');
        // Update local state for current event
        if (currentEvent) {
          const updatedImages = currentEvent.images?.filter(img => img.id !== imageId);
          setCurrentEvent({ ...currentEvent, images: updatedImages });
        }
        fetchEvents(); // Refresh main list
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Error removing image');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newItem.title);
      formData.append('description', newItem.description);
      formData.append('event_date', newItem.event_date);
      formData.append('event_time', newItem.event_time);
      formData.append('location', newItem.location);

      // Append files
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Event created successfully!');
        setIsAddModalOpen(false);
        resetForm();
        fetchEvents();
      } else {
        toast.error(data.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Error connecting to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEvent) return;
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newItem.title);
      formData.append('description', newItem.description);
      formData.append('event_date', newItem.event_date);
      formData.append('event_time', newItem.event_time);
      formData.append('location', newItem.location);

      // Append new files if any
      selectedFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`http://localhost:5000/api/events/${currentEvent.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Event updated successfully!');
        setIsEditModalOpen(false);
        resetForm();
        fetchEvents();
      } else {
        toast.error(data.message || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Error connecting to server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Event deleted');
        fetchEvents();
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch (error) {
      toast.error('Error deleting event');
    }
  };

  const resetForm = () => {
    setNewItem({
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      location: ''
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setCurrentEvent(null);
  };

  const openEditModal = (event: Event) => {
    setCurrentEvent(event);
    setNewItem({
      title: event.title,
      description: event.description,
      event_date: event.event_date.split('T')[0], // Extract just the date part
      event_time: event.event_time,
      location: event.location
    });
    // For edit modal, we start with no *new* files selected
    setSelectedFiles([]);
    setImagePreviews([]);
    setIsEditModalOpen(true);
  };

  const openGallery = (images: string[]) => {
    if (!images || images.length === 0) return;
    setSelectedEventImages(images);
    setIsGalleryOpen(true);
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Premium Header Section */}
      <div className="relative rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12 overflow-hidden shadow-2xl">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-xs font-medium text-slate-200">Company Events Portal</span>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Discover & Join
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">
                  Upcoming Experiences
                </span>
              </h1>
              <p className="mt-4 text-lg text-slate-300 font-medium leading-relaxed max-w-xl">
                Stay connected with your team. Explore the latest company gatherings, workshops, and celebrations all in one place.
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex-shrink-0">
              <button
                onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                className="group relative px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-sm uppercase tracking-wider overflow-hidden transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-3">
                  <span className="p-1.5 bg-slate-900 text-white rounded-lg group-hover:bg-orange-500 transition-colors duration-300">
                    <Plus className="w-4 h-4" />
                  </span>
                  Create Event
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-orange-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-slate-50"></div>
            </div>
          </div>
          <p className="text-slate-400 font-medium animate-pulse">Loading amazing events...</p>
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="group bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col overflow-hidden h-full transform hover:-translate-y-1"
            >
              {/* Image Section */}
              <div
                className="relative h-64 overflow-hidden cursor-pointer"
                onClick={() => openGallery(event.images_full || [event.image_url])}
              >
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10 duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-80" />

                <img
                  src={event.image_url ? (event.image_url.startsWith('http') ? event.image_url : `http://localhost:5000${event.image_url}`) : undefined}
                  alt={event.title}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!event.image_url ? 'hidden' : ''}`}
                />

                {!event.image_url && (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-300">
                    <Calendar className="w-16 h-16 mb-2 opacity-50" />
                    <span className="font-bold text-xs uppercase tracking-[0.2em]">No Preview</span>
                  </div>
                )}

                {/* Date Badge - Calendar Leaf Style */}
                <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 min-w-[72px] flex flex-col items-center shadow-lg border border-white/50">
                  <span className="text-[0.65rem] font-bold text-orange-500 uppercase tracking-widest leading-none mb-1">
                    {format(new Date(event.event_date), 'MMM')}
                  </span>
                  <span className="text-2xl font-black text-slate-900 leading-none">
                    {format(new Date(event.event_date), 'd')}
                  </span>
                </div>

                {/* Image Counter */}
                {event.images_full && event.images_full.length > 1 && (
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white font-medium text-xs border border-white/10 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                      +{event.images_full.length - 1} Photos
                    </span>
                  </div>
                )}

                {/* Location & Time Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-20 flex items-center justify-between text-white/90">
                  <div className="flex items-center gap-4 text-xs font-semibold tracking-wide uppercase">
                    <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-orange-400" />
                      {event.event_time}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 flex-1 flex flex-col relative">
                {/* Admin Actions - Floating */}
                {isAdmin && (
                  <div className="absolute -top-5 right-6 flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(event); }}
                      className="h-10 w-10 flex items-center justify-center bg-white rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50 shadow-lg shadow-slate-200/50 transition-all hover:scale-110"
                      title="Edit Event"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                      className="h-10 w-10 flex items-center justify-center bg-white rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50 shadow-lg shadow-slate-200/50 transition-all hover:scale-110"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-start justify-between gap-4 mb-3 mt-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 leading-snug mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                  {event.title}
                </h3>

                <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                  {event.description}
                </p>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex -space-x-2 overflow-hidden">
                    {/* Visual attendees indicator */}
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-100" />
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200" />
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-300 flex items-center justify-center text-[8px] font-bold text-slate-500">+</div>
                  </div>

                  <button
                    onClick={() => openGallery(event.images_full || [event.image_url])}
                    className="text-xs font-bold text-orange-500 hover:text-orange-600 uppercase tracking-wider flex items-center gap-1 transition-all group/btn"
                  >
                    View Details
                    <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
          <div className="p-6 rounded-full bg-white shadow-sm mb-4">
            <Calendar className="w-10 h-10 text-slate-300" />
          </div>
          <p className="text-slate-900 font-bold text-lg">No events found</p>
          <p className="text-slate-500 text-sm">Check back later for upcoming company gatherings!</p>
        </div>
      )}

      {/* Add Event Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[2rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <div className="bg-slate-900 px-8 py-6 flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-black text-white tracking-tight">New Event</DialogTitle>
              <p className="text-slate-400 text-sm mt-1">Create a new event and notify the team.</p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
              <Calendar className="w-6 h-6 text-orange-400" />
            </div>
          </div>

          <form onSubmit={handleCreateEvent} className="p-8 space-y-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Event Title</Label>
                <Input
                  required
                  placeholder="e.g., Summer Hackathon 2024"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</Label>
                <Input
                  required
                  type="date"
                  value={newItem.event_date}
                  onChange={(e) => setNewItem({ ...newItem, event_date: e.target.value })}
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time</Label>
                <Input
                  required
                  type="time"
                  value={newItem.event_time}
                  onChange={(e) => setNewItem({ ...newItem, event_time: e.target.value })}
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-orange-500"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    required
                    placeholder="e.g., Main Conference Room"
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    className="h-12 pl-10 rounded-xl bg-slate-50 border-slate-200 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</Label>
                <Textarea
                  required
                  placeholder="Share the details..."
                  className="min-h-[120px] rounded-xl bg-slate-50 border-slate-200 focus:border-orange-500 resize-none p-4"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Event Imagery (Max 10)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {imagePreviews.map((src, index) => (
                    <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group shadow-md">
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {selectedFiles.length < 10 && (
                    <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50/50 transition-all group">
                      <div className="p-3 rounded-full bg-slate-100 text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-500 transition-colors mb-2">
                        <Upload className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 group-hover:text-orange-500 uppercase tracking-wide">Upload</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="rounded-xl h-11 px-6 border-slate-200">Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="rounded-xl h-11 px-8 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20">
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : 'Publish Event'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Event Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[2rem] border-none shadow-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
          <div className="bg-white border-b border-slate-100 px-8 py-6 flex items-center justify-between sticky top-0 z-50">
            <div>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Edit Event</DialogTitle>
              <p className="text-slate-500 text-sm mt-1">Update event details and images.</p>
            </div>
          </div>

          <div className="p-8 space-y-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Event Title</Label>
                <Input
                  required
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date</Label>
                <Input
                  required
                  type="date"
                  value={newItem.event_date}
                  onChange={(e) => setNewItem({ ...newItem, event_date: e.target.value })}
                  className="h-12 rounded-xl bg-slate-50 border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time</Label>
                <Input
                  required
                  type="time"
                  value={newItem.event_time}
                  onChange={(e) => setNewItem({ ...newItem, event_time: e.target.value })}
                  className="h-12 rounded-xl bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    required
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    className="h-12 pl-10 rounded-xl bg-slate-50 border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</Label>
                <Textarea
                  required
                  className="min-h-[120px] rounded-xl bg-slate-50 border-slate-200 resize-none p-4"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>

              <div className="space-y-4 md:col-span-2 pt-4 border-t border-slate-100">
                <Label className="text-sm font-bold text-slate-900 block">Managed Gallery</Label>

                {/* Existing Images */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-slate-400">Current Images</span>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {currentEvent?.images?.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border border-slate-100">
                        <img src={img.full_url} alt="Event" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteExistingImage(img.id)}
                            className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!currentEvent?.images || currentEvent.images.length === 0) && (
                      <div className="col-span-full py-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400">No images currently uploaded.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* New Uploads */}
                <div className="space-y-2 mt-4">
                  <span className="text-xs font-medium text-slate-400">Add New Images</span>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {imagePreviews.map((src, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {(selectedFiles.length + (currentEvent?.images?.length || 0)) < 10 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all group">
                        <Plus className="w-5 h-5 text-slate-300 group-hover:text-orange-500 mb-1" />
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-orange-500 uppercase">Add</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-slate-100">
              <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="rounded-xl h-11">Cancel</Button>
              <Button
                onClick={handleUpdateEvent}
                disabled={isSubmitting}
                className="rounded-xl h-11 px-8 bg-orange-500 hover:bg-orange-600 text-white font-bold"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Gallery Modal - Clean & Immersive */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="sm:max-w-6xl w-full h-[90vh] bg-transparent border-none shadow-none p-0 overflow-hidden outline-none flex items-center justify-center">

          <div className="relative w-full h-full p-4 overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="fixed top-6 right-6 z-50 p-3 bg-black/50 text-white rounded-full hover:bg-white hover:text-black transition-all backdrop-blur-md"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {selectedEventImages?.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 aspect-[4/3] ring-1 ring-white/10"
                >
                  <img
                    src={img.startsWith('http') || img.startsWith('blob:') ? img : `http://localhost:5000${img}`}
                    alt={`Event photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <span className="text-white font-medium text-sm">Image {idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Events;
