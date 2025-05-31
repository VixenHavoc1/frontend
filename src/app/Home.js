"use client"; // Add this at the top

import { useState } from "react";
import BotSelection from "../components/BotSelection";
import ChatUI from "../components/ChatUI";
import SignupForm from "../components/SignupForm"; // Import the SignupForm component

export default function Home() {
  const [selectedBot, setSelectedBot] = useState(null);
  const [showSignup, setShowSignup] = useState(false); // State to manage signup form visibility
  const [showPaywall, setShowPaywall] = useState(false); // State to manage paywall visibility
  const [isPaid, setIsPaid] = useState(false); // Track payment status

  const handleSignupToggle = () => {
    setShowSignup(!showSignup); // Toggle signup form visibility
  };

  const handlePaymentClick = async (amount) => {
    try {
      const res = await fetch("http://127.0.0.1:8000/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json();
      if (res.ok && data.payment_url) {
        window.location.href = data.payment_url; // Redirect to payment gateway
      } else {
        console.error("Payment creation failed:", data);
      }
    } catch (err) {
      console.error("Error creating payment:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {showSignup ? (
        <SignupForm onClose={handleSignupToggle} /> // Show signup form when showSignup is true
      ) : (
        <>
          {selectedBot ? (
            <ChatUI bot={selectedBot} isPaid={isPaid} /> // Pass isPaid to ChatUI
          ) : (
            <BotSelection onSelect={setSelectedBot} />
          )}

          {/* Payment Buttons */}
          <div className="mt-4">
            <button
              onClick={() => handlePaymentClick(5)}
              className="bg-green-500 text-white py-2 px-4 rounded mr-2"
            >
              Unlock for $5 (One-Time)
            </button>
            <button
              onClick={() => handlePaymentClick(10)}
              className="bg-green-500 text-white py-2 px-4 rounded mr-2"
            >
              Unlock for $10 (One Week)
            </button>
            <button
              onClick={() => handlePaymentClick(20)}
              className="bg-green-500 text-white py-2 px-4 rounded"
            >
              Unlock for $20 (One Month)
            </button>
          </div>

          {/* Button to toggle the signup form */}
          <button
            onClick={handleSignupToggle}
            className="bg-blue-500 text-white py-2 px-4 rounded mt-4"
          >
            Sign Up
          </button>
        </>
      )}
    </div>
  );
}
