import React from 'react';
import { Settings, Save, Globe, Lock, Bell, Layout, Terminal } from 'lucide-react';

const SystemSettings: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-secondary/10">
            <Terminal className="w-8 h-8 text-secondary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
            <p className="text-slate-500 font-medium mt-1">Configure global platform parameters</p>
          </div>
        </div>
        
        <button className="px-8 py-4 bg-secondary text-white rounded-2xl shadow-lg shadow-secondary/25 hover:shadow-xl hover:shadow-secondary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-3 font-black uppercase tracking-[0.2em] text-sm">
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { label: 'General Configuration', icon: Settings, active: true },
            { label: 'Platform Appearance', icon: Layout, active: false },
            { label: 'Security & Access', icon: Lock, active: false },
            { label: 'Localization', icon: Globe, active: false },
            { label: 'System Notifications', icon: Bell, active: false },
          ].map((item, i) => (
            <button key={i} className={`w-full flex items-center gap-4 px-8 py-6 rounded-[2rem] transition-all group ${
              item.active 
                ? 'bg-white shadow-sm border border-slate-100 text-slate-900' 
                : 'text-slate-400 hover:bg-white hover:text-slate-600'
            }`}>
              <item.icon className={`w-5 h-5 ${item.active ? 'text-secondary' : 'text-slate-300 group-hover:text-secondary'}`} />
              <span className="font-black text-sm uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 space-y-12">
          {/* Section: General */}
          <section className="space-y-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-secondary rounded-full" />
              Platform Identity
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Name</label>
                <input 
                  type="text" 
                  defaultValue="IATT Intranet Portal"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-secondary/20 focus:ring-4 focus:ring-secondary/5 transition-all font-bold text-slate-700"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organization Domain</label>
                <input 
                  type="text" 
                  defaultValue="iatt.com"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-secondary/20 focus:ring-4 focus:ring-secondary/5 transition-all font-bold text-slate-700"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Description</label>
              <textarea 
                rows={4}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-secondary/20 focus:ring-4 focus:ring-secondary/5 transition-all font-medium text-slate-600 resize-none"
                defaultValue="Global intranet solution for IATT employees including attendance tracking, project management, and internal communications."
              />
            </div>
          </section>

          {/* Section: Feature Toggles */}
          <section className="space-y-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full" />
              Enabled Modules
            </h3>

            <div className="space-y-4">
              {[
                { name: 'Attendance Tracking', desc: 'Allow employees to record manual and biometric attendance', enabled: true },
                { name: 'Leave Management', desc: 'Enable leave application and approval workflow', enabled: false },
                { name: 'Production Dashboard', desc: 'Real-time tracking of manufacturing outputs', enabled: true },
                { name: 'LMS Platform', desc: 'Learning management system for employee training', enabled: true },
              ].map((module, i) => (
                <div key={i} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex-1 pr-8">
                    <p className="font-black text-slate-900 tracking-tight">{module.name}</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{module.desc}</p>
                  </div>
                  <button className={`w-14 h-8 rounded-full transition-all relative ${module.enabled ? 'bg-secondary shadow-lg shadow-secondary/25' : 'bg-slate-200'}`}>
                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all ${module.enabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
