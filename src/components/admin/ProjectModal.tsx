import { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader2, Trash2, Plus, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import { supabase, Project, uploadImage, isSupabaseConfigured } from '../../lib/supabase';
import RichTextEditor from './RichTextEditor';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  project?: Project | null;
}

export default function ProjectModal({ isOpen, onClose, onSave, project }: ProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Project>>(() => {
    if (project) {
      const existingMembers = project.personnel?.members;
      let initialMembers: { name: string; title: string }[] = [];
      if (Array.isArray(existingMembers)) {
        initialMembers = [...existingMembers];
      } else {
        if (project.personnel?.engineer?.name) {
          initialMembers.push({ name: project.personnel.engineer.name, title: project.personnel.engineer.title || 'Systems Engineer' });
        }
        if (project.personnel?.installer?.name) {
          initialMembers.push({ name: project.personnel.installer.name, title: project.personnel.installer.title || 'Master Installer' });
        }
      }
      if (initialMembers.length === 0) {
        initialMembers = [{ name: '', title: '' }];
      }
      return {
        ...project,
        category: project.category || 'Residential',
        personnel: {
          ...project.personnel,
          members: initialMembers
        }
      };
    }
    return {
      title: '',
      client_name: '',
      location: '',
      system_size: '',
      panel_specs: '',
      inverter_type: '',
      estimated_savings: '',
      image_url: '',
      thumbnails: [],
      overview_content: '',
      technical_content: '',
      status: 'Completed',
      category: 'Residential',
      personnel: {
        members: [{ name: '', title: '' }]
      }
    };
  });

  useEffect(() => {
    if (isOpen) {
      if (project) {
        const existingMembers = project.personnel?.members;
        let initialMembers: { name: string; title: string }[] = [];
        if (Array.isArray(existingMembers)) {
          initialMembers = [...existingMembers];
        } else {
          if (project.personnel?.engineer?.name) {
            initialMembers.push({ name: project.personnel.engineer.name, title: project.personnel.engineer.title || 'Systems Engineer' });
          }
          if (project.personnel?.installer?.name) {
            initialMembers.push({ name: project.personnel.installer.name, title: project.personnel.installer.title || 'Master Installer' });
          }
        }
        if (initialMembers.length === 0) {
          initialMembers = [{ name: '', title: '' }];
        }
        setFormData({
          ...project,
          category: project.category || 'Residential',
          personnel: {
            ...project.personnel,
            members: initialMembers
          }
        });
      } else {
        setFormData({
          title: '',
          client_name: '',
          location: '',
          system_size: '',
          panel_specs: '',
          inverter_type: '',
          estimated_savings: '',
          image_url: '',
          thumbnails: [],
          overview_content: '',
          technical_content: '',
          status: 'Completed',
          category: 'Residential',
          personnel: {
            members: [{ name: '', title: '' }]
          }
        });
      }
    }
  }, [isOpen, project]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      
      setFormData(prev => {
        const currentImageUrl = prev.image_url;
        let newImageUrl = currentImageUrl;
        let newThumbnails = [...(prev.thumbnails || [])];

        if (!currentImageUrl && urls.length > 0) {
          newImageUrl = urls[0];
          newThumbnails = [...newThumbnails, ...urls.slice(1)];
        } else {
          newThumbnails = [...newThumbnails, ...urls];
        }

        return {
          ...prev,
          image_url: newImageUrl,
          thumbnails: newThumbnails
        };
      });
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload images.');
    } finally {
      setUploading(false);
      // Reset input value so the same file(s) can be selected/uploaded again
      e.target.value = '';
    }
  };

  const handleUpdateMember = (index: number, field: 'name' | 'title', value: string) => {
    const currentPersonnel = formData.personnel || {};
    const currentMembers = [...(currentPersonnel.members || [])];
    if (currentMembers[index]) {
      currentMembers[index] = {
        ...currentMembers[index],
        [field]: value
      };
    }
    setFormData({
      ...formData,
      personnel: {
        ...currentPersonnel,
        members: currentMembers
      }
    });
  };

  const handleAddMember = () => {
    const currentPersonnel = formData.personnel || {};
    const currentMembers = [...(currentPersonnel.members || [])];
    currentMembers.push({ name: '', title: '' });
    setFormData({
      ...formData,
      personnel: {
        ...currentPersonnel,
        members: currentMembers
      }
    });
  };

  const handleRemoveMember = (index: number) => {
    const currentPersonnel = formData.personnel || {};
    const currentMembers = [...(currentPersonnel.members || [])];
    currentMembers.splice(index, 1);
    setFormData({
      ...formData,
      personnel: {
        ...currentPersonnel,
        members: currentMembers
      }
    });
  };

  const removeImage = (index: number, isMain: boolean) => {
    setFormData(prev => {
      let newThumbnails = [...(prev.thumbnails || [])];
      let newImageUrl = prev.image_url;

      if (isMain) {
        newImageUrl = newThumbnails[0] || '';
        newThumbnails.shift();
      } else {
        newThumbnails.splice(index, 1);
      }

      return {
        ...prev,
        image_url: newImageUrl,
        thumbnails: newThumbnails
      };
    });
  };

  const setAsMain = (index: number) => {
    setFormData(prev => {
      const currentMain = prev.image_url;
      const newMain = prev.thumbnails?.[index];
      if (!newMain) return prev;

      const newThumbnails = [...(prev.thumbnails || [])];
      newThumbnails[index] = currentMain || '';
      
      return {
        ...prev,
        image_url: newMain,
        thumbnails: newThumbnails.filter(Boolean)
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        const localSt = localStorage.getItem('las_solar_projects_fallback');
        let currentProjects = localSt ? JSON.parse(localSt) : [];
        if (project?.id) {
          currentProjects = currentProjects.map((p: any) => 
            p.id === project.id ? { ...p, ...formData, updated_at: new Date().toISOString() } : p
          );
        } else {
          const newProject = {
            ...formData,
            id: `local-project-${Date.now()}`,
            created_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            is_deleted: false
          };
          currentProjects.unshift(newProject);
        }
        localStorage.setItem('las_solar_projects_fallback', JSON.stringify(currentProjects));
        onSave();
        onClose();
        return;
      }

      if (project?.id) {
        let { error } = await supabase
          .from('projects')
          .update(formData)
          .eq('id', project.id);
          
        if (error && (error.code === '42703' || error.code === 'PGRST204')) {
          console.warn("Retrying update without 'category' column...", error);
          const { category, ...cleanData } = formData;
          const { error: retryError } = await supabase
            .from('projects')
            .update(cleanData)
            .eq('id', project.id);
          error = retryError;
        }
        
        if (error) throw error;
      } else {
        let { error } = await supabase
          .from('projects')
          .insert([formData]);
          
        if (error && (error.code === '42703' || error.code === 'PGRST204')) {
          console.warn("Retrying insert without 'category' column...", error);
          const { category, ...cleanData } = formData;
          const { error: retryError } = await supabase
            .from('projects')
            .insert([cleanData]);
          error = retryError;
        }
        
        if (error) throw error;
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Error saving project:', err);
      alert('Failed to save project.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scale-in">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-display font-black text-black tracking-tight">
              {project ? 'EDIT PROJECT' : 'ADD NEW PROJECT'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Field values will be displayed on the public portfolio
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Gallery Section */}
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Project Gallery</span>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* Main Image */}
              {formData.image_url ? (
                <div className="relative aspect-square rounded-2xl overflow-hidden border-4 border-app-purple group">
                  <img src={formData.image_url || undefined} alt="Main" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button type="button" onClick={() => removeImage(-1, true)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 bg-app-purple text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Main</div>
                </div>
              ) : (
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-app-purple hover:text-app-purple transition-all"
                >
                  <Upload size={24} className="mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Upload Image</span>
                </button>
              )}

              {/* Thumbnails */}
              {formData.thumbnails?.map((thumb, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-100">
                  <img src={thumb || undefined} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button type="button" onClick={() => setAsMain(idx)} className="p-2 bg-app-purple text-white rounded-lg hover:bg-white" title="Set as Main">
                      <Plus size={16} />
                    </button>
                    <button type="button" onClick={() => removeImage(idx, false)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {formData.image_url && (
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-app-purple hover:text-app-purple transition-all"
                >
                  <Plus size={24} className="mb-2" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Add More</span>
                </button>
              )}
            </div>
            <input 
              type="file" 
              multiple 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*"
            />
            {uploading && (
              <div className="flex items-center gap-2 text-app-purple font-bold text-xs uppercase tracking-widest py-2">
                <Loader2 className="animate-spin" size={14} /> Processing Assets...
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Project Title</span>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-app-purple focus:outline-none transition-all text-sm font-bold"
                  placeholder="e.g. 5kW Grid-Tied Residential"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Client Name</span>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-app-purple focus:outline-none transition-all text-sm font-bold"
                  placeholder="e.g. Garcia Residence"
                  value={formData.client_name}
                  onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                  required
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Location</span>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-app-purple focus:outline-none transition-all text-sm font-bold"
                  placeholder="e.g. Imus, Cavite"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Project Category</span>
                <div className="relative">
                  <select 
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:border-app-purple focus:outline-none transition-all text-sm font-bold bg-white appearance-none cursor-pointer"
                    value={formData.category || 'Residential'}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none w-4 h-4" />
                </div>
              </label>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">System Size</span>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-app-purple focus:outline-none transition-all text-sm font-bold"
                  placeholder="e.g. 5.2 kWp"
                  value={formData.system_size}
                  onChange={e => setFormData({ ...formData, system_size: e.target.value })}
                />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Inverter</span>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-app-purple focus:outline-none transition-all text-sm font-bold"
                    placeholder="e.g. Solis 5G"
                    value={formData.inverter_type}
                    onChange={e => setFormData({ ...formData, inverter_type: e.target.value })}
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Savings</span>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-app-purple focus:outline-none transition-all text-sm font-bold"
                    placeholder="e.g. ₱4,500/mo"
                    value={formData.estimated_savings}
                    onChange={e => setFormData({ ...formData, estimated_savings: e.target.value })}
                  />
                </label>
              </div>
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Panel Specs</span>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-app-purple focus:outline-none transition-all text-sm font-bold"
                  placeholder="e.g. 10x 550W Jinko Tiger Pro"
                  value={formData.panel_specs}
                  onChange={e => setFormData({ ...formData, panel_specs: e.target.value })}
                />
              </label>
            </div>
          </div>

          {/* Project Personnel */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Project Personnel</span>
              <button
                type="button"
                onClick={handleAddMember}
                className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap"
              >
                <Plus size={12} className="stroke-[3]" />
                Add Member
              </button>
            </div>

            {(() => {
              const members = formData.personnel?.members || [];
              if (members.length === 0) {
                return (
                  <div className="text-center py-8 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                    <p className="text-xs text-slate-400 font-medium italic mb-2">No personnel listed yet.</p>
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="text-[10px] uppercase font-black tracking-widest text-app-purple hover:underline"
                    >
                      + Add first member
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {members.map((member, index) => (
                    <div key={index} className="flex items-end gap-3 bg-slate-50/50 p-5 rounded-3xl border border-slate-100 transition-all">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                        <label className="block">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Name</span>
                          <input 
                            type="text" 
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-app-purple focus:outline-none transition-all text-sm font-bold bg-white"
                            placeholder="e.g. Engr. Mark Dizon"
                            value={member.name || ''}
                            onChange={e => handleUpdateMember(index, 'name', e.target.value)}
                          />
                        </label>
                        <label className="block">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Title / Role</span>
                          <input 
                            type="text" 
                            required
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-app-purple focus:outline-none transition-all text-sm font-bold bg-white"
                            placeholder="e.g. Lead Systems Engineer"
                            value={member.title || ''}
                            onChange={e => handleUpdateMember(index, 'title', e.target.value)}
                          />
                        </label>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(index)}
                        className="p-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl border border-red-200/50 transition-all flex items-center justify-center shrink-0 active:scale-95"
                        title="Remove Member"
                      >
                        <Trash2 size={16} className="stroke-[2.5]" />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          <div className="space-y-4">
            <div className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Project Overview (Rich Text)</span>
              <RichTextEditor 
                content={formData.overview_content || ''} 
                onChange={(html) => setFormData({ ...formData, overview_content: html })}
                placeholder="Describe the project scope, challenges, and results..."
              />
            </div>
          </div>
 
          <div className="space-y-4">
            <div className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Technical Details (Rich Text)</span>
              <RichTextEditor 
                content={formData.technical_content || ''} 
                onChange={(html) => setFormData({ ...formData, technical_content: html })}
                placeholder="List technical specs, equipment used, wiring config..."
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
            disabled={loading || uploading}
            className="bg-app-purple text-white px-10 py-3 rounded-xl font-display font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-app-purple/20 flex items-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : null}
            {project ? 'Update Project' : 'Save Project'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
