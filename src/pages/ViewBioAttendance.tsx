
import React from 'react';
import { Fingerprint, Download } from 'lucide-react';

const ViewBioAttendance: React.FC = () => {
    return (
        <div className="space-y-10 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-2xl bg-primary/10">
                        <Fingerprint className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Biometric Attendance</h1>
                        <p className="text-slate-500 font-medium mt-1">Review biometric attendance logs</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-6 py-4 bg-white border border-slate-100 text-slate-500 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-3 font-black uppercase tracking-widest text-[10px]">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm min-h-[400px] flex items-center justify-center">
                <div className="bg-slate-50/30 rounded-[2rem] border border-slate-50 overflow-hidden flex flex-col items-center justify-center p-20 text-center w-full max-w-lg">
                    <Fingerprint className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Biometric integration pending</p>
                </div>
            </div>
        </div>
    );
};

export default ViewBioAttendance;
