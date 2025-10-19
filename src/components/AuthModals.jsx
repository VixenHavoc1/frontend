"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { login, signup, verifyEmail } from "../utils/api";

export default function AuthModals({ showLogin, setShowLogin, showSignup, setShowSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showVerify, setShowVerify] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const closeAll = () => {
    setShowLogin(false);
    setShowSignup(false);
    setShowVerify(false);
    setEmail("");
    setPassword("");
    setCode("");
    setError("");
  };

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signup(email, password);
    setLoading(false);
    if (!res) return setError("Signup failed.");
    if (res.already_verified) {
      closeAll();
      return;
    }
    setShowSignup(false);
    setShowVerify(true);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await login(email, password);
    setLoading(false);
    if (!res) return setError("Invalid credentials.");
    closeAll();
  }

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    const res = await verifyEmail(email, code);
    setLoading(false);
    if (!res) return setError("Verification failed.");
    closeAll();
  }

  const renderModal = (title, onSubmit, fields, buttonLabel) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
    >
      <div className="bg-[#1a0b2e] p-8 rounded-2xl shadow-[0_0_25px_rgba(150,100,255,0.3)] w-[90%] max-w-md relative border border-purple-500/30">
        <button
          onClick={closeAll}
          className="absolute top-4 right-4 text-purple-300 hover:text-white text-lg"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-6 text-purple-300">{title}</h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {fields.includes("email") && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="px-4 py-2 rounded-lg bg-[#12071f] border border-purple-400/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none"
            />
          )}
          {fields.includes("password") && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="px-4 py-2 rounded-lg bg-[#12071f] border border-purple-400/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none"
            />
          )}
          {fields.includes("code") && (
            <input
              type="text"
              placeholder="Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="px-4 py-2 rounded-lg bg-[#12071f] border border-purple-400/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none"
            />
          )}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2.5 rounded-lg bg-gradient-to-r from-[#6a28e2] to-[#9a5bff] text-white font-semibold hover:opacity-90 transition"
          >
            {loading ? "Please wait..." : buttonLabel}
          </button>
        </form>
      </div>
    </motion.div>
  );

  return (
    <>
      {showLogin && renderModal("Login", handleLogin, ["email", "password"], "Login")}
      {showSignup && renderModal("Sign Up", handleSignup, ["email", "password"], "Sign Up")}
      {showVerify && renderModal("Verify Email", handleVerify, ["code"], "Verify")}
    </>
  );
}
