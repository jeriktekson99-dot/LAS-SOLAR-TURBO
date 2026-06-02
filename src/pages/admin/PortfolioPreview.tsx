import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  MapPin, 
  User, 
  Calendar, 
  Zap, 
  Settings, 
  ShieldCheck, 
  ArrowLeft, 
  Edit2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  Info
} from 'lucide-react';
import { supabase, Project, isSupabaseConfigured } from '../../lib/supabase';
import DOMPurify from 'dompurify';

export default function AdminPortfolioPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    if (!id || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProject(data);
      if (data) {
        setActiveImage(data.image_url);
      }
    } catch (err) {
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-4 text-app-purple" size={48} />
        <h2 className="text-sm font-black uppercase tracking-[0.2em]">Assembling Project Canvas...</h2>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <h2 className="text-xl font-display font-black uppercase tracking-[0.2em] mb-4">Project Not Found</h2>
        <button 
          onClick={() => navigate('/admin/dashboard/portfolio')}
          className="bg-black text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-app-purple transition-colors"
        >
          Return to Portfolio Manager
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Admin Action Bar */}
      <div className="bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/dashboard/portfolio')}
            className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all flex items-center justify-center border border-white/10"
            title="Back to List"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              <p className="text-[10px] uppercase font-black tracking-widest text-green-400">PREVIEW MODE</p>
            </div>
            <h2 className="text-sm font-bold text-slate-300">Viewing: {project.title}</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs font-medium bg-white/5 px-4 py-2.5 rounded-xl border border-white/5 mr-2">
            <Info size={14} className="text-app-purple" />
            <span>This is how this case study looks publicly on your website.</span>
          </div>
          <button 
            onClick={() => {
              // Direct navigation or action to open edit modal can be styled.
              // To make editing easier, let's navigate back to list and trigger edit if possible, 
              // or tell the user how which project it is. For now, they can return to edit it directly.
              navigate('/admin/dashboard/portfolio');
            }}
            className="flex-1 sm:flex-none bg-app-purple hover:bg-white hover:text-black text-white px-6 py-3.5 rounded-xl font-display font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
          >
            <Edit2 size={12} />
            Back to edit
          </button>
        </div>
      </div>

      {/* Actual Live Render Panel */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 px-8 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 select-none ml-2">https://lassolarsetup.com/portfolio/{project.id}</span>
        </div>

        {/* Public Project Page Layout Refinement inside standard preview frame */}
        <div className="bg-white min-h-[500px] pt-12 pb-20 font-sans px-8 sm:px-12 md:px-16">
          
          {/* Breadcrumb & Title */}
          <div className="max-w-5xl mb-12">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
              <span>Home</span>
              <ChevronRight size={10} />
              <span>Portfolio</span>
              <ChevronRight size={10} />
              <span className="text-black truncate">{project.title}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-black leading-tight tracking-tight uppercase">
              {project.title}
            </h1>

            {/* Key Project Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-t border-slate-100 pt-8 mt-8">
              <div className="flex items-start gap-4">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <User className="text-black" size={18} />
                </div>
                <div>
                  <h4 className="text-black font-display font-black text-[9px] uppercase tracking-wider mb-0.5">Client Name</h4>
                  <p className="text-slate-500 font-medium text-xs">{project.client_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <MapPin className="text-black" size={18} />
                </div>
                <div>
                  <h4 className="text-black font-display font-black text-[9px] uppercase tracking-wider mb-0.5">Location</h4>
                  <p className="text-slate-500 font-medium text-xs">{project.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Zap className="text-black" size={18} />
                </div>
                <div>
                  <h4 className="text-black font-display font-black text-[9px] uppercase tracking-wider mb-0.5">System Size</h4>
                  <p className="text-slate-500 font-medium text-xs">{project.system_size}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <ShieldCheck className="text-black" size={18} />
                </div>
                <div>
                  <h4 className="text-black font-display font-black text-[9px] uppercase tracking-wider mb-0.5">Panel Specs</h4>
                  <p className="text-slate-500 font-medium text-xs">{project.panel_specs}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Settings className="text-black" size={18} />
                </div>
                <div>
                  <h4 className="text-black font-display font-black text-[9px] uppercase tracking-wider mb-0.5">Inverter Type</h4>
                  <p className="text-slate-500 font-medium text-xs">{project.inverter_type}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-app-purple/10 p-2.5 rounded-xl">
                  <Zap className="text-app-purple" size={18} />
                </div>
                <div>
                  <h4 className="text-black font-display font-black text-[9px] uppercase tracking-wider mb-0.5">Estimated Savings</h4>
                  <p className="text-white font-black text-xs bg-app-purple px-1.5 py-0.5 rounded inline-block">{project.estimated_savings}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12">
            
            {/* Main Media & Text Column */}
            <div className="space-y-12 overflow-hidden">
              <div className="space-y-6">
                <div className="rounded-[2.5rem] overflow-hidden shadow-md relative aspect-video max-h-[500px] bg-slate-100">
                  <img 
                    src={activeImage || project.image_url || undefined} 
                    alt={project.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-500" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Thumbnails list */}
                {project.thumbnails && project.thumbnails.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {[project.image_url, ...project.thumbnails].filter(Boolean).map((thumb, i) => (
                      <div 
                        key={i} 
                        onClick={() => setActiveImage(thumb)}
                        className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${activeImage === thumb ? 'border-app-purple scale-95' : 'border-transparent hover:border-black'}`}
                      >
                        <img src={thumb || undefined} alt="Gallery" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Case Study Overview */}
              <section className="space-y-4">
                <h2 className="text-2xl font-display font-black text-black tracking-tight uppercase">
                  Case Study Overview
                </h2>
                <div 
                  className="rich-text-content leading-relaxed text-sm text-slate-600 space-y-4"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.overview_content) }}
                />
              </section>

              {/* Technical Execution */}
              <section className="space-y-4">
                <h3 className="text-xl font-display font-black text-black tracking-tight uppercase">
                  Technical Execution
                </h3>
                <div 
                  className="rich-text-content px-6 py-5 bg-slate-50/70 rounded-3xl text-sm leading-relaxed text-slate-600 space-y-4 border border-slate-100"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.technical_content) }}
                />
              </section>
            </div>

            {/* Sidebar Column */}
            <aside className="space-y-8">
              {/* Personnel Widget */}
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black mb-6 pb-2 border-b border-app-purple/10">Project Personnel</h4>
                <div className="space-y-6">
                  {/* Dynamic Personnel List */}
                  {(() => {
                    const members = project.personnel?.members;
                    if (Array.isArray(members) && members.length > 0) {
                      return members.map((member: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-app-purple flex items-center justify-center text-slate-500 shrink-0 select-none">
                            <User size={18} className="stroke-[2.5]" />
                          </div>
                          <div>
                            <h5 className="text-black font-display font-black text-xs leading-tight">{member.name}</h5>
                            <p className="text-[8px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">{member.title || 'Team Member'}</p>
                          </div>
                        </div>
                      ));
                    }

                    // Fallback to legacy structure
                    const legacyList = [];
                    if (project.personnel?.engineer?.name) {
                      legacyList.push({ name: project.personnel.engineer.name, title: project.personnel.engineer.title || 'Systems Engineer' });
                    }
                    if (project.personnel?.installer?.name) {
                      legacyList.push({ name: project.personnel.installer.name, title: project.personnel.installer.title || 'Master Installer' });
                    }

                    if (legacyList.length === 0) {
                      return (
                        <p className="text-[10px] text-slate-400 font-medium italic">No personnel listed for this project.</p>
                      );
                    }

                    return legacyList.map((member, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-app-purple flex items-center justify-center text-slate-500 shrink-0 select-none">
                          <User size={18} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h5 className="text-black font-display font-black text-xs leading-tight">{member.name}</h5>
                          <p className="text-[8px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">{member.title}</p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Lead Form Sidebar (Redirection Link Preview) */}
              <div className="p-8 rounded-[2rem] bg-black text-white relative overflow-hidden shadow-md flex flex-col justify-between min-h-[280px]">
                <div className="relative z-10 space-y-3">
                  <h4 className="text-lg font-display font-black leading-tight text-white uppercase tracking-tight">Interested in a Similar Setup?</h4>
                  <p className="text-white/70 text-xs font-light leading-relaxed">
                    Start your journey to energy independence today. Calculate your potential savings and get custom pricing designed precisely for your property.
                  </p>
                </div>
                <div className="relative z-10 pt-4">
                  <Link
                    to="/request-quote"
                    className="w-full bg-app-purple hover:bg-app-purple/90 text-white py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Request a Quote</span>
                     <span className="text-[9px] text-white/50 font-normal tracking-normal">(Leads page)</span>
                  </Link>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-xl pointer-events-none"></div>
              </div>
            </aside>

          </div>

        </div>
      </div>
    </div>
  );
}
