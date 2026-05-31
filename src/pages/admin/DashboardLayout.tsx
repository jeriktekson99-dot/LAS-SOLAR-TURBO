import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { 
  BarChart3, 
  FolderKanban, 
  PenTool, 
  Inbox, 
  Users, 
  Trash2, 
  LogOut,
  ChevronRight,
  Search,
  Bell,
  Menu,
  X,
  User,
  Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../../lib/supabase';
import logoImage from '../../assets/images/regenerated_image_1779165557603.png';
import CalendarSchedulerModal from '../../components/admin/CalendarSchedulerModal';

const navItems = [
  { icon: BarChart3, label: 'Overview', path: '/admin/dashboard/overview' },
  { icon: FolderKanban, label: 'Portfolio Manager', path: '/admin/dashboard/portfolio' },
  { icon: PenTool, label: 'Blog Manager', path: '/admin/dashboard/blog' },
  { icon: Inbox, label: 'Inquiries / Leads', path: '/admin/dashboard/leads' },
  { icon: Users, label: 'Subscribers', path: '/admin/dashboard/subscribers' },
  { icon: Trash2, label: 'Archive / Trash', path: '/admin/dashboard/archive' },
];

export default function AdminDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [allBlogs, setAllBlogs] = useState<any[]>([]);

  // Notification state
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [newLeads, setNewLeads] = useState<any[]>([]);
  const [totalNewCount, setTotalNewCount] = useState(0);

  // Calendar state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setLeads(data);
      }
    } catch (err) {
      console.error('Error fetching leads for scheduling:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setAllProjects(data);
      }
    } catch (err) {
      console.error('Error fetching projects for search:', err);
    }
  };

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (!error && data) {
        setAllBlogs(data);
      }
    } catch (err) {
      console.error('Error fetching blogs for search:', err);
    }
  };

  const fetchNewLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, name, email, created_at, status, property_type')
        .eq('status', 'New')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (!error && data) {
        setNewLeads(data);
      }

      const lastOpened = localStorage.getItem('admin_bell_last_opened');
      let query = supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'New');

      if (lastOpened) {
        query = query.gt('created_at', lastOpened);
      }

      const { count, error: countError } = await query;
      
      if (!countError) {
        setTotalNewCount(count || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
      } else {
        setUser(session.user);
      }
    };
    checkAuth();
    fetchNewLeads();
    fetchLeads();
    fetchProjects();
    fetchBlogs();

    // Poll every 15s to check for incoming client submissions dynamically
    const interval = setInterval(() => {
      fetchNewLeads();
      fetchLeads();
      fetchProjects();
      fetchBlogs();
    }, 15000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  // Client-side search filters
  const normalizedQuery = searchQuery.trim().toLowerCase();
  
  const searchedLeads = normalizedQuery
    ? leads.filter(lead => 
        (lead.name || '').toLowerCase().includes(normalizedQuery) ||
        (lead.email || '').toLowerCase().includes(normalizedQuery) ||
        (lead.phone || '').toLowerCase().includes(normalizedQuery) ||
        (lead.address || '').toLowerCase().includes(normalizedQuery) ||
        (lead.property_type || '').toLowerCase().includes(normalizedQuery)
      )
    : [];

  const searchedProjects = normalizedQuery
    ? allProjects.filter(project => 
        (project.title || '').toLowerCase().includes(normalizedQuery) ||
        (project.client_name || '').toLowerCase().includes(normalizedQuery) ||
        (project.location || '').toLowerCase().includes(normalizedQuery) ||
        (project.system_size || '').toLowerCase().includes(normalizedQuery) ||
        (project.panel_specs || '').toLowerCase().includes(normalizedQuery) ||
        (project.inverter_type || '').toLowerCase().includes(normalizedQuery)
      )
    : [];

  const searchedBlogs = normalizedQuery
    ? allBlogs.filter(post => 
        (post.title || '').toLowerCase().includes(normalizedQuery) ||
        (post.author_name || '').toLowerCase().includes(normalizedQuery) ||
        (post.category || '').toLowerCase().includes(normalizedQuery) ||
        (post.content || '').toLowerCase().includes(normalizedQuery)
      )
    : [];

  const totalResultsCount = searchedLeads.length + searchedProjects.length + searchedBlogs.length;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/10 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 w-80 bg-white border-r border-slate-200 z-50 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-full flex flex-col p-8">
          {/* Logo / Brand Header */}
          <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-5">
            <Link to="/admin/dashboard/overview" className="flex items-center gap-3.5 group" onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}>
              <div className="p-2.5 bg-slate-50/80 rounded-2xl group-hover:bg-slate-100/80 transition-all duration-300 shrink-0 shadow-sm">
                <User className="h-6 w-6 text-app-purple" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-display font-black uppercase tracking-wider text-black leading-none select-none">
                  LAS Personnel
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-app-purple leading-none mt-1 select-none">
                  Control Panel
                </span>
              </div>
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl text-slate-400 transition-all active:scale-95"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                  }
                }}
                className={({ isActive }) => `
                  flex items-center justify-between p-4 rounded-2xl transition-all group
                  ${isActive 
                    ? 'bg-app-purple text-white shadow-xl shadow-app-purple/20' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-black'}
                `}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={20} />
                  <span className="text-sm font-bold uppercase tracking-widest leading-none">{item.label}</span>
                </div>
                <ChevronRight 
                  size={16} 
                  className={`opacity-0 group-hover:opacity-100 transition-all ${isSidebarOpen ? '' : 'hidden'}`} 
                />
              </NavLink>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="pt-8 border-t border-slate-100">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all group"
            >
              <LogOut size={20} />
              <span className="text-sm font-bold uppercase tracking-widest leading-none">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between gap-8 shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 lg:hidden transition-all active:scale-95 border border-slate-100"
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </button>
            <div className="relative flex-1" id="global-dashboard-search-container">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search resources, leads, or articles..."
                className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:border-black focus:outline-none transition-all font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-black uppercase tracking-wider transition-colors"
                >
                  Clear
                </button>
              )}

              {/* Search Results Dropdown Panel */}
              <AnimatePresence>
                {isSearchFocused && searchQuery.trim() !== '' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsSearchFocused(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.98 }}
                      className="absolute left-0 mt-3 w-full bg-white rounded-3xl border border-slate-200 shadow-2xl z-50 overflow-hidden max-h-[480px] flex flex-col"
                    >
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search Results for "{searchQuery}"</span>
                        <span className="text-[9px] font-black text-app-purple uppercase tracking-wider">
                          {totalResultsCount} Matches
                        </span>
                      </div>

                      <div className="overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
                        {/* Leads matches */}
                        {searchedLeads.length > 0 && (
                          <div className="p-2 space-y-1.5">
                            <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2 select-none">Leads & Inquiries</h5>
                            <div className="space-y-1">
                              {searchedLeads.map(lead => (
                                <button
                                  key={lead.id}
                                  onClick={() => {
                                    setSearchQuery('');
                                    setIsSearchFocused(false);
                                    navigate(`/admin/dashboard/leads/${lead.id}`);
                                  }}
                                  className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-black group-hover:text-app-purple transition-colors truncate">{lead.name}</p>
                                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{lead.email} | {lead.phone}</p>
                                  </div>
                                  <span className={`text-[8px] font-bold uppercase border px-2 py-0.5 rounded leading-none shrink-0 ${
                                    lead.status === 'New' ? 'bg-indigo-50 text-indigo-700 border-indigo-100 animate-pulse' :
                                    lead.status === 'Contacted' ? 'bg-cyan-50 text-cyan-700 border-cyan-100' :
                                    lead.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                    'bg-slate-50 text-slate-700 border-slate-100'
                                  }`}>
                                    {lead.status}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Projects matches */}
                        {searchedProjects.length > 0 && (
                          <div className="p-2 space-y-1.5">
                            <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2 select-none">Portfolio Projects</h5>
                            <div className="space-y-1">
                              {searchedProjects.map(project => (
                                <button
                                  key={project.id}
                                  onClick={() => {
                                    setSearchQuery('');
                                    setIsSearchFocused(false);
                                    navigate(`/admin/dashboard/portfolio/${project.id}/preview`);
                                  }}
                                  className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-black group-hover:text-app-purple transition-colors truncate">{project.title}</p>
                                    <p className="text-[10px] text-slate-400 truncate mt-0.5">Client: {project.client_name} | Location: {project.location}</p>
                                  </div>
                                  <span className="text-[8px] font-black uppercase bg-slate-900 text-white px-2 py-0.5 rounded leading-none shrink-0">
                                    {project.system_size || 'N/A'}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Article matches */}
                        {searchedBlogs.length > 0 && (
                          <div className="p-2 space-y-1.5">
                            <h5 className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2 select-none">Blog Articles</h5>
                            <div className="space-y-1">
                              {searchedBlogs.map(post => (
                                <button
                                  key={post.id}
                                  onClick={() => {
                                    setSearchQuery('');
                                    setIsSearchFocused(false);
                                    navigate(`/admin/dashboard/blog/${post.id}/preview`);
                                  }}
                                  className="w-full text-left p-3 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-between group cursor-pointer"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-black group-hover:text-app-purple transition-colors truncate">{post.title}</p>
                                    <p className="text-[10px] text-slate-400 truncate mt-0.5">Author: {post.author_name} | Category: {post.category}</p>
                                  </div>
                                  <span className="text-[8px] font-bold uppercase bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded leading-none shrink-0">
                                    Article
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* No matches found */}
                        {searchedLeads.length === 0 && searchedProjects.length === 0 && searchedBlogs.length === 0 && (
                          <div className="py-12 text-center text-slate-400 select-none">
                            <Search size={22} className="mx-auto mb-2 text-slate-200" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">No matching records found</p>
                            <span className="text-[8px] mt-0.5 block px-4">Try searching names, addresses, emails, cellphones, article titles or project specs.</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => {
                  const nextState = !isBellOpen;
                  setIsBellOpen(nextState);
                  if (nextState) {
                    localStorage.setItem('admin_bell_last_opened', new Date().toISOString());
                    setTotalNewCount(0);
                  }
                }}
                className="relative p-2.5 text-slate-400 hover:text-black hover:bg-slate-50 rounded-xl transition-all"
                title={`${totalNewCount} unaddressed inquiries`}
              >
                <Bell size={20} />
                {totalNewCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-app-purple text-white text-[8px] font-black rounded-full border border-white flex items-center justify-center animate-pulse">
                    {totalNewCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              <AnimatePresence>
                {isBellOpen && (
                  <>
                    {/* Invisible click-away overlay overlay */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsBellOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 15, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-white rounded-[2rem] border border-slate-100 shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-app-purple animate-pulse"></span>
                          <h4 className="text-xs font-black uppercase tracking-wider text-black">New Inquiries</h4>
                        </div>
                        <span className="text-[9px] bg-app-purple/10 text-app-purple font-black uppercase px-2.5 py-1 rounded-full">{totalNewCount} New</span>
                      </div>

                      <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
                        {newLeads.map((lead) => (
                          <div 
                            key={lead.id} 
                            onClick={() => {
                              setIsBellOpen(false);
                              navigate(`/admin/dashboard/leads/${lead.id}`);
                            }}
                            className="p-4 hover:bg-slate-50/80 cursor-pointer transition-colors text-left"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-black text-black truncate mr-2 block text-left">{lead.name}</span>
                              <span className="text-[8px] font-black uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 flex-shrink-0">{lead.property_type}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium truncate mb-1.5">{lead.email}</p>
                            <span className="text-[8px] text-slate-400 font-bold block">{new Date(lead.created_at).toLocaleDateString()}</span>
                          </div>
                        ))}

                        {newLeads.length === 0 && (
                          <div className="py-12 p-6 text-center text-slate-400">
                            <Bell size={24} className="mx-auto mb-2 text-slate-200" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Zero Unaddressed Inquiries</p>
                            <p className="text-[8px] mt-1">All lead sheets have been contacted or progressed.</p>
                          </div>
                        )}
                      </div>

                      <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
                        <Link 
                          to="/admin/dashboard/leads" 
                          onClick={() => setIsBellOpen(false)}
                          className="text-[9px] font-black uppercase tracking-widest text-app-purple hover:text-black transition-colors animate-fade-in"
                        >
                          Manage All Inquiries &rarr;
                        </Link>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Calendar Button */}
            <button
              onClick={() => setIsCalendarOpen(true)}
              className="p-2.5 text-slate-400 hover:text-black hover:bg-slate-50 rounded-xl transition-all relative"
              title="Personnel Meeting & Ocular Schedules"
              id="admin-header-calendar-btn"
            >
              <Calendar size={20} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Calendar Deck Scheduler Modal */}
      <CalendarSchedulerModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        leads={leads}
        onStatusUpdated={fetchLeads}
      />
    </div>
  );
}
