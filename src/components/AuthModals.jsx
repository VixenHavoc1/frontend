// src/components/AuthModals.jsx
"use client";
import React from "react";
import { LoginModal, SignupModal } from "./ChatUI"; // <- import named exports from ChatUI

export default function AuthModals({
  showLogin,
  setShowLogin,
  showSignup,
  setShowSignup,
}) {
  return (
    <>
      {showLogin && (
        <LoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}
      {showSignup && (
        <SignupModal
          isOpen={showSignup}
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}
    </>
  );
}
