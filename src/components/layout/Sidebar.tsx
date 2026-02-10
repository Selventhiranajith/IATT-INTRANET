import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  FileEdit, 
  FileCheck,
  Eye,
  Fingerprint,
  ClipboardList,
  FileText,
  FolderKanban,
  GraduationCap,
  Factory,
  Package,
  Files,
  ScrollText,
  Lightbulb,
  PartyPopper,
  Cake,
  LogOut,
  ChevronDown,
  ChevronRight,
  Gift,
  Notebook,
  User,
  ShieldAlert,
  Settings,
  Users2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  label: string;
  icon: React.ElementType;
  path?: string;
  children?: MenuItem[];
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { 
    label: 'Attendance', 
    icon: Calendar,
    children: [
      { label: 'Manual Attendance', icon: FileEdit, path: '/attendance/manual' },
      // { label: 'Apply Leave', icon: FileCheck, path: '/attendance/apply-leave' },
    ]
  },
  { 
    label: 'View Attendance & Leave', 
    icon: Notebook,
    children: [
      { label: 'View Bio Attendance', icon: Fingerprint, path: '/attendance/bio', adminOnly: true },
      { label: 'View Manual Attendance', icon: ClipboardList, path: '/attendance/view-manual', adminOnly: true },
      // { label: 'View Leave', icon: FileText, path: '/attendance/view-leave', adminOnly: true },
    ]
  },
  { 
    label: 'Projects & Products', 
    icon: FolderKanban,
    children: [
      { label: 'Products', icon: Package, path: '/projects/products' },
    ]
  },
  { 
    label: 'Documents', 
    icon: Files,
    children: [
      { label: 'Admin', icon: User, path: '/documents/admin' },
      { label: 'Management', icon: FileText, path: '/documents/management' },
    ]
  },
  { 
    label: 'Miscellaneous', 
    icon: ScrollText,
    children: [
      { label: 'Employee', icon: FileEdit, path: '/attendance/employee' },
      { label: 'Events', icon: PartyPopper, path: '/events' },
      { label: 'HR Policy', icon: ScrollText, path: '/misc/hr-policy' },
      { label: 'Ideas', icon: Lightbulb, path: '/misc/ideas' },
      { label: 'Holidays', icon: PartyPopper, path: '/misc/holidays', adminOnly: true },
      { label: 'Birthday', icon: Cake, path: '/misc/birthday', adminOnly: true },
    ]
  },
  {
    label: 'System Control',
    icon: ShieldAlert,
    superAdminOnly: true,
    children: [
      { label: 'User Management', icon: Users2, path: '/admin/users' },
      //{ label: 'System Settings', icon: Settings, path: '/admin/settings' },
    ]
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAdmin, isSuperAdmin } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Employee & Events']);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (path?: string) => {
    return path && location.pathname === path;
  };

  const filteredMenuItems = React.useMemo(() => {
    const filterItems = (items: MenuItem[]): MenuItem[] => {
      return items.reduce((acc: MenuItem[], item) => {
        // SuperAdmin has access to everything
        if (item.superAdminOnly && !isSuperAdmin) return acc;
        // Admin has access to admin items (but not superadmin-only items)
        if (item.adminOnly && !isAdmin && !isSuperAdmin) return acc;

        const newItem = { ...item };
        if (newItem.children) {
          const filteredChildren = filterItems(newItem.children);
          if (filteredChildren.length > 0) {
            newItem.children = filteredChildren;
            acc.push(newItem);
          }
        } else {
          acc.push(newItem);
        }

        return acc;
      }, []);
    };

    return filterItems(menuItems);
  }, [isAdmin, isSuperAdmin]);

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const active = isActive(item.path);

    return (
      <div key={item.label} className="animate-fade-in" style={{ animationDelay: `${depth * 50}ms` }}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpand(item.label);
            } else if (item.path) {
              navigate(item.path);
            }
          }}
          className={cn(
            'flex items-center gap-4 w-full px-6 py-4 rounded-2xl transition-all duration-200 group relative',
            active 
              ? 'bg-primary text-white shadow-lg shadow-primary/25 font-bold' 
              : 'text-slate-400 hover:text-slate-900 hover:bg-background font-bold',
            depth > 0 && 'pl-12 text-sm py-3'
          )}
        >
          <item.icon className={cn(
            "w-5 h-5 shrink-0 transition-colors",
            active ? "text-white" : "text-slate-400 group-hover:text-primary"
          )} />
          {isOpen && (
            <span className="flex-1 text-left truncate tracking-tight">{item.label}</span>
          )}
          {hasChildren && isOpen && (
            <span className={cn(
              "transition-transform duration-200",
              isExpanded && "rotate-180"
            )}>
              <ChevronDown className="w-4 h-4 opacity-50" />
            </span>
          )}
        </button>
        
        {hasChildren && isExpanded && isOpen && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderMenuItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const todaysBirthdays: any[] = [];

  return (
    <aside
      className={cn(
        'bg-white h-screen flex flex-col transition-all duration-300 ease-in-out shrink-0 z-50 border-r border-slate-100',
        isOpen ? 'w-72' : 'w-24'
      )}
    >
      {/* Top Gradient Line (matches header) */}
      <div className="h-1.5 w-full bg-gradient-to-r from-secondary to-yellow-400 shrink-0" />

      {/* Logo Section */}
      <div className={cn(
        "h-28 flex items-center transition-all duration-300",
        isOpen ? "px-8 gap-4" : "justify-center px-0"
      )}>
        <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 shadow-sm border border-primary/5 p-2 transition-all">
          <img src="/assets/favicon1.png" alt="IATT Logo" className="w-full h-full object-contain" />
        </div>
        {isOpen && (
          <div className="flex flex-col animate-fade-in">
            <span className="text-primary font-black text-xl tracking-tight leading-none">IATT INTRANET</span>
            <span className="text-slate-400 font-bold text-[10px] tracking-widest uppercase mt-1 opacity-80">Portal</span>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className={cn(
        "flex-1 space-y-4 overflow-y-auto no-scrollbar py-6 transition-all duration-300",
        isOpen ? "px-4" : "px-2"
      )}>
        {filteredMenuItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.label);
          const active = isActive(item.path);
          const anyChildActive = item.children?.some(child => isActive(child.path));

          return (
            <div key={item.label} className="space-y-1">
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggleExpand(item.label);
                  } else if (item.path) {
                    navigate(item.path);
                  }
                }}
                className={cn(
                  'flex items-center gap-4 w-full py-3 rounded-2xl transition-all duration-300 group relative',
                  isOpen ? 'px-6' : 'justify-center px-0',
                  active || anyChildActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02]' 
                    : 'text-slate-500 hover:text-primary hover:bg-background'
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 shrink-0 transition-all",
                  active || anyChildActive ? "text-white" : "text-slate-400 group-hover:text-primary group-hover:scale-110"
                )} />
                {isOpen && (
                  <span className={cn(
                    "flex-1 text-left font-bold tracking-tight text-sm",
                    active || anyChildActive ? "text-white" : "text-slate-500"
                  )}>{item.label}</span>
                )}
                {hasChildren && isOpen && (
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform duration-300 opacity-50",
                    isExpanded && "rotate-180"
                  )} />
                )}
              </button>
              
              {hasChildren && isExpanded && isOpen && (
                <div className="ml-4 pl-4 border-l border-slate-100 space-y-1 py-1">
                  {item.children!.map((child) => (
                    <button
                      key={child.label}
                      onClick={() => navigate(child.path!)}
                      className={cn(
                        'flex items-center gap-4 w-full px-4 py-2 rounded-full transition-all duration-200 group relative',
                        isActive(child.path) 
                          ? 'bg-primary/5 text-primary font-bold' 
                          : 'text-slate-400 hover:text-primary hover:bg-background font-medium'
                      )}
                    >
                      <child.icon className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive(child.path) ? "text-primary" : "text-slate-400 group-hover:text-primary"
                      )} />
                      <span className="text-sm tracking-tight whitespace-nowrap">{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Decorative Bottom Shape & Logout */}
      <div className={cn(
        "relative overflow-hidden shrink-0 transition-all duration-300",
        isOpen ? "px-4 py-8" : "px-2 py-8 flex justify-center"
      )}>
        {isOpen && (
          <>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-400/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
          </>
        )}

        {/* Today's Birthday Section */}
        {isOpen && (
          <div className="mt-4 mb-2 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎂</span>
              <h4 className="text-[#9333ea] font-black text-sm tracking-tight uppercase">Today's Birthdays</h4>
            </div>
            
            {todaysBirthdays.length > 0 ? (
              <div className="space-y-3 pl-8">
                {todaysBirthdays.map((bday, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-slate-900 font-bold text-xs">{bday.name}</span>
                    <span className="text-slate-400 text-[10px] font-medium">{bday.department}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm font-medium pl-8">No birthdays today.</p>
            )}
          </div>
        )}

        <button
          onClick={logout}
          className={cn(
            "flex items-center rounded-full text-slate-500 font-bold hover:bg-red-50 hover:text-red-500 transition-all duration-300 group relative z-10 border border-slate-50",
            isOpen ? "w-full px-6 py-4 gap-4" : "w-12 h-12 justify-center"
          )}
          title={!isOpen ? "Logout" : ""}
        >
          <LogOut className={cn("w-5 h-5 transition-transform", isOpen && "group-hover:-translate-x-1")} />
          {isOpen && <span className="text-sm font-black uppercase tracking-widest leading-none">Logout</span>}
        </button>

      </div>
    </aside>
  );
};
