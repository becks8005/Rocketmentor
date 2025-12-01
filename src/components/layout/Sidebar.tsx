import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Path, 
  Trophy, 
  Chat,
  SignOut,
  User
} from '@phosphor-icons/react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  headerHeight?: number;
}

const NAV_ITEMS = [
  { path: '/app', label: 'This Week', icon: Calendar, description: 'Plan your week' },
  { path: '/app/path', label: 'Path', icon: Path, description: 'Track promotion progress' },
  { path: '/app/wins', label: 'Wins', icon: Trophy, description: 'Your proof points' },
  { path: '/app/coach', label: 'Coach', icon: Chat, description: 'AI mentor chat' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, headerHeight = 65 }) => {
  const navigate = useNavigate();
  const { state, logout } = useApp();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 72 : 240 }}
      className="bg-sidebar border-r border-border-subtle flex flex-col fixed left-0 top-0 z-40 h-screen"
      style={{ 
        backgroundColor: 'var(--bg-sidebar)', 
        borderColor: 'var(--border-subtle)',
        paddingTop: headerHeight
      }}
    >
      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) => `
                relative flex items-center gap-3 px-3 py-2.5 transition-all group
                ${isActive 
                  ? 'bg-white text-text-primary' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/50'
                }
              `}
              style={({ isActive }) => ({
                borderRadius: '4px',
                backgroundColor: isActive ? 'var(--bg-surface)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r"
                      style={{ backgroundColor: 'var(--accent-main)' }}
                    />
                  )}
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '' : ''}`} />
                  {!isCollapsed && (
                    <div className="flex-1 overflow-hidden">
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="block font-medium truncate text-sm"
                      >
                        {item.label}
                      </motion.span>
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="block text-xs truncate mt-0.5"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {item.description}
                      </motion.span>
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-border-subtle space-y-2" style={{ borderColor: 'var(--border-subtle)' }}>
        {/* User Info */}
        <div className={`flex items-center gap-3 px-3 py-2 bg-white ${isCollapsed ? 'justify-center' : ''}`} style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '4px' }}>
          <div className="w-8 h-8 rounded-lg bg-border-subtle flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--border-subtle)' }}>
            <User className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {state.user?.firstName || 'User'}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                {state.user?.email || 'user@example.com'}
              </p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`
            flex items-center gap-3 px-3 py-2.5 w-full
            transition-all
            ${isCollapsed ? 'justify-center' : ''}
          `}
          style={{ 
            borderRadius: '4px',
            color: 'var(--text-secondary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.backgroundColor = 'rgba(15, 15, 15, 0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <SignOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium text-sm">Log out</span>}
        </button>
      </div>

    </motion.aside>
  );
};

