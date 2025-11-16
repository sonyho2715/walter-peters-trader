import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const Dashboard = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const response = await axios.get(`${API_ENDPOINTS.DASHBOARD}/metrics`);
      return response.data.data;
    },
  });

  const { data: funnel } = useQuery({
    queryKey: ['recruitment-funnel'],
    queryFn: async () => {
      const response = await axios.get(`${API_ENDPOINTS.DASHBOARD}/recruitment-funnel`);
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Active Members',
      value: metrics?.active_members || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Studies',
      value: metrics?.active_studies || 0,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      name: 'Pending Applications',
      value: metrics?.pending_applications || 0,
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      name: 'Successful Placements',
      value: metrics?.successful_placements || 0,
      icon: CheckCircle,
      color: 'bg-purple-500',
    },
  ];

  const funnelData = funnel?.funnel ? [
    { stage: 'Total Members', count: parseInt(funnel.funnel.total_members) },
    { stage: 'Applications', count: parseInt(funnel.funnel.total_applications) },
    { stage: 'In Review', count: parseInt(funnel.funnel.in_review) },
    { stage: 'Screening', count: parseInt(funnel.funnel.in_screening) },
    { stage: 'Interviews', count: parseInt(funnel.funnel.interviews) },
    { stage: 'Approved', count: parseInt(funnel.funnel.approved) },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Overview of recruitment activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recruitment Funnel Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recruitment Funnel</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnelData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="stage" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Activity</h3>
          <p className="text-3xl font-bold text-blue-600">{metrics?.new_members_30d || 0}</p>
          <p className="text-sm text-gray-600">New members in last 30 days</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Review Time</h3>
          <p className="text-3xl font-bold text-green-600">
            {metrics?.avg_review_time_days ? Math.round(metrics.avg_review_time_days) : 0}
          </p>
          <p className="text-sm text-gray-600">Days to review applications</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
