import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Send, MessageSquare, Search, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Messages = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages');
      setConversations(res.data);
    } catch (error) {
      console.error('Error fetching conversations', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.filter(u => u.id !== currentUser?.id));
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchConversations(), fetchUsers()]);
      setLoading(false);
    };
    init();
  }, []);

  // Poll for new messages when in a chat
  useEffect(() => {
    if (activeChat) {
      pollRef.current = setInterval(() => {
        loadThread(activeChat.id, true);
      }, 5000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeChat?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadThread = async (userId, silent = false) => {
    try {
      const res = await api.get(`/messages/${userId}`);
      setMessages(res.data);
      if (!silent) fetchConversations();
    } catch (error) {
      console.error('Error loading thread', error);
    }
  };

  const openChat = (partner) => {
    setActiveChat(partner);
    setShowNewChat(false);
    loadThread(partner.id);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    try {
      await api.post('/messages', {
        receiverId: activeChat.id,
        content: newMessage,
      });
      setNewMessage('');
      loadThread(activeChat.id);
      fetchConversations();
    } catch (error) {
      console.error('Error sending message', error);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    u.email.toLowerCase().includes(searchFilter.toLowerCase())
  );

  if (loading) return <div className="text-primary animate-pulse">Loading Messages...</div>;

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-13rem)]">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Messages</h1>
        <p className="text-muted">Secure team communication channel.</p>
      </div>

      <div className="flex h-[calc(100%-5rem)] glass-card !p-0 overflow-hidden border border-white/10">
        {/* Conversations Sidebar */}
        <div className="w-80 border-r border-white/10 flex flex-col">
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted">Conversations</h2>
            <button
              onClick={() => setShowNewChat(!showNewChat)}
              className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
              title="New Conversation"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>

          {showNewChat && (
            <div className="p-3 border-b border-white/10 bg-white/[0.02]">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary/50 text-white"
                />
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filteredUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => openChat(u)}
                    className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                  >
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}&backgroundColor=14141e`}
                      className="w-8 h-8 rounded-full border border-white/20"
                      alt=""
                    />
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <MessageSquare className="w-10 h-10 text-muted mb-3" />
                <p className="text-sm text-muted">No conversations yet</p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="text-xs text-primary mt-2 hover:underline"
                >
                  Start a new chat
                </button>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.partner.id}
                  onClick={() => openChat(conv.partner)}
                  className={`w-full flex items-center space-x-3 p-4 border-b border-white/5 hover:bg-white/5 transition-colors text-left ${
                    activeChat?.id === conv.partner.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                  }`}
                >
                  <div className="relative">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.partner.email}&backgroundColor=14141e`}
                      className="w-10 h-10 rounded-full border border-white/20"
                      alt=""
                    />
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-sm truncate">{conv.partner.name}</p>
                      <span className="text-[10px] text-muted">
                        {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-muted truncate">{conv.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {!activeChat ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-muted" />
              </div>
              <h3 className="text-xl font-bold mb-2">Select a Conversation</h3>
              <p className="text-muted text-sm max-w-xs">Choose from your existing conversations or start a new one.</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center space-x-4 bg-white/[0.02]">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat.email}&backgroundColor=14141e`}
                  className="w-10 h-10 rounded-full border border-white/20"
                  alt=""
                />
                <div>
                  <h3 className="font-bold">{activeChat.name}</h3>
                  <p className="text-xs text-muted">{activeChat.email}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted text-sm">No messages yet. Say hello! 👋</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId === currentUser?.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                            isMine
                              ? 'bg-primary/20 border border-primary/30 rounded-br-md'
                              : 'bg-white/5 border border-white/10 rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? 'text-primary/60' : 'text-muted'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-white/10 bg-white/[0.02]">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-white transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-5 py-3 bg-primary hover:bg-primary/80 text-background rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-50 disabled:shadow-none"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
