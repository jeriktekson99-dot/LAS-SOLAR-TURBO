/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Settings, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';
import { getSolarSettings, SolarSettings } from '../lib/settings';

export default function MaintenanceScreen() {
  const [settings, setSettings] = useState<SolarSettings>(getSolarSettings());

  useEffect(() => {
    // Listen for setting change events in case settings are updated in real time
    const handleSettingsChanged = () => {
      setSettings(getSolarSettings());
    };

    window.addEventListener('las-solar-settings-changed', handleSettingsChanged);
    return () => {
      window.removeEventListener('las-solar-settings-changed', handleSettingsChanged);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-8 md:p-12 relative overflow-hidden font-sans select-none">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-app-purple/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="flex justify-between items-center z-10 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          {settings.logoWhiteBackground ? (
            <img src={settings.logoWhiteBackground} alt="Las Solar" className="h-9 w-auto object-contain" />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-display font-black tracking-widest uppercase">
                Las Solar <span className="text-app-purple">Set-up</span>
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 border border-white/10 px-3.5 py-1.5 rounded-full bg-white/5 backdrop-blur">
          <span className="w-2 h-2 rounded-full bg-app-purple animate-pulse"></span>
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">Offline Upgrade</span>
        </div>
      </header>

      {/* Main Card Layout */}
      <main className="my-auto py-12 flex flex-col items-center justify-center text-center z-10 w-full max-w-xl mx-auto">
        <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mb-8 shadow-xl animate-spin-slow">
          <Settings size={28} className="text-app-purple" />
        </div>

        <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight uppercase leading-tight mb-6">
          System Upgrades <br />
          <span className="text-app-purple">In Progress</span>
        </h1>

        <p className="text-slate-400 font-light text-sm md:text-base leading-relaxed mb-10 max-w-md">
          We are currently refreshing our digital solar calculations and database records to serve you better. Our physical engineering hubs and support lines remain fully operational.
        </p>

        {/* Informational specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 text-left shadow-2xl">
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-300">
              <Clock size={14} className="text-app-purple" />
              <span className="text-[10px] font-black uppercase tracking-wider">Estimated Time</span>
            </div>
            <p className="text-white text-xs font-semibold">2 - 3 Hours Duration</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-300">
              <ShieldCheck size={14} className="text-app-purple" />
              <span className="text-[10px] font-black uppercase tracking-wider">Asset Safety</span>
            </div>
            <p className="text-white text-xs font-semibold">Secure Database Backup</p>
          </div>

          <div className="sm:col-span-2 border-t border-zinc-800/60 my-2 pt-2"></div>

          <div className="sm:col-span-1 space-y-1">
            <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500">Contact Email</span>
            <a href={`mailto:${settings.businessEmail}`} className="text-xs text-white hover:text-app-purple transition-all block truncate font-medium">
              {settings.businessEmail}
            </a>
          </div>

          <div className="sm:col-span-1 space-y-1">
            <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500">Call Support</span>
            <a href={`tel:${settings.businessPhone}`} className="text-xs text-white hover:text-app-purple transition-all block font-medium">
              {settings.businessPhone}
            </a>
          </div>

        </div>
      </main>

      {/* Footer Legal & Registration numbers */}
      <footer className="z-10 w-full max-w-7xl mx-auto border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
        <p>© {new Date().getFullYear()} Las Solar Set-up. All rights reserved.</p>
        {settings.licensingAccreditation && (
          <p className="text-right sm:max-w-md break-words">{settings.licensingAccreditation}</p>
        )}
      </footer>

    </div>
  );
}
