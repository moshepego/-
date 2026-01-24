
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  Plus, Wallet, FileSpreadsheet, Brain, Loader2, Camera, Sparkles, X, 
  Settings, Pencil, Trash2, Percent, TrendingUp, TrendingDown,
  PlusCircle, MinusCircle, FileUp, Tag, BarChart3, Layers, Calendar, LogOut, 
  ShieldQuestion, AlertCircle, RefreshCcw, FileText, Sparkle, Trash, Download, Upload,
  Eye, EyeOff, Check
} from 'lucide-react';
import * as XLSX from 'xlsx';

import { Transaction, TabConfig, InterestType } from './types';
import { THEMES, DEFAULT_TABS, ICON_MAP } from './constants';
import { scanReceipt } from './services/gemini';

declare const window: any;

const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) { return null; }
};

const generateRandomId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

const getFamilyIdFromEmail = (email: string) => {
  return btoa(email.toLowerCase()).substring(0, 12).toUpperCase().replace(/[^A-Z0-9]/g, 'Z');
};

const App: React.FC = () => {
  // --- Identity ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('finance_is_logged_in') === 'true');
  const [user, setUser] = useState<{name: string, email: string, photo?: string, isGuest?: boolean} | null>(() => {
    const saved = localStorage.getItem('finance_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [familyId, setFamilyId] = useState(() => localStorage.getItem('finance_family_id') || '');
  const [googleSdkReady, setGoogleSdkReady] = useState(false);

  // --- Data ---
  const [items, setItems] = useState<Transaction[]>([]);
  const [familyName, setFamilyName] = useState('התקציב שלי');
  const [activeTab, setActiveTab] = useState<string>('apartment');
  const [tabs, setTabs] = useState<TabConfig[]>(() => {
    const saved = localStorage.getItem('finance_tabs');
    return saved ? JSON.parse(saved) : DEFAULT_TABS;
  });
  const [loading, setLoading] = useState(true);
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('finance_theme') || 'indigo');
  
  // --- UI States ---
  const [showModal, setShowModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showScanMenu, setShowScanMenu] = useState(false);
  const [isScanningReceipt, setIsScanningReceipt] = useState(false);
  const [simMonths, setSimMonths] = useState(60);
  const [simMonthlyContribution, setSimMonthlyContribution] = useState(0);
  const [showToast, setShowToast] = useState<string | null>(null);

  // --- Tab Management States ---
  const [newTabLabel, setNewTabLabel] = useState('');
  const [newTabIcon, setNewTabIcon] = useState('Tag');

  // --- Form Temp State ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isInstallments, setIsInstallments] = useState(false);
  const [isInterest, setIsInterest] = useState(false);
  const [newItem, setNewItem] = useState<Partial<Transaction>>({
    item: '', cost: 0, type: 'debt', category: 'monthly', date: new Date().toISOString().split('T')[0],
    totalInstallments: 1, interestRate: 0, interestType: 'simple'
  });

  const theme = THEMES[currentTheme] || THEMES.indigo;
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3000);
  };

  // --- Google Auth ---
  const handleGoogleResponse = useCallback((response: any) => {
    const userData = decodeJwt(response.credential);
    if (userData) {
      const email = userData.email;
      const id = getFamilyIdFromEmail(email);
      const authUser = { name: userData.name, email, photo: userData.picture, isGuest: false };
      setUser(authUser);
      setIsLoggedIn(true);
      setFamilyId(id);
      localStorage.setItem('finance_is_logged_in', 'true');
      localStorage.setItem('finance_user', JSON.stringify(authUser));
      localStorage.setItem('finance_family_id', id);
      triggerToast(`שלום, ${userData.name}`);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google && window.google.accounts) {
        setGoogleSdkReady(true);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (googleSdkReady && !isLoggedIn && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: "70377218671-55p7cujr7v7iubv15q679ccl9vj9lksf.apps.googleusercontent.com",
          callback: handleGoogleResponse,
          auto_select: true
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, { theme: "outline", size: "large", shape: "pill" });
      } catch (e) {
        console.error("Google Auth Init Error", e);
      }
    }
  }, [googleSdkReady, isLoggedIn, handleGoogleResponse]);

  // --- Persistence ---
  useEffect(() => {
    if (isLoggedIn && familyId) {
      setLoading(true);
      const saved = JSON.parse(localStorage.getItem(`items_${familyId}`) || '[]');
      const savedName = localStorage.getItem(`family_name_${familyId}`) || 'התקציב שלי';
      setItems(saved);
      setFamilyName(savedName);
      setLoading(false);
    } else if (isLoggedIn) {
      setLoading(false);
    }
  }, [familyId, isLoggedIn]);

  useEffect(() => {
    if (!loading && isLoggedIn && familyId) {
      localStorage.setItem(`items_${familyId}`, JSON.stringify(items));
      localStorage.setItem(`family_name_${familyId}`, familyName);
      localStorage.setItem('finance_theme', currentTheme);
      localStorage.setItem('finance_tabs', JSON.stringify(tabs));
    }
  }, [items, familyId, loading, currentTheme, familyName, isLoggedIn, tabs]);

  // --- Tab Actions ---
  const addTab = () => {
    if (!newTabLabel.trim()) return;
    const newTab: TabConfig = {
      id: `tab_${Date.now()}`,
      label: newTabLabel,
      iconKey: newTabIcon,
      includeInProjection: true
    };
    setTabs(prev => [...prev, newTab]);
    setNewTabLabel('');
    triggerToast(`הקטגוריה "${newTabLabel}" נוספה בהצלחה`);
  };

  const deleteTab = (id: string) => {
    if (tabs.length <= 1) {
      triggerToast('חייבת להישאר לפחות קטגוריה אחת');
      return;
    }
    setTabs(prev => prev.filter(t => t.id !== id));
    if (activeTab === id) setActiveTab(tabs.find(t => t.id !== id)?.id || '');
  };

  const toggleTabProjection = (id: string) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, includeInProjection: !t.includeInProjection } : t));
  };

  // --- Calculations ---
  const getMonthsBetween = (d1: Date, d2: Date) => {
    let months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    const dayDiff = (d2.getDate() - d1.getDate()) / 30;
    return Math.max(0, months + dayDiff);
  };

  const calculateFV = (p: number, r: number, type: InterestType, m: number) => {
    if (m <= 0 || !r) return p;
    const ry = r / 100;
    const y = m / 12;
    if (type === 'simple') return p * (1 + ry * y);
    if (type === 'compound_yearly') return p * Math.pow(1 + ry, y);
    if (type === 'compound_daily') {
      const days = m * 30.4375;
      return p * Math.pow(1 + ry / 365, days);
    }
    return p;
  };

  const getItemValue = useCallback((item: Transaction, targetMonths: number = 0) => {
    let base = item.cost;
    const actualBase = (item.totalInstallments && item.totalInstallments > 1) 
      ? item.cost / item.totalInstallments 
      : item.cost;
    
    if (!item.isInterest || !item.interestRate) return actualBase;
    const monthsElapsed = getMonthsBetween(new Date(item.date), new Date()) + targetMonths;
    return calculateFV(actualBase, item.interestRate, item.interestType || 'simple', monthsElapsed);
  }, []);

  const totals = useMemo(() => {
    const current = items.filter(i => i.familyId === familyId && i.category === activeTab);
    const assets = current.filter(i => i.cost > 0).reduce((acc, i) => acc + getItemValue(i), 0);
    const debts = current.filter(i => i.cost < 0).reduce((acc, i) => acc + Math.abs(getItemValue(i)), 0);
    return { assets, debts, total: assets - debts };
  }, [items, familyId, activeTab, getItemValue]);

  const simulationResult = useMemo(() => {
    const includedIds = tabs.filter(t => t.includeInProjection).map(t => t.id);
    const filtered = items.filter(i => i.familyId === familyId && includedIds.includes(i.category));
    let total = filtered.reduce((acc, i) => acc + getItemValue(i, simMonths), 0);
    if (simMonthlyContribution > 0) {
      const rm = (4 / 100) / 12;
      for(let i = 1; i <= simMonths; i++) total += simMonthlyContribution * Math.pow(1 + rm, simMonths - i);
    }
    return total;
  }, [items, familyId, tabs, simMonths, simMonthlyContribution, getItemValue]);

  const formatCurrency = (n: number) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(Math.abs(n));

  const saveTransaction = () => {
    if (!newItem.item || newItem.cost === undefined) return;
    const cost = newItem.type === 'debt' ? -Math.abs(newItem.cost) : Math.abs(newItem.cost);
    const data: Transaction = {
      ...newItem as Transaction,
      id: editingId || `item_${Date.now()}`,
      cost, familyId, createdAt: Date.now(), updatedAt: Date.now(),
      isInterest, totalInstallments: isInstallments ? newItem.totalInstallments : 1
    };
    setItems(prev => editingId ? prev.map(i => i.id === editingId ? data : i) : [...prev, data]);
    setShowModal(false);
  };

  const exportToExcel = () => {
    try {
      const exportData = items.map(i => ({
        'תיאור': i.item,
        'סכום': i.cost,
        'סוג': i.type === 'asset' ? 'הכנסה' : 'הוצאה',
        'קטגוריה': tabs.find(t => t.id === i.category)?.label || i.category,
        'תאריך': i.date,
        'בנק': i.bank || '',
        'תשלומים': i.totalInstallments || 1,
        'ריבית (%)': i.interestRate || 0,
        'סוג ריבית': i.interestType || 'simple'
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, `${familyName}_SmartFinance.xlsx`);
      triggerToast('הנתונים יוצאו בהצלחה!');
    } catch (e) { triggerToast('שגיאה ביצוא הנתונים'); }
  };

  const importFromExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(firstSheet);
        const importedItems: Transaction[] = jsonData.map((row: any) => ({
          id: `item_${Date.now()}_${Math.random()}`,
          item: row['תיאור'] || 'פריט מיובא',
          cost: parseFloat(row['סכום']) || 0,
          type: row['סוג'] === 'הכנסה' ? 'asset' : 'debt',
          category: tabs.find(t => t.label === row['קטגוריה'])?.id || 'monthly',
          date: row['תאריך'] || new Date().toISOString().split('T')[0],
          bank: row['בנק'] || '',
          totalInstallments: parseInt(row['תשלומים']) || 1,
          interestRate: parseFloat(row['ריבית (%)']) || 0,
          interestType: (row['סוג ריבית'] as InterestType) || 'simple',
          isInterest: (parseFloat(row['ריבית (%)']) || 0) > 0,
          familyId, createdAt: Date.now(), updatedAt: Date.now()
        }));
        setItems(prev => [...prev, ...importedItems]);
        triggerToast(`יובאו ${importedItems.length} עסקאות בהצלחה`);
      } catch (err) { triggerToast('שגיאה ביבוא הקובץ. וודא שהפורמט תקין.'); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanningReceipt(true);
    setShowScanMenu(false);
    triggerToast('סורק מסמך באמצעות בינה מלאכותית...');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const categories = tabs.map(t => t.label);
        const result = await scanReceipt(base64Data, categories, file.type);
        if (result) {
          setNewItem(prev => ({
            ...prev,
            item: result.item || prev.item,
            cost: result.cost || prev.cost,
            date: result.date || prev.date,
            category: tabs.find(t => t.label === result.category)?.id || prev.category,
            bank: result.bank || prev.bank
          }));
          triggerToast('הנתונים חולצו בהצלחה');
        } else { triggerToast('לא הצלחנו לזהות נתונים מהמסמך'); }
        setIsScanningReceipt(false);
      };
      reader.readAsDataURL(file);
    } catch (error) { setIsScanningReceipt(false); triggerToast('שגיאה בתהליך הסריקה'); }
  };

  const handleLogout = () => { localStorage.clear(); window.location.reload(); };

  if (loading && isLoggedIn) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600" /></div>;

  if (!isLoggedIn) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col items-center justify-center p-8 space-y-10">
        <div className="text-center space-y-4">
           <div className="bg-indigo-600 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl">
              <Wallet className="text-white w-10 h-10" />
           </div>
           <h1 className="text-3xl font-black text-slate-900">SmartFinance Pro</h1>
           <p className="text-slate-400 font-bold">ניהול פיננסי מקצועי ומדויק</p>
        </div>
        <div className="w-full max-w-sm flex flex-col items-center gap-4">
          <div ref={googleBtnRef} className="w-full flex justify-center"></div>
          <button onClick={() => {
            const id = generateRandomId();
            setUser({ name: 'אורח', email: 'guest@sf.io', isGuest: true });
            setIsLoggedIn(true);
            setFamilyId(id);
            localStorage.setItem('finance_is_logged_in', 'true');
            localStorage.setItem('finance_family_id', id);
          }} className="w-full py-4 bg-white border border-slate-200 rounded-full font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
            כניסה כאורח <ShieldQuestion size={18}/>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 bg-slate-50" dir="rtl">
      {showToast && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl">{showToast}</div>}

      <header className={`${theme.bgHeader} text-white pt-10 pb-16 px-6 rounded-b-[3rem] shadow-xl transition-colors duration-500`}>
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30 overflow-hidden">
              {user?.photo ? <img src={user.photo} className="w-full h-full object-cover" /> : <Wallet size={20} />}
            </div>
            <div>
              <h1 className="font-black text-lg leading-tight">{familyName}</h1>
              <p className="text-[10px] opacity-70 font-bold">{user?.name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={exportToExcel} className="p-2.5 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-all" title="יצוא לאקסל"><Download size={20}/></button>
            <button onClick={() => importFileRef.current?.click()} className="p-2.5 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-all" title="יבוא מאקסל"><Upload size={20}/></button>
            <button onClick={() => setShowSettingsModal(true)} className="p-2.5 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-all"><Settings size={20}/></button>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto no-scrollbar mb-8">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-slate-900 scale-105 shadow-md' : 'bg-white/10 text-white/70'}`}>
              {ICON_MAP[tab.iconKey] || <Tag size={14}/>} {tab.label}
            </button>
          ))}
          <button onClick={() => setActiveTab('projections')} className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all whitespace-nowrap ${activeTab === 'projections' ? 'bg-amber-400 text-slate-900 scale-105 shadow-md' : 'bg-white/10 text-white/70'}`}>
            <BarChart3 size={14}/> תחזית הון
          </button>
        </nav>

        <div className="text-center">
          <p className="text-[10px] font-black opacity-60 mb-1 uppercase tracking-widest">יתרה בקטגוריה</p>
          <p className={`text-6xl font-black tracking-tighter ${totals.total >= 0 ? 'text-white' : 'text-red-200'}`}>{formatCurrency(totals.total)}</p>
        </div>
      </header>

      <main className="px-6 -mt-8 relative z-10 space-y-6">
        {activeTab === 'projections' ? (
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8 animate-in slide-in-from-bottom-4">
             <h3 className="text-2xl font-black flex items-center gap-3"><Sparkles className="text-amber-500" /> תחזית הון חכמה</h3>
             <div className="text-center py-8 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">יתרה משוערת בעוד {simMonths} חודשים</p>
                <p className="text-5xl font-black text-slate-800 tracking-tighter">{formatCurrency(simulationResult)}</p>
             </div>
             <div className="space-y-6 px-2">
                <div className="space-y-3">
                   <div className="flex justify-between text-xs font-black text-slate-500"><span>טווח זמן (חודשים)</span> <span>{simMonths}</span></div>
                   <input type="range" min="1" max="120" value={simMonths} onChange={e => setSimMonths(parseInt(e.target.value))} className="w-full accent-amber-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between text-xs font-black text-slate-500"><span>הפקדה חודשית נוספת</span> <span>{formatCurrency(simMonthlyContribution)}</span></div>
                   <input type="range" min="0" max="10000" step="100" value={simMonthlyContribution} onChange={e => setSimMonthlyContribution(parseInt(e.target.value))} className="w-full accent-amber-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer" />
                </div>
             </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-50 flex flex-col items-center">
                <TrendingUp size={20} className="text-green-500 mb-1" />
                <p className="text-xl font-black text-green-600">{formatCurrency(totals.assets)}</p>
                <span className="text-[9px] font-black text-slate-300 uppercase">נכסים</span>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-50 flex flex-col items-center">
                <TrendingDown size={20} className="text-red-400 mb-1" />
                <p className="text-xl font-black text-red-600">{formatCurrency(totals.debts)}</p>
                <span className="text-[9px] font-black text-slate-300 uppercase">חובות</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {items.filter(i => i.familyId === familyId && i.category === activeTab).length === 0 ? (
                <div className="py-24 text-center text-slate-300 font-black flex flex-col items-center gap-4 opacity-40">
                   <Layers size={48} /> הקטגוריה ריקה
                </div>
              ) : (
                items.filter(i => i.familyId === familyId && i.category === activeTab).map(item => (
                  <div key={item.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-50 flex items-center justify-between group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-3.5 rounded-2xl ${item.cost >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {item.isInterest ? <Percent size={18}/> : (item.cost >= 0 ? <PlusCircle size={18}/> : <MinusCircle size={18}/>)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800">{item.item}</h4>
                        <div className="flex gap-2 text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                           <span>{item.date}</span>
                           {item.totalInstallments && item.totalInstallments > 1 && <span>• {item.totalInstallments} תשלומים</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className={`text-lg font-black ${item.cost >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(getItemValue(item))}</p>
                      <div className="flex gap-3 justify-end mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingId(item.id); setNewItem(item); setIsInstallments((item.totalInstallments||1)>1); setIsInterest(!!item.isInterest); setShowModal(true); }} className="text-slate-300 hover:text-indigo-600"><Pencil size={14}/></button>
                        <button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>

      {/* FAB */}
      <div className="fixed bottom-8 left-8 z-50">
        <button onClick={() => { 
          setNewItem({ item: '', cost: 0, type: 'debt', category: activeTab, date: new Date().toISOString().split('T')[0], totalInstallments: 1, interestRate: 0, interestType: 'simple' }); 
          setEditingId(null); setIsInterest(false); setIsInstallments(false); setShowModal(true); 
        }} className={`${theme.bgGradient} text-white w-16 h-16 rounded-[2rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all ring-4 ring-white`}>
          <Plus size={32} />
        </button>
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
          <div className="bg-white p-8 rounded-[3rem] w-full max-w-lg shadow-2xl space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black">{editingId ? 'עריכת עסקה' : 'עסקה חדשה'}</h3>
                <button onClick={() => setShowScanMenu(!showScanMenu)} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] hover:bg-indigo-100">
                   <Sparkle size={14}/> {isScanningReceipt ? 'מנתח...' : 'סריקת AI'}
                </button>
             </div>

             {showScanMenu && (
               <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl shadow-sm text-indigo-600 font-bold text-xs"><Camera size={20}/>מצלמה</button>
                  <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl shadow-sm text-blue-600 font-bold text-xs"><FileText size={20}/>קובץ</button>
               </div>
             )}

             <div className="space-y-4">
                <input type="text" value={newItem.item} onChange={e => setNewItem({...newItem, item: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-indigo-100 transition-all" placeholder="תיאור העסקה" />
                <div className="relative">
                   <input type="number" value={newItem.cost || ''} onChange={e => setNewItem({...newItem, cost: parseFloat(e.target.value)})} className="w-full p-5 bg-slate-50 rounded-3xl font-black text-4xl text-center outline-none border-2 border-transparent focus:border-indigo-100" placeholder="0" />
                   <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300">₪</span>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => setNewItem({...newItem, type: 'debt'})} className={`flex-1 py-4 rounded-2xl font-black transition-all ${newItem.type === 'debt' ? 'bg-red-500 text-white shadow-lg shadow-red-100' : 'bg-slate-50 text-slate-400'}`}>הוצאה</button>
                   <button onClick={() => setNewItem({...newItem, type: 'asset'})} className={`flex-1 py-4 rounded-2xl font-black transition-all ${newItem.type === 'asset' ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-slate-50 text-slate-400'}`}>הכנסה</button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 mr-2">תאריך</label>
                      <input type="date" value={newItem.date} onChange={e => setNewItem({...newItem, date: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-xs" />
                   </div>
                   <div className="flex gap-2 items-end">
                      <button onClick={() => setIsInstallments(!isInstallments)} className={`flex-1 p-3 rounded-xl border-2 font-black text-[10px] transition-all ${isInstallments ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-300'}`}>תשלומים</button>
                      <button onClick={() => setIsInterest(!isInterest)} className={`flex-1 p-3 rounded-xl border-2 font-black text-[10px] transition-all ${isInterest ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-100 text-slate-300'}`}>ריבית</button>
                   </div>
                </div>

                {isInstallments && (
                   <div className="p-4 bg-indigo-50 rounded-2xl animate-in zoom-in-95">
                      <label className="text-[10px] font-black text-indigo-500 block mb-1">מספר תשלומים כולל</label>
                      <input type="number" value={newItem.totalInstallments} onChange={e => setNewItem({...newItem, totalInstallments: parseInt(e.target.value)})} className="w-full p-2 rounded-lg font-black text-center" />
                   </div>
                )}

                {isInterest && (
                   <div className="p-4 bg-amber-50 rounded-2xl animate-in zoom-in-95 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex-1">
                           <label className="text-[10px] font-black text-amber-600 block mb-1">ריבית שנתית (%)</label>
                           <input type="number" value={newItem.interestRate} onChange={e => setNewItem({...newItem, interestRate: parseFloat(e.target.value)})} className="w-full p-2 rounded-lg font-black text-center" />
                        </div>
                        <div className="flex-1">
                           <label className="text-[10px] font-black text-amber-600 block mb-1">סוג חישוב</label>
                           <select value={newItem.interestType} onChange={e => setNewItem({...newItem, interestType: e.target.value as InterestType})} className="w-full p-2 rounded-lg font-black text-[10px] text-center outline-none bg-white">
                              <option value="simple">ריבית פשוטה</option>
                              <option value="compound_yearly">דריבית שנתי</option>
                              <option value="compound_daily">דריבית יומי</option>
                           </select>
                        </div>
                      </div>
                   </div>
                )}
             </div>

             <div className="flex gap-3 pt-4 border-t border-slate-50">
                <button onClick={() => setShowModal(false)} className="flex-1 py-4 font-black text-slate-300 hover:text-slate-500">ביטול</button>
                <button onClick={saveTransaction} className={`${theme.bgGradient} flex-[2] py-4 text-white rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all`}>שמור שינויים</button>
             </div>
          </div>
          <input type="file" ref={cameraInputRef} onChange={handleFileScan} accept="image/*" capture="environment" className="hidden" />
          <input type="file" ref={fileInputRef} onChange={handleFileScan} accept="image/*, application/pdf" className="hidden" />
          <input type="file" ref={importFileRef} onChange={importFromExcel} accept=".xlsx, .xls" className="hidden" />
        </div>
      )}

      {/* Settings Modal (ניהול קטגוריות ותחזית הון) */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex items-center justify-center p-6 backdrop-blur-md overflow-y-auto">
           <div className="bg-white p-8 rounded-[3rem] w-full max-w-lg shadow-2xl space-y-8 animate-in zoom-in my-8">
              <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                 <h3 className="text-2xl font-black">הגדרות חשבון</h3>
                 <button onClick={() => setShowSettingsModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-800"><X size={18}/></button>
              </div>
              
              <div className="space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar px-1">
                 {/* User Info */}
                 <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                      {user?.photo ? <img src={user.photo} className="w-full h-full object-cover" /> : <Wallet size={24}/>}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="font-black text-sm truncate">{user?.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold truncate">{user?.email}</p>
                    </div>
                    <button onClick={handleLogout} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"><LogOut size={18}/></button>
                 </div>

                 {/* Budget Name */}
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase mr-2 tracking-widest">שם התקציב המשפחתי</label>
                    <input type="text" value={familyName} onChange={e => setFamilyName(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-indigo-100" />
                 </div>

                 {/* Tab Management */}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase mr-2 tracking-widest">ניהול קטגוריות ותחזית הון</label>
                    <div className="space-y-2">
                       {tabs.map(tab => (
                         <div key={tab.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                            <div className="p-2 bg-white rounded-lg text-slate-400 group-hover:text-indigo-500 transition-colors">
                               {ICON_MAP[tab.iconKey] || <Tag size={14}/>}
                            </div>
                            <span className="flex-1 font-bold text-sm text-slate-700">{tab.label}</span>
                            <button 
                               onClick={() => toggleTabProjection(tab.id)} 
                               className={`p-2 rounded-xl transition-all ${tab.includeInProjection ? 'bg-amber-100 text-amber-600 shadow-sm' : 'bg-slate-200 text-slate-400'}`}
                               title={tab.includeInProjection ? "כלול בתחזית" : "לא כלול בתחזית"}
                            >
                               {tab.includeInProjection ? <Eye size={16}/> : <EyeOff size={16}/>}
                            </button>
                            <button 
                               onClick={() => deleteTab(tab.id)} 
                               className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                               title="מחק קטגוריה"
                            >
                               <Trash2 size={16}/>
                            </button>
                         </div>
                       ))}
                    </div>
                    
                    {/* Add New Tab Form */}
                    <div className="p-5 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 space-y-4">
                       <p className="text-[10px] font-black text-slate-400 uppercase text-center">הוספת קטגוריה חדשה</p>
                       <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={newTabLabel} 
                            onChange={e => setNewTabLabel(e.target.value)} 
                            className="flex-1 p-3 rounded-xl font-bold text-xs bg-white outline-none border-2 border-transparent focus:border-indigo-100" 
                            placeholder="שם הקטגוריה..." 
                          />
                          <button onClick={addTab} className={`${theme.bgGradient} text-white px-5 py-3 rounded-xl font-black shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-all`}>
                             <Plus size={20}/>
                          </button>
                       </div>
                       <div className="flex flex-wrap gap-2 justify-center">
                          {Object.keys(ICON_MAP).slice(0, 12).map(ik => (
                            <button 
                               key={ik} 
                               onClick={() => setNewTabIcon(ik)} 
                               className={`p-2.5 rounded-xl transition-all ${newTabIcon === ik ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
                            >
                               {ICON_MAP[ik]}
                            </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* Theme Selector */}
                 <div className="space-y-3 pb-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase mr-2 tracking-widest">ערכת נושא</label>
                    <div className="flex flex-wrap gap-3 justify-center">
                       {Object.keys(THEMES).map(k => (
                         <button 
                           key={k} 
                           onClick={() => setCurrentTheme(k)} 
                           className={`w-11 h-11 rounded-full border-4 transition-all shadow-sm ${currentTheme === k ? 'ring-2 ring-offset-2 ring-indigo-400 border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'} ${THEMES[k].bgHeader}`} 
                         />
                       ))}
                    </div>
                 </div>
              </div>

              <button onClick={() => setShowSettingsModal(false)} className={`${theme.bgGradient} w-full py-5 rounded-3xl text-white font-black shadow-2xl hover:scale-105 active:scale-95 transition-all`}>
                 סגור ושמור שינויים
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
