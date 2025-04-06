import React, { useState } from 'react';
import axios from 'axios';


const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState(null); // null, 'live', or 'track'
  const API_URL = 'http://127.0.0.1:8000/api';

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setMode(null);
      setMessages([]);
    }
  };

  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === 'live') {
      setMessages([{ text: 'You’re now in Live Chat. How can I assist you?', sender: 'bot' }]);
    } else if (selectedMode === 'track') {
      setMessages([{ text: 'Please enter your order ID to track your order.', sender: 'bot' }]);
    }
  };

  const handleSendMessage = async (e) => {
    if (e.key !== 'Enter' || !input.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setMessages((prev) => [
        ...prev,
        { text: 'Please log in to use this feature.', sender: 'bot' },
      ]);
      setInput('');
      return;
    }

    setMessages((prev) => [...prev, { text: input, sender: 'user' }]);

    if (mode === 'live') {
      try {
        const response = await axios.post(
          `${API_URL}/chat/send`,
          { message: input },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages((prev) => [
          ...prev,
          { text: response.data.agent_response.message, sender: 'bot' },
        ]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          { text: 'Sorry, something went wrong. Please try again later.', sender: 'bot' },
        ]);
      }
    } else if (mode === 'track') {
      const orderId = input.trim();
      try {
        const response = await axios.get(`${API_URL}/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const order = response.data;

        const status = order.status?.toUpperCase() || 'PENDING';
        const placedOn = order.created_at
          ? new Date(order.created_at).toLocaleString()
          : 'N/A';
        const estimatedDelivery = order.courier?.estimated_delivery_time || 'N/A';

        const trackingHistory = order.tracking_history || [];
        const trackingTimestamps = {};
        trackingHistory.forEach((tracking) => {
          const statusKey = tracking.status?.toUpperCase();
          trackingTimestamps[statusKey] = tracking.timestamp
            ? new Date(tracking.timestamp).toLocaleString()
            : 'N/A';
        });

        let trackingMessage = `Order #${orderId}:\n`;
        trackingMessage += `- Status: ${status}\n`;
        trackingMessage += `- Placed On: ${placedOn}\n`;
        trackingMessage += `- Estimated Delivery: ${estimatedDelivery}\n`;
        trackingMessage += `\nTracking History:\n`;
        ['PENDING', 'PROCESSING', 'SHIPPING', 'DELIVERED'].forEach((step) => {
          if (trackingTimestamps[step]) {
            trackingMessage += `- ${step}: ${trackingTimestamps[step]}\n`;
          }
        });
        if (status === 'CANCELED' && trackingTimestamps['CANCELED']) {
          const cancelDetails = trackingHistory.find((t) => t.status.toUpperCase() === 'CANCELED')?.remarks || '';
          trackingMessage += `- CANCELED: ${trackingTimestamps['CANCELED']}\n`;
          trackingMessage += `  Reason: ${cancelDetails.split(' | ')[0]?.replace('Reason: ', '') || 'Not specified'}\n`;
          trackingMessage += `  Comment: ${cancelDetails.split(' | ')[1]?.replace('Comment: ', '') || 'None'}\n`;
        }

        setMessages((prev) => [
          ...prev,
          { text: trackingMessage, sender: 'bot' },
        ]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            text:
              error.response?.status === 404
                ? `Order #${orderId} not found. Please check the ID and try again.`
                : 'Error fetching order details. Please try again later.',
            sender: 'bot',
          },
        ]);
      }
    }

    setInput('');
  };

  return (
    <div className="chatbot-container">
      <button className="chatbot-toggle" onClick={toggleChatbot}>
        {isOpen ? '✖' : '💬'}
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Support Assistant</h3>
          </div>
          <div className="chatbot-messages">
            {messages.length === 0 && !mode ? (
              <div className="chatbot-options">
                <p className="chatbot-welcome">Hi! How can I assist you today?</p>
                <button className="mode-btn" onClick={() => handleModeSelection('live')}>
                  Live Chat
                </button>
                <button className="mode-btn" onClick={() => handleModeSelection('track')}>
                  Track Order
                </button>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chatbot-message ${msg.sender === 'user' ? 'user' : 'bot'}`}
                >
                  <pre>{msg.text}</pre>
                </div>
              ))
            )}
          </div>
          {mode && (
            <div className="chatbot-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleSendMessage}
                placeholder={mode === 'live' ? 'Type your message...' : 'Enter order ID...'}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;