import React, { useState } from 'react';
import { Package, Search, Filter, Grid, List, Plus, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'low-stock' | 'out-of-stock';
  image?: string;
}

const Products: React.FC = () => {
  const { isAdmin } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const products: Product[] = [
    { id: 'PRD-001', name: 'Premium Widget', sku: 'WDG-001', category: 'Widgets', price: 49.99, stock: 150, status: 'active' },
    { id: 'PRD-002', name: 'Standard Component', sku: 'CMP-001', category: 'Components', price: 29.99, stock: 8, status: 'low-stock' },
    { id: 'PRD-003', name: 'Advanced Module', sku: 'MOD-001', category: 'Modules', price: 99.99, stock: 45, status: 'active' },
    { id: 'PRD-004', name: 'Basic Assembly Kit', sku: 'ASM-001', category: 'Assemblies', price: 149.99, stock: 0, status: 'out-of-stock' },
    { id: 'PRD-005', name: 'Pro Widget Plus', sku: 'WDG-002', category: 'Widgets', price: 79.99, stock: 62, status: 'active' },
    { id: 'PRD-006', name: 'Enterprise Module', sku: 'MOD-002', category: 'Modules', price: 199.99, stock: 25, status: 'active' },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-500/20 text-green-300 border-green-400/30',
      'low-stock': 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      'out-of-stock': 'bg-red-500/20 text-red-300 border-red-400/30',
    };
    return styles[status] || 'bg-white/10 text-white/60';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Widgets: 'from-orange-400 to-amber-400',
      Components: 'from-purple-400 to-pink-400',
      Modules: 'from-green-400 to-emerald-400',
      Assemblies: 'from-amber-400 to-orange-400',
    };
    return colors[category] || 'from-gray-400 to-gray-500';
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-primary/10">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Products</h1>
            <p className="text-slate-500 font-medium mt-1">Manage your product catalog and inventory</p>
          </div>
        </div>
        {isAdmin && (
          <button className="px-8 py-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-3 font-black uppercase tracking-[0.2em] text-sm">
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-50 text-slate-900 placeholder:text-slate-400 font-bold focus:outline-none focus:bg-white focus:border-primary/20 transition-all shadow-inner"
            />
          </div>

          {/* Filters & View Toggle */}
          <div className="flex items-center gap-4">
            <button className="px-6 py-4 rounded-2xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 hover:bg-slate-50 transition-all">
              <Filter className="w-4 h-4" />
              Filters
            </button>
            
            <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-slate-100/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-4 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group flex flex-col">
              {/* Product Image Area */}
              <div className="aspect-[4/3] rounded-[2rem] bg-slate-50 mb-6 flex items-center justify-center group-hover:bg-slate-100/50 transition-colors relative overflow-hidden">
                <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm 
                  ${product.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    product.status === 'low-stock' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-red-50 text-red-600 border-red-100'}`}>
                  {product.status.replace('-', ' ')}
                </div>
                <Package className="w-24 h-24 text-slate-200 transition-transform group-hover:scale-110 duration-500" />
              </div>

              {/* Product Info */}
              <div className="px-4 pb-4 space-y-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-slate-900 font-black text-xl tracking-tight leading-tight group-hover:text-primary transition-colors truncate">{product.name}</h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{product.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black text-primary tracking-tighter">${product.price}</div>
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mt-1">{product.stock} Units</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                  <span className="px-3 py-1 bg-slate-50 rounded-lg text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    {product.category}
                  </span>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-500 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Products List View */
        <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Product</th>
                <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">SKU / Category</th>
                <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Price</th>
                <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Stock</th>
                <th className="text-left py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Status</th>
                {isAdmin && <th className="text-right py-6 px-8 text-slate-400 font-black uppercase tracking-widest text-[10px]">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-white transition-colors">
                        <Package className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                      </div>
                      <span className="text-slate-900 font-black tracking-tight">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-6 px-8">
                    <div className="flex flex-col">
                      <span className="text-slate-500 font-bold text-sm">{product.sku}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-0.5">{product.category}</span>
                    </div>
                  </td>
                  <td className="py-6 px-8 text-primary font-black text-xl tracking-tighter">${product.price}</td>
                  <td className="py-6 px-8 text-slate-500 font-bold">{product.stock}</td>
                  <td className="py-6 px-8">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-wider shadow-sm 
                      ${product.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        product.status === 'low-stock' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-red-50 text-red-600 border-red-100'}`}>
                      {product.status.replace('-', ' ')}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="py-6 px-8">
                      <div className="flex items-center justify-end gap-3">
                        <button className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-primary hover:border-primary transition-all">
                          <Edit2 className="w-4.5 h-4.5" />
                        </button>
                        <button className="p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:border-red-500 transition-all">
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Products;
