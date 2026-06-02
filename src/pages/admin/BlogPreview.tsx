import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Calendar, 
  User, 
  Clock, 
  ArrowLeft, 
  Edit2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Info,
  Eye,
  Heart,
  Share2
} from 'lucide-react';
import { supabase, BlogPost, isSupabaseConfigured } from '../../lib/supabase';
import DOMPurify from 'dompurify';

export default function AdminBlogPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    if (!id || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPost(data);
    } catch (err) {
      console.error('Error fetching blog post:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-4 text-app-purple" size={48} />
        <h2 className="text-sm font-black uppercase tracking-[0.2em]">Assembling article preview...</h2>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <h2 className="text-xl font-display font-black uppercase tracking-[0.2em] mb-4">Article Not Found</h2>
        <button 
          onClick={() => navigate('/admin/dashboard/blog')}
          className="bg-black text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-app-purple transition-colors"
        >
          Return to Blog Manager
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
            onClick={() => navigate('/admin/dashboard/blog')}
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
            <h2 className="text-sm font-bold text-slate-300">Viewing Article: {post.title}</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs font-medium bg-white/5 px-4 py-2.5 rounded-xl border border-white/5 mr-2">
            <Info size={14} className="text-app-purple" />
            <span>This is how this article looks publicly on your live site.</span>
          </div>
          <button 
            onClick={() => navigate('/admin/dashboard/blog')}
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
          <span className="text-[10px] font-mono text-slate-400 select-none ml-2">https://lassolarsetup.com/blog/{post.id}</span>
        </div>

        {/* Public Blog Details Render */}
        <div className="bg-white min-h-[500px] pt-12 pb-20 font-sans px-8 sm:px-12 md:px-16">
          
          <div className="max-w-4xl mx-auto mb-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
              <span>Home</span>
              <ChevronRight size={10} />
              <span>Blog</span>
              <ChevronRight size={10} />
              <span className="text-black truncate">{post.title}</span>
            </div>

            {/* Category tag */}
            <span className="bg-app-purple/10 text-app-purple px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 inline-block">
              {post.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-black text-black leading-tight tracking-tight uppercase mb-6">
              {post.title}
            </h1>

            {/* Metadata info */}
            <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-t border-slate-100 py-4">
              <span className="flex items-center gap-1"><Calendar size={12} className="text-app-purple" /> {new Date(post.created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><User size={12} className="text-app-purple" /> By LAS Media Team</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock size={12} className="text-app-purple" /> {post.read_time || '5 mins read'}</span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="max-w-4xl mx-auto rounded-[2.5rem] overflow-hidden shadow-md aspect-video max-h-[500px] bg-slate-100 mb-12">
            <img 
              src={post.image_url || undefined} 
              alt={post.title} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Article main content body */}
          <div className="max-w-3xl mx-auto">
            <div 
              className="rich-text-content leading-relaxed text-slate-600 space-y-4"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />
            
            {/* Social Share Bar mock details */}
            <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-400 text-xs font-medium">[Preview Reader Engine Live]</span>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 transition-colors">
                  <Heart size={16} />
                </button>
                <button className="flex items-center gap-1.5 text-slate-400 hover:text-app-purple transition-colors">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
