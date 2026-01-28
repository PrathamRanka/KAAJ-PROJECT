import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, FileText, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavItemProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, children, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 mb-1 ${
        isActive
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`} />
      {children}
    </Link>
  );
};

interface SidebarProps {
  currentPath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPath }) => {
  const { logout } = useAuth();

  return (
    <aside className="w-72 bg-white border-r border-gray-100 flex flex-col fixed h-full shadow-sm z-10">
      {/* Logo Section */}
      <div className="p-8 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">LenderMatch</h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide text-indigo-600">ENTERPRISE</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="px-6 space-y-2 flex-1 mt-6">
        <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Platform</div>
        <NavItem to="/" icon={LayoutDashboard} isActive={currentPath === '/'}>
          Dashboard
        </NavItem>
        <NavItem to="/apply" icon={FileText} isActive={currentPath === '/apply'}>
          New Application
        </NavItem>
        <NavItem to="/lenders" icon={Settings} isActive={currentPath === '/lenders'}>
          Lender Network
        </NavItem>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-6 border-t border-gray-50">
        <div className="flex items-center p-3 bg-gray-50 rounded-xl mb-3 border border-gray-100">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
            A
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">admin@kaaj.com</p>
          </div>
        </div>
        <button 
          onClick={logout} 
          className="flex items-center justify-center w-full px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium border border-red-100"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
