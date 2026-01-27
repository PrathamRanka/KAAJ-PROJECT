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
  const location = window.location.pathname;

  const NavItem = ({ to, icon: Icon, children }: any) => {
    const isActive = location === to;
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

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col fixed h-full shadow-sm z-10">
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
        
        <nav className="px-6 space-y-2 flex-1 mt-6">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Platform</div>
          <NavItem to="/" icon={LayoutDashboard}>Dashboard</NavItem>
          <NavItem to="/apply" icon={FileText}>New Application</NavItem>
          <NavItem to="/lenders" icon={Settings}>Lender Network</NavItem>
        </nav>

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
          <button onClick={logout} className="flex items-center justify-center w-full px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-medium border border-red-100">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-10 overflow-auto">
         <div className="max-w-6xl mx-auto animate-fade-in">
           {children}
         </div>
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
  const completedCount = applications?.filter((a: any) => a.status === 'COMPLETED').length || 0;
  const totalVolume = applications?.reduce((acc: number, curr: any) => acc + (curr.requested_amount || 0), 0) || 0;

  const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
      </div>
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
      <p className="text-xs text-slate-400 mt-2">{subtext}</p>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
         <div>
            <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
            <p className="text-slate-500">Welcome back, here's what's happening today.</p>
         </div>
         <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition">Download Report</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
            title="Total Applications" 
            value={applicationCount} 
            subtext="Last 30 days"
            icon={FileText}
            color="bg-blue-500"
        />
        <StatCard 
            title="Processed Volume" 
            value={`$${(totalVolume / 1000).toFixed(0)}k`} 
            subtext="Total requested amount"
            icon={LayoutDashboard} // Reusing icon for generic money visualization
            color="bg-emerald-500"
        />
         <StatCard 
            title="Processing Rate" 
            value={`${applicationCount ? Math.round((completedCount / applicationCount) * 100) : 0}%`}
            subtext="Applications underwritten"
            icon={Settings}
            color="bg-purple-500"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
         <div className="p-6 border-b border-slate-50 flex justify-between items-center">
             <h3 className="font-bold text-lg text-slate-800">Recent Applications</h3>
             <Link to="/lenders" className="text-indigo-600 text-sm font-medium hover:text-indigo-700">View All</Link>
         </div>
         {applications?.length === 0 ? (
            <div className="p-10 text-center text-slate-500">No applications yet.</div>
         ) : (
            <div className="divide-y divide-slate-50">
                {applications?.slice(0, 5).map((app: any) => (
                    <div key={app.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                {app.business_name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">{app.business_name}</p>
                                <p className="text-xs text-slate-500">ID: {app.id} • ${app.requested_amount.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                app.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                                {app.status}
                            </span>
                             <Link to={`/application/${app.id}`} className="ml-4 text-slate-400 hover:text-indigo-600">
                                <FileText className="w-5 h-5"/>
                             </Link>
                        </div>
                    </div>
                ))}
            </div>
         )}
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
