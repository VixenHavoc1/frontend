"use client";

import { motion } from "framer-motion";

export default function BotSelection({ onSelect }) {
  const girlfriends = [
    { 
      name: "Lily", 
      vibe: "Submissive • Sweet & Caring", 
      image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic10.png" 
    },
    { 
      name: "Raven", 
      vibe: "Teasing • Playful & Bold", 
      image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic12.png" 
    },
    { 
      name: "Plaksha", 
      vibe: "Toxic • Possessive & Intense", 
      image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic11.png" 
    },
    { 
      name: "Zara", 
      vibe: "Confident • Dominant & Seductive", 
      image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic13.png" 
    },
    { 
      name: "Mia", 
      vibe: "Innocent • Shy & Curious", 
      image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic14.png" 
    },
  ];

  const roleplays = [
    { name: "Teacher", vibe: "Strict yet caring mentor", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic15.png" },
    { name: "Nurse", vibe: "Comforting and gentle", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic16.png" },
    { name: "Gamer Girl", vibe: "Nerdy, funny, teasing", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic17.png" },
    { name: "Model", vibe: "Elegant and confident", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic18.png" },
    { name: "Secretary", vibe: "Professional and flirty", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic19.png" },
  ];

  const renderSection = (title, bots) => (
   <div className="px-4">
  <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
    {bots.map((bot, i) => (
      <motion.div
        key={bot.name}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        onClick={() => onSelect(bot.name)}
        className="relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-1"
      >
        <img
          src={bot.image}
          alt={bot.name}
          className="h-[320px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4">
          <h3 className="text-lg font-semibold text-white">{bot.name}</h3>
          <p className="text-sm text-purple-200">{bot.vibe}</p>
        </div>
      </motion.div>
    ))}
  </div>

 
 {/* Mobile Scrollable Row */}
<div className="flex sm:hidden gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x snap-mandatory scroll-smooth-x">
  {bots.map((bot, i) => (
    <motion.div
      key={bot.name}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      onClick={() => onSelect(bot.name)}
      className="relative min-w-[200px] h-[300px] flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-purple-500/40 transition-transform duration-300 snap-center"
    >
      <img
        src={bot.image}
        alt={bot.name}
        className="h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-3">
        <h3 className="text-base font-semibold text-white">{bot.name}</h3>
        <p className="text-xs text-purple-200">{bot.vibe}</p>
      </div>
    </motion.div>
  ))}
</div>

  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#1a1027] to-[#2c1f3d] text-white">
      {/* Header */}
     <header className="p-6 text-center bg-gradient-to-r from-[#1f0f2e] via-[#3b1d52] to-[#1f0f2e] shadow-[0_0_20px_rgba(139,92,246,0.3)] border-b border-purple-800/40">
  <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
    Voxella AI
  </h1>

</header>

      {/* Sections */}
      {renderSection("AI Girlfriend", girlfriends)}
      {renderSection("Role-play", roleplays)}
    </div>
  );
}
