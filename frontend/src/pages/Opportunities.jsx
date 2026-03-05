import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAllOpportunities, applyToOpportunity, getMyApplications } from "../services/api";
import { useAuth } from "../context/AuthContext";

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchOpportunities();
    if (user?.role === "volunteer") {
      fetchMyApplications();
    }
  }, []);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await getAllOpportunities();
      console.log("Opportunities response:", response);
      if (response.data && response.data.success) {
        setOpportunities(response.data.opportunities || []);
      } else if (response.data) {
        setOpportunities(response.data.opportunities || []);
      }
    } catch (err) {
      console.error("Failed to load opportunities:", err);
      setError(err.response?.data?.message || "Failed to load opportunities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyApplications = async () => {
    try {
      const response = await getMyApplications();
      if (response.data.success) {
        const statusMap = {};
        response.data.applications.forEach((app) => {
          statusMap[app._id] = app.applicationStatus;
        });
        setApplicationStatus(statusMap);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    }
  };

  const handleApply = async (opportunityId) => {
    try {
      setApplying(opportunityId);
      const response = await applyToOpportunity(opportunityId);
      if (response.data.success) {
        setApplicationStatus((prev) => ({
          ...prev,
          [opportunityId]: "pending",
        }));
        alert("Application submitted successfully!");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to apply";
      alert(message);
    } finally {
      setApplying(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-red-100 text-red-800";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getApplicationStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-md">Pending</span>;
      case "accepted":
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">Accepted</span>;
      case "rejected":
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-md">Rejected</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Volunteer Opportunities</h1>
            <p className="text-gray-600 mt-1">Find ways to make a difference in your community</p>
          </div>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {opportunities.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No opportunities available</h3>
            <p className="text-gray-600">Check back later for new volunteer opportunities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <div
                key={opp._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{opp.title}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      opp.status
                    )}`}
                  >
                    {opp.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-2">🏢 NGO:</span>
                    <span>{opp.ngo?.name || "Unknown"}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-2">📍 Location:</span>
                    <span>{opp.location}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <span className="font-medium mr-2">⏱️ Duration:</span>
                    <span>{opp.duration}</span>
                  </div>

                  {opp.requiredSkills && opp.requiredSkills.length > 0 && (
                    <div>
                      <span className="font-medium text-gray-600 block mb-2">Skills Required:</span>
                      <div className="flex flex-wrap gap-2">
                        {opp.requiredSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-gray-600 text-sm line-clamp-3">{opp.description}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  {applicationStatus[opp._id] ? (
                    <div className="text-center">
                      {getApplicationStatusBadge(applicationStatus[opp._id])}
                      <p className="text-sm text-gray-500 mt-2">
                        {applicationStatus[opp._id] === "pending" && "Your application is under review"}
                        {applicationStatus[opp._id] === "accepted" && "Congratulations! You've been accepted"}
                        {applicationStatus[opp._id] === "rejected" && "Your application was not selected"}
                      </p>
                    </div>
                  ) : opp.status === "open" ? (
                    <button 
                      onClick={() => handleApply(opp._id)}
                      disabled={applying === opp._id}
                      className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {applying === opp._id ? "Applying..." : "Apply Now"}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                    >
                      Not Available
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Opportunities;
