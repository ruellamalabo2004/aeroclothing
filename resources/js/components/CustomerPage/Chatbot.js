import React, { useState, useRef, useEffect } from 'react';
import { Home, MessageCircle, Package, Image, Send } from 'lucide-react';
import axios from 'axios';


// Set up axios defaults
axios.defaults.baseURL = 'http://127.0.0.1:8000';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = true; // Important for handling cookies

// Add axios interceptor to include CSRF token
axios.interceptors.request.use(function (config) {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const initialMessages = [
  { id: 1, type: 'date', text: 'May 4' },
  { id: 2, type: 'user', text: 'Track my order', time: '10:57 PM' },
  { id: 3, type: 'bot', text: 'To see your order status, please provide your order details.', time: '10:57 PM' },
  { id: 4, type: 'date', text: 'Today' },
  { id: 5, type: 'user', text: 'Cancel', time: '5:17 AM' },
  { id: 6, type: 'bot', text: `Please message us directly if you have questions. We're happy to help.`, time: '5:17 AM' },
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('HOME');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [currentChat, setCurrentChat] = useState(null);
  const [chatList, setChatList] = useState([]); // List of previous chats
  const [selectedChat, setSelectedChat] = useState(null); // Chat selected from list
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  // Function to check if user is authenticated
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // If no token, redirect to login or show login prompt
      alert('Please login to use the chat feature');
      setIsOpen(false);
      return false;
    }
    return true;
  };

  // Function to start a new chat
  const startNewChat = async () => {
    if (!checkAuth()) return;

    try {
      setIsLoading(true);
      const response = await axios.post('/api/chat/start', {
        status: 'open'
      });
      setCurrentChat(response.data);
      setSelectedChat({
        id: response.data.id,
        name: response.data.user?.profile
          ? `${response.data.user.profile.first_name || ''} ${response.data.user.profile.last_name || ''}`.trim()
          : response.data.user?.name || 'Offline chat',
        avatar: response.data.user?.profile?.profile_pic
          ? getProfileImageUrl(response.data.user.profile.profile_pic)
          : '/images/default-avatar.jpg',
        lastMessage: '',
        lastTime: response.data.updated_at ? new Date(response.data.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        status: response.data.status || 'open',
      });
      setMessages([]);
      setActiveTab('CONVERSATION');
      startPolling(response.data.id);
    } catch (error) {
      console.error('Error starting chat:', error);
      if (error.response?.status === 401) {
        alert('Please login to use the chat feature');
        setIsOpen(false);
      } else {
        alert('Failed to start chat. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch messages for a chat
  const fetchMessages = async (chatId) => {
    if (!checkAuth()) return;

    try {
      const response = await axios.get(`/api/chat/${chatId}/messages`);
      setMessages(response.data.map(msg => ({
        id: msg.id,
        type: msg.is_agent ? 'bot' : 'user',
        text: msg.message,
        image: msg.image_path ? `/storage/${msg.image_path}` : null,
        time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })));
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (error.response?.status === 401) {
        setIsOpen(false);
      }
    }
  };

  // Function to start polling for new messages
  const startPolling = (chatId) => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Start new polling
    pollingIntervalRef.current = setInterval(() => {
      if (chatId) {
        fetchMessages(chatId);
      }
    }, 3000); // Poll every 3 seconds
  };

  // Function to send a message
  const sendMessage = async (text, image = null) => {
    if (!currentChat || !checkAuth()) return;

    try {
      const formData = new FormData();
      formData.append('chat_id', currentChat.id);
      formData.append('message', text || ''); // Ensure message is never null
      formData.append('is_agent', 'false'); // Convert boolean to string for FormData
      if (image) {
        formData.append('image', image);
      }

      const response = await axios.post(`/api/chat/${currentChat.id}/send`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        }
      });

      // Refresh messages after sending
      fetchMessages(currentChat.id);
    } catch (error) {
      console.error('Error sending message:', error);
      if (error.response?.status === 422) {
        // Log validation errors
        console.error('Validation errors:', error.response.data.errors);
        alert('Invalid message format. Please try again.');
      } else if (error.response?.status === 401) {
        setIsOpen(false);
      } else {
        alert('Failed to send message. Please try again.');
      }
    }
  };

  const toggleChat = () => {
    if (!isOpen && !checkAuth()) return;
    
    setIsOpen(!isOpen);
    if (!isOpen && !currentChat) {
      startNewChat();
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleLiveChat = () => {
    if (!checkAuth()) return;
    
    if (!currentChat) {
      startNewChat();
    } else {
      setActiveTab('CONVERSATION');
    }
  };

  const handleTrackOrder = () => {
    alert('Track Order selected! This would redirect to the tracking page.');
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const messageText = input;
    setInput('');
    await sendMessage(messageText);
  };

  const handleImageButtonClick = (e) => {
    e.preventDefault();
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await sendMessage('', file);
      e.target.value = '';
    }
  };

  // Fetch previous chats for the user
  const fetchChatList = async () => {
    if (!checkAuth()) return;
    try {
      setIsLoading(true);
      const response = await axios.get('/api/chat/active');
      setChatList(response.data.map(chat => {
        // Show agent/admin if assigned, otherwise fallback
        let name = 'Support Team';
        let avatar = '/images/default-avatar.jpg';
        if (chat.agent && chat.agent.profile) {
          name = `${chat.agent.profile.first_name || ''} ${chat.agent.profile.last_name || ''}`.trim() || 'Support Team';
          avatar = chat.agent.profile.profile_pic
            ? getProfileImageUrl(chat.agent.profile.profile_pic)
            : '/images/default-avatar.jpg';
        }
        return {
          id: chat.id,
          name,
          avatar,
          lastMessage: chat.messages?.[0]?.message || '',
          lastTime: chat.updated_at ? new Date(chat.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          status: chat.status || 'open',
        };
      }));
    } catch (error) {
      console.error('Error fetching chat list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get profile image URL (like AdminHeader.js)
  const getProfileImageUrl = (profilePicPath) => {
    if (!profilePicPath) return '/images/default-avatar.jpg';
    if (profilePicPath.startsWith('http')) return profilePicPath;
    if (profilePicPath.startsWith('/')) return `http://127.0.0.1:8000${profilePicPath}`;
    return `http://127.0.0.1:8000/storage/${profilePicPath}`;
  };

  // When switching to Conversation tab, fetch chat list
  useEffect(() => {
    if (isOpen && activeTab === 'CONVERSATION') {
      fetchChatList();
      setSelectedChat(null); // Do not auto-open any chat
    }
  }, [isOpen, activeTab]);

  // When a chat is selected, fetch its messages
  useEffect(() => {
    if (selectedChat) {
      setCurrentChat(selectedChat);
      fetchMessages(selectedChat.id);
      startPolling(selectedChat.id);
    } else {
      setMessages([]);
      setCurrentChat(null);
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return (
    <div>
      <button className="chatbot-float-btn" onClick={toggleChat} aria-label="Open Chatbot">
        <img src="/images/botchats.svg" alt="Open chatbot" style={{ width: 32, height: 32 }} />
      </button>
      {isOpen && (
        <div className="chatbot-modal">
          <div className="chatbot-header" style={{ background: '#3aa6b9' }}>
            <span>{activeTab === 'CONVERSATION' ? 'Conversation' : 'Support'}</span>
            <button className="chatbot-close-btn" onClick={toggleChat} aria-label="Close">×</button>
          </div>
          <div className={`chatbot-body chatbot-body--tall${activeTab === 'CONVERSATION' ? ' chatbot-body--conversation' : ''}`}
               style={activeTab === 'CONVERSATION' ? {padding: 0, display: 'flex', flexDirection: 'column'} : {}}>
            {activeTab === 'HOME' && (
              <>
                <h2>How can we help you today?</h2>
                <button className="chatbot-option-btn" onClick={handleLiveChat}>
                  <MessageCircle size={18} />
                  <span>Live Chat</span>
                </button>
                <button className="chatbot-option-btn" onClick={handleTrackOrder}>
                  <Package size={18} />
                  <span>Track Order</span>
                </button>
              </>
            )}
            {activeTab === 'CONVERSATION' && (
              <>
                {/* Show chat list if no chat is selected */}
                {!selectedChat && (
                  <div className="chatbot-conversation-list-wrapper">
                    <div className="chatbot-conversation-list">
                      {isLoading ? (
                        <div className="chatbot-loading">Loading chats...</div>
                      ) : chatList.length === 0 ? (
                        <div className="chatbot-no-chats">No previous conversations</div>
                      ) : (
                        chatList.map(chat => (
                          <div className="chatbot-conversation-list-item" key={chat.id} onClick={() => setSelectedChat(chat)} style={chat.status === 'closed' ? { opacity: 0.7, background: '#f8f9fa' } : {}}>
                            <img src={chat.avatar} alt={chat.name} className="chatbot-conversation-avatar" />
                            <div className="chatbot-conversation-info">
                              <div className="chatbot-conversation-name">
                                {chat.name}
                                {chat.status === 'closed' && (
                                  <span className="chatbot-conversation-status-badge" style={{ marginLeft: 8, background: '#dc3545', color: 'white', borderRadius: 12, fontSize: '0.75rem', fontWeight: 500, padding: '2px 8px' }}>Closed</span>
                                )}
                              </div>
                              <div className="chatbot-conversation-last-message">{chat.lastMessage}</div>
                            </div>
                            <div className="chatbot-conversation-time">{chat.lastTime}</div>
                          </div>
                        ))
                      )}
                    </div>
                    <hr className="chatbot-conversation-divider" />
                    <button className="chatbot-new-convo-btn" onClick={startNewChat}>
                      <MessageCircle size={18} /> New conversation
                    </button>
                  </div>
                )}
                {/* Show chat window if a chat is selected */}
                {selectedChat && (
                  <>
                    <div className="chatbot-messages-list">
                      {messages.map((msg, idx) => {
                        if (msg.type === 'date') {
                          return <div className="chatbot-date-separator" key={msg.id}>{msg.text}</div>;
                        }
                        if (msg.type === 'user') {
                          return (
                            <div className="chatbot-message-row chatbot-message-row--user" key={msg.id}>
                              <div className="chatbot-message-bubble chatbot-message-bubble--user">
                                {msg.image ? (
                                  <img src={msg.image} alt="sent" className="chatbot-message-img" />
                                ) : (
                                  <span>{msg.text}</span>
                                )}
                                <div className="chatbot-message-meta">{msg.time}</div>
                              </div>
                            </div>
                          );
                        }
                        if (msg.type === 'bot') {
                          return (
                            <div className="chatbot-message-row chatbot-message-row--bot" key={msg.id}>
                              <div className="chatbot-message-bubble chatbot-message-bubble--bot">
                                <span>{msg.text}</span>
                                <div className="chatbot-message-meta">Automated • {msg.time}</div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                      {/* Closed chat label for selected chat */}
                      {selectedChat.status === 'closed' && (
                        <div className="chatbot-closed-message" style={{ background: '#fff3cd', color: '#856404', padding: '12px 16px', borderRadius: 8, margin: '16px 0', textAlign: 'center', fontSize: '0.9rem', border: '1px solid #ffeeba', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', alignSelf: 'center', maxWidth: '80%' }}>
                          This conversation is closed. You can view the chat history but cannot send new messages.
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    {/* Message input only if chat is open */}
                    {selectedChat.status !== 'closed' && (
                      <form className="chatbot-message-input-row" onSubmit={handleSend}>
                        <input
                          type="text"
                          className="chatbot-message-input"
                          placeholder="Write message..."
                          value={input}
                          onChange={handleInputChange}
                          disabled={isLoading}
                        />
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          accept="image/jpeg,image/png,image/gif"
                          style={{ display: 'none' }}
                        />
                        <button className="chatbot-message-image-btn" onClick={handleImageButtonClick} type="button" title="Upload image">
                          <Image size={20} />
                        </button>
                        <button className="chatbot-message-send-btn" type="submit" disabled={!input.trim()} title="Send message">
                          <Send size={20} />
                        </button>
                      </form>
                    )}
                  </>
                )}
              </>
            )}
          </div>
          <div className="chatbot-tabs">
            <button
              className={`chatbot-tab${activeTab === 'HOME' ? ' active' : ''}`}
              onClick={() => handleTabChange('HOME')}
            >
              <Home size={18} />
              <span>Home</span>
            </button>
            <button
              className={`chatbot-tab${activeTab === 'CONVERSATION' ? ' active' : ''}`}
              onClick={() => handleTabChange('CONVERSATION')}
            >
              <MessageCircle size={18} />
              <span>Conversation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;