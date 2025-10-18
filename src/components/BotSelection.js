"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import AuthModals from "./AuthModals"; // ✅ import modal component

export default function BotSelection({ onSelect }) {
  // ✅ add modal states
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const girlfriends = [
    { name: "Lily", vibe: "Submissive • Sweet & Caring", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic10.png" },
    { name: "Raven", vibe: "Teasing • Playful & Bold", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic12.png" },
    { name: "Plaksha", vibe: "Toxic • Possessive & Intense", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic11.png" },
    { name: "Zara", vibe: "Confident • Dominant & Seductive", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic13.png" },
    { name: "Mia", vibe: "Innocent • Shy & Curious", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic14.png" },
  ];

  const roleplays = [
    { name: "Aria", vibe: "Strict yet caring teacher", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic15.png" },
    { name: "Elena", vibe: "Comforting and gentle nurse", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic16.png" },
    { name: "Nova", vibe: "Nerdy, funny, teasing gamer girl", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic17.png" },
    { name: "Selene", vibe: "Elegant and confident model", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic18.png" },
    { name: "Kara", vibe: "Professional and flirty secretary", image: "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic19.png" },
  ];

  const renderSection = (title, emoji, bots) => (
    <section className="px-4 mt-8">
      <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 flex justify-center items-center gap-3 text-purple-300 tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">
        <span className="text-2xl">{emoji}</span> {title}
      </h2>

      {/* Desktop grid */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {bots.map((bot, i) => (
          <motion.div
            key={bot.name}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelect(bot)}
            className="relative rounded-2xl overflow-hidden cursor-pointer shadow-[0_0_15px_rgba(120,60,255,0.15)] hover:shadow-[0_0_30px_rgba(165,120,255,0.25)] transition-all duration-300 hover:-translate-y-1 bot-glow bot-sparkle"
          >
            <img src={bot.image} alt={bot.name} className="h-[320px] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-4">
              <h3 className="text-lg font-semibold text-white">{bot.name}</h3>
              <p className="text-sm text-purple-200">{bot.vibe}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile scroll row */}
      <div className="sm:hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[#0b0615] to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-[#0b0615] to-transparent pointer-events-none z-10" />

        <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x snap-mandatory scroll-smooth">
          {bots.map((bot, i) => (
            <motion.div
              key={bot.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(bot)}
              className="relative w-[70vw] sm:w-[200px] h-[300px] flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer shadow-[0_0_15px_rgba(120,60,255,0.15)] hover:shadow-[0_0_30px_rgba(165,120,255,0.25)] transition-transform duration-300 snap-center bot-glow bot-sparkle"
            >
              <img src={bot.image} alt={bot.name} className="h-full w-full object-cover" loading="lazy" />
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
      <header className="relative p-6 text-center overflow-hidden border-b border-purple-800/40">
        <div className="absolute inset-0 animate-aurora opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#130824]/90 via-[#28164a]/70 to-[#130824]/90" />
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            Voxella AI
          </h1>

          <div className="mt-5 flex gap-4">
            <button
              onClick={() => setShowLogin(true)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#5f22d9] to-[#8b3dff]
                         text-white font-semibold shadow-[0_0_12px_rgba(140,80,255,0.35)]
                         hover:shadow-[0_0_20px_rgba(160,90,255,0.5)] hover:scale-[1.03]
                         transition-all duration-300"
            >
              Login
            </button>
            <button
              onClick={() => setShowSignup(true)}
              className="px-6 py-2.5 rounded-xl border border-purple-400 text-purple-200 font-semibold
                         bg-gradient-to-r from-transparent to-transparent
                         hover:from-[#3b1466]/20 hover:to-[#8b3dff]/10
                         hover:shadow-[0_0_18px_rgba(150,100,255,0.35)] hover:scale-[1.03]
                         transition-all duration-300"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Sections */}
      {renderSection("AI Girlfriends", "💕", girlfriends)}
      {renderSection("Roleplays", "🎭", roleplays)}

      {/* ✅ Auth Modals */}
      <AuthModals
        showLogin={showLogin}
        setShowLogin={setShowLogin}
        showSignup={showSignup}
        setShowSignup={setShowSignup}
      />
    </div>
  );
}
