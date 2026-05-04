import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { UserPlus, Shield, MoreVertical, MessageSquare, Edit, X, CheckCircle, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Team = () => {
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [projectTasks, setProjectTasks] = useState([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  // Invite form
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    try {
      const [usersRes, projectsRes] = await Promise.all([
        api.get('/users'),
        api.get('/projects'),
      ]);
      setUsers(usersRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      console.error('Error fetching data', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="text-primary animate-pulse">Loading Directory...</div>;

  // Message handlers
  const openMessage = (user) => {
    setSelectedUser(user);
    setMessage('');
    setShowMessageModal(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    try {
      await api.post('/messages', {
        receiverId: selectedUser.id,
        content: message,
      });
      showToast(`Message sent to ${selectedUser.name}`);
      setShowMessageModal(false);
      setMessage('');
    } catch (error) {
      console.error(error);
      showToast('Failed to send message', 'error');
    }
  };

  // Reassign handlers
  const openAssign = (user) => {
    setSelectedUser(user);
    setSelectedProject('');
    setProjectTasks([]);
    setSelectedTaskIds([]);
    setShowAssignModal(true);
  };

  const handleProjectSelect = async (projectId) => {
    setSelectedProject(projectId);
    if (!projectId) { setProjectTasks([]); return; }
    try {
      const res = await api.get(`/tasks/project/${projectId}`);
      setProjectTasks(res.data);
      setSelectedTaskIds([]);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const handleAssignTasks = async () => {
    if (selectedTaskIds.length === 0) {
      showToast('Select at least one task to assign', 'error');
      return;
    }
    try {
      await Promise.all(
        selectedTaskIds.map(taskId =>
          api.put(`/tasks/${taskId}`, { assignedTo: selectedUser.id })
        )
      );
      showToast(`${selectedTaskIds.length} task(s) assigned to ${selectedUser.name}`);
      setShowAssignModal(false);
    } catch (error) {
      console.error(error);
      showToast('Failed to assign tasks', 'error');
    }
  };

  // Invite handlers
  const handleInvite = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }
    try {
      const res = await api.post('/users/invite', {
        name: inviteName,
        email: inviteEmail,
        role: inviteRole,
      });
      showToast(`${inviteName} invited! Temp password: ${res.data.tempPassword}`);
      setShowInviteModal(false);
      setInviteName('');
      setInviteEmail('');
      setInviteRole('MEMBER');
      fetchData(); // Refresh user list
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to invite user';
      showToast(msg, 'error');
    }
  };

  const selectedUserData = selectedUser ? users.find(u => u.id === selectedUser.id) : null;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`fixed top-24 right-8 z-[100] flex items-center space-x-3 px-5 py-3 rounded-xl border shadow-2xl ${
            toast.type === 'error'
              ? 'bg-secondary/20 border-secondary/30 text-secondary'
              : 'bg-green-400/20 border-green-400/30 text-green-400'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.msg}</span>
        </motion.div>
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Team Directory</h1>
          <p className="text-muted">Manage organization members and deployment status.</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center space-x-2 bg-accent hover:bg-accent/80 text-white px-4 py-3 rounded-xl shadow-[0_0_15px_rgba(157,0,255,0.4)] transition-all font-bold text-sm"
        >
          <UserPlus className="w-5 h-5" />
          <span>INVITE MEMBER</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users Table */}
        <div className="lg:col-span-2 glass-card overflow-hidden !p-0 border border-white/10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-xs font-medium text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user, idx) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`hover:bg-white/5 transition-colors ${user.id === currentUser?.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                >
                  <td className="px-6 py-4 flex items-center space-x-4">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}&backgroundColor=14141e`} className={`w-10 h-10 rounded-full border ${user.role === 'ADMIN' ? 'border-accent shadow-[0_0_10px_rgba(157,0,255,0.4)]' : 'border-white/20'}`} alt="avatar" />
                    <div>
                      <p className="font-bold">{user.name} {user.id === currentUser?.id && <span className="text-xs text-primary">(You)</span>}</p>
                      <p className="text-xs text-muted">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs border ${user.role === 'ADMIN' ? 'bg-accent/10 border-accent/30 text-accent' : 'bg-white/5 border-white/10 text-muted'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">
                    {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex space-x-2 justify-end">
                      {user.id !== currentUser?.id && (
                        <>
                          <button
                            onClick={() => openMessage(user)}
                            className="p-2 rounded-lg hover:bg-primary/10 text-muted hover:text-primary transition-colors"
                            title="Send Message"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openAssign(user)}
                            className="p-2 rounded-lg hover:bg-accent/10 text-muted hover:text-accent transition-colors"
                            title="Assign Tasks"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {user.id === currentUser?.id && (
                        <button
                          onClick={() => navigate('/messages')}
                          className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          View Messages →
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Card */}
        <div className="glass-card p-6 h-fit border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-xl border border-primary/50 shadow-[0_0_15px_rgba(0,240,255,0.3)] bg-surface overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email || 'admin'}&backgroundColor=14141e`} alt="avatar" className="w-full h-full" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{currentUser?.name}</h2>
              <p className="text-sm text-primary flex items-center space-x-1"><Shield className="w-3 h-3"/> <span>{currentUser?.role}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
              <p className="text-3xl font-bold text-primary mb-1">{users.length}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Team<br/>Members</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
              <p className="text-3xl font-bold text-accent mb-1">{projects.length}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Active<br/>Projects</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/messages')}
              className="w-full py-3 border border-primary text-primary rounded-xl text-sm font-bold hover:bg-primary/10 transition-colors"
            >
              OPEN MESSAGES
            </button>
            <button
              onClick={() => setShowInviteModal(true)}
              className="w-full py-3 bg-accent/20 border border-accent/30 text-accent rounded-xl text-sm font-bold hover:bg-accent/30 transition-colors"
            >
              INVITE MEMBER
            </button>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-6 relative"
          >
            <button onClick={() => setShowMessageModal(false)} className="absolute top-4 right-4 text-muted hover:text-white"><X className="w-5 h-5" /></button>
            <div className="flex items-center space-x-3 mb-4">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser?.email}&backgroundColor=14141e`} className="w-10 h-10 rounded-full border border-white/20" alt="" />
              <div>
                <h3 className="text-lg font-bold">Message {selectedUser?.name}</h3>
                <p className="text-xs text-muted">{selectedUser?.email}</p>
              </div>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full h-32 bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-white transition-colors resize-none"
            ></textarea>
            <div className="flex justify-end space-x-3 mt-4">
              <button className="px-4 py-2 rounded-lg text-muted hover:text-white transition-colors" onClick={() => setShowMessageModal(false)}>Cancel</button>
              <button
                className="px-6 py-2 rounded-xl bg-primary hover:bg-primary/80 text-background font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-50"
                onClick={handleSendMessage}
                disabled={!message.trim()}
              >
                Send Message
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Assign Tasks Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-lg p-6 relative max-h-[80vh] flex flex-col"
          >
            <button onClick={() => setShowAssignModal(false)} className="absolute top-4 right-4 text-muted hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold mb-4 text-primary">Assign Tasks to {selectedUser?.name}</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-muted mb-1">Select Project</label>
              <select
                value={selectedProject}
                onChange={(e) => handleProjectSelect(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-white transition-colors"
              >
                <option value="">Choose a project...</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {projectTasks.length > 0 && (
              <div className="flex-1 overflow-y-auto mb-4">
                <label className="block text-sm font-medium text-muted mb-2">Select Tasks to Assign</label>
                <div className="space-y-2">
                  {projectTasks.map(task => (
                    <label
                      key={task.id}
                      className={`flex items-center space-x-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                        selectedTaskIds.includes(task.id)
                          ? 'border-primary/50 bg-primary/10'
                          : 'border-white/10 hover:bg-white/5'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.includes(task.id)}
                        onChange={() => toggleTaskSelection(task.id)}
                        className="accent-primary"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            task.priority === 'HIGH' ? 'border-secondary/30 text-secondary' :
                            task.priority === 'MEDIUM' ? 'border-accent/30 text-accent' :
                            'border-white/10 text-muted'
                          }`}>{task.priority}</span>
                          <span className="text-[10px] text-muted">{task.status}</span>
                          {task.user && <span className="text-[10px] text-muted">→ {task.user.name}</span>}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {selectedProject && projectTasks.length === 0 && (
              <p className="text-sm text-muted text-center py-8">No tasks in this project yet.</p>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
              <button className="px-4 py-2 rounded-lg text-muted hover:text-white transition-colors" onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button
                className="px-6 py-2 rounded-xl bg-accent hover:bg-accent/80 text-white font-bold transition-all shadow-[0_0_15px_rgba(157,0,255,0.4)] disabled:opacity-50"
                onClick={handleAssignTasks}
                disabled={selectedTaskIds.length === 0}
              >
                Assign {selectedTaskIds.length > 0 ? `(${selectedTaskIds.length})` : ''} Tasks
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card w-full max-w-md p-6 relative"
          >
            <button onClick={() => setShowInviteModal(false)} className="absolute top-4 right-4 text-muted hover:text-white"><X className="w-5 h-5" /></button>
            <h3 className="text-xl font-bold mb-6 text-primary">Invite New Member</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Full Name</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="e.g. john@company.com"
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-white transition-colors"
                >
                  <option value="MEMBER" className="bg-[#14141e]">Member</option>
                  <option value="ADMIN" className="bg-[#14141e]">Admin</option>
                </select>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-3 mt-4">
              <p className="text-xs text-muted">💡 The invited member will receive a default password: <strong className="text-primary">Welcome@123</strong>. They should change it in Settings after first login.</p>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button className="px-4 py-2 rounded-lg text-muted hover:text-white transition-colors" onClick={() => setShowInviteModal(false)}>Cancel</button>
              <button
                className="px-6 py-2 rounded-xl bg-accent hover:bg-accent/80 text-white font-bold transition-all shadow-[0_0_15px_rgba(157,0,255,0.4)] disabled:opacity-50"
                onClick={handleInvite}
                disabled={!inviteName.trim() || !inviteEmail.trim()}
              >
                Send Invite
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Team;
