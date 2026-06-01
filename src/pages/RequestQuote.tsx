import { useEffect } from 'react';
import PageHero from '../components/common/PageHero';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import SolarCalculator from '../components/SolarCalculator';
import QuoteForm from '../components/QuoteForm';
import { useLocation } from 'react-router-dom';

export default function RequestQuote() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash === '#calculator') {
      let attempts = 0;
      const scrollHelper = () => {
        const element = document.getElementById('calculator');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else if (attempts < 10) {
          attempts++;
          setTimeout(scrollHelper, 100);
        }
      };
      scrollHelper();
    }
  }, [hash]);

  return (
    <div className="bg-slate-50/50">
      <PageHero
        title="Get A Quote"
        badge="SAVINGS ESTIMATOR"
        subtitle="Calculate your custom solar capacity, estimated monthly savings, and return on investment in moments, or connect with our engineering team for a site survey."
        image="https://scontent-mnl3-3.xx.fbcdn.net/v/t39.30808-6/666418113_122099214038816956_8894835031162156285_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeExflwmz4dr35DI8OrXhPmIkKFthW1PftCQoW2FbU9-0CkS83eNgM0K8N-Rj8LBv6Vrz1G0ZUaOreMZ4MLEq0Ll&_nc_ohc=yAZcsPs7g3IQ7kNvwFGqE0g&_nc_oc=AdptxbVEUbXhOw_eRJuMLqD0b3Y_V4b8dyn56c-xzSrP8Pn7evOgbFY9xAHnYldAvrw&_nc_zt=23&_nc_ht=scontent-mnl3-3.xx&_nc_gid=u8uX0IOBaBpmKGJXAQuhZA&_nc_ss=7b2a8&oh=00_Af8_cAyUxEwriNO15U7mXWHXlLsP_c_CKeAeZeQwnbOqcA&oe=6A21F81E"
      />

      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Info Column */}
            <div>
              <span className="text-black font-bold uppercase tracking-widest text-sm mb-4 block">Connect with Us</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-black mb-6 uppercase tracking-tight leading-[1.1]">Direct Access to <span className="text-app-purple">Experts</span></h2>
              <p className="text-lg text-slate-500 mb-12 font-light leading-relaxed">
                Our specialized commercial and industrial teams are standing by to evaluate your facility's energy profile.
              </p>

              <div className="space-y-8 mb-12">
                <div className="flex items-start gap-6 group">
                   <div className="bg-app-purple/10 p-4 rounded-2xl group-hover:bg-app-purple transition-all duration-300">
                        <Phone className="text-black group-hover:text-white" size={24} />
                   </div>
                   <div>
                       <h4 className="font-bold text-black uppercase text-xs tracking-widest mb-1 font-sans">Call Our Hotline</h4>
                       <p className="text-2xl font-display font-black text-black ">09173085095</p>
                   </div>
                </div>
                <div className="flex items-start gap-6 group">
                   <div className="bg-app-purple/10 p-4 rounded-2xl group-hover:bg-app-purple transition-all duration-300">
                        <Mail className="text-black group-hover:text-white" size={24} />
                   </div>
                   <div>
                       <h4 className="font-bold text-black uppercase text-xs tracking-widest mb-1 font-sans">Email Inquiry</h4>
                       <p className="text-2xl font-display font-black text-black ">lyndon_santos@ymail.com</p>
                   </div>
                </div>
                <div className="flex items-start gap-6 group">
                   <div className="bg-app-purple/10 p-4 rounded-2xl group-hover:bg-app-purple transition-all duration-300">
                        <MapPin className="text-black group-hover:text-white" size={24} />
                   </div>
                   <div>
                       <h4 className="font-bold text-black uppercase text-xs tracking-widest mb-1 font-sans">Physical Office</h4>
                       <p className="text-2xl font-display font-black text-black">Jade Villas, Imus, Cavite</p>
                   </div>
                </div>
              </div>

              <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 flex items-center gap-6">
                 <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Clock className="text-app-purple" size={24} />
                 </div>
                 <div>
                    <h4 className="font-bold text-black uppercase text-xs tracking-widest mb-1 font-sans tracking-widest">Office Hours</h4>
                    <p className="text-slate-500 text-sm">Mon - Sat: 8:00 AM - 6:00 PM</p>
                 </div>
              </div>
            </div>

            {/* Multi-page Form Column */}
            <QuoteForm />
          </div>
        </div>
      </section>
      <section id="calculator" className="py-24 animate-fade-in bg-slate-50/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto mb-20 text-center">
            <span className="text-black font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Interactive Consultant</span>
            <h2 className="text-4xl md:text-6xl font-black text-black mb-8 uppercase tracking-tighter">Your Solar <span className="text-app-purple">Roadmap</span> Starts Here</h2>
            <p className="text-xl text-slate-500 font-light">
              Don't wait for a site visit. Use our engineering-grade calculator to see your potential savings and download a preliminary quote in seconds.
            </p>
          </div>

          <SolarCalculator />
        </div>
      </section>

    </div>
  );
}
