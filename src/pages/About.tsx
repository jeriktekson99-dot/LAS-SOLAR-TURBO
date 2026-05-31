import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NavLink } from 'react-router-dom';
import PageHero from '../components/common/PageHero';
import { 
  Target, Lightbulb, Shield, MapPin, Zap, Clock, Heart, 
  Headphones, Award, ShieldCheck, Rocket, Gauge, Workflow, 
  ChevronDown, ArrowRight, Users, BarChart3, Factory 
} from 'lucide-react';
import CTASection from '../components/common/CTASection';

// Local high quality images
import democratizingImage from '../assets/images/regenerated_image_1779037667365.jpg';
import visionImage from '../assets/images/regenerated_image_1779163667164.jpg';
import mindsetImage from '../assets/images/regenerated_image_1780216172192.jpg';

export default function About() {
  const [activeMindset, setActiveMindset] = useState<number | null>(null);

  return (
    <div>
      <PageHero
        title="Who We Are"
        badge="OUR MISSION & CORES"
        subtitle="We are local solar engineers democratizing clean energy with Tier-1 components, bulletproof wind-load engineering, and unmatched service integrity."
        image="https://scontent-mnl3-3.xx.fbcdn.net/v/t39.30808-6/707843552_122112663950816956_3768211191767352907_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeH1rAmmocSNJL3er_Zo18e3-fwlD4fWfjj5_CUPh9Z-OAnfLdmyCp7Q-b-xLHlLEurW_BZAiQvcH-tnBnsWdCVw&_nc_ohc=xW43UzPH7qQQ7kNvwFcTJbJ&_nc_oc=AdrtqWMwFbQO9cjrMDixluRgzRHQvqnfFBv2BJ7oFHM9R_rXd_2HchkYX7yBBY3VPFg&_nc_zt=23&_nc_ht=scontent-mnl3-3.xx&_nc_gid=DN0t1j8uDabJz89643Fxeg&_nc_ss=7b2a8&oh=00_Af93SFxqwsp1F8xJJlKhAeiNPq8ZQeLA74WB-kSbUWqYnA&oe=6A21E017"
      />

      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          {/* Desktop Layout */}
          <div className="hidden lg:grid grid-cols-2 gap-20 items-center">
              <div className="order-2 lg:order-1">
                <span className="text-black font-bold uppercase tracking-widest text-sm mb-4 block">
                  Our Mission
                </span>
                <h2 className="text-4xl md:text-5xl text-black mb-8 uppercase font-black tracking-tight leading-tight">
                    Democratizing <span className="text-app-purple">Solar Energy</span>
                </h2>
                <div className="space-y-6 text-lg text-black/80 leading-relaxed font-light">
                    <p>
                        Las Solar Set-up aims to democratize solar energy by providing engineering excellence, transparent pricing, and world-class hardware to our neighbors in Imus and surrounding municipalities.
                    </p>
                    <p>
                       We don't just sell panels; we build energy independence. From our headquarters in Jade Villas, we lead a movement toward a cleaner, more resilient Philippines.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-8 mt-12">
                    <div className="flex gap-4">
                        <div className="bg-app-purple/10 p-3 rounded-xl shrink-0 h-fit">
                            <Lightbulb className="text-app-purple" size={24} />
                        </div>
                        <div>
                            <h4 className="font-display font-bold text-lg text-black">Innovation</h4>
                            <p className="text-sm text-black/70">Utilizing Tier-1 hardware and smart monitoring.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-app-purple/10 p-3 rounded-xl shrink-0 h-fit">
                            <Shield className="text-app-purple" size={24} />
                        </div>
                        <div>
                            <h4 className="font-display font-bold text-lg text-black">Trust</h4>
                            <p className="text-sm text-black/70">Zero-hidden-cost guarantee.</p>
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
                        src={democratizingImage}
                        alt="Solar panels mission"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                </div>
                <div className="absolute -top-10 -left-10 w-64 p-8 bg-app-purple border-4 border-white rounded-[2.5rem] shadow-xl text-white hidden md:block">
                    <p className="text-sm font-bold opacity-70 mb-2 uppercase tracking-wide">The Mission</p>
                    <p className="text-lg leading-snug font-light">To accelerate the transition to renewable energy for every household in Cavite.</p>
                </div>
              </motion.div>
          </div>

          {/* Mobile & Tablet Layout */}
          <div className="block lg:hidden space-y-8">
            <div>
              <span className="text-black font-bold uppercase tracking-widest text-sm mb-4 block">
                Our Mission
              </span>
              <h2 className="text-3xl md:text-4xl text-black uppercase font-black tracking-tight leading-tight">
                Democratizing <span className="text-app-purple">Solar Energy</span>
              </h2>
            </div>

            {/* Mobile Image: width 100%, no offset or alignment, directly below title */}
            <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-xl outline outline-2 outline-offset-4 outline-app-purple">
              <img
                src={democratizingImage}
                alt="Solar panels mission"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Rest of the text content immediately followed */}
            <div className="space-y-6 text-base text-black/80 leading-relaxed font-light">
              <p>
                Las Solar Set-up aims to democratize solar energy by providing engineering excellence, transparent pricing, and world-class hardware to our neighbors in Imus and surrounding municipalities.
              </p>
              <p>
                We don't just sell panels; we build energy independence. From our headquarters in Jade Villas, we lead a movement toward a cleaner, more resilient Philippines.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex gap-4">
                <div className="bg-app-purple/10 p-3 rounded-xl shrink-0 h-fit">
                  <Lightbulb className="text-app-purple" size={24} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-black">Innovation</h4>
                  <p className="text-sm text-black/70">Utilizing Tier-1 hardware and smart monitoring.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-app-purple/10 p-3 rounded-xl shrink-0 h-fit">
                  <Shield className="text-app-purple" size={24} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-black">Trust</h4>
                  <p className="text-sm text-black/70">Zero-hidden-cost guarantee.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-50/50 border-t border-slate-100">
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
                        src={visionImage}
                        alt="Solar energy future vision"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                </div>
                <div className="absolute -bottom-10 -right-10 w-64 p-8 bg-black border-4 border-white rounded-[2.5rem] shadow-xl text-white hidden md:block">
                    <p className="text-sm font-bold text-app-purple mb-2 uppercase tracking-wide">The Vision</p>
                    <p className="text-lg leading-snug font-light">To build self-sufficient, net-zero green neighborhoods powering all of Cavite.</p>
                </div>
             </motion.div>

             <div>
                <span className="text-black font-bold uppercase tracking-widest text-sm mb-4 block">
                  Our Vision
                </span>
                <h2 className="text-4xl md:text-5xl text-black mb-8 uppercase font-black tracking-tight leading-tight">
                    Our Future <span className="text-app-purple">Powered Vision</span>
                </h2>
                <div className="space-y-6 text-lg text-black/80 leading-relaxed font-light">
                    <p>
                        We envision a future where every home and establishment in the country holds the key to its own power supply. Our primary objective is to make clean energy generation a standard utility for any residential area.
                    </p>
                    <p>
                        By combining premium smart batteries, high-efficiency solar equipment, and responsive service networks, we strive for local energy independence that shields our consumers from skyrocketing fuel and utility costs permanently.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-8 mt-12">
                    <div className="flex gap-4">
                        <div className="bg-app-purple/10 p-3 rounded-xl shrink-0 h-fit">
                            <Rocket className="text-app-purple" size={24} />
                        </div>
                        <div>
                            <h4 className="font-display font-bold text-lg text-black">Scalability</h4>
                            <p className="text-sm text-black/70">Expandable layouts fitted to future-proof growth.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-app-purple/10 p-3 rounded-xl shrink-0 h-fit">
                            <Target className="text-app-purple" size={24} />
                        </div>
                        <div>
                            <h4 className="font-display font-bold text-lg text-black">Precision</h4>
                            <p className="text-sm text-black/70">Custom-tailored layout design for maximum output.</p>
                        </div>
                    </div>
                </div>
             </div>
          </div>

          {/* Mobile & Tablet Layout */}
          <div className="block lg:hidden space-y-8">
            <div>
              <span className="text-black font-bold uppercase tracking-widest text-sm mb-4 block">
                Our Vision
              </span>
              <h2 className="text-3xl md:text-4xl text-black uppercase font-black tracking-tight leading-tight">
                Our Future <span className="text-app-purple">Powered Vision</span>
              </h2>
            </div>

            {/* Mobile Image: width 100%, no offset or alignment, directly below title */}
            <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-xl outline outline-2 outline-offset-4 outline-black">
              <img
                src={visionImage}
                alt="Solar energy future vision"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Rest of the text content immediately followed */}
            <div className="space-y-6 text-base text-black/80 leading-relaxed font-light">
              <p>
                We envision a future where every home and establishment in the country holds the key to its own power supply. Our primary objective is to make clean energy generation a standard utility for any residential area.
              </p>
              <p>
                By combining premium smart batteries, high-efficiency solar equipment, and responsive service networks, we strive for local energy independence that shields our consumers from skyrocketing fuel and utility costs permanently.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex gap-4">
                <div className="bg-app-purple/10 p-3 rounded-xl shrink-0 h-fit">
                  <Rocket className="text-app-purple" size={24} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-black">Scalability</h4>
                  <p className="text-sm text-black/70">Expandable layouts fitted to future-proof growth.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-app-purple/10 p-3 rounded-xl shrink-0 h-fit">
                  <Target className="text-app-purple" size={24} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-black">Precision</h4>
                  <p className="text-sm text-black/70">Custom-tailored layout design for maximum output.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commitments Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-black font-bold uppercase tracking-widest text-sm mb-4 block">Our Promises</span>
            <h2 className="text-[48px] font-black text-black mb-8 uppercase tracking-tight leading-tight">
              Our Unwavering <span className="text-app-purple">Commitments</span> to You
            </h2>
            <p className="text-lg text-slate-600 font-light leading-relaxed">
              Our commitments serves as pillars that ensure that your journey to energy independence is smooth, secure, and rewarding.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {[
              {
                icon: <ShieldCheck className="text-app-purple shrink-0" size={36} />,
                title: 'SAFETY FIRST',
                desc: 'We follow strict international safety protocols for all electrical and structural work, protecting your property and your family.'
              },
              {
                icon: <Zap className="text-app-purple shrink-0" size={36} />,
                title: 'PREMIUM EFFICIENCY',
                desc: 'We only source Tier-1 Bloomberg-rated solar panels to ensure your system extracts the maximum power from every ray of Cavite sun.'
              },
              {
                icon: <Clock className="text-app-purple shrink-0" size={36} />,
                title: 'PUNCTUAL DELIVERY',
                desc: 'From initial site visit to final grid inspection, we respect your time with efficient timelines and clear communication.'
              },
              {
                icon: <Headphones className="text-app-purple shrink-0" size={36} />,
                title: 'DEDICATED SUPPORT',
                desc: 'Our relationship doesn’t end at installation. We provide dedicated post-sales support and performance monitoring for your peace of mind.'
              }
            ].map((commitment, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100/80 group hover:shadow-md transition-all duration-300 flex flex-row items-start gap-5 sm:gap-6"
              >
                <div className="bg-app-purple/10 text-app-purple w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-app-purple/5 group-hover:bg-app-purple/20 transition-all duration-300">
                  {commitment.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-display font-bold text-slate-800 mb-2 uppercase tracking-tight">{commitment.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-light">{commitment.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section - Replaces Cavite Pride */}
      <section className="py-24 bg-black text-white overflow-hidden relative border-y border-white/5">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-app-purple/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[150%] bg-white/5 rounded-full blur-[120px]"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mb-20 text-left">
            <span className="text-app-purple font-bold uppercase tracking-widest text-sm mb-4 block">The Impact</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-tight">
              <span className="text-white">Las Turbo</span> <span className="text-app-purple">By The Impact</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
            {[
              {
                value: '50-80-100%',
                label: 'Average Monthly Bill Reduction'
              },
              {
                value: '50+',
                label: 'Tier-1 Solar Panels Installed'
              },
              {
                value: '₱45K+',
                label: 'Average Monthly Client Savings'
              },
              {
                value: '42.5MWh',
                label: 'Annual Clean Energy Produced'
              },
              {
                value: '25 Tons',
                label: 'Annual Carbon Offset (CO2)'
              },
              {
                value: '₱13.5M+',
                label: 'Projected 25-Year Total Savings'
              }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-left"
              >
                <div className="text-5xl md:text-6xl font-black text-app-purple mb-2 tabular-nums tracking-tighter">
                  {stat.value}
                </div>
                <div className="text-xl font-bold uppercase tracking-tight mb-2">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Sectors We Serve Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <span className="text-black font-bold uppercase tracking-widest text-sm mb-4 block">Our Scope</span>
            <h2 className="text-[48px] font-black text-black mb-8 uppercase tracking-tight leading-tight">
              Where We <span className="text-app-purple">Build</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Residential',
                desc: 'Engineering premium rooftop systems bespoke for Cavite homes. Seamless clean power for air conditioning, automation, and appliances, ensuring comfort and lifetime savings.',
                icon: <Users className="text-app-purple" size={32} />,
                image: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&q=80&w=1000'
              },
              {
                title: 'Commercial',
                desc: 'Tailored solar infrastructure for shopping centers, commercial offices, and clinics. Drastically offset daytime energy charges and build solid corporate sustainability.',
                icon: <BarChart3 className="text-app-purple" size={32} />,
                image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=1000'
              },
              {
                title: 'Industrial',
                desc: 'High-power PV plants designed for cold storage, manufacturing hubs, and warehouses. Engineered to manage massive baseloads with extreme reliability and grid-safety compliance.',
                icon: <Factory className="text-app-purple" size={32} />,
                image: 'https://images.unsplash.com/photo-1540324155974-7265bb4587e6?auto=format&fit=crop&q=80&w=1000'
              }
            ].map((sector, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="h-48 overflow-hidden">
                  <img 
                    src={sector.image} 
                    alt={sector.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-8">
                  <div className="bg-black w-14 h-14 rounded-2xl flex items-center justify-center mb-6 -mt-16 relative z-10 shadow-lg border-4 border-white">
                    {sector.icon}
                  </div>
                  <h3 className="text-2xl font-black text-black mb-4 uppercase">{sector.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-8">
                    {sector.desc}
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

      {/* Professional Mindset Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          {/* Desktop Layout */}
          <div className="hidden lg:grid grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative pb-10 pr-10"
            >
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl outline outline-2 outline-offset-8 outline-black">
                <img
                  src={mindsetImage}
                  alt="Professional team"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 p-8 bg-black rounded-[2.5rem] shadow-xl text-white hidden md:block border-4 border-white">
                <p className="text-app-purple font-bold uppercase tracking-widest text-xs mb-2">Our Ethic</p>
                <p className="text-xl font-black uppercase leading-tight">Crafted with Precision</p>
              </div>
            </motion.div>

            <div>
              <span className="text-black font-bold uppercase tracking-widest text-sm mb-4 block">Core Values</span>
              <h2 className="text-4xl md:text-5xl text-black mb-10 uppercase font-black tracking-tight leading-tight">
                Our <span className="text-app-purple">Professional</span> Mindset
              </h2>
              
              <div className="space-y-4">
                {[
                  {
                    icon: <Rocket className="text-black" size={24} />,
                    title: 'Future-Ready',
                    desc: 'We design systems with scalability in mind, ensuring your investment is compatible with future storage and smart home innovations.'
                  },
                  {
                    icon: <Gauge className="text-black" size={24} />,
                    title: 'High-Performance',
                    desc: 'Every component is selected for its ability to deliver maximum efficiency, longevity, and reliability under tropical conditions.'
                  },
                  {
                    icon: <Workflow className="text-black" size={24} />,
                    title: 'Integrated',
                    desc: 'Our approach is holistic, ensuring that solar power integrates seamlessly with your existing electrical grid and lifestyle.'
                  }
                ].map((item, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={`rounded-2xl border transition-all duration-300 ${
                      activeMindset === idx 
                        ? 'bg-white border-app-purple shadow-lg' 
                        : 'bg-transparent border-slate-200 hover:border-app-purple/50'
                    }`}
                  >
                    <button
                      onClick={() => setActiveMindset(activeMindset === idx ? null : idx)}
                      className="w-full p-6 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`p-3 rounded-xl transition-colors duration-300 ${
                          activeMindset === idx ? 'bg-app-purple' : 'bg-slate-100'
                        }`}>
                          <div className={activeMindset === idx ? 'text-white' : 'text-black'}>
                            {item.icon}
                          </div>
                        </div>
                        <h4 className="text-xl font-black text-black uppercase tracking-tight">{item.title}</h4>
                      </div>
                      <ChevronDown 
                        className={`text-black transition-transform duration-300 ${
                          activeMindset === idx ? 'rotate-180' : ''
                        }`} 
                        size={20} 
                      />
                    </button>
                    
                    <AnimatePresence>
                      {activeMindset === idx && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                          <div className="px-6 pb-6 pl-[84px]">
                            <p className="text-slate-600 leading-relaxed font-light text-base">
                              {item.desc}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile & Tablet Layout */}
          <div className="block lg:hidden space-y-8">
            <div>
              <span className="text-black font-bold uppercase tracking-widest text-sm mb-4 block">Core Values</span>
              <h2 className="text-3xl md:text-4xl text-black uppercase font-black tracking-tight leading-tight">
                Our <span className="text-app-purple">Professional</span> Mindset
              </h2>
            </div>

            {/* Mobile Image: width 100%, no offset or alignment, directly below title */}
            <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-xl outline outline-2 outline-offset-4 outline-black">
              <img
                src={mindsetImage}
                alt="Professional team"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Rest of the values accordions immediately below */}
            <div className="space-y-4 pt-4">
              {[
                {
                  icon: <Rocket className="text-black" size={24} />,
                  title: 'Future-Ready',
                  desc: 'We design systems with scalability in mind, ensuring your investment is compatible with future storage and smart home innovations.'
                },
                {
                  icon: <Gauge className="text-black" size={24} />,
                  title: 'High-Performance',
                  desc: 'Every component is selected for its ability to deliver maximum efficiency, longevity, and reliability under tropical conditions.'
                },
                {
                  icon: <Workflow className="text-black" size={24} />,
                  title: 'Integrated',
                  desc: 'Our approach is holistic, ensuring that solar power integrates seamlessly with your existing electrical grid and lifestyle.'
                }
              ].map((item, idx) => (
                <div 
                  key={`mobile-${idx}`}
                  className={`rounded-2xl border transition-all duration-300 ${
                    activeMindset === idx 
                      ? 'bg-white border-app-purple shadow-sm' 
                      : 'bg-transparent border-slate-200 hover:border-app-purple/30'
                  }`}
                >
                  <button
                    onClick={() => setActiveMindset(activeMindset === idx ? null : idx)}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl transition-colors duration-300 ${
                        activeMindset === idx ? 'bg-app-purple' : 'bg-slate-100'
                      }`}>
                        <div className={activeMindset === idx ? 'text-white' : 'text-black'}>
                          {item.icon}
                        </div>
                      </div>
                      <h4 className="text-lg font-black text-black uppercase tracking-tight">{item.title}</h4>
                    </div>
                    <ChevronDown 
                      className={`text-black transition-transform duration-300 ${
                        activeMindset === idx ? 'rotate-180' : ''
                      }`} 
                      size={18} 
                    />
                  </button>
                  
                  <AnimatePresence>
                    {activeMindset === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                      >
                        <div className="px-4 pb-4 pl-16">
                          <p className="text-slate-600 leading-relaxed font-light text-sm">
                            {item.desc}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <CTASection />
    </div>
  );
}

