"use client";
import React, { useState } from "react";
import { login, signup, verifyEmail } from "../api";

export default function AuthModals({ showLogin, setShowLogin, showSignup, setShowSignup, setIsAuthenticated }) {
  const [showVerify, setShowVerify] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function closeAll() {
    setShowLogin(false);
    setShowSignup(false);
    setShowVerify(false);
    setEmail("");
    setPassword("");
    setCode("");
    setError("");
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await login(email, password);
    setLoading(false);

    if (!res) return setError("Login failed.");

    if (res.access_token) {
      localStorage.setItem("access_token", res.access_token);
      if (res.refresh_token) localStorage.setItem("refresh_token", res.refresh_token);
      localStorage.setItem("userEmail", email);
      if (res.user_id) localStorage.setItem("userId", res.user_id);

      setIsAuthenticated(true); // ✅ update parent state
      closeAll();
    } else {
      setError(res.error || "Invalid credentials.");
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signup(email, password);
    setLoading(false);

    if (!res) return setError("Signup failed.");

    if (res.already_verified && res.auto_login) {
      // Auto-login for verified user
      localStorage.setItem("access_token", res.access_token);
      if (res.refresh_token) localStorage.setItem("refresh_token", res.refresh_token);
      localStorage.setItem("userEmail", email);
      if (res.user_id) localStorage.setItem("userId", res.user_id);

      setIsAuthenticated(true); // ✅ update parent state
      closeAll();
      return;
    }

    if (res.already_verified && !res.auto_login) {
      setError("Account already verified. Please login.");
      setShowSignup(false);
      setShowLogin(true);
      return;
    }

    // New or unverified user → verification modal
    setShowSignup(false);
    setShowVerify(true);
  }

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await verifyEmail(email, code);
    setLoading(false);

    if (!res) return setError("Verification failed.");

    if (res.access_token) {
      localStorage.setItem("access_token", res.access_token);
      if (res.refresh_token) localStorage.setItem("refresh_token", res.refresh_token);
      localStorage.setItem("userEmail", email);
      if (res.user_id) localStorage.setItem("userId", res.user_id);

      setIsAuthenticated(true); // ✅ update parent state
    }

    closeAll();
  }

  const renderModal = (title, fields, onSubmit) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-[#0a0315] to-[#07000a] border border-purple-800 p-6 rounded-2xl w-[90%] max-w-sm shadow-xl">
        <h2 className="text-2xl font-semibold text-purple-300 mb-4 text-center">{title}</h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          {fields.includes("email") && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/60 border border-purple-700 text-purple-100 focus:outline-none focus:border-purple-400"
              required
            />
          )}
          {fields.includes("password") && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/60 border border-purple-700 text-purple-100 focus:outline-none focus:border-purple-400"
              required
            />
          )}
          {fields.includes("code") && (
            <input
              type="text"
              placeholder="Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/60 border border-purple-700 text-purple-100 focus:outline-none focus:border-purple-400"
              required
            />
          )}

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-all duration-200"
          >
            {loading ? "Please wait..." : title}
          </button>

          {/* modal switch footer */}
          {title === "Login" && (
            <p className="text-sm text-purple-200 mt-3 text-center">
              Don’t have an account?{" "}
              <span
                onClick={() => {
                  setShowLogin(false);
                  setShowSignup(true);
                }}
                className="text-purple-400 hover:underline cursor-pointer"
              >
                Sign up
              </span>
            </p>
          )}
          {title === "Sign Up" && (
            <p className="text-sm text-purple-200 mt-3 text-center">
              Already have an account?{" "}
              <span
                onClick={() => {
                  setShowSignup(false);
                  setShowLogin(true);
                }}
                className="text-purple-400 hover:underline cursor-pointer"
              >
                Log in
              </span>
            </p>
          )}
        </form>
        <button
          onClick={closeAll}
          className="absolute top-3 right-4 text-purple-400 hover:text-purple-300 text-xl"
        >
          ✕
        </button>
      </div>
    </div>
  );

  return (
    <>
      {showLogin && renderModal("Login", ["email", "password"], handleLogin)}
      {showSignup && renderModal("Sign Up", ["email", "password"], handleSignup)}
      {showVerify && renderModal("Verify Email", ["email", "code"], handleVerify)}
    </>
  );
}
