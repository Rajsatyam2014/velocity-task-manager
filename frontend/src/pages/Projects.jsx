import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FolderKanban, Plus, Clock, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      console.error('Error fetching projects', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProject.name) return;
    try {
      await api.post('/projects', newProject);
      setIsModalOpen(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  if (loading) return <div className="text-primary animate-pulse">Loading Core Nodes...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Projects</h1>
          <p className="text-muted">Active mission vectors and operational nodes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-accent hover:bg-accent/80 text-white px-4 py-3 rounded-xl shadow-neon transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold tracking-wider text-sm">CREATE NEW PROJECT</span>
        </button>
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-card w-full max-w-md p-8 relative"
          >
            <h2 className="text-2xl font-bold mb-6 text-primary">Initialize Project Vector</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Project Name</label>
                <input 
                  type="text" 
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-white transition-colors"
                  placeholder="e.g. Nexus Integration"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Description (Optional)</label>
                <textarea 
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary/50 text-white transition-colors h-24 resize-none"
                  placeholder="Enter project parameters..."
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 rounded-xl text-muted hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/80 text-background font-bold px-6 py-2 rounded-xl shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
            <FolderKanban className="w-10 h-10 text-muted" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Projects Yet</h3>
          <p className="text-muted max-w-sm mb-6">Create your first project to start managing tasks across your team.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/80 text-background px-6 py-3 rounded-xl font-bold transition-all shadow-neon"
          >
            <Plus className="w-5 h-5" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => {
            const colorHex = i % 3 === 0 ? '#00f0ff' : i % 3 === 1 ? '#9d00ff' : '#ff003c';

            // Build due label from nearestDue
            let dueLabel = 'No due tasks';
            let dueColor = '#8080a0';
            if (p.nearestDue) {
              const diff = Math.ceil((new Date(p.nearestDue) - new Date()) / (1000 * 60 * 60 * 24));
              if (diff < 0) { dueLabel = `${Math.abs(diff)}d overdue`; dueColor = '#ff003c'; }
              else if (diff === 0) { dueLabel = 'Due today'; dueColor = '#ff003c'; }
              else if (diff <= 3) { dueLabel = `Due in ${diff}d`; dueColor = '#ffaa00'; }
              else { dueLabel = `Due in ${diff}d`; }
            }

            return (
              <motion.div
                key={p.id}
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                onClick={() => navigate(`/kanban/${p.id}`)}
                className="glass-card p-6 cursor-pointer border-t border-l border-white/10 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: colorHex + '1A' }}>
                    <FolderKanban className="w-6 h-6" style={{ color: colorHex }} />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 rounded-full text-xs font-bold border flex items-center space-x-2" style={{ borderColor: colorHex + '4D', backgroundColor: colorHex + '1A' }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorHex, boxShadow: `0 0 5px ${colorHex}` }}></div>
                      <span style={{ color: colorHex }}>Active</span>
                    </div>
                    <button 
                      onClick={(e) => handleDeleteProject(e, p.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-muted hover:text-secondary hover:bg-secondary/10 transition-all"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{p.name}</h3>
                <p className="text-sm text-muted mb-6 line-clamp-2">{p.description || 'No description provided.'}</p>
                
                <div className="mt-auto">
                  <div className="flex justify-between text-sm mb-2 font-medium">
                    <span className="text-muted text-xs uppercase tracking-wider">Completion</span>
                    <span style={{ color: colorHex }}>{p.progress}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 mb-6">
                    <div 
                      className="h-1.5 rounded-full shadow-[0_0_10px_currentColor] transition-all duration-500" 
                      style={{ width: `${p.progress}%`, backgroundColor: colorHex }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-white/5 pt-4">
                    <span className="text-xs text-muted">{p._count.tasks} tasks</span>
                    <div className="flex items-center space-x-1 text-xs" style={{ color: dueColor }}>
                      <Clock className="w-4 h-4" />
                      <span>{dueLabel}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Projects;
