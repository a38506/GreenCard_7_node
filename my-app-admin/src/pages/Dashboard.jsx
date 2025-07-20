// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const ORDER_API = import.meta.env.VITE_ORDER_URL || "";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${ORDER_API}/api/order/dashboard`);
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!stats?.success)
    return <p className="text-red-500 text-center mt-10">Failed to load stats</p>;

  return (
    <div className="w-full p-6 space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard title="Total Orders" value={stats.totalPlaced} color="bg-blue-100" />
        <StatCard title="Confirmed" value={stats.totalConfirmed} color="bg-yellow-100" />
        <StatCard title="Pending" value={stats.totalPending} color="bg-gray-100" />
        <StatCard title="Delivered" value={stats.totalDelivered} color="bg-green-100" />
        <StatCard title="Cancelled" value={stats.totalCancelled} color="bg-red-100" />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue}`}
          color="bg-emerald-100"
          wide
        />
      </div>

      {/* Revenue Chart */}
    <div className="w-full max-w-screen-xl mx-auto">
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 dark:bg-neutral-900">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Weekly Revenue
        </h2>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day => {
                const match = stats.revenueByDay.find(d => d.day === day);
                return { day, revenue: match?.revenue || 0 };
              })}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis dataKey="day" stroke="#8884d8" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>


    </div>
  );
}

function StatCard({ title, value, color, wide = false }) {
  return (
    <div
      className={`rounded-2xl p-6 shadow-md border border-gray-200 ${color} ${
        wide ? "md:col-span-2" : ""
      }`}
    >
      <div className="flex flex-col space-y-2 items-start">
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-3xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
