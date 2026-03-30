import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import API from "../services/api";

const AdminOpportunities = () => {
  const [opps, setOpps] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [ngoFilter, setNgoFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [search, setSearch] = useState(""); // Keep title search

  const fetchOpps = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (ngoFilter) params.append('ngo', ngoFilter);
      if (locationFilter) params.append('location', locationFilter);
      
      const res = await API.get(`/admin/opportunities?${params}`);
      setOpps(res.data.opportunities || []);
    } catch (error) {
      console.error('Fetch opportunities error:', error);
      setOpps([]);
    }
  }, [statusFilter, ngoFilter, locationFilter]);

  useEffect(() => {
    fetchOpps();
  }, [fetchOpps]);

  const deleteOpp = async (id) => {
    try {
      await API.delete(`/admin/opportunities/${id}`);
      setOpps(opps.filter(o => o._id !== id));
    } catch {
      alert("Deleted (demo)");
    }
  };

  const filtered = opps.filter(o =>
    o.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-6 overflow-auto"> 
        <h2 className="text-2xl font-bold mb-6">Opportunity Moderation</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          
          <input
            placeholder="NGO Name..."
            value={ngoFilter}
            onChange={(e) => setNgoFilter(e.target.value)}
            className="p-2 border rounded-md"
          />
          
          <input
            placeholder="Location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="p-2 border rounded-md"
          />
        </div>

        <input
          placeholder="Search title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 p-2 border rounded-md mb-6"
        />

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Location</th>
                <th className="px-4 py-2 text-left">NGO</th>
                <th className="px-4 py-2 text-left">Created</th>
                <th className="px-4 py-2 text-left">Applicants</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{o.title}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      o.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{o.location}</td>
                  <td className="px-4 py-2">{o.ngo?.name || 'N/A'}</td>
                  <td className="px-4 py-2">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{o.applicants?.length || 0}</td>
                  <td className="px-4 py-2">
                    <button 
                      onClick={() => deleteOpp(o._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-gray-500 text-center py-8">No opportunities found matching filters.</p>
        )}
      </div>
    </div>
  );
};

export default AdminOpportunities;