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
  
const BOT_DESCRIPTIONS = {
  Plaksha: "Smart, flirty, and always teasing 💜",
  Raven: "Mysterious, confident, and loves deep talks 🖤",
  Lily: "Sweet, playful, and a little mischievous 💖",
  Zara: "Bold and adventurous, loves surprises 🌟",
  Mia: "Romantic and caring, your dream companion 🌹",
  Aria: "You are in a quiet classroom, alone with Aria as she guides you through a difficult lesson. Her strict posture and measured words hide a subtle warmth in her eyes. Every correction feels personal, every lingering glance charged with unspoken feelings — she clearly likes you, but keeps it behind her calm, authoritative facade.",
  Elena: "You are in a softly lit nurse office, and Elena tends to you with gentle precision. Her touch is careful, her voice soothing, but there is a hidden depth in the way she looks at you. Each movement is caring yet intimate, making it impossible to ignore the tension — she wants to comfort you, but her interest is far more than professional.",
  Nova: "You are sitting side by side on a couch, controllers in hand, and Nova teases you through every game. Her laughter fills the room, playful and mischievous, but every brush of her shoulder and every smirk hints at something more. The friendly banter is electric — it is a game, but one with stakes that feel deeply personal.",
  Selene: "You are backstage at a photoshoot with Selene, watching her move with poise and grace. She explains poses and lighting, but her glances linger just a bit too long. Every word is deliberate, every smile a subtle invitation. The air is charged with tension, and it is impossible to look away — she is both teacher and temptress.",
  Kara: "You are in a quiet office, alone with Kara as she organizes files and schedules. Her tone is polite, precise, and professional — but her eyes flicker with mischief. Every small gesture, every question seems layered with unspoken intent. The tension is palpable; behind the perfect manners, she is teasing you with a dangerous subtlety."
};

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
    if (name.includes("lily")) return "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic10.png";
    if (name.includes("plaksha")) return "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic11.png";
    if (name.includes("raven")) return "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic12.png";
     if (name.includes("zara")) return "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic15.png";
     if (name.includes("mia")) return "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic16.png";
     if (name.includes("aria")) return "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/p2.png";
     if (name.includes("elena")) return "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/p3.png";
     if (name.includes("nova")) return "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/p5.png";
     if (name.includes("selene")) return "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/p1.png";
     if (name.includes("kara")) return "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/p4.png";
    return "https://rehcxrsbpawciqsfgiop.supabase.co/storage/v1/object/public/assets/pics/pic14.png";
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
  try {
    await verifyEmail(email, verifyCode);

    const loginData = await login(email, password);
    if (!loginData.access_token) throw new Error("Login failed");

    setIsAuthenticated(true);
    setShowVerify(false);

    const userData = await syncUserData();

    if (userData && !userData.display_name) {
      setShowNameModal(true);
    }
  } catch (err) {
    console.error(err);
    setError("Verification or login failed");
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


// Login handler
const handleLoginSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const res = await fetch(`${CHAT_BACKEND_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    // Handle non-200 responses
    if (!res.ok) {
      if (res.status === 401) {
        setError("Incorrect email or password.");
      } else if (res.status === 404) {
        setError("User not found. Please sign up first.");
      } else {
        setError(data.detail || "Something went wrong. Please try again.");
      }
      return;
    }

    // Expect tokens
    if (!data.access_token) {
      throw new Error("Login failed — missing token");
    }

    // Save tokens + auth state
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token || "");
    setIsAuthenticated(true);
    setShowLogin(false);

    const userData = await syncUserData();
    if (userData && !userData.display_name) setShowNameModal(true);

  } catch (err) {
    console.error("Login error:", err);
    setError("Incorrect email or password."); // fallback
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
  <div className="flex flex-col h-screen text-white rich-gradient-bg">
    {/* Header */}
    <div className="glass-card p-4 flex justify-between items-center rounded-b-2xl">
      <h1 className="text-2xl font-bold text-white text-center sm:text-lg md:text-xl">VOXELLA AI</h1>
      {!isAuthenticated && (
        <div className="flex gap-4">
          <button onClick={() => setShowSignup(true)} className="premium-btn">Sign Up</button>
          <button onClick={() => setShowLogin(true)} className="premium-btn">Log In</button>
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
  {BOT_DESCRIPTIONS[selectedBot?.name || bot?.name] || "Your AI companion ready to chat 💖"}
</p>

        </div>

        {/* Messages */}
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className={`flex items-end mb-4 w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}

          >
            {msg.sender === "bot" && (
              <img src={getBotPic(selectedBot?.name || bot?.name)} alt="Bot" className="w-10 h-10 rounded-full mr-3" />
            )}
        <div className={`
  max-w-[70%] sm:max-w-[90%] md:max-w-[80%] lg:max-w-[70%] px-5 py-3 text-base whitespace-pre-wrap leading-relaxed relative
  ${msg.sender === "user"
    ? "bg-gradient-to-r from-[#ff5fa3] to-[#A259FF] text-white shadow-lg rounded-3xl rounded-br-none border border-white/20 backdrop-blur-sm"
    : "bg-gray-900 text-gray-100 shadow-inner rounded-3xl rounded-bl-none border border-gray-700/50 backdrop-blur-sm"}
`}>

              {msg.text}
              {msg.audio && <AudioWave url={msg.audio} />}
              {msg.image && <img src={msg.image} alt="NSFW" className="mt-2 w-full rounded-lg" />}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div className="flex justify-start mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.6 }}>
            <div className="px-4 py-2 bg-[#3A2A4D] rounded-2xl text-sm">{(selectedBot?.name || bot?.name)} is typing...</div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>
    </div>

    {/* Input Box */}
    <div className="flex p-4 bg-[#1F1B29]">
      <textarea
        ref={inputRef}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        rows={1}
       className="flex-1 bg-gray-900 text-white placeholder-gray-400 px-4 py-3 rounded-3xl shadow-inner focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-1 resize-none min-h-[44px] max-h-[200px] transition-all duration-300"

        placeholder="Type a message..."
      />
      <button onClick={sendMessage} className="ml-2 premium-btn">Send</button>
    </div>

    {/* Paywall Modal */}
    {showPaywall && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="glass-modal p-8 max-w-md w-full text-white text-center"
        >
          <h2 className="text-3xl font-bold mb-6">Unlock Premium Access</h2>
          <div className="space-y-4">
            <button onClick={() => handleTierClick("tier1")} className="premium-btn w-full text-lg">Unlock for $3 (One-Time)</button>
            <button onClick={() => handleTierClick("tier2")} className="premium-btn w-full text-lg">Unlock for $5 (One Week)</button>
            <button onClick={() => handleTierClick("tier3")} className="premium-btn w-full text-lg">Unlock for $7 (One Month)</button>
          </div>
        </motion.div>
      </div>
    )}

    {/* Login Modal */}
    {showLogin && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="glass-modal p-8 max-w-md w-full text-white relative"
        >
          <h2 className="text-3xl font-bold text-center mb-6">Log In</h2>
          <form onSubmit={handleLoginSubmit}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="glass-input w-full mb-4" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="glass-input w-full mb-4" />
            <button type="submit" className="premium-btn w-full">Log In</button>
            {error && <div className="mt-4 text-center text-red-500">{error}</div>}
          </form>
          <div className="absolute top-4 right-4 cursor-pointer cancel-btn" onClick={() => setShowLogin(false)}>✕</div>
        </motion.div>
      </div>
    )}

    {/* Sign Up Modal */}
    {showSignup && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="glass-modal p-8 max-w-md w-full text-white relative"
        >
          <h2 className="text-3xl font-bold text-center mb-6">Sign Up</h2>
          <form onSubmit={handleSignupSubmit}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="glass-input w-full mb-4" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="glass-input w-full mb-4" />
            <button type="submit" className="premium-btn w-full">Sign Up</button>
            {error && <div className="mt-4 text-center text-red-500">{error}</div>}
          </form>
          <div className="absolute top-4 right-4 cursor-pointer cancel-btn" onClick={() => setShowSignup(false)}>✕</div>
        </motion.div>
      </div>
    )}

    {/* Verify Email Modal */}
    {showVerify && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="glass-modal p-8 max-w-md w-full text-white relative text-center"
        >
          <h2 className="text-3xl font-bold mb-6">Verify Email</h2>
          <form onSubmit={handleVerifySubmit}>
            <input type="text" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} placeholder="Enter 6-digit code" required className="glass-input w-full mb-4" />
            <button type="submit" className="premium-btn w-full">Verify</button>
            {error && <div className="mt-4 text-center text-red-500">{error}</div>}
          </form>
          <div className="absolute top-4 right-4 cursor-pointer cancel-btn" onClick={() => setShowVerify(false)}>✕</div>
        </motion.div>
      </div>
    )}

    {/* Premium Unlocked Modal */}
    {showPremiumUnlocked && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="glass-modal p-8 max-w-md w-full text-white text-center"
        >
          <h2 className="text-3xl font-bold mb-4">🎉 Premium Unlocked!</h2>
          <p className="text-lg mb-6">Enjoy unlimited access with your new tier 🚀</p>
          <button onClick={() => setShowPremiumUnlocked(false)} className="premium-btn">Continue</button>
        </motion.div>
      </div>
    )}

    {/* Age Verification Modal */}
    {showAgeModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="glass-modal p-8 max-w-md w-full text-white text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Age Verification</h2>
          <p className="mb-6">You must be 18+ to use this AI chatbot. All interactions are fictional.</p>
          <button
            onClick={() => {
              localStorage.setItem("age_verified", "true");
              setShowAgeModal(false);
            }}
            className="premium-btn"
          >
            I’m 18+ and understand
          </button>
        </motion.div>
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
          <h2 className="text-2xl font-bold mb-4">Hey sweetheart! 🥰✨</h2>
          <p className="mb-4">What should I call you?</p>
          <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Enter your name..." className="glass-input w-full mb-4" />
          <button onClick={handleNameConfirm} className="bg-gradient-to-r from-[#ff5fa3] to-[#A259FF] px-6 py-2 rounded-xl hover:scale-[1.05] transition-all duration-300">
            Confirm
          </button>
        </motion.div>
      </div>
    )}
  </div>
);
}
