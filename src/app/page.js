"use client"; // Add this at the top

import { useState } from "react";
import BotSelection from "../components/BotSelection";
import ChatUI from "../components/ChatUI";

export default function Page() {
  const [selectedBot, setSelectedBot] = useState(null);
  const [mode, setMode] = useState("Stealth"); // Default mode is Stealth

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {selectedBot ? (
        <ChatUI bot={selectedBot} mode={mode} setMode={setMode} />
      ) : (
        <BotSelection onSelect={setSelectedBot} />
      )}
    </div>
  );
}
