import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, LayoutDashboard, FolderKanban, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="glass-card flex flex-col justify-between"
  >
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-sm font-medium text-muted uppercase tracking-wider">{title}</h3>
      <div className={`p-2 rounded-lg`} style={{ backgroundColor: color === 'primary' ? '#00f0ff1A' : color === 'accent' ? '#9d00ff1A' : color === 'secondary' ? '#ff003c1A' : '#e0e0ff1A', color: color === 'primary' ? '#00f0ff' : color === 'accent' ? '#9d00ff' : color === 'secondary' ? '#ff003c' : '#e0e0ff' }}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="flex items-end space-x-2">
      <span className="text-4xl font-bold">{value}</span>
      <span className="text-sm text-muted mb-1">tasks</span>
    </div>
    {/* Decorative chart line */}
    <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: '70%', backgroundColor: color === 'primary' ? '#00f0ff' : color === 'accent' ? '#9d00ff' : color === 'secondary' ? '#ff003c' : '#e0e0ff' }}></div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({ totalTasks: 0, completedTasks: 0, pendingTasks: 0, overdueTasks: 0 });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Mock data for the chart since we don't have historical data in the DB yet
  const chartData = [
    { name: 'Mon', completed: 23 },
    { name: 'Tue', completed: 38 },
    { name: 'Wed', completed: 17 },
    { name: 'Thu', completed: 47 },
    { name: 'Fri', completed: 26 },
    { name: 'Sat', completed: 11 },
    { name: 'Sun', completed: 8 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projRes] = await Promise.all([
          api.get('/users/analytics'),
          api.get('/projects'),
        ]);
        setStats(statsRes.data);
        setProjects(projRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-primary animate-pulse">Loading Analytics...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Analytics Overview</h1>
        <p className="text-muted">System telemetry and task distribution matrix.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Tasks" value={stats.totalTasks} icon={LayoutDashboard} color="primary" delay={0.1} />
        <StatCard title="Completed" value={stats.completedTasks} icon={CheckCircle} color="accent" delay={0.2} />
        <StatCard title="Pending" value={stats.pendingTasks} icon={Clock} color="text" delay={0.3} />
        <StatCard title="Overdue" value={stats.overdueTasks} icon={AlertCircle} color="secondary" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold">Task Distribution Matrix</h3>
              <p className="text-sm text-muted">7-Day Completion Velocity</p>
            </div>
            <button className="px-4 py-2 text-sm text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors">
              Export
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#8080a0" axisLine={false} tickLine={false} />
                <YAxis stroke="#8080a0" axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(20,20,30,0.9)', borderColor: '#00f0ff', borderRadius: '8px' }}
                />
                <Bar dataKey="completed" fill="url(#colorUv)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#9d00ff" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass-card flex flex-col"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Active Projects</h3>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs text-primary hover:text-primary/80 flex items-center space-x-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <FolderKanban className="w-7 h-7 text-muted" />
              </div>
              <p className="text-muted text-sm mb-4">No projects created yet.</p>
              <button 
                onClick={() => navigate('/projects')}
                className="text-sm text-primary border border-primary/30 px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors"
              >
                Create First Project
              </button>
            </div>
          ) : (
            <div className="space-y-4 flex-1">
              {projects.slice(0, 4).map((p, i) => {
                const colorHex = i % 3 === 0 ? '#00f0ff' : i % 3 === 1 ? '#9d00ff' : '#ff003c';
                const dueLabel = p.nearestDue 
                  ? (() => {
                      const diff = Math.ceil((new Date(p.nearestDue) - new Date()) / (1000 * 60 * 60 * 24));
                      if (diff < 0) return { text: `${Math.abs(diff)}d overdue`, color: '#ff003c' };
                      if (diff === 0) return { text: 'Due today', color: '#ff003c' };
                      if (diff <= 3) return { text: `Due in ${diff}d`, color: '#ffaa00' };
                      return { text: `Due in ${diff}d`, color: '#8080a0' };
                    })()
                  : { text: 'No due date', color: '#8080a0' };

                return (
                  <motion.div
                    key={p.id}
                    whileHover={{ x: 4 }}
                    onClick={() => navigate(`/kanban/${p.id}`)}
                    className="cursor-pointer group"
                  >
                    <div className="flex justify-between text-sm mb-1.5">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorHex, boxShadow: `0 0 6px ${colorHex}` }}></div>
                        <span className="font-medium group-hover:text-white transition-colors">{p.name}</span>
                      </div>
                      <span style={{ color: colorHex }}>{p.progress}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 mb-1">
                      <div 
                        className="h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${p.progress}%`, backgroundColor: colorHex }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-muted">{p._count.tasks} tasks</span>
                      <span style={{ color: dueLabel.color }}>{dueLabel.text}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          
          {projects.length > 0 && (
            <div className="pt-6 border-t border-white/10 mt-4">
              <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <p className="text-2xl font-bold text-primary">{projects.length}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Projects</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 text-center border border-white/5">
                  <p className="text-2xl font-bold text-accent">{projects.reduce((acc, p) => acc + p._count.tasks, 0)}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Total Tasks</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
