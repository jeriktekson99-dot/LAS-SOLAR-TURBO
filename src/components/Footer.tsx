import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram } from 'lucide-react';
const logoImage = 'https://lh3.googleusercontent.com/d/1odxn3puWfrPEf2mgoz4JLupNHXlwpvRO';
import { getSolarSettings } from '../lib/settings';

export default function Footer() {
  const [settings, setSettings] = useState(getSolarSettings());

  useEffect(() => {
    const handleSettingsChanged = () => {
      setSettings(getSolarSettings());
    };
    window.addEventListener('las-solar-settings-changed', handleSettingsChanged);
    return () => {
      window.removeEventListener('las-solar-settings-changed', handleSettingsChanged);
    };
  }, []);

  return (
    <footer className="bg-black text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <img src={settings.logoDarkDashboard || logoImage} alt="Las Solar Set-up" className="h-10 w-auto object-contain" />
            </Link>
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              Empowering Cavite through sustainable energy solutions. We provide high-quality solar installations that save money and protect the planet.
            </p>
            <div className="flex gap-4">
              <a href="https://web.facebook.com/profile.php?id=61574508698471" target="_blank" rel="noopener noreferrer" className="hover:text-app-purple transition-colors"><Facebook size={20} /></a>
              <a href="https://www.instagram.com/turbo_electronics?igsh=bHl5bW9tbDg1bGV5&utm_source=qr" target="_blank" rel="noopener noreferrer" className="hover:text-app-purple transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg mb-6 text-app-purple">Quick Links</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/portfolio" className="hover:text-white transition-colors">Portfolio</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/request-quote" className="hover:text-white transition-colors">Request a Quote</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg mb-6 text-app-purple">Contact Us</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <MapPin className="shrink-0 text-app-purple" size={18} />
                <span>{settings.businessAddress}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="shrink-0 text-app-purple" size={18} />
                <span>{settings.businessPhone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="shrink-0 text-app-purple" size={18} />
                <span>{settings.businessEmail}</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-lg mb-6 text-app-purple">Our Location</h4>
            <div className="rounded-xl overflow-hidden h-40 bg-slate-900 relative group">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15462.661718361775!2d120.9328574!3d14.417036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397d396a8e79cbb%3A0xe54e60742f990666!2sJade%20Villas%2C%20Imus%2C%20Cavite!5e0!3m2!1sen!2sph!4v1715424000000!5m2!1sen!2sph"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Las Solar Set-up Location"
                ></iframe>
                <div className="absolute inset-0 bg-black/40 pointer-events-none group-hover:bg-transparent transition-all"></div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <div className="flex flex-col gap-1.5 text-center md:text-left">
            <p>© {new Date().getFullYear()} Las Solar Set-up. All rights reserved.</p>
            {settings.licensingAccreditation && (
              <p className="text-[10px] text-white/30 font-medium tracking-wide">{settings.licensingAccreditation}</p>
            )}
          </div>
          <div className="flex gap-8">
            <Link to="/admin/login" className="hover:text-white transition-colors">Admin</Link>
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
