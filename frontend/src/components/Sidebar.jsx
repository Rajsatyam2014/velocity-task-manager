import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, MessageSquare, Users, LogOut, Settings } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    window.location.reload();
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Projects', icon: FolderKanban, path: '/projects' },
    { name: 'Messages', icon: MessageSquare, path: '/messages' },
    { name: 'Team', icon: Users, path: '/team' },
  ];

  return (
    <div className="w-64 h-screen glass border-r border-white/10 flex flex-col justify-between fixed left-0 top-0 z-40">
      <div>
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-neon-gradient flex items-center justify-center shadow-neon">
            <span className="text-xl font-bold text-background">V</span>
          </div>
          <h2 className="text-2xl font-bold neon-text tracking-wider">VELOCITY</h2>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-primary/20 text-primary shadow-[inset_0_0_10px_rgba(0,240,255,0.2)] border border-primary/30'
                    : 'text-muted hover:text-text hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-white/10 space-y-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              isActive
                ? 'bg-primary/20 text-primary shadow-[inset_0_0_10px_rgba(0,240,255,0.2)] border border-primary/30'
                : 'text-muted hover:text-text hover:bg-white/5'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-secondary hover:bg-secondary/10 w-full transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
