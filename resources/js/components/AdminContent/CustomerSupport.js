import React, { useState } from 'react';
import { Send, X, Image } from 'lucide-react';

const CustomerSupport = () => {
    // Hardcoded sample chat data
    const chats = [
        { id: 1, user_name: 'John Doe', last_message: "I still haven't received my order", timestamp: '10:42 AM', unread: 2 },
        { id: 2, user_name: 'Sarah Miller', last_message: 'Thank you for your help!', timestamp: '9:15 AM' },
        { id: 3, user_name: 'Michael Chen', last_message: 'I’d like to return my purchase', timestamp: 'Yesterday', unread: 1 },
        { id: 4, user_name: 'Emma Wilson', last_message: 'When will the Wireless Earbuds be...', timestamp: 'Yesterday' },
        { id: 5, user_name: 'David Garcia', last_message: 'Do you offer international shipping?', timestamp: 'Jun 08' },
    ];

    // Hardcoded sample messages for the selected chat (John Doe)
    const messages = [
        { id: 1, sender: 'John Doe', content: "Hi, I need help with my order", timestamp: '10:30 AM', isIncoming: true },
        { id: 2, sender: 'Support', content: "The delivery is delayed", timestamp: '10:31 AM', isIncoming: false },
    ];

    // State for the selected chat (hardcoded to John Doe for now)
    const [selectedChat] = useState(chats[0]);

    const handleEndChat = () => {
        console.log('End chat action not implemented yet');
    };

    const handleUploadPhoto = () => {
        console.log('Upload photo action not implemented yet');
    };

    return (
        <div className="customer-support">
            <h2 className="customer-support__title">Customer Support</h2>
            <div className="customer-support__container">
                {/* Sidebar: Active Chats */}
                <div className="customer-support__sidebar">
                    <div className="customer-support__sidebar-header">
                        <h3>Active Chats</h3>
                    </div>
                    <div className="customer-support__chat-list">
                        {chats.map((chat) => (
                            <div
                                key={chat.id}
                                className={`customer-support__chat-item ${selectedChat.id === chat.id ? 'active' : ''}`}
                            >
                                <div className="customer-support__avatar">
                                    <div className="customer-support__avatar-placeholder"></div>
                                    <span className={`customer-support__status-dot ${chat.unread ? 'online' : ''}`}></span>
                                </div>
                                <div className="customer-support__chat-info">
                                    <div className="customer-support__chat-name">{chat.user_name}</div>
                                    <div className="customer-support__last-message">{chat.last_message}</div>
                                </div>
                                <div className="customer-support__chat-meta">
                                    <div className="customer-support__timestamp">{chat.timestamp}</div>
                                    {chat.unread && (
                                        <div className="customer-support__unread-count">{chat.unread}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="customer-support__chat-window">
                    <div className="customer-support__chat-header">
                        <div className="customer-support__chat-user">
                            <div className="customer-support__avatar">
                                <div className="customer-support__avatar-placeholder"></div>
                                <span className="customer-support__status-dot online"></span>
                            </div>
                            <div className="customer-support__chat-info">
                                <div className="customer-support__chat-name">{selectedChat.user_name}</div>
                                <div className="customer-support__status">Online</div>
                            </div>
                        </div>
                        <button className="customer-support__end-chat" onClick={handleEndChat}>
                            <X size={16} />
                            End Chat
                        </button>
                    </div>
                    <div className="customer-support__chat-messages">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`customer-support__message ${
                                    message.isIncoming ? 'incoming' : 'outgoing'
                                }`}
                            >
                                <div className="customer-support__message-content">
                                    {message.content}
                                </div>
                                <div className="customer-support__message-timestamp">
                                    {message.timestamp}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="customer-support__message-input">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            className="customer-support__input"
                        />
                        <button className="customer-support__photo-button" onClick={handleUploadPhoto}>
                            <Image size={20} />
                        </button>
                        <button className="customer-support__send-button">
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerSupport;