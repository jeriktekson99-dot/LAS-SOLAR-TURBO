import { Facebook, ExternalLink } from 'lucide-react';

export default function SisterBusinessSection() {
  return (
    <section className="py-6 bg-zinc-950 border-y border-zinc-900">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
          <div className="flex items-center gap-4">
            <img 
              src="https://lh3.googleusercontent.com/d/15LH7gvCSbKM4EVAliRkIDlSQC4NMc15m" 
              alt="Las Electronics & E-Bikes Logo" 
              className="h-12 w-auto object-contain select-none"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">Partner Business</h3>
              <p className="text-white text-sm font-bold leading-tight mt-0.5">Las Electronics & E-Bikes</p>
            </div>
          </div>
          
          <div className="h-px w-8 bg-zinc-800 hidden md:block"></div>
          
          <p className="text-zinc-500 text-[11px] font-medium text-center md:text-left max-w-xs">
            Premium electric mobility and specialist electronic solutions in Cavite.
          </p>

          <a 
            href="https://web.facebook.com/PasigEbikeModification" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full text-white text-[10px] font-black uppercase tracking-widest transition-all group"
          >
            <Facebook size={14} className="text-blue-500" />
            Visit Facebook Page
            <ExternalLink size={12} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          </a>
        </div>
      </div>
    </section>
  );
}
