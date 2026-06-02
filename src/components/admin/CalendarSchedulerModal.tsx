/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle, 
  XCircle, 
  PlayCircle, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { Lead, supabase, isSupabaseConfigured } from '../../lib/supabase';

interface CalendarSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: Lead[];
  onStatusUpdated?: () => void;
}

export interface CustomMeeting {
  id: string;
  client_name: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g., "10:00 AM"
  type: 'Ocular Visit' | 'Client Meeting' | 'Technical Assessment' | 'Project Presentation' | 'Other';
  status: 'Scheduled' | 'Completed' | 'Postponed' | 'Cancelled';
  notes?: string;
  address?: string;
}

const CUSTOM_MEETINGS_KEY = 'las_solar_custom_meetings';
const MEETING_STATUS_OVER_KEY = 'las_solar_meeting_status_overrides';

export default function CalendarSchedulerModal({ isOpen, onClose, leads, onStatusUpdated }: CalendarSchedulerModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  
  // Custom meetings scheduled by admin
  const [customMeetings, setCustomMeetings] = useState<CustomMeeting[]>([]);
  
  // Local modifications to lead states (completed, cancelled, postponed overrides)
  const [statusOverrides, setStatusOverrides] = useState<Record<string, CustomMeeting['status']>>({});
  
  // Tab/view controls
  const [scheduleView, setScheduleView] = useState<'calendar' | 'list'>('calendar');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Scheduled' | 'Completed' | 'Postponed' | 'Cancelled'>('All');
  
  // Create schedule form controls
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('Ocular Visit');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formTime, setFormTime] = useState('09:00 AM');
  const [formType, setFormType] = useState<CustomMeeting['type']>('Ocular Visit');
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [overrideConflict, setOverrideConflict] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Re-load data
      try {
        const savedCustom = localStorage.getItem(CUSTOM_MEETINGS_KEY);
        if (savedCustom) {
          setCustomMeetings(JSON.parse(savedCustom));
        }

        const savedOverrides = localStorage.getItem(MEETING_STATUS_OVER_KEY);
        if (savedOverrides) {
          setStatusOverrides(JSON.parse(savedOverrides));
        }
      } catch (e) {
        console.error('Failed to load local scheduler items', e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Save changes to localStorage helper
  const saveCustomMeetingsToLocal = (updated: CustomMeeting[]) => {
    setCustomMeetings(updated);
    localStorage.setItem(CUSTOM_MEETINGS_KEY, JSON.stringify(updated));
  };

  const saveOverridesToLocal = (updatedOverrides: Record<string, CustomMeeting['status']>) => {
    setStatusOverrides(updatedOverrides);
    localStorage.setItem(MEETING_STATUS_OVER_KEY, JSON.stringify(updatedOverrides));
    
    // Notify application that settings or database status overlays updated
    window.dispatchEvent(new Event('las-solar-settings-changed'));
    if (onStatusUpdated) onStatusUpdated();
  };

  // Compile full unified list containing ocular site visits from Leads and any custom items
  const compileAllSchedules = (): CustomMeeting[] => {
    const compiled: CustomMeeting[] = [];

    // 1. Process ocular visits from Leads
    leads.forEach(lead => {
      let visitDateStr = lead.ocular_visit_date;
      let visitTimeSlot = '9:00 AM - 12:00 PM';

      // Fallback parsing from lead timeline: "Preferred Ocular Visit: YYYY-MM-DD | Timings"
      if (!visitDateStr && lead.timeline) {
        const match = lead.timeline.match(/Preferred Ocular Visit:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})(?:\s*\|\s*([^)]+))?/);
        if (match) {
          visitDateStr = match[1];
          if (match[2]) visitTimeSlot = match[2];
        }
      }

      if (visitDateStr) {
        const leadIdStr = lead.id;
        const currentStatus = statusOverrides[leadIdStr] || 'Scheduled';

        compiled.push({
          id: `lead-${leadIdStr}`,
          client_name: lead.name,
          title: `Ocular Visit [Lead: ${lead.property_type}]`,
          date: visitDateStr,
          time: visitTimeSlot,
          type: 'Ocular Visit',
          status: currentStatus,
          address: lead.address || 'Cavite, PH',
          notes: `Lead Contact: phone ${lead.phone || 'N/A'}, email: ${lead.email || 'N/A'}`
        });
      }
    });

    // 2. Append custom admin schedulers
    customMeetings.forEach(item => {
      const currentStatus = statusOverrides[item.id] || item.status;
      compiled.push({
        ...item,
        status: currentStatus
      });
    });

    return compiled;
  };

  const allSchedules = compileAllSchedules();

  // Find dynamic conflicts for the current form inputs
  const currentConflicts = allSchedules.filter(item => {
    if (item.status === 'Cancelled' || item.status === 'Completed') return false;
    if (item.date !== formDate) return false;
    
    // Exact or approximate time matching (case-insensitive, ignoring spacing)
    const t1 = item.time.toLowerCase().replace(/\s+/g, '');
    const t2 = formTime.toLowerCase().replace(/\s+/g, '');
    
    return t1 === t2 || t1.includes(t2) || t2.includes(t1);
  });

  // Calendar logic helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (dayNum: number) => {
    const clicked = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
    setSelectedDate(clicked);
  };

  // Check if given date string matches specified date obj
  const isSameDayStr = (dateStr: string, dateObj: Date) => {
    try {
      const d = new Date(dateStr);
      return (
        d.getFullYear() === dateObj.getFullYear() &&
        d.getMonth() === dateObj.getMonth() &&
        d.getDate() === dateObj.getDate()
      );
    } catch {
      return false;
    }
  };

  // Add customized schedule
  const handleAddCustomMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDate) return;

    if (currentConflicts.length > 0 && !overrideConflict) {
      alert(`Conflict Detected: There are existing meetings scheduled on this date/time. Please check the conflict confirmation checkbox below to double-book.`);
      return;
    }

    const newItem: CustomMeeting = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      client_name: formName,
      title: formTitle,
      date: formDate,
      time: formTime,
      type: formType,
      status: 'Scheduled',
      address: formAddress,
      notes: formNotes
    };

    const updatedList = [...customMeetings, newItem];
    saveCustomMeetingsToLocal(updatedList);

    // Reset Form
    setFormName('');
    setFormTitle('Ocular Visit');
    setFormAddress('');
    setFormNotes('');
    setOverrideConflict(false);
    setShowAddForm(false);
  };

  // Delete matching custom items
  const handleDeleteCustomMeeting = (id: string) => {
    const confirmation = window.confirm('Are you sure you want to delete this custom project meeting?');
    if (!confirmation) return;
    
    const updated = customMeetings.filter(item => item.id !== id);
    saveCustomMeetingsToLocal(updated);

    // Clean up corresponding overrides as well
    const updatedOverrides = { ...statusOverrides };
    delete updatedOverrides[id];
    saveOverridesToLocal(updatedOverrides);
  };

  // Trigger individual status updates
  const handleUpdateStatus = (id: string, newStatus: CustomMeeting['status']) => {
    // Strip "lead-" prefix to store standard ID
    const key = id.startsWith('lead-') ? id.replace('lead-', '') : id;
    const updated = {
      ...statusOverrides,
      [key]: newStatus
    };
    saveOverridesToLocal(updated);
  };

  // Filter schedules based on selection & filter tabs
  const getFilteredSchedules = () => {
    let filtered = [...allSchedules];

    if (scheduleView === 'calendar' && selectedDate) {
      filtered = filtered.filter(item => isSameDayStr(item.date, selectedDate));
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Sort by date then time
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const filteredItems = getFilteredSchedules();

  // Helper color map for calendar labels
  const getStatusBadgeStyles = (status: CustomMeeting['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Postponed':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Scheduled':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  const getStatusDotColor = (status: CustomMeeting['status']) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500';
      case 'Postponed': return 'bg-amber-500';
      case 'Cancelled': return 'bg-rose-500';
      case 'Scheduled':
      default:
        return 'bg-blue-500';
    }
  };

  // Build Calendar grid cells
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('en', { month: 'long' });
  const yearStr = currentDate.getFullYear();

  // Render dummy spaces for first day padding
  const blanks = Array(firstDay).fill(null);
  const calendarCells = [...blanks, ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 w-full max-w-6xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
        
        {/* Modal Header */}
        <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-app-purple/10 text-app-purple rounded-xl">
              <CalendarIcon size={22} />
            </div>
            <div>
              <h2 className="text-xl font-display font-black uppercase tracking-tight text-black">Personnel Scheduling Deck</h2>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-widest">
                Ocular Site Audits, Installations & Client Consultations
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 rounded-xl p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => { setScheduleView('calendar'); setSelectedDate(new Date()); }}
                className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  scheduleView === 'calendar' ? 'bg-white text-black shadow-sm' : 'text-slate-400 hover:text-black'
                }`}
              >
                Calendar Selector
              </button>
              <button
                type="button"
                onClick={() => { setScheduleView('list'); setSelectedDate(null); }}
                className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  scheduleView === 'list' ? 'bg-white text-black shadow-sm' : 'text-slate-400 hover:text-black'
                }`}
              >
                Master Schedule Pipeline
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-black hover:bg-slate-100 rounded-xl transition-all"
              title="Close Panel"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Filters bar */}
        <div className="px-8 py-4 border-b border-slate-100 flex flex-wrap gap-3 items-center justify-between bg-white text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-2">Filter State:</span>
            {(['All', 'Scheduled', 'Completed', 'Postponed', 'Cancelled'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${
                  statusFilter === tab 
                    ? 'bg-black text-white border-black shadow-sm' 
                    : 'bg-slate-50 border-slate-200/65 text-slate-500 hover:text-black hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-app-purple hover:bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95"
          >
            <Plus size={14} />
            <span>Create Meeting</span>
          </button>
        </div>

        {/* Modal Layout Contents */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 min-h-0 bg-slate-50/20">

          {/* Left Column: Input Form (Animate toggle overlay or side component) */}
          {showAddForm && (
            <div className="lg:col-span-12 p-8 border-b border-slate-100 bg-amber-50/10">
              <form onSubmit={handleAddCustomMeeting} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Add Corporate Schedule Entry</h3>
                  <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-black">
                    <X size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Client / Contact Name</label>
                    <input
                      required
                      type="text"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-black focus:outline-none"
                      placeholder="e.g. Jerik Benito"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Title of Appointment</label>
                    <input
                      required
                      type="text"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-black focus:outline-none"
                      placeholder="e.g. Contract review / Net metering filing"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                    />
                  </div>

                   <div className="space-y-1">
                     <label className="block text-[10px] font-black uppercase text-slate-400">Appointment Type</label>
                     <div className="relative">
                       <select
                         className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:border-black focus:outline-none appearance-none cursor-pointer"
                         value={formType}
                         onChange={(e) => setFormType(e.target.value as CustomMeeting['type'])}
                       >
                         <option value="Ocular Visit">Ocular Visit / Site Audit</option>
                         <option value="Client Meeting">Client Consultation</option>
                         <option value="Technical Assessment">Technical Survey</option>
                         <option value="Project Presentation">Proposal Review</option>
                         <option value="Other">Other / Regulatory Filing</option>
                       </select>
                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none w-4 h-4" />
                     </div>
                   </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Scheduled Date</label>
                    <input
                      required
                      type="date"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:border-black focus:outline-none"
                      value={formDate}
                      onChange={(e) => { setFormDate(e.target.value); setOverrideConflict(false); }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Time / Hour Interval</label>
                    <input
                      required
                      type="text"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs focus:border-black focus:outline-none"
                      placeholder="e.g. 10:00 AM or 1:00 PM - 4:00 PM"
                      value={formTime}
                      onChange={(e) => { setFormTime(e.target.value); setOverrideConflict(false); }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-slate-400">Installation Site / Location</label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-black focus:outline-none"
                      placeholder="Imus, Cavite"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black uppercase text-slate-400">Internal Operational Notes</label>
                  <textarea
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-black focus:outline-none resize-none"
                    placeholder="Specific engineering notes, inverter locations preferred, shading logs"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                  />
                </div>

                {/* Conflict Warning Alerts Block */}
                {currentConflicts.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex flex-col gap-3 text-red-900 text-xs animate-pulse">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                      <div>
                        <span className="font-bold block uppercase tracking-wider text-[10px] text-red-700">Scheduling Conflict Alert</span>
                        <p className="mt-1 font-medium">
                          There {currentConflicts.length === 1 ? 'is' : 'are'} already {currentConflicts.length} active meeting{currentConflicts.length !== 1 ? 's' : ''} scheduled on <strong className="font-black">{formDate}</strong> during approximate slot <strong className="font-black">"{formTime}"</strong>:
                        </p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 font-bold">
                          {currentConflicts.map((c, i) => (
                            <li key={i}>
                              <span className="text-red-950 font-black">{c.client_name}</span> - {c.title} ({c.time})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2 border-t border-red-200/55">
                      <input
                        type="checkbox"
                        id="conflict-override-checkbox"
                        checked={overrideConflict}
                        onChange={(e) => setOverrideConflict(e.target.checked)}
                        className="rounded border-red-300 text-red-700 focus:ring-red-500 h-4 w-4 bg-white"
                      />
                      <label htmlFor="conflict-override-checkbox" className="text-[10px] font-black uppercase tracking-wider text-red-700 cursor-pointer select-none">
                        I acknowledge this conflict and request to double-book anyway
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 justify-end border-t border-slate-50 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black hover:bg-app-purple text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow"
                  >
                    Save Appointment
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Conditional Layouts */}
          {scheduleView === 'calendar' ? (
            <>
              {/* Calendar Matrix View (8 grid spaces wide) */}
              <div className="lg:col-span-7 p-8 border-r border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black uppercase tracking-wider text-black">
                      {monthName} {yearStr}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePrevMonth}
                        className="p-1.5 rounded-lg border border-slate-150 hover:bg-slate-100 text-slate-600 transition-all"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextMonth}
                        className="p-1.5 rounded-lg border border-slate-150 hover:bg-slate-100 text-slate-600 transition-all"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Days names */}
                  <div className="grid grid-cols-7 text-center gap-1.5 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <span key={d} className="text-[10px] font-black uppercase tracking-wider text-slate-400 select-none py-1">
                        {d}
                      </span>
                    ))}
                  </div>

                  {/* Main Grid Cells */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {calendarCells.map((dayNum, idx) => {
                      if (dayNum === null) {
                        return <div key={`empty-${idx}`} className="aspect-square bg-slate-50/50 rounded-2xl border border-slate-100 opacity-20"></div>;
                      }

                      const thisCellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
                      const isSelected = selectedDate && 
                        selectedDate.getFullYear() === thisCellDate.getFullYear() &&
                        selectedDate.getMonth() === thisCellDate.getMonth() &&
                        selectedDate.getDate() === dayNum;

                      // Gather items on this day
                      const itemsOnDay = allSchedules.filter(item => isSameDayStr(item.date, thisCellDate));

                      return (
                        <button
                          key={`day-${dayNum}`}
                          type="button"
                          onClick={() => handleDateClick(dayNum)}
                          className={`aspect-square p-2.5 rounded-2xl border flex flex-col justify-between items-start relative transition-all align-top ${
                            isSelected 
                              ? 'bg-black text-white border-black shadow-md' 
                              : 'bg-white hover:bg-slate-50 border-slate-100 text-black'
                          }`}
                        >
                          <span className="text-[10px] font-black select-none leading-none">{dayNum}</span>
                          
                          {/* Meetings status indicators */}
                          {itemsOnDay.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1 w-full max-w-full overflow-hidden">
                              {itemsOnDay.slice(0, 3).map((item, idy) => (
                                <span
                                  key={idy}
                                  className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(item.status)} block shrink-0`}
                                  title={`${item.client_name} - ${item.status}`}
                                />
                              ))}
                              {itemsOnDay.length > 3 && (
                                <span className={`text-[6.5px] leading-none font-bold font-mono ${isSelected ? 'text-white' : 'text-app-purple'}`}>
                                  +{itemsOnDay.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Info Guide */}
                <div className="mt-8 pt-4 border-t border-slate-100/70 flex items-center gap-4 text-[9px] font-black uppercase text-slate-400 select-none tracking-widest justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Scheduled</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>Postponed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>Cancelled</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Selected day agenda detail panel */}
              <div className="lg:col-span-5 p-8 flex flex-col justify-between bg-slate-50/50 lg:min-h-[560px]">
                <div className="flex-1 flex flex-col min-h-0 space-y-6">
                  <div className="border-b border-slate-150 pb-3 shrink-0">
                    <span className="text-[10px] font-black text-app-purple uppercase tracking-widest block">Daily Schedule Logs</span>
                    <h4 className="text-sm font-black text-black uppercase tracking-wider mt-0.5">
                      {selectedDate ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'All Dates Combined'}
                    </h4>
                  </div>

                  <div className="space-y-4 max-h-[480px] lg:max-h-[500px] flex-1 overflow-y-auto pr-1">
                    {filteredItems.map(item => (
                      <div 
                        key={item.id}
                        className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden"
                      >
                        {/* Status bar left decoration */}
                        <div className={`absolute top-0 left-0 w-2 h-full ${
                          item.status === 'Completed' ? 'bg-emerald-500' :
                          item.status === 'Postponed' ? 'bg-amber-500' :
                          item.status === 'Cancelled' ? 'bg-rose-500' : 'bg-blue-500'
                        }`}></div>

                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <span className={`inline-block border rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest mb-2 ${getStatusBadgeStyles(item.status)}`}>
                              {item.status}
                            </span>
                            <h5 className="text-xs font-black text-black leading-tight uppercase tracking-tight">{item.title}</h5>
                            <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase flex items-center gap-1">
                              <User size={12} className="text-slate-400 shrink-0" />
                              <span>{item.client_name}</span>
                            </p>
                          </div>

                          {item.id.startsWith('custom-') && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomMeeting(item.id)}
                              className="p-1.5 text-slate-300 hover:text-red-600 transition-colors"
                              title="Delete entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                        {/* Event Time & Location details */}
                        <div className="space-y-1.5 pt-3 border-t border-slate-50 text-[10px] text-slate-500">
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="text-app-purple" />
                            <span className="font-mono text-slate-700 font-bold">{item.time}</span>
                          </div>
                          {item.address && (
                            <div className="flex items-center gap-2">
                              <MapPin size={12} className="text-app-purple" />
                              <span className="truncate text-slate-600 font-bold max-w-xs">{item.address}</span>
                            </div>
                          )}
                        </div>

                        {item.notes && (
                          <p className="text-[10px] bg-slate-50 p-2 text-slate-400 border border-slate-100 rounded-lg italic font-medium leading-relaxed">
                            {item.notes}
                          </p>
                        )}

                        {/* Custom status selector checkers */}
                        <div className="pt-3 border-t border-slate-50">
                          <span className="block text-[8px] font-black uppercase text-slate-400 mb-2">Change Status:</span>
                          <div className="grid grid-cols-4 gap-1">
                            {(['Scheduled', 'Completed', 'Postponed', 'Cancelled'] as const).map(state => (
                              <button
                                key={state}
                                type="button"
                                onClick={() => handleUpdateStatus(item.id, state)}
                                className={`py-1 rounded text-[7px] font-black uppercase tracking-wider border transition-all truncate text-center ${
                                  item.status === state 
                                    ? 'bg-black text-white border-black' 
                                    : 'bg-slate-50 text-slate-500 border-slate-150 hover:bg-slate-100'
                                }`}
                              >
                                {state.slice(0, 5)}.
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    ))}

                    {filteredItems.length === 0 && (
                      <div className="py-16 text-center text-slate-400">
                        <HelpCircle size={28} className="mx-auto mb-2 text-slate-300" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No scheduled agenda</p>
                        <p className="text-[8px] text-slate-400 mt-1">Select another day or schedule a new meeting coordinates.</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedDate && (
                  <div className="p-4 bg-app-purple/5 border border-app-purple/10 rounded-2xl flex items-start gap-2.5 text-app-purple text-[10px] leading-relaxed mt-6 shrink-0 shadow-xs">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>
                      Admins are advised to notify client partners 24 hours in advance regarding postponed or rescheduled project visits.
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Master List View showing all schedules in table or clean rows */
            <div className="lg:col-span-12 p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-black">Master Scheduling Pipeline</h3>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5 tracking-wider">Sorted Chronologically</p>
                </div>
                <span className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-600">
                  {allSchedules.length} Items Total
                </span>
              </div>

              <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                {getFilteredSchedules().map(item => (
                  <div 
                    key={item.id}
                    className="bg-white border border-slate-250/60 rounded-[1.5rem] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:bg-slate-50/15"
                  >
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black text-app-purple uppercase tracking-widest px-2 py-0.5 bg-app-purple/10 rounded border border-app-purple/5">
                          {item.type}
                        </span>
                        <span className={`border rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${getStatusBadgeStyles(item.status)}`}>
                          {item.status}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          Scheduled: {item.date}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-black uppercase tracking-tight leading-snug">{item.title}</h4>
                        <div className="flex flex-wrap items-center gap-5 text-[10px] text-slate-500 mt-1 font-bold">
                          <p className="flex items-center gap-1">
                            <User size={12} className="text-slate-400" />
                            <span>Client Partner: {item.client_name}</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <Clock size={12} className="text-slate-400" />
                            <span>Period: {item.time}</span>
                          </p>
                          {item.address && (
                            <p className="flex items-center gap-1 max-w-sm truncate">
                              <MapPin size={12} className="text-slate-400" />
                              <span>Hub Location: {item.address}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Operational action togglers & check state */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0 shrink-0">
                      
                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <span className="text-[8px] font-black uppercase text-slate-400 sm:hidden">Mark:</span>
                        {(['Scheduled', 'Completed', 'Postponed', 'Cancelled'] as const).map(state => (
                          <button
                            key={state}
                            type="button"
                            onClick={() => handleUpdateStatus(item.id, state)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                              item.status === state 
                                ? 'bg-black text-white border-black shadow-sm' 
                                : 'bg-slate-50 text-slate-500 border-slate-150 hover:bg-slate-100'
                            }`}
                          >
                            {state}
                          </button>
                        ))}
                      </div>

                      {item.id.startsWith('custom-') && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomMeeting(item.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all w-full sm:w-auto flex items-center justify-center border border-transparent hover:border-red-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {getFilteredSchedules().length === 0 && (
                  <div className="py-24 text-center text-slate-400 border border-dashed border-slate-200 rounded-3xl bg-white">
                    <CalendarIcon size={40} className="mx-auto mb-3 text-slate-300 animate-pulse" />
                    <p className="text-xs font-black uppercase text-slate-700 tracking-widest">No Schedule Records Match Filters</p>
                    <p className="text-[10px] text-slate-400 mt-1">Try changing status filter modes or scheduling a brand new meeting slot.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <footer className="px-8 py-5 border-t border-slate-100/85 bg-slate-50 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
          <p>© {new Date().getFullYear()} Las Solar Personnel Control Panel.</p>
          <p className="text-app-purple">All updates route status flags to main server files dynamically.</p>
        </footer>

      </div>
    </div>,
    document.body
  );
}
