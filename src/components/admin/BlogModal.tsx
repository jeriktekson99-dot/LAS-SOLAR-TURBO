import { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader2, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import { supabase, BlogPost, uploadImage, isSupabaseConfigured } from '../../lib/supabase';
import RichTextEditor from './RichTextEditor';

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  post?: BlogPost | null;
}

export default function BlogModal({ isOpen, onClose, onSave, post }: BlogModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<BlogPost>>(() => {
    if (post) {
      return post;
    }
    return {
      title: '',
      author_name: 'Engr. L. A. Santos',
      category: 'Solar Guides',
      content: '',
      image_url: '',
      read_time: '5 min read',
    };
  });

  useEffect(() => {
    if (isOpen) {
      if (post) {
        setFormData(post);
      } else {
        setFormData({
          title: '',
          author_name: 'Engr. L. A. Santos',
          category: 'Solar Guides',
          content: '',
          image_url: '',
          read_time: '5 min read',
        });
      }
    }
  }, [isOpen, post]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: url }));
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image.');
    } finally {
      setUploading(false);
      // Reset input value so the same file can be selected/uploaded again
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        const localSt = localStorage.getItem('las_solar_blog_posts_fallback');
        let currentPosts = localSt ? JSON.parse(localSt) : [];
        if (post?.id) {
          currentPosts = currentPosts.map((p: any) => 
            p.id === post.id ? { ...p, ...formData, updated_at: new Date().toISOString() } : p
          );
        } else {
          const newPost = {
            ...formData,
            id: `local-post-${Date.now()}`,
            created_at: new Date().toISOString(),
            views: 0,
            is_deleted: false
          };
          currentPosts.unshift(newPost);
        }
        localStorage.setItem('las_solar_blog_posts_fallback', JSON.stringify(currentPosts));
        onSave();
        onClose();
        return;
      }

      if (post?.id) {
        const { error } = await supabase
          .from('blog_posts')
          .update(formData)
          .eq('id', post.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert([formData]);
        if (error) throw error;
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Error saving blog post:', err);
      alert('Failed to save article.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-display font-black text-black tracking-tight">
              {post ? 'EDIT ARTICLE' : 'CREATE NEW ARTICLE'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Engage your audience with solar insights
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Article Title</span>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-app-purple focus:outline-none transition-all text-sm font-bold"
                  placeholder="e.g. Why Solar is the Best Investment in 2024"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Category</span>
                  <div className="relative">
                    <select 
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:border-app-purple focus:outline-none transition-all text-sm font-bold bg-white appearance-none cursor-pointer"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option>Solar Guides</option>
                      <option>Tech Updates</option>
                      <option>Case Studies</option>
                      <option>Company News</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none w-4 h-4" />
                  </div>
                </label>
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Read Time</span>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-app-purple focus:outline-none transition-all text-sm font-bold"
                    placeholder="e.g. 5 min read"
                    value={formData.read_time}
                    onChange={e => setFormData({ ...formData, read_time: e.target.value })}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-4 flex flex-col justify-between">
              <label className="block w-full">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Thumbnail Image</span>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-app-purple focus:outline-none transition-all text-sm font-bold pr-10"
                      placeholder="Upload or paste image URL..."
                      value={formData.image_url}
                      onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    />
                    {formData.image_url && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg overflow-hidden border">
                        <img src={formData.image_url} className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-3 bg-slate-50 text-slate-400 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all"
                  >
                    {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                  </button>
                </div>
              </label>
              
            </div>
          </div>

          <div className="space-y-4">
            <div className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Article Content (Rich Text Editor)</span>
              <RichTextEditor 
                content={formData.content || ''} 
                onChange={(html) => setFormData({ ...formData, content: html })}
                placeholder="Write your article here..."
              />
            </div>
          </div>
        </form>

        <div className="p-8 border-t border-slate-100 flex justify-end gap-4 bg-slate-50/50">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="bg-app-purple text-white px-10 py-3 rounded-xl font-display font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-app-purple/20 flex items-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            {post ? 'Update Article' : 'Publish Article'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
