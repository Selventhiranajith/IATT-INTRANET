/**
 * Centralized API Service
 *
 * All backend API calls go through this file.
 * It uses the base `api` client from `@/lib/api` which handles:
 *   - Base URL (http://localhost:5000/api)
 *   - JWT Authorization headers
 *   - JSON serialization / deserialization
 *   - FormData support (no Content-Type override)
 */

import { api } from '@/lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// AUTH / USERS
// ─────────────────────────────────────────────────────────────────────────────

export const authApi = {
    /** Get current authenticated user */
    getMe: () => api.get<any>('/auth/me'),

    /** Login */
    login: (email: string, password: string, branch: string) =>
        api.post<any>('/auth/login', { email, password, branch }),

    /** Get recent joined members */
    getRecentJoined: () => api.get<any>('/auth/recent-joined'),

    /** Get all birthdays */
    getBirthdays: () => api.get<any>('/auth/birthdays'),

    /** Admin: Get all users */
    getUsers: () => api.get<any>('/auth/admin/users'),

    /** Admin: Create a new user/employee */
    createUser: (userData: Record<string, any>) =>
        api.post<any>('/auth/admin/users', userData),

    /** Admin: Update a user/employee */
    updateUser: (id: string, userData: Record<string, any>) =>
        api.put<any>(`/auth/admin/users/${id}`, userData),

    /** Admin: Delete a user/employee */
    deleteUser: (id: string) => api.delete<any>(`/auth/admin/users/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// ANNOUNCEMENTS
// ─────────────────────────────────────────────────────────────────────────────

export const announcementsApi = {
    /** Get all announcements */
    getAll: () => api.get<any>('/announcements'),

    /** Create an announcement */
    create: (payload: {
        title: string;
        content: string;
        priority: string;
        publish_at?: string | null;
        expiry_at?: string | null;
    }) => api.post<any>('/announcements', payload),

    /** Delete an announcement */
    remove: (id: number) => api.delete<any>(`/announcements/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────────────────────────

export const eventsApi = {
    /** Get all events */
    getAll: () => api.get<any>('/events'),

    /** Create a new event (with FormData for file uploads) */
    create: (formData: FormData) => api.post<any>('/events', formData),

    /** Update an event */
    update: (id: number, formData: FormData) =>
        api.put<any>(`/events/${id}`, formData),

    /** Delete an event */
    remove: (id: number) => api.delete<any>(`/events/${id}`),

    /** Delete a specific event image */
    removeImage: (imageId: number) => api.delete<any>(`/events/image/${imageId}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// IDEAS
// ─────────────────────────────────────────────────────────────────────────────

export const ideasApi = {
    /** Get all ideas */
    getAll: () => api.get<any>('/ideas'),

    /** Get a single idea (with its comments) */
    getOne: (id: number) => api.get<any>(`/ideas/${id}`),

    /** Create a new idea */
    create: (payload: { title: string; content: string }) =>
        api.post<any>('/ideas', payload),

    /** Update an idea */
    update: (id: number, payload: { title: string; content: string }) =>
        api.put<any>(`/ideas/${id}`, payload),

    /** Delete an idea */
    remove: (id: number) => api.delete<any>(`/ideas/${id}`),

    /** Like / unlike an idea */
    toggleLike: (id: number) => api.post<any>(`/ideas/${id}/like`),

    /** Add a comment to an idea */
    addComment: (ideaId: number, comment: string) =>
        api.post<any>(`/ideas/${ideaId}/comments`, { comment }),

    /** Delete a comment */
    removeComment: (commentId: number) =>
        api.delete<any>(`/ideas/comments/${commentId}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// HR POLICIES
// ─────────────────────────────────────────────────────────────────────────────

export const hrPolicyApi = {
    /** Get all HR policies */
    getAll: () => api.get<any>('/hr'),

    /** Create a new policy */
    create: (payload: Record<string, any>) => api.post<any>('/hr/create', payload),

    /** Update an existing policy */
    update: (id: string, payload: Record<string, any>) =>
        api.put<any>(`/hr/update/${id}`, payload),

    /** Delete a policy */
    remove: (id: string) => api.delete<any>(`/hr/delete/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// HOLIDAYS
// ─────────────────────────────────────────────────────────────────────────────

export const holidaysApi = {
    /** Get all holidays */
    getAll: () => api.get<any>('/holidays'),

    /** Create a holiday */
    create: (payload: { name: string; date: string; description?: string }) =>
        api.post<any>('/holidays', payload),

    /** Update a holiday */
    update: (id: number, payload: { name: string; date: string; description?: string }) =>
        api.put<any>(`/holidays/${id}`, payload),

    /** Delete a holiday */
    remove: (id: number) => api.delete<any>(`/holidays/${id}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// ATTENDANCE
// ─────────────────────────────────────────────────────────────────────────────

export const attendanceApi = {
    /** Get today's attendance status and logs for the current user */
    getToday: () => api.get<any>('/attendance/today'),

    /** Check in */
    checkIn: (remarks: string) => api.post<any>('/attendance/check-in', { remarks }),

    /** Check out */
    checkOut: (remarks: string) => api.post<any>('/attendance/check-out', { remarks }),

    /** Admin: Get all attendance logs (with optional search / employee_id filter) */
    getAll: (params?: { search?: string; employee_id?: string }) => {
        const query = new URLSearchParams();
        if (params?.search) query.append('search', params.search);
        if (params?.employee_id) query.append('employee_id', params.employee_id);
        const qs = query.toString();
        return api.get<any>(`/attendance/all${qs ? `?${qs}` : ''}`);
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// THOUGHTS OF THE DAY
// ─────────────────────────────────────────────────────────────────────────────

export const thoughtsApi = {
    /** Get all thoughts */
    getAll: () => api.get<any>('/thoughts/all'),

    /** Get thoughts by branch */
    getByBranch: (branch: string) => api.get<any>(`/thoughts/branch/${branch}`),

    /** Get a random thought for a branch */
    getRandom: (branch: string) => api.get<any>(`/thoughts/random/${branch}`),

    /** Create a thought */
    create: (payload: { quote: string; author?: string; branch?: string }) =>
        api.post<any>('/thoughts', payload),

    /** Update a thought */
    update: (id: number, payload: { quote: string; author?: string; branch?: string }) =>
        api.put<any>(`/thoughts/${id}`, payload),

    /** Delete a thought */
    remove: (id: number) => api.delete<any>(`/thoughts/${id}`),
};
