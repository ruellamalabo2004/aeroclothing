import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Image } from 'lucide-react';
import axios from 'axios';

// Set up axios defaults
axios.defaults.baseURL = 'http://127.0.0.1:8000';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = true;

// Add axios interceptor to include auth token
axios.interceptors.request.use(function (config) {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const CustomerSupport = () => {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const pollingIntervalRef = useRef(null);

    // Fetch active chats
    const fetchActiveChats = async () => {
        if (!checkAuth()) return;

        try {
            const response = await axios.get('/api/chat/active');
            console.log('Fetched chats:', response.data);

            const formattedChats = response.data.map(chat => {
                // Get user's full name from profile
                const fullName = chat.user?.profile 
                    ? `${chat.user.profile.first_name} ${chat.user.profile.middle_name || ''} ${chat.user.profile.last_name} ${chat.user.profile.suffix || ''}`.trim()
                    : chat.user?.name || 'Unknown User';

                // Get profile image path
                const profileImage = chat.user?.profile?.profile_image 
                    ? `/storage/${chat.user.profile.profile_image}`
                    : null;

                return {
                    id: chat.id,
                    user_name: fullName,
                    user_email: chat.user?.email || 'No email',
                    profile_image: profileImage,
                    last_message: chat.messages?.[0]?.message || 'No messages yet',
                    timestamp: chat.updated_at ? new Date(chat.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown time',
                    unread: chat.unread_count || 0,
                    status: chat.status || 'open',
                    user_id: chat.user_id
                };
            });

            console.log('Formatted chats:', formattedChats);
            setChats(formattedChats);
        } catch (error) {
            console.error('Error fetching chats:', error);
            if (error.response?.status === 401) {
                alert('Please login to access customer support');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch messages for selected chat
    const fetchMessages = async (chatId) => {
        if (!checkAuth()) return;

        try {
            const response = await axios.get(`/api/chat/${chatId}/messages`);
            console.log('Fetched messages:', response.data);

            const formattedMessages = response.data.map(msg => ({
                id: msg.id,
                sender: msg.is_agent ? 'Support' : (msg.user?.name || 'Customer'),
                sender_image: msg.user?.profile?.profile_image ? `/storage/${msg.user.profile.profile_image}` : null,
                content: msg.message,
                image: msg.image_path ? `/storage/${msg.image_path}` : null,
                timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isIncoming: !msg.is_agent
            }));

            console.log('Formatted messages:', formattedMessages);
            setMessages(formattedMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            if (error.response?.status === 401) {
                alert('Please login to access customer support');
            }
        }
    };

    // Start polling for new messages
    const startPolling = (chatId) => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }

        pollingIntervalRef.current = setInterval(() => {
            if (chatId) {
                fetchMessages(chatId);
                fetchActiveChats(); // Also update chat list
            }
        }, 3000);
    };

    // Handle chat selection
    const handleChatSelect = (chat) => {
        console.log('Selected chat:', chat); // Debug log
        setSelectedChat(chat);
        fetchMessages(chat.id);
        startPolling(chat.id);
    };

    // Send message
    const sendMessage = async (text, image = null) => {
        if (!selectedChat || !checkAuth()) return;

        try {
            // Check if chat is closed
            if (selectedChat.status === 'closed') {
                alert('This chat is closed. You cannot send messages.');
                return;
            }

            const formData = new FormData();
            formData.append('chat_id', selectedChat.id);
            formData.append('message', text || '');
            formData.append('is_agent', 'true');
            
            if (image) {
                formData.append('image', image, image.name);
            }

            console.log('Sending message with data:', {
                chat_id: selectedChat.id,
                message: text,
                is_agent: 'true',
                hasImage: !!image,
                imageName: image?.name
            });

            const response = await axios.post(`/api/chat/${selectedChat.id}/send`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json'
                }
            });

            console.log('Message sent:', response.data);

            // Refresh messages and chat list
            await Promise.all([
                fetchMessages(selectedChat.id),
                fetchActiveChats()
            ]);

            setInput('');
        } catch (error) {
            console.error('Error sending message:', error);
            if (error.response?.status === 403 && error.response?.data?.status === 'closed') {
                alert('This chat is closed. You cannot send messages.');
                // Update chat status in the list
                setChats(chats.map(chat => 
                    chat.id === selectedChat.id 
                        ? { ...chat, status: 'closed' }
                        : chat
                ));
                setSelectedChat({ ...selectedChat, status: 'closed' });
            } else if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                console.log('Validation errors:', errors);
                if (errors.image) {
                    alert(errors.image[0]);
                } else if (errors.message) {
                    alert(errors.message[0]);
                } else {
                    alert('Invalid message format. Please try again.');
                }
            } else if (error.response?.status === 401) {
                alert('Please login to access customer support');
            } else {
                alert('Failed to send message. Please try again.');
            }
        }
    };

    // Handle end chat
    const handleEndChat = async () => {
        if (!selectedChat || !checkAuth()) return;

        try {
            const response = await axios.post(`/api/chat/${selectedChat.id}/archive`);
            // Update chat status in the list
            setChats(chats.map(chat => 
                chat.id === selectedChat.id 
                    ? { ...chat, status: 'closed' }
                    : chat
            ));
            setSelectedChat({ ...selectedChat, status: 'closed' });
            alert('Chat closed successfully');
        } catch (error) {
            console.error('Error ending chat:', error);
            if (error.response?.status === 401) {
                alert('Please login to access customer support');
            } else {
                alert('Failed to end chat. Please try again.');
            }
        }
    };

    // Handle image upload
    const handleUploadPhoto = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!validTypes.includes(file.type)) {
                alert('Please select a valid image file (JPEG, PNG, or GIF)');
                e.target.value = ''; // Clear the file input
                return;
            }

            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                alert('Image size should be less than 2MB');
                e.target.value = ''; // Clear the file input
                return;
            }

            try {
                console.log('Uploading image:', file.name, file.type, file.size); // Debug log
                await sendMessage('', file);
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload image. Please try again.');
            } finally {
                e.target.value = ''; // Clear the file input
            }
        }
    };

    // Check authentication
    const checkAuth = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to access customer support');
            return false;
        }
        return true;
    };

    // Initial fetch and cleanup
    useEffect(() => {
        if (checkAuth()) {
            fetchActiveChats();
        } else {
            setIsLoading(false);
        }
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        const scrollToBottom = () => {
            const messagesContainer = document.querySelector('.customer-support__chat-messages');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        };

        // Add a small delay to ensure the DOM has updated
        const timeoutId = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeoutId);
    }, [messages]);

    return (
        <div className="customer-support">
            <h2 className="customer-support__title">Customer Support</h2>
            <div className="customer-support__container">
                {/* Sidebar: Active Chats */}
                <div className="customer-support__sidebar">
                    <div className="customer-support__sidebar-header">
                        <h3>Chats</h3>
                    </div>
                    {isLoading ? (
                        <div className="customer-support__loading">Loading chats...</div>
                    ) : (
                    <div className="customer-support__chat-list">
                            {chats.length === 0 ? (
                                <div className="customer-support__no-chats">No chats</div>
                            ) : (
                                chats.map((chat) => (
                            <div
                                key={chat.id}
                                        className={`customer-support__chat-item ${selectedChat?.id === chat.id ? 'active' : ''} ${chat.status === 'closed' ? 'closed' : ''}`}
                                        onClick={() => handleChatSelect(chat)}
                            >
                                <div className="customer-support__avatar">
                                            {chat.profile_image ? (
                                                <img 
                                                    src={chat.profile_image} 
                                                    alt={chat.user_name}
                                                    className="customer-support__avatar-image"
                                                />
                                            ) : (
                                                <div className="customer-support__avatar-placeholder">
                                                    {chat.user_name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className={`customer-support__status-dot ${chat.status === 'open' ? 'online' : ''}`}></span>
                                </div>
                                <div className="customer-support__chat-info">
                                            <div className="customer-support__chat-name">
                                                {chat.user_name}
                                                {chat.status === 'closed' && <span className="customer-support__status-badge">Closed</span>}
                                            </div>
                                            <div className="customer-support__chat-email">{chat.user_email}</div>
                                    <div className="customer-support__last-message">{chat.last_message}</div>
                                </div>
                                <div className="customer-support__chat-meta">
                                    <div className="customer-support__timestamp">{chat.timestamp}</div>
                                            {chat.unread > 0 && (
                                        <div className="customer-support__unread-count">{chat.unread}</div>
                                    )}
                                </div>
                            </div>
                                ))
                            )}
                    </div>
                    )}
                </div>

                {/* Chat Window */}
                {selectedChat ? (
                <div className="customer-support__chat-window">
                    <div className="customer-support__chat-header">
                        <div className="customer-support__chat-user">
                            <div className="customer-support__avatar">
                                    {selectedChat.profile_image ? (
                                        <img 
                                            src={selectedChat.profile_image} 
                                            alt={selectedChat.user_name}
                                            className="customer-support__avatar-image"
                                        />
                                    ) : (
                                        <div className="customer-support__avatar-placeholder">
                                            {selectedChat.user_name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className={`customer-support__status-dot ${selectedChat.status === 'open' ? 'online' : ''}`}></span>
                            </div>
                            <div className="customer-support__chat-info">
                                    <div className="customer-support__chat-name">
                                        {selectedChat.user_name}
                                        {selectedChat.status === 'closed' && <span className="customer-support__status-badge">Closed</span>}
                                    </div>
                                    <div className="customer-support__status">
                                        {selectedChat.status === 'open' ? 'Online' : 'Offline'}
                                    </div>
                                </div>
                            </div>
                            {selectedChat.status === 'open' && (
                        <button className="customer-support__end-chat" onClick={handleEndChat}>
                            <X size={16} />
                            End Chat
                        </button>
                            )}
                    </div>
                    <div className="customer-support__chat-messages">
                            {messages.length === 0 ? (
                                <div className="customer-support__no-messages">No messages yet</div>
                            ) : (
                                <>
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`customer-support__message ${
                                    message.isIncoming ? 'incoming' : 'outgoing'
                                }`}
                            >
                                            {message.isIncoming && (
                                                <div className="customer-support__message-avatar">
                                                    {message.sender_image ? (
                                                        <img 
                                                            src={message.sender_image} 
                                                            alt={message.sender}
                                                            className="customer-support__avatar-image"
                                                        />
                                                    ) : (
                                                        <div className="customer-support__avatar-placeholder">
                                                            {message.sender.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            <div className="customer-support__message-content-wrapper">
                                                {message.image ? (
                                                    <img 
                                                        src={message.image} 
                                                        alt="Shared" 
                                                        className="customer-support__message-image"
                                                    />
                                                ) : (
                                <div className="customer-support__message-content">
                                    {message.content}
                                </div>
                                                )}
                                <div className="customer-support__message-timestamp">
                                    {message.timestamp}
                                                </div>
                                </div>
                            </div>
                        ))}
                                    {selectedChat.status === 'closed' && (
                                        <div className="customer-support__closed-message">
                                            This conversation is closed. You can view the chat history but cannot send new messages.
                                        </div>
                                    )}
                                </>
                            )}
                            <div ref={messagesEndRef} />
                    </div>
                        {selectedChat.status === 'open' && (
                            <form 
                                className="customer-support__message-input"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (input.trim()) {
                                        sendMessage(input);
                                    }
                                }}
                            >
                        <input
                            type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="customer-support__input"
                        />
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/jpeg,image/png,image/gif"
                                    style={{ display: 'none' }}
                                />
                                <button 
                                    type="button"
                                    className="customer-support__photo-button" 
                                    onClick={handleUploadPhoto}
                                    title="Upload image"
                                >
                            <Image size={20} />
                        </button>
                                <button 
                                    type="submit" 
                                    className="customer-support__send-button"
                                    disabled={!input.trim()}
                                    title="Send message"
                                >
                            <Send size={20} />
                        </button>
                            </form>
                        )}
                    </div>
                ) : (
                    <div className="customer-support__no-chat">
                        <p>Select a chat to start messaging</p>
                </div>
                )}
            </div>
        </div>
    );
};

export default CustomerSupport;