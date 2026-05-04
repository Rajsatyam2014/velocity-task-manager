import React, { useContext, useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { Bell, Search, X, FolderKanban, CheckSquare, Users, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Layout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const searchTimerRef = useRef(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const [notifsRes, countRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count'),
      ]);
      setNotifications(notifsRes.data);
      setUnreadCount(countRes.data.count);
    } catch (error) {
      console.error('Error fetching notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 15 seconds
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.read) {
      try {
        await api.put(`/notifications/${notif.id}/read`);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      } catch (error) {
        console.error(error);
      }
    }
    if (notif.link) {
      navigate(notif.link);
      setShowNotifs(false);
    }
  };

  // Search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    if (query.length < 2) {
      setSearchResults(null);
      setShowSearch(false);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
        setSearchResults(res.data);
        setShowSearch(true);
      } catch (error) {
        console.error(error);
      }
    }, 300);
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'MESSAGE': return <MessageSquare className="w-4 h-4 text-primary" />;
      case 'TASK_ASSIGNED': return <CheckSquare className="w-4 h-4 text-accent" />;
      case 'INVITE': return <Users className="w-4 h-4 text-green-400" />;
      default: return <Bell className="w-4 h-4 text-muted" />;
    }
  };

  const getTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-background text-text flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col h-screen">
        {/* Top Navbar */}
        <header className="h-20 glass border-b border-white/10 flex items-center justify-between px-8 z-30">
          {/* Search Bar */}
          <div className="flex items-center w-1/2 relative" ref={searchRef}>
            <Search className="absolute left-3 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Search projects, tasks, members..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchResults && setShowSearch(true)}
              className="w-full bg-surface border border-white/10 rounded-xl py-2 pl-10 pr-4 text-text placeholder-muted focus:outline-none focus:border-primary/50 focus:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setShowSearch(false); setSearchResults(null); }}
                className="absolute right-3 text-muted hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showSearch && searchResults && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 glass-card !p-0 max-h-80 overflow-y-auto border border-white/10 shadow-2xl z-50"
                >
                  {searchResults.projects.length === 0 && searchResults.tasks.length === 0 && searchResults.users.length === 0 ? (
                    <div className="p-6 text-center text-muted text-sm">No results found</div>
                  ) : (
                    <>
                      {searchResults.projects.length > 0 && (
                        <div className="p-3 border-b border-white/5">
                          <p className="text-[10px] uppercase font-bold text-muted tracking-wider mb-2 px-2">Projects</p>
                          {searchResults.projects.map(p => (
                            <button key={p.id} onClick={() => { navigate(`/kanban/${p.id}`); setShowSearch(false); setSearchQuery(''); }} className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left">
                              <FolderKanban className="w-4 h-4 text-primary" />
                              <span className="text-sm">{p.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.tasks.length > 0 && (
                        <div className="p-3 border-b border-white/5">
                          <p className="text-[10px] uppercase font-bold text-muted tracking-wider mb-2 px-2">Tasks</p>
                          {searchResults.tasks.map(t => (
                            <button key={t.id} onClick={() => { navigate(`/kanban/${t.projectId}`); setShowSearch(false); setSearchQuery(''); }} className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left">
                              <CheckSquare className="w-4 h-4 text-accent" />
                              <div>
                                <span className="text-sm">{t.title}</span>
                                <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${t.status === 'DONE' ? 'bg-green-400/10 text-green-400' : 'bg-white/5 text-muted'}`}>{t.status}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.users.length > 0 && (
                        <div className="p-3">
                          <p className="text-[10px] uppercase font-bold text-muted tracking-wider mb-2 px-2">Members</p>
                          {searchResults.users.map(u => (
                            <button key={u.id} onClick={() => { navigate('/team'); setShowSearch(false); setSearchQuery(''); }} className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}&backgroundColor=14141e`} className="w-6 h-6 rounded-full" alt="" />
                              <div>
                                <span className="text-sm">{u.name}</span>
                                <span className="text-xs text-muted ml-2">{u.email}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center space-x-6">
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotifs(!showNotifs); }}
                className="text-muted hover:text-primary transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-secondary text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-[0_0_5px_rgba(255,0,60,0.8)] px-1">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-3 w-96 glass-card !p-0 border border-white/10 shadow-2xl z-50 max-h-[500px] flex flex-col"
                  >
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                      <h3 className="font-bold text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-primary hover:text-primary/80 transition-colors">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell className="w-8 h-8 text-muted mx-auto mb-2" />
                          <p className="text-sm text-muted">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.slice(0, 20).map(notif => (
                          <button
                            key={notif.id}
                            onClick={() => handleNotifClick(notif)}
                            className={`w-full flex items-start space-x-3 p-4 border-b border-white/5 hover:bg-white/5 transition-colors text-left ${
                              !notif.read ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className="mt-0.5 p-1.5 rounded-lg bg-white/5">
                              {getNotifIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notif.read ? 'font-medium' : 'text-muted'}`}>{notif.content}</p>
                              <p className="text-[10px] text-muted mt-1">{getTimeAgo(notif.createdAt)}</p>
                            </div>
                            {!notif.read && (
                              <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></div>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center space-x-3 pl-6 border-l border-white/10">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
                <p className="text-xs text-muted">{user?.role === 'ADMIN' ? 'System Operator' : 'Team Member'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-primary p-[2px]">
                <div className="w-full h-full rounded-full bg-surface flex items-center justify-center overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'admin'}&backgroundColor=14141e`} alt="avatar" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-8 pb-20 scroll-smooth relative">
          {/* Subtle background glow */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="relative z-10"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
