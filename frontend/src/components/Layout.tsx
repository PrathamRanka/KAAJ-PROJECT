import React from 'react';
import Sidebar from '../components/Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = window.location.pathname;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <Sidebar currentPath={location} />
      
      {/* Main Content */}
      <main className="flex-1 ml-72 p-10 overflow-auto">
        <div className="max-w-6xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
