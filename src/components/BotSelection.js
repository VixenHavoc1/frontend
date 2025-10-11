"use client";

import { motion } from "framer-motion";

export default function BotSelection({ onSelect }) {
  const girlfriends = [
    { name: "Lily", vibe: "Submissive • Sweet & Caring", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic10.png" },
    { name: "Raven", vibe: "Teasing • Playful & Bold", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic12.png" },
    { name: "Plaksha", vibe: "Toxic • Possessive & Intense", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic11.png" },
    { name: "Zara", vibe: "Confident • Dominant & Seductive", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic13.png" },
    { name: "Mia", vibe: "Innocent • Shy & Curious", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic14.png" },
  ];

  const roleplays = [
    { name: "Teacher", vibe: "Strict yet caring mentor", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic15.png" },
    { name: "Nurse", vibe: "Comforting and gentle", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic16.png" },
    { name: "Gamer Girl", vibe: "Nerdy, funny, teasing", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic17.png" },
    { name: "Model", vibe: "Elegant and confident", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic18.png" },
    { name: "Secretary", vibe: "Professional and flirty", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic19.png" },
  ];

  const renderSection = (title, emoji, bots) => (
    <section className="px-4 mt-8">
      {/* Section Heading */}
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center gap-2 text-purple-200 tracking-wide">
        <span>{emoji}</span> {title}
      </h2>

      {/* Desktop Grid */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {bots.map((bot, i) => (
          <motion.div
            key={bot.name}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelect(bot.name)}
            className="relative rounded-2xl overflow-hidden cursor-pointer shadow-[0_0_15px_rgba(120,60,255,0.15)] hover:shadow-[0_0_30px_rgba(165,120,255,0.25)] transition-all duration-300 hover:-translate-y-1"
          >
            <img
              src={bot.image}
              alt={bot.name}
              className="h-[320px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-4">
              <h3 className="text-lg font-semibold text-white">{bot.name}</h3>
              <p className="text-sm text-purple-200">{bot.vibe}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile Scrollable Row */}
      <div className="relative sm:hidden">
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[#0b0615] to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#0b0615] to-transparent pointer-events-none z-10" />

        <div className="flex gap-4 overflow-x-auto pb-4 px-2 scrollbar-hide snap-x snap-mandatory scroll-smooth-x">
          {bots.map((bot, i) => (
            <motion.div
              key={bot.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(bot.name)}
              className="relative min-w-[200px] h-[300px] flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer shadow-[0_0_15px_rgba(120,60,255,0.15)] hover:shadow-[0_0_30px_rgba(165,120,255,0.25)] transition-transform duration-300 snap-center"
            >
              <img
                src={bot.image}
                alt={bot.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-3">
                <h3 className="text-base font-semibold text-white">{bot.name}</h3>
                <p className="text-xs text-purple-200">{bot.vibe}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#05010a] via-[#0f0820] to-[#1a0e2b] text-white">
      {/* Header */}
      <header className="p-6 text-center bg-gradient-to-r from-[#130824] via-[#28164a] to-[#130824] shadow-[0_0_30px_rgba(120,60,255,0.3)] border-b border-purple-800/40">
        <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
          Voxella AI
        </h1>
        <p className="text-sm text-purple-300 mt-1 tracking-wide">
          Choose your fantasy. Create your connection.
        </p>
      </header>

      {/* Sections */}
      {renderSection("AI Girlfriends", "💕", girlfriends)}
      {renderSection("Roleplays", "🎭", roleplays)}
    </div>
  );
}
