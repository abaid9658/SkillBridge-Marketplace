import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import GlassCard from '../components/ui/GlassCard';
import AnimatedButton from '../components/ui/AnimatedButton';
import { Send, User, MessageCircle, ArrowLeft } from 'lucide-react';

const Chat = () => {
  const { user: currentUser } = useAuth();
  const { socket, onlineStatus, checkUserOnline } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null); // The other user info we are chatting with
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const targetUserId = searchParams.get('user');

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations);
        
        // Check online status of conversation partners
        const otherIds = res.data.conversations.map((c) => c.otherUser?._id);
        if (otherIds.length > 0) {
          checkUserOnline(otherIds);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations list', err);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(`/chat/messages/${userId}`);
      if (res.data.success) {
        setMessages(res.data.messages);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Failed to load chat history messages', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (targetUserId) {
      // Find user info in conversations or fetch direct
      const activeConv = conversations.find((c) => c.otherUser?._id === targetUserId);
      if (activeConv) {
        setActiveUser(activeConv.otherUser);
      } else {
        // Fetch provider or customer details
        api.get(`/users/providers/${targetUserId}`)
          .then((res) => {
            if (res.data.success) {
              setActiveUser(res.data.provider);
            }
          })
          .catch((err) => {
            // If customer (not provider), fetch direct profile info fallback or mock
            setActiveUser({ _id: targetUserId, name: 'Contact Info' });
          });
      }
      fetchMessages(targetUserId);
    } else {
      setActiveUser(null);
      setMessages([]);
    }
  }, [targetUserId, conversations]);

  // Join/leave rooms in Socket.io
  useEffect(() => {
    if (socket && activeUser) {
      const conversationId = [currentUser._id, activeUser._id].sort().join('-');
      socket.emit('join_conversation', conversationId);

      const handleNewMsg = (msg) => {
        if (msg.conversationId === conversationId) {
          setMessages((prev) => [...prev, msg]);
          scrollToBottom();
        }
      };

      const handleTyping = (data) => {
        if (data.conversationId === conversationId && data.senderId !== currentUser._id) {
          setOtherUserTyping(true);
        }
      };

      const handleStopTyping = (data) => {
        if (data.conversationId === conversationId && data.senderId !== currentUser._id) {
          setOtherUserTyping(false);
        }
      };

      socket.on('new_message', handleNewMsg);
      socket.on('typing', handleTyping);
      socket.on('stop_typing', handleStopTyping);

      return () => {
        socket.emit('leave_conversation', conversationId);
        socket.off('new_message', handleNewMsg);
        socket.off('typing', handleTyping);
        socket.off('stop_typing', handleStopTyping);
      };
    }
  }, [socket, activeUser, currentUser]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    
    if (socket && activeUser) {
      const conversationId = [currentUser._id, activeUser._id].sort().join('-');
      
      if (!typing) {
        setTyping(true);
        socket.emit('typing', { conversationId, receiverId: activeUser._id });
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false);
        socket.emit('stop_typing', { conversationId, receiverId: activeUser._id });
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const body = {
      receiverId: activeUser._id,
      content: inputText,
    };

    try {
      const res = await api.post('/chat/messages', body);
      if (res.data.success) {
        const newMsg = res.data.message;
        setMessages((prev) => [...prev, newMsg]);
        setInputText('');
        scrollToBottom();

        // Emit message to Socket.io channel
        if (socket) {
          socket.emit('send_message', newMsg);
          
          // Stop typing indicator
          const conversationId = [currentUser._id, activeUser._id].sort().join('-');
          socket.emit('stop_typing', { conversationId, receiverId: activeUser._id });
          setTyping(false);
        }
        
        // Refresh conversations list to update order
        fetchConversations();
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const selectConversation = (otherUserId) => {
    setSearchParams({ user: otherUserId });
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ display: isMobile ? 'block' : 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', height: '70vh', minHeight: '500px' }} className="chat-layout">
        
        {/* Left Pane: Conversations List */}
        <GlassCard style={{ padding: '20px', display: isMobile && activeUser ? 'none' : 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Messages</h3>
          
          {conversations.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', margin: 'auto' }}>No conversations yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {conversations.map((conv) => {
                const isSelected = activeUser?._id === conv.otherUser?._id;
                const status = onlineStatus[conv.otherUser?._id] || 'offline';

                return (
                  <div
                    key={conv.conversationId}
                    onClick={() => selectConversation(conv.otherUser?._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: 'var(--border-radius-sm)',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--primary-glow)' : 'transparent',
                      transition: 'all 0.2s ease',
                      border: isSelected ? '1px solid var(--primary-light)' : '1px solid transparent',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--glass-bg)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <div style={{ position: 'relative' }}>
                      {conv.otherUser?.profilePicture ? (
                        <img src={conv.otherUser.profilePicture} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <User size={20} color="var(--text-muted)" />
                        </div>
                      )}
                      {/* Online Status Dot */}
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          border: '2px solid white',
                          background: status === 'online' ? 'var(--success)' : 'var(--text-muted)',
                        }}
                      />
                    </div>

                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.otherUser?.name}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.lastMessage?.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* Right Pane: Message Feed Box */}
        <GlassCard style={{ padding: '24px', display: isMobile && !activeUser ? 'none' : 'flex', flexDirection: 'column', height: '100%', minHeight: isMobile ? '450px' : 'auto' }}>
          {activeUser ? (
            <>
              {/* Active User Header Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                {isMobile && (
                  <button 
                    onClick={() => setSearchParams({})} 
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px',
                      marginRight: '8px', padding: 0
                    }}
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{activeUser.name}</h3>
                  <span style={{ fontSize: '12px', color: onlineStatus[activeUser._id] === 'online' ? 'var(--success)' : 'var(--text-muted)' }}>
                    {onlineStatus[activeUser._id] === 'online' ? 'Active Online' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Message scroll list */}
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                {messages.map((msg) => {
                  const isMe = msg.sender?._id === currentUser._id || msg.sender === currentUser._id;
                  
                  return (
                    <div
                      key={msg._id}
                      style={{
                        display: 'flex',
                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: '10px 16px',
                          borderRadius: '16px',
                          borderTopRightRadius: isMe ? '4px' : '16px',
                          borderTopLeftRadius: isMe ? '16px' : '4px',
                          background: isMe ? 'var(--primary)' : 'var(--glass-bg)',
                          color: isMe ? 'white' : 'var(--text-primary)',
                          border: isMe ? 'none' : '1px solid var(--border-color)',
                          boxShadow: 'var(--shadow-sm)',
                          fontSize: '14px',
                          lineHeight: '1.5',
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {otherUserTyping && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{ padding: '8px 14px', borderRadius: '12px', background: 'var(--glass-bg)', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {activeUser.name} is typing...
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message input submit form */}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                <input
                  type="text"
                  value={inputText}
                  onChange={handleInputChange}
                  placeholder="Type your message here..."
                  className="form-input"
                  style={{ flex: 1, borderRadius: 'var(--border-radius-sm)' }}
                  required
                />
                <AnimatedButton type="submit" variant="primary" style={{ padding: '12px' }}>
                  <Send size={18} />
                </AnimatedButton>
              </form>
            </>
          ) : (
            <div style={{ margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
              <MessageCircle size={48} />
              <h3>Select a thread to start chatting</h3>
            </div>
          )}
        </GlassCard>

      </div>

      <style>{`
        @media (max-width: 768px) {
          .chat-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Chat;
