import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  MapPin, 
  User, 
  Calendar, 
  Zap, 
  Settings, 
  ShieldCheck, 
  ArrowRight, 
  Mail, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { supabase, Project, isSupabaseConfigured } from '../lib/supabase';
import DOMPurify from 'dompurify';

// Mock technical partners logos (static for now)
const PARTNERS = [
  { name: 'JinkoSolar', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Jinko_Solar_logo.svg' },
  { name: 'SMA', logo: 'https://www.sma.de/typo3conf/ext/sma_site/Resources/Public/Images/sma-logo.svg' }
];

export default function ProjectDetail() {
  const { id } = useParams();
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
      setActiveImage(data.image_url);
    } catch (err) {
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-4" size={64} />
        <h2 className="text-2xl font-display font-black uppercase tracking-[0.2em]">Authenticating Project Data...</h2>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center text-slate-400">
        <h2 className="text-2xl font-display font-black uppercase tracking-[0.2em] mb-4">Project Not Found</h2>
        <Link to="/portfolio" className="text-black font-bold uppercase tracking-widest hover:underline">Back to Portfolio</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-24 pb-20 font-sans">
      {/* Project Header & Details */}
      <div className="container mx-auto px-6 mb-16">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-12">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/portfolio" className="hover:text-black transition-colors">Portfolio</Link>
          <ChevronRight size={12} />
          <span className="text-black truncate max-w-[200px] md:max-w-none">{project.title}</span>
        </nav>

        <div className="max-w-5xl mb-16">
          <h1 className="text-4xl md:text-6xl font-display font-black text-black leading-tight mb-12 tracking-tighter">
            {project.title}
          </h1>

          {/* Key Project Data Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 border-t border-slate-100 pt-12">
            <div className="flex items-start gap-4">
              <div className="bg-black/5 p-3 rounded-2xl">
                <Settings className="text-black" size={24} />
              </div>
              <div>
                <h4 className="text-black font-display font-black text-sm uppercase tracking-wider mb-1">Client Name</h4>
                <p className="text-slate-500 font-medium">{project.client_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-black/5 p-3 rounded-2xl">
                <MapPin className="text-black" size={24} />
              </div>
              <div>
                <h4 className="text-black font-display font-black text-sm uppercase tracking-wider mb-1">Location</h4>
                <p className="text-slate-500 font-medium">{project.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-black/5 p-3 rounded-2xl">
                <Zap className="text-black" size={24} />
              </div>
              <div>
                <h4 className="text-black font-display font-black text-sm uppercase tracking-wider mb-1">System Size</h4>
                <p className="text-slate-500 font-medium">{project.system_size}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-black/5 p-3 rounded-2xl">
                <ShieldCheck className="text-black" size={24} />
              </div>
              <div>
                <h4 className="text-black font-display font-black text-sm uppercase tracking-wider mb-1">Panel Specs</h4>
                <p className="text-slate-500 font-medium">{project.panel_specs}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-black/5 p-3 rounded-2xl">
                <Settings className="text-black" size={24} />
              </div>
              <div>
                <h4 className="text-black font-display font-black text-sm uppercase tracking-wider mb-1">Inverter Type</h4>
                <p className="text-slate-500 font-medium">{project.inverter_type}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-app-purple/20 p-3 rounded-2xl">
                <Zap className="text-black" size={24} />
              </div>
              <div>
                <h4 className="text-black font-display font-black text-sm uppercase tracking-wider mb-1">Estimated Savings</h4>
                <p className="text-white font-black text-lg bg-app-purple px-2 py-0.5 rounded">{project.estimated_savings}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Content */}
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-20">
          
          {/* Main Media & Text Column */}
          <div className="space-y-16 overflow-hidden">
            <div className="space-y-8">
              <div className="rounded-[3rem] overflow-hidden shadow-2xl relative aspect-[4/3] sm:aspect-video lg:aspect-[16/10] xl:aspect-[16/9] max-h-[750px] xl:max-h-[850px]">
                <img 
                  src={activeImage || project.image_url} 
                  alt={project.title} 
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-500" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {[project.image_url, ...(project.thumbnails || [])].filter(Boolean).map((thumb, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveImage(thumb)}
                    className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${activeImage === thumb ? 'border-app-purple scale-95' : 'border-transparent hover:border-black'}`}
                  >
                    <img src={thumb} alt="Gallery" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            </div>

            <section className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-display font-black text-black tracking-tight">
                Case Study Overview
              </h2>
              <div 
                className="rich-text-content"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.overview_content) }}
              />
            </section>

            <section className="space-y-6">
              <h3 className="text-2xl md:text-3xl font-display font-black text-black tracking-tight">
                Technical Execution
              </h3>
              <div 
                className="rich-text-content px-8 py-4 bg-slate-50/50 rounded-[2rem]"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.technical_content) }}
              />
            </section>
          </div>

          {/* Sidebar Column */}
          <aside className="space-y-12">
            {/* Personnel Widget */}
            <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-black mb-8 pb-4 border-b border-app-purple/30">Project Personnel</h4>
              <div className="space-y-8">
                {/* Dynamic Personnel List */}
                {(() => {
                  const members = project.personnel?.members;
                  if (Array.isArray(members) && members.length > 0) {
                    return members.map((member: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-slate-200 border-2 border-app-purple flex items-center justify-center text-slate-500 shrink-0 select-none">
                          <User size={24} className="stroke-[2.5]" />
                        </div>
                        <div>
                          <h5 className="text-black font-display font-black text-sm">{member.name}</h5>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{member.title || 'Team Member'}</p>
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
                      <p className="text-xs text-slate-400 font-medium italic">No personnel listed for this project.</p>
                    );
                  }

                  return legacyList.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-slate-200 border-2 border-app-purple flex items-center justify-center text-slate-500 shrink-0 select-none">
                        <User size={24} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <h5 className="text-black font-display font-black text-sm">{member.name}</h5>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{member.title}</p>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Lead Form Sidebar */}
            <div className="p-10 rounded-[2.5rem] bg-black text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[320px]">
              <div className="relative z-10 space-y-4">
                <h4 className="text-2xl font-display font-black mb-3 text-white uppercase tracking-tight">Interested in a Similar Setup?</h4>
                <p className="text-white/70 text-sm font-light leading-relaxed">
                  Start your journey to energy independence today. Calculate your potential savings and get custom pricing designed precisely for your property.
                </p>
              </div>
              <div className="relative z-10 pt-6">
                <Link
                  to="/request-quote"
                  className="w-full bg-app-purple hover:bg-app-purple/90 text-white py-4.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-lg flex items-center justify-center gap-2 hover:translate-y-[-1px] active:translate-y-0"
                >
                  <span>Request a Quote</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
