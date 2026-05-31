import { motion } from 'motion/react';
import { NavLink } from 'react-router-dom';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  image?: string;
  badge?: string;
}

export default function PageHero({ title, subtitle, image, badge }: PageHeroProps) {
  return (
    <div className="relative h-[65vh] md:h-[75vh] flex items-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <img
          src={image || "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=2070"}
          alt={title}
          className="w-full h-full object-cover opacity-30"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="flex items-center gap-2 mb-4">
             <div className="w-2.5 h-2.5 bg-app-purple shrink-0"></div>
             <span className="text-app-purple uppercase tracking-widest text-xs font-bold">
               {badge || title}
             </span>
          </div>
          <h1 className="text-3xl md:text-5xl text-white mb-4 leading-tight uppercase font-black tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-white/80 max-w-2xl font-light line-clamp-2">
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
