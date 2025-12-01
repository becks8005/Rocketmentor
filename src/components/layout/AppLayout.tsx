import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { Sidebar } from './Sidebar';
import { GettingStartedGuide } from '../getting-started/GettingStartedGuide';
import logo from '../../assets/logo.png';

const HEADER_HEIGHT = 65; // Height of the header with logo

export const AppLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-app)' }}>
      {/* Fixed Header with Logo - spans full width */}
      <header 
        className="fixed top-0 left-0 right-0 z-50 flex items-center"
        style={{ 
          height: HEADER_HEIGHT, 
          backgroundColor: 'var(--bg-sidebar)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        {/* Logo Section */}
        <motion.div 
          initial={false}
          animate={{ width: isSidebarCollapsed ? 72 : 240 }}
          className="h-full flex items-center px-4 flex-shrink-0"
          style={{ 
            backgroundColor: 'var(--bg-sidebar)',
            borderRight: '1px solid var(--border-subtle)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 p-1.5">
              <img src={logo} alt="Rocketmentor logo" className="w-full h-full object-contain" />
            </div>
            {!isSidebarCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                rocketmentor
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Rest of header - empty but maintains the horizontal divider line */}
        <div className="flex-1 h-full" style={{ backgroundColor: 'var(--bg-app)' }} />
        
        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute w-6 h-6 rounded-full border flex items-center justify-center transition-all"
          style={{ 
            left: isSidebarCollapsed ? 60 : 228,
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-secondary)',
            zIndex: 60
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          {isSidebarCollapsed ? (
            <CaretRight className="w-4 h-4" />
          ) : (
            <CaretLeft className="w-4 h-4" />
          )}
        </button>
      </header>

      {/* Sidebar - positioned below header */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        headerHeight={HEADER_HEIGHT}
      />
      
      {/* Main Content Area */}
      <motion.main
        initial={false}
        animate={{ marginLeft: isSidebarCollapsed ? 72 : 240 }}
        className="min-h-screen"
        style={{ paddingTop: HEADER_HEIGHT }}
      >
        <div className="p-8 lg:p-10 max-w-[1920px] mx-auto">
          <Outlet />
        </div>
      </motion.main>
      
      <GettingStartedGuide />
    </div>
  );
};

