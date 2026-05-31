import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Calendar, 
  User, 
  Clock, 
  Share2, 
  Facebook, 
  MessageCircle, 
  ArrowRight, 
  ChevronRight,
  Search,
  Mail,
  TrendingUp,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { supabase, BlogPost, isSupabaseConfigured } from '../lib/supabase';
import DOMPurify from 'dompurify';

export default function BlogPostPage() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [trending, setTrending] = useState<BlogPost[]>([]);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
    fetchTrending();
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

      // Increment views
      await supabase.rpc('increment_blog_views', { post_id: id });

      if (data) {
        fetchRelated(data.id, data.category);
      }
    } catch (err) {
      console.error('Error fetching blog post:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_deleted', false)
        .order('views', { ascending: false })
        .limit(3);
      
      setTrending(data || []);
    } catch (err) {
      console.error('Error fetching trending posts:', err);
    }
  };

  const fetchRelated = async (currentId: string, category: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_deleted', false)
        .neq('id', currentId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        // Prioritize same category, then fallback to other categories to fill 3 elements
        const sameCategory = data.filter(p => p.category === category);
        const diffCategory = data.filter(p => p.category !== category);
        const sortedRelated = [...sameCategory, ...diffCategory].slice(0, 3);
        setRelated(sortedRelated);
      }
    } catch (err) {
      console.error('Error fetching related posts:', err);
    }
  };

  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    
    setSubscribing(true);
    try {
      const { error } = await supabase
        .from('subscribers')
        .insert({ 
          email: email.trim().toLowerCase(), 
          source: 'Blog Detail Sidebar' 
        });
      
      if (error) {
        if (error.code === '23505') {
          // Unique violation
          setSubscribed(true);
          return;
        }
        throw error;
      }
      setSubscribed(true);
    } catch (err) {
      console.error('Newsletter error:', err);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-4" size={64} />
        <h2 className="text-2xl font-display font-black uppercase tracking-[0.2em]">Gathering Solar Intelligence...</h2>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex flex-col items-center justify-center text-slate-400">
        <h2 className="text-2xl font-display font-black uppercase tracking-[0.2em] mb-4">Article Not Found</h2>
        <Link to="/blog" className="text-black font-bold uppercase tracking-widest hover:underline">Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      {/* Breadcrumb & Article Header */}
      <div className="container mx-auto px-6 mb-12">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/blog" className="hover:text-black transition-colors">Blog</Link>
          <ChevronRight size={12} />
          <span className="text-black truncate max-w-[200px] md:max-w-none">{post.title}</span>
        </nav>

        <div className="max-w-4xl">
          <span className="bg-app-purple/20 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
            {post.category}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-black leading-[1.1] mb-6 tracking-tight uppercase">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
            <span className="text-app-purple">|</span>
            <span>LAS Media Team</span>
            <span className="text-app-purple">|</span>
            <span>{post.read_time}</span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-16">
          
          {/* Main Content Body */}
          <article className="overflow-hidden">
            <div className="rounded-[3rem] overflow-hidden mb-12 shadow-2xl relative aspect-[4/3] sm:aspect-video lg:aspect-[16/10] xl:aspect-[16/9] max-h-[700px] xl:max-h-[800px]">
              <img 
                src={post.image_url} 
                alt={post.title} 
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div 
              className="rich-text-content"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
            />

            {/* Social Share Bar */}
            <div className="mt-16 pt-8 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-black">Share this Insight</span>
              <div className="flex gap-4">
                <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-black hover:bg-black hover:text-white transition-all">
                  <Facebook size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-black hover:bg-black hover:text-white transition-all">
                  <MessageCircle size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-black hover:bg-black hover:text-white transition-all">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-12">
            {/* Author Profile */}
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-slate-200 border-2 border-app-purple flex items-center justify-center text-slate-500 shrink-0 select-none">
                  <User size={24} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-display font-black text-black">LAS Media Team</h4>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Content & Media Specialist</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed italic">
                The creative team behind Las Solar, dedicated to crafting clear, insightful, and accessible clean energy guides for every Caviteño household.
              </p>
            </div>

            {/* Sticky CTA Widget */}
            <div className="space-y-12">
              <div className="bg-black p-8 rounded-[2rem] shadow-xl relative overflow-hidden text-white">
                <div className="relative z-10">
                  <h4 className="text-2xl font-display font-black mb-4 leading-tight text-white">Ready to <span className="text-app-purple">save?</span></h4>
                  <p className="text-white/70 text-sm mb-6 leading-relaxed font-light">
                    Join the solar revolution. Get a custom energy roadmap for your home or business today.
                  </p>
                  <Link 
                    to="/request-quote" 
                    className="w-full bg-app-purple text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all group"
                  >
                    Get a Free Quote <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              </div>

              {/* Solar Trending */}
              <div className="pt-8">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-black mb-6 border-b border-app-purple pb-2 w-fit">Solar Trending</h4>
                <div className="space-y-6">
                  {trending.map((item, i) => (
                    <Link key={item.id} to={`/blog/${item.id}`} className="group flex gap-4 items-center">
                      <span className="text-2xl font-display font-black text-slate-100 group-hover:text-app-purple transition-colors">{i + 1}</span>
                      <p className="text-sm font-bold text-black leading-snug group-hover:text-black/70 transition-colors line-clamp-2">
                        {item.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newsletter Contextual Widget */}
              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                <h4 className="text-black font-display font-black text-lg mb-2">Join the Future</h4>
                <p className="text-xs text-slate-500 mb-6 font-light">Get early access to solar guides and rebate news in Cavite.</p>
                {subscribed ? (
                  <div className="bg-green-50 p-4 rounded-xl text-black text-xs font-bold text-center border border-green-100">
                    <CheckCircle2 size={24} className="mx-auto mb-2" />
                    You're on the list!
                  </div>
                ) : (
                  <form className="space-y-3" onSubmit={handleNewsletterSubmit}>
                    <input 
                      name="email"
                      type="email" 
                      placeholder="your@email.com" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:border-black focus:outline-none transition-all placeholder:text-slate-300"
                      required
                    />
                    <button 
                      disabled={subscribing}
                      className="w-full bg-black text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                      {subscribing ? <Loader2 className="animate-spin" size={14} /> : <>Enlighten Me <Mail size={14} /></>}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Related Articles Section */}
      {related.length > 0 && (
        <section className="border-t border-slate-100 mt-24 pt-20">
          <div className="container mx-auto px-6">
            <span className="text-app-purple font-bold uppercase tracking-widest text-[10px] mb-4 block">Recommended Insights</span>
            <h3 className="text-3xl md:text-4xl text-black uppercase font-black tracking-tight leading-tight mb-12">Related Articles</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.map((article, idx) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="group flex flex-col bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300"
                >
                  <Link to={`/blog/${article.id}`} className="block aspect-[16/10] overflow-hidden relative">
                    <img 
                      src={article.image_url} 
                      alt={article.title} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/95 backdrop-blur-sm text-black px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                        {article.category}
                      </span>
                    </div>
                  </Link>
                  
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                        <span>{new Date(article.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{article.read_time}</span>
                      </div>
                      <Link to={`/blog/${article.id}`}>
                        <h4 className="text-lg font-black text-black leading-snug uppercase tracking-tight group-hover:text-app-purple transition-colors line-clamp-2 mb-6">
                          {article.title}
                        </h4>
                      </Link>
                    </div>
                    
                    <Link 
                      to={`/blog/${article.id}`} 
                      className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-black group-hover:text-app-purple transition-colors"
                    >
                      Read Insight <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
