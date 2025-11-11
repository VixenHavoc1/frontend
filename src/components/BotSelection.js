"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import AuthModals from "./AuthModals";

export default function BotSelection({ onSelect }) {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("access_token"));
  }, []);

  function handleLogout() {
    localStorage.clear();
    setIsAuthenticated(false);
  }

  const companions = [
    {
      name: "Luna",
      vibe: "Calm • Reflective & Gentle",
      image:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Kai",
      vibe: "Supportive • Uplifting & Insightful",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Willow",
      vibe: "Empathetic • Grounded & Nature-Loving",
      image:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Sol",
      vibe: "Warm • Motivational & Optimistic",
      image:
        "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Aria",
      vibe: "Mindful • Kind & Understanding",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#d3f2e8] via-[#b8e0dc] to-[#a4c7e3] text-gray-900 relative">
      {/* Soft overlay */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-20"></div>

      {/* Header */}
      <header className="relative z-10 p-6 border-b border-white/30 backdrop-blur-sm flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-wide text-[#1e3a34]">
          MindCompanion 🌿
        </h1>
        <div className="flex gap-3">
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => setShowLogin(true)}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-green-700/30 bg-green-100/30 text-green-900 hover:bg-green-200/50 transition-all"
              >
                Login
              </button>
              <button
                onClick={() => setShowSignup(true)}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-green-700/30 bg-green-100/30 text-green-900 hover:bg-green-200/50 transition-all"
              >
                Sign Up
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-green-700/30 bg-green-100/30 text-green-900 hover:bg-green-200/50 transition-all"
            >
              Logout
            </button>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center mt-16 px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl font-extrabold text-[#12332b] max-w-3xl"
        >
          Find calm, clarity, and comfort —
          <br />
          your personal AI wellbeing companion.
        </motion.h2>
        <p className="mt-4 text-lg text-[#1f3c38]/80 max-w-xl">
          Talk, reflect, or unwind anytime. A private space for mindfulness,
          self-growth, and emotional support.
        </p>
        <div className="mt-8 flex gap-4">
          <button
            onClick={() => (isAuthenticated ? onSelect() : setShowSignup(true))}
            className="px-6 py-3 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition-all"
          >
            Start Chatting
          </button>
          <button className="px-6 py-3 border border-green-700/40 text-green-900 rounded-xl hover:bg-green-100 transition-all">
            Learn More
          </button>
        </div>
      </section>

      {/* Companions */}
      <section className="relative z-10 px-6 mt-20">
        <h3 className="text-2xl sm:text-3xl font-bold text-center text-[#1f3c38] mb-8">
          Choose Your Companion 🌊
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {companions.map((bot, i) => (
            <motion.div
              key={bot.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => onSelect(bot)}
              className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white/70 backdrop-blur-sm"
            >
              <img
                src={bot.image}
                alt={bot.name}
                className="h-[280px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-4">
                <h4 className="text-lg font-semibold text-white">{bot.name}</h4>
                <p className="text-sm text-green-100">{bot.vibe}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <AuthModals
        showLogin={showLogin}
        setShowLogin={setShowLogin}
        showSignup={showSignup}
        setShowSignup={setShowSignup}
        setIsAuthenticated={setIsAuthenticated}
      />
    </div>
  );
}
