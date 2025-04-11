import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState(null); // null, 'live', or 'track'
  const [chatId, setChatId] = useState(null); // To track the chat session
  const pollingRef = useRef(null); // Store polling interval
  const messagesEndRef = useRef(null); // For auto-scrolling
  const API_URL = 'http://127.0.0.1:8000/api';

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setMode(null);
      setMessages([]);
      setChatId(null);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
  };

  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode);
    setMessages([]);
    if (selectedMode === 'live') {
      setMessages([{ text: 'You’re now in Live Chat. Waiting for an agent...', sender: 'bot' }]);
      startLiveChat();
    } else if (selectedMode === 'track') {
      setMessages([{ text: 'Please enter your order ID to track your order.', sender: 'bot' }]);
    }
  };

  const startLiveChat = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessages((prev) => [
        ...prev,
        { text: 'Please log in to use this feature.', sender: 'bot' },
      ]);
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/chat/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newChatId = response.data?.chat?.id;
      if (!newChatId) {
        throw new Error('Invalid chat ID from server');
      }
      setChatId(newChatId);
      setMessages([{ text: 'Connected to an agent. Start chatting!', sender: 'bot' }]);
    } catch (error) {
      console.error('Error starting live chat:', error);
      const errorMessage =
        error.response?.status === 401
          ? 'Unauthorized. Please log in again.'
          : error.response?.status === 404
          ? 'Chat service is currently unavailable. Please try again later.'
          : `Error starting live chat: ${error.message}`;
      setMessages((prev) => [
        ...prev,
        { text: errorMessage, sender: 'bot' },
      ]);
    }
  };

  const pollForAgentResponse = (chatId) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    pollingRef.current = setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/chat/${chatId}/messages`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const newMessages = response.data?.messages?.map((msg) => ({
          text: msg.message || 'No content',
          sender: msg.is_agent ? 'bot' : 'user',
        })) || [];
        setMessages((prev) => {
          if (
            newMessages.length !== prev.length ||
            newMessages.some((msg, i) => msg.text !== prev[i]?.text)
          ) {
            return newMessages;
          }
          return prev;
        });
      } catch (error) {
        console.error('Polling error:', error);
        if (error.response?.status === 404 || error.response?.status === 401) {
          setMessages((prev) => [
            ...prev,
            { text: 'Chat session ended or invalid. Please start a new chat.', sender: 'bot' },
          ]);
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setMode(null);
          setChatId(null);
        }
      }
    }, 2000);
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

    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);

    if (mode === 'live' && chatId) {
      try {
        await axios.post(
          `${API_URL}/chat/${chatId}/send`,
          { message: input },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Error sending message:', error);
        setMessages((prev) => [
          ...prev,
          { text: 'Error sending message. Try again later.', sender: 'bot' },
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

        let trackingMessage = `Order #${orderId}:\n`;
        trackingMessage += `- Status: ${status}\n`;
        trackingMessage += `- Placed On: ${placedOn}\n`;
        trackingMessage += `- Estimated Delivery: ${estimatedDelivery}`;

        setMessages((prev) => [
          ...prev,
          { text: trackingMessage, sender: 'bot' },
        ]);
      } catch (error) {
        console.error('Error fetching order:', error);
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

  useEffect(() => {
    if (mode === 'live' && chatId) {
      pollForAgentResponse(chatId);
    } else if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [mode, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
              <>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`chatbot-message ${msg.sender === 'user' ? 'user' : 'bot'}`}
                  >
                    <div>{msg.text}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
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