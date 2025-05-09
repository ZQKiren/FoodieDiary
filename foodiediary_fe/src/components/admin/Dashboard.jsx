import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/admin';
import { useToast } from '../../context/ToastContext';
import MonthlyPostsChart from './charts/MonthlyPostsChart';
import TopCitiesChart from './charts/TopCitiesChart';
import TopUsersTable from './TopUsersTable';

const Dashboard = () => {
  const [monthlyStats, setMonthlyStats] = useState([]);
  const [cityStats, setCityStats] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [monthlyData, cityData, userData] = await Promise.all([
          adminService.getMonthlyStats(),
          adminService.getCityStats(),
          adminService.getMostActiveUsers(),
        ]);

        setMonthlyStats(monthlyData);
        setCityStats(cityData);
        setActiveUsers(userData);
      } catch (error) {
        console.error('Error fetching stats:', error);
        showToast('Failed to load dashboard stats', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [showToast]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Overview of food posts and user activities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Post stats card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Monthly Posts</h2>
            <Link
              to="/admin/posts"
              className="text-sm text-green-600 hover:text-green-700"
            >
              View All Posts
            </Link>
          </div>
          <div className="h-64">
            <MonthlyPostsChart data={monthlyStats} />
          </div>
        </div>

        {/* City stats card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Top Cities</h2>
          </div>
          <div className="h-64">
            <TopCitiesChart data={cityStats} />
          </div>
        </div>
      </div>

      {/* Active users */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Most Active Users</h2>
          <Link
            to="/admin/users"
            className="text-sm text-green-600 hover:text-green-700"
          >
            Manage Users
          </Link>
        </div>
        <TopUsersTable users={activeUsers} />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/admin/posts?approved=false"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Pending Approvals
          </h3>
          <p className="text-gray-600">
            Review and approve user-submitted food posts
          </p>
        </Link>
        <Link
          to="/admin/users"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            User Management
          </h3>
          <p className="text-gray-600">
            Manage users, roles, and permissions
          </p>
        </Link>
        <Link
          to="/admin/posts"
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            All Food Posts
          </h3>
          <p className="text-gray-600">
            View and manage all food posts
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;