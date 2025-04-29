import React, { useState, useEffect, useMemo, useRef } from 'react';
import chatBotIcon from '../Assets/images/chatbot.svg';
import io from 'socket.io-client';

const ChatBot = ({ summary }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const token = localStorage.getItem('token');
    const socket = useMemo(() => io(process.env.REACT_APP_END_POINT, {
        autoConnect: false,
        extraHeaders: {
            Authorization: token ? `Bearer ${token}` : ''
        }
    }), [token]);

    useEffect(() => {
        if (!token || !summary) {
            setMessages([{ sender: 'bot', text: 'Please log in and select a summary to chat.' }]);
            return;
        }

        socket.connect();

        socket.on('chat_response', (response) => {
            setMessages((prev) => [...prev, { sender: 'bot', text: response }]);
            setIsBotTyping(false);
        });

        socket.on('summary_chats', (chats) => {
            setMessages(
                chats.length > 0
                    ? chats.map((chat) => ({
                        sender: chat.sender,
                        text: chat.text
                    }))
                    : [{ sender: 'bot', text: 'Hello! How can I assist you with this summary?' }]
            );
        });

        socket.on('chat_error', (error) => {
            setMessages((prev) => [
                ...prev,
                { sender: 'bot', text: `Error: ${error}` }
            ]);
            setIsBotTyping(false);
        });

        return () => {
            socket.off('chat_response');
            socket.off('summary_chats');
            socket.off('chat_error');
            socket.disconnect();
        };
    }, [socket, token, summary]);

    useEffect(() => {
        if (summary) {
            socket.emit('get_summary_chats', summary);
        }
    }, [summary, socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isBotTyping, isOpen]);

    const handleSendMessage = () => {
        if (input.trim() && summary) {
            setMessages((prev) => [...prev, { sender: 'user', text: input }]);
            socket.emit('chat_message', {
                message: input,
                summaryId: summary
            });
            setIsBotTyping(true);
            setInput('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    if (!summary) {
        return null;
    }

    return (
        <div className="chat-container">
            <button onClick={toggleChat} className={`chat-button ${isOpen ? 'chat-button-hidden' : ''}`}>
                <img src={chatBotIcon} alt="Chatbot" />
            </button>
            {isOpen && (
                <div className="chat-dialog">
                    <div className="chat-header">
                        <h2>Chatbot</h2>
                        <button onClick={toggleChat}>
                            <i className="bx bx-x"></i>
                        </button>
                    </div>
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isBotTyping && (
                            <div className="chat-bubble bot">
                                <div className="typing">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-input">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;