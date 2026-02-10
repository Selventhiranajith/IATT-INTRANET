import React from 'react';
import { Factory, Package, TrendingUp, Clock, AlertTriangle, CheckCircle2, Pause, Play } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';

interface ProductionOrder {
  id: string;
  product: string;
  quantity: number;
  completed: number;
  status: 'in-progress' | 'completed' | 'paused' | 'delayed';
  startDate: string;
  dueDate: string;
  assignedTo: string;
}

const ProductionTracking: React.FC = () => {
  const { isAdmin } = useAuth();

  const orders: ProductionOrder[] = [
    { id: 'PO-001', product: 'Widget A', quantity: 500, completed: 425, status: 'in-progress', startDate: 'Jan 25', dueDate: 'Feb 5', assignedTo: 'Team Alpha' },
    { id: 'PO-002', product: 'Component B', quantity: 1000, completed: 1000, status: 'completed', startDate: 'Jan 20', dueDate: 'Feb 1', assignedTo: 'Team Beta' },
    { id: 'PO-003', product: 'Module C', quantity: 250, completed: 50, status: 'delayed', startDate: 'Jan 28', dueDate: 'Feb 3', assignedTo: 'Team Gamma' },
    { id: 'PO-004', product: 'Assembly D', quantity: 750, completed: 0, status: 'paused', startDate: 'Feb 1', dueDate: 'Feb 15', assignedTo: 'Team Alpha' },
    { id: 'PO-005', product: 'Product E', quantity: 300, completed: 180, status: 'in-progress', startDate: 'Jan 30', dueDate: 'Feb 8', assignedTo: 'Team Delta' },
  ];

  const stats = [
    { label: 'Active Orders', value: 3, icon: Factory, color: 'from-orange-400 to-amber-400' },
    { label: 'Completed', value: 12, icon: CheckCircle2, color: 'from-green-400 to-emerald-400' },
    { label: 'Units Produced', value: '2.4K', icon: Package, color: 'from-purple-400 to-pink-400' },
    { label: 'Efficiency Rate', value: '94%', icon: TrendingUp, color: 'from-amber-400 to-orange-400' },
  ];

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ElementType; label: string }> = {
      'in-progress': { color: 'bg-orange-500/20 text-orange-300 border-orange-400/30', icon: Play, label: 'In Progress' },
      completed: { color: 'bg-green-500/20 text-green-300 border-green-400/30', icon: CheckCircle2, label: 'Completed' },
      paused: { color: 'bg-amber-500/20 text-amber-300 border-amber-400/30', icon: Pause, label: 'Paused' },
      delayed: { color: 'bg-red-500/20 text-red-300 border-red-400/30', icon: AlertTriangle, label: 'Delayed' },
    };
    return configs[status] || { color: 'bg-white/10 text-white/60', icon: Clock, label: status };
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-primary/10">
            <Factory className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Production Tracking</h1>
            <p className="text-slate-500 font-medium mt-1">Monitor and manage production orders</p>
          </div>
        </div>
        {isAdmin && (
          <button className="px-8 py-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-3 font-black uppercase tracking-[0.2em] text-sm">
            <Factory className="w-5 h-5" />
            New Production Order
          </button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Active Orders', value: 3, icon: Factory, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'Completed Today', value: 12, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Units Produced', value: '2.4K', icon: Package, color: 'text-sky-500', bg: 'bg-sky-50' },
          { label: 'Efficiency Rate', value: '94%', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <span className="text-3xl font-black text-primary tracking-tighter leading-none">{stat.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Production Orders Table */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Production Orders</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Order ID</th>
                <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Product</th>
                <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Progress</th>
                <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Status</th>
                <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Due Date</th>
                <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Team</th>
                {isAdmin && <th className="text-right py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const progress = Math.round((order.completed / order.quantity) * 100);
                const statusStyles: Record<string, string> = {
                  'in-progress': 'bg-sky-50 text-primary border-sky-100',
                  completed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                  paused: 'bg-amber-50 text-amber-600 border-amber-100',
                  delayed: 'bg-red-50 text-red-600 border-red-100',
                };

                return (
                  <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                    <td className="py-6 px-8 text-primary font-black text-sm">{order.id}</td>
                    <td className="py-6 px-8">
                      <div>
                        <p className="text-slate-900 font-black tracking-tight">{order.product}</p>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">{order.quantity} units</p>
                      </div>
                    </td>
                    <td className="py-6 px-8 min-w-[250px]">
                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.completed}/{order.quantity} units</span>
                          <span className="text-xs font-black text-primary">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-slate-100" indicatorClassName="bg-primary shadow-sm" />
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm ${statusStyles[order.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {order.status.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="py-6 px-8 text-slate-500 font-bold">{order.dueDate}</td>
                    <td className="py-6 px-8">
                       <span className="px-3 py-1 bg-slate-100 rounded-lg text-slate-600 text-[10px] font-black uppercase tracking-widest">{order.assignedTo}</span>
                    </td>
                    {isAdmin && (
                      <td className="py-6 px-8 text-right">
                        <button className="px-6 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all">
                          Manage
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Activity */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Recent Activity</h3>
          <div className="space-y-4">
            {[
              { action: 'PO-001 updated', detail: '425 units completed', time: '2 hours ago', type: 'progress' },
              { action: 'PO-002 completed', detail: 'All 1000 units delivered', time: '5 hours ago', type: 'success' },
              { action: 'PO-003 delayed', detail: 'Material shortage', time: '1 day ago', type: 'warning' },
              { action: 'PO-004 paused', detail: 'Pending quality check', time: '2 days ago', type: 'info' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-50 group hover:border-slate-100 hover:bg-white transition-all">
                <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                  item.type === 'success' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' :
                  item.type === 'warning' ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' :
                  item.type === 'progress' ? 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]' : 
                  'bg-slate-300'
                }`} />
                <div className="flex-1">
                  <p className="text-slate-900 font-black text-sm">{item.action}</p>
                  <p className="text-slate-500 text-xs font-medium mt-0.5">{item.detail}</p>
                </div>
                <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Team Performance</h3>
          <div className="space-y-6">
            {[
              { team: 'Team Alpha', orders: 8, efficiency: 96, bg: 'bg-indigo-500' },
              { team: 'Team Beta', orders: 6, efficiency: 92, bg: 'bg-emerald-500' },
              { team: 'Team Gamma', orders: 5, efficiency: 85, bg: 'bg-amber-500' },
              { team: 'Team Delta', orders: 7, efficiency: 94, bg: 'bg-purple-500' },
            ].map((team, i) => (
              <div key={i} className="p-5 rounded-2xl border border-slate-50 hover:border-slate-100 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col">
                    <span className="text-slate-900 font-black text-sm">{team.team}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{team.orders} active orders</span>
                  </div>
                  <span className="text-xl font-black text-primary tracking-tighter">{team.efficiency}%</span>
                </div>
                <Progress value={team.efficiency} className="h-2.5 bg-slate-100" indicatorClassName={team.bg} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionTracking;
