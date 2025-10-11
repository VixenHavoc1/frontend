"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

export default function BotSidebar({ onChatOpen }) {
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

  const [username, setUsername] = useState("there");
  const [activeTab, setActiveTab] = useState("Girlfriend");
  const [selectedBot, setSelectedBot] = useState(null);

  // Fetch username from backend
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const { data } = await axios.get("/api/me"); // replace with your endpoint
        if (data.username) setUsername(data.username);
      } catch (err) {
        console.log("Failed to fetch username", err);
      }
    };
    fetchUsername();
  }, []);

  const handleBotClick = (botName) => {
    setSelectedBot(botName);
    if (onChatOpen) onChatOpen(botName);
  };

  const tabs = ["Girlfriend", "Roleplay"];
  const filteredBots = activeTab === "Girlfriend" ? girlfriends : roleplays;

  const renderSection = () => (
    <div className="flex flex-col gap-6">
      {/* Mobile + Desktop Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {filteredBots.map((bot, i) => (
          <motion.div
            key={bot.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => handleBotClick(bot.name)}
            className="relative w-full h-[300px] rounded-2xl overflow-hidden cursor-pointer shadow-[0_0_15px_rgba(120,60,255,0.15)] hover:shadow-[0_0_30px_rgba(165,120,255,0.25)] transition-transform duration-300 snap-center bot-glow bot-sparkle"
          >
            <img src={bot.image} alt={bot.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-3">
              <h3 className="text-lg font-semibold text-white">{bot.name}</h3>
              <p className="text-sm text-purple-200">{bot.vibe}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  if (selectedBot) {
    // Chat Window
    return (
      <div className="flex-1 bg-[#0a0a0a] p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-white">{selectedBot}</h3>
          <button
            onClick={() => setSelectedBot(null)}
            className="text-purple-300 hover:text-white"
          >
            Back
          </button>
        </div>
        <div className="h-[calc(100vh-100px)] bg-[#1a0e2b]/50 rounded-xl p-4 overflow-y-auto">
          <p className="text-purple-200">Chat with {selectedBot}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#05010a] via-[#0f0820] to-[#1a0e2b] text-white p-4">
      {/* Greeting */}
      <h2 className="text-xl font-bold mb-6">Hey {username} 👋</h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${
              activeTab === tab
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-purple-900/40 text-purple-200 hover:bg-purple-700/60"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Bot Selection */}
      {renderSection()}
    </div>
  );
}
