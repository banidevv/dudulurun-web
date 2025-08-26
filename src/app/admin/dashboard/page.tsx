'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface AdminData {
  id: number;
  name: string;
  email: string;
}

interface DashboardData {
  totalRegistrations: number;
  registrationsByCategory: Array<{
    category: string;
    count: number;
  }>;
  paymentStatusDistribution: Array<{
    status: string;
    count: number;
  }>;
  totalRevenue: number;
  pendingPayments: number;
  registrationTrend: Array<{
    date: string;
    count: number;
  }>;
}

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
};

export default function AdminDashboard() {
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/verify');
        if (!response.ok) {
          throw new Error('Not authenticated');
        }
        const data = await response.json();
        setAdmin(data.admin);
      } catch (error) {
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (admin) {
      fetchDashboardData();
    }
  }, [admin]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!admin || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dudulurun-cream to-dudulurun-cream/50 flex items-center justify-center">
        <div className="text-dudulurun-blue">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-dudulurun-cream to-dudulurun-cream/50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  const registrationsByCategoryData = {
    labels: dashboardData?.registrationsByCategory.map(item => item.category) || [],
    datasets: [
      {
        label: 'Registrations',
        data: dashboardData?.registrationsByCategory.map(item => item.count) || [],
        backgroundColor: [
          'rgba(0, 128, 128, 0.8)',
          'rgba(0, 128, 128, 0.6)',
          'rgba(0, 128, 128, 0.4)',
        ],
      },
    ],
  };

  const paymentStatusData = {
    labels: dashboardData?.paymentStatusDistribution.map(item => item.status) || [],
    datasets: [
      {
        data: dashboardData?.paymentStatusDistribution.map(item => item.count) || [],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)', // paid
          'rgba(255, 206, 86, 0.8)', // pending
          'rgba(255, 99, 132, 0.8)', // failed/expired
        ],
      },
    ],
  };

  const registrationTrendData = {
    labels: dashboardData?.registrationTrend.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    }) || [],
    datasets: [
      {
        label: 'Daily Registrations',
        data: dashboardData?.registrationTrend.map(item => item.count) || [],
        borderColor: 'rgb(0, 128, 128)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dudulurun-cream to-dudulurun-cream/50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Image
                src="/images/logo.png"
                alt="DuduLuRun Logo"
                width={40}
                height={40}
              />
              <h1 className="text-xl font-bold text-dudulurun-teal">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-dudulurun-blue">
                Welcome, {admin.name}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-dudulurun-teal text-white rounded-lg hover:bg-dudulurun-teal/90 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dashboard Cards */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-dudulurun-blue mb-4">
              Total Registrations
            </h2>
            <p className="text-4xl font-bold text-dudulurun-teal">
              {dashboardData?.totalRegistrations || 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-dudulurun-blue mb-4">
              Total Revenue
            </h2>
            <p className="text-4xl font-bold text-dudulurun-teal">
              Rp {(dashboardData?.totalRevenue || 0).toLocaleString('id-ID')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-dudulurun-blue mb-4">
              Pending Payments
            </h2>
            <p className="text-4xl font-bold text-dudulurun-teal">
              {dashboardData?.pendingPayments || 0}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Registrations by Category */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-dudulurun-blue mb-4">
              Registrations by Category
            </h2>
            <div className="h-[300px] flex items-center justify-center">
              <Bar data={registrationsByCategoryData} options={chartOptions} />
            </div>
          </div>

          {/* Payment Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold text-dudulurun-blue mb-4">
              Payment Status Distribution
            </h2>
            <div className="h-[300px] flex items-center justify-center">
              <Pie data={paymentStatusData} options={chartOptions} />
            </div>
          </div>

          {/* Registration Trend */}
          <div className="bg-white p-6 rounded-lg shadow-lg md:col-span-2">
            <h2 className="text-lg font-semibold text-dudulurun-blue mb-4">
              Registration Trend
            </h2>
            <div className="h-[300px] flex items-center justify-center">
              <Line data={registrationTrendData} options={chartOptions} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 