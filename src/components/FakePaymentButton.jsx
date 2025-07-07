import React from 'react';

export default function FakePaymentButton({ userEmail }) {
  const handleFakePayment = async () => {
    if (!userEmail) {
      alert("Please log in first to simulate payment.");
      return;
    }

    try {
      const res = await fetch("https://vixenhavoc-sexting-bot.hf.space/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-nowpayments-sig": "test-signature"
        },
        body: JSON.stringify({
          payment_status: "confirmed",
          pay_address: "fake123",
          price_amount: 5,
          order_id: `${userEmail}:tier1`, // ✅ correct format for backend
          payment_id: Math.floor(Math.random() * 1000000)
        })
      });

      const data = await res.json();
      console.log("Webhook Response:", data);
      alert("✅ Fake payment sent! Try sending a message now.");
    } catch (err) {
      console.error("Fake payment error:", err);
      alert("❌ Failed to simulate payment.");
    }
  };

  return (
    <button
      onClick={handleFakePayment}
      className="ml-2 bg-green-700 px-4 py-2 rounded-lg hover:bg-green-800 transition-all duration-300"
    >
      💸 Simulate Payment
    </button>
  );
}
