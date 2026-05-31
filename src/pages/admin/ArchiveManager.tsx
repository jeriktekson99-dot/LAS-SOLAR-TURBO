import { useState, useEffect } from 'react';
import { 
  Trash2, 
  RotateCcw, 
  XOctagon, 
  Search, 
  Filter,
  FileText,
  FolderKanban,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';

type ArchivedItem = {
  id: string;
  title: string;
  type: 'Portfolio' | 'Blog';
  date_deleted: string;
};

export default function AdminArchiveManager() {
  const [items, setItems] = useState<ArchivedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'Portfolio' | 'Blog'} | null>(null);
  const [itemToRestore, setItemToRestore] = useState<ArchivedItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchArchivedItems();
  }, []);

  const fetchArchivedItems = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [projectsRes, blogsRes] = await Promise.all([
        supabase.from('projects').select('id, title, created_at').eq('is_deleted', true),
        supabase.from('blog_posts').select('id, title, created_at').eq('is_deleted', true)
      ]);

      const formattedProjects: ArchivedItem[] = (projectsRes.data || []).map(p => ({
        id: p.id,
        title: p.title,
        type: 'Portfolio',
        date_deleted: p.created_at // Assuming updated_at would be better if we had it
      }));

      const formattedBlogs: ArchivedItem[] = (blogsRes.data || []).map(b => ({
        id: b.id,
        title: b.title,
        type: 'Blog',
        date_deleted: b.created_at
      }));

      setItems([...formattedProjects, ...formattedBlogs].sort((a, b) => 
        new Date(b.date_deleted).getTime() - new Date(a.date_deleted).getTime()
      ));
    } catch (err) {
      console.error('Error fetching archived items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreConfirm = async () => {
    if (!itemToRestore) return;
    setIsRestoring(true);
    try {
      const table = itemToRestore.type === 'Portfolio' ? 'projects' : 'blog_posts';
      const { error } = await supabase
        .from(table)
        .update({ is_deleted: false })
        .eq('id', itemToRestore.id);

      if (error) throw error;
      setItems(items.filter(i => i.id !== itemToRestore.id));
      setItemToRestore(null);
    } catch (err: any) {
      console.error('Error restoring item:', err);
      alert('Failed to restore: ' + (err.message || 'Unknown error'));
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const table = itemToDelete.type === 'Portfolio' ? 'projects' : 'blog_posts';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', itemToDelete.id);

      if (error) throw error;
      setItems(items.filter(i => i.id !== itemToDelete.id));
      setItemToDelete(null);
    } catch (err: any) {
      console.error('Error permanent deleting item:', err);
      alert('Failed to delete permanently: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = items.filter(i => 
    i.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-black text-black tracking-tight">ARCHIVE / TRASH BIN</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Recover or permanently delete items</p>
        </div>
        <div className="flex items-center gap-4 text-red-500 bg-red-50 px-6 py-3 rounded-2xl border border-red-100">
            <AlertTriangle size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Items stay for 30 days</span>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Search in trash..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-black focus:outline-none transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 hover:border-red-500 transition-all w-full sm:w-auto justify-center">
              <Filter size={14} />
              Filter by Type
            </button>
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm w-full sm:w-auto justify-between">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 text-slate-400 hover:text-black disabled:text-slate-200 transition-colors disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-4 text-[10px] font-black uppercase text-slate-400 select-none whitespace-nowrap">
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
                <p className="text-xs font-bold uppercase tracking-widest">Scanning Archive...</p>
             </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Item Type</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Title / Name</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-red-50/10 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        {item.type === 'Portfolio' ? (
                          <FolderKanban size={16} className="text-slate-400" />
                        ) : (
                          <FileText size={16} className="text-slate-400" />
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest py-1 px-3 bg-slate-100 text-slate-500 rounded-lg">
                          {item.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-black grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{item.title}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setItemToRestore(item);
                          }}
                          className="p-3 bg-slate-50 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all flex items-center gap-2"
                        >
                          <RotateCcw size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Restore</span>
                        </button>
                        <button 
                           type="button"
                           onClick={(e) => {
                             e.stopPropagation();
                             setItemToDelete({ id: item.id, type: item.type });
                           }}
                          className="p-3 bg-red-50/50 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Permanent Delete"
                        >
                          <XOctagon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                      <td colSpan={3} className="px-8 py-20 text-center">
                          <Trash2 size={48} className="text-slate-100 mx-auto mb-4" />
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Trash is empty</p>
                      </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handlePermanentDelete}
        isDeleting={isDeleting}
        title="Permanent Delete"
        message="🚨 DANGER: You are about to permanently delete this item. This action cannot be reversed and the data will be lost forever."
      />

      <DeleteConfirmationModal
        isOpen={!!itemToRestore}
        onClose={() => setItemToRestore(null)}
        onConfirm={handleRestoreConfirm}
        isDeleting={isRestoring}
        type="restore"
        title="Restore Archived Item"
        message={`Are you sure you want to restore the item "${itemToRestore?.title}"? This will recover it and make it live on the main website.`}
        confirmLabel="Restore"
      />
    </div>
  );
}
