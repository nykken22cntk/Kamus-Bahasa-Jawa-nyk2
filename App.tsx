
import React, { useState, useEffect, useMemo } from 'react';
import { DictionaryEntry } from './types';
import { INITIAL_DATA, ADMIN_PASSWORD } from './constants';
import { getSuggestedTranslations } from './services/geminiService';

// Elegant Javanese floral carving ornament (Ukiran Jawa Motif)
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
    <path 
      d="M100 50 Q 115 50 120 40 M100 50 Q 85 50 80 40" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      className="text-[#d97706] opacity-60"
    />
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

  // Form State
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
    if (searchQuery) {
      setSearchQuery('');
    } else {
      setShowCover(true);
    }
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
    
    const entry: DictionaryEntry = {
      ...newEntry,
      id: Date.now().toString()
    };
    
    setEntries([entry, ...entries]);
    setNewEntry({
      indonesia: '',
      ngokoLugu: '',
      ngokoAlus: '',
      kramaLugu: '',
      kramaAlus: ''
    });
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

  if (showCover) {
    return (
      <div className="fixed inset-0 bg-[#3d231a] flex flex-col items-center justify-between py-20 px-6 text-white text-center animate-in fade-in duration-700">
        <div className="flex-1 flex flex-col items-center justify-center space-y-10">
          {/* Ukiran Jawa Accent */}
          <UkiranJawa className="w-48 md:w-64 h-auto drop-shadow-lg" />
          
          {/* Tulisan Putih */}
          <div className="space-y-4">
            <h1 className="text-7xl md:text-9xl font-serif font-bold tracking-tight leading-none">
              Kamus
            </h1>
            <h2 className="text-4xl md:text-5xl font-serif font-light tracking-wide opacity-80">
              Bahasa Jawa
            </h2>
          </div>

          {/* Elegant Divider */}
          <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

          {/* Tombol Mulai */}
          <button 
            onClick={() => setShowCover(false)}
            className="group relative px-12 py-3 overflow-hidden rounded-full border border-white/20 transition-all hover:border-white/60 active:scale-95"
          >
            <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10 text-xs font-bold tracking-[0.3em] uppercase">
              Mulai Belajar
            </span>
          </button>
        </div>

        {/* Footer by:nyk22 */}
        <div className="mt-auto">
          <p className="text-white/30 text-[10px] font-sans tracking-[0.5em] uppercase">
            by:nyk22
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfaf2]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-amber-900/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Tombol Kembali Pintar */}
              <button 
                onClick={handleBack}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-50 text-amber-900 hover:bg-amber-100 transition-all active:scale-90 border border-amber-200 shadow-sm"
                title={searchQuery ? "Hapus Pencarian" : "Kembali ke Cover"}
              >
                <i className={`fas ${searchQuery ? 'fa-times' : 'fa-arrow-left'} text-sm`}></i>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg border border-amber-200">
                  <i className="fas fa-scroll text-amber-800 text-lg"></i>
                </div>
                <h2 className="text-xl font-bold text-slate-900 font-jawa">
                  Kamus Bahasa Jawa
                </h2>
              </div>
            </div>
            
            <div className="relative flex-1 max-w-lg">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <i className="fas fa-search text-xs"></i>
              </span>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-2xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-all shadow-inner"
                placeholder="Cari kata Indonesia atau Jawa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              onClick={() => isAdmin ? setShowAddModal(true) : setShowLoginModal(true)}
              className="bg-amber-800 hover:bg-amber-900 text-amber-50 px-5 py-2.5 rounded-2xl font-medium flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 border border-amber-950"
            >
              <i className="fas fa-plus text-xs"></i>
              <span>Tambah Kata</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-amber-900/5 border border-amber-900/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-amber-50/50 border-b border-amber-100">
                  <th className="px-6 py-5 font-bold text-amber-900 uppercase tracking-wider text-[11px]">Indonesia</th>
                  <th className="px-6 py-5 font-bold text-amber-900 uppercase tracking-wider text-[11px]">Ngoko Lugu</th>
                  <th className="px-6 py-5 font-bold text-amber-900 uppercase tracking-wider text-[11px]">Ngoko Alus</th>
                  <th className="px-6 py-5 font-bold text-amber-900 uppercase tracking-wider text-[11px]">Krama Lugu</th>
                  <th className="px-6 py-5 font-bold text-amber-900 uppercase tracking-wider text-[11px]">Krama Alus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {filteredEntries.length > 0 ? (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-amber-50/70 transition-colors group">
                      <td className="px-6 py-5 font-semibold text-slate-900 border-r border-amber-50/50">{entry.indonesia}</td>
                      <td className="px-6 py-5 text-slate-600">{entry.ngokoLugu}</td>
                      <td className="px-6 py-5 text-slate-500 italic font-jawa">{entry.ngokoAlus || '-'}</td>
                      <td className="px-6 py-5 text-slate-600">{entry.kramaLugu}</td>
                      <td className="px-6 py-5 text-amber-900 font-bold bg-amber-50/10">{entry.kramaAlus}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                      <div className="flex flex-col items-center">
                        <i className="fas fa-feather-pointed text-4xl mb-4 text-amber-200"></i>
                        <p className="font-jawa text-lg text-slate-600">Mboten wonten data...</p>
                        <p className="text-xs uppercase tracking-widest mt-1 opacity-60">Kata tidak ditemukan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-[#fdfcf0] rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-300 border border-amber-900/20">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-amber-900 font-jawa text-center w-full">Akses Admin</h3>
                  <div className="w-12 h-0.5 bg-amber-800 mt-2 mx-auto"></div>
                </div>
                <button onClick={() => setShowLoginModal(false)} className="text-slate-400 hover:text-amber-800 transition-colors">
                  <i className="fas fa-times text-lg"></i>
                </button>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-amber-800 uppercase tracking-widest mb-2 text-center">Sandi Rahasia</label>
                  <input
                    type="password"
                    required
                    autoFocus
                    className="w-full px-5 py-3 rounded-2xl border-2 border-amber-100 focus:ring-0 focus:border-amber-600 outline-none transition-all bg-white text-center"
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setLoginError('');
                    }}
                  />
                  {loginError && <p className="text-red-600 text-[11px] mt-2 text-center flex items-center justify-center gap-1"><i className="fas fa-exclamation-circle"></i> {loginError}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-amber-900 text-amber-50 py-3.5 rounded-2xl font-bold hover:bg-amber-950 transition-all shadow-lg shadow-amber-900/20"
                >
                  Buka Kunci
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-[#fdfcf0] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh] border border-amber-900/20">
            <div className="p-8 border-b border-amber-100 flex justify-between items-center bg-amber-50/30">
              <div>
                <h3 className="text-2xl font-bold text-amber-950 font-jawa">Nambah Tembung</h3>
                <p className="text-[10px] text-amber-800/60 font-bold uppercase tracking-widest">Tambah Kata Baru</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="bg-white p-2.5 rounded-xl text-slate-400 hover:text-amber-900 shadow-sm border border-slate-100 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              <form onSubmit={handleAddWord} className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm">
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-widest mb-3">Bahasa Indonesia</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      required
                      className="flex-1 px-5 py-3 rounded-2xl border-2 border-amber-50 focus:border-amber-500 outline-none transition-all bg-amber-50/20"
                      placeholder="Contoh: Pergi"
                      value={newEntry.indonesia}
                      onChange={(e) => setNewEntry({...newEntry, indonesia: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={handleSuggest}
                      disabled={!newEntry.indonesia || isSuggesting}
                      className="bg-amber-100 hover:bg-amber-200 disabled:opacity-50 text-amber-900 px-6 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border border-amber-200"
                    >
                      {isSuggesting ? <i className="fas fa-spinner animate-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
                      Saran AI
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Ngoko Lugu</label>
                      <input
                        type="text"
                        required
                        className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-amber-400 outline-none transition-all"
                        value={newEntry.ngokoLugu}
                        onChange={(e) => setNewEntry({...newEntry, ngokoLugu: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Ngoko Alus</label>
                      <input
                        type="text"
                        className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-amber-400 outline-none transition-all italic font-jawa"
                        value={newEntry.ngokoAlus}
                        onChange={(e) => setNewEntry({...newEntry, ngokoAlus: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Krama Lugu</label>
                      <input
                        type="text"
                        className="w-full px-5 py-3 rounded-2xl border border-slate-200 focus:border-amber-400 outline-none transition-all"
                        value={newEntry.kramaLugu}
                        onChange={(e) => setNewEntry({...newEntry, kramaLugu: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-800 uppercase tracking-widest mb-2">Krama Alus</label>
                      <input
                        type="text"
                        className="w-full px-5 py-3 rounded-2xl border-2 border-amber-100 focus:border-amber-600 outline-none transition-all font-bold text-amber-950"
                        value={newEntry.kramaAlus}
                        onChange={(e) => setNewEntry({...newEntry, kramaAlus: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-white text-slate-500 py-4 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-800 text-amber-50 py-4 rounded-2xl font-bold hover:bg-amber-900 transition-all shadow-xl shadow-amber-900/20 border border-amber-950"
                  >
                    Simpan Tembung
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-amber-950 text-amber-200/40 py-12 text-center text-[11px] relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="w-full h-full batik-pattern"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <p className="mb-2 font-jawa text-sm text-amber-200/60 tracking-wider">Mugi migunani dhumateng sesami</p>
          <div className="w-12 h-px bg-amber-800 mx-auto mb-4"></div>
          <p className="uppercase tracking-[0.4em] font-bold text-amber-400/80 mb-1">nyk22 Digital Studio</p>
          <p className="opacity-40">&copy; 2024 Kamus Bahasa Jawa - Sedaya Hak Dipun Reksa</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
