// src/components/PaymentButtons.jsx
import React from 'react';

const PaymentButtons = () => {
  const handleTierClick = (amount) => {
    // Call backend to create a payment link for the selected tier
    fetch('/generate-payment-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    })
    .then(res => res.json())
    .then(data => {
      // Redirect user to the payment link
      window.location.href = data.paymentLink;
    })
    .catch(err => console.log(err));
  };

  return (
    <div>
      <button onClick={() => handleTierClick(5)}>$5 - One-time unlock</button>
      <button onClick={() => handleTierClick(10)}>$10 - 1-week access</button>
      <button onClick={() => handleTierClick(20)}>$20 - 1-month access</button>
    </div>
  );
};

export default PaymentButtons;
