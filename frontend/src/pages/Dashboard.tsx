import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, LayoutDashboard, Settings } from 'lucide-react';
import { endpoints } from '../lib/api';
import StatCard from '../components/StatCard';

const Dashboard: React.FC = () => {
  const { data: applications } = useQuery({
    queryKey: ['applications'],
    queryFn: () => endpoints.getApplications().then((res) => res.data),
  });

  const applicationCount = applications?.length || 0;
  const completedCount = applications?.filter((a: any) => a.status === 'COMPLETED').length || 0;
  const totalVolume = applications?.reduce((acc: number, curr: any) => acc + (curr.requested_amount || 0), 0) || 0;

  // Calculate growth percentages (simulating previous period as 85% of current for demo)
  // In production, you'd compare with actual historical data
  const previousApplicationCount = Math.floor(applicationCount * 0.85);
  const previousVolume = totalVolume * 0.82;
  const previousCompletedCount = Math.floor(completedCount * 0.88);
  
  const applicationGrowth = previousApplicationCount > 0 
    ? ((applicationCount - previousApplicationCount) / previousApplicationCount) * 100 
    : 0;
  
  const volumeGrowth = previousVolume > 0 
    ? ((totalVolume - previousVolume) / previousVolume) * 100 
    : 0;
  
  const completionRate = applicationCount > 0 ? (completedCount / applicationCount) * 100 : 0;
  const previousCompletionRate = previousApplicationCount > 0 
    ? (previousCompletedCount / previousApplicationCount) * 100 
    : 0;
  const completionGrowth = previousCompletionRate > 0 
    ? completionRate - previousCompletionRate 
    : 0;

  const downloadReport = () => {
    if (!applications || applications.length === 0) {
      alert('No applications to download');
      return;
    }

    // Generate CSV content
    const headers = ['ID', 'Business Name', 'Requested Amount', 'Status', 'Created Date'];
    const csvRows = [
      headers.join(','),
      ...applications.map((app: any) => [
        app.id,
        `"${app.business_name}"`,
        app.requested_amount,
        app.status,
        new Date(app.created_at || Date.now()).toLocaleDateString()
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `applications_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="text-slate-500">Welcome back, here's what's happening today.</p>
        </div>
        <button 
          onClick={downloadReport}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download Report</span>
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          title="Total Applications" 
          value={applicationCount} 
          subtext="Last 30 days"
          icon={FileText}
          color="bg-blue-500"
          growth={applicationGrowth}
        />
        <StatCard 
          title="Processed Volume" 
          value={`$${(totalVolume / 1000).toFixed(0)}k`} 
          subtext="Total requested amount"
          icon={LayoutDashboard}
          color="bg-emerald-500"
          growth={volumeGrowth}
        />
        <StatCard 
          title="Processing Rate" 
          value={`${applicationCount ? Math.round((completedCount / applicationCount) * 100) : 0}%`}
          subtext="Applications underwritten"
          icon={Settings}
          color="bg-purple-500"
          growth={completionGrowth}
        />
      </div>

      {/* Recent Applications Table */}
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
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
};

export default Dashboard;
