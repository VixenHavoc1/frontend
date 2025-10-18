"use client";
import React from "react";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";

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
