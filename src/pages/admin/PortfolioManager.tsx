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
  Loader2,
  Eye,
  Inbox
} from 'lucide-react';
import { supabase, Project, isSupabaseConfigured } from '../../lib/supabase';
import ProjectModal from '../../components/admin/ProjectModal';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';

export default function AdminPortfolioManager() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Checkbox Selection & Bulk Action States
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [bulkActionType, setBulkActionType] = useState<'selected' | 'all' | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Advanced Categorization & Filter States
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterLocation, setFilterLocation] = useState<string>('All');

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleBulkDelete = async () => {
    if (!bulkActionType) return;
    setIsBulkProcessing(true);
    try {
      if (bulkActionType === 'selected') {
        if (selectedProjects.length === 0) return;
        
        if (!isSupabaseConfigured) {
          setProjects(projects.filter(p => !selectedProjects.includes(p.id)));
        } else {
          const { error } = await supabase
            .from('projects')
            .update({ is_deleted: true })
            .in('id', selectedProjects);
          if (error) throw error;
          setProjects(projects.filter(p => !selectedProjects.includes(p.id)));
        }
        setSelectedProjects([]);
      } else if (bulkActionType === 'all') {
        if (!isSupabaseConfigured) {
          setProjects([]);
        } else {
          const { error } = await supabase
            .from('projects')
            .update({ is_deleted: true })
            .eq('is_deleted', false);
          if (error) throw error;
          setProjects([]);
        }
        setSelectedProjects([]);
      }
      setBulkActionType(null);
    } catch (err: any) {
      console.error('Error in bulk delete projects:', err);
      alert('Bulk action failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const fetchProjects = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_deleted: true })
        .eq('id', projectToDelete);

      if (error) throw error;
      setProjects(projects.filter(p => p.id !== projectToDelete));
      setProjectToDelete(null);
    } catch (err: any) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    // 1. Search term match
    const matchesSearch = 
      (p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.location || '').toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Category match
    let matchesCategory = true;
    if (filterCategory === 'Residential') {
      const isCom = (p.title || '').toLowerCase().includes('factory') || 
                    (p.title || '').toLowerCase().includes('commercial') ||
                    (p.overview_content || '').toLowerCase().includes('warehouse') ||
                    (p.overview_content || '').toLowerCase().includes('factory');
      const sizeNum = parseFloat(p.system_size) || 0;
      matchesCategory = !isCom && (sizeNum < 15 || (p.overview_content || '').toLowerCase().includes('residential'));
    } else if (filterCategory === 'Commercial') {
      const isCom = (p.title || '').toLowerCase().includes('factory') || 
                    (p.title || '').toLowerCase().includes('commercial') ||
                    (p.overview_content || '').toLowerCase().includes('warehouse') ||
                    (p.overview_content || '').toLowerCase().includes('factory');
      const sizeNum = parseFloat(p.system_size) || 0;
      matchesCategory = isCom || sizeNum >= 15;
    } else if (filterCategory === 'Hybrid') {
      matchesCategory = (p.inverter_type || '').toLowerCase().includes('hybrid') ||
                        (p.system_size || '').toLowerCase().includes('hybrid') ||
                        (p.title || '').toLowerCase().includes('hybrid');
    } else if (filterCategory === 'Grid-Tie') {
      matchesCategory = (p.inverter_type || '').toLowerCase().includes('grid') ||
                        (p.system_size || '').toLowerCase().includes('grid') ||
                        (p.title || '').toLowerCase().includes('grid');
    }

    // 4. Location match
    let matchesLoc = true;
    if (filterLocation === 'Cavite') {
      const caviteKeywords = ['cavite', 'dasmarinas', 'silang', 'imus', 'bacoor', 'trias', 'tagaytay', 'trece', 'kawit', 'noveleta', 'rosario', 'tanza', 'naic', 'maragondon', 'indang', 'carmona'];
      matchesLoc = caviteKeywords.some(kw => (p.location || '').toLowerCase().includes(kw));
    } else if (filterLocation === 'Metro Manila') {
      const manilaKeywords = ['manila', 'quezon', 'mandaluyong', 'makati', 'pasay', 'pasig', 'taguig', 'pinas', 'muntinlupa', 'paranaque', 'ncr'];
      matchesLoc = manilaKeywords.some(kw => (p.location || '').toLowerCase().includes(kw));
    } else if (filterLocation === 'Other Provinces') {
      const caviteKeywords = ['cavite', 'dasmarinas', 'silang', 'imus', 'bacoor', 'trias', 'tagaytay', 'trece', 'kawit', 'noveleta', 'rosario', 'tanza', 'naic', 'maragondon', 'indang', 'carmona'];
      const manilaKeywords = ['manila', 'quezon', 'mandaluyong', 'makati', 'pasay', 'pasig', 'taguig', 'pinas', 'muntinlupa', 'paranaque', 'ncr'];
      const isCavite = caviteKeywords.some(kw => (p.location || '').toLowerCase().includes(kw));
      const isManila = manilaKeywords.some(kw => (p.location || '').toLowerCase().includes(kw));
      matchesLoc = !isCavite && !isManila;
    }

    return matchesSearch && matchesCategory && matchesLoc;
  });

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isAllPageSelected = paginatedProjects.length > 0 && paginatedProjects.every(p => selectedProjects.includes(p.id));

  const handleSelectAllPage = () => {
    if (isAllPageSelected) {
      setSelectedProjects(prev => prev.filter(id => !paginatedProjects.some(pp => pp.id === id)));
    } else {
      const pageIds = paginatedProjects.map(pp => pp.id);
      setSelectedProjects(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProjects(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-black text-black tracking-tight">PORTFOLIO MANAGER</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Manage cases and installations</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-app-purple text-white px-8 py-4 rounded-2xl font-display font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-app-purple/20 flex items-center gap-3 w-fit"
        >
          <Plus size={18} />
          Add New Project
        </button>
      </div>

      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={fetchProjects}
        project={editingProject}
      />

      <DeleteConfirmationModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        type="archive"
        title="Archive Project"
        message="Move this project to the trash? It will be hidden from your public portfolio but can be recovered from the Archive section later."
      />

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* Table Controls (Search and Pagination Banner) */}
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row gap-6 justify-between items-center bg-slate-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" 
              placeholder="Filter by title, client or location..."
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
        <div className="p-8 border-b border-slate-100 bg-slate-50/20 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Category System</label>
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:border-black focus:outline-none focus:ring-0 transition-all shadow-sm"
            >
              <option value="All">All Categories</option>
              <option value="Residential">Residential Systems</option>
              <option value="Commercial">Commercial Systems</option>
              <option value="Hybrid">Hybrid Inverters</option>
              <option value="Grid-Tie">Grid-Tie Inverters</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Installation Region</label>
            <select
              value={filterLocation}
              onChange={(e) => { setFilterLocation(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:border-black focus:outline-none focus:ring-0 transition-all shadow-sm"
            >
              <option value="All">All Locations</option>
              <option value="Cavite">Cavite Area</option>
              <option value="Metro Manila">Metro Manila</option>
              <option value="Other Provinces">Other Provinces</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Controls Toolbar */}
        {selectedProjects.length > 0 && (
          <div className="bg-purple-50/50 border-b border-slate-100 px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-app-purple animate-pulse rounded-full shrink-0"></span>
              <span className="text-xs font-extrabold text-slate-800 tracking-tight">
                {selectedProjects.length} {selectedProjects.length === 1 ? 'Project' : 'Projects'} Selected
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedProjects([])}
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
                Delete All {projects.length} Projects
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p className="text-xs font-bold uppercase tracking-widest">Loading Projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-center">
              <Inbox size={48} className="text-slate-200 mb-4" />
              <p className="text-sm font-black text-black uppercase tracking-widest">No projects found</p>
              <p className="text-xs mt-1">Try relaxing your search terms or filters.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="w-12 pl-8 py-4 text-left" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isAllPageSelected}
                      onChange={handleSelectAllPage}
                      className="w-4 h-4 rounded border-slate-300 text-app-purple focus:ring-app-purple/30 cursor-pointer accent-purple-600"
                      title={isAllPageSelected ? "Deselect page" : "Select page records"}
                    />
                  </th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Project / Client</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Location</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Size / Inverter</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Date</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedProjects.map((project) => (
                  <tr 
                    key={project.id} 
                    className={`hover:bg-slate-50/50 transition-colors group ${selectedProjects.includes(project.id) ? 'bg-purple-50/20' : ''}`}
                  >
                    <td className="w-12 pl-8 py-6" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedProjects.includes(project.id)}
                        onChange={(e) => handleToggleSelect(project.id, e as any)}
                        className="w-4 h-4 rounded border-slate-300 text-app-purple focus:ring-app-purple/30 cursor-pointer accent-purple-600"
                      />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-black group-hover:text-app-purple transition-colors truncate max-w-xs">{project.title}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-xs">{project.client_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg max-w-[150px] inline-block truncate">
                        {project.location}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-app-purple shrink-0"></div>
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{project.system_size}</span>
                        </div>
                        {project.inverter_type && (
                          <span className="text-[9px] text-slate-400 font-bold ml-4 uppercase tracking-wider">{project.inverter_type}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-medium text-slate-400">{new Date(project.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <button 
                          onClick={() => handleEdit(project)}
                          className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" 
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <Link 
                          to={`/admin/dashboard/portfolio/${project.id}/preview`}
                          className="p-2 text-slate-300 hover:text-app-purple hover:bg-app-purple/10 rounded-lg transition-all" 
                          title="Preview Page"
                        >
                          <Eye size={16} />
                        </Link>
                        <a 
                          href={`/portfolio/${project.id}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2 text-slate-300 hover:text-black hover:bg-slate-50 rounded-lg transition-all" 
                          title="View Live Public Page"
                        >
                          <ExternalLink size={16} />
                        </a>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToDelete(project.id);
                          }}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" 
                          title="Move to Trash"
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
        
        {/* Table Footer */}
        <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Total Active Projects: {filteredProjects.length}
            </p>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={!!bulkActionType}
        onClose={() => setBulkActionType(null)}
        onConfirm={handleBulkDelete}
        isDeleting={isBulkProcessing}
        type="archive"
        title={bulkActionType === 'all' ? "ARCHIVE ALL PROJECTS" : "Archive Selected Projects"}
        message={bulkActionType === 'all' 
          ? `WARNING: You are about to archive EVERY SINGLE project (${projects.length} total) in the entire system. They will be archived and hidden from the public portfolio. Are you sure you want to continue?` 
          : `Are you sure you want to archive the ${selectedProjects.length} selected project records? They will be hidden from the public portfolio.`
        }
      />
    </div>
  );
}
