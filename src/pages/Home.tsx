import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  Users, 
  Clock, 
  Leaf, 
  Factory, 
  Sun, 
  Battery, 
  Settings,
  ChevronDown,
  Star,
  Quote,
  Workflow,
  Gauge,
  Loader2
} from 'lucide-react';
import CTASection from '../components/common/CTASection';
import QuoteForm from '../components/QuoteForm';
const heroImage = "https://scontent-mnl3-2.xx.fbcdn.net/v/t39.30808-6/706990468_122112663986816956_8363561635734656007_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=107&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeHl3sd3OnfY7ha9hjt4ID60wxVwGX_1uH_DFXAZf_W4f7FgQWSU09gy4xGu6kLyAP3SSB6HDEwCYksETDMvB9qR&_nc_ohc=rMAuKZZAXmsQ7kNvwE2LGTN&_nc_oc=Adq0b0DChadyCHpq-b1JC6fgzuL1bceAi_bMRccySkJWsT4cQ2rYIH3ZBOJEEDsFnjQ&_nc_zt=23&_nc_ht=scontent-mnl3-2.xx&_nc_gid=h2xLxs6A_6iZXHSev_b8FA&_nc_ss=7b2a8&oh=00_Af-zkl9GfridF9ehCwhv4xPh3XHf1VB94-nKdwv81dNv8Q&oe=6A21D4E7";
import problemImage from '../assets/images/regenerated_image_1780214689573.jpg';
import greenTomorrowImage from '../assets/images/regenerated_image_1780214695765.jpg';
import { supabase, Project, isSupabaseConfigured, Testimonial, safeDbQuery } from '../lib/supabase';

const HARDWARE_PARTNERS = [
  {
    name: 'Jinko Solar',
    logo: 'https://lh3.googleusercontent.com/d/11Z1bop8N_7Zqn5klXe_ASJDmVyJYfDb3',
  },
  {
    name: 'Aiko',
    logo: 'https://lh3.googleusercontent.com/d/1mRxcxp7Q_nwl5hW09D26m0GFRV7ImZ8U',
  },
  {
    name: 'Trina Solar',
    logo: 'https://lh3.googleusercontent.com/d/1SXhm2lRnPRM6b8UUGHkeMUFlMFzf8vDt',
  },
  {
    name: 'JA Solar',
    logo: 'https://lh3.googleusercontent.com/d/1oJcv0EOYfDjyjWkB7UGGfqK7zKGdeKWP',
  },
  {
    name: 'Bluetti',
    logo: 'https://lh3.googleusercontent.com/d/1g-ZKovG2vlSW1MTqxC8pRc5huozyhDly',
  },
  {
    name: 'Longi Solar',
    logo: 'https://lh3.googleusercontent.com/d/1Kc2XqAucFfxJo40gc2xx5R19Wt2IPeSA',
  },
  {
    name: 'Pylontech',
    logo: 'https://lh3.googleusercontent.com/d/1D9JhjOcZK3jSVUga_MB7D-6cajrbfUO8',
  },
  {
    name: 'Solis',
    logo: 'https://lh3.googleusercontent.com/d/1gFPd_UEiQu2b-loJFdUelcStmy6rF-FO',
  },
  {
    name: 'Deye',
    logo: 'https://lh3.googleusercontent.com/d/1oqYBjA-Orzi9ug07xoitT-v5qd2VfZ-2',
  },
  {
    name: 'Auxsol',
    logo: 'https://lh3.googleusercontent.com/d/1aBBHOgrZMS0DDBr-O0pVy7QIx71js_Lk',
  },
];

function ValueAccordions() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = [
    {
      icon: <Workflow className="text-black" size={24} />,
      title: "Personalized Craftsmanship",
      content: "No two homes are identical. We provide bespoke solar designs that respect your property's aesthetics while maximizing energy harvest. Our team pays attention to every minor detail, ensuring a seamless integration with your existing structure."
    },
    {
      icon: <Gauge className="text-black" size={24} />,
      title: "Expert Engineering",
      content: "Our systems are built to withstand the unique climatic challenges of the Philippines. From high-wind load mounts to advanced surge protection, we utilize industry-leading engineering practices to ensure your system remains operational for decades."
    },
    {
      icon: <Users className="text-black" size={24} />,
      title: "Community Commitment",
      content: "Based right here in Cavite, we are part of your community. Our response times are fast, our service is personal, and our mission is to enlighten our neighbors' futures through sustainable energy empowerment."
    }
  ];

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div 
          key={idx} 
          className={`rounded-2xl border transition-all duration-300 ${
            openIndex === idx 
              ? 'bg-white border-app-purple shadow-lg' 
              : 'bg-transparent border-slate-200 hover:border-app-purple/50'
          }`}
        >
          <button 
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full p-6 flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-5">
              <div className={`p-3 rounded-xl transition-colors duration-300 ${
                openIndex === idx ? 'bg-app-purple text-white' : 'bg-slate-100'
              }`}>
                {item.icon}
              </div>
              <h4 className="text-xl font-black text-black uppercase tracking-tight">{item.title}</h4>
            </div>
            <ChevronDown 
              className={`text-black transition-transform duration-300 ${
                openIndex === idx ? 'rotate-180' : ''
              }`} 
              size={20} 
            />
          </button>
          <AnimatePresence>
            {openIndex === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className="px-6 pb-6 pl-[84px] text-slate-slate/70 leading-relaxed font-light text-base">
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const testimonialImages = [
    "https://lh3.googleusercontent.com/d/19GogkETvt0kZfiinnBpZXA2jJUjqiIrk",
    "https://lh3.googleusercontent.com/d/1MafZSpf7MGbkj8UiMH6iS3AgSDnabfaz",
    "https://lh3.googleusercontent.com/d/1ElHxHW9NufFErC4Oa8mmIRoypydaTc24",
    "https://lh3.googleusercontent.com/d/1pG4iZbuTizZahW40qS0RjQwqsjx9miiO"
  ];

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      const [projRes, testRes] = await Promise.all([
        safeDbQuery(
          () => supabase
            .from('projects')
            .select('*')
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(5),
          () => supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5)
        ),
        supabase
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      setProjects(projRes.data || []);
      setTestimonials(testRes.data || []);
    } catch (err) {
      console.error('Home data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[65vh] flex items-center overflow-hidden bg-black pt-20 lg:pt-0">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Cinematic solar installation"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10 py-8 lg:py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:py-4"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2.5 h-2.5 bg-app-purple shrink-0"></div>
                <span className="text-app-purple uppercase tracking-[0.3em] text-[10px] font-black">Premier Solar Installer in Cavite</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-6xl xl:text-7xl text-white font-display font-black leading-[0.9] mb-6 uppercase tracking-tighter">
                Empower Your <span className="text-app-purple">Home</span> <br />
                Enlighten Your <span className="text-app-purple">Future</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 max-w-xl mb-8 leading-relaxed font-light">
                Premium solar solutions tailored for Cavite households and businesses. Start your journey toward energy independence today with our expert team.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 mb-10">
                <NavLink to="/request-quote" className="bg-app-purple text-white px-10 py-5 rounded-none font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-app-purple/90 transition-all">
                  Request a Quote <ArrowRight size={16} />
                </NavLink>
                <NavLink to="/services" className="border border-white/20 text-white px-10 py-5 rounded-none font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                  Our Services
                </NavLink>
              </div>

              {/* Avatar Social Proof - Clean Style */}
              <div className="flex items-center gap-6 mb-8">
                <div className="flex -space-x-4">
                  {testimonialImages.map((imgUrl, i) => (
                    <div 
                      key={i} 
                      className="w-12 h-12 rounded-full border-2 border-slate-950 overflow-hidden relative shadow-lg hover:z-10 transition-transform"
                    >
                      <img 
                        src={imgUrl} 
                        alt={`Client review ${i + 1}`} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                </div>
                <div className="h-8 w-px bg-white/10 mx-2"></div>
                <div>
                  <div className="flex gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} className="fill-app-purple text-app-purple" />
                    ))}
                  </div>
                  <p className="text-white font-black text-[10px] uppercase tracking-widest">100+ Happy Clients in Imus</p>
                </div>
              </div>

              {/* Energy Impact Metrics */}
              <div className="pt-8 border-t border-white/5 max-w-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <p className="text-2xl font-display font-black text-white leading-tight">50-80-100%</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Average Bill Reduction</p>
                  </div>
                  <div>
                    <p className="text-2xl font-display font-black text-white leading-tight">50+</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Tier-1 Panels Installed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-display font-black text-white leading-tight">100%</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Stress Free Billing</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <QuoteForm className="mx-auto lg:ml-auto max-w-[480px]" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Hardware Partners Logo Bar - Updated with gray background, black text, and true-color logos */}
      <section className="py-12 bg-slate-100 border-y border-slate-200 overflow-hidden">
        <div className="w-full">
            <p className="text-center mb-10 text-[10px] font-black uppercase tracking-[0.4em] text-black">Premium Hardware Alliance</p>
            <div className="relative w-full overflow-hidden">
              <div className="animate-marquee-ltr flex items-center transition-all duration-500">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-x-12 md:gap-x-16 pr-12 md:pr-16 shrink-0">
                    {HARDWARE_PARTNERS.map((partner, idx) => (
                      <div 
                        key={`${partner.name}-${i}-${idx}`} 
                        className="flex items-center justify-center h-20 w-44 md:w-60 shrink-0 px-4 transition-all duration-300"
                      >
                        <img 
                          src={partner.logo} 
                          alt={partner.name} 
                          title={partner.name}
                          className="h-14 md:h-20 w-auto max-w-full object-contain hover:scale-110 active:scale-95 duration-300 transition-all select-none"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
        </div>
      </section>

      {/* The Problem/Solution Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          {/* Desktop Layout */}
          <div className="hidden lg:grid grid-cols-2 gap-20 items-center">
             <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative pb-10 pr-10"
             >
                <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl outline outline-2 outline-offset-8 outline-black">
                    <img
                        src={problemImage}
                        alt="Rising energy costs visual"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                </div>
                <div className="absolute -bottom-10 -right-10 w-64 p-8 bg-black border-4 border-white rounded-[2.5rem] shadow-xl text-white hidden md:block">
                    <p className="text-sm font-bold text-app-purple mb-2 uppercase tracking-wide">The Impact</p>
                    <p className="text-lg leading-snug font-light">Solar energy reduces your carbon footprint while increasing property value by up to 15%.</p>
                </div>
             </motion.div>

             <div>
                <span className="text-black font-bold uppercase tracking-widest text-sm mb-4 block">Efficiency & Savings</span>
                <h2 className="text-4xl md:text-5xl text-black mb-8 uppercase font-black tracking-tight leading-tight">
                    Tired of Rising <span className="text-app-purple">Electricity</span> Costs?
                </h2>
                <div className="space-y-6 text-lg text-black/80 leading-relaxed font-light">
                    <p>
                        In Cavite, households and businesses are facing record-high utility rates year after year. Every sunrise is a missed opportunity to generate free, clean energy for your property.
                    </p>
                    <p>
                        Las Solar Set-up provides a bridge to energy independence. By harvesting the Philippine sun, we help you lock in energy rates for 25+ years, shield your family from power outages, and contribute to a greener Imus.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-8 mt-12">
                    <div className="flex gap-4">
                        <div className="bg-app-purple/10 p-3 rounded-xl shrink-0 h-fit">
                            <Leaf className="text-app-purple" size={24} />
                        </div>
                        <div>
                            <h4 className="font-display font-bold text-lg text-black">Eco-Friendly</h4>
                            <p className="text-sm text-black/70">100% clean, renewable energy.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-app-purple/10 p-3 rounded-xl shrink-0 h-fit">
                            <BarChart3 className="text-app-purple" size={24} />
                        </div>
                        <div>
                            <h4 className="font-display font-bold text-lg text-black">ROI Driven</h4>
                            <p className="text-sm text-black/70">Payback within 3-5 years.</p>
                        </div>
                    </div>
                </div>
             </div>
          </div>

          {/* Mobile & Tablet Layout */}
          <div className="block lg:hidden space-y-8">
            <div>
              <span className="text-black font-bold uppercase tracking-widest text-sm mb-4 block">Efficiency & Savings</span>
              <h2 className="text-3xl md:text-4xl text-black uppercase font-black tracking-tight leading-tight">
                Tired of Rising <span className="text-app-purple">Electricity</span> Costs?
              </h2>
            </div>

            {/* Mobile Image: width 100%, no offset or alignment, directly below title */}
            <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-xl outline outline-2 outline-offset-4 outline-black">
              <img
                src={problemImage}
                alt="Rising energy costs visual"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-6 text-base text-black/80 leading-relaxed font-light">
              <p>
                In Cavite, households and businesses are facing record-high utility rates year after year. Every sunrise is a missed opportunity to generate free, clean energy for your property.
              </p>
              <p>
                Las Solar Set-up provides a bridge to energy independence. By harvesting the Philippine sun, we help you lock in energy rates for 25+ years, shield your family from power outages, and contribute to a greener Imus.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex gap-4">
                <div className="bg-app-purple/10 p-3 rounded-xl shrink-0 h-fit">
                  <Leaf className="text-app-purple" size={24} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-black">Eco-Friendly</h4>
                  <p className="text-sm text-black/70">100% clean, renewable energy.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-app-purple/10 p-3 rounded-xl shrink-0 h-fit">
                  <BarChart3 className="text-app-purple" size={24} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-black">ROI Driven</h4>
                  <p className="text-sm text-black/70">Payback within 3-5 years.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem/Solution Section - Reversed Duplicate */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          {/* Desktop Layout */}
          <div className="hidden lg:grid grid-cols-2 gap-20 items-center">
             <div className="order-2 lg:order-1">
                <span className="text-black font-bold uppercase tracking-widest text-sm mb-4 block">Sustainable Growth</span>
                <h2 className="text-4xl md:text-5xl text-black mb-8 uppercase font-black tracking-tight leading-tight">
                    Investing a <span className="text-app-purple">Green</span> Tomorrow
                </h2>
                <div className="space-y-6 text-lg text-black/80 leading-relaxed font-light">
                    <p>
                        Switching to solar is a vital commitment to the environment. By reducing grid reliance, we help preserve the natural beauty of the Philippines for future generations.
                    </p>
                    <p>
                        At Las Solar Set-up, we make sustainable energy accessible to every Cavite home. Our world-class engineering and top-tier components ensure peak performance for decades.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-8 mt-12">
                    <div className="flex gap-4">
                        <div className="bg-app-purple/10 p-3 rounded-xl shrink-0 h-fit">
                            <ShieldCheck className="text-app-purple" size={24} />
                        </div>
                        <div>
                            <h4 className="font-display font-bold text-lg text-black">Certified Quality</h4>
                            <p className="text-sm text-black/70">Tier 1 hardware components.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-app-purple/10 p-3 rounded-xl shrink-0 h-fit">
                            <Zap className="text-app-purple" size={24} />
                        </div>
                        <div>
                            <h4 className="font-display font-bold text-lg text-black">Fast Setup</h4>
                            <p className="text-sm text-black/70">Installed and ready in days.</p>
                        </div>
                    </div>
                </div>
             </div>

             <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative order-1 lg:order-2 pt-10 pl-10"
             >
                <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl outline outline-2 outline-offset-8 outline-app-purple">
                    <img
                        src={greenTomorrowImage}
                        alt="Sustainable solar energy"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                </div>
                <div className="absolute -top-10 -left-10 w-64 p-8 bg-app-purple border-4 border-white rounded-[2.5rem] shadow-xl text-white hidden md:block">
                    <p className="text-sm font-bold opacity-70 mb-2 uppercase tracking-wide">The Future</p>
                    <p className="text-lg leading-snug font-light">Average solar system life exceeds 25 years with minimal maintenance required.</p>
                </div>
             </motion.div>
          </div>

          {/* Mobile & Tablet Layout */}
          <div className="block lg:hidden space-y-8">
            <div>
              <span className="text-black font-bold uppercase tracking-widest text-sm mb-4 block">Sustainable Growth</span>
              <h2 className="text-3xl md:text-4xl text-black uppercase font-black tracking-tight leading-tight">
                Investing a <span className="text-app-purple">Green</span> Tomorrow
              </h2>
            </div>

            {/* Mobile Image: width 100%, no offset or alignment, directly below title */}
            <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-xl outline outline-2 outline-offset-4 outline-app-purple">
              <img
                src={greenTomorrowImage}
                alt="Sustainable solar energy"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-6 text-base text-black/80 leading-relaxed font-light">
              <p>
                Switching to solar is a vital commitment to the environment. By reducing grid reliance, we help preserve the natural beauty of the Philippines for future generations.
              </p>
              <p>
                At Las Solar Set-up, we make sustainable energy accessible to every Cavite home. Our world-class engineering and top-tier components ensure peak performance for decades.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex gap-4">
                <div className="bg-app-purple/10 p-3 rounded-xl shrink-0 h-fit">
                  <ShieldCheck className="text-app-purple" size={24} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-black">Certified Quality</h4>
                  <p className="text-sm text-black/70">Tier 1 hardware components.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-app-purple/10 p-3 rounded-xl shrink-0 h-fit">
                  <Zap className="text-app-purple" size={24} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-black">Fast Setup</h4>
                  <p className="text-sm text-black/70">Installed and ready in days.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Teasers */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
            <div className="max-w-2xl mb-16">
                <span className="text-black font-bold uppercase tracking-widest text-sm mb-4 block">What We Offer</span>
                <h2 className="text-4xl md:text-5xl text-black mb-6 uppercase font-black tracking-tight leading-tight">
                    Solar Solutions for <br /><span className="text-app-purple">Every Need</span>
                </h2>
                <p className="text-lg text-slate-slate/70 font-light">Whether it's for your home sanctuary or your growing business, we have the technical expertise to design your perfect system.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    {
                        title: 'Residential',
                        desc: 'Custom rooftop systems designed to eliminate your monthly energy bill and power your household appliances with clean energy.',
                        icon: <Users className="text-app-purple" size={32} />,
                        image: 'https://gosolarphilippines.com/wp-content/uploads/2023/02/The-Benefits-of-Solar-Energy-for-Homeowners-in-the-Philippines.jpg'
                    },
                    {
                        title: 'Commercial',
                        desc: 'Scalable energy systems for warehouses, retail spaces, and offices to reduce overhead and improve your bottom line.',
                        icon: <BarChart3 className="text-app-purple" size={32} />,
                        image: 'https://www.solarrooftops.ph/img/slider/slider2.jpg'
                    },
                    {
                        title: 'Industrial',
                        desc: 'High-performance solar arrays for manufacturing plants and large industrial facilities optimized for massive energy loads.',
                        icon: <Factory className="text-app-purple" size={32} />,
                        image: 'https://solaren-power.com/wp-content/uploads/2025/12/What-Drives-the-Price-Variation.webp'
                    },
                    {
                        title: 'Off-Grid',
                        desc: 'Total energy independence for remote locations. Perfect for farms, resorts, or mountain homes without grid access.',
                        icon: <Sun className="text-app-purple" size={32} />,
                        image: 'https://www.tanfon.com/uploadfile/2023/05/20/20230520142513PlLXdS.jpg'
                    },
                    {
                        title: 'Battery Storage',
                        desc: 'Advanced Energy Storage Systems (ESS) to power your property through the night or during critical grid failures.',
                        icon: <Battery className="text-app-purple" size={32} />,
                        image: 'https://solenergy.com.ph/wp-content/uploads/2016/05/battery-1024x768.jpg'
                    },
                    {
                        title: 'Maintenance',
                        desc: 'Professional cleaning, system health checks, and performance optimization to ensure your investment stays bright.',
                        icon: <Settings className="text-app-purple" size={32} />,
                        image: 'https://solarsystemsphilippines.com/wp-content/uploads/2025/04/solar-panel-system-maintenance-important-blog-1024x682.jpg'
                    }
                ].map((s, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ y: -10 }}
                        className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300"
                    >
                        <div className="h-48 overflow-hidden">
                            <img src={s.image} alt={s.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                        </div>
                        <div className="p-8">
                            <div className="bg-black w-14 h-14 rounded-2xl flex items-center justify-center mb-6 -mt-16 relative z-10 shadow-lg border-4 border-white">
                                {s.icon}
                            </div>
                            <h3 className="text-2xl font-black text-black mb-4 uppercase">{s.title}</h3>
                            <p className="text-slate-slate/70 text-sm leading-relaxed mb-8">
                                {s.desc}
                            </p>
                            <NavLink to="/services" className="text-black font-bold text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                                Explore Service <ArrowRight size={16} />
                            </NavLink>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div className="max-w-2xl">
                    <span className="text-black font-bold uppercase tracking-widest text-sm mb-4 block">Our Portfolio</span>
                    <h2 className="text-4xl md:text-5xl text-black uppercase font-black tracking-tight leading-tight">
                        Powering <span className="text-app-purple">Cavite</span> Project by Project
                    </h2>
                </div>
                <NavLink to="/portfolio" className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-slate-800 transition-all whitespace-nowrap flex items-center gap-2 h-fit">
                    View All Projects <ArrowRight size={18} />
                </NavLink>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[400px]">
                {loading ? (
                  <div className="col-span-full flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="animate-spin mb-4" size={48} />
                    <p className="text-xl font-display font-black uppercase tracking-widest">Loading Projects...</p>
                  </div>
                ) : projects.length > 0 ? (
                  projects.map((p, idx) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className={`group relative overflow-hidden rounded-[2rem] shadow-lg ${idx === 0 ? 'md:col-span-2 h-[380px]' : 'h-[380px]'}`}
                    >
                        <NavLink to={`/portfolio/${p.id}`}>
                          <img 
                              src={p.image_url || p.thumbnails?.[0] || 'https://images.unsplash.com/photo-1513694490325-c4d720af21be?auto=format&fit=crop&q=80&w=1000'} 
                              alt={p.title} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                              referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/60 group-hover:bg-black/20 transition-all duration-500"></div>
                          <div className="absolute inset-0 p-10 flex flex-col justify-end">
                              <span className="text-app-purple text-xs font-bold uppercase tracking-widest mb-2">{p.location}</span>
                              <h3 className="text-white text-2xl font-black uppercase mb-1">{p.title}</h3>
                              <p className="text-white/70 text-sm font-medium">{p.system_size}</p>
                          </div>
                        </NavLink>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full flex items-center justify-center text-slate-400 italic">
                    No completed projects to display yet.
                  </div>
                )}
            </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <span className="text-black font-bold uppercase tracking-widest text-sm mb-4 block">Why Choose Us</span>
                    <h2 className="text-4xl md:text-5xl text-black mb-8 uppercase font-black tracking-tight leading-tight">
                        The Best <span className="text-app-purple">Investment</span> For Your Family
                    </h2>
                    <div className="space-y-6 text-lg text-black/80 leading-relaxed font-light">
                        <p>
                            With utility rates in Cavite climbing, solar transforms a recurring expense into a wealth-building asset.
                        </p>
                        <p>
                            We combine local expertise with world-class engineering to build relationships based on reliability, precision, and a shared commitment to a sustainable future.
                        </p>
                    </div>
                </motion.div>

                <div>
                    <ValueAccordions />
                </div>
            </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto text-center mb-20">
                <span className="text-black font-bold uppercase tracking-widest text-sm mb-4 block">Client Feedback</span>
                <h2 className="text-4xl md:text-5xl text-black uppercase font-black tracking-tight leading-tight">
                    Trusted by <span className="text-app-purple">Local</span> Homeowners
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {testimonials.length > 0 ? (
                  testimonials.map((t, idx) => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col relative"
                    >
                        <div className="absolute top-8 right-10 opacity-10">
                            <Quote size={60} className="text-black" />
                        </div>
                        <div className="flex gap-1 mb-6">
                            {[...Array(t.rating || 5)].map((_, i) => (
                                <Star key={i} size={18} className="fill-app-purple text-app-purple" />
                            ))}
                        </div>
                        <p className="text-lg text-black/80 italic font-light leading-relaxed mb-8 relative z-10 break-words">
                            "{t.content}"
                        </p>
                        <div className="mt-auto">
                            <p className="font-display font-black text-black uppercase text-lg">{t.client_name}</p>
                            <p className="text-app-purple text-xs font-bold uppercase tracking-widest">{t.location}</p>
                        </div>
                    </motion.div>
                  ))
                ) : (
                  [
                    {
                        name: "Maria Santos",
                        location: "Jade Villas, Imus",
                        quote: "Our monthly bill dropped from ₱8,000 to just ₱1,500! The installation was incredibly clean and the team was professional throughout the entire process.",
                        stars: 5
                    },
                    {
                        name: "Robert Torres",
                        location: "Imus, Cavite",
                        quote: "Best investment we've ever made for our home. The Las Solar team is highly knowledgeable and made sure we understood every technical detail before proceeding.",
                        stars: 5
                    },
                    {
                        name: "Liza Gomez",
                        location: "Jade Villas, Imus",
                        quote: "Having reliable power during grid outages has been a game-changer for my home office. The battery storage system works seamlessly. Highly recommended!",
                        stars: 5
                    }
                  ].map((testimonial, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col relative"
                    >
                        <div className="absolute top-8 right-10 opacity-10">
                            <Quote size={60} className="text-black" />
                        </div>
                        <div className="flex gap-1 mb-6">
                            {[...Array(testimonial.stars)].map((_, i) => (
                                <Star key={i} size={18} className="fill-app-purple text-app-purple" />
                            ))}
                        </div>
                        <p className="text-lg text-black/80 italic font-light leading-relaxed mb-8 relative z-10 break-words">
                            "{testimonial.quote}"
                        </p>
                        <div className="mt-auto">
                            <p className="font-display font-black text-black uppercase text-lg">{testimonial.name}</p>
                            <p className="text-app-purple text-xs font-bold uppercase tracking-widest">{testimonial.location}</p>
                        </div>
                    </motion.div>
                  ))
                )}
            </div>
        </div>
      </section>
      
      <CTASection />
    </div>
  );
}
