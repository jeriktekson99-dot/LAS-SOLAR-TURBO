import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import PageHero from '../components/common/PageHero';
import { Search, ArrowRight, ChevronLeft, ChevronRight, Loader2, Calendar, Clock } from 'lucide-react';
import CTASection from '../components/common/CTASection';
import { supabase, BlogPost, isSupabaseConfigured, safeDbQuery } from '../lib/supabase';

const categories = ['All', 'Educational', 'Guides', 'News', 'Tech'];

export default function Blog() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await safeDbQuery<BlogPost[]>(
        () => supabase
          .from('blog_posts')
          .select('*')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false }),
        () => supabase
          .from('blog_posts')
          .select('*')
          .order('created_at', { ascending: false })
      );

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           post.content.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesCategory = true;
      if (activeCategory !== 'All') {
        const catLower = (post.category || '').toLowerCase();
        if (activeCategory === 'Educational') {
          matchesCategory = catLower.includes('educat') || catLower.includes('school') || catLower.includes('learn') || catLower.includes('case') || catLower.includes('study');
        } else if (activeCategory === 'Guides') {
          matchesCategory = catLower.includes('guid') || catLower.includes('tutorial') || catLower.includes('how') || catLower.includes('step') || catLower.includes('maintenance');
        } else if (activeCategory === 'News') {
          matchesCategory = catLower.includes('news') || catLower.includes('update') || catLower.includes('announc') || catLower.includes('company');
        } else if (activeCategory === 'Tech') {
          matchesCategory = catLower.includes('tech') || catLower.includes('insight') || catLower.includes('solar') || catLower.includes('energy');
        } else {
          matchesCategory = post.category === activeCategory;
        }
      }
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, posts]);

  const featuredPost = filteredPosts[0];
  const regularPosts = filteredPosts.slice(1);

  const totalPages = Math.ceil(regularPosts.length / postsPerPage);
  const paginatedPosts = regularPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  return (
    <div>
      <PageHero
        title="Educational Hub"
        badge="ENERGY INTELLIGENCE"
        subtitle="Empower your transition to renewable energy with expert guides, solar breakthroughs, net-metering walkthroughs, and practical advice to cut your utility bills."
        image="https://scontent-mnl1-1.xx.fbcdn.net/v/t39.30808-6/701120058_122111396798816956_4180818921523218214_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeE6eF5OoY23FbzLwONAfygKtkRPTzgg03u2RE9POCDTewflCHSn_tE_NcUcchzdwpQk9CMol2mhumFMx2pevzjy&_nc_ohc=tJzQFB7HpTwQ7kNvwHjYbgP&_nc_oc=AdrM02ksFY0M9avxnY451iD3AQb8ybTLtWRzUMVID9VxnYhql1R3bmfNcXu333Y0UZs&_nc_zt=23&_nc_ht=scontent-mnl1-1.xx&_nc_gid=a59maUreMdVn_ZRm-iWToA&_nc_ss=7b2a8&oh=00_Af8VMnvy5RQ9CJ-i0nZP5JJpFEL2Ff9b1fO-tLGEKjHWAg&oe=6A21C683"
      />

      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="animate-spin mb-4" size={48} />
              <p className="text-xl font-display font-black uppercase tracking-widest">Waking up the local grid...</p>
            </div>
          ) : (
            <>
              {/* Featured Article */}
              {featuredPost && (
                <div className="mb-16">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onClick={() => navigate(`/blog/${featuredPost.id}`)}
                    className="relative rounded-[2.5rem] overflow-hidden bg-slate-50 border border-slate-100 flex flex-col lg:grid lg:grid-cols-12 items-stretch max-w-5xl mx-auto shadow-sm cursor-pointer hover:shadow-xl hover:border-app-purple/30 transition-all duration-500 group"
                  >
                    <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="bg-app-purple/20 text-black px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit">Featured Insight</span>
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{featuredPost.category}</span>
                      </div>
                      <h2 className="text-2xl md:text-4xl font-black text-black uppercase tracking-tight mb-6 leading-[1.1] break-words group-hover:text-app-purple transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-slate-slate/70 text-base font-light mb-8 max-w-xl leading-relaxed line-clamp-3 break-words">
                        {featuredPost.content.replace(/<[^>]*>?/gm, '').slice(0, 250)}...
                      </p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                        <div className="btn-primary px-7 py-3.5 text-[10px] tracking-widest uppercase flex items-center gap-3">
                          Read The Full Story <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="flex items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                          <span>{new Date(featuredPost.created_at).toLocaleDateString()}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-app-purple"></span>
                          <span>{featuredPost.read_time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full overflow-hidden">
                      <img 
                        src={featuredPost.image_url} 
                        alt={featuredPost.title} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 lg:opacity-100"></div>
                    </div>
                  </motion.div>
                </div>
              )}

              <div className="flex flex-col lg:flex-row gap-16">
                {/* Main Content Area */}
                <div className="lg:w-full space-y-12">
                  {/* Filters Header */}
                  <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                    <div className="relative w-full md:flex-grow">
                      <input 
                        type="text" 
                        placeholder="Search articles..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-app-purple focus:outline-none text-sm transition-all font-bold uppercase tracking-widest" 
                      />
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                      <div className="w-full md:w-64">
                        <select 
                          value={activeCategory}
                          onChange={(e) => { setActiveCategory(e.target.value); setCurrentPage(1); }}
                          className="w-full bg-white border border-slate-200 text-black py-3 px-6 rounded-xl focus:ring-2 focus:ring-app-purple focus:border-transparent outline-none appearance-none cursor-pointer font-bold uppercase tracking-widest text-[10px]"
                        >
                          {categories.map(cat => {
                            let label = cat;
                            if (cat === 'All') label = 'All Topics';
                            if (cat === 'Educational') label = 'Educational Articles';
                            if (cat === 'Guides') label = 'Guides & Tutorials';
                            if (cat === 'News') label = 'Industry News / Updates';
                            if (cat === 'Tech') label = 'Tech & Solar Insights';
                            return <option key={cat} value={cat}>{label}</option>;
                          })}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Articles Grid (3x2) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    <AnimatePresence mode="popLayout">
                      {paginatedPosts.map((post) => (
                        <motion.article
                          key={post.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4 }}
                          onClick={() => navigate(`/blog/${post.id}`)}
                          className="group flex flex-col bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-app-purple/30 transition-all duration-500 cursor-pointer"
                        >
                          <div className="aspect-[16/10] overflow-hidden relative">
                            <img 
                              src={post.image_url} 
                              alt={post.title} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                              referrerPolicy="no-referrer" 
                            />
                            <div className="absolute top-4 left-4">
                              <span className="bg-white/90 backdrop-blur-sm text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/20">
                                {post.category}
                              </span>
                            </div>
                          </div>
                          <div className="p-8 flex flex-col flex-grow">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">{new Date(post.created_at).toLocaleDateString()}</span>
                            <h3 className="text-base md:text-lg font-black text-black mb-4 group-hover:text-app-purple transition-colors leading-tight uppercase tracking-tight break-words">
                                {post.title}
                            </h3>
                            <p className="text-slate-slate/70 font-light text-sm mb-6 leading-relaxed line-clamp-3 break-words">
                                {post.content.replace(/<[^>]*>?/gm, '').slice(0, 150)}...
                            </p>
                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock size={12} className="text-app-purple" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{post.read_time}</span>
                              </div>
                              <div className="flex items-center gap-2 text-black font-bold text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                                  Read More <ArrowRight size={14} className="text-app-purple" />
                              </div>
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* No Results */}
                  {paginatedPosts.length === 0 && !featuredPost && (
                    <div className="py-20 text-center">
                      <p className="text-slate-400 text-xl font-light italic">No articles found matching your criteria.</p>
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 pt-12">
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="w-12 h-12 flex items-center justify-center rounded-xl border border-slate-200 text-black disabled:opacity-30 hover:bg-slate-50 transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      
                      <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                          <button
                            key={num}
                            onClick={() => handlePageChange(num)}
                            className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold transition-all ${
                              currentPage === num 
                                ? 'bg-app-purple text-white shadow-lg shadow-app-purple/20' 
                                : 'bg-white border border-slate-200 text-slate-400 hover:border-app-purple'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="w-12 h-12 flex items-center justify-center rounded-xl border border-slate-200 text-black disabled:opacity-30 hover:bg-slate-50 transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      
      <CTASection />
    </div>
  );
}
