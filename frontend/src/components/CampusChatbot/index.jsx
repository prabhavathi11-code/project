import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../../api'
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaLightbulb,
  FaTrashAlt,
  FaExternalLinkAlt,
  FaMapMarkerAlt,
  FaTag
} from 'react-icons/fa'
import { PulseLoader } from 'react-spinners'
import { handleImageError } from '../../utils/imageFallback'
import './index.css'

const DEFAULT_SUGGESTIONS = [
  '🎓 Show Senior Deals',
  '📚 CSE 3rd Sem Books',
  '🧮 Casio Calculator under ₹800',
  '🚲 Available Bicycles',
  '📍 Safe Campus Meetup Points',
  '💡 How does COD work?'
]

const CampusChatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 Hi! I'm Marty, your 24/7 CampusMart AI Assistant. Ask me anything—search textbooks, gadgets, cycles, senior clearance deals, or ask how campus meetup handovers work!",
      suggestions: DEFAULT_SUGGESTIONS,
      items: []
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async userQuery => {
    const textToSend = userQuery || input
    if (!textToSend.trim()) return

    const newMessages = [...messages, { sender: 'user', text: textToSend }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await apiFetch('/api/chatbot/', {
        method: 'POST',
        body: JSON.stringify({ message: textToSend })
      })

      if (response.ok) {
        const data = await response.json()
        setMessages([
          ...newMessages,
          {
            sender: 'bot',
            text: data.reply,
            suggestions: data.suggestions || [],
            items: data.items || []
          }
        ])
      } else {
        setMessages([
          ...newMessages,
          {
            sender: 'bot',
            text: "I'm having a little trouble connecting to campus servers right now. Please try again in a moment!",
            suggestions: ['Try again', 'Browse Catalog', 'Meetup Points'],
            items: []
          }
        ])
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          sender: 'bot',
          text: "Campus network timeout. Please check your connection and ask again!",
          suggestions: ['Retry', 'Safe Meetup Points'],
          items: []
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'bot',
        text: "👋 Chat reset! How can I assist you with campus marketplace deals today?",
        suggestions: DEFAULT_SUGGESTIONS,
        items: []
      }
    ])
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="campus-chatbot-wrapper">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chatbot-fab"
          title="Open CampusMart AI Assistant"
        >
          <div className="fab-pulse"></div>
          <FaRobot className="fab-icon" />
          <span className="fab-label">Ask Marty AI</span>
        </button>
      )}

      {/* Chat Window Drawer */}
      {isOpen && (
        <div className="chatbot-window glass-card">
          <div className="chatbot-header">
            <div className="bot-title-group">
              <div className="bot-avatar-box">
                <FaRobot />
              </div>
              <div>
                <h4>Marty — Campus AI</h4>
                <span className="bot-online-badge">
                  <span className="online-dot"></span> 24/7 College Assistant
                </span>
              </div>
            </div>

            <div className="header-action-buttons">
              <button
                onClick={handleClearChat}
                className="bot-header-icon-btn"
                title="Clear conversation"
              >
                <FaTrashAlt />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="bot-close-btn"
                title="Close chat"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="chatbot-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`message-row ${m.sender}`}>
                <div className={`message-bubble ${m.sender}`}>
                  <p className="message-content-text">{m.text}</p>

                  {/* Render Live Product Cards if bot returned matching items */}
                  {m.items && m.items.length > 0 && (
                    <div className="chatbot-items-carousel">
                      {m.items.map(item => (
                        <Link
                          to={`/listings/${item.id}`}
                          key={item.id}
                          className="chat-item-card"
                          onClick={() => setIsOpen(false)}
                        >
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="chat-item-thumb"
                            onError={e => handleImageError(e, item.category)}
                          />
                          <div className="chat-item-info">
                            <h5 className="chat-item-title">{item.title}</h5>
                            <div className="chat-item-meta">
                              <span className="chat-item-price">₹{item.price}</span>
                              <span className="chat-item-hostel">
                                <FaMapMarkerAlt /> {item.hostel}
                              </span>
                            </div>
                            <span className="chat-item-condition-tag">
                              {item.condition}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick suggestions pills */}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="bot-suggestions-chips">
                    {m.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        className="sug-chip"
                        onClick={() => handleSend(sug)}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="message-row bot">
                <div className="message-bubble bot typing">
                  <PulseLoader size={6} color="#818cf8" />
                  <span className="typing-label">Marty is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="chatbot-input-bar">
            <input
              type="text"
              placeholder="Ask anything (e.g. 'hi', 'calculators', 'cycles', 'how to buy')..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={() => handleSend()}
              className="send-msg-btn"
              disabled={!input.trim() || loading}
              title="Send message"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CampusChatbot
