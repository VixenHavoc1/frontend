"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import AudioWave from "./AudioWave";
import PremiumModal from './PremiumModal';
import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient'
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
const [showAgeModal, setShowAgeModal] = useState(
  !localStorage.getItem("age_verified")
);
const [selectedBot, setSelectedBot] = useState(null); // user picks bot first

 
  const getSession = async () => {
  const token = localStorage.getItem("access_token");
  return token ? { access_token: token } : null;
};
const handleBotSelect = (bot) => {
  setSelectedBot(bot);

  // Only show age modal if not verified
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
    if (savedCount) {
      setMessageCount(parseInt(savedCount, 10));
    }
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

if (ok && data.email) {
  setUserEmail(data.email);
}

  } catch (err) {
    console.error("Failed to fetch user email", err);
  }
};
useEffect(() => {
  const storedName = localStorage.getItem("userName");
  const nameSet = localStorage.getItem("nameSet");

  if (storedName) {
    setUserName(storedName);
  } else if (!nameSet && isAuthenticated) { // only after login/signup
    setShowNameModal(true);
  }
}, [isAuthenticated]);
const handleNameConfirm = () => {
  if (userName.trim()) {
    localStorage.setItem("userName", userName.trim());
    localStorage.setItem("nameSet", "true"); // ensures modal shows only once
    setShowNameModal(false);
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
        "Content-Type": "application/json",   // ✅ required
        ...headers,                           // ✅ Authorization
      },
      body: JSON.stringify({
  message: input,
  bot_name: bot?.name || "Default",
 }),

    });

    if (status === 403) {
      console.log("🚫 403 Forbidden — triggering paywall");
      setShowPaywall(true);
      return;
    }

    if (!ok) {
      throw new Error(data?.error || "Failed to send message");
    }

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
    e.preventDefault(); // prevent newline on Enter
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
  setError("");
  try {
  await signup(email, password);
   setShowSignup(false);
   setShowVerify(true);
  } catch (err) {
    console.error("Signup error:", err);
    setError(err.message || "Something went wrong. Please try again.");
  }
};


const handleVerifySubmit = async (e) => {
  e.preventDefault();
  try {
  await verifyEmail(email, verifyCode);   // just verifies
    await login(email, password);           // saves access + refresh tokens
    setIsAuthenticated(true);
    setShowVerify(false);
    await fetchUserEmail();
  } catch (err){
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
  const priceMap = {
    tier1: 5,
    tier2: 10,
    tier3: 20,
  };
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
    await login(email, password);           // saves access + refresh tokens
    setIsAuthenticated(true);
    setShowLogin(false);
    await fetchUserEmail();
    
  } catch (err) {
    console.error("Login error:", err);
    setError(err.message || "Something went wrong. Please try again.");
  }
};

  
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
