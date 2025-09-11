// src/components/Login.js
import React, { useState } from 'react';

const Login = ({ onClose, switchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || data.error);
      setFeedback("✅ Logged in!");
      setTimeout(onClose, 1000); // Close after showing message
    } catch (err) {
      setFeedback(err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-3">✖</button>
        <h2 className="text-2xl font-bold text-center mb-4">Log In</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" className="w-full border p-2 rounded" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" className="w-full border p-2 rounded" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Log In</button>
        </form>
        {feedback && <p className="text-center mt-4 text-sm text-red-600">{feedback}</p>}
        <p className="text-sm text-center mt-4">
          Don’t have an account?
          <button onClick={switchToSignup} className="text-blue-600 ml-1 underline">Sign Up</button>
        </p>
      </div>
    </div>
  );
};

export default Login;
