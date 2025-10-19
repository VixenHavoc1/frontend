"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import AuthModals from "./AuthModals";

export default function BotSelection({ onSelect }) {
  // ✅ modal states
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ Set auth state safely on client side
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("access_token"));
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");

    setIsAuthenticated(false);
  }

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
              className="relative w-[65vw] sm:w-[180px] h-[220px] flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer shadow-[0_0_15px_rgba(120,60,255,0.15)] hover:shadow-[0_0_30px_rgba(165,120,255,0.25)] transition-transform duration-300 snap-center bot-glow bot-sparkle"
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
      <header className="relative p-6 overflow-hidden border-b border-purple-800/40">
        <div className="absolute inset-0 animate-aurora opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#130824]/90 via-[#28164a]/70 to-[#130824]/90" />

        <div className="relative z-10 flex justify-between items-center">
          {/* Logo */}
          <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            Voxella AI
          </h1>

          {/* Auth Buttons */}
          <div className="flex gap-3">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-purple-400/40 bg-purple-800/20 text-purple-200 hover:bg-purple-700/40 hover:shadow-[0_0_15px_rgba(160,90,255,0.4)] transition-all"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowSignup(true)}
                  className="px-4 py-2 text-sm font-semibold rounded-xl border border-purple-400/40 bg-purple-800/20 text-purple-200 hover:bg-purple-700/40 hover:shadow-[0_0_15px_rgba(160,90,255,0.4)] transition-all"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-purple-400/40 bg-purple-800/20 text-purple-200 hover:bg-purple-700/40 hover:shadow-[0_0_15px_rgba(160,90,255,0.4)] transition-all"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Sections */}
      {renderSection("AI Girlfriends", "💕", girlfriends)}
      {renderSection("Roleplays", "😈", roleplays)}

      {/* ✅ Auth Modals */}
      <AuthModals
        showLogin={showLogin}
        setShowLogin={setShowLogin}
        showSignup={showSignup}
        setShowSignup={setShowSignup}
        setIsAuthenticated={setIsAuthenticated} // <- pass setter so modals can update auth
      />
    </div>
  );
}
