import React, { useState, useRef, useEffect } from 'react'
import { apiFetch } from '../../api'
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaLightbulb,
  FaGraduationCap
} from 'react-icons/fa'
import { PulseLoader } from 'react-spinners'
import './index.css'

const DEFAULT_SUGGESTIONS = [
  '🎓 Show Senior Deals',
  '🧮 Casio Calculator under ₹800',
  '🚲 Available Bicycles in Hostel A',
  '📍 How do Campus Meetups work?',
  '📦 Order tracking & stages'
]

const CampusChatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "👋 Hi! I'm Marty, your CampusMart AI Assistant. Ask me anything about textbooks, electronics, cycles, senior deals, orders, or campus meetup points!",
      suggestions: DEFAULT_SUGGESTIONS
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
            suggestions: data.suggestions || []
          }
        ])
      } else {
        setMessages([
          ...newMessages,
          {
            sender: 'bot',
            text: "I'm having a little trouble connecting to campus servers right now. Please try again in a moment!"
          }
        ])
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          sender: 'bot',
          text: "Campus connection timeout. Please check your network and try again."
        }
      ])
    } finally {
      setLoading(false)
    }
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
          <span className="fab-label">Ask Campus AI</span>
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
                <h4>CampusMart AI Assistant</h4>
                <span className="bot-online-badge">
                  <span className="online-dot"></span> Online • Powered by CampusMart
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="bot-close-btn"
              title="Close chat"
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="chatbot-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`message-row ${m.sender}`}>
                <div className={`message-bubble ${m.sender}`}>
                  <p>{m.text}</p>
                </div>

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
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="chatbot-input-bar">
            <input
              type="text"
              placeholder="Ask about calculators, cycles, senior deals..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={() => handleSend()}
              className="send-msg-btn"
              disabled={!input.trim() || loading}
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
