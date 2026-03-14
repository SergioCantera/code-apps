import { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { useTodoAgentChat } from '../hooks/useAgentChat.jsx';

/**
 * AgentChat component - AI assistant for todo management
 * 
 * Simple chat UI with vanilla CSS and markdown support
 */
export const AgentChat = () => {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const { messages, sendMessage, isLoading, error } = useTodoAgentChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    await sendMessage(input);
    setInput('');
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="chat-toggle-btn"
          title="Open AI Assistant"
        >
          💬
        </button>
      )}

      {/* Chat sidebar */}
      {open && (
        <div className="chat-sidebar">
          {/* Header */}
          <div className="chat-header">
            <h2>AI Assistant</h2>
            <button
              onClick={() => setOpen(false)}
              className="chat-close-btn"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-empty">
                <p>👋 Hi! I can help you manage your tasks.</p>
                <p className="chat-hint">Try asking me about your todos!</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${msg.role === 'user' ? 'user' : 'assistant'}`}
              >
                <div className="message-content">
                  {msg.role === 'assistant' ? (
                    <Markdown>{msg.content}</Markdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="chat-message assistant">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="chat-error">
                {error}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="chat-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="chat-input"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="chat-send-btn"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};
