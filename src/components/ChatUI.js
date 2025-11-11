"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import AudioWave from "./AudioWave";
import PremiumModal from './PremiumModal';
import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient'
import "./chatui.css";
import { apiFetch, login, signup, verifyEmail, fetchMe, sendMessage, logout } from "../api";

export default function ChatUI({ bot }) {
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
  const [freeMessagesLeft, setFreeMessagesLeft] = useState(5);

  const [showVerify, setShowVerify] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [showNameModal, setShowNameModal] = useState(false);

const CHAT_BACKEND_URL = "https://api.voxellaai.site";
const PAYMENT_BACKEND_URL = "https://api.voxellaai.site";
const [showPremiumUnlocked, setShowPremiumUnlocked] = useState(false);
const [showAgeModal, setShowAgeModal] = useState(
  !localStorage.getItem("age_verified")
);
const [selectedBot, setSelectedBot] = useState(null); // user picks bot first
// At the top of your ChatUI component
const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
const [userEmail, setUserEmail] = useState(localStorage.getItem("userEmail") || null);
const [hasPaid, setHasPaid] = useState(localStorage.getItem("hasPaid") === 'true');
 
  const getSession = async () => {
  const token = localStorage.getItem("access_token");
  return token ? { access_token: token } : null;
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
  const savedBot = localStorage.getItem("selectedBot");
  if (savedBot) {
    try {
      setSelectedBot(JSON.parse(savedBot)); // ✅ Restore bot from localStorage
    } catch (err) {
      console.error("Failed to parse saved bot:", err);
    }
  }
}, []);

 useEffect(() => {
  const shown = localStorage.getItem("premium_modal_shown");
  if (hasPaid && !shown) {
    setShowPremiumUnlocked(true);
    localStorage.setItem("premium_modal_shown", "true");
  }
}, [hasPaid]);

  const handleBotSelect = (bot) => {
  setSelectedBot(bot);
  localStorage.setItem("selectedBot", JSON.stringify(bot)); // ✅ Save selection

  // Only show age modal if not verified
  if (!localStorage.getItem("age_verified")) {
    setShowAgeModal(true);
  }
};


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

useEffect(() => {
  const savedFree = localStorage.getItem("free_messages_left");
  if (savedFree) setFreeMessagesLeft(parseInt(savedFree, 10));
}, []);
  
const BOT_DESCRIPTIONS = [
  {
    name: "Luna",
    vibe: "Calm • Reflective & Gentle",
    description:
      "A soft voice for when your mind feels heavy. Luna helps you find balance through stillness and gentle reflection.",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Kai",
    vibe: "Supportive • Uplifting & Insightful",
    description:
      "When life feels uncertain, Kai brings perspective — kind reminders that you’re stronger and wiser than you think.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Willow",
    vibe: "Empathetic • Grounded & Nature-Loving",
    description:
      "A grounding presence who helps you slow down, breathe, and reconnect with nature and yourself.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sol",
    vibe: "Warm • Motivational & Optimistic",
    description:
      "When you’re running low on energy, Sol helps you rediscover light and motivation — a voice of gentle encouragement.",
    image:
      "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Aria",
    vibe: "Mindful • Kind & Understanding",
    description:
      "Aria helps you pause and reflect. Every conversation with her feels like a calm breath of clarity and compassion.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  },
];

const silentLogout = () => {
    console.log("LOGOUT: Clearing user session data."); // 🐛 Debug log
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    setIsAuthenticated(false);
    setUserEmail(null);
    setUserName("");
    setUserId(null); // Explicitly reset userId
  };
  
// ---- Helper: getAuthHeaders ----
const getAuthHeaders = async () => {
    let token = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");

    console.log("AUTH: Checking for access token..."); // 🐛 Debug log
    if (!token && refresh) {
      console.log("AUTH: Access token missing, trying to refresh..."); // 🐛 Debug log
      try {
        const res = await fetch(`${CHAT_BACKEND_URL}/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refresh }),
        });
        const data = await res.json();
        if (res.ok && data.access_token) {
          token = data.access_token;
          localStorage.setItem("access_token", token);
          console.log("AUTH: Token refreshed successfully."); // 🐛 Debug log
        } else {
          console.error("AUTH: Refresh failed, response was not ok.", data); // 🐛 Debug log
          silentLogout();
          return {};
        }
      } catch (err) {
        console.error("AUTH: Refresh token network error:", err); // 🐛 Debug log
        silentLogout();
        return {};
      }
    }
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    console.log("AUTH: Final headers being returned:", headers); // 🐛 Debug log
    return headers;
  };




const handleNameConfirm = async () => {
  if (!userName.trim()) return;

  setIsUpdatingName(true);
  try {
    const headers = await getAuthHeaders();
    if (!headers.Authorization) {
      console.error("No auth token — cannot update display name");
      alert("Please log in first.");
      setShowLogin(true);
      setIsUpdatingName(false);
      return;
    }

    const data = await apiFetch("/me/display-name", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ display_name: userName.trim() }),
    });

    if (data && !data.error) {
      // Save locally
      localStorage.setItem("userName", userName.trim());
      localStorage.setItem("nameSet", "true");
      setShowNameModal(false);
    } else {
      console.error("Failed to update display name:", data?.error);
      setError("Failed to update name. Try again.");
    }
  } catch (err) {
    console.error("Error updating name:", err);
    setError("Something went wrong. Try again.");
  } finally {
    setIsUpdatingName(false);
  }
};

// ---- sendMessage function ----


     
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

  if (name.includes("luna"))
    return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";

  if (name.includes("kai"))
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";

  if (name.includes("willow"))
    return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80";

  if (name.includes("sol"))
    return "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?auto=format&fit=crop&w=800&q=80";

  if (name.includes("aria"))
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";

  // fallback image (calm default nature photo)
  return "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80";
};

const handleSignupSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const data = await signup(email, password);

    // 🟡 Case 1: Already verified but wrong password
    if (data?.already_verified && data?.error === "invalid_password") {
      setError("Email already verified but incorrect password.");
      return; // stop here, no verify modal
    }

    // 🟢 Case 2: Already verified & auto-login allowed
    if (data?.already_verified && data?.auto_login && data?.user_id) {
      // Directly log the user in
      const loginData = await login(email, password);
      if (loginData?.access_token) {
        localStorage.setItem("access_token", loginData.access_token);
        if (loginData.refresh_token)
          localStorage.setItem("refresh_token", loginData.refresh_token);

        setIsAuthenticated(true);
        setShowSignup(false);
        setShowVerify(false);

        const userData = await syncUserData();
        if (userData && !userData.display_name) setShowNameModal(true);
        return;
      }
    }

    // 🧩 Case 3: Normal signup (new or unverified user)
    setShowSignup(false);
    setShowVerify(true);

  } catch (err) {
    console.error("Signup error:", err);
    if (err.message?.includes("already verified")) {
      setError("Email already verified but incorrect password.");
    } else {
      setError("Something went wrong. Please try again.");
    }
  }
};

const handleVerifySubmit = async (e) => {
  e.preventDefault();
  setError("");

  // 🔁 Silent retry helper
  async function safeFetch(fn, args = [], retries = 2, delay = 1500) {
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn(...args);
      } catch (err) {
        console.warn(`Verify attempt ${i + 1} failed:`, err.message);
        if (i < retries) {
          await new Promise((r) => setTimeout(r, delay));
          continue;
        } else {
          throw err;
        }
      }
    }
  }

  try {
    // ✅ Verify email with retry
    await safeFetch(verifyEmail, [email, verifyCode]);

    // ✅ Then login with retry
    const loginData = await safeFetch(login, [email, password]);

    if (!loginData.access_token) throw new Error("Login failed");

    // ✅ Save tokens
    await Promise.resolve().then(() => {
      localStorage.setItem("access_token", loginData.access_token);
      localStorage.setItem("refresh_token", loginData.refresh_token || "");
    });

    setIsAuthenticated(true);
    setShowVerify(false);

    // ✅ Let localStorage sync before fetching user info
    await new Promise((r) => setTimeout(r, 500));
    const userData = await syncUserData();

    if (userData && !userData.display_name) {
      setShowNameModal(true);
    }
  } catch (err) {
    console.error("Verification/Login error:", err);
    setError("Something went wrong. Please try again.");
  }
};




  const closePaywallModal = () => setShowPaywall(false);
  const unlockAccess = () => {
    localStorage.setItem("has_paid", "true");
    setHasPaid(true);
    setShowPaywall(false);
  };

 async function handleTierClick(tierId) {
  const backendUrl = "https://api.voxellaai.site"; // hardcoded URL
  try {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) throw new Error("User not authenticated");

    console.log("🟢 [DEBUG] Creating invoice for tier:", tierId);
    console.log("🟢 [DEBUG] Using backend URL:", backendUrl);

    const res = await fetch(`${backendUrl}/api/create-invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ tier_id: tierId }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ [ERROR] Invoice creation failed:", errText);
      throw new Error(`Failed with status ${res.status}`);
    }

    const data = await res.json();
    console.log("✅ [DEBUG] Invoice created:", data);

  if (data.payment_url) {  // <-- use payment_url instead of payment_link
  console.log("🟢 [DEBUG] Redirecting to payment URL:", data.payment_url);
  window.location.href = data.payment_url;
} else {
  console.error("❌ [ERROR] No payment_url found in response:", data);
  alert("Something went wrong. Please try again.");
}

  } catch (err) {
    console.error("❌ Exception in handleTierClick:", err);
    alert(err.message || "Failed to create payment. Please try again.");
  }
}


const syncUserData = async () => {
  try {
    const headers = await getAuthHeaders();
    if (!headers.Authorization) return null;

    const data = await apiFetch("/me", { method: "GET", headers });
    if (data && data.id) {
      setUserId(data.id);
      setUserEmail(data.email);
      setUserName(data.display_name || "");
      setHasPaid(data.has_paid || false);

      // ✅ Just update free messages directly
      if (typeof data.free_messages_left !== "undefined") {
        setFreeMessagesLeft(data.free_messages_left);
        localStorage.setItem("free_messages_left", data.free_messages_left);
      }

      localStorage.setItem("userId", data.id);
      localStorage.setItem("userEmail", data.email);
      localStorage.setItem("userName", data.display_name || "");
      localStorage.setItem("hasPaid", data.has_paid ? "true" : "false");

      return data;
    } else {
      silentLogout();
      return null;
    }
  } catch (err) {
    console.error("SYNC error:", err);
    silentLogout();
    return null;
  }
};



  // Initial load effect
  useEffect(() => {
    const initializeUserSession = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        console.log("INIT: Found existing access token. Authenticating."); // 🐛 Debug log
        setIsAuthenticated(true);
        await syncUserData();
      } else {
        console.log("INIT: No access token found. User is not authenticated."); // 🐛 Debug log
      }
    };
    initializeUserSession();
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    inputRef.current?.focus();
    const savedCount = localStorage.getItem("message_count");
    if (savedCount) {
      setMessageCount(parseInt(savedCount, 10));
    }
  }, []);

const handleLoginSubmit = async (e) => {
  e.preventDefault();
  setError("");

  // 🔁 Silent retry logic
  async function safeLoginFetch(url, payload, retries = 2, delay = 1500) {
    for (let i = 0; i <= retries; i++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        // ✅ Success — return parsed data
        if (res.ok) return await res.json();

        // ❌ Known user-related errors (don’t retry)
        if ([401, 404].includes(res.status)) {
          const msg =
            res.status === 401
              ? "Incorrect email or password."
              : "User not found. Please sign up first.";
          throw new Error(msg);
        }

        throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        console.warn(`Login attempt ${i + 1} failed:`, err.message);
        if (i < retries) {
          await new Promise((r) => setTimeout(r, delay));
          continue; // try again silently
        } else {
          throw err; // give up after all retries
        }
      }
    }
  }

  try {
    const data = await safeLoginFetch(`${CHAT_BACKEND_URL}/login`, {
      email,
      password,
    });

    if (!data.access_token) {
      throw new Error("Login failed — missing token");
    }

    await Promise.resolve().then(() => {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token || "");
    });

    setIsAuthenticated(true);
    setShowLogin(false);

    await new Promise((r) => setTimeout(r, 500));
    const userData = await syncUserData();

    if (userData && !userData.display_name) setShowNameModal(true);
  } catch (err) {
    console.error("Login error:", err);
    if (
      err.message.includes("Incorrect email or password") ||
      err.message.includes("User not found")
    ) {
      setError(err.message);
    } else {
      setError("Something went wrong. Please try again.");
    }
  }
};


  // Empty dependency array means it runs only once on mount
const sendMessage = async () => {
  console.log("SEND: Message initiated.");

  if (!isAuthenticated || !userId) {
    console.warn("SEND: User not authenticated or userId is null. Showing login modal.");
    setShowLogin(true);
    return;
  }

  if (!input.trim()) {
    console.warn("SEND: Input is empty. Aborting.");
    return;
  }

  // Free message limit check
 if (!hasPaid && freeMessagesLeft <= 0) {
  console.log("🚨 [DEBUG] Triggering paywall modal (free limit reached)");
  setShowPaywall(true);
  return;
}

  const currentUserId = userId;
  const currentUserName = userName || "baby";

  // Add user's message to UI immediately
  const userMessage = { sender: "user", text: input };
  setMessages(prev => [...prev, userMessage]);

  // Clear input and increment message count
  setInput("");
  // ✅ Fetch updated count from backend after sending
const updatedUser = await syncUserData();
if (updatedUser && typeof updatedUser.free_messages_left !== "undefined") {
  setFreeMessagesLeft(updatedUser.free_messages_left);
  console.log("🧮 [DEBUG] Updated free messages left:", updatedUser.free_messages_left);
}

  setIsTyping(true);

  try {
    const headers = await getAuthHeaders();
    if (!headers.Authorization) {
      console.error("SEND: No Authorization header returned. Session expired?");
      throw new Error("Authorization failed. Please log in again.");
    }

   const activeBot = selectedBot?.name || bot?.name || "Default";

const body = {
  message: userMessage.text,
  bot_name: activeBot,
  user_id: currentUserId,
  user_name: currentUserName,
};


    console.log("SEND: Sending message to API with body:", body);

    const data = await apiFetch("/chat", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    console.log("SEND: Received response from API:", data);

    if (data?.error?.code === 401) {
      console.error("SEND: Received 401 Unauthorized from server.");
      throw new Error("Authorization failed. Please log in again.");
    }

    // Declare bot reply variables outside the block
    let botReplyText = "";
    let botAudio = null;
    let botImage = null;

    // Extract bot response if available
    if (data) {
      botReplyText = data.response || "";
      botAudio = data.audio || null;
      botImage = data.image || null;
    }

    // Append bot message to UI
    if (botReplyText) {
      const botMessage = {
        sender: "bot",
        text: botReplyText,
        audio: botAudio,
        image: botImage,
      };
      setMessages(prev => [...prev, botMessage]);
    } else {
      console.warn("SEND: Bot response empty");
    }

  } catch (err) {
    console.error("SEND: Message sending failed:", err);
    alert(err.message || "Failed to send message. Your session may have expired.");
    silentLogout();
    setShowLogin(true);
  } finally {
    setIsTyping(false);
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log("SEND: Message process finished.");
  }
};

 return (
  <div className="flex flex-col h-screen text-white bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]">
    {/* Header */}
    <div className="bg-white/10 backdrop-blur-md p-4 flex justify-between items-center rounded-b-2xl border-b border-white/10">
      <h1 className="text-2xl font-bold text-white text-center sm:text-lg md:text-xl">
        VOXELLA AI
      </h1>
      {!isAuthenticated && (
        <div className="flex gap-4">
          <button onClick={() => setShowSignup(true)} className="bg-teal-500/80 hover:bg-teal-400 text-white px-4 py-2 rounded-xl transition-all">
            Sign Up
          </button>
          <button onClick={() => setShowLogin(true)} className="bg-sky-500/80 hover:bg-sky-400 text-white px-4 py-2 rounded-xl transition-all">
            Log In
          </button>
        </div>
      )}
    </div>

    {/* Chat Area */}
    <div className="flex-1 overflow-y-auto p-4 relative">
      <div className="flex flex-col w-full">
        {/* Bot Header */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={getBotPic(selectedBot?.name || bot?.name)}
            alt="Bot"
            className="w-16 h-16 rounded-full border-2 border-white shadow-lg mb-2"
          />
          <h2 className="text-lg font-bold">{selectedBot?.name || bot?.name}</h2>
          <p className="text-sm text-gray-300 text-center max-w-xs">
            {BOT_DESCRIPTIONS[selectedBot?.name || bot?.name] ||
              "Your AI wellbeing companion for calm reflection 🌿"}
          </p>
        </div>
   
        {/* Messages */}
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`flex items-end mb-4 w-full ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "bot" && (
              <img
                src={getBotPic(selectedBot?.name || bot?.name)}
                alt="Bot"
                className="w-10 h-10 rounded-full mr-3"
              />
            )}
            <div
              className={`
                max-w-[70%] sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] px-5 py-3 text-base whitespace-pre-wrap leading-relaxed relative
                ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-teal-500 to-sky-500 text-white shadow-lg rounded-3xl rounded-br-none border border-white/10 backdrop-blur-sm"
                    : "bg-white/10 text-gray-100 shadow-inner rounded-3xl rounded-bl-none border border-white/10 backdrop-blur-sm"
                }
              `}
            >
              {msg.text}
              {msg.audio && <AudioWave url={msg.audio} />}
              {msg.image && (
                <img
                  src={msg.image}
                  alt="Attachment"
                  className="mt-2 w-full rounded-lg"
                />
              )}
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
            <div className="px-4 py-2 bg-white/10 rounded-2xl text-sm">
              {(selectedBot?.name || bot?.name)} is reflecting...
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>
    </div>

    {/* Input Box */}
    <div className="flex p-4 bg-white/10 backdrop-blur-md">
      <textarea
        ref={inputRef}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        rows={1}
        className="flex-1 bg-transparent text-white placeholder-gray-400 px-4 py-3 rounded-3xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-1 resize-none min-h-[44px] max-h-[200px] transition-all duration-300"
        placeholder="Share what’s on your mind..."
      />
      <button onClick={sendMessage} className="ml-2 bg-gradient-to-r from-teal-500 to-sky-500 px-5 py-2 rounded-3xl text-white hover:opacity-90 transition-all">
        Send
      </button>
    </div>
    {/* Signup Modal */}
{showSignup && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <form
      onSubmit={handleSignupSubmit}
      className="bg-gray-800 p-6 rounded-2xl w-80 space-y-4 relative"
    >
      <h2 className="text-xl font-bold text-center">Sign Up</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full p-2 rounded bg-gray-700 text-white"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full p-2 rounded bg-gray-700 text-white"
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        className="bg-teal-500 hover:bg-teal-400 text-white w-full py-2 rounded"
      >
        Sign Up
      </button>
      <button
        type="button"
        onClick={() => setShowSignup(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
      >
        ✕
      </button>
    </form>
  </div>
)}

{/* Login Modal */}
{showLogin && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <form
      onSubmit={handleLoginSubmit}
      className="bg-gray-800 p-6 rounded-2xl w-80 space-y-4 relative"
    >
      <h2 className="text-xl font-bold text-center">Log In</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full p-2 rounded bg-gray-700 text-white"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full p-2 rounded bg-gray-700 text-white"
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        className="bg-teal-500 hover:bg-teal-400 text-white w-full py-2 rounded"
      >
        Log In
      </button>
      <button
        type="button"
        onClick={() => setShowLogin(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
      >
        ✕
      </button>
    </form>
  </div>
)}

    {/* AI Disclaimer Modal (replaces Age Verification) */}
    {showAgeModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="glass-modal p-8 max-w-md w-full text-white text-center"
        >
          <h2 className="text-2xl font-bold mb-4">AI Disclaimer</h2>
          <p className="mb-6 text-gray-200">
            Voxella AI is an AI wellbeing companion — not a therapist.  
            All conversations are for reflection and personal support only.
          </p>
          <button
            onClick={() => {
              localStorage.setItem("age_verified", "true");
              setShowAgeModal(false);
            }}
            className="bg-gradient-to-r from-teal-500 to-sky-500 px-6 py-2 rounded-xl hover:scale-105 transition-all"
          >
            I Understand
          </button>
        </motion.div>
      </div>
    )}
   {/* Verification Modal */}
{showVerification && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        try {
          const res = await fetch(`${BACKEND_URL}/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, code: verificationCode }),
          });
          const data = await res.json();
          if (res.ok) {
            setShowVerification(false);
            setIsAuthenticated(true);
            localStorage.setItem("token", data.token);
          } else {
            setError(data.detail || "Invalid code");
          }
        } catch (err) {
          setError("Network error");
        }
      }}
      className="bg-gray-800 p-6 rounded-2xl w-80 space-y-4 relative"
    >
      <h2 className="text-xl font-bold text-center">Verify Your Email</h2>
      <p className="text-gray-300 text-sm text-center">
        We’ve sent a 6-digit verification code to <b>{email}</b>.
      </p>
      <input
        type="text"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        placeholder="Enter verification code"
        className="w-full p-2 rounded bg-gray-700 text-white text-center tracking-widest"
        maxLength={6}
      />
      {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      <button
        type="submit"
        className="bg-teal-500 hover:bg-teal-400 text-white w-full py-2 rounded"
      >
        Verify
      </button>
      <button
        type="button"
        onClick={() => setShowVerification(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
      >
        ✕
      </button>
    </form>
  </div>
)}

    {/* Name Modal */}
    {showNameModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="glass-modal p-8 max-w-sm w-full text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Hey there 🌿</h2>
          <p className="mb-4">Let’s personalize your calm space — what should I call you?</p>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name..."
            className="glass-input w-full mb-4"
          />
          <button
            onClick={handleNameConfirm}
            className="bg-gradient-to-r from-teal-500 to-sky-500 px-6 py-2 rounded-xl hover:scale-105 transition-all"
          >
            Confirm
          </button>
        </motion.div>
      </div>
    )}
  </div>
);
}
