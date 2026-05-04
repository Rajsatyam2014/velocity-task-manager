import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, Save, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const Settings = () => {
  const { user, login } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Profile state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileBio, setProfileBio] = useState('');

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Notification preferences (localStorage)
  const [notifPrefs, setNotifPrefs] = useState(() => {
    const saved = localStorage.getItem('velocity_notif_prefs');
    return saved ? JSON.parse(saved) : {
      taskAssigned: true,
      taskOverdue: true,
      newMessage: true,
      projectUpdates: true,
      emailDigest: false,
    };
  });

  // Theme preferences (localStorage)
  const [themePrefs, setThemePrefs] = useState(() => {
    const saved = localStorage.getItem('velocity_theme');
    return saved || 'cyber-dark';
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
  ];

  // Profile save
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await api.put('/users/profile', {
        name: profileName,
        bio: profileBio,
      });
      showToast('Profile updated successfully');
      // Update context — reload user data
      window.dispatchEvent(new Event('user-updated'));
    } catch (error) {
      showToast('Failed to update profile', 'error');
    }
    setIsSaving(false);
  };

  // Password change
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await api.put('/users/password', {
        currentPassword,
        newPassword,
      });
      showToast('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to change password';
      showToast(msg, 'error');
    }
    setIsSaving(false);
  };

  // Save notification prefs
  const handleSaveNotifPrefs = () => {
    localStorage.setItem('velocity_notif_prefs', JSON.stringify(notifPrefs));
    showToast('Notification preferences saved');
  };

  // Save theme
  const handleSaveTheme = (theme) => {
    setThemePrefs(theme);
    localStorage.setItem('velocity_theme', theme);
    showToast(`Theme set to ${theme.replace('-', ' ')}`);
  };

  const toggleNotifPref = (key) => {
    setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const themes = [
    { id: 'cyber-dark', name: 'Cyber Dark', primary: '#00f0ff', accent: '#9d00ff', bg: '#0a0a0f', desc: 'Default futuristic dark theme' },
    { id: 'midnight-blue', name: 'Midnight Blue', primary: '#4f8fea', accent: '#7c3aed', bg: '#0c1222', desc: 'Deep blue professional look' },
    { id: 'neon-green', name: 'Matrix Green', primary: '#00ff88', accent: '#00cc66', bg: '#0a0f0a', desc: 'Hacker-style green interface' },
    { id: 'sunset-warm', name: 'Sunset Warm', primary: '#ff6b35', accent: '#ff3366', bg: '#1a0f0f', desc: 'Warm orange and red tones' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-24 right-8 z-[100] flex items-center space-x-3 px-5 py-3 rounded-xl border shadow-2xl ${
            toast.type === 'error'
              ? 'bg-secondary/20 border-secondary/30 text-secondary'
              : 'bg-green-400/20 border-green-400/30 text-green-400'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.msg}</span>
        </motion.div>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted">Configure your operational environment and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-primary/20 text-primary border border-primary/30 shadow-[inset_0_0_10px_rgba(0,240,255,0.1)]'
                  : 'text-muted hover:text-text hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-card p-8 min-h-[500px]">

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-6 mb-8">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-surface border-2 border-white/10 overflow-hidden group-hover:border-primary/50 transition-colors">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}&backgroundColor=14141e`} alt="avatar" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{user?.name}</h3>
                  <p className="text-muted text-sm">{user?.email}</p>
                  <p className="text-xs text-primary mt-1">{user?.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Display Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Email Address</label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    disabled
                    className="w-full bg-black/10 border border-white/5 rounded-xl px-4 py-3 text-muted cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted mb-2">Bio / Status Update</label>
                <textarea
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-white h-32 resize-none"
                  placeholder="Tell us about your mission..."
                ></textarea>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-primary hover:bg-primary/80 text-background px-6 py-2.5 rounded-xl font-bold transition-all shadow-neon disabled:opacity-50"
                >
                  <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                  <span>{isSaving ? 'SAVING...' : 'SAVE PROFILE'}</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-bold mb-2">Notification Preferences</h3>
              <p className="text-sm text-muted mb-6">Control what notifications you receive.</p>

              <div className="space-y-4">
                {[
                  { key: 'taskAssigned', label: 'Task Assigned', desc: 'Get notified when a task is assigned to you' },
                  { key: 'taskOverdue', label: 'Task Overdue Alerts', desc: 'Receive alerts for overdue tasks' },
                  { key: 'newMessage', label: 'New Messages', desc: 'Get notified for new direct messages' },
                  { key: 'projectUpdates', label: 'Project Updates', desc: 'Notifications for project changes' },
                  { key: 'emailDigest', label: 'Daily Email Digest', desc: 'Receive a daily summary email' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/5">
                    <div>
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs text-muted">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => toggleNotifPref(item.key)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${notifPrefs[item.key] ? 'bg-primary' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notifPrefs[item.key] ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end">
                <button
                  onClick={handleSaveNotifPrefs}
                  className="flex items-center space-x-2 bg-primary hover:bg-primary/80 text-background px-6 py-2.5 rounded-xl font-bold transition-all shadow-neon"
                >
                  <Save className="w-4 h-4" />
                  <span>SAVE PREFERENCES</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-bold mb-2">Security Settings</h3>
              <p className="text-sm text-muted mb-6">Change your password to keep your account secure.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-white pr-12"
                      placeholder="Enter current password"
                    />
                    <button onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-white pr-12"
                      placeholder="Enter new password (min 6 chars)"
                    />
                    <button onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-white"
                    placeholder="Confirm new password"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-secondary text-xs mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end">
                <button
                  onClick={handleChangePassword}
                  disabled={isSaving || !currentPassword || !newPassword || !confirmPassword}
                  className="flex items-center space-x-2 bg-primary hover:bg-primary/80 text-background px-6 py-2.5 rounded-xl font-bold transition-all shadow-neon disabled:opacity-50"
                >
                  <Shield className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                  <span>{isSaving ? 'UPDATING...' : 'CHANGE PASSWORD'}</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-xl font-bold mb-2">Appearance</h3>
              <p className="text-sm text-muted mb-6">Personalize the look and feel of your workspace.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {themes.map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => handleSaveTheme(theme.id)}
                    className={`p-4 rounded-xl border transition-all text-left ${
                      themePrefs === theme.id
                        ? 'border-primary/50 bg-primary/10 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex space-x-1.5">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }}></div>
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.accent }}></div>
                        <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: theme.bg }}></div>
                      </div>
                      {themePrefs === theme.id && <Check className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="font-bold text-sm">{theme.name}</p>
                    <p className="text-xs text-muted mt-1">{theme.desc}</p>
                  </button>
                ))}
              </div>

              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 mt-6">
                <p className="text-xs text-muted">🎨 Theme preferences are saved locally. The Cyber Dark theme is applied by default. More themes coming soon!</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
