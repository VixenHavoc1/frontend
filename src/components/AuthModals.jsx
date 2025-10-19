"use client";
import React, { useState } from "react";
import { login, signup, verifyEmail } from "../api";
import { getAuthHeaders,syncUserData, silentLogout } from "./ChatUI"; // your ChatUI helpers

export default function AuthModals({
  showLogin,
  setShowLogin,
  showSignup,
  setShowSignup,
  setIsAuthenticated,
}) {
  const [showVerify, setShowVerify] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  function closeAll() {
    setShowLogin(false);
    setShowSignup(false);
    setShowVerify(false);
    setShowNameModal(false);
    setEmail("");
    setPassword("");
    setCode("");
    setUserName("");
    setError("");
  }

  function handleLogout() {
    silentLogout(); // clears tokens + localStorage
    setIsAuthenticated(false);
    closeAll();
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
      setIsAuthenticated(true);
      setShowNameModal(true); // ask for username after login
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
      localStorage.setItem("access_token", res.access_token);
      if (res.refresh_token) localStorage.setItem("refresh_token", res.refresh_token);
      localStorage.setItem("userEmail", email);
      if (res.user_id) localStorage.setItem("userId", res.user_id);
      setIsAuthenticated(true);
      setShowNameModal(true); // ask for username after signup/login
      closeAll();
      return;
    }

    if (res.already_verified && !res.auto_login) {
      setError("Account already verified. Please login.");
      setShowSignup(false);
      setShowLogin(true);
      return;
    }

    setShowSignup(false);
    setShowVerify(true); // new/unverified → verify
  }

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await verifyEmail(email, code);
    setLoading(false);
    if (!res) return setError("Verification failed.");

    if (res.access_token || res.message === "Email verified successfully") {
      if (res.access_token) {
        localStorage.setItem("access_token", res.access_token);
        if (res.refresh_token) localStorage.setItem("refresh_token", res.refresh_token);
        localStorage.setItem("userEmail", email);
        if (res.user_id) localStorage.setItem("userId", res.user_id);
      }
      setIsAuthenticated(true);
      setShowNameModal(true); // ask for username after verification
      closeAll();
      return;
    }
    setError(res.error || "Invalid verification code.");
  }

  async function handleNameConfirm() {
    if (!userName.trim()) return;
    setIsUpdatingName(true);
    try {
      const headers = await getAuthHeaders();
      if (!headers.Authorization) {
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
        localStorage.setItem("userName", userName.trim());
        localStorage.setItem("nameSet", "true");
        setShowNameModal(false);
      } else {
        setError("Failed to update name. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
    } finally {
      setIsUpdatingName(false);
    }
  }

  const renderModal = (title, fields, onSubmit) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-gradient-to-b from-[#0a0315] to-[#07000a] border border-purple-800 p-6 rounded-2xl w-[90%] max-w-sm shadow-xl">
        <h2 className="text-2xl font-semibold text-purple-300 mb-4 text-center">{title}</h2>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          {fields.includes("email") && (
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 rounded-lg bg-black/60 border border-purple-700 text-purple-100 focus:outline-none focus:border-purple-400" required />
          )}
          {fields.includes("password") && (
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 rounded-lg bg-black/60 border border-purple-700 text-purple-100 focus:outline-none focus:border-purple-400" required />
          )}
          {fields.includes("code") && (
            <input type="text" placeholder="Verification Code" value={code} onChange={(e) => setCode(e.target.value)} className="w-full p-3 rounded-lg bg-black/60 border border-purple-700 text-purple-100 focus:outline-none focus:border-purple-400" required />
          )}
          {fields.includes("username") && (
            <input type="text" placeholder="Display Name" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full p-3 rounded-lg bg-black/60 border border-purple-700 text-purple-100 focus:outline-none focus:border-purple-400" required />
          )}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading || isUpdatingName} className="mt-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-all duration-200">
            {loading || isUpdatingName ? "Please wait..." : title}
          </button>
        </form>
        {setIsAuthenticated && (
          <button onClick={handleLogout} className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-center">
            Logout
          </button>
        )}
        <button onClick={closeAll} className="absolute top-3 right-4 text-purple-400 hover:text-purple-300 text-xl">✕</button>
      </div>
    </div>
  );

  return (
    <>
      {showLogin && renderModal("Login", ["email", "password"], handleLogin)}
      {showSignup && renderModal("Sign Up", ["email", "password"], handleSignup)}
      {showVerify && renderModal("Verify Email", ["email", "code"], handleVerify)}
      {showNameModal && renderModal("Set Display Name", ["username"], handleNameConfirm)}
    </>
  );
}
