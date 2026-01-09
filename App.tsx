
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DictionaryEntry } from './types';
import { INITIAL_DATA, ADMIN_PASSWORD } from './constants';
import { getSuggestedTranslations } from './services/geminiService';

const UkiranJawa = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 200 100" className={className}>
    <path 
      d="M100 80 Q 100 40 140 40 Q 160 40 160 60 Q 160 70 150 70 Q 140 70 140 60 Q 140 50 150 50 M100 80 Q 100 40 60 40 Q 40 40 40 60 Q 40 70 50 70 Q 60 70 60 60 Q 60 50 50 50" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round"
      className="text-[#d97706]"
    />
    <path 
      d="M100 80 V 20 M100 30 Q 120 30 130 10 M100 30 Q 80 30 70 10" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
      className="text-[#d97706]"
    />
    <circle cx="100" cy="80" r="4" fill="currentColor" className="text-[#d97706]" />
  </svg>
);

const App: React.FC = () => {
  const [showCover, setShowCover] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [entries, setEntries] = useState<DictionaryEntry[]>(() => {
    const saved = localStorage.getItem('kamus_jawa_entries');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newEntry, setNewEntry] = useState<Omit<DictionaryEntry, 'id'>>({
    indonesia: '',
    ngokoLugu: '',
    ngokoAlus: '',
    kramaLugu: '',
    kramaAlus: ''
  });
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    localStorage.setItem('kamus_jawa_entries', JSON.stringify(entries));
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return entries.filter(e => 
      e.indonesia.toLowerCase().includes(lowerQuery) ||
      e.ngokoLugu.toLowerCase().includes(lowerQuery) ||
      e.ngokoAlus.toLowerCase().includes(lowerQuery) ||
      e.kramaLugu.toLowerCase().includes(lowerQuery) ||
      e.kramaAlus.toLowerCase().includes(lowerQuery)
    );
  }, [entries, searchQuery]);

  const handleBack = () => {
    if (searchQuery) setSearchQuery('');
    else setShowCover(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setShowAddModal(true);
      setPasswordInput('');
      setLoginError('');
    } else {
      setLoginError('Password salah!');
    }
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.indonesia || !newEntry.ngokoLugu) return;
    const entry: DictionaryEntry = { ...newEntry, id: Date.now().toString() };
    setEntries([entry, ...entries]);
    setNewEntry({ indonesia: '', ngokoLugu: '', ngokoAlus: '', kramaLugu: '', kramaAlus: '' });
    setShowAddModal(false);
  };

  const handleSuggest = async () => {
    if (!newEntry.indonesia) return;
    setIsSuggesting(true);
    const suggestion = await getSuggestedTranslations(newEntry.indonesia);
    if (suggestion) {
      setNewEntry(prev => ({ ...prev, ...suggestion }));
    }
    setIsSuggesting(false);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "kamus_jawa_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          setEntries(json);
          alert('Data berhasil diimpor!');
        }
      } catch (err) {
        alert('File tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  if (showCover) {
    return (
      <div className="fixed inset-0 bg-[#3d231a] flex flex-col items-center justify-between py-20 px-6 text-white text-center">
        <div className="flex-1 flex flex-col items-center justify-center space-y-10">
          <UkiranJawa className="w-48 md:w-64 h-auto drop-shadow-lg" />
          <div className="space-y-4">
            <h1 className="text-7xl md:text-9xl font-serif font-bold tracking-tight">Kamus</h1>
            <h2 className="text-4xl md:text-5xl font-serif font-light opacity-80">Bahasa Jawa</h2>
          </div>
          <button onClick={() => setShowCover(false)} className="px-12 py-3 rounded-full border border-white/20 hover:border-white/60 transition-all uppercase text-xs font-bold tracking-widest active:scale-95">
            Mulai Belajar
          </button>
        </div>
        <p className="text-white/30 text-[10px] tracking-[0.5em] uppercase">by:nyk22</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfaf2]">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-amber-900/10 shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4">
          <button onClick={handleBack} className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition-colors">
            <i className={`fas ${searchQuery ? 'fa-times' : 'fa-arrow-left'}`}></i>
          </button>
          <div className="flex items-center gap-3">
             <i className="fas fa-scroll text-amber-800 text-xl"></i>
             <h2 className="text-xl font-bold text-slate-900 font-jawa">Kamus Bahasa Jawa</h2>
          </div>
          <div className="relative flex-1 max-w-lg">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all shadow-inner"
              placeholder="Cari kata Indonesia atau Jawa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => isAdmin ? setShowAddModal(true) : setShowLoginModal(true)} className="bg-amber-800 hover:bg-amber-900 text-white px-6 py-2.5 rounded-2xl font-medium shadow-md transition-all active:scale-95">
              {isAdmin ? 'Tambah Kata' : 'Login Admin'}
            </button>
            {isAdmin && (
              <button onClick={handleExportData} className="w-10 h-10 rounded-full border border-amber-200 flex items-center justify-center text-amber-800 hover:bg-amber-50 transition-colors">
                <i className="fas fa-download"></i>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-amber-900/5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-amber-50/50">
                <tr>
                  {['Indonesia', 'Ngoko Lugu', 'Ngoko Alus', 'Krama Lugu', 'Krama Alus'].map(h => (
                    <th key={h} className="px-6 py-5 font-bold text-amber-900 uppercase text-[11px] tracking-widest border-b border-amber-100">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {filteredEntries.length > 0 ? filteredEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-amber-50/30 transition-colors group">
                    <td className="px-6 py-5 font-bold text-slate-900">{entry.indonesia}</td>
                    <td className="px-6 py-5 text-slate-600">{entry.ngokoLugu}</td>
                    <td className="px-6 py-5 text-slate-500 italic font-jawa">{entry.ngokoAlus || '-'}</td>
                    <td className="px-6 py-5 text-slate-600">{entry.kramaLugu}</td>
                    <td className="px-6 py-5 text-amber-900 font-bold bg-amber-50/10">{entry.kramaAlus}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <i className="fas fa-feather-pointed text-4xl mb-4"></i>
                        <p className="font-jawa text-lg">Mboten wonten data...</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-[#fdfcf0] rounded-3xl p-8 w-full max-w-sm border border-amber-900/20 shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-amber-900 font-jawa">Akses Admin</h3>
              <button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password" 
                required 
                autoFocus
                className="w-full px-5 py-3 rounded-2xl border-2 border-amber-100 text-center focus:border-amber-500 outline-none transition-all" 
                placeholder="Password" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)} 
              />
              {loginError && <p className="text-red-600 text-xs text-center font-medium">{loginError}</p>}
              <button type="submit" className="w-full bg-amber-900 text-white py-3.5 rounded-2xl font-bold shadow-lg active:scale-95 transition-all">Masuk</button>
              <button type="button" onClick={() => setShowLoginModal(false)} className="w-full text-slate-400 text-xs uppercase tracking-widest font-bold">Batal</button>
            </form>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-[#fdfcf0] rounded-[2.5rem] p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-amber-900/20 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <h3 className="text-2xl font-bold text-amber-950 font-jawa">Nambah Tembung</h3>
                <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-bold text-amber-800 border-2 border-amber-100 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors uppercase tracking-wider">IMPOR JSON</button>
                <input type="file" className="hidden" ref={fileInputRef} onChange={handleImportData} />
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><i className="fas fa-times text-xl"></i></button>
            </div>
            <form onSubmit={handleAddWord} className="space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm">
                <label className="block text-[10px] font-bold text-amber-900 uppercase tracking-widest mb-2">Bahasa Indonesia</label>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Contoh: Makan" 
                    required 
                    className="flex-1 px-5 py-3 rounded-2xl border-2 border-slate-50 focus:border-amber-500 outline-none transition-all" 
                    value={newEntry.indonesia} 
                    onChange={(e) => setNewEntry({...newEntry, indonesia: e.target.value})} 
                  />
                  <button 
                    type="button" 
                    onClick={handleSuggest} 
                    disabled={isSuggesting || !newEntry.indonesia} 
                    className="bg-amber-100 hover:bg-amber-200 disabled:opacity-50 px-6 rounded-2xl font-bold text-amber-900 text-xs transition-all active:scale-95 flex items-center gap-2"
                  >
                    {isSuggesting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
                    <span>{isSuggesting ? 'Loading...' : 'AI'}</span>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Ngoko Lugu</label>
                  <input type="text" placeholder="Mangan" required className="w-full px-5 py-3 rounded-2xl border-2 border-slate-50 focus:border-amber-500 outline-none transition-all" value={newEntry.ngokoLugu} onChange={(e) => setNewEntry({...newEntry, ngokoLugu: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Ngoko Alus</label>
                  <input type="text" placeholder="Dahar (Opsional)" className="w-full px-5 py-3 rounded-2xl border-2 border-slate-50 focus:border-amber-500 outline-none transition-all" value={newEntry.ngokoAlus} onChange={(e) => setNewEntry({...newEntry, ngokoAlus: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Krama Lugu</label>
                  <input type="text" placeholder="Nedha" className="w-full px-5 py-3 rounded-2xl border-2 border-slate-50 focus:border-amber-500 outline-none transition-all" value={newEntry.kramaLugu} onChange={(e) => setNewEntry({...newEntry, kramaLugu: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-amber-700 uppercase tracking-widest px-2">Krama Alus</label>
                  <input type="text" placeholder="Dahar" className="w-full px-5 py-3 rounded-2xl border-2 border-amber-100 font-bold text-amber-900 focus:border-amber-500 outline-none transition-all" value={newEntry.kramaAlus} onChange={(e) => setNewEntry({...newEntry, kramaAlus: e.target.value})} />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 border-2 border-slate-100 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition-all uppercase text-xs tracking-widest">Batal</button>
                <button type="submit" className="flex-1 bg-amber-800 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-amber-900 active:scale-95 transition-all uppercase text-xs tracking-widest">Simpan Kata</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-amber-950 text-amber-200/40 py-12 text-center text-[10px]">
        <p className="font-jawa text-sm text-amber-200/60 mb-2">Mugi migunani dhumateng sesami</p>
        <p className="uppercase tracking-[0.4em] font-bold">nyk22 Digital Studio</p>
      </footer>
    </div>
  );
};

export default App;
