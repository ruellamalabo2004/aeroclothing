import React, { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatMode, setChatMode] = useState(null); // Live chat or track order
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('role') === 'admin'); // Check if logged in as admin

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = async (e) => {
    if (e.key === 'Enter' && input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);

      // Handle user message in live chat
      if (chatMode === 'live_chat') {
        try {
          const response = await axios.post('http://127.0.0.1:8000/api/chat/send', {
            message: input
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,  // Include token if using auth
            }
          });

          setMessages((prevMessages) => [
            ...prevMessages,
            { text: input, sender: 'user' }, // User message
            { text: response.data.agent_response.message, sender: 'bot' }, // Bot's response or admin response
          ]);
        } catch (error) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: 'Sorry, something went wrong. Please try again later.', sender: 'bot' },
          ]);
        }
      } else if (chatMode === 'track_order') {
        // Handle order tracking
        try {
          const response = await axios.post('http://127.0.0.1:8000/api/order/track', {
            orderId: input
          }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            }
          });

          setMessages((prevMessages) => [
            ...prevMessages,
            { text: input, sender: 'user' },
            { text: `Tracking information: ${response.data.status}`, sender: 'bot' },
          ]);
        } catch (error) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: 'Sorry, we couldn\'t find that order. Please try again later.', sender: 'bot' },
          ]);
        }
      }

      setInput('');
    }
  };

  const handleAdminReply = async (e) => {
    if (e.key === 'Enter' && input.trim()) {
      // Admin sends a reply
      setMessages([...messages, { text: input, sender: 'admin' }]);

      try {
        const response = await axios.post('http://127.0.0.1:8000/api/chat/send', {
          message: input
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        });

        // After the admin reply, show the bot's response (admin reply in this case)
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: input, sender: 'admin' },
          { text: response.data.agent_response.message, sender: 'bot' },
        ]);
      } catch (error) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: 'Sorry, something went wrong. Please try again later.', sender: 'bot' },
        ]);
      }

      setInput('');
    }
  };

  const handleOptionSelect = (option) => {
    if (option === 'live_chat') {
      setChatMode('live_chat');
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'Great! You are now in Live Chat mode. How can I assist you?', sender: 'bot' },
      ]);
    } else if (option === 'track_order') {
      setChatMode('track_order');
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'Please provide your order ID to track your order.', sender: 'bot' },
      ]);
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chatbot Button (always visible) */}
      <button className="chatbot-toggle" onClick={toggleChatbot}>
        {isOpen ? '✖' : '💬'}
      </button>

      {/* Chatbot Window (visible when open) */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Chat with Us</h3>
          </div>
          <div className="chatbot-messages">
            {messages.length === 0 ? (
              <div>
                <p className="chatbot-welcome">Hello! How can I assist you today?</p>
                <button onClick={() => handleOptionSelect('live_chat')}>Live Chat</button>
                <button onClick={() => handleOptionSelect('track_order')}>Track Order</button>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chatbot-message ${msg.sender === 'user' ? 'user' : msg.sender === 'admin' ? 'admin' : 'bot'}`}
                >
                  {msg.text}
                </div>
              ))
            )}
          </div>
          <div className="chatbot-input">
            {/* Display input field based on chat mode */}
            {chatMode === 'live_chat' && isAdmin ? (
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleAdminReply}
                placeholder="Type your reply..."
              />
            ) : (
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleSendMessage}
                placeholder={chatMode === 'track_order' ? 'Enter order ID' : 'Type a message...'}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
