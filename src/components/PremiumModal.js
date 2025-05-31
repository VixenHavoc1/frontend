import React from 'react';

const PremiumModal = ({ show, onClose }) => {
  if (!show) return null;

  const handlePurchase = (url) => {
    window.location.href = url; // redirect to NOWPayments payment URL
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-lg">
        <h2 className="text-xl font-bold text-center mb-4">Unlock Premium Access</h2>
        <p className="text-center text-gray-600 mb-6">Choose a plan to chat with the bot 🔥</p>

        <div className="space-y-4">
          <button
            onClick={() => handlePurchase("https://nowpayments.io/payment-link-1")}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-lg"
          >
            $5 – One-time Access
          </button>
          <button
            onClick={() => handlePurchase("https://nowpayments.io/payment-link-2")}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl text-lg"
          >
            $10 – 1 Week Access
          </button>
          <button
            onClick={() => handlePurchase("https://nowpayments.io/payment-link-3")}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl text-lg"
          >
            $20 – 1 Month Access
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-6 text-gray-500 hover:text-gray-700 text-sm block mx-auto"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PremiumModal;
