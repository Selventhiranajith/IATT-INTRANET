import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg bg-white border border-slate-100 rounded-[3rem] p-16 text-center shadow-2xl shadow-slate-200/50 animate-scale-in">
        <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-10 group">
          <span className="text-red-500 font-black text-4xl tracking-tighter group-hover:scale-110 transition-transform">404</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4 uppercase">Route Not Found</h1>
        <p className="text-slate-500 font-medium text-lg leading-relaxed mb-12">
          The page you're trying to access at <code className="px-2 py-1 bg-slate-50 rounded-lg text-primary font-black text-sm">{location.pathname}</code> doesn't exist or has been moved.
        </p>
        <a 
          href="/" 
          className="inline-flex items-center justify-center px-10 py-5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all font-black uppercase tracking-[0.2em] text-sm"
        >
          Back to Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFound;
