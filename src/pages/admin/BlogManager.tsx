import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  MessageSquare,
  Loader2,
  Inbox
} from 'lucide-react';
import { supabase, BlogPost, isSupabaseConfigured, safeDbQuery, safeDbDelete, safeDbBulkDelete } from '../../lib/supabase';
import BlogModal from '../../components/admin/BlogModal';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';

export default function AdminBlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Checkbox Selection & Bulk Action States
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [bulkActionType, setBulkActionType] = useState<'selected' | 'all' | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Advanced Categorization & Filter States
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterViews, setFilterViews] = useState<string>('All');
  const [filterReadTime, setFilterReadTime] = useState<string>('All');

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleBulkDelete = async () => {
    if (!bulkActionType) return;
    setIsBulkProcessing(true);
    try {
      if (bulkActionType === 'selected') {
        if (selectedPosts.length === 0) return;
        
        if (!isSupabaseConfigured) {
          const localSt = localStorage.getItem('las_solar_blog_posts_fallback');
          let currentPosts = localSt ? JSON.parse(localSt) : [];
          currentPosts = currentPosts.map((p: any) => 
            selectedPosts.includes(p.id) ? { ...p, is_deleted: true } : p
          );
          localStorage.setItem('las_solar_blog_posts_fallback', JSON.stringify(currentPosts));
          setPosts(currentPosts.filter((p: any) => !p.is_deleted));
        } else {
          const { error } = await safeDbBulkDelete('blog_posts', selectedPosts);
          if (error) throw error;
          setPosts(posts.filter(p => !selectedPosts.includes(p.id)));
        }
        setSelectedPosts([]);
      } else if (bulkActionType === 'all') {
        if (!isSupabaseConfigured) {
          const localSt = localStorage.getItem('las_solar_blog_posts_fallback');
          let currentPosts = localSt ? JSON.parse(localSt) : [];
          currentPosts = currentPosts.map((p: any) => ({ ...p, is_deleted: true }));
          localStorage.setItem('las_solar_blog_posts_fallback', JSON.stringify(currentPosts));
          setPosts([]);
        } else {
          let { error } = await supabase
            .from('blog_posts')
            .update({ is_deleted: true })
            .neq('id', '00000000-0000-0000-0000-000000000000');
          if (error && (error.code === '42703' || error.code === 'PGRST204')) {
            const fallbackResult = await supabase
              .from('blog_posts')
              .delete()
              .neq('id', '00000000-0000-0000-0000-000000000000');
            error = fallbackResult.error;
          }
          if (error) throw error;
          setPosts([]);
        }
        setSelectedPosts([]);
      }
      setBulkActionType(null);
    } catch (err: any) {
      console.error('Error in bulk delete blog posts:', err);
      alert('Bulk action failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const fetchPosts = async () => {
    if (!isSupabaseConfigured) {
      setLoading(true);
      const localSt = localStorage.getItem('las_solar_blog_posts_fallback');
      if (localSt) {
        setPosts(JSON.parse(localSt).filter((p: any) => !p.is_deleted));
      } else {
        const demoPosts: BlogPost[] = [
          {
            id: 'b-demo-1',
            title: 'Why Solar is a Long Term Investment in the Philippines',
            content: '<p>Solar energy is expanding rapidly in Cavite and across the Philippines. With high retail electricity rates, switching to solar provides excellent financial yields over 25+ years.</p>',
            category: 'Solar Guides',
            author_name: 'Engr. L. A. Santos',
            author_role: 'Solar Systems Engineer',
            author_avatar: 'https://lh3.googleusercontent.com/d/1odxn3puWfrPEf2mgoz4JLupNHXlwpvRO',
            read_time: '5 min read',
            image_url: 'https://lh3.googleusercontent.com/d/1odxn3puWfrPEf2mgoz4JLupNHXlwpvRO',
            views: 320,
            created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
            is_deleted: false
          },
          {
            id: 'b-demo-2',
            title: 'Grid-Tied vs Hybrid Solar Systems Explained',
            content: '<p>Which system is right for your home? We compare battery-backed Hybrid systems against high-saving Grid-Tied systems of Cavite homes.</p>',
            category: 'Tech Updates',
            author_name: 'Engr. L. A. Santos',
            author_role: 'Solar Systems Engineer',
            author_avatar: 'https://lh3.googleusercontent.com/d/1odxn3puWfrPEf2mgoz4JLupNHXlwpvRO',
            read_time: '4 min read',
            image_url: 'https://lh3.googleusercontent.com/d/1odxn3puWfrPEf2mgoz4JLupNHXlwpvRO',
            views: 180,
            created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
            is_deleted: false
          }
        ];
        localStorage.setItem('las_solar_blog_posts_fallback', JSON.stringify(demoPosts));
        setPosts(demoPosts);
      }
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await safeDbQuery<BlogPost[]>(
        () => supabase.from('blog_posts').select('*').eq('is_deleted', false).order('created_at', { ascending: false }),
        () => supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
      );

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      if (!isSupabaseConfigured) {
        const localSt = localStorage.getItem('las_solar_blog_posts_fallback');
        let currentPosts = localSt ? JSON.parse(localSt) : [];
        currentPosts = currentPosts.map((p: any) => 
          p.id === postToDelete ? { ...p, is_deleted: true } : p
        );
        localStorage.setItem('las_solar_blog_posts_fallback', JSON.stringify(currentPosts));
        setPosts(currentPosts.filter((p: any) => !p.is_deleted));
        setPostToDelete(null);
        setIsDeleting(false);
        return;
      }
      const { error } = await safeDbDelete('blog_posts', postToDelete);

      if (error) throw error;
      setPosts(posts.filter(p => p.id !== postToDelete));
      setPostToDelete(null);
    } catch (err: any) {
      console.error('Error deleting post:', err);
      alert('Failed to delete article: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPosts = posts.filter(p => {
    // 1. Search term match
    const matchesSearch = 
      (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.author_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Category match
    let matchesCategory = true;
    if (filterCategory !== 'All') {
      const catLower = (p.category || '').toLowerCase();
      if (filterCategory === 'Educational') {
        matchesCategory = catLower.includes('educat') || catLower.includes('school') || catLower.includes('learn');
      } else if (filterCategory === 'Guides') {
        matchesCategory = catLower.includes('guid') || catLower.includes('tutorial') || catLower.includes('how') || catLower.includes('step');
      } else if (filterCategory === 'News') {
        matchesCategory = catLower.includes('news') || catLower.includes('update') || catLower.includes('announc');
      } else if (filterCategory === 'Tech') {
        matchesCategory = catLower.includes('tech') || catLower.includes('insight') || catLower.includes('solar') || catLower.includes('energy');
      }
    }

    // 3. Views match
    let matchesViews = true;
    if (filterViews !== 'All') {
      const vCount = p.views || 0;
      if (filterViews === 'High') {
        matchesViews = vCount >= 100;
      } else if (filterViews === 'Low') {
        matchesViews = vCount < 100;
      }
    }

    // 4. Read Time match
    let matchesReadTime = true;
    if (filterReadTime !== 'All') {
      const minsVal = parseInt((p.read_time || '').replace(/[^0-9]/g, '')) || 0;
      if (filterReadTime === 'Short') {
        matchesReadTime = minsVal < 5;
      } else if (filterReadTime === 'Long') {
        matchesReadTime = minsVal >= 5;
      }
    }

    return matchesSearch && matchesCategory && matchesViews && matchesReadTime;
  });

  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage) || 1;
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isAllPageSelected = paginatedPosts.length > 0 && paginatedPosts.every(p => selectedPosts.includes(p.id));

  const handleSelectAllPage = () => {
    if (isAllPageSelected) {
      setSelectedPosts(prev => prev.filter(id => !paginatedPosts.some(pp => pp.id === id)));
    } else {
      const pageIds = paginatedPosts.map(pp => pp.id);
      setSelectedPosts(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPosts(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-black text-black tracking-tight">BLOG MANAGER</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Write and publish energy insights</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-app-purple text-white px-8 py-4 rounded-2xl font-display font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-app-purple/20 flex items-center gap-3 w-fit"
        >
          <Plus size={18} />
          New Article
        </button>
      </div>

      <BlogModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={fetchPosts}
        post={editingPost}
      />

      <DeleteConfirmationModal
        isOpen={!!postToDelete}
        onClose={() => setPostToDelete(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        type="archive"
        title="Archive Article"
        message="Move this blog post to the trash? It will be hidden from the public blog but can be restored later."
      />

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Controls (Search and Pagination Banner) */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Search by title, author or category..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-black focus:outline-none transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
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

        {/* Advanced Category System & Filters Panel */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Category System</label>
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:border-black focus:outline-none focus:ring-0 transition-all shadow-sm"
            >
              <option value="All">All Categories</option>
              <option value="Educational">Educational Articles</option>
              <option value="Guides">Guides & Tutorials</option>
              <option value="News">Industry News / Updates</option>
              <option value="Tech">Tech & Solar Insights</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Engagement Level</label>
            <select
              value={filterViews}
              onChange={(e) => { setFilterViews(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:border-black focus:outline-none focus:ring-0 transition-all shadow-sm"
            >
              <option value="All">All Views</option>
              <option value="High">{"Popular (>= 100 views)"}</option>
              <option value="Low">{"Low views (< 100 views)"}</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Read Duration</label>
            <select
              value={filterReadTime}
              onChange={(e) => { setFilterReadTime(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:border-black focus:outline-none focus:ring-0 transition-all shadow-sm"
            >
              <option value="All">All Read Times</option>
              <option value="Short">{"Quick Read (< 5 mins)"}</option>
              <option value="Long">{"Deep Read (>= 5 mins)"}</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Controls Toolbar */}
        {selectedPosts.length > 0 && (
          <div className="bg-purple-50/50 border-b border-slate-100 px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-app-purple animate-pulse rounded-full shrink-0"></span>
              <span className="text-xs font-extrabold text-slate-800 tracking-tight">
                {selectedPosts.length} {selectedPosts.length === 1 ? 'Article' : 'Articles'} Selected
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedPosts([])}
                className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-black transition-all"
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
                Delete All {posts.length} Articles
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p className="text-xs font-bold uppercase tracking-widest">Loading Articles...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-center">
              <Inbox size={48} className="text-slate-200 mb-4" />
              <p className="text-sm font-black text-black uppercase tracking-widest">No articles found</p>
              <p className="text-xs mt-1">Try relaxing your search terms or filters.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="w-12 pl-8 py-4 text-left" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isAllPageSelected}
                      onChange={handleSelectAllPage}
                      className="w-4 h-4 rounded border-slate-300 text-app-purple focus:ring-app-purple/30 cursor-pointer accent-purple-600"
                      title={isAllPageSelected ? "Deselect page" : "Select page records"}
                    />
                  </th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Article Details</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Category</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-center">Engagement</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedPosts.map((post) => (
                  <tr 
                    key={post.id} 
                    className={`hover:bg-slate-50/50 transition-colors group ${selectedPosts.includes(post.id) ? 'bg-purple-50/20' : ''}`}
                  >
                    <td className="w-12 pl-8 py-6" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedPosts.includes(post.id)}
                        onChange={(e) => handleToggleSelect(post.id, e as any)}
                        className="w-4 h-4 rounded border-slate-300 text-app-purple focus:ring-app-purple/30 cursor-pointer accent-purple-600"
                      />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-black mb-1 group-hover:text-app-purple transition-colors truncate max-w-md">{post.title}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">By {post.author_name} • {new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 bg-app-purple/10 text-app-purple rounded-lg whitespace-nowrap">
                        {post.category}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-slate-400" title="Views">
                          <Eye size={14} />
                          <span className="text-xs font-bold">{post.views || 0}</span>
                        </div>
                        {post.read_time && (
                          <div className="text-[10px] bg-slate-50 text-slate-400 font-black px-2 py-1 rounded border border-slate-100 uppercase tracking-wider whitespace-nowrap" title="Read duration">
                            {post.read_time}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <button 
                          onClick={() => handleEdit(post)}
                          className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" 
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <Link 
                          to={`/admin/dashboard/blog/${post.id}/preview`}
                          className="p-2 text-slate-300 hover:text-app-purple hover:bg-app-purple/10 rounded-lg transition-all" 
                          title="Preview Page"
                        >
                          <Eye size={16} />
                        </Link>
                        <a 
                          href={`/blog/${post.id}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-slate-300 hover:text-black hover:bg-slate-50 rounded-lg transition-all" 
                          title="View Live Public Page"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button 
                          type="button"
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setPostToDelete(post.id);
                          }} 
                          title="Archive"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={!!bulkActionType}
        onClose={() => setBulkActionType(null)}
        onConfirm={handleBulkDelete}
        isDeleting={isBulkProcessing}
        type="archive"
        title={bulkActionType === 'all' ? "ARCHIVE ALL ARTICLES" : "Archive Selected Articles"}
        message={bulkActionType === 'all' 
          ? `WARNING: You are about to archive EVERY SINGLE blog post (${posts.length} total) in the entire system. They will be archived and hidden from the public blog. Are you sure you want to continue?` 
          : `Are you sure you want to archive the ${selectedPosts.length} selected blog articles? They will be hidden from the public blog.`
        }
      />
    </div>
  );
}
