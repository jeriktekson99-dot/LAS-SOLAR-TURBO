import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  Mail,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { supabase, Subscriber, isSupabaseConfigured, safeDbQuery, safeDbDelete, safeDbBulkDelete } from '../../lib/supabase';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';

export default function AdminSubscribersManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriberToDelete, setSubscriberToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Multi-select & Bulk actions
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [bulkActionType, setBulkActionType] = useState<'selected' | 'all' | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    if (!isSupabaseConfigured) {
      setLoading(true);
      const localSt = localStorage.getItem('las_solar_subscribers_fallback');
      if (localSt) {
        setSubscribers(JSON.parse(localSt).filter((s: any) => !s.is_deleted));
      } else {
        const demoSubs: Subscriber[] = [
          { id: 's-demo-1', email: 'pedro@example.com', source: 'Home Footer', created_at: new Date(Date.now() - 86450000 * 3).toISOString() },
          { id: 's-demo-2', email: 'ana.santos@example.com', source: 'Blog Detail Sidebar', created_at: new Date(Date.now() - 86450000 * 7).toISOString() }
        ];
        localStorage.setItem('las_solar_subscribers_fallback', JSON.stringify(demoSubs));
        setSubscribers(demoSubs);
      }
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await safeDbQuery<Subscriber[]>(
        () => supabase.from('subscribers').select('*').eq('is_deleted', false).order('created_at', { ascending: false }),
        () => supabase.from('subscribers').select('*').order('created_at', { ascending: false })
      );

      if (error) throw error;
      setSubscribers(data || []);
    } catch (err) {
      console.error('Error fetching subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscriber = async () => {
    if (!subscriberToDelete) return;
    setIsDeleting(true);
    try {
      if (!isSupabaseConfigured) {
        const localSt = localStorage.getItem('las_solar_subscribers_fallback');
        let currentSubs = localSt ? JSON.parse(localSt) : [];
        currentSubs = currentSubs.map((s: any) => 
          s.id === subscriberToDelete ? { ...s, is_deleted: true } : s
        );
        localStorage.setItem('las_solar_subscribers_fallback', JSON.stringify(currentSubs));
        setSubscribers(currentSubs.filter((s: any) => !s.is_deleted));
        setSubscriberToDelete(null);
        setIsDeleting(false);
        return;
      }
      const { error } = await safeDbDelete('subscribers', subscriberToDelete);

      if (error) throw error;
      setSubscribers(subscribers.filter(s => s.id !== subscriberToDelete));
      setSubscriberToDelete(null);
    } catch (err: any) {
      console.error('Error deleting subscriber:', err);
      alert('Failed to delete subscriber: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!bulkActionType) return;
    setIsBulkProcessing(true);
    try {
      if (bulkActionType === 'selected') {
        if (selectedSubscribers.length === 0) return;
        
        if (!isSupabaseConfigured) {
          const localSt = localStorage.getItem('las_solar_subscribers_fallback');
          let currentSubs = localSt ? JSON.parse(localSt) : [];
          currentSubs = currentSubs.map((s: any) => 
            selectedSubscribers.includes(s.id) ? { ...s, is_deleted: true } : s
          );
          localStorage.setItem('las_solar_subscribers_fallback', JSON.stringify(currentSubs));
          setSubscribers(currentSubs.filter((s: any) => !s.is_deleted));
          setSelectedSubscribers([]);
        } else {
          const { error } = await safeDbBulkDelete('subscribers', selectedSubscribers);

          if (error) throw error;
          setSubscribers(subscribers.filter(s => !selectedSubscribers.includes(s.id)));
          setSelectedSubscribers([]);
        }
      } else if (bulkActionType === 'all') {
        if (!isSupabaseConfigured) {
          const localSt = localStorage.getItem('las_solar_subscribers_fallback');
          let currentSubs = localSt ? JSON.parse(localSt) : [];
          currentSubs = currentSubs.map((s: any) => ({ ...s, is_deleted: true }));
          localStorage.setItem('las_solar_subscribers_fallback', JSON.stringify(currentSubs));
          setSubscribers([]);
          setSelectedSubscribers([]);
        } else {
          let { error } = await supabase
            .from('subscribers')
            .update({ is_deleted: true })
            .neq('id', '00000000-0000-0000-0000-000000000000');
          if (error && (error.code === '42703' || error.code === 'PGRST204')) {
            const fallbackResult = await supabase
              .from('subscribers')
              .delete()
              .neq('id', '00000000-0000-0000-0000-000000000000');
            error = fallbackResult.error;
          }

          if (error) throw error;
          setSubscribers([]);
          setSelectedSubscribers([]);
        }
      }
      setBulkActionType(null);
    } catch (err: any) {
      console.error('Error in bulk subscriber delete:', err);
      alert('Failed to delete subscribers: ' + (err.message || 'Unknown error'));
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage) || 1;
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isAllPageSelected = paginatedSubscribers.length > 0 && paginatedSubscribers.every(s => selectedSubscribers.includes(s.id));

  const handleSelectAllPage = () => {
    if (isAllPageSelected) {
      setSelectedSubscribers(prev => prev.filter(id => !paginatedSubscribers.some(sub => sub.id === id)));
    } else {
      const pageIds = paginatedSubscribers.map(sub => sub.id);
      setSelectedSubscribers(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSubscribers(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;

    const escapeCSV = (val: any) => {
      if (val === undefined || val === null) return '';
      const str = String(val).replace(/"/g, '""').trim();
      const singleLine = str.replace(/[\r\n]+/g, ' | ');
      return `"${singleLine}"`;
    };

    const headers = ['Email', 'Source', 'Date Subscribed'];
    const csvRows = subscribers.map(s => [
      escapeCSV(s.email),
      escapeCSV(s.source),
      escapeCSV(s.created_at ? new Date(s.created_at).toLocaleString() : '')
    ].join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'las-solar-subscribers.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-black text-black tracking-tight">NEWSLETTER SUBSCRIBERS</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Manage mailing list and campaign contacts</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="bg-app-purple text-white px-8 py-4 rounded-2xl font-display font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-app-purple/20 flex items-center justify-center gap-3 w-fit"
        >
          <Download size={18} />
          Export to CSV
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Search by email..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-black focus:outline-none transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 text-slate-400 hover:text-black disabled:text-slate-200 transition-colors disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-4 text-[10px] font-black uppercase text-slate-400 select-none">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 text-slate-400 hover:text-black disabled:text-slate-200 transition-colors disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Controls Toolbar */}
        {selectedSubscribers.length > 0 && (
          <div className="bg-purple-50/50 border-b border-slate-100 px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-app-purple animate-pulse rounded-full shrink-0"></span>
              <span className="text-xs font-extrabold text-slate-800 tracking-tight">
                {selectedSubscribers.length} {selectedSubscribers.length === 1 ? 'Subscriber' : 'Subscribers'} Selected
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedSubscribers([])}
                className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-black transition-all font-bold"
              >
                Clear Selection
              </button>
              <button
                type="button"
                onClick={() => setBulkActionType('selected')}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-display font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
              >
                <Trash2 size={12} />
                Delete Selected
              </button>
              <button
                type="button"
                onClick={() => setBulkActionType('all')}
                className="bg-black hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-display font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
              >
                <Trash2 size={12} />
                Delete All {subscribers.length} Subscribers
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
             <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p className="text-xs font-bold uppercase tracking-widest">Loading Subscribers...</p>
             </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 w-12">
                    <input 
                      type="checkbox" 
                      className="rounded text-app-purple focus:ring-app-purple border-slate-200 cursor-pointer"
                      checked={isAllPageSelected}
                      onChange={handleSelectAllPage}
                    />
                  </th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Subscriber Email</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Subscription Date</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Source Point</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedSubscribers.map((subscriber) => (
                  <tr 
                    key={subscriber.id} 
                    className={`hover:bg-slate-50/50 transition-colors group ${selectedSubscribers.includes(subscriber.id) ? 'bg-purple-50/20' : ''}`}
                  >
                    <td className="px-8 py-6 w-12" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded text-app-purple focus:ring-app-purple border-slate-200 cursor-pointer"
                        checked={selectedSubscribers.includes(subscriber.id)}
                        onChange={(e) => handleToggleSelect(subscriber.id, e as any)}
                      />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-black/5 text-black rounded-xl">
                          <Mail size={16} />
                        </div>
                        <span className="text-sm font-bold text-black">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-medium text-slate-400">{new Date(subscriber.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 bg-slate-100 text-slate-600 rounded-lg">
                        {subscriber.source}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSubscriberToDelete(subscriber.id);
                        }}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Subscriber"
                      >
                          <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSubscribers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <Users size={48} className="text-slate-100 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No subscribers found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <DeleteConfirmationModal
        isOpen={!!subscriberToDelete}
        onClose={() => setSubscriberToDelete(null)}
        onConfirm={handleDeleteSubscriber}
        isDeleting={isDeleting}
        title="Remove Subscriber"
        message="Are you sure you want to remove this email from your subscription list? They will no longer receive newsletter updates."
      />
      <DeleteConfirmationModal
        isOpen={!!bulkActionType}
        onClose={() => setBulkActionType(null)}
        onConfirm={handleBulkDelete}
        isDeleting={isBulkProcessing}
        title={bulkActionType === 'all' ? "DELETE ALL SUBSCRIBERS" : "Delete Selected Subscribers"}
        message={bulkActionType === 'all'
          ? `🚨 DANGER WARNING: You are about to permanently delete EVERY SINGLE newsletter subscriber (${subscribers.length} total) from the database. This is absolutely irreversible and they will be removed forever. Are you sure you want to continue?`
          : `Are you sure you want to permanently delete the ${selectedSubscribers.length} selected subscriber records? This action is absolutely irreversible and they will be removed from your lists forever.`
        }
      />
    </div>
  );
}
