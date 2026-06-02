import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Trash2, 
  Phone, 
  Mail as MailIcon, 
  Calendar, 
  Home, 
  Zap, 
  Compass, 
  Clock, 
  ShieldAlert, 
  ArrowUpRight, 
  FileText, 
  ExternalLink,
  CheckCircle2, 
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  Building,
  Maximize2
} from 'lucide-react';
import { supabase, Lead, isSupabaseConfigured } from '../../lib/supabase';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';
import { getMonthlyBillStatus, isCalculatorReportUrl } from './LeadsManager';

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  const fetchLeadDetails = async () => {
    if (!id) return;
    if (!isSupabaseConfigured) {
      setLoading(true);
      const localSt = localStorage.getItem('las_solar_leads_fallback');
      const leads = localSt ? JSON.parse(localSt) : [];
      const found = leads.find((l: any) => l.id === id);
      setLead(found || null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setLead(data);
    } catch (err) {
      console.error('Error fetching lead details:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (newStatus: Lead['status']) => {
    if (!lead) return;
    setIsUpdatingStatus(newStatus);
    try {
      if (!isSupabaseConfigured) {
        const localSt = localStorage.getItem('las_solar_leads_fallback');
        const leads = localSt ? JSON.parse(localSt) : [];
        const updatedLeads = leads.map((l: any) => 
          l.id === lead.id ? { ...l, status: newStatus } : l
        );
        localStorage.setItem('las_solar_leads_fallback', JSON.stringify(updatedLeads));
        setLead(prev => prev ? { ...prev, status: newStatus } : null);
        setIsUpdatingStatus(null);
        return;
      }
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', lead.id);

      if (error) throw error;
      setLead(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleDeleteLead = async () => {
    if (!lead) return;
    setIsDeleting(true);
    try {
      if (!isSupabaseConfigured) {
        const localSt = localStorage.getItem('las_solar_leads_fallback');
        let leads = localSt ? JSON.parse(localSt) : [];
        leads = leads.filter((l: any) => l.id !== lead.id);
        localStorage.setItem('las_solar_leads_fallback', JSON.stringify(leads));
        setIsDeleting(false);
        navigate('/admin/dashboard/leads');
        return;
      }
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', lead.id);

      if (error) throw error;
      setLeadToDelete(null);
      // Navigate back to the main list
      navigate('/admin/dashboard/leads');
    } catch (err: any) {
      console.error('Error deleting lead:', err);
      alert('Failed to delete inquiry: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-4 text-app-purple" size={48} />
        <h2 className="text-sm font-black uppercase tracking-[0.2em]">Retrieved inquiry record...</h2>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <AlertTriangle className="text-amber-500 mb-4" size={48} />
        <h2 className="text-xl font-display font-black uppercase tracking-[0.2em] mb-2 text-black">Inquiry Record Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">The requested file might have been moved or deleted permanently.</p>
        <button 
          onClick={() => navigate('/admin/dashboard/leads')}
          className="bg-black text-white px-8 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-app-purple transition-colors"
        >
          Return to List
        </button>
      </div>
    );
  }

  // Parse location and specs from formatted address
  const [rawAddress, ...specsLines] = lead.address ? lead.address.split('\n\n[Inverter Location Specs]:\n') : ['', ''];
  const inverterSpecs = specsLines.join('\n');

  // Extract all hosted photo URLs found within inverter specs
  const photoUrls = (() => {
    if (!inverterSpecs) return [];
    const matches = inverterSpecs.match(/https?:\/\/[^\s,\r\n]+/gi);
    return matches ? Array.from(new Set(matches)) : [];
  })();

  const setupPhotoUrl = photoUrls[0] || null;

  // Pretty parse inverter specifications into fields
  const parsedInverterSpecs = (() => {
    if (!inverterSpecs) return null;
    const lines = inverterSpecs.split('\n').map(l => l.trim()).filter(Boolean);
    
    let hasDesignated = '—';
    let distance = '—';
    
    lines.forEach(line => {
      if (line.toLowerCase().includes('designated')) {
        hasDesignated = line.split(':').slice(1).join(':').trim();
      } else if (line.toLowerCase().includes('distance')) {
        distance = line.split(':').slice(1).join(':').trim();
      }
    });
    
    return {
      hasDesignated,
      distance,
      photoUrls,
      raw: inverterSpecs
    };
  })();

  // Parse ocular date details if present
  const ocularDateParsed = (() => {
    const match = lead.timeline?.match(/Preferred Ocular Visit:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})(?:\s*\|\s*([^)]+))?/);
    if (!match) return null;
    try {
      const visitDateStr = match[1];
      const visitTimeSlot = match[2] || '9:00 AM - 12:00 PM';
      const d = new Date(visitDateStr);
      if (!isNaN(d.getTime())) {
        return {
          day: d.getDate(),
          month: d.toLocaleString('en-US', { month: 'short' }),
          year: d.getFullYear(),
          weekday: d.toLocaleDateString(undefined, { weekday: 'long' }),
          formatted: d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
          timeSlot: visitTimeSlot
        };
      }
    } catch (e) {}
    return null;
  })();

  // Render status badge colors
  const getStatusBadgeStyles = (status: Lead['status']) => {
    switch (status) {
      case 'New':
        return 'bg-app-purple/10 text-app-purple border border-app-purple/25';
      case 'Contacted':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Archived':
        return 'bg-slate-50 text-slate-600 border border-slate-200';
      default:
        return 'bg-slate-150 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Top action/navigation bar */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/admin/dashboard/leads')}
            className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-black rounded-xl transition-all flex items-center justify-center border border-slate-200"
            title="Back to List"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[9.5px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full ${getStatusBadgeStyles(lead.status)}`}>
                {lead.status}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                Received on {new Date(lead.created_at).toLocaleDateString()} at {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h2 className="text-xl font-display font-black text-black uppercase mt-1">Inquiry of {lead.name}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
          <button 
            type="button"
            onClick={() => setLeadToDelete(lead.id)}
            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-slate-200 hover:border-red-100 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest font-display bg-slate-50"
          >
            <Trash2 size={14} />
            <span>Delete Record</span>
          </button>
        </div>
      </div>

      {/* Alert banner if ROI calculator report was downloaded by user */}
      {(() => {
        const hasCalculatorReport = lead.bill_url ? lead.bill_url.split(',').some(url => isCalculatorReportUrl(url)) : false;
        if (!hasCalculatorReport) return null;
        
        const reportUrl = lead.bill_url ? lead.bill_url.split(',').find(url => isCalculatorReportUrl(url)) : null;
        
        return (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50/60 border border-emerald-100 rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm"
          >
            <div className="flex items-start md:items-center gap-4">
              <div className="bg-emerald-100 text-emerald-600 p-3.5 rounded-2xl shrink-0 flex items-center justify-center shadow-inner">
                <CheckCircle2 size={24} className="stroke-[2.5]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black text-emerald-900 uppercase tracking-tight font-sans">ROI Payback Document Downloaded by Client</h4>
                <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                  The client has completed the Smart-Sense interactive ROI calculator and downloaded their itemized report. A duplicate is verified and synced below as an attachment.
                </p>
              </div>
            </div>
            {reportUrl && (
              <a
                href={reportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-black uppercase text-[10px] tracking-widest px-6 py-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 shrink-0 justify-center w-full md:w-auto"
              >
                <FileText size={14} /> Open Client ROI Report PDF
              </a>
            )}
          </motion.div>
        );
      })()}

      {/* Main Structural Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (Span 2) - Profiles & Technical Specifications */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Client profile card */}
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-slate-100 shadow-sm space-y-8">
            <div className="border-b border-slate-100 pb-5">
              <h3 className="text-lg font-display font-black text-black uppercase tracking-tight">Client Contact & Profile</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">Direct communications details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Full Name</p>
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl">
                  <span className="text-sm font-black text-black">{lead.name}</span>
                  <button 
                    onClick={() => copyToClipboard(lead.name, 'name')}
                    className="p-1 text-slate-400 hover:text-black transition-colors"
                  >
                    {copiedField === 'name' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Property Category</p>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl text-sm font-bold text-slate-700">
                  {lead.property_type && lead.property_type.includes('Commercial') ? <Building size={16} className="text-app-purple" /> : <Home size={16} className="text-app-purple" />}
                  <span>{lead.property_type || '—'}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Email Address</p>
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl">
                  <a 
                    href={`mailto:${lead.email}`} 
                    className="text-sm font-bold text-slate-600 hover:text-app-purple transition-all flex items-center gap-2 truncate pr-2"
                  >
                    <MailIcon size={14} className="text-slate-400" />
                    {lead.email}
                  </a>
                  <button 
                    onClick={() => copyToClipboard(lead.email, 'email')}
                    className="p-1 text-slate-400 hover:text-black transition-colors shrink-0"
                  >
                    {copiedField === 'email' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-1">Mobile Phone Number</p>
                <div className="flex items-center justify-between bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl">
                  <a 
                    href={`tel:${lead.phone}`} 
                    className="text-sm font-bold text-slate-600 hover:text-app-purple transition-all flex items-center gap-2"
                  >
                    <Phone size={14} className="text-slate-400" />
                    {lead.phone}
                  </a>
                  <button 
                    onClick={() => copyToClipboard(lead.phone, 'phone')}
                    className="p-1 text-slate-400 hover:text-black transition-colors"
                  >
                    {copiedField === 'phone' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

            </div>

            {/* Quick action panel for phone/email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-50 pt-6">
              <a 
                href={`tel:${lead.phone}`} 
                className="flex items-center justify-center gap-3 p-4 bg-slate-50 hover:bg-black hover:text-white rounded-2xl text-slate-700 transition-all text-xs font-black uppercase tracking-widest font-display border border-slate-200"
              >
                <Phone size={16} />
                Call Client Now
              </a>
              <a 
                href={`mailto:${lead.email}`} 
                className="flex items-center justify-center gap-3 p-4 bg-slate-50 hover:bg-black hover:text-white rounded-2xl text-slate-700 transition-all text-xs font-black uppercase tracking-widest font-display border border-slate-200"
              >
                <MailIcon size={16} />
                Email Workspace
              </a>
            </div>
          </div>

          {/* Technical Requirements & Project Scope */}
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-slate-100 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-5">
              <h3 className="text-lg font-display font-black text-black uppercase tracking-tight">Technical Audit Parameters</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">Calculated factors for solar engineering</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50/70 border border-slate-100 rounded-2xl space-y-1.5">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5"><Zap size={10} className="text-app-purple" /> Monthly Bill range</span>
                {lead ? (() => {
                  const status = getMonthlyBillStatus(lead.monthly_bill, lead.bill_url);
                  if (status.amount === '—') {
                    return <span className="text-slate-400 block text-sm font-black">—</span>;
                  }
                  return (
                    <div className="flex flex-col gap-1 items-start">
                      <span className="text-sm font-black text-slate-800 block font-display">
                        {status.amount}
                      </span>
                      <span className={`inline-flex items-center gap-1 whitespace-nowrap text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${status.badgeClass}`}>
                        <span className={`w-1 h-1 rounded-full ${status.dotClass}`}></span>
                        {status.statusText}
                      </span>
                    </div>
                  );
                })() : <span className="text-sm font-black text-slate-800 block">—</span>}
              </div>

              <div className="p-5 bg-slate-50/70 border border-slate-100 rounded-2xl space-y-1">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5"><Building size={10} className="text-app-purple" /> Utility Partner</span>
                <span className="text-sm font-black text-slate-800 block">{lead.utility_provider || '—'}</span>
              </div>

              <div className="p-5 bg-slate-50/70 border border-slate-100 rounded-2xl space-y-1">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5"><Home size={10} className="text-app-purple" /> Structural Roof Type</span>
                <span className="text-sm font-black text-slate-800 block">{lead.roof_type || '—'}</span>
              </div>

              <div className="p-5 bg-slate-50/70 border border-slate-100 rounded-2xl space-y-1">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-1.5"><Compass size={10} className="text-app-purple" /> Daytime Shading</span>
                <span className="text-sm font-black text-slate-800 block">{lead.shading || '—'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 ml-1">Solar Project Goal</span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 border border-slate-100 rounded-2xl p-4">{lead.goal || '—'}</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 ml-1">Commission Timeline</span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 border border-slate-100 rounded-2xl p-4">{lead.timeline || '—'}</p>
              </div>
            </div>
          </div>

          {/* Physical Site Environment & Field Inspection Details */}
          <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-slate-100 shadow-sm space-y-8">
            <div className="border-b border-slate-100 pb-5">
              <h3 className="text-lg font-display font-black text-black uppercase tracking-tight">Physical Site Environment & Inverter Preference</h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-1">Detailed field survey parameters and setup specs</p>
            </div>

            <div className="space-y-6">
              
              {/* Installation address */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Installation Site Address</span>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 relative group">
                  <p className="text-xs font-bold leading-relaxed whitespace-pre-line text-slate-700">
                    {rawAddress || 'No address provided'}
                  </p>
                  <button 
                    onClick={() => copyToClipboard(rawAddress || '', 'address')}
                    className="absolute top-4 right-4 p-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-black rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                    title="Copy Address"
                  >
                    {copiedField === 'address' ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              {/* Inverter specifications parsed details */}
              {parsedInverterSpecs && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Inverter Installation Configuration</span>
                  
                  <div className="border border-slate-150 rounded-2xl bg-slate-50/50 p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-1">
                        <span className="text-[8px] uppercase tracking-wider font-black text-slate-400">Designated Safe Location</span>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-widest">
                          {String(parsedInverterSpecs.hasDesignated).toLowerCase() === 'yes' ? 'Yes (Pre-arranged)' : 'No (Needs Survey)'}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-1">
                        <span className="text-[8px] uppercase tracking-wider font-black text-slate-400">Distance to main panel board</span>
                        <p className="text-xs font-black text-slate-800">
                          {parsedInverterSpecs.distance}
                        </p>
                      </div>
                    </div>

                    {parsedInverterSpecs.photoUrls && parsedInverterSpecs.photoUrls.length > 0 ? (
                      <div className="space-y-4 pt-4 border-t border-slate-200/50">
                        <span className="text-[8px] uppercase font-black tracking-widest text-slate-400 ml-1">
                          Identified Inverter & Solar Setting Photos ({parsedInverterSpecs.photoUrls.length})
                        </span>
                        
                        <div className="space-y-4">
                          {parsedInverterSpecs.photoUrls.map((photoUrl, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row gap-5 items-stretch sm:items-center bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                              <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative group/thumb">
                                <img 
                                  src={photoUrl || null} 
                                  alt={`Inverter Setup Preference ${idx + 1}`} 
                                  className="w-full h-full object-cover group-hover/thumb:scale-[1.05] transition-transform duration-350"
                                  referrerPolicy="no-referrer"
                                />
                              </div>

                              <div className="flex-1 space-y-3 min-w-0 flex flex-col justify-between">
                                <div className="space-y-1">
                                  <span className="text-[8px] uppercase font-black text-app-purple bg-app-purple/10 px-2.5 py-0.5 rounded-full inline-block">
                                    SETUP_IMAGE_{idx + 1}.JPG
                                  </span>
                                  <div className="text-[9px] font-mono text-slate-400 block select-all truncate border border-dashed border-slate-200 bg-slate-50 p-2 rounded-lg pr-4 mt-1">
                                    {photoUrl}
                                  </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <a 
                                    href={photoUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-app-purple text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all shadow-sm"
                                  >
                                    <ExternalLink size={10} /> View Setup Photo {parsedInverterSpecs.photoUrls.length > 1 ? `#${idx + 1}` : ''}
                                  </a>
                                  <button 
                                    onClick={() => copyToClipboard(photoUrl || '', `photolink-${idx}`)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border border-slate-150"
                                  >
                                    {copiedField === `photolink-${idx}` ? <Check size={10} className="text-green-600" /> : <Copy size={10} />}
                                    Copy URL Link
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic text-center py-4 bg-white border border-dashed border-slate-200 rounded-xl">
                        No image of the proposed location was supplied.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommended Site Inspection / Preferred Ocular Schedule */}
              {ocularDateParsed && (
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Preferred Field Inspection / Site Audit</span>
                  <div className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-[#fdfcff] border border-app-purple/10 items-start sm:items-center">
                    <div className="bg-slate-900 w-12 h-12 rounded-xl flex flex-col items-center justify-center border border-white/5 shadow-sm shrink-0">
                      <span className="text-xs font-black text-white leading-none">{ocularDateParsed.day}</span>
                      <span className="text-[8px] font-black uppercase text-app-purple mt-1">{ocularDateParsed.month}</span>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-black text-app-purple uppercase tracking-widest">Technician Site Inspection Slot</p>
                      <p className="text-sm font-black text-slate-900">
                        {ocularDateParsed.weekday}, {ocularDateParsed.formatted}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                        <Clock size={12} className="text-slate-400" /> Selected Frame Slot: {ocularDateParsed.timeSlot}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Right Column (Span 1) - Control Console Panel & Attached Documents */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Status routing card */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status Routing Operations</h4>
              <p className="text-[8px] text-slate-400 uppercase tracking-widest font-black mt-0.5">Toggle inquiry process flags</p>
            </div>
            
            <div className="space-y-2 pt-1">
              {(['New', 'Contacted', 'In Progress', 'Archived'] as Lead['status'][]).map((statusValue) => (
                <button
                  key={statusValue}
                  onClick={() => updateLeadStatus(statusValue)}
                  disabled={lead.status === statusValue || isUpdatingStatus !== null}
                  className={`w-full p-4 rounded-xl flex items-center justify-between text-xs font-black uppercase tracking-widest transition-all ${
                    lead.status === statusValue 
                      ? 'bg-slate-900 text-white shadow-md font-extrabold' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100 font-bold'
                  }`}
                >
                  <span>{statusValue}</span>
                  {isUpdatingStatus === statusValue ? (
                    <Loader2 className="animate-spin" size={12} />
                  ) : lead.status === statusValue ? (
                    <CheckCircle2 size={14} className="text-emerald-400 animate-pulse" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {/* Documentary Assets Panel */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Attached Documentary Assets</h4>
              <p className="text-[8px] text-slate-400 uppercase tracking-widest font-black mt-0.5">Supplied customer records</p>
            </div>

            <div className="space-y-4 pt-1">
              
              {/* Electric Meralco Invoice / Utility Bill / Calculator Report */}
              {lead.bill_url ? (
                <div className="space-y-3">
                  {lead.bill_url.split(',').filter(Boolean).map((singleUrl, idx) => {
                    const isCalculatorReport = isCalculatorReportUrl(singleUrl);
                    return (
                      <div key={idx} className={`p-4 rounded-xl flex items-center justify-between gap-3 ${
                        isCalculatorReport 
                          ? 'bg-emerald-50/50 border border-emerald-100' 
                          : 'bg-blue-50/40 rounded-xl border border-blue-100/60'
                      }`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2.5 rounded-lg shrink-0 ${
                            isCalculatorReport ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            <FileText size={14} />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-black text-slate-900 truncate">
                              {isCalculatorReport ? 'Solar_Calculator_ROI_Report.pdf' : 'Electric_Consumption_Bill.pdf'}
                            </span>
                            <span className={`text-[8px] font-bold uppercase tracking-wider ${
                              isCalculatorReport ? 'text-emerald-500' : 'text-blue-500'
                            }`}>
                              {isCalculatorReport ? 'Solar Calculator Report' : 'Utility Invoice'}
                            </span>
                          </div>
                        </div>
                        <a 
                          href={singleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-2 bg-white border rounded-lg transition-all shrink-0 shadow-sm ${
                            isCalculatorReport 
                              ? 'text-emerald-600 hover:text-white hover:bg-emerald-600 border-emerald-150' 
                              : 'text-blue-500 hover:text-white hover:bg-blue-600 border-blue-100'
                          }`}
                          title={isCalculatorReport ? 'Open ROI Report PDF' : 'Open Utility Bill'}
                        >
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 text-center py-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl italic">
                  No electric bill or report uploaded
                </div>
              )}

              {/* Inverter site image duplicate side view */}
              {photoUrls && photoUrls.length > 0 ? (
                <div className="space-y-3 pt-2 border-t border-slate-50">
                  <span className="text-[8px] uppercase font-black tracking-widest text-slate-400 block ml-1">
                    Proposed Facility Photos ({photoUrls.length})
                  </span>
                  
                  <div className="grid grid-cols-1 gap-2.5">
                    {photoUrls.map((url, index) => (
                      <div key={index} className="group relative rounded-xl overflow-hidden bg-slate-100 border border-slate-150 aspect-video">
                        <img 
                          src={url || null} 
                          alt={`Facility survey location ${index + 1}`} 
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-350"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-white text-black p-3 rounded-xl flex items-center justify-center shadow-lg hover:bg-app-purple hover:text-white transition-all scale-75 group-hover:scale-100 duration-350"
                          >
                            <Maximize2 size={14} />
                          </a>
                        </div>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[8px] font-black uppercase text-white tracking-wider">
                          Photo {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 text-center py-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl italic">
                  No site setting photos attached
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

      <DeleteConfirmationModal
        isOpen={!!leadToDelete}
        onClose={() => setLeadToDelete(null)}
        onConfirm={handleDeleteLead}
        isDeleting={isDeleting}
        title="Delete Inquiry"
        message="Are you sure you want to permanently delete this lead inquiry? This data will be removed from your records forever."
      />

    </div>
  );
}
