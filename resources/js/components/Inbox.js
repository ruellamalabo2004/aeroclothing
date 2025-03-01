import React, { useState, useEffect } from "react";

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  // Fetch conversations from API (using dummy data with profile pics for now)
  useEffect(() => {
    const dummyConversations = [
      {
        id: 1,
        customer_name: "John Doe",
        profile_pic: "/imgs/profile.svg", // Default or customer-specific image
        last_message: "Hi, I need help!",
        timestamp: "2023-10-01 10:00",
      },
      {
        id: 2,
        customer_name: "Jane Smith",
        profile_pic: "/imgs/profile.svg",
        last_message: "Order issue",
        timestamp: "2023-10-01 09:30",
      },
    ];
    setConversations(dummyConversations);

    // Uncomment to fetch from API
    /*
    fetch("http://127.0.0.1:8000/api/inbox/conversations")
      .then((res) => res.json())
      .then((data) => setConversations(data))
      .catch((error) => console.error("Error fetching conversations:", error));
    */
  }, []);

  // Dummy messages for selected conversation (replace with API fetch)
  const getMessages = (conversationId) => {
    const dummyMessages = {
      1: [
        { id: 1, sender: "John Doe", text: "Hi, I need help!", timestamp: "2023-10-01 10:00" },
        { id: 2, sender: "Admin", text: "Hello! How can I assist you?", timestamp: "2023-10-01 10:01" },
      ],
      2: [
        { id: 1, sender: "Jane Smith", text: "Order issue", timestamp: "2023-10-01 09:30" },
        { id: 2, sender: "Admin", text: "Can you provide more details?", timestamp: "2023-10-01 09:32" },
      ],
    };
    return dummyMessages[conversationId] || [];
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: Date.now(), // Temporary ID
      sender: "Admin",
      text: newMessage,
      timestamp: new Date().toISOString(),
    };

    // Update local state (replace with API call)
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation.id
          ? { ...conv, last_message: newMessage, timestamp: message.timestamp }
          : conv
      )
    );
    setNewMessage("");

    // Uncomment to send to API
    /*
    fetch(`http://127.0.0.1:8000/api/inbox/conversations/${selectedConversation.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    })
      .then((res) => res.json())
      .then((data) => {
        // Update state with API response if needed
      })
      .catch((error) => console.error("Error sending message:", error));
    */
  };

  return (
    <main>
      <h1>Inbox</h1>
      <div className="inbox-container">
        {/* Conversations List */}
        <div className="inbox-conversations">
          <h2>Conversations</h2>
          <ul>
            {conversations.map((conv) => (
              <li
                key={conv.id}
                className={selectedConversation?.id === conv.id ? "active" : ""}
                onClick={() => setSelectedConversation(conv)}
              >
                <img
                  src={conv.profile_pic}
                  alt={conv.customer_name}
                  className="inbox-profile-pic"
                />
                <div className="inbox-conversation-info">
                  <span className="inbox-customer-name">{conv.customer_name}</span>
                  <span className="inbox-last-message">{conv.last_message}</span>
                </div>
                <span className="inbox-timestamp">{conv.timestamp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Window */}
        <div className="inbox-chat">
          {selectedConversation ? (
            <>
              <div className="inbox-chat-header">
                <h3>{selectedConversation.customer_name}</h3>
              </div>
              <div className="inbox-messages">
                {getMessages(selectedConversation.id).map((msg) => (
                  <div
                    key={msg.id}
                    className={`inbox-message ${msg.sender === "Admin" ? "sent" : "received"}`}
                  >
                    <div className="inbox-message-content">
                      <p>{msg.text}</p>
                      <span className="inbox-message-timestamp">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
              <form className="inbox-message-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="inbox-message-input"
                />
                <button type="submit" className="inbox-send-btn">
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="inbox-no-selection">
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}