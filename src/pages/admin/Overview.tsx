import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  ArrowUpRight, 
  ArrowDownRight,
  Zap,
  Calendar,
  Loader2,
  Inbox,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase, Lead, isSupabaseConfigured } from '../../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import CalendarSchedulerModal from '../../components/admin/CalendarSchedulerModal';

export default function AdminOverview() {
  const navigate = useNavigate();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [meetingStatuses, setMeetingStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleSchedulesChanged = () => {
      try {
        const saved = localStorage.getItem('las_solar_meeting_status_overrides');
        if (saved) {
          setMeetingStatuses(JSON.parse(saved));
        } else {
          setMeetingStatuses({});
        }
      } catch (e) {
        console.error(e);
      }
    };
    handleSchedulesChanged();
    window.addEventListener('las-solar-settings-changed', handleSchedulesChanged);
    return () => {
      window.removeEventListener('las-solar-settings-changed', handleSchedulesChanged);
    };
  }, []);

  const [stats, setStats] = useState([
    { label: 'Total Leads', value: '0', change: '0%', positive: true, icon: Users },
    { label: 'Published Projects', value: '0', change: '0', positive: true, icon: FileText },
    { label: 'Total Views', value: '0', change: '0%', positive: true, icon: Zap },
    { label: 'Subscribers', value: '0', change: '0%', positive: true, icon: TrendingUp },
  ]);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Raw storage counts from DB to calculate real-time timeframe metrics
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [allSubscribers, setAllSubscribers] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [allBlogs, setAllBlogs] = useState<any[]>([]);
  const [allViews, setAllViews] = useState(0);
  
  // Custom states for timeframe analytics
  const [timeframe, setTimeframe] = useState<'30days' | 'yearly'>('30days');
  const [upcomingAssessments, setUpcomingAssessments] = useState<any[]>([]);
  const [yearlyTrend, setYearlyTrend] = useState<any[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<any[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!isSupabaseConfigured) {
        setLoading(true);
        const fallbackLeadsStr = localStorage.getItem('las_solar_leads_fallback');
        const leadsDataList = fallbackLeadsStr ? JSON.parse(fallbackLeadsStr) : [
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

        const blogsDataList = [
          { id: '1', title: 'Why Solar is a Long Term Investment in the Philippines', views: 320, created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
          { id: '2', title: 'Grid-Tied vs Hybrid Solar Systems Explained', views: 180, created_at: new Date(Date.now() - 86400000 * 10).toISOString() }
        ];
        const totalViews = 500;
        const subscribersDataList = [
          { id: 's1', email: 'newsletter1@example.com', created_at: new Date(Date.now() - 86400000 * 2).toISOString() }
        ];
        const projectsDataList = [
          { id: 'p1', title: 'Completed Solar Installation Red', created_at: new Date(Date.now() - 86400000 * 15).toISOString() }
        ];

        setAllLeads(leadsDataList);
        setAllSubscribers(subscribersDataList);
        setAllProjects(projectsDataList);
        setAllBlogs(blogsDataList);
        setAllViews(totalViews);
        setRecentLeads(leadsDataList.slice(0, 5));

        const upcoming = leadsDataList
          .map((lead: any) => {
            let visitDateStr = lead.ocular_visit_date;
            let visitTimeSlot = '9:00 AM - 12:00 PM';

            if (!visitDateStr && lead.timeline) {
              const match = lead.timeline?.match(/Preferred Ocular Visit:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})(?:\s*\|\s*([^)]+))?/);
              if (match) {
                visitDateStr = match[1];
                visitTimeSlot = match[2] || '9:00 AM - 12:00 PM';
              }
            }

            if (!visitDateStr) return null;
            const parsed = new Date(visitDateStr);
            
            return {
              id: lead.id,
              name: lead.name,
              address: lead.address || '',
              property_type: lead.property_type,
              ocular_visit_date: visitDateStr,
              visitTimeSlot: visitTimeSlot,
              dateObj: parsed,
              isValid: !isNaN(parsed.getTime())
            };
          })
          .filter((u: any): u is any => u !== null && u.isValid);

          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);

          const sortedUpcoming = upcoming
            .filter((u: any) => u.dateObj >= todayStart)
            .sort((a: any, b: any) => a.dateObj.getTime() - b.dateObj.getTime());

          setUpcomingAssessments(sortedUpcoming);

          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const currentYear = new Date().getFullYear();
          const currentMonthIdx = new Date().getMonth();
          const activeMonths = months.slice(0, currentMonthIdx + 1);

          const tempYearly = activeMonths.map((m, index) => {
            const leadCount = leadsDataList.filter((item: any) => {
              if (!item.created_at) return false;
              const d = new Date(item.created_at);
              return d.getFullYear() === currentYear && d.getMonth() === index;
            }).length;

            const subCount = subscribersDataList.filter((item: any) => {
              if (!item.created_at) return false;
              const d = new Date(item.created_at);
              return d.getFullYear() === currentYear && d.getMonth() === index;
            }).length;

            return {
              label: m,
              leads: leadCount,
              subscribers: subCount,
              activities: leadCount + subCount
            };
          });

          setYearlyTrend(tempYearly);

          const tempWeekly = [
            { label: 'Week 1', inquiries: 0, subs: 0, activities: 0 },
            { label: 'Week 2', inquiries: 0, subs: 0, activities: 0 },
            { label: 'Week 3', inquiries: 0, subs: 0, activities: 0 },
            { label: 'Week 4', inquiries: 0, subs: 0, activities: 0 }
          ];

          const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

          leadsDataList.forEach((item: any) => {
            if (!item.created_at) return;
            const d = new Date(item.created_at);
            if (d >= thirtyDaysAgo) {
              const diffDays = Math.floor((todayStart.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
              const wIdx = Math.min(3, Math.floor(diffDays / 7.5));
              const idx = 3 - wIdx;
              if (idx >= 0 && idx < 4) {
                tempWeekly[idx].inquiries++;
                tempWeekly[idx].activities++;
              }
            }
          });

          subscribersDataList.forEach((item: any) => {
            if (!item.created_at) return;
            const d = new Date(item.created_at);
            if (d >= thirtyDaysAgo) {
              const diffDays = Math.floor((todayStart.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
              const wIdx = Math.min(3, Math.floor(diffDays / 7.5));
              const idx = 3 - wIdx;
              if (idx >= 0 && idx < 4) {
                tempWeekly[idx].subs++;
                tempWeekly[idx].activities++;
              }
            }
          });

          setWeeklyTrend(tempWeekly);
          setLoading(false);
          return;
      }

      setLoading(true);
      try {
        const [projects, leads, subscribers, blogs] = await Promise.all([
          supabase.from('projects').select('id, created_at').eq('is_deleted', false),
          supabase.from('leads').select('*').order('created_at', { ascending: false }),
          supabase.from('subscribers').select('*').order('created_at', { ascending: false }),
          supabase.from('blog_posts').select('views, created_at').eq('is_deleted', false)
        ]);

        const blogsDataList = blogs.data || [];
        const totalViews = blogsDataList.reduce((acc, curr) => acc + (curr.views || 0), 0);
        const leadsDataList = leads.data || [];
        const subscribersDataList = subscribers.data || [];
        const projectsDataList = projects.data || [];

        // Store raw items in React state to compute real-time statistics
        setAllLeads(leadsDataList);
        setAllSubscribers(subscribersDataList);
        setAllProjects(projectsDataList);
        setAllBlogs(blogsDataList);
        setAllViews(totalViews);

        // Filter 5 most recent leads
        setRecentLeads((leads.data || []).slice(0, 5));

        // Compile upcoming ocular visits/site assessments
        const upcoming = (leads.data || [])
          .map(lead => {
            let visitDateStr = lead.ocular_visit_date;
            let visitTimeSlot = '9:00 AM - 12:00 PM';

            if (!visitDateStr && lead.timeline) {
              const match = lead.timeline?.match(/Preferred Ocular Visit:\s*([0-9]{4}-[0-9]{2}-[0-9]{2})(?:\s*\|\s*([^)]+))?/);
              if (match) {
                visitDateStr = match[1];
                visitTimeSlot = match[2] || '9:00 AM - 12:00 PM';
              }
            }

            if (!visitDateStr) return null;
            const parsed = new Date(visitDateStr);
            
            return {
              id: lead.id,
              name: lead.name,
              address: lead.address || '',
              property_type: lead.property_type,
              ocular_visit_date: visitDateStr,
              visitTimeSlot: visitTimeSlot,
              dateObj: parsed,
              isValid: !isNaN(parsed.getTime())
            };
          })
          .filter((u): u is any => u !== null && u.isValid);

        // Filter valid upcoming or today's visual visits
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const sortedUpcoming = upcoming
          .filter(u => u.dateObj >= todayStart)
          .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

        setUpcomingAssessments(sortedUpcoming);

        // Compile trends: Monthly labels for Year timeframe (YTD 2026)
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = new Date().getFullYear();
        const currentMonthIdx = new Date().getMonth();
        const activeMonths = months.slice(0, currentMonthIdx + 1);

        const tempYearly = activeMonths.map((m, index) => {
          const leadCount = (leads.data || []).filter(item => {
            if (!item.created_at) return false;
            const d = new Date(item.created_at);
            return d.getFullYear() === currentYear && d.getMonth() === index;
          }).length;

          const subCount = (subscribers.data || []).filter(item => {
            if (!item.created_at) return false;
            const d = new Date(item.created_at);
            return d.getFullYear() === currentYear && d.getMonth() === index;
          }).length;

          return {
            label: m,
            leads: leadCount,
            subscribers: subCount,
            activities: leadCount + subCount
          };
        });

        setYearlyTrend(tempYearly);

        // Compile weekly trend for the "Last 30 Days" timeframe (4 periods)
        const tempWeekly = [
          { label: 'Week 1', inquiries: 0, subs: 0, activities: 0 },
          { label: 'Week 2', inquiries: 0, subs: 0, activities: 0 },
          { label: 'Week 3', inquiries: 0, subs: 0, activities: 0 },
          { label: 'Week 4', inquiries: 0, subs: 0, activities: 0 }
        ];

        const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

        (leads.data || []).forEach(item => {
          if (!item.created_at) return;
          const d = new Date(item.created_at);
          if (d >= thirtyDaysAgo) {
            const diffDays = Math.floor((todayStart.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
            const wIdx = Math.min(3, Math.floor(diffDays / 7.5));
            const idx = 3 - wIdx;
            if (idx >= 0 && idx < 4) {
              tempWeekly[idx].inquiries++;
              tempWeekly[idx].activities++;
            }
          }
        });

        (subscribers.data || []).forEach(item => {
          if (!item.created_at) return;
          const d = new Date(item.created_at);
          if (d >= thirtyDaysAgo) {
            const diffDays = Math.floor((todayStart.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
            const wIdx = Math.min(3, Math.floor(diffDays / 7.5));
            const idx = 3 - wIdx;
            if (idx >= 0 && idx < 4) {
              tempWeekly[idx].subs++;
              tempWeekly[idx].activities++;
            }
          }
        });

        setWeeklyTrend(tempWeekly);

      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Compute live timeframe performance or activities dynamically (Yearly vs Last 30 Days)
  useEffect(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const startOfYear2026 = new Date('2026-01-01T00:00:00Z');
    const startOfYear2025 = new Date('2025-01-01T00:00:00Z');

    if (timeframe === '30days') {
      // Leads (Last 30 days)
      const currentLeads = allLeads.filter(lead => {
        if (!lead.created_at) return false;
        return new Date(lead.created_at) >= thirtyDaysAgo;
      });
      const previousLeads = allLeads.filter(lead => {
        if (!lead.created_at) return false;
        const d = new Date(lead.created_at);
        return d >= sixtyDaysAgo && d < thirtyDaysAgo;
      });

      const currentCount = currentLeads.length;
      const prevCount = previousLeads.length;

      let changeStr = '+0%';
      let positive = true;
      if (prevCount > 0) {
        const percent = ((currentCount - prevCount) / prevCount) * 100;
        positive = percent >= 0;
        changeStr = `${percent >= 0 ? '+' : ''}${percent.toFixed(0)}%`;
      } else if (currentCount > 0) {
        changeStr = `+${currentCount} new`;
      } else {
        changeStr = '0%';
      }

      // Published Projects (Total count in system, and show count added in last 30d in change label)
      const recentProjectsAdded = allProjects.filter(p => {
        if (!p.created_at) return false;
        return new Date(p.created_at) >= thirtyDaysAgo;
      }).length;

      // Total Views (Sum of views of blog posts created in the last 30 days)
      const recentBlogs = allBlogs.filter(b => {
        if (!b.created_at) return false;
        return new Date(b.created_at) >= thirtyDaysAgo;
      });
      const viewsShare = recentBlogs.reduce((acc, curr) => acc + (curr.views || 0), 0);

      // Subscribers (Last 30 days)
      const currentSubs = allSubscribers.filter(sub => {
        if (!sub.created_at) return false;
        return new Date(sub.created_at) >= thirtyDaysAgo;
      });
      const previousSubs = allSubscribers.filter(sub => {
        if (!sub.created_at) return false;
        const d = new Date(sub.created_at);
        return d >= sixtyDaysAgo && d < thirtyDaysAgo;
      });

      const currentSubsCount = currentSubs.length;
      const prevSubsCount = previousSubs.length;

      let subsChangeStr = '+0%';
      let subsPositive = true;
      if (prevSubsCount > 0) {
        const percent = ((currentSubsCount - prevSubsCount) / prevSubsCount) * 100;
        subsPositive = percent >= 0;
        subsChangeStr = `${percent >= 0 ? '+' : ''}${percent.toFixed(0)}%`;
      } else if (currentSubsCount > 0) {
        subsChangeStr = `+${currentSubsCount} new`;
      } else {
        subsChangeStr = '0%';
      }

      setStats([
        { label: 'Leads (30d)', value: currentCount.toString(), change: changeStr, positive: positive, icon: Users },
        { label: 'Published Projects', value: allProjects.length.toString(), change: `+${recentProjectsAdded} new`, positive: true, icon: FileText },
        { label: 'Total Views (30d)', value: viewsShare.toLocaleString(), change: '+0%', positive: true, icon: Zap },
        { label: 'Subscribers (30d)', value: currentSubsCount.toString(), change: subsChangeStr, positive: subsPositive, icon: TrendingUp },
      ]);
    } else {
      // Yearly Frame (Jan 2026 - Present)
      const currentYearLeads = allLeads.filter(lead => {
        if (!lead.created_at) return false;
        return new Date(lead.created_at) >= startOfYear2026;
      });
      const previousYearLeads = allLeads.filter(lead => {
        if (!lead.created_at) return false;
        const d = new Date(lead.created_at);
        return d >= startOfYear2025 && d < startOfYear2026;
      });

      // Avoid showing zero if database baseline is brand new
      const curCount = currentYearLeads.length || allLeads.length;
      const prevCount = previousYearLeads.length;

      let changeStr = '+0%';
      let positive = true;
      if (prevCount > 0) {
        const percent = ((curCount - prevCount) / prevCount) * 100;
        positive = percent >= 0;
        changeStr = `${percent >= 0 ? '+' : ''}${percent.toFixed(0)}%`;
      } else if (currentYearLeads.length > 0) {
        changeStr = `+${currentYearLeads.length} new`;
      }

      // Published Projects (YTD)
      const yearlyProjectsAdded = allProjects.filter(p => {
        if (!p.created_at) return false;
        return new Date(p.created_at) >= startOfYear2026;
      }).length;
      const projectsYearlyChange = `+${yearlyProjectsAdded} new`;

      // Total Views (Overall views since start of year)
      const yearlyBlogs = allBlogs.filter(b => {
        if (!b.created_at) return false;
        return new Date(b.created_at) >= startOfYear2026;
      });
      const viewsCount = yearlyBlogs.reduce((acc, curr) => acc + (curr.views || 0), 0);

      // Subscribers (Yearly)
      const currentYearSubs = allSubscribers.filter(sub => {
        if (!sub.created_at) return false;
        return new Date(sub.created_at) >= startOfYear2026;
      });
      const previousYearSubs = allSubscribers.filter(sub => {
        if (!sub.created_at) return false;
        const d = new Date(sub.created_at);
        return d >= startOfYear2025 && d < startOfYear2026;
      });

      const curSubsCount = currentYearSubs.length || allSubscribers.length;
      const prevSubsCount = previousYearSubs.length;

      let subsChangeStr = '+0%';
      let subsPositive = true;
      if (prevSubsCount > 0) {
        const percent = ((curSubsCount - prevSubsCount) / prevSubsCount) * 100;
        subsPositive = percent >= 0;
        subsChangeStr = `${percent >= 0 ? '+' : ''}${percent.toFixed(0)}%`;
      } else if (currentYearSubs.length > 0) {
        subsChangeStr = `+${currentYearSubs.length} new`;
      }

      setStats([
        { label: 'Total Leads (YTD)', value: curCount.toString(), change: changeStr, positive: positive, icon: Users },
        { label: 'Published Projects', value: allProjects.length.toString(), change: projectsYearlyChange, positive: true, icon: FileText },
        { label: 'Total Views (YTD)', value: viewsCount.toLocaleString(), change: '+0%', positive: true, icon: Zap },
        { label: 'Subscribers (YTD)', value: curSubsCount.toString(), change: subsChangeStr, positive: subsPositive, icon: TrendingUp },
      ]);
    }
  }, [timeframe, allLeads, allSubscribers, allProjects, allBlogs, allViews]);

  const parseOcularDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return {
          day: d.getDate(),
          month: d.toLocaleString('en-US', { month: 'short' }),
          year: d.getFullYear()
        };
      }
    } catch (e) {}
    return {
      day: '??',
      month: 'Visit',
      year: '2026'
    };
  };

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mb-4 text-app-purple" size={32} />
        <p className="text-sm font-black uppercase tracking-widest">Assembling Live Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* Top dashboard header row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-black text-black tracking-tight">DASHBOARD OVERVIEW</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Platform Performance & Statistics</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="bg-white p-2 rounded-2xl border border-slate-100 flex items-center justify-between sm:justify-start gap-2 shadow-sm">
            <button 
              onClick={() => setTimeframe('30days')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest leading-none transition-all ${
                timeframe === '30days' ? 'bg-black text-white shadow-md' : 'text-slate-400 hover:text-black hover:bg-slate-50'
              }`}
            >
              Last 30 Days
            </button>
            <button 
              onClick={() => setTimeframe('yearly')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest leading-none transition-all ${
                timeframe === 'yearly' ? 'bg-black text-white shadow-md' : 'text-slate-400 hover:text-black hover:bg-slate-50'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm transition-transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-slate-50 rounded-2xl text-black">
                <stat.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${stat.positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {stat.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.change}
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">{stat.label}</p>
            <h3 className="text-3xl font-display font-black text-black">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Dynamic Activity Trend Chart Section */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-black">
              {timeframe === 'yearly' ? 'Yearly Activity & Engagement (2026 YTD)' : 'Weekly Performance Trends (Last 30 Days)'}
            </h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Representing newly registered inquiries and email newsletter subscribers</p>
          </div>
          <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-app-purple"></span>
              <span className="text-slate-600">Total Activities Intake</span>
            </div>
          </div>
        </div>

        {/* Custom SVG Drawing representing responsive line charts */}
        <div className="h-60 relative w-full pt-4">
          {(() => {
            const currentTrend = timeframe === 'yearly' ? yearlyTrend : weeklyTrend;
            const maxVal = Math.max(...currentTrend.map(t => t.activities), 5);
            
            const pointsCount = currentTrend.length;
            const height = 200;
            const paddingLeft = 40;
            const paddingRight = 20;
            const paddingTop = 20;
            const paddingBottom = 30;
            
            return (
              <div className="w-full h-full">
                <svg className="w-full h-full" viewBox={`0 0 800 ${height}`} preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chart-slope-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7E22CE" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#7E22CE" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal visual reference grids */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                    const y = paddingTop + ratio * (height - paddingTop - paddingBottom);
                    const labelVal = Math.round(maxVal * (1 - ratio));
                    return (
                      <g key={index}>
                        <line 
                          x1={paddingLeft} 
                          y1={y} 
                          x2={800 - paddingRight} 
                          y2={y} 
                          stroke="#F8FAFC" 
                          strokeWidth="2" 
                        />
                        <text 
                          x={paddingLeft - 10} 
                          y={y + 4} 
                          fill="#94A3B8" 
                          fontSize="9" 
                          fontWeight="bold"
                          textAnchor="end"
                        >
                          {labelVal}
                        </text>
                      </g>
                    );
                  })}

                  {/* SVG paths generation */}
                  {(() => {
                    const widthLimit = 800 - paddingLeft - paddingRight;
                    const mappedPoints = currentTrend.map((d, idx) => {
                      const x = paddingLeft + (idx / (pointsCount - 1)) * widthLimit;
                      const y = height - paddingBottom - (d.activities / maxVal) * (height - paddingTop - paddingBottom);
                      return { x, y, label: d.label, val: d.activities };
                    });

                    if (mappedPoints.length === 0) return null;

                    const lineD = mappedPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                    const areaD = `${lineD} L ${mappedPoints[mappedPoints.length - 1].x} ${height - paddingBottom} L ${mappedPoints[0].x} ${height - paddingBottom} Z`;

                    return (
                      <>
                        {/* Shaded bottom gradient */}
                        <path d={areaD} fill="url(#chart-slope-glow)" />

                        {/* Bold purple gradient line overlay */}
                        <path 
                          d={lineD} 
                          fill="none" 
                          stroke="#7E22CE" 
                          strokeWidth="3.5" 
                          strokeLinecap="round"
                          strokeLinejoin="round" 
                        />

                        {/* Node circles */}
                        {mappedPoints.map((p, i) => (
                          <g 
                            key={i} 
                            className="cursor-pointer group"
                            onMouseEnter={() => setHoveredPoint({ ...p, idx: i })}
                            onMouseLeave={() => setHoveredPoint(null)}
                          >
                            <circle 
                              cx={p.x} 
                              cy={p.y} 
                              r="5" 
                              fill="#7E22CE" 
                              stroke="#FFFFFF" 
                              strokeWidth="2.5" 
                            />
                            <circle 
                              cx={p.x} 
                              cy={p.y} 
                              r="10" 
                              fill="#7E22CE" 
                              className="opacity-0 group-hover:opacity-20 transition-opacity" 
                            />
                            <text 
                              x={p.x} 
                              y={height - 10} 
                              fill="#64748B" 
                              fontSize="9" 
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              {p.label}
                            </text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>

                 {/* Hover markup details */}
                <AnimatePresence>
                  {hoveredPoint && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bg-slate-950 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider space-y-0.5 shadow-xl pointer-events-none"
                      style={{ 
                        left: `${(hoveredPoint.x / 800) * 100}%`, 
                        top: `${(hoveredPoint.y / 240) * 100 - 15}%`,
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <p className="text-slate-400 font-bold">{hoveredPoint.label}</p>
                      <p className="text-app-purple">{hoveredPoint.val} Activities</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })()}
        </div>

        {/* Actual Numbers Slide breakdown */}
        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Period Breakdown ({timeframe === 'yearly' ? 'Yearly YTD' : 'Last 30 Days'})</h4>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-black mt-0.5">Slide to view actual metrics per period</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button 
                type="button"
                onClick={() => {
                  const el = document.getElementById('period-breakdown-slider');
                  if (el) el.scrollBy({ left: -240, behavior: 'smooth' });
                }}
                className="p-1.5 rounded-lg bg-slate-50 border border-slate-150 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Slide Left"
              >
                <ChevronLeft size={14} />
              </button>
              <button 
                type="button"
                onClick={() => {
                  const el = document.getElementById('period-breakdown-slider');
                  if (el) el.scrollBy({ left: 240, behavior: 'smooth' });
                }}
                className="p-1.5 rounded-lg bg-slate-50 border border-slate-150 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer shadow-sm active:scale-95"
                title="Slide Right"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div 
            id="period-breakdown-slider" 
            className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scroll-smooth [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300"
          >
            {(timeframe === 'yearly' ? yearlyTrend : weeklyTrend).map((item, idx) => {
              const leadsCount = item.leads !== undefined ? item.leads : item.inquiries;
              const subsCount = item.subscribers !== undefined ? item.subscribers : item.subs;
              return (
                <div 
                  key={idx} 
                  className="w-48 shrink-0 bg-slate-50 border border-slate-150/50 hover:border-app-purple/25 p-5 rounded-2xl flex flex-col justify-between space-y-4 transition-all duration-300 shadow-sm hover:shadow-md snap-start"
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block border-b border-slate-200/50 pb-1.5">{item.label}</span>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>Leads:</span>
                      <span className="font-mono text-black font-black">{leadsCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>Subs:</span>
                      <span className="font-mono text-black font-black">{subsCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-black text-app-purple pt-2 border-t border-slate-200/50">
                      <span>Total:</span>
                      <span className="font-mono font-black">{item.activities}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Leads Panel */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-widest text-black">Recent Inquiries</h4>
            <button 
              onClick={() => navigate('/admin/dashboard/leads')}
              className="text-[10px] font-black uppercase tracking-widest text-white bg-app-purple hover:bg-black px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Client Name</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Type</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400">Status</th>
                  <th className="px-8 py-4 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    onClick={() => navigate(`/admin/dashboard/leads/${lead.id}`)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-black">{lead.name}</span>
                        <span className="text-[10px] font-medium text-slate-400">{lead.phone || lead.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[10px] font-bold uppercase tracking-widest py-1 px-2 bg-slate-100 text-slate-600 rounded">
                        {lead.property_type}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${lead.status === 'New' ? 'bg-app-purple' : lead.status === 'In Progress' ? 'bg-blue-400' : 'bg-green-400'}`}></div>
                        <span className="text-xs font-bold text-slate-600">{lead.status}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-[10px] font-bold text-slate-400">{new Date(lead.created_at).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))}
                {recentLeads.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-slate-400">
                      <p className="text-[10px] font-black uppercase tracking-widest">No recent inquiries found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Up Next / Assessment Audits Panel */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-black">Up Next Assessments</h4>
              <button
                type="button"
                onClick={() => {
                  const headerCalBtn = document.getElementById('admin-header-calendar-btn');
                  if (headerCalBtn) {
                    headerCalBtn.click();
                  } else {
                    setIsCalendarOpen(true);
                  }
                }}
                className="p-1.5 hover:bg-slate-100 text-app-purple rounded-lg transition-colors cursor-pointer animate-pulse"
                title="Launch scheduling deck"
              >
                <Calendar className="text-app-purple" size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              {upcomingAssessments.slice(0, 4).map((assessment) => {
                const d = parseOcularDate(assessment.ocular_visit_date);
                const status = meetingStatuses[assessment.id] || 'Scheduled';
                return (
                  <div 
                    key={assessment.id} 
                    onClick={() => navigate(`/admin/dashboard/leads/${assessment.id}`)}
                    className="flex gap-4 p-4 rounded-3xl bg-slate-50 hover:bg-slate-100/70 border border-slate-100 transition-all hover:scale-[1.01] cursor-pointer"
                    title="Click to view file details"
                  >
                    <div className="bg-white w-12 h-12 rounded-xl flex flex-col items-center justify-center border border-slate-100 shadow-sm shrink-0">
                      <span className="text-xs font-black text-black leading-none">{d.day}</span>
                      <span className="text-[7.5px] font-black uppercase text-app-purple mt-0.5">{d.month}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 justify-between">
                        <p className="text-xs font-black text-slate-900 truncate">{assessment.name}</p>
                        <span className={`text-[7.5px] font-black uppercase border px-1.5 py-0.5 rounded shrink-0 ${
                          status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          status === 'Postponed' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                          'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {status}
                        </span>
                      </div>
                      <p className="text-[9px] font-medium text-slate-400 truncate mt-0.5">{assessment.property_type} | {assessment.address || 'Click for site details'}</p>
                    </div>
                  </div>
                );
              })}

              {upcomingAssessments.length === 0 && (
                <div className="py-12 text-center text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-100">
                  <Calendar className="mx-auto mb-2 text-slate-300" size={32} />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">No Up Next Audits</p>
                  <p className="text-[8px] mt-1 text-slate-400">Ocular site visual visits have not been scheduled yet.</p>
                </div>
              )}
            </div>
          </div>
          
          {upcomingAssessments.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-50">
              <button 
                onClick={() => {
                  const headerCalBtn = document.getElementById('admin-header-calendar-btn');
                  if (headerCalBtn) {
                    headerCalBtn.click();
                  } else {
                    setIsCalendarOpen(true);
                  }
                }}
                className="w-full text-center text-[9px] font-black text-slate-400 hover:text-app-purple uppercase tracking-widest transition-all"
              >
                Inspect All scheduled audits &rarr;
              </button>
            </div>
          )}
        </div>

      </div>

      <CalendarSchedulerModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        leads={allLeads}
        onStatusUpdated={() => {
          try {
            const saved = localStorage.getItem('las_solar_meeting_status_overrides');
            if (saved) {
              setMeetingStatuses(JSON.parse(saved));
            }
          } catch (e) {}
        }}
      />

    </div>
  );
}
