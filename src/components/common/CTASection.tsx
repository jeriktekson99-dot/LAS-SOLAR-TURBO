import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
          <div className="bg-black rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden border border-white/5 shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-full">
                  <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-app-purple/10 rounded-full blur-[120px]"></div>
                  <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[150%] bg-white/5 rounded-full blur-[120px]"></div>
              </div>
              <div className="relative z-10 max-w-3xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <span className="text-app-purple font-bold uppercase tracking-widest text-sm mb-6 block">Ready to switch?</span>
                    <h2 className="text-4xl md:text-6xl text-white mb-8 uppercase font-black tracking-tight leading-tight">
                        Start Your Solar Journey With a <span className="text-app-purple">Free Quote</span>
                    </h2>
                    <p className="text-xl text-white/70 mb-10 font-light">Our expert engineers will conduct a technical site survey and provide a transparent, no-obligation energy roadmap for your property.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <NavLink to="/request-quote" className="btn-primary inline-flex items-center gap-2 text-lg px-10 py-5">
                          Get Your Free Estimate <ArrowRight size={20} />
                      </NavLink>
                      <NavLink to="/request-quote#calculator" className="bg-white text-black hover:bg-slate-50 transition-all duration-300 rounded-full w-[216px] h-[52px] border-2 border-white font-bold text-lg inline-flex items-center justify-center shadow-lg hover:shadow-xl">
                          Calculate Savings
                      </NavLink>
                    </div>
                  </motion.div>
              </div>
          </div>
      </div>
    </section>
  );
}
