import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  History, 
  Plus, 
  Search, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  Printer,
  Settings,
  MoreVertical,
  Edit2,
  Trash2,
  Filter,
  X,
  Bell,
  CheckCircle2,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { InkItem, StockTransaction, InkColor } from './types';
import { cn, formatCurrency } from './lib/utils';

// ข้อมูลจำลอง (Mock Data)
const INITIAL_ITEMS: InkItem[] = [
  { id: '1', brand: 'Epson', model: '003', color: 'Black', quantity: 12, minThreshold: 5, price: 250, location: 'ชั้นวาง A1', lastUpdated: new Date().toISOString() },
  { id: '2', brand: 'Epson', model: '003', color: 'Cyan', quantity: 3, minThreshold: 5, price: 250, location: 'ชั้นวาง A1', lastUpdated: new Date().toISOString() },
  { id: '3', brand: 'Epson', model: '003', color: 'Magenta', quantity: 8, minThreshold: 5, price: 250, location: 'ชั้นวาง A1', lastUpdated: new Date().toISOString() },
  { id: '4', brand: 'Epson', model: '003', color: 'Yellow', quantity: 4, minThreshold: 5, price: 250, location: 'ชั้นวาง A1', lastUpdated: new Date().toISOString() },
  { id: '5', brand: 'Canon', model: 'GI-71', color: 'Black', quantity: 15, minThreshold: 10, price: 350, location: 'ชั้นวาง B2', lastUpdated: new Date().toISOString() },
  { id: '6', brand: 'HP', model: '680', color: 'Black', quantity: 2, minThreshold: 5, price: 450, location: 'ชั้นวาง C1', lastUpdated: new Date().toISOString() },
];

const INITIAL_TRANSACTIONS: StockTransaction[] = [
  { id: 't1', inkItemId: '1', type: 'IN', amount: 10, date: new Date().toISOString(), user: 'ผู้ดูแลระบบ', note: 'เติมสต๊อกประจำเดือน' },
  { id: 't2', inkItemId: '6', type: 'OUT', amount: 1, date: new Date().toISOString(), user: 'พนักงาน', note: 'ห้องพิมพ์ 1' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'history'>('dashboard');
  const [items, setItems] = useState<InkItem[]>(INITIAL_ITEMS);
  const [transactions, setTransactions] = useState<StockTransaction[]>(INITIAL_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InkItem | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // การคำนวณสถิติ
  const stats = useMemo(() => {
    const lowStockItems = items.filter(item => item.quantity <= item.minThreshold);
    const totalValue = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    return { lowStockCount: lowStockItems.length, lowStockItems, totalValue, totalItems };
  }, [items]);

  const chartData = useMemo(() => {
    return items.map(item => ({
      name: `${item.brand} ${item.model} (${item.color})`,
      quantity: item.quantity,
      min: item.minThreshold,
      color: item.color
    }));
  }, [items]);

  const colorData = useMemo(() => {
    const colors: Record<string, number> = {};
    items.forEach(item => {
      colors[item.color] = (colors[item.color] || 0) + item.quantity;
    });
    return Object.entries(colors).map(([name, value]) => ({ name, value }));
  }, [items]);

  const filteredItems = items.filter(item => 
    item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.color.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem: InkItem = {
      id: editingItem?.id || Math.random().toString(36).substr(2, 9),
      brand: formData.get('brand') as string,
      model: formData.get('model') as string,
      color: formData.get('color') as InkColor,
      quantity: Number(formData.get('quantity')),
      minThreshold: Number(formData.get('minThreshold')),
      price: Number(formData.get('price')),
      location: formData.get('location') as string,
      lastUpdated: new Date().toISOString(),
    };

    if (editingItem) {
      setItems(items.map(item => item.id === editingItem.id ? newItem : item));
    } else {
      setItems([...items, newItem]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const deleteItem = (id: string) => {
    if (confirm('ยืนยันการลบรายการนี้?')) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const getInkHexColor = (color: InkColor): string => {
    switch (color) {
      case 'Cyan': return '#06B6D4';
      case 'Magenta': return '#D946EF';
      case 'Yellow': return '#EAB308';
      case 'Black': return '#1E293B';
      case 'Light Cyan': return '#A5F3FC';
      case 'Light Magenta': return '#F5D0FE';
      default: return '#94A3B8';
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-slate-900 font-sans">
      {/* แถบเมนูข้าง (Sidebar) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Printer size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">คลังหมึก Pro</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">ระบบจัดการสต๊อก</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="แผงควบคุม" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={<Package size={20} />} 
            label="คลังสินค้า" 
            active={activeTab === 'inventory'} 
            onClick={() => setActiveTab('inventory')} 
          />
          <SidebarItem 
            icon={<History size={20} />} 
            label="ประวัติการทำรายการ" 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:bg-slate-50 rounded-lg transition-colors text-left">
            <Settings size={20} />
            <span className="font-medium">ตั้งค่า</span>
          </button>
        </div>
      </aside>

      {/* เนื้อหาหลัก (Main Content) */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-xl w-96">
            <Search size={18} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="ค้นหายี่ห้อ, รุ่น, หรือสี..." 
              className="bg-transparent border-none focus:ring-0 text-sm w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* ระบบแจ้งเตือนอัจฉริยะ */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 relative transition-colors"
              >
                <Bell size={22} />
                {stats.lowStockCount > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {stats.lowStockCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowNotifications(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-30 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h4 className="font-bold text-slate-900">การแจ้งเตือน</h4>
                        <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold uppercase">
                          {stats.lowStockCount} รายการ
                        </span>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {stats.lowStockItems.length > 0 ? (
                          stats.lowStockItems.map(item => (
                            <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                              <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                                  <AlertTriangle size={20} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-900">หมึกใกล้หมด!</p>
                                  <p className="text-xs text-slate-600 mt-0.5">
                                    {item.brand} {item.model} ({item.color}) เหลือเพียง <span className="font-bold text-rose-600">{item.quantity}</span> ชิ้น
                                  </p>
                                  <button 
                                    onClick={() => {
                                      setActiveTab('inventory');
                                      setSearchQuery(`${item.brand} ${item.model}`);
                                      setShowNotifications(false);
                                    }}
                                    className="text-[10px] text-indigo-600 font-bold mt-2 hover:underline"
                                  >
                                    ดูในคลังสินค้า →
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                              <CheckCircle2 size={24} />
                            </div>
                            <p className="text-sm font-medium text-slate-500">สต๊อกสินค้าปกติทุกรายการ</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              <Plus size={20} />
              เพิ่มหมึกใหม่
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* ตารางสถิติ */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  title="สต๊อกทั้งหมด" 
                  value={stats.totalItems} 
                  subValue="จำนวนชิ้นในคลัง"
                  icon={<Package className="text-indigo-600" />}
                  color="indigo"
                />
                <StatCard 
                  title="แจ้งเตือนหมึกน้อย" 
                  value={stats.lowStockCount} 
                  subValue="รายการที่ต้องเติม"
                  icon={<AlertTriangle className="text-amber-600" />}
                  color="amber"
                  alert={stats.lowStockCount > 0}
                />
                <StatCard 
                  title="มูลค่าคลังสินค้า" 
                  value={formatCurrency(stats.totalValue)} 
                  subValue="มูลค่ารวมโดยประมาณ"
                  icon={<ArrowUpRight className="text-emerald-600" />}
                  color="emerald"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* กราฟหลัก */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg mb-6">ระดับสต๊อกแยกตามรุ่น</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          cursor={{ fill: '#F8FAFC' }}
                        />
                        <Bar dataKey="quantity" radius={[4, 4, 0, 0]} barSize={40}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getInkHexColor(entry.color as InkColor)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* การกระจายตัวของสี */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-lg mb-6">สัดส่วนตามสี</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={colorData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {colorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getInkHexColor(entry.name as InkColor)} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {colorData.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getInkHexColor(entry.name as InkColor) }} />
                          <span className="text-slate-600 font-medium">{entry.name}</span>
                        </div>
                        <span className="font-bold">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-lg">รายการคลังสินค้า</h3>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 border border-slate-200">
                    <Filter size={18} />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                      <th className="px-6 py-4">ยี่ห้อและรุ่น</th>
                      <th className="px-6 py-4">สี</th>
                      <th className="px-6 py-4">จำนวน</th>
                      <th className="px-6 py-4">ตำแหน่งที่เก็บ</th>
                      <th className="px-6 py-4">ราคา</th>
                      <th className="px-6 py-4 text-right">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{item.brand}</div>
                          <div className="text-sm text-slate-500">{item.model}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full shadow-sm" 
                              style={{ backgroundColor: getInkHexColor(item.color) }} 
                            />
                            <span className="text-sm font-medium">{item.color}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "font-bold",
                              item.quantity <= item.minThreshold ? "text-rose-600" : "text-slate-900"
                            )}>
                              {item.quantity}
                            </span>
                            {item.quantity <= item.minThreshold && (
                              <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold uppercase">เหลือน้อย</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.location}</td>
                        <td className="px-6 py-4 text-sm font-semibold">{formatCurrency(item.price)}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setEditingItem(item);
                                setIsModalOpen(true);
                              }}
                              className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => deleteItem(item.id)}
                              className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-lg">ประวัติการทำรายการ</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {transactions.map((tx) => {
                    const item = items.find(i => i.id === tx.inkItemId);
                    return (
                      <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            tx.type === 'IN' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                          )}>
                            {tx.type === 'IN' ? <ArrowDownRight size={24} /> : <ArrowUpRight size={24} />}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {tx.type === 'IN' ? 'นำเข้าสต๊อก' : 'เบิกจ่ายสต๊อก'} - {item?.brand} {item?.model} ({item?.color})
                            </div>
                            <div className="text-sm text-slate-500 flex items-center gap-2">
                              <span>{new Date(tx.date).toLocaleString('th-TH')}</span>
                              <span>•</span>
                              <span>โดย {tx.user}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn(
                            "font-bold text-lg",
                            tx.type === 'IN' ? "text-emerald-600" : "text-rose-600"
                          )}>
                            {tx.type === 'IN' ? '+' : '-'}{tx.amount}
                          </div>
                          <div className="text-xs text-slate-400 font-medium">{tx.note}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* หน้าต่างป๊อปอัพ (Modal) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">{editingItem ? 'แก้ไขข้อมูลหมึก' : 'เพิ่มหมึกใหม่'}</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSaveItem} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">ยี่ห้อ</label>
                      <input 
                        name="brand" 
                        defaultValue={editingItem?.brand} 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="เช่น Epson"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">รุ่น</label>
                      <input 
                        name="model" 
                        defaultValue={editingItem?.model} 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="เช่น 003"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">สี</label>
                    <select 
                      name="color" 
                      defaultValue={editingItem?.color || 'Black'} 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      <option value="Black">Black (ดำ)</option>
                      <option value="Cyan">Cyan (ฟ้า)</option>
                      <option value="Magenta">Magenta (ชมพู)</option>
                      <option value="Yellow">Yellow (เหลือง)</option>
                      <option value="Light Cyan">Light Cyan (ฟ้าอ่อน)</option>
                      <option value="Light Magenta">Light Magenta (ชมพูอ่อน)</option>
                      <option value="Other">อื่นๆ</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">จำนวนเริ่มต้น</label>
                      <input 
                        name="quantity" 
                        type="number" 
                        defaultValue={editingItem?.quantity || 0} 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">เกณฑ์แจ้งเตือนขั้นต่ำ</label>
                      <input 
                        name="minThreshold" 
                        type="number" 
                        defaultValue={editingItem?.minThreshold || 5} 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">ราคา (บาท)</label>
                      <input 
                        name="price" 
                        type="number" 
                        defaultValue={editingItem?.price || 0} 
                        required 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">ตำแหน่งที่เก็บ</label>
                      <input 
                        name="location" 
                        defaultValue={editingItem?.location} 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="เช่น ชั้นวาง A1"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] mt-4"
                  >
                    {editingItem ? 'อัปเดตข้อมูล' : 'บันทึกรายการ'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-200 group text-left",
        active 
          ? "bg-indigo-50 text-indigo-700 shadow-sm" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <span className={cn(
        "transition-transform duration-200",
        active ? "scale-110" : "group-hover:scale-110"
      )}>
        {icon}
      </span>
      <span className="font-semibold">{label}</span>
      {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
    </button>
  );
}

function StatCard({ title, value, subValue, icon, color, alert }: { title: string, value: string | number, subValue: string, icon: React.ReactNode, color: string, alert?: boolean }) {
  return (
    <div className={cn(
      "bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md",
      alert && "border-amber-200 bg-amber-50/30"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          color === 'indigo' ? "bg-indigo-50" : color === 'amber' ? "bg-amber-50" : "bg-emerald-50"
        )}>
          {icon}
        </div>
        {alert && <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />}
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-slate-500">{title}</h4>
        <div className="text-3xl font-bold text-slate-900 tracking-tight">{value}</div>
        <p className="text-xs text-slate-400 font-medium">{subValue}</p>
      </div>
    </div>
  );
}
