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
import { supabase, Subscriber, isSupabaseConfigured } from '../../lib/supabase';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';

export default function AdminSubscribersManager() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subscriberToDelete, setSubscriberToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false });

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
      const { error } = await supabase
        .from('subscribers')
        .delete()
        .eq('id', subscriberToDelete);

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

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;

    const headers = ['Email', 'Source', 'Date Subscribed'];
    const csvContent = [
      headers.join(','),
      ...subscribers.map(s => `"${s.email}","${s.source}","${new Date(s.created_at).toLocaleString()}"`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'las-solar-subscribers.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage) || 1;
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-black text-black tracking-tight">NEWSLETTER SUBSCRIBERS</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Manage mailing list and campaign contacts</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="bg-app-purple text-white px-8 py-4 rounded-2xl font-display font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-app-purple/20 flex items-center gap-3"
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
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Subscriber Email</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Subscription Date</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Source Point</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-slate-50/50 transition-colors group">
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
    </div>
  );
}
