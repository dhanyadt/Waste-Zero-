import { useState, useEffect, useCallback } from 'react';
import Sidebar from "./Sidebar";
import API from '../../services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar
} from 'recharts';

const AdminReports = () => {
  const [data, setData] = useState({
    userGrowth: [],
    oppGrowth: [],
    participation: []
  });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      const res = await API.get(`/admin/reports?${params}`);
      setData(res.data);
    } catch (error) {
      console.error('Reports fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDownloadCSV = () => {
    const csvContent = [
      'Metric,Month,Count',
      ...data.userGrowth.map(d => `Users,${d.month},${d.count}`),
      ...data.oppGrowth.map(d => `Opportunities,${d.month},${d.count}`),
      ...data.participation.map(d => `Participation,${d.month},${d.count}`)
    ].join('\\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wastezero-reports-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Reports & Analytics</h2>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="p-2 border rounded-md"
              max={dateTo || undefined}
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="p-2 border rounded-md"
              min={dateFrom || undefined}
            />
            <button
              onClick={fetchReports}
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Filter'}
            </button>
            <button
              onClick={handleDownloadCSV}
              className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 ml-auto md:ml-0"
              disabled={data.userGrowth.length === 0}
            >
              Download CSV
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-semibold mb-4">User & Opportunity Growth</h3>
            <LineChart width={600} height={300} data={data.userGrowth.map((u, i) => ({
              month: u.month,
              users: u.count,
              opps: data.oppGrowth[i]?.count || 0
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#8884d8" name="New Users" />
              <Line type="monotone" dataKey="opps" stroke="#82ca9d" name="New Opportunities" />
            </LineChart>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4">Volunteer Participation</h3>
            <BarChart width={600} height={300} data={data.participation}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Applications" />
            </BarChart>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-semibold mb-2">User Growth Data</h4>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th>Month</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {data.userGrowth.slice(0, 6).map((item, i) => (
                  <tr key={i} className="border-b">
                    <td>{item.month}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-semibold mb-2">Opportunity Trends</h4>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th>Month</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {data.oppGrowth.slice(0, 6).map((item, i) => (
                  <tr key={i} className="border-b">
                    <td>{item.month}</td>
                    <td>{item.count}</td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h4 className="font-semibold mb-2">Participation Data</h4>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th>Month</th>
                  <th>Applications</th>
                </tr>
              </thead>
              <tbody>
                {data.participation.slice(0, 6).map((item, i) => (
                  <tr key={i} className="border-b">
                    <td>{item.month}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
