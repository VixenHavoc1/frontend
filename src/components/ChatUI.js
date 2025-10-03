// 🐛 FULL DEBUGGING ENABLED
"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import AudioWave from "./AudioWave";
import PremiumModal from './PremiumModal';
import { supabase } from './supabaseClient'
import { apiFetch, login, signup, verifyEmail, fetchMe } from "../api";

export default function ChatUI({ bot }) {
  // --- State variables ---
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [showVerify, setShowVerify] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);

  const CHAT_BACKEND_URL = "https://api.voxellaai.site";
  const PAYMENT_BACKEND_URL = "https://api.voxellaai.site";

  const [showPremiumUnlocked, setShowPremiumUnlocked] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(!localStorage.getItem("age_verified"));
  const [selectedBot, setSelectedBot] = useState(null);

  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
  const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail") || null);
  const [hasPaid, setHasPaid] = useState(localStorage.getItem("hasPaid") === 'true');

  // --- Debug Logs ---
  const debug = (tag, ...msg) => console.log(`[${tag}]`, ...msg);

  // --- Session ---
  const getSession = async () => {
    const token = localStorage.getItem("access_token");
    debug("SESSION", "Fetched session token:", token);
    return token ? { access_token: token } : null;
  };

  const silentLogout = () => {
    debug("LOGOUT", "Clearing session + state");
    localStorage.clear();
    setIsAuthenticated(false);
    setUserEmail(null);
    setUserName("");
    setUserId(null);
  };

  // --- Auth Headers ---
  const getAuthHeaders = async () => {
    let token = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");

    debug("AUTH", "Checking for access token:", token);
    if (!token && refresh) {
      debug("AUTH", "No token, refreshing...");
      try {
        const res = await fetch(`${CHAT_BACKEND_URL}/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refresh }),
        });
        const data = await res.json();
        debug("AUTH", "Refresh response:", data);

        if (res.ok && data.access_token) {
          token = data.access_token;
          localStorage.setItem("access_token", token);
          debug("AUTH", "Refreshed access token saved");
        } else {
          debug("AUTH", "Refresh failed");
          silentLogout();
          return {};
        }
      } catch (err) {
        debug("AUTH", "Refresh network error:", err);
        silentLogout();
        return {};
      }
    }
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    debug("AUTH", "Returning headers:", headers);
    return headers;
  };

  // --- User Sync ---
  const syncUserData = async () => {
    debug("SYNC", "Starting user sync...");
    try {
      const headers = await getAuthHeaders();
      if (!headers.Authorization) {
        debug("SYNC", "No auth headers, aborting");
        return null;
      }
      const data = await apiFetch("/me", { method: "GET", headers });
      debug("SYNC", "User data response:", data);

      if (data && data.id) {
        setUserId(data.id);
        setUserEmail(data.email);
        setUserName(data.display_name || "");
        setHasPaid(data.has_paid);

        localStorage.setItem("userId", data.id);
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("userName", data.display_name || "");
        localStorage.setItem("hasPaid", data.has_paid ? "true" : "false");

        debug("SYNC", "User state updated");
        return data;
      } else {
        debug("SYNC", "No user ID in response");
        silentLogout();
        return null;
      }
    } catch (err) {
      debug("SYNC", "Error:", err);
      silentLogout();
      return null;
    }
  };

  // --- Lifecycle ---
  useEffect(() => {
    debug("INIT", "ChatUI mounted");
    const token = localStorage.getItem("access_token");
    if (token) {
      debug("INIT", "Found token, authenticating...");
      setIsAuthenticated(true);
      syncUserData();
    } else {
      debug("INIT", "No token found, guest mode");
    }

    const savedCount = localStorage.getItem("message_count");
    if (savedCount) setMessageCount(parseInt(savedCount, 10));
  }, []);

  // --- Handlers ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    debug("LOGIN", "Started with email:", email);
    try {
      const loginData = await login(email, password);
      debug("LOGIN", "Response:", loginData);

      if (!loginData.access_token) throw new Error("Login failed");

      setIsAuthenticated(true);
      setShowLogin(false);

      const userData = await syncUserData();
      if (userData && !userData.display_name) setShowNameModal(true);

      debug("LOGIN", "Success, user authenticated");
    } catch (err) {
      debug("LOGIN", "Error:", err);
      setError(err.message || "Login failed");
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    debug("SIGNUP", "Started with email:", email);
    setError("");
    try {
      await apiFetch("/signup", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      debug("SIGNUP", "Success");
      setShowSignup(false);
      setShowVerify(true);
    } catch (err) {
      debug("SIGNUP", "Error:", err);
      setError(err.message || "Signup failed");
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    debug("VERIFY", "Started with code:", verifyCode);
    setError("");
    try {
      await verifyEmail(email, verifyCode);
      const loginData = await login(email, password);
      debug("VERIFY", "Login after verify response:", loginData);

      if (!loginData.access_token) throw new Error("Login failed");

      setIsAuthenticated(true);
      setShowVerify(false);

      const userData = await syncUserData();
      if (!userData.display_name) setShowNameModal(true);

      debug("VERIFY", "Email verified + logged in");
    } catch (err) {
      debug("VERIFY", "Error:", err);
      setError(err.message || "Verification failed");
    }
  };

  const sendMessage = async () => {
    debug("SEND", "Message initiated:", input);

    if (!isAuthenticated || !userId) {
      debug("SEND", "Blocked — user not authenticated");
      setShowLogin(true);
      return;
    }
    if (!input.trim()) {
      debug("SEND", "Blocked — input empty");
      return;
    }
    if (!hasPaid && messageCount >= 5) {
      debug("SEND", "Free limit reached, showing paywall");
      setShowPaywall(true);
      return;
    }

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const headers = await getAuthHeaders();
      const body = {
        message: input,
        bot_name: bot?.name || "Default",
        user_id: userId,
        user_name: userName || "baby",
      };
      debug("SEND", "Sending body:", body);

      const data = await apiFetch("/chat", {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      debug("SEND", "Response:", data);
    } catch (err) {
      debug("SEND", "Error:", err);
      silentLogout();
      setShowLogin(true);
    } finally {
      setIsTyping(false);
      debug("SEND", "Finished");
    }
  };

  // rest of render unchanged ...


// Login handler

  return (
    <div className="flex flex-col h-screen bg-[#2C1F3D] text-white">
      <div className="bg-[#1F1B29] p-4 shadow-lg flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white text-center sm:text-lg md:text-xl">VOXELLA AI</h1>
        {!isAuthenticated && (
          <div className="flex gap-4">
            <button onClick={() => setShowSignup(true)} className="bg-[#5A2D8C] px-4 py-2 rounded-lg hover:bg-[#6B3B98] transition-all duration-300">Sign Up</button>
            <button onClick={() => setShowLogin(true)} className="bg-[#5A2D8C] px-4 py-2 rounded-lg hover:bg-[#6B3B98] transition-all duration-300">Log In</button>
          </div>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`flex items-end mb-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "bot" && (
              <img src={getBotPic(bot?.name)} alt="Bot" className="w-10 h-10 rounded-full mr-3" />  
            )}
            <div className={`max-w-[70%] sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] px-4 py-3 rounded-2xl text-base whitespace-pre-wrap leading-relaxed relative ${msg.sender === "user" ? "bg-[#5A2D8C]" : "bg-[#3A2A4D]"}`}>
              {msg.text}
              {msg.audio && <AudioWave url={msg.audio} />}
              {msg.image && <img src={msg.image} alt="NSFW" className="mt-2 w-full rounded-lg" />}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div className="flex justify-start mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.6 }}>
            <div className="px-4 py-2 bg-[#3A2A4D] rounded-2xl text-sm">{bot.name} is typing...</div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="flex p-4 bg-[#1F1B29]">
        <textarea
          ref={inputRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          rows={1}
          className="flex-1 p-2 bg-[#3A2A4D] text-white rounded-lg outline-none resize-none min-h-[40px] max-h-[200px] overflow-y-auto"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="ml-2 bg-[#333333] px-4 py-2 rounded-lg hover:bg-[#444444] transition-all duration-300"
        >
          Send
        </button>
            
      </div>

      {/* Paywall Modal */}
      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1F1B29]/90 rounded-2xl p-8 shadow-2xl max-w-md w-full text-white relative border border-[#5A2D8C]/40"
          >
            <h2 className="text-3xl font-bold text-center mb-6">Unlock Premium Access</h2>
            <div className="space-y-4">
              <button onClick={() => handleTierClick("tier1")} className="block w-full text-center text-lg bg-[#5A2D8C] px-4 py-2 rounded-lg hover:bg-[#6B3B98]">
                Unlock for $5 (One-Time)
              </button>
              <button onClick={() => handleTierClick("tier2")} className="block w-full text-center text-lg bg-[#5A2D8C] px-4 py-2 rounded-lg hover:bg-[#6B3B98]">
                Unlock for $10 (One Week)
              </button>
              <button onClick={() => handleTierClick("tier3")} className="block w-full text-center text-lg bg-[#5A2D8C] px-4 py-2 rounded-lg hover:bg-[#6B3B98]">
                Unlock for $20 (One Month)
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1F1B29]/90 rounded-2xl p-8 shadow-2xl max-w-md w-full text-white relative border border-[#5A2D8C]/40"
          >
            <h2 className="text-3xl font-bold text-center mb-6">Log In</h2>

            <form onSubmit={handleLoginSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full p-3 mb-4 bg-[#3A2A4D] text-white rounded-lg"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full p-3 mb-4 bg-[#3A2A4D] text-white rounded-lg"
              />
              <button type="submit" className="w-full bg-[#5A2D8C] text-white px-4 py-2 rounded-lg hover:bg-[#6B3B98]">Log In</button>
              {error && <div className="mt-4 text-center text-red-500">{error}</div>}
            </form>

            <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setShowLogin(false)}>
              <span className="text-lg font-bold text-[#999]">X</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Sign Up Modal */}
      {showSignup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1F1B29]/90 rounded-2xl p-8 shadow-2xl max-w-md w-full text-white relative border border-[#5A2D8C]/40"
          >
            <h2 className="text-3xl font-bold text-center mb-6">Sign Up</h2>

            <form onSubmit={handleSignupSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full p-3 mb-4 bg-[#3A2A4D] text-white rounded-lg"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full p-3 mb-4 bg-[#3A2A4D] text-white rounded-lg"
              />
              <button type="submit" className="w-full bg-[#5A2D8C] text-white px-4 py-2 rounded-lg hover:bg-[#6B3B98]">Sign Up</button>
              {error && <div className="mt-4 text-center text-red-500">{error}</div>}
            </form>

            <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setShowSignup(false)}>
              <span className="text-lg font-bold text-[#999]">X</span>
            </div>
          </motion.div>
        </div>
      )}

        {/* Verify Email Modal */}
{showVerify && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-[#1F1B29]/90 rounded-2xl p-8 shadow-2xl max-w-md w-full text-white relative border border-[#5A2D8C]/40"
    >
      <h2 className="text-3xl font-bold text-center mb-6">Verify Email</h2>
      <form onSubmit={handleVerifySubmit}>
        <input
          type="text"
          value={verifyCode}
          onChange={(e) => setVerifyCode(e.target.value)}
          placeholder="Enter 6-digit code"
          required
          className="w-full p-3 mb-4 bg-[#3A2A4D] text-white rounded-lg"
        />
        <button
          type="submit"
          className="w-full bg-[#5A2D8C] text-white px-4 py-2 rounded-lg hover:bg-[#6B3B98]"
        >
          Verify
        </button>
        {error && <div className="mt-4 text-center text-red-500">{error}</div>}
      </form>

      <div className="absolute top-4 right-4 cursor-pointer" onClick={() => setShowVerify(false)}>
        <span className="text-lg font-bold text-[#999]">X</span>
      </div>
    </motion.div>
  </div>
)}
{showPremiumUnlocked && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-[#1F1B29]/90 rounded-2xl p-8 shadow-2xl max-w-md w-full text-white relative border border-[#5A2D8C]/40 text-center"
    >
      <h2 className="text-3xl font-bold mb-4">🎉 Premium Unlocked!</h2>
      <p className="text-lg mb-6">Enjoy unlimited access with your new tier 🚀</p>
      <button
        onClick={() => setShowPremiumUnlocked(false)}
        className="bg-[#5A2D8C] px-6 py-2 rounded-lg hover:bg-[#6B3B98] transition-all duration-300"
      >
        Continue
      </button>
    </motion.div>
  </div>
)}
{showAgeModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-[#1F1B29]/90 rounded-2xl p-8 max-w-md w-full text-white text-center border border-[#5A2D8C]/40"
    >
      <h2 className="text-2xl font-bold mb-4">Age Verification</h2>
      <p className="mb-6">
        You must be 18+ to use this AI chatbot. All interactions are fictional.
      </p>
      <button
        onClick={() => {
          localStorage.setItem("age_verified", "true");
          setShowAgeModal(false);
        }}
        className="bg-[#5A2D8C] px-6 py-2 rounded-lg hover:bg-[#6B3B98] transition-all duration-300"
      >
        I’m 18+ and understand
      </button>
    </motion.div>
  </div>
)}
{showNameModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
    <div className="bg-[#1F1B29] p-8 rounded-2xl text-white w-[90%] max-w-sm text-center">
      <h2 className="text-2xl font-bold mb-4">Hey sweetheart! 🥰✨</h2>
      <p className="mb-4">What should I call you?</p>
      <input
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="w-full p-2 mb-4 rounded-lg bg-[#3A2A4D] text-white outline-none"
        placeholder="Enter your name..."
      />
      <button
        onClick={handleNameConfirm}
        className="bg-[#ff69b4] px-6 py-2 rounded-lg hover:bg-pink-500 transition-all duration-300"
      >
        Confirm
      </button>
    </div>
  </div>
)}

    </div>
  );
}
