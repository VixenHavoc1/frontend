import React, { useState } from "react";

export default function SignUp({ onClose, switchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Signup failed.");
      setFeedback("✅ Please verify your email.");
      setSignupSuccess(true);

      // Optionally switch to login after a delay
      setTimeout(() => {
        switchToLogin(); // This should open Login modal
      }, 3000);
    } catch (err) {
      setFeedback(err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative text-black">
        <button onClick={onClose} className="absolute top-2 right-3 text-lg">✖</button>
        <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Sign Up
          </button>
        </form>
        {feedback && (
          <p
            className={`text-center mt-4 text-sm ${
              signupSuccess ? "text-green-600" : "text-red-600"
            }`}
          >
            {feedback}
          </p>
        )}
      </div>
    </div>
  );
}
