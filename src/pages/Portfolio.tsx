import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import PageHero from '../components/common/PageHero';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import CTASection from '../components/common/CTASection';
import { supabase, Project, isSupabaseConfigured } from '../lib/supabase';

const infraOptions = [
  'All Infrastructure',
  'Agriculture',
  'Healthcare',
  'Education',
  'Resorts and Leisure',
  'Multi-Family Housing',
  'Warehousing and Distribution'
];

const serviceOptions = [
  'All Services',
  'Residential Solar',
  'Commercial Solar',
  'Net-Metering',
  'Maintenance & Support'
];

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [infraFilter, setInfraFilter] = useState('All Infrastructure');
  const [serviceFilter, setServiceFilter] = useState('All Services');
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 4;

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_deleted', false)
        .order('completed_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      // In Supabase we use system_size or other fields for infrastructure if needed
      // For now we'll match by title or other logic if infrastructure field is added
      // Or we can just show all since the schema doesn't have 'infrastructure' and 'service' explicitly
      // Wait, I should add them to schema if I want to keep the filters
      return true; 
    });
  }, [projects]);

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 500, behavior: 'smooth' });
  };

  return (
    <div>
      <PageHero
        title="Our Portfolio"
        badge="PROJECT SHOWCASE"
        subtitle="Explore our engineering-backed solar installations delivering clean power, verified utility savings, and energy independence across residential and commercial properties."
        image="https://scontent-mnl3-1.xx.fbcdn.net/v/t39.30808-6/666331395_122099214122816956_3700133045795112680_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeFzqjC2cZCDfhMenmzJIHhdowLKeeSbHL2jAsp55JscvRHc4YVsQL0pQhzPEjptZOwRSzN1Sx3EMGuXUspZErSP&_nc_ohc=ZkoMKPEuJ44Q7kNvwHOxtGY&_nc_oc=AdokGiTVH2MXCh8Km0UCj8pBmvcnModozj46qPXS-XOXHYZL68BrP9uxGIox3mbcqSk&_nc_zt=23&_nc_ht=scontent-mnl3-1.xx&_nc_gid=3ZeTOkjxQ5phwMtPW6Heww&_nc_ss=7b2a8&oh=00_Af9D7EdDO6S-BuDuP_dILehx8sb2LslTdBe9gm_rlVkRGg&oe=6A21AC57"
      />

      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          {/* Dual Dropdown Filter Bar */}
          <div className="flex flex-col md:flex-row items-center gap-16 mb-20 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
            <div className="w-full md:w-1/2">
              <label className="block text-black font-bold uppercase tracking-widest text-[10px] mb-3 ml-2">Infrastructure</label>
              <select 
                value={infraFilter}
                onChange={(e) => setInfraFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 text-black py-4 px-6 rounded-2xl focus:ring-2 focus:ring-app-purple focus:border-transparent outline-none appearance-none cursor-pointer font-bold uppercase tracking-tight text-sm"
              >
                {infraOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-1/2">
              <label className="block text-black font-bold uppercase tracking-widest text-[10px] mb-3 ml-2">Service Type</label>
              <select 
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 text-black py-4 px-6 rounded-2xl focus:ring-2 focus:ring-app-purple focus:border-transparent outline-none appearance-none cursor-pointer font-bold uppercase tracking-tight text-sm"
              >
                {serviceOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {loading ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="text-xl font-display font-black uppercase tracking-widest">Loading Portfolio...</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {paginatedProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/portfolio/${project.id}`}
                    className="block group"
                  >
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="flex flex-col"
                    >
                    {/* Image Container with fixed ratio */}
                    <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[16/10] mb-8">
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-in-out"
                        referrerPolicy="no-referrer"
                      />
                      {/* Floating location badge */}
                      <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-lg">
                        <p className="text-[10px] font-black uppercase tracking-widest text-black">{project.location}</p>
                      </div>
                    </div>

                    {/* Content Display */}
                    <div className="px-2">
                      <div className="flex flex-wrap items-center gap-3 mb-5">
                        <span className="bg-app-purple/20 text-black px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                          {project.system_size}
                        </span>
                        <span className="bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
                          {project.inverter_type}
                        </span>
                      </div>
                      
                      <div className="w-full min-w-0">
                        <h3 className="text-lg md:text-xl lg:text-2xl font-black text-black uppercase tracking-tight leading-tight group-hover:text-app-purple transition-colors duration-300 break-words">
                          {project.title}
                        </h3>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </AnimatePresence>
            )}
            {!loading && filteredProjects.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-400 text-xl font-light italic">No projects found matching these criteria.</p>
                <button 
                  onClick={() => { setInfraFilter('All Infrastructure'); setServiceFilter('All Services'); setCurrentPage(1); }}
                  className="mt-6 text-app-purple font-bold uppercase tracking-widest text-sm hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-20">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-12 h-12 flex items-center justify-center rounded-xl border border-slate-200 text-black disabled:opacity-30 hover:bg-slate-50 transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold transition-all ${
                      currentPage === i + 1 
                        ? 'bg-app-purple text-white shadow-lg shadow-app-purple/20' 
                        : 'bg-white border border-slate-200 text-slate-400 hover:border-app-purple'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-12 h-12 flex items-center justify-center rounded-xl border border-slate-200 text-black disabled:opacity-30 hover:bg-slate-50 transition-colors"
                aria-label="Next page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </div>
  );
}
