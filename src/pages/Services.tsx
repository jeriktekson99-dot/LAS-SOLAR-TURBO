import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PageHero from '../components/common/PageHero';
import { 
  Home, 
  Building2, 
  Wrench, 
  ArrowRight, 
  CheckCircle2, 
  Factory, 
  Sun, 
  Battery,
  MessageSquare,
  Radar,
  Zap,
  ChevronDown,
  Workflow,
  Gauge,
  Users,
  Shield
} from 'lucide-react';
import CTASection from '../components/common/CTASection';

function JourneyAccordions() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = [
    {
      number: "01",
      icon: <MessageSquare size={20} className="text-slate-400 group-hover:text-app-purple transition-colors duration-300 shrink-0" />,
      title: "Free Consultation",
      content: "We analyze your average Meralco bills and property orientation to size your system correctly. You receive a standard-setting energy audit, detailing exactly how much you can save and your estimated timeline to ROI."
    },
    {
      number: "02",
      icon: <Radar size={20} className="text-slate-400 group-hover:text-app-purple transition-colors duration-300 shrink-0" />,
      title: "Site Survey",
      content: "Our engineering team conducts a thorough roof assessment with detail-focused drone mapping. We inspect structural integrity and layout parameters to design a customized system that optimizes sunlight capture and safety."
    },
    {
      number: "03",
      icon: <Wrench size={20} className="text-slate-400 group-hover:text-app-purple transition-colors duration-300 shrink-0" />,
      title: "Expert Installation",
      content: "Your system is built by certified local technicians and registered engineers. From heavy-duty mounting blocks to high-performance inverter wiring, every step is executed with precision, clean aesthetics, and wind-load resilience."
    },
    {
      number: "04",
      icon: <Zap size={20} className="text-slate-400 group-hover:text-app-purple transition-colors duration-300 shrink-0" />,
      title: "Net-Metering & Activation",
      content: "We carry out full post-install tests and walk you through every operational aspect. Our dedicated project coordinators handle all LGU permits and Meralco net-metering synchronization so you can immediately sell excess energy."
    }
  ];

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div 
          key={idx} 
          className={`rounded-2xl border transition-all duration-300 group ${
            openIndex === idx 
              ? 'bg-white border-app-purple shadow-lg' 
              : 'bg-transparent border-slate-200 hover:border-app-purple/50'
          }`}
        >
          <button 
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between text-left gap-4"
          >
            <div className="flex items-center gap-5">
              <div className={`w-12 h-12 flex items-center justify-center font-black text-lg rounded-xl shrink-0 transition-colors duration-300 ${
                openIndex === idx ? 'bg-app-purple text-white' : 'bg-slate-100 text-black'
              }`}>
                {item.number}
              </div>
              <div className="flex items-center gap-3">
                {item.icon}
                <h4 className="text-xl font-black text-black uppercase tracking-tight">{item.title}</h4>
              </div>
            </div>
            <ChevronDown 
              className={`text-black transition-transform duration-300 ml-auto ${
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
                <div className="px-6 pb-6 sm:pl-[84px] text-slate-500 leading-relaxed font-light text-base">
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

export default function Services() {
  return (
    <div>
      <PageHero
        title="Our Services"
        badge="SOLAR SOLUTIONS"
        subtitle="From custom residential setups and commercial micro-grids to seamless Meralco net-metering integration, we deliver premium, certified end-to-end solar designs."
        image="https://scontent-mnl3-1.xx.fbcdn.net/v/t39.30808-6/696705230_122110693538816956_7399105176534449893_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeGNyc1-FiCTkdQ5gKQShe3vcZmIHMzpIuhxmYgczOki6Iv7jcVqdOtOCTo-DGp7tOolaI1W6qcYunOQ5i6U7pH_&_nc_ohc=ww6DR0n9IHAQ7kNvwH-kzqc&_nc_oc=AdpweeJ3HnheEw9NoAdIHrD9q5g5vvmjsGThE5PMHHzK3Wg6YrhNKdi-WiS-gcGZsbQ&_nc_zt=23&_nc_ht=scontent-mnl3-1.xx&_nc_gid=S8k6UO1NfH5davBml7lBBw&_nc_ss=7b2a8&oh=00_Af8gioIwbqtDdoxrjZX8I47QbuB2BQ5_s1ss_8vOSo1-JQ&oe=6A21D1C4"
      />

      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="space-y-32">
            {/* Residential */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:h-[450px] items-stretch">
                {/* Desktop Layout */}
                <div className="hidden lg:grid grid-cols-2 gap-20 col-span-2 h-full items-stretch">
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="flex flex-col justify-center lg:h-full py-6 lg:py-0"
                    >
                        <div className="flex items-center gap-5 md:gap-6 mb-8">
                            <div className="bg-app-purple/20 w-16 h-16 rounded-2xl flex items-center justify-center shrink-0">
                                <Home className="text-black" size={32} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight">Residential <span className="text-app-purple">Solar</span></h2>
                        </div>
                        <p className="text-lg text-slate-600 mb-8 font-light leading-relaxed">
                            Transform your home into a powerhouse. We offer customized Grid-Tied systems for maximum ROI and Hybrid systems with battery backup to ensure your family never sits in the dark during blackouts.
                        </p>
                        <ul className="space-y-4">
                            {['Zero-Meralco bill potential', 'Net-metering application handling', 'Hurricane-grade mounting structures', '25-year performance guarantee'].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-black font-medium">
                                    <CheckCircle2 size={20} className="text-app-purple" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                    <div className="rounded-[3rem] overflow-hidden shadow-2xl h-[300px] md:h-[400px] lg:h-full m-3 outline outline-2 outline-offset-8 outline-black">
                        <img src="https://gosolarphilippines.com/wp-content/uploads/2023/02/The-Benefits-of-Solar-Energy-for-Homeowners-in-the-Philippines.jpg" alt="Residential Solar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                </div>

                {/* Mobile & Tablet Layout */}
                <div className="block lg:hidden space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-app-purple/20 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                            <Home className="text-black" size={24} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight">Residential <span className="text-app-purple">Solar</span></h2>
                    </div>

                    {/* Mobile Image: width 100%, directly below title */}
                    <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-xl outline outline-2 outline-offset-4 outline-black">
                        <img src="https://gosolarphilippines.com/wp-content/uploads/2023/02/The-Benefits-of-Solar-Energy-for-Homeowners-in-the-Philippines.jpg" alt="Residential Solar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>

                    <p className="text-base text-slate-600 font-light leading-relaxed">
                        Transform your home into a powerhouse. We offer customized Grid-Tied systems for maximum ROI and Hybrid systems with battery backup to ensure your family never sits in the dark during blackouts.
                    </p>
                    <ul className="space-y-3">
                        {['Zero-Meralco bill potential', 'Net-metering application handling', 'Hurricane-grade mounting structures', '25-year performance guarantee'].map((item) => (
                            <li key={item} className="flex items-center gap-2.5 text-black font-medium text-sm">
                                <CheckCircle2 size={16} className="text-app-purple" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Commercial */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:h-[450px] items-stretch">
                {/* Desktop Layout */}
                <div className="hidden lg:grid grid-cols-2 gap-20 col-span-2 h-full items-stretch">
                    <div className="order-2 lg:order-1 rounded-[3rem] overflow-hidden shadow-2xl h-[300px] md:h-[400px] lg:h-full m-3 outline outline-2 outline-offset-8 outline-app-purple">
                        <img src="https://www.solarrooftops.ph/img/slider/slider2.jpg" alt="Commercial Solar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="order-1 lg:order-2 flex flex-col justify-center lg:h-full py-6 lg:py-0"
                    >
                        <div className="flex items-center gap-5 md:gap-6 mb-8">
                            <div className="bg-app-purple/20 w-16 h-16 rounded-2xl flex items-center justify-center shrink-0">
                                <Building2 className="text-black" size={32} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight">Commercial <span className="text-app-purple">Solutions</span></h2>
                        </div>
                        <p className="text-lg text-slate-600 mb-8 font-light leading-relaxed">
                            Scale your business with sustainable power. We specialize in high-capacity installations for warehouses, retail hubs, and industrial sites, focusing on rapid ROI and operational resilience.
                        </p>
                        <ul className="space-y-4">
                            {['Scalable MW systems', 'Corporate sustainability reporting data', 'Tax incentives & LGU support assistance', 'Priority 24/7 technical monitoring'].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-black font-medium">
                                    <CheckCircle2 size={20} className="text-app-purple" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Mobile & Tablet Layout */}
                <div className="block lg:hidden space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-app-purple/20 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                            <Building2 className="text-black" size={24} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight">Commercial <span className="text-app-purple">Solutions</span></h2>
                    </div>

                    {/* Mobile Image: width 100%, directly below title */}
                    <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-xl outline outline-2 outline-offset-4 outline-app-purple">
                        <img src="https://www.solarrooftops.ph/img/slider/slider2.jpg" alt="Commercial Solar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>

                    <p className="text-base text-slate-600 font-light leading-relaxed">
                        Scale your business with sustainable power. We specialize in high-capacity installations for warehouses, retail hubs, and industrial sites, focusing on rapid ROI and operational resilience.
                    </p>
                    <ul className="space-y-3">
                        {['Scalable MW systems', 'Corporate sustainability reporting data', 'Tax incentives & LGU support assistance', 'Priority 24/7 technical monitoring'].map((item) => (
                            <li key={item} className="flex items-center gap-2.5 text-black font-medium text-sm">
                                <CheckCircle2 size={16} className="text-app-purple" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Industrial */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:h-[450px] items-stretch">
                {/* Desktop Layout */}
                <div className="hidden lg:grid grid-cols-2 gap-20 col-span-2 h-full items-stretch">
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="flex flex-col justify-center lg:h-full py-6 lg:py-0"
                    >
                        <div className="flex items-center gap-5 md:gap-6 mb-8">
                            <div className="bg-app-purple/20 w-16 h-16 rounded-2xl flex items-center justify-center shrink-0">
                                <Factory className="text-black" size={32} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight">Industrial <span className="text-app-purple">Arrays</span></h2>
                        </div>
                        <p className="text-lg text-slate-600 mb-8 font-light leading-relaxed">
                            Engineered for heavy industry. Our large-scale solar installations are designed to handle variable industrial loads, providing significant cost reductions for manufacturing and processing plants.
                        </p>
                        <ul className="space-y-4">
                            {['Multi-megawatt capacity', 'Zero-downtime integration', 'Grid-stability management', 'Structured asset maintenance plans'].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-black font-medium">
                                    <CheckCircle2 size={20} className="text-app-purple" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                    <div className="rounded-[3rem] overflow-hidden shadow-2xl h-[300px] md:h-[400px] lg:h-full m-3 outline outline-2 outline-offset-8 outline-black">
                        <img src="https://solaren-power.com/wp-content/uploads/2025/12/What-Drives-the-Price-Variation.webp" alt="Industrial Solar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                </div>

                {/* Mobile & Tablet Layout */}
                <div className="block lg:hidden space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-app-purple/20 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                            <Factory className="text-black" size={24} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight">Industrial <span className="text-app-purple">Arrays</span></h2>
                    </div>

                    {/* Mobile Image: width 100%, directly below title */}
                    <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-xl outline outline-2 outline-offset-4 outline-black">
                        <img src="https://solaren-power.com/wp-content/uploads/2025/12/What-Drives-the-Price-Variation.webp" alt="Industrial Solar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>

                    <p className="text-base text-slate-600 font-light leading-relaxed">
                        Engineered for heavy industry. Our large-scale solar installations are designed to handle variable industrial loads, providing significant cost reductions for manufacturing and processing plants.
                    </p>
                    <ul className="space-y-3">
                        {['Multi-megawatt capacity', 'Zero-downtime integration', 'Grid-stability management', 'Structured asset maintenance plans'].map((item) => (
                            <li key={item} className="flex items-center gap-2.5 text-black font-medium text-sm">
                                <CheckCircle2 size={16} className="text-app-purple" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Off-Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:h-[450px] items-stretch">
                {/* Desktop Layout */}
                <div className="hidden lg:grid grid-cols-2 gap-20 col-span-2 h-full items-stretch">
                    <div className="order-2 lg:order-1 rounded-[3rem] overflow-hidden shadow-2xl h-[300px] md:h-[400px] lg:h-full m-3 outline outline-2 outline-offset-8 outline-app-purple">
                        <img src="https://www.tanfon.com/uploadfile/2023/05/20/20230520142513PlLXdS.jpg" alt="Off-Grid Solar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="order-1 lg:order-2 flex flex-col justify-center lg:h-full py-6 lg:py-0"
                    >
                        <div className="flex items-center gap-5 md:gap-6 mb-8">
                            <div className="bg-app-purple/20 w-16 h-16 rounded-2xl flex items-center justify-center shrink-0">
                                <Sun className="text-black" size={32} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight">Off-Grid <span className="text-app-purple">Freedom</span></h2>
                        </div>
                        <p className="text-lg text-slate-600 mb-8 font-light leading-relaxed">
                            Total energy independence where the grid can't reach. We design robust standalone systems for farms, mountain retreats, and island properties using high-efficiency panels and storage.
                        </p>
                        <ul className="space-y-4">
                            {['100% grid independence', 'Custom-engineered energy audits', 'Remote monitoring capabilities', 'Ruggedized for harsh environments'].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-black font-medium">
                                    <CheckCircle2 size={20} className="text-app-purple" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Mobile & Tablet Layout */}
                <div className="block lg:hidden space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-app-purple/20 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                            <Sun className="text-black" size={24} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight">Off-Grid <span className="text-app-purple">Freedom</span></h2>
                    </div>

                    {/* Mobile Image: width 100%, directly below title */}
                    <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-xl outline outline-2 outline-offset-4 outline-app-purple">
                        <img src="https://www.tanfon.com/uploadfile/2023/05/20/20230520142513PlLXdS.jpg" alt="Off-Grid Solar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>

                    <p className="text-base text-slate-600 font-light leading-relaxed">
                        Total energy independence where the grid can't reach. We design robust standalone systems for farms, mountain retreats, and island properties using high-efficiency panels and storage.
                    </p>
                    <ul className="space-y-3">
                        {['100% grid independence', 'Custom-engineered energy audits', 'Remote monitoring capabilities', 'Ruggedized for harsh environments'].map((item) => (
                            <li key={item} className="flex items-center gap-2.5 text-black font-medium text-sm">
                                <CheckCircle2 size={16} className="text-app-purple" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Battery Storage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:h-[450px] items-stretch">
                {/* Desktop Layout */}
                <div className="hidden lg:grid grid-cols-2 gap-20 col-span-2 h-full items-stretch">
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="flex flex-col justify-center lg:h-full py-6 lg:py-0"
                    >
                        <div className="flex items-center gap-5 md:gap-6 mb-8">
                            <div className="bg-app-purple/20 w-16 h-16 rounded-2xl flex items-center justify-center shrink-0">
                                <Battery className="text-black" size={32} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight">Battery <span className="text-app-purple">Storage</span></h2>
                        </div>
                        <p className="text-lg text-slate-600 mb-8 font-light leading-relaxed">
                            Don't let your generated energy go to waste. Our advanced Battery Energy Storage Systems (BESS) allow you to use your solar power 24/7 and provide seamless backup during outages.
                        </p>
                        <ul className="space-y-4">
                            {['Lithium Iron Phosphate (LiFePO4) safety', 'Peak shaving for cost reduction', 'Instant backup power', 'Smart energy management software'].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-black font-medium">
                                    <CheckCircle2 size={20} className="text-app-purple" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                    <div className="rounded-[3rem] overflow-hidden shadow-2xl h-[300px] md:h-[400px] lg:h-full m-3 outline outline-2 outline-offset-8 outline-black">
                        <img src="https://solenergy.com.ph/wp-content/uploads/2016/05/battery-1024x768.jpg" alt="Battery Storage" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                </div>

                {/* Mobile & Tablet Layout */}
                <div className="block lg:hidden space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-app-purple/20 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                            <Battery className="text-black" size={24} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight">Battery <span className="text-app-purple">Storage</span></h2>
                    </div>

                    {/* Mobile Image: width 100%, directly below title */}
                    <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-xl outline outline-2 outline-offset-4 outline-black">
                        <img src="https://solenergy.com.ph/wp-content/uploads/2016/05/battery-1024x768.jpg" alt="Battery Storage" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>

                    <p className="text-base text-slate-600 font-light leading-relaxed">
                        Don't let your generated energy go to waste. Our advanced Battery Energy Storage Systems (BESS) allow you to use your solar power 24/7 and provide seamless backup during outages.
                    </p>
                    <ul className="space-y-3">
                        {['Lithium Iron Phosphate (LiFePO4) safety', 'Peak shaving for cost reduction', 'Instant backup power', 'Smart energy management software'].map((item) => (
                            <li key={item} className="flex items-center gap-2.5 text-black font-medium text-sm">
                                <CheckCircle2 size={16} className="text-app-purple" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Maintenance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:h-[450px] items-stretch">
                {/* Desktop Layout */}
                <div className="hidden lg:grid grid-cols-2 gap-20 col-span-2 h-full items-stretch">
                    <div className="order-2 lg:order-1 rounded-[3rem] overflow-hidden shadow-2xl h-[300px] md:h-[400px] lg:h-full m-3 outline outline-2 outline-offset-8 outline-app-purple">
                        <img src="https://solarsystemsphilippines.com/wp-content/uploads/2025/04/solar-panel-system-maintenance-important-blog-1024x682.jpg" alt="Solar Maintenance" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="order-1 lg:order-2 flex flex-col justify-center lg:h-full py-6 lg:py-0"
                    >
                        <div className="flex items-center gap-5 md:gap-6 mb-8">
                            <div className="bg-app-purple/20 w-16 h-16 rounded-2xl flex items-center justify-center shrink-0">
                                <Wrench className="text-black" size={32} />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tight">Maintenance <span className="text-app-purple">& Support</span></h2>
                        </div>
                        <p className="text-lg text-slate-600 mb-8 font-light leading-relaxed">
                            A clean system is a productive system. We offer comprehensive upkeep services to keep your panels at peak efficiency for decades.
                        </p>
                        <ul className="space-y-4">
                            {['De-ionized water panel cleaning', 'Inverter firmware updates', 'Electrical connection safety audits', 'Real-time performance monitoring setup'].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-black font-medium">
                                    <CheckCircle2 size={20} className="text-app-purple" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>

                {/* Mobile & Tablet Layout */}
                <div className="block lg:hidden space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-app-purple/20 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                            <Wrench className="text-black" size={24} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-tight">Maintenance <span className="text-app-purple">& Support</span></h2>
                    </div>

                    {/* Mobile Image: width 100%, directly below title */}
                    <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-xl outline outline-2 outline-offset-4 outline-app-purple">
                        <img src="https://solarsystemsphilippines.com/wp-content/uploads/2025/04/solar-panel-system-maintenance-important-blog-1024x682.jpg" alt="Solar Maintenance" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>

                    <p className="text-base text-slate-600 font-light leading-relaxed">
                        A clean system is a productive system. We offer comprehensive upkeep services to keep your panels at peak efficiency for decades.
                    </p>
                    <ul className="space-y-3">
                        {['De-ionized water panel cleaning', 'Inverter firmware updates', 'Electrical connection safety audits', 'Real-time performance monitoring setup'].map((item) => (
                            <li key={item} className="flex items-center gap-2.5 text-black font-medium text-sm">
                                <CheckCircle2 size={16} className="text-app-purple" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
          </div>
        </div>
      </section>



      {/* Solar Journey Timeline (as process accordions) */}
      <section className="py-24 bg-slate-50 border-t border-b border-slate-100/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:sticky lg:top-32"
            >
              <span className="text-black font-bold uppercase tracking-widest text-sm mb-4 block">The Process</span>
              <h2 className="text-4xl md:text-5xl text-black mb-8 uppercase font-black tracking-tight leading-tight">
                YOUR SOLAR <span className="text-app-purple">JOURNEY</span>
              </h2>
              <div className="space-y-6 text-lg text-black/80 leading-relaxed font-light">
                <p>
                  From first contact to final activation, we guide you through every step with precision, transparency, and high electrical engineering standards.
                </p>
                <p>
                  Each phase is handled by certified local solar professionals, keeping you informed and fully supported as we build your energy independence.
                </p>
              </div>
            </motion.div>

            <div>
              <JourneyAccordions />
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
}
