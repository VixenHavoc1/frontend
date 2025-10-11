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
    <div className="my-8">
      <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-purple-200">
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6 px-4">
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
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#1a1027] to-[#2c1f3d] text-white">
      {/* Header */}
      <header className="p-6 text-center bg-gradient-to-r from-purple-900 to-purple-600 shadow-md">
        <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-lg">
          Voxella AI
        </h1>
      </header>

      {/* Sections */}
      {renderSection("AI Girlfriend", girlfriends)}
      {renderSection("Role-play", roleplays)}
    </div>
  );
}
