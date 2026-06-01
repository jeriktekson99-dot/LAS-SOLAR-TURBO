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
  ChevronRight,
  Mail,
  Users
} from 'lucide-react';
import { supabase, isSupabaseConfigured, safeDbQuery } from '../../lib/supabase';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';

type ArchivedItem = {
  id: string;
  title: string;
  type: 'Portfolio' | 'Blog' | 'Inquiry' | 'Subscriber';
  date_deleted: string;
};

export default function AdminArchiveManager() {
  const [items, setItems] = useState<ArchivedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'Portfolio' | 'Blog' | 'Inquiry' | 'Subscriber'} | null>(null);
  const [itemToRestore, setItemToRestore] = useState<ArchivedItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selection & Bulk controls
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkActionType, setBulkActionType] = useState<'selected' | 'all' | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('All');

  useEffect(() => {
    fetchArchivedItems();
  }, []);

  const fetchArchivedItems = async () => {
    if (!isSupabaseConfigured) {
      setLoading(true);
      const archived: ArchivedItem[] = [];

      // Leads
      const leadsStr = localStorage.getItem('las_solar_leads_fallback');
      if (leadsStr) {
        try {
          JSON.parse(leadsStr)
            .filter((l: any) => l.is_deleted)
            .forEach((l: any) => {
              archived.push({
                id: l.id,
                title: `${l.name} (${l.email || l.phone || 'No Contact'})`,
                type: 'Inquiry',
                date_deleted: l.created_at || new Date().toISOString()
              });
            });
        } catch (e) {
          console.error(e);
        }
      }

      // Projects
      const projectsStr = localStorage.getItem('las_solar_projects_fallback');
      if (projectsStr) {
        try {
          JSON.parse(projectsStr)
            .filter((p: any) => p.is_deleted)
            .forEach((p: any) => {
              archived.push({
                id: p.id,
                title: p.title,
                type: 'Portfolio',
                date_deleted: p.created_at || new Date().toISOString()
              });
            });
        } catch (e) {
          console.error(e);
        }
      }

      // Blogs
      const blogsStr = localStorage.getItem('las_solar_blog_posts_fallback');
      if (blogsStr) {
        try {
          JSON.parse(blogsStr)
            .filter((b: any) => b.is_deleted)
            .forEach((b: any) => {
              archived.push({
                id: b.id,
                title: b.title,
                type: 'Blog',
                date_deleted: b.created_at || new Date().toISOString()
              });
            });
        } catch (e) {
          console.error(e);
        }
      }

      // Subscribers
      const subsStr = localStorage.getItem('las_solar_subscribers_fallback');
      if (subsStr) {
        try {
          JSON.parse(subsStr)
            .filter((s: any) => s.is_deleted)
            .forEach((s: any) => {
              archived.push({
                id: s.id,
                title: s.email,
                type: 'Subscriber',
                date_deleted: s.created_at || new Date().toISOString()
              });
            });
        } catch (e) {
          console.error(e);
        }
      }

      setItems(archived.sort((a, b) => new Date(b.date_deleted).getTime() - new Date(a.date_deleted).getTime()));
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [projectsRes, blogsRes, leadsRes, subsRes] = await Promise.all([
        safeDbQuery(
          () => supabase.from('projects').select('id, title, created_at').eq('is_deleted', true),
          () => Promise.resolve({ data: [] as any[], error: null })
        ),
        safeDbQuery(
          () => supabase.from('blog_posts').select('id, title, created_at').eq('is_deleted', true),
          () => Promise.resolve({ data: [] as any[], error: null })
        ),
        safeDbQuery(
          () => supabase.from('leads').select('id, name, email, created_at').eq('is_deleted', true),
          () => supabase.from('leads').select('id, name, email, created_at').eq('status', 'Archived')
        ),
        safeDbQuery(
          () => supabase.from('subscribers').select('id, email, created_at').eq('is_deleted', true),
          () => Promise.resolve({ data: [] as any[], error: null })
        )
      ]);

      const formattedProjects: ArchivedItem[] = (projectsRes.data || []).map(p => ({
        id: p.id,
        title: p.title,
        type: 'Portfolio',
        date_deleted: p.created_at
      }));

      const formattedBlogs: ArchivedItem[] = (blogsRes.data || []).map(b => ({
        id: b.id,
        title: b.title,
        type: 'Blog',
        date_deleted: b.created_at
      }));

      const formattedLeads: ArchivedItem[] = (leadsRes.data || []).map(l => ({
        id: l.id,
        title: `${l.name} (${l.email || 'No Email'})`,
        type: 'Inquiry',
        date_deleted: l.created_at
      }));

      const formattedSubs: ArchivedItem[] = (subsRes.data || []).map(s => ({
        id: s.id,
        title: s.email,
        type: 'Subscriber',
        date_deleted: s.created_at
      }));

      setItems([...formattedProjects, ...formattedBlogs, ...formattedLeads, ...formattedSubs].sort((a, b) => 
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
      if (!isSupabaseConfigured) {
        const typeKeys: Record<string, string> = {
          'Inquiry': 'las_solar_leads_fallback',
          'Portfolio': 'las_solar_projects_fallback',
          'Blog': 'las_solar_blog_posts_fallback',
          'Subscriber': 'las_solar_subscribers_fallback'
        };
        const key = typeKeys[itemToRestore.type];
        if (key) {
          const localSt = localStorage.getItem(key);
          if (localSt) {
            let current = JSON.parse(localSt);
            current = current.map((item: any) => item.id === itemToRestore.id ? { ...item, is_deleted: false } : item);
            localStorage.setItem(key, JSON.stringify(current));
          }
        }
        setItems(items.filter(i => i.id !== itemToRestore.id));
        setItemToRestore(null);
        setIsRestoring(false);
        return;
      }
      const table = 
        itemToRestore.type === 'Portfolio' ? 'projects' : 
        itemToRestore.type === 'Blog' ? 'blog_posts' : 
        itemToRestore.type === 'Inquiry' ? 'leads' : 'subscribers';

      let { error } = await supabase
        .from(table)
        .update({ is_deleted: false })
        .eq('id', itemToRestore.id);

      if (error && (error.code === '42703' || error.code === 'PGRST204') && table === 'leads') {
        const fallbackResult = await supabase
          .from('leads')
          .update({ status: 'New' })
          .eq('id', itemToRestore.id);
        error = fallbackResult.error;
      }

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
      if (!isSupabaseConfigured) {
        const typeKeys: Record<string, string> = {
          'Inquiry': 'las_solar_leads_fallback',
          'Portfolio': 'las_solar_projects_fallback',
          'Blog': 'las_solar_blog_posts_fallback',
          'Subscriber': 'las_solar_subscribers_fallback'
        };
        const key = typeKeys[itemToDelete.type];
        if (key) {
          const localSt = localStorage.getItem(key);
          if (localSt) {
            let current = JSON.parse(localSt);
            current = current.filter((item: any) => item.id !== itemToDelete.id);
            localStorage.setItem(key, JSON.stringify(current));
          }
        }
        setItems(items.filter(i => i.id !== itemToDelete.id));
        setItemToDelete(null);
        setIsDeleting(false);
        return;
      }
      const table = 
        itemToDelete.type === 'Portfolio' ? 'projects' : 
        itemToDelete.type === 'Blog' ? 'blog_posts' : 
        itemToDelete.type === 'Inquiry' ? 'leads' : 'subscribers';

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

  const handleBulkDelete = async () => {
    if (!bulkActionType) return;
    setIsDeleting(true);
    try {
      if (bulkActionType === 'selected') {
        if (selectedItems.length === 0) return;
        
        const selectedObjects = items.filter(i => selectedItems.includes(i.id));
        const portfolioIds = selectedObjects.filter(i => i.type === 'Portfolio').map(i => i.id);
        const blogIds = selectedObjects.filter(i => i.type === 'Blog').map(i => i.id);
        const inquiryIds = selectedObjects.filter(i => i.type === 'Inquiry').map(i => i.id);
        const subscriberIds = selectedObjects.filter(i => i.type === 'Subscriber').map(i => i.id);

        if (!isSupabaseConfigured) {
          const typeKeys: Record<string, string> = {
            'Inquiry': 'las_solar_leads_fallback',
            'Portfolio': 'las_solar_projects_fallback',
            'Blog': 'las_solar_blog_posts_fallback',
            'Subscriber': 'las_solar_subscribers_fallback'
          };
          const idsByType: Record<string, string[]> = {
            'Inquiry': inquiryIds,
            'Portfolio': portfolioIds,
            'Blog': blogIds,
            'Subscriber': subscriberIds
          };
          
          Object.entries(typeKeys).forEach(([type, key]) => {
            const ids = idsByType[type];
            if (ids && ids.length > 0) {
              const localSt = localStorage.getItem(key);
              if (localSt) {
                let current = JSON.parse(localSt);
                current = current.filter((item: any) => !ids.includes(item.id));
                localStorage.setItem(key, JSON.stringify(current));
              }
            }
          });
        } else {
          if (portfolioIds.length > 0) {
            const { error } = await supabase
              .from('projects')
              .delete()
              .in('id', portfolioIds);
            if (error) throw error;
          }

          if (blogIds.length > 0) {
            const { error } = await supabase
              .from('blog_posts')
              .delete()
              .in('id', blogIds);
            if (error) throw error;
          }

          if (inquiryIds.length > 0) {
            const { error } = await supabase
              .from('leads')
              .delete()
              .in('id', inquiryIds);
            if (error) throw error;
          }

          if (subscriberIds.length > 0) {
            const { error } = await supabase
              .from('subscribers')
              .delete()
              .in('id', subscriberIds);
            if (error) throw error;
          }
        }

        setItems(items.filter(i => !selectedItems.includes(i.id)));
        setSelectedItems([]);
      } else if (bulkActionType === 'all') {
        if (!isSupabaseConfigured) {
          const typeKeys: Record<string, string> = {
            'Inquiry': 'las_solar_leads_fallback',
            'Portfolio': 'las_solar_projects_fallback',
            'Blog': 'las_solar_blog_posts_fallback',
            'Subscriber': 'las_solar_subscribers_fallback'
          };
          
          Object.values(typeKeys).forEach(key => {
            const localSt = localStorage.getItem(key);
            if (localSt) {
              let current = JSON.parse(localSt);
              current = current.filter((item: any) => !item.is_deleted);
              localStorage.setItem(key, JSON.stringify(current));
            }
          });
        } else {
          let { error: projectErr } = await supabase
            .from('projects')
            .delete()
            .eq('is_deleted', true);
          if (projectErr && (projectErr.code === '42703' || projectErr.code === 'PGRST204')) {
            projectErr = null;
          }
          if (projectErr) throw projectErr;

          let { error: blogErr } = await supabase
            .from('blog_posts')
            .delete()
            .eq('is_deleted', true);
          if (blogErr && (blogErr.code === '42703' || blogErr.code === 'PGRST204')) {
            blogErr = null;
          }
          if (blogErr) throw blogErr;

          let { error: leadErr } = await supabase
            .from('leads')
            .delete()
            .eq('is_deleted', true);
          if (leadErr && (leadErr.code === '42703' || leadErr.code === 'PGRST204')) {
            const fallbackResult = await supabase
              .from('leads')
              .delete()
              .eq('status', 'Archived');
            leadErr = fallbackResult.error;
          }
          if (leadErr) throw leadErr;

          let { error: subErr } = await supabase
            .from('subscribers')
            .delete()
            .eq('is_deleted', true);
          if (subErr && (subErr.code === '42703' || subErr.code === 'PGRST204')) {
            subErr = null;
          }
          if (subErr) throw subErr;
        }

        setItems([]);
        setSelectedItems([]);
      }
      setBulkActionType(null);
    } catch (err: any) {
      console.error('Error in bulk archive delete:', err);
      alert('Failed to delete items permanently: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = items.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = typeFilter === 'All' || i.type === typeFilter;
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isAllPageSelected = paginatedItems.length > 0 && paginatedItems.every(i => selectedItems.includes(i.id));

  const handleSelectAllPage = () => {
    if (isAllPageSelected) {
      setSelectedItems(prev => prev.filter(id => !paginatedItems.some(item => item.id === id)));
    } else {
      const pageIds = paginatedItems.map(item => item.id);
      setSelectedItems(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-black text-black tracking-tight">ARCHIVE / TRASH BIN</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Recover or permanently delete items</p>
        </div>
        <div className="flex items-center gap-4 text-red-500 bg-red-50 px-6 py-3 rounded-2xl border border-red-100 w-fit">
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
            <div className="relative w-full sm:w-56">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
              <select 
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                  setSelectedItems([]); // Clear selection when filter changes
                }}
                className="w-full pl-10 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 focus:border-black focus:outline-none transition-all shadow-sm cursor-pointer appearance-none"
              >
                <option value="All">All Sources</option>
                <option value="Portfolio">Portfolio (Projects)</option>
                <option value="Blog">Blog (Articles)</option>
                <option value="Inquiry">Inquiries (Leads)</option>
                <option value="Subscriber">Subscribers</option>
              </select>
            </div>
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

        {/* Bulk Action Controls Toolbar */}
        {selectedItems.length > 0 && (
          <div className="bg-red-50/20 border-b border-slate-100 px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-red-500 animate-pulse rounded-full shrink-0"></span>
              <span className="text-xs font-extrabold text-slate-800 tracking-tight">
                {selectedItems.length} {selectedItems.length === 1 ? 'Item' : 'Items'} Selected
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedItems([])}
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
                Delete All {items.length} Items
              </button>
            </div>
          </div>
        )}

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
                  <th className="px-8 py-4 w-12">
                    <input 
                      type="checkbox" 
                      className="rounded text-red-500 focus:ring-red-500 border-slate-200 cursor-pointer"
                      checked={isAllPageSelected}
                      onChange={handleSelectAllPage}
                    />
                  </th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Item Type</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Title / Name</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`hover:bg-red-50/10 transition-colors group ${selectedItems.includes(item.id) ? 'bg-red-50/5' : ''}`}
                  >
                    <td className="px-8 py-6 w-12" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        className="rounded text-red-500 focus:ring-red-500 border-slate-200 cursor-pointer"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => handleToggleSelect(item.id, e as any)}
                      />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        {item.type === 'Portfolio' ? (
                          <FolderKanban size={16} className="text-slate-400" />
                        ) : item.type === 'Blog' ? (
                          <FileText size={16} className="text-slate-400" />
                        ) : item.type === 'Inquiry' ? (
                          <Mail size={16} className="text-slate-400" />
                        ) : (
                          <Users size={16} className="text-slate-400" />
                        )}
                        <span className={`text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-lg ${
                          item.type === 'Portfolio' ? 'bg-blue-50 text-blue-600' :
                          item.type === 'Blog' ? 'bg-indigo-50 text-indigo-600' :
                          item.type === 'Inquiry' ? 'bg-purple-50 text-purple-600' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          {item.type === 'Inquiry' ? 'Inquiry' : item.type}
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
                      <td colSpan={4} className="px-8 py-20 text-center">
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

      <DeleteConfirmationModal
        isOpen={!!bulkActionType}
        onClose={() => setBulkActionType(null)}
        onConfirm={handleBulkDelete}
        isDeleting={isDeleting}
        title={bulkActionType === 'all' ? "PERMANENTLY DELETE ALL ARCHIVED ITEMS" : "Permanently Delete Selected Items"}
        message={bulkActionType === 'all'
          ? `🚨 DANGER WARNING: You are about to PERMANENTLY delete EVERY SINGLE archived item in the trash bin (${items.length} total). This is absolutely irreversible. Are you sure you want to proceed?`
          : `Are you sure you want to permanently delete the ${selectedItems.length} selected archived items from the trash? This action is absolutely irreversible and the data will be lost forever.`
        }
      />
    </div>
  );
}
