import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Phone } from 'lucide-react';
const logoImage = 'https://lh3.googleusercontent.com/d/1odxn3puWfrPEf2mgoz4JLupNHXlwpvRO';
import { getSolarSettings } from '../lib/settings';

const navLinks = [
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Portfolio', path: '/portfolio' },
  { name: 'Blog', path: '/blog' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [logo, setLogo] = useState(getSolarSettings().logoWhiteBackground || logoImage);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleSettingsChanged = () => {
      setLogo(getSolarSettings().logoWhiteBackground || logoImage);
    };
    window.addEventListener('las-solar-settings-changed', handleSettingsChanged);
    return () => {
      window.removeEventListener('las-solar-settings-changed', handleSettingsChanged);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav
      className={`sticky top-0 left-0 w-full z-50 transition-all duration-300 modern-glass py-3 border-b border-slate-100`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Las Solar Set-up" className="h-10 w-auto object-contain" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-semibold uppercase tracking-widest transition-colors hover:text-app-purple ${
                  isActive ? 'text-app-purple' : 'text-white'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          <Link to="/request-quote" className="btn-primary flex items-center gap-2 py-2 text-sm">
            Request a Quote
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white hover:text-app-purple transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black border-t border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-lg font-display font-semibold text-white hover:text-app-purple transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10">
                <Link to="/request-quote" className="btn-primary block text-center">
                  Request a Quote
                </Link>
                <div className="flex items-center justify-center gap-2 mt-4 text-white/70 font-medium">
                  <Phone size={18} className="text-app-purple" />
                  <span>09173085095</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
