import React, { useState } from 'react';
import chatBotIcon from "../Assets/images/chatbot.svg";

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Dummy messages for display
    const dummyMessages = [
        { sender: 'bot', text: 'Hello! How can I assist you today?' },
        { sender: 'user', text: 'I have a question about my account.' },
        {
            sender: 'bot', text: "Sure, what's your question?"
        },
        { sender: 'user', text: 'How do I reset my password?' },
        { sender: 'bot', text: 'You can reset your password in the settings menu.' },
    ];

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="chat-container">

            {/* Blue Circular Button */}
            <button onClick={toggleChat} className="chat-button">
                <img src={chatBotIcon} alt="Chatbot" />
            </button>

            {/* Custom Chat Dialog */}
            {isOpen && (
                <div className="chat-dialog">
                    {/* Chat Header */}
                    <div className="chat-header">
                        <h2>Chatbot</h2>
                        <button onClick={toggleChat}>
                            <i className="bx bx-x"></i>
                        </button>
                    </div>

                    {/* Chat Messages Area */}
                    <div className="chat-messages">
                        {dummyMessages.map((msg, index) => (
                            <div
                                key={index}
                                className={`message ${msg.sender}`}
                            >
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="chat-input">
                        <input
                            type="text"
                            placeholder="Type a message..."
                        />
                        <button>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;