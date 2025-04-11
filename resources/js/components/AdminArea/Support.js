import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';


const AdminChat = () => {
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isChatEnded, setIsChatEnded] = useState(false); // Track if the chat is ended
  const pollingRef = useRef(null);
  const messagesEndRef = useRef(null); // For auto-scrolling
  const API_URL = 'http://127.0.0.1:8000/api';

  useEffect(() => {
    fetchActiveChats();
    const chatInterval = setInterval(fetchActiveChats, 5000);
    return () => {
      clearInterval(chatInterval);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedChatId && !isChatEnded) {
      fetchMessages(selectedChatId);
      pollForMessages(selectedChatId);
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (!selectedChatId) {
        setMessages([]);
        setIsChatEnded(false);
      }
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [selectedChatId, isChatEnded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchActiveChats = async () => {
    try {
      const response = await axios.get(`${API_URL}/chat/active`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setActiveChats(response.data.chats);
      // Update isChatEnded based on the selected chat's status
      if (selectedChatId) {
        const selectedChat = response.data.chats.find(chat => chat.chat_id === selectedChatId);
        if (selectedChat) {
          setIsChatEnded(selectedChat.status === 'closed');
        }
      }
    } catch (error) {
      console.error('Error fetching active chats:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await axios.get(`${API_URL}/chat/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages((prev) => [
        ...prev,
        { message: 'Error loading messages.', is_agent: true },
      ]);
    }
  };

  const pollForMessages = (chatId) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }
    pollingRef.current = setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/chat/${chatId}/messages`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const newMessages = response.data.messages;
        if (
          newMessages.length > messages.length ||
          newMessages.some((msg, i) => msg.message !== messages[i]?.message)
        ) {
          setMessages(newMessages);
        }
      } catch (error) {
        console.error('Polling error:', error);
        if (error.response?.status === 404) {
          // Chat might have been archived or deleted
          setIsChatEnded(true);
          setMessages((prev) => [
            ...prev,
            { message: 'This chat has been ended.', is_agent: true },
          ]);
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
      }
    }, 2000);
  };

  const handleChatSelect = (chatId) => {
    setSelectedChatId(chatId);
    const selectedChat = activeChats.find(chat => chat.chat_id === chatId);
    setIsChatEnded(selectedChat?.status === 'closed'); // Set based on chat status
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedChatId || isChatEnded) return;

    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `${API_URL}/chat/${selectedChatId}/send`,
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [
        ...prev,
        { message: input, is_agent: true, timestamp: new Date().toISOString() },
      ]);
      setInput('');
      fetchActiveChats();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        { message: error.response?.status === 403 ? 'This chat is closed.' : 'Error sending message.', is_agent: true },
      ]);
    }
  };

  const handleEndChat = async () => {
    if (!selectedChatId) return;

    const token = localStorage.getItem('token');
    try {
      await axios.post(
        `${API_URL}/chat/${selectedChatId}/archive`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [
        ...prev,
        { message: 'Chat has been ended.', is_agent: true },
      ]);
      setIsChatEnded(true);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      fetchActiveChats(); // Refresh the chats list
    } catch (error) {
      console.error('Error ending chat:', error);
      setMessages((prev) => [
        ...prev,
        { message: 'Error ending chat. Please try again.', is_agent: true },
      ]);
    }
  };

  return (
    <div className="admin-chat-container">
      <div className="chat-sidebar">
        <h3>Chats</h3>
        {activeChats.length === 0 ? (
          <p className="no-chats-message">No chats available</p>
        ) : (
          activeChats.map((chat) => (
            <div
              key={chat.chat_id}
              className={`chat-card ${selectedChatId === chat.chat_id ? 'selected' : ''}`}
              onClick={() => handleChatSelect(chat.chat_id)}
            >
              <div className="chat-details">
                <div className="chat-title">
                  <strong>User #{chat.user_id}</strong>
                  {chat.status === 'closed' && <span className="chat-status-closed">CLOSED</span>}
                </div>
                <p>{chat.last_message || 'No messages yet'}</p>
                <small>{new Date(chat.timestamp).toLocaleTimeString()}</small>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chat-main">
        {selectedChatId ? (
          <>
            <div className="chat-header">
              <h4>Chat with User #{activeChats.find(chat => chat.chat_id === selectedChatId)?.user_id}</h4>
              {isChatEnded && <span className="chat-status-closed">CLOSED</span>}
              {!isChatEnded && (
                <button className="end-chat-button" onClick={handleEndChat}>
                  End Chat
                </button>
              )}
            </div>
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.is_agent ? 'agent-message' : 'user-message'}`}
                >
                  <div className="message-bubble">
                    <p>{msg.message}</p>
                    {msg.timestamp && (
                      <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            {!isChatEnded && (
              <div className="chat-input-area">
                <textarea
                  placeholder="Type your reply..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button onClick={handleSendMessage}>Send</button>
              </div>
            )}
          </>
        ) : (
          <div className="no-chat-message">
            <p>Select a chat to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
