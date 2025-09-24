"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import AudioWave from "./AudioWave";
import PremiumModal from './PremiumModal';
import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import apiFetch, { login, signup, verifyEmail } from "../api";

export default function ChatUI({ bot }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [userEmail, setUserEmail] = useState(null);
  const [showVerify, setShowVerify] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [userName, setUserName] = useState("");
  const userId = userEmail || "guest"; // fallback if not logged in

  const CHAT_BACKEND_URL = "https://api.voxellaai.site";
  const PAYMENT_BACKEND_URL = "https://api.voxellaai.site";

  const [showPremiumUnlocked, setShowPremiumUnlocked] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(!localStorage.getItem("age_verified"));
  const [selectedBot, setSelectedBot] = useState(null); // user picks bot first

  const getSession = async () => {
    const token = localStorage.getItem("access_token");
    return token ? { access_token: token } : null;
  };

  const handleBotSelect = (bot) => {
    setSelectedBot(bot);
    if (!localStorage.getItem("age_verified")) {
      setShowAgeModal(true);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const savedCount = localStorage.getItem("message_count");
    if (savedCount) setMessageCount(parseInt(savedCount, 10));
  }, []);

  useEffect(() => {
    const initializeUser = async () => {
      const session = await getSession();
      const token = session?.access_token;
      if (!token) return;

      setIsAuthenticated(true);

      try {
        const { ok, data } = await apiFetch("/me", {
          method: "GET",
          headers: await getAuthHeaders(),
        });

        if (ok && data) {
          setUserEmail(data.email);
          setHasPaid(data.has_paid);
          localStorage.setItem("user_email", data.email);
          localStorage.setItem("has_paid", data.has_paid ? "true" : "false");
          localStorage.setItem("tier_id", data.tier_id || "");
        }
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };

    initializeUser();
  }, []);

  useEffect(() => {
    const shown = localStorage.getItem("premium_modal_shown");
    if (hasPaid && !shown) {
      setShowPremiumUnlocked(true);
      localStorage.setItem("premium_modal_shown", "true");
    }
  }, [hasPaid]);

  const fetchBlobMedia = async (url) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch media");
      const blob = await res.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Error fetching media:", error);
      return null;
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchUserEmail = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const { ok, data } = await apiFetch("/me", {
        method: "GET",
        headers: await getAuthHeaders(),
      });

      if (ok && data.email) setUserEmail(data.email);
    } catch (err) {
      console.error("Failed to fetch user email", err);
    }
  };

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const nameSet = localStorage.getItem("nameSet");

    if (storedName) setUserName(storedName);
    else if (!nameSet && isAuthenticated) setShowNameModal(true);
  }, [isAuthenticated]);

  const handleNameConfirm = async () => {
    if (!userName.trim()) return;

    try {
      await apiFetch("/me/display-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...await getAuthHeaders(),
        },
        body: JSON.stringify({ display_name: userName.trim() }),
      });

      localStorage.setItem("userName", userName.trim());
      localStorage.setItem("nameSet", "true");
      setShowNameModal(false);
    } catch (err) {
      console.error("Failed to update display name:", err);
    }
  };

  const sendMessage = async () => {
    if (!isAuthenticated) {
      setShowSignup(true);
      return;
    }

    if (!hasPaid && messageCount >= 5) {
      setShowPaywall(true);
      return;
    }

    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const headers = await getAuthHeaders();

      const { ok, status, data } = await apiFetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          message: input,
          bot_name: bot?.name || "Default",
          user_name: localStorage.getItem("userName") || null,
        }),
      });

      if (status === 403) {
        console.log("🚫 403 Forbidden — triggering paywall");
        setShowPaywall(true);
        return;
      }

      if (!ok) throw new Error(data?.error || "Failed to send message");

      const botMessage = {
        sender: "bot",
        text: data?.response || "Sorry, no reply received.",
        audio: data?.audio || null,
        image: data?.image || null,
      };

      setMessages((prev) => [...prev, botMessage]);

      const newCount = messageCount + 1;
      setMessageCount(newCount);
      localStorage.setItem("message_count", newCount.toString());
    } catch (err) {
      console.error("Message error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const getBotPic = (botName) => {
    const name = botName?.toLowerCase() || "";
    if (name.includes("lily")) return "/lily.png";
    if (name.includes("plaksha")) return "/plaksha.png";
    if (name.includes("raven")) return "/raven.png";
    return "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic14.png";
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(email, password);
      setShowSignup(false);
      setShowVerify(true);
    } catch (err) {
      // silent
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    try {
      await verifyEmail(email, verifyCode);
      await login(email, password);
      setIsAuthenticated(true);
      setShowVerify(false);
      await fetchUserEmail();
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.message || "Verification error. Try again.");
    }
  };

  const closePaywallModal = () => setShowPaywall(false);
  const unlockAccess = () => {
    localStorage.setItem("has_paid", "true");
    setHasPaid(true);
    setShowPaywall(false);
  };

  const handleTierClick = async (tier_id) => {
    const priceMap = { tier1: 5, tier2: 10, tier3: 20 };
    const price_amount = priceMap[tier_id] || 5;

    try {
      const authHeaders = await getAuthHeaders();
      if (!authHeaders.Authorization) {
        alert("Please log in first.");
        setShowLogin(true);
        return;
      }

      const { ok, data } = await apiFetch("/api/create-invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ tier_id, price_amount }),
      });

      if (ok && data?.payment_url) {
        window.location.href = data.payment_url;
      } else {
        console.error("Invoice error:", data);
        alert(data?.detail || "Payment creation failed.");
      }
    } catch (err) {
      console.error("Invoice error:", err);
      alert("Failed to initiate payment.");
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      setIsAuthenticated(true);
      setShowLogin(false);
      await fetchUserEmail();
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#2C1F3D] text-white">
      {/* Header */}
      <div className="bg-[#1F1B29] p-3 shadow-lg flex justify-between items-center">
        <h1 className="text-xl font-bold text-white text-center sm:text-lg md:text-xl">VOXELLA AI</h1>
        {!isAuthenticated && (
          <div className="flex gap-2 sm:gap-1">
            <button
              onClick={() => setShowSignup(true)}
              className="bg-[#5A2D8C] px-3 py-2 rounded-lg hover:bg-[#6B3B98] text-sm sm:text-xs transition-all duration-300"
            >
              Sign Up
            </button>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-[#5A2D8C] px-3 py-2 rounded-lg hover:bg-[#6B3B98] text-sm sm:text-xs transition-all duration-300"
            >
              Log In
            </button>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-1">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`flex items-end mb-2 sm:mb-1 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "bot" && (
              <img
                src={getBotPic(bot?.name)}
                alt="Bot"
                className="w-8 h-8 sm:w-6 sm:h-6 rounded-full mr-2"
              />
            )}
            <div
              className={`max-w-[80%] sm:max-w-[95%] px-3 py-2 rounded-2xl text-sm sm:text-xs whitespace-pre-wrap leading-relaxed relative ${
                msg.sender === "user" ? "bg-[#5A2D8C]" : "bg-[#3A2A4D]"
              }`}
            >
              {msg.text}
              {msg.audio && <AudioWave url={msg.audio} />}
              {msg.image && <img src={msg.image} alt="NSFW" className="mt-1 w-full rounded-lg" />}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            className="flex justify-start mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.6 }}
          >
            <div className="px-3 py-1 bg-[#3A2A4D] rounded-2xl text-xs sm:text-sm">
              {bot.name} is typing...
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="flex p-2 sm:p-1 bg-[#1F1B29]">
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={1}
          className="flex-1 p-2 bg-[#3A2A4D] text-white rounded-lg outline-none resize-none min-h-[36px] max-h-[150px] overflow-y-auto text-sm sm:text-xs"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-[#333333] px-3 py-2 rounded-lg hover:bg-[#444444] text-sm sm:text-xs transition-all duration-300"
        >
          Send
        </button>
      </div>
    </div>
  );
}
