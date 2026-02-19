import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Save, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const AccountSettings: React.FC = () => {
  const { user } = useAuth();

  // Profile state
  // Handle splitting name if it comes as a single string, though backend user object should have first/last
  const [profileData, setProfileData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '', // Map from User object if available
    location: user?.branch || 'Chennai, Tamil Nadu',
    department: user?.department || 'Engineering',
    designation: user?.role || '',
    birthDate: user?.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
    bio: 'Passionate software developer with expertise in modern web technologies.', // Keep hardcoded or add to backend if needed
  });

  const handleProfileSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          phone: profileData.phone,
          birth_date: profileData.birthDate
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile', { description: data.message });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('An error occurred while updating profile');
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-4 rounded-2xl bg-primary/10">
          <User className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your account profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">

        {/* Content Area - Full Width since no sidebar */}
        <div className="col-span-1">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
            {/* Profile Tab */}

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Profile Information</h2>
                <p className="text-slate-500 text-sm font-medium">Update your personal information</p>
              </div>

              {/* Avatar Section */}
              <div className="flex items-center gap-6 pb-8 border-b border-slate-100">
                <div className="relative group">
                  <Avatar className="w-24 h-24 border-4 border-slate-50 shadow-lg">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-black text-3xl">
                      {user?.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{user?.name}</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">{user?.role}</p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="font-bold text-slate-500">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className="pl-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="font-bold text-slate-500">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="pl-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold text-slate-500">Email Address (Read Only)</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      readOnly
                      className="pl-11 rounded-xl bg-slate-50 text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-bold text-slate-500">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="pl-11 rounded-xl"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="font-bold text-slate-500">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="birthDate"
                      type="date"
                      value={profileData.birthDate}
                      onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })}
                      className="pl-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="font-bold text-slate-500">Location (Read Only)</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="location"
                      value={profileData.location}
                      readOnly
                      className="pl-11 rounded-xl bg-slate-50 text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="font-bold text-slate-500">Department (Read Only)</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="department"
                      value={profileData.department}
                      readOnly
                      className="pl-11 rounded-xl bg-slate-50 text-slate-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="designation" className="font-bold text-slate-500">Designation (Read Only)</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="designation"
                      value={profileData.designation}
                      readOnly
                      className="pl-11 rounded-xl bg-slate-50 text-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="font-bold text-slate-500">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="rounded-xl min-h-[100px]"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                <Button variant="outline" className="rounded-xl font-bold">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleProfileSave} className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
