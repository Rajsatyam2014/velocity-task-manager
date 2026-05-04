import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login, signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password, 'ADMIN'); // Defaulting to ADMIN for demo
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* 3D-like abstract background elements */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-[100px]"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass rounded-3xl p-8 shadow-neon border-t border-l border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold neon-text mb-2">VELOCITY</h1>
            <p className="text-muted text-sm">Secure Access Terminal</p>
          </div>

          {error && <div className="mb-4 p-3 bg-secondary/20 border border-secondary text-secondary rounded-lg text-sm text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Operative Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-text placeholder-white/20 focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
                  placeholder="John Doe"
                  required={!isLogin}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">System ID (Email)</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-text placeholder-white/20 focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
                placeholder="operative@velocity.sys"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wider mb-2">Passcode</label>
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-text placeholder-white/20 focus:outline-none focus:border-primary focus:shadow-[0_0_10px_rgba(0,240,255,0.3)] transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            
            <button 
              type="submit"
              className="w-full py-4 rounded-xl bg-neon-gradient text-background font-bold text-lg hover:shadow-neon transition-all duration-300 transform hover:-translate-y-1"
            >
              {isLogin ? 'INITIALIZE CONNECTION' : 'REGISTER OPERATIVE'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:text-white transition-colors"
            >
              {isLogin ? 'Request new clearance (Signup)' : 'Already have clearance? (Login)'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
