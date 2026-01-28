import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ApplicationForm from './pages/ApplicationForm';
import ApplicationStatus from './pages/ApplicationStatus';
import Dashboard from './pages/Dashboard';
import LenderList from './pages/LenderList';
import LenderDetail from './pages/LenderDetail';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './hooks/useAuth';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
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
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/apply" element={<ProtectedRoute><ApplicationForm /></ProtectedRoute>} />
            <Route path="/application/:id" element={<ProtectedRoute><ApplicationStatus /></ProtectedRoute>} />
            <Route path="/lenders" element={<ProtectedRoute><LenderList /></ProtectedRoute>} />
            <Route path="/lenders/:id" element={<ProtectedRoute><LenderDetail /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
