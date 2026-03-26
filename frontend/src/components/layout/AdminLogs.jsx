import { useState, useEffect, useCallback } from 'react';
import Sidebar from "./Sidebar";
import API from '../../services/api';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.get(`/admin/logs?page=${page}&limit=10`);
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch (error) {
      console.error('Logs fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage, fetchLogs]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatAction = (log) => {
    const actionMap = {
      user_suspended: 'Suspended user',
      user_activated: 'Activated user',
      opportunity_deleted: 'Deleted opportunity'
    };
    return actionMap[log.action] || log.action;
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">
        <h2 className="text-2xl font-bold mb-6">Admin Activity Logs</h2>

        <div className="overflow-x-auto mb-6">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {formatAction(log)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.admin}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <span className="font-medium">{log.target.type.toUpperCase()}</span>: {log.target.name || log.target.title || log.target.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && <p className="text-center py-4 text-gray-500">Loading...</p>}
        {!loading && logs.length === 0 && <p className="text-center py-8 text-gray-500">No logs found.</p>}

        {pagination.pages > 1 && (
          <div className="flex justify-center space-x-2 mt-6">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-3 py-1 rounded-md text-sm font-medium ${
                  pageNum === currentPage
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 text-center text-sm text-gray-500">
          Page {pagination.current} of {pagination.pages} (Total: {pagination.total})
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
