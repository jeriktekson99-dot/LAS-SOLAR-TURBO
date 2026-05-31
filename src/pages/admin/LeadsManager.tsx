import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  Search, 
  MoreHorizontal, 
  FileText, 
  ExternalLink,
  CheckCircle2,
  Phone,
  Mail as MailIcon,
  Download,
  Infinity,
  Trash2,
  Loader2,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase, Lead, isSupabaseConfigured } from '../../lib/supabase';
import DeleteConfirmationModal from '../../components/admin/DeleteConfirmationModal';

export const isCalculatorReportUrl = (url: string): boolean => {
  const u = url.toLowerCase();
  return u.includes('solar_report_') || 
         ((u.includes('report') || u.includes('calculator') || u.includes('roi')) && (u.includes('.pdf') || u.endsWith('.pdf')));
};

export const getMonthlyBillStatus = (monthlyBill?: string | null, billUrl?: string | null) => {
  if (!monthlyBill) return { amount: '—', statusText: '', badgeClass: '', dotClass: '' };
  
  const str = monthlyBill.toLowerCase();
  
  // Cleanly strip any brackets or suffixes (case-insensitive) to retrieve the pure bill value
  let valDisplay = monthlyBill
    .replace(/\(calculator assessed\)/i, '')
    .replace(/calculator assessed/i, '')
    .replace(/\(solar calculator assessed\)/i, '')
    .replace(/solar calculator assessed/i, '')
    .replace(/\(intake assessed\)/i, '')
    .replace(/intake assessed/i, '')
    .replace(/\(calculated\)/i, '')
    .replace(/calculated/i, '')
    .replace(/\(assessed\)/i, '')
    .replace(/assessed/i, '')
    .trim();

  const urls = billUrl ? billUrl.split(',').map(u => u.trim()).filter(Boolean) : [];
  const hasPdf = urls.some(url => isCalculatorReportUrl(url));
  const hasBillUpload = urls.some(url => !isCalculatorReportUrl(url));

  const isCalcAssessed = str.includes('calculator') || str.includes('calculated');
  const isIntakeAssessed = str.includes('intake') || (hasPdf && !isCalcAssessed);

  if (isCalcAssessed) {
    return {
      amount: valDisplay,
      statusText: hasBillUpload ? 'Solar Calculator • Bill Added' : 'Solar Calculator • PDF Connected',
      badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-100/80',
      dotClass: 'bg-emerald-500'
    };
  } else if (isIntakeAssessed) {
    return {
      amount: valDisplay,
      statusText: hasBillUpload ? 'Direct Intake • Bill Added' : 'Direct Intake • ROI Document',
      badgeClass: 'bg-blue-50 text-blue-700 border border-blue-100/80',
      dotClass: 'bg-blue-500'
    };
  }

  // Otherwise, it was manually inputted via the standard quote forms without ROI
  return {
    amount: valDisplay,
    statusText: hasBillUpload ? 'Manually Inputted • Bill Added' : 'Manually Inputted',
    badgeClass: 'bg-slate-150/40 text-slate-600 border border-slate-200/60',
    dotClass: 'bg-slate-400'
  };
};

export default function AdminLeadsManager() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [leadToDelete, setLeadToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Checkbox Selection & Bulk Action States
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [bulkActionType, setBulkActionType] = useState<'selected' | 'all' | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Advanced Categorization & Filter States
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterBillRange, setFilterBillRange] = useState<string>('All');

  useEffect(() => {
    fetchLeads();
  }, []);

  // Helper to parse numeric values from currency string (e.g. "₱15,000" -> 15000, "₱26,000 - ₱40,000" -> 33000)
  const parseBillValue = (billStr?: string | null): number => {
    if (!billStr) return 0;
    // Extract digit sequences to handle ranges and standard numbers cleanly
    const matches = billStr.replace(/,/g, '').match(/\d+/g);
    if (matches && matches.length > 0) {
      if (matches.length === 2) {
        const val1 = parseFloat(matches[0]);
        const val2 = parseFloat(matches[1]);
        return Math.round((val1 + val2) / 2);
      }
      return parseFloat(matches[0]);
    }
    return 0;
  };

  const handleBulkDelete = async () => {
    if (!bulkActionType) return;
    setIsBulkProcessing(true);
    try {
      if (bulkActionType === 'selected') {
        if (selectedLeads.length === 0) return;
        
        if (!isSupabaseConfigured) {
          const localSt = localStorage.getItem('las_solar_leads_fallback');
          let currentLeads = localSt ? JSON.parse(localSt) : [];
          currentLeads = currentLeads.filter((l: any) => !selectedLeads.includes(l.id));
          localStorage.setItem('las_solar_leads_fallback', JSON.stringify(currentLeads));
          setLeads(currentLeads);
        } else {
          const { error } = await supabase
            .from('leads')
            .delete()
            .in('id', selectedLeads);
          if (error) throw error;
          setLeads(leads.filter(l => !selectedLeads.includes(l.id)));
        }
        setSelectedLeads([]);
      } else if (bulkActionType === 'all') {
        if (!isSupabaseConfigured) {
          localStorage.setItem('las_solar_leads_fallback', JSON.stringify([]));
          setLeads([]);
        } else {
          const { error } = await supabase
            .from('leads')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');
          if (error) throw error;
          setLeads([]);
        }
        setSelectedLeads([]);
      }
      setBulkActionType(null);
    } catch (err: any) {
      console.error('Error in bulk delete:', err);
      alert('Bulk action failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const fetchLeads = async () => {
    if (!isSupabaseConfigured) {
      setLoading(true);
      const localSt = localStorage.getItem('las_solar_leads_fallback');
      if (localSt) {
        setLeads(JSON.parse(localSt));
      } else {
        const demoLeads: Lead[] = [
          {
            id: 'demo-1',
            name: 'Juan Dela Cruz',
            phone: '09171234567',
            email: 'juan@example.com',
            address: '123 Rizal Ave, Quezon City',
            property_type: 'Residential (House & Lot)',
            utility_provider: 'Meralco',
            monthly_bill: '₱8,500',
            status: 'New',
            created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            goal: 'Reduce Monthly Electricity Bill'
          },
          {
            id: 'demo-2',
            name: 'Maria Santos',
            phone: '09187654321',
            email: 'maria@example.com',
            address: '456 Taft Ave, Manila',
            property_type: 'Commercial (Retail/Office)',
            utility_provider: 'Meralco',
            monthly_bill: '₱24,000',
            status: 'Contacted',
            created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
            goal: 'Eco-Friendly / Sustainability Goals'
          }
        ];
        localStorage.setItem('las_solar_leads_fallback', JSON.stringify(demoLeads));
        setLeads(demoLeads);
      }
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      if (!isSupabaseConfigured) {
        const localSt = localStorage.getItem('las_solar_leads_fallback');
        let currentLeads = localSt ? JSON.parse(localSt) : [];
        currentLeads = currentLeads.filter((l: any) => l.id !== leadToDelete);
        localStorage.setItem('las_solar_leads_fallback', JSON.stringify(currentLeads));
        setLeads(currentLeads);
        setLeadToDelete(null);
        setIsDeleting(false);
        return;
      }
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadToDelete);

      if (error) throw error;
      setLeads(leads.filter(l => l.id !== leadToDelete));
      setLeadToDelete(null);
    } catch (err: any) {
      console.error('Error deleting lead:', err);
      alert('Failed to delete inquiry: ' + (err.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;

    const escapeCSV = (val: any) => {
      if (val === undefined || val === null) return '';
      const str = String(val).trim();
      return `"${str.replace(/"/g, '""')}"`;
    };

    const headers = [
      'Name',
      'Email',
      'Phone',
      'Property Type',
      'Status',
      'Monthly Bill',
      'Utility Provider',
      'Roof Type',
      'Shading',
      'Timeline',
      'Goal',
      'Address',
      'Ocular Visit Date',
      'Created At'
    ];

    const csvRows = leads.map(l => [
      escapeCSV(l.name),
      escapeCSV(l.email),
      escapeCSV(l.phone),
      escapeCSV(l.property_type),
      escapeCSV(l.status),
      escapeCSV(l.monthly_bill),
      escapeCSV(l.utility_provider),
      escapeCSV(l.roof_type),
      escapeCSV(l.shading),
      escapeCSV(l.timeline),
      escapeCSV(l.goal),
      escapeCSV(l.address),
      escapeCSV(l.ocular_visit_date),
      escapeCSV(l.created_at ? new Date(l.created_at).toLocaleString() : '')
    ].join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `las-solar-leads-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(l => {
    // 1. Search term match
    const matchesSearch = 
      (l.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (l.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (l.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (l.address?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    // 2. Status match
    const matchesStatus = filterStatus === 'All' || l.status === filterStatus;

    // 3. Category match
    let matchesCategory = true;
    if (filterCategory === 'Residential') {
      matchesCategory = (l.property_type || '').toLowerCase().includes('residential');
    } else if (filterCategory === 'Commercial') {
      matchesCategory = (l.property_type || '').toLowerCase().includes('commercial');
    } else if (filterCategory === 'High Value') {
      matchesCategory = parseBillValue(l.monthly_bill) >= 15000;
    } else if (filterCategory === 'With Uploads') {
      matchesCategory = !!l.bill_url;
    }

    // 4. Bill Range match
    let matchesBill = true;
    if (filterBillRange !== 'All') {
      const billValue = parseBillValue(l.monthly_bill);
      if (filterBillRange === 'Low') {
        matchesBill = billValue < 5000;
      } else if (filterBillRange === 'Medium') {
        matchesBill = billValue >= 5000 && billValue <= 15000;
      } else if (filterBillRange === 'High') {
        matchesBill = billValue > 15000;
      }
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesBill;
  });

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage) || 1;
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isAllPageSelected = paginatedLeads.length > 0 && paginatedLeads.every(l => selectedLeads.includes(l.id));

  const handleSelectAllPage = () => {
    if (isAllPageSelected) {
      setSelectedLeads(prev => prev.filter(id => !paginatedLeads.some(pl => pl.id === id)));
    } else {
      const pageIds = paginatedLeads.map(pl => pl.id);
      setSelectedLeads(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLeads(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-black text-black tracking-tight">INQUIRIES & LEADS</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Manage quote requests and consultation bookings</p>
        </div>
        <button 
          onClick={handleExportCSV}
          disabled={leads.length === 0}
          className="bg-black text-white px-8 py-4 rounded-2xl font-display font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-black/20 flex items-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          Export All Leads
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        {/* Search and Pagination Header Banner */}
        <div className="p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Search name, email, phone..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-black focus:outline-none transition-all"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <Inbox size={14} className="text-app-purple" />
                <span>{filteredLeads.length} Matches Found</span>
            </div>
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage(prev => Math.max(1, prev - 1));
                }}
                disabled={currentPage === 1}
                className="p-2 text-slate-400 hover:text-black disabled:text-slate-200 transition-colors disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-4 text-[10px] font-black uppercase text-slate-400 select-none">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
                }}
                disabled={currentPage === totalPages}
                className="p-2 text-slate-400 hover:text-black disabled:text-slate-200 transition-colors disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Category System & Filters Panel */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Category System</label>
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:border-black focus:outline-none focus:ring-0 transition-all shadow-sm"
            >
              <option value="All">All Categories / Property Types</option>
              <option value="Residential">Residential inquiries</option>
              <option value="Commercial">Commercial inquiries</option>
              <option value="High Value">{"High-Value Users (Bill >= ₱15,000)"}</option>
              <option value="With Uploads">With Electric Bill Uploads</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Lead Status</label>
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:border-black focus:outline-none focus:ring-0 transition-all shadow-sm"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Electricity Bill Range</label>
            <select
              value={filterBillRange}
              onChange={(e) => { setFilterBillRange(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:border-black focus:outline-none focus:ring-0 transition-all shadow-sm"
            >
              <option value="All">All Bill Levels</option>
              <option value="Low">Low (&lt; ₱5,000)</option>
              <option value="Medium">Medium (₱5,000 - ₱15,000)</option>
              <option value="High">High (&gt; ₱15,000)</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Controls Toolbar */}
        {selectedLeads.length > 0 && (
          <div className="bg-purple-50/50 border-b border-slate-100 px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-app-purple animate-pulse rounded-full shrink-0"></span>
              <span className="text-xs font-extrabold text-slate-800 tracking-tight">
                {selectedLeads.length} {selectedLeads.length === 1 ? 'Inquiry' : 'Inquiries'} Selected
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedLeads([])}
                className="px-4 py-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-black transition-all"
              >
                Clear Selection
              </button>
              <button
                type="button"
                onClick={() => setBulkActionType('selected')}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-display font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
              >
                <Trash2 size={12} />
                Delete Selected
              </button>
              <button
                type="button"
                onClick={() => setBulkActionType('all')}
                className="bg-black hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-display font-black text-[10px] uppercase tracking-widest transition-all shadow-md flex items-center gap-2"
              >
                <Trash2 size={12} />
                Delete All {leads.length} Records
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="animate-spin mb-4 text-app-purple" size={32} />
              <p className="text-xs font-bold uppercase tracking-widest">Loading Leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-center">
              <Inbox size={48} className="text-slate-200 mb-4" />
              <p className="text-sm font-black text-black uppercase tracking-widest">No inquiries found</p>
              <p className="text-xs mt-1">Try relaxing your search terms or filters.</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[800px]">
                <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-100">
                        <th className="w-12 pl-8 py-4.5 text-left" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isAllPageSelected}
                            onChange={handleSelectAllPage}
                            className="w-4 h-4 rounded border-slate-300 text-app-purple focus:ring-app-purple/30 cursor-pointer accent-purple-600"
                            title={isAllPageSelected ? "Deselect page" : "Select page records"}
                          />
                        </th>
                        <th className="px-8 py-4.5 text-[10px] uppercase font-black tracking-widest text-slate-400">Date Received</th>
                        <th className="px-8 py-4.5 text-[10px] uppercase font-black tracking-widest text-slate-400">Client Name</th>
                        <th className="px-8 py-4.5 text-[10px] uppercase font-black tracking-widest text-slate-400">Property / Utility</th>
                        <th className="px-8 py-4.5 text-[10px] uppercase font-black tracking-widest text-slate-400">Monthly Bill</th>
                        <th className="px-8 py-4.5 text-[10px] uppercase font-black tracking-widest text-slate-400 text-center">Status</th>
                        <th className="px-8 py-4.5 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {paginatedLeads.map((lead) => (
                        <tr 
                          key={lead.id} 
                          onClick={() => navigate(`/admin/dashboard/leads/${lead.id}`)}
                          className={`hover:bg-slate-50/50 cursor-pointer transition-all group ${selectedLeads.includes(lead.id) ? 'bg-purple-50/20' : ''}`}
                        >
                            <td className="w-12 pl-8 py-5.5" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedLeads.includes(lead.id)}
                                onChange={(e) => handleToggleSelect(lead.id, e as any)}
                                className="w-4 h-4 rounded border-slate-300 text-app-purple focus:ring-app-purple/30 cursor-pointer accent-purple-600"
                              />
                            </td>
                            <td className="px-8 py-5.5">
                                <span className="text-xs font-bold text-slate-400">{new Date(lead.created_at).toLocaleDateString()}</span>
                            </td>
                            <td className="px-8 py-5.5">
                                <div className="flex flex-col">
                                    <span className="text-sm font-black text-black group-hover:text-app-purple transition-colors">{lead.name}</span>
                                    <span className="text-[10px] font-medium text-slate-400 mt-0.5">{lead.email}</span>
                                    {(() => {
                                      const urls = lead.bill_url ? lead.bill_url.split(',').map(u => u.trim()).filter(Boolean) : [];
                                      if (urls.length === 0) return null;
                                      return (
                                        <div className="flex flex-wrap gap-1.5 mt-2" onClick={(e) => e.stopPropagation()}>
                                          {urls.map((url, idx) => {
                                            const isCalc = isCalculatorReportUrl(url);
                                            return (
                                              <a
                                                key={idx}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md transition-all border ${
                                                  isCalc 
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' 
                                                    : 'bg-blue-50 text-blue-600 border-blue-500/20 hover:bg-blue-550 hover:text-white'
                                                }`}
                                                title={isCalc ? "Open Solar ROI Report PDF" : "Open Customer Electric Bill Invoice"}
                                              >
                                                <FileText size={9} />
                                                <span>{isCalc ? "ROI PDF" : "Electric Bill"}</span>
                                              </a>
                                            );
                                          })}
                                        </div>
                                      );
                                    })()}
                                </div>
                            </td>
                            <td className="px-8 py-5.5">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-700">{lead.property_type}</span>
                                    <span className="text-[10px] text-slate-400 font-medium mt-0.5">{lead.utility_provider || 'Not specified'}</span>
                                </div>
                            </td>
                            <td className="px-8 py-5.5">
                                {(() => {
                                  const status = getMonthlyBillStatus(lead.monthly_bill, lead.bill_url);
                                  if (status.amount === '—') {
                                    return <span className="text-slate-400">—</span>;
                                  }
                                  return (
                                    <div className="flex flex-col gap-1 items-start">
                                      <span className="text-xs font-extrabold text-slate-800 font-display">
                                        {status.amount}
                                      </span>
                                      <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${status.badgeClass}`}>
                                        <span className={`w-1 h-1 rounded-full ${status.dotClass}`}></span>
                                        {status.statusText}
                                      </span>
                                    </div>
                                  );
                                })()}
                            </td>
                            <td className="px-8 py-5.5 text-center">
                                <span className={`text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded-full inline-block ${
                                    lead.status === 'New' ? 'bg-app-purple text-white' : 
                                    lead.status === 'Contacted' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                                    lead.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                    'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}>
                                    {lead.status}
                                </span>
                            </td>
                            <td className="px-8 py-5.5 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => navigate(`/admin/dashboard/leads/${lead.id}`)}
                                  className="p-2 text-slate-300 hover:text-app-purple hover:bg-app-purple/10 rounded-lg transition-all" 
                                  title="View Details Page"
                                >
                                  <Eye size={16} />
                                </button>
                                <button 
                                  type="button"
                                  onClick={() => setLeadToDelete(lead.id)}
                                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                  title="Delete Inquiry"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          )}
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
      <DeleteConfirmationModal
        isOpen={!!bulkActionType}
        onClose={() => setBulkActionType(null)}
        onConfirm={handleBulkDelete}
        isDeleting={isBulkProcessing}
        title={bulkActionType === 'all' ? "DELETE ALL RECORDS" : "Delete Selected Inquiries"}
        message={bulkActionType === 'all' 
          ? `WARNING: You are about to permanently delete EVERY SINGLE lead inquiry (${leads.length} total) in the entire system. This action is absolutely irreversible. Are you sure you want to continue?` 
          : `Are you sure you want to permanently delete the ${selectedLeads.length} selected lead inquiry records? This action is absolutely irreversible and will remove them from the system database forever.`
        }
      />
    </div>
  );
}
