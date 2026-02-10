import React from 'react';
import { GraduationCap, Play, Clock, Award, BookOpen, TrendingUp, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Course {
  id: number;
  title: string;
  instructor: string;
  progress: number;
  duration: string;
  lessons: number;
  category: string;
  thumbnail?: string;
}

const LMS: React.FC = () => {
  const courses: Course[] = [
    { id: 1, title: 'Leadership Excellence', instructor: 'Dr. Sarah Mitchell', progress: 75, duration: '4h 30m', lessons: 12, category: 'Leadership' },
    { id: 2, title: 'Project Management Fundamentals', instructor: 'James Wilson', progress: 45, duration: '6h 15m', lessons: 18, category: 'Management' },
    { id: 3, title: 'Effective Communication', instructor: 'Emily Chen', progress: 100, duration: '3h 45m', lessons: 10, category: 'Soft Skills' },
    { id: 4, title: 'Data Analytics Basics', instructor: 'Mike Thompson', progress: 20, duration: '8h', lessons: 24, category: 'Technical' },
    { id: 5, title: 'Cybersecurity Awareness', instructor: 'Alex Rivera', progress: 0, duration: '2h 30m', lessons: 8, category: 'Security' },
    { id: 6, title: 'Time Management Mastery', instructor: 'Lisa Johnson', progress: 60, duration: '3h', lessons: 9, category: 'Productivity' },
  ];

  const stats = [
    { label: 'Courses Enrolled', value: 6, icon: BookOpen, color: 'from-orange-400 to-amber-400' },
    { label: 'Completed', value: 1, icon: Award, color: 'from-green-400 to-emerald-400' },
    { label: 'Hours Learned', value: 12, icon: Clock, color: 'from-purple-400 to-pink-400' },
    { label: 'Certificates', value: 1, icon: GraduationCap, color: 'from-amber-400 to-orange-400' },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Leadership: 'bg-purple-500/20 text-purple-300',
      Management: 'bg-orange-500/20 text-orange-300',
      'Soft Skills': 'bg-pink-500/20 text-pink-300',
      Technical: 'bg-amber-500/20 text-amber-300',
      Security: 'bg-red-500/20 text-red-300',
      Productivity: 'bg-green-500/20 text-green-300',
    };
    return colors[category] || 'bg-white/10 text-white/60';
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-indigo-50">
            <GraduationCap className="w-8 h-8 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">E-Learning LMS</h1>
            <p className="text-slate-500 font-medium mt-1">Continue your professional development journey</p>
          </div>
        </div>
        <button className="px-8 py-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-3 font-black uppercase tracking-[0.2em] text-sm">
          <BookOpen className="w-5 h-5" />
          Browse All Courses
        </button>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { label: 'Courses Enrolled', value: 6, icon: BookOpen, color: 'text-sky-500', bg: 'bg-sky-50' },
          { label: 'Completed', value: 1, icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Hours Learned', value: 12, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Certificates', value: 1, icon: GraduationCap, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none">{stat.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Learning Grid */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-primary/5 rounded-xl">
               <TrendingUp className="w-6 h-6 text-primary" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Courses</h2>
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:translate-x-1 transition-all flex items-center gap-2">
            View Learning Portal <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.filter(c => c.progress > 0 && c.progress < 100).map((course) => (
            <div 
              key={course.id} 
              className="bg-slate-50 border border-slate-50 rounded-[2rem] p-6 hover:bg-white hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group cursor-pointer"
            >
              {/* Thumbnail Mockup */}
              <div className="aspect-video rounded-[1.5rem] bg-gradient-to-br from-primary/10 to-indigo-500/10 mb-6 flex items-center justify-center relative overflow-hidden">
                <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 ml-1 fill-current" />
                </div>
                <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-widest text-primary shadow-sm">
                  {course.category}
                </span>
              </div>

              {/* Info */}
              <h3 className="text-slate-900 font-black text-lg tracking-tight mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
              <p className="text-slate-400 text-sm font-medium mb-6">Instructor: {course.instructor}</p>

              {/* High Performance Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-primary">{course.progress}% Completed</span>
                  <span className="text-slate-300">{course.lessons} Total Lessons</span>
                </div>
                <Progress value={course.progress} className="h-2.5 bg-slate-100" indicatorClassName="bg-primary" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Courses Listing */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Course Library</h2>
        
        <div className="space-y-6">
          {courses.map((course) => (
            <div 
              key={course.id}
              className="flex flex-col md:flex-row md:items-center gap-8 p-6 rounded-[2rem] bg-slate-50 border border-slate-50 hover:bg-white hover:border-slate-100 hover:shadow-lg transition-all group cursor-pointer"
            >
              {/* List Thumbnail */}
              <div className="w-full md:w-32 aspect-[4/3] rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                <GraduationCap className={`w-10 h-10 ${course.progress === 100 ? 'text-emerald-500' : 'text-slate-200'} group-hover:text-primary transition-colors`} />
              </div>

              {/* List Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                   <div className="flex-1">
                      <h3 className="text-slate-900 font-black text-lg tracking-tight leading-tight uppercase">{course.title}</h3>
                      <p className="text-slate-400 text-sm font-medium mt-0.5">by {course.instructor}</p>
                   </div>
                   <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white border border-slate-100 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                     {course.category}
                   </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Meta */}
                  <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {course.lessons} Lessons
                    </span>
                  </div>

                  {/* Progressive indicator */}
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                       <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${course.progress}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-primary w-10 text-right">{course.progress}%</span>
                  </div>
                </div>
              </div>

              {/* List Action */}
              <button className={`w-full md:w-40 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border shadow-sm
                ${course.progress === 0 
                  ? 'bg-primary text-white border-primary hover:shadow-lg hover:shadow-primary/30' 
                  : course.progress === 100 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-500 hover:text-white'
                    : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'}`}>
                {course.progress === 0 ? 'Start Learning' : course.progress === 100 ? 'Review Course' : 'Resume Progress'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LMS;
