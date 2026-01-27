import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LayoutDashboard, FileText, Settings, LogOut } from 'lucide-react';
import ApplicationForm from './pages/ApplicationForm';
import ApplicationStatus from './pages/ApplicationStatus';
import LenderList from './pages/LenderList';
import LenderDetail from './pages/LenderDetail';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { endpoints } from './lib/api';

const queryClient = new QueryClient();

function Layout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">LenderMatch</h1>
        </div>
        <nav className="px-4 space-y-1 flex-1">
          <Link to="/" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link to="/apply" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
            <FileText className="w-5 h-5 mr-3" />
            New Application
          </Link>
          <Link to="/lenders" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
            <Settings className="w-5 h-5 mr-3" />
            Lenders
          </Link>
        </nav>
        <div className="p-4 border-t">
          <button onClick={logout} className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-md w-full">
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function Dashboard() {
  const { data: applications } = useQuery({
    queryKey: ['applications'],
    queryFn: () => endpoints.getApplications().then((res) => res.data),
  });

  const applicationCount = applications?.length || 0;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium">Recent Applications</h3>
          <p className="text-3xl font-bold mt-2">{applicationCount}</p>
        </div>
      </div>
    </div>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/apply" element={<PrivateRoute><ApplicationForm /></PrivateRoute>} />
            <Route path="/application/:id" element={<PrivateRoute><ApplicationStatus /></PrivateRoute>} />
            <Route path="/lenders" element={<PrivateRoute><LenderList /></PrivateRoute>} />
            <Route path="/lenders/:id" element={<PrivateRoute><LenderDetail /></PrivateRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
