import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";

const NgoDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-green-700">
            🌱 WasteZero NGO Dashboard
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your organization’s waste pickup and recycling opportunities
          </p>
        </div>


        {/* Profile Summary */}
        <div className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row items-center gap-6">

          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-green-600 text-white flex items-center justify-center text-3xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || "N"}
          </div>

          {/* Profile Info */}
          <div className="flex-1">

            <h2 className="text-xl font-semibold text-gray-800">
              {user?.name || "WasteZero Partner NGO"}
            </h2>

            <p className="text-gray-500">
              {user?.email || "ngo@wastezero.org"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm">

              <p>
                <span className="font-medium text-gray-600">Role:</span>{" "}
                <span className="text-green-600 font-medium">
                  NGO
                </span>
              </p>

              <p>
                <span className="font-medium text-gray-600">Organization:</span>{" "}
                WasteZero Partner NGO
              </p>

              <p>
                <span className="font-medium text-gray-600">Location:</span>{" "}
                Kolkata, India
              </p>

              <p>
                <span className="font-medium text-gray-600">Joined:</span>{" "}
                Feb 2026
              </p>

            </div>

          </div>

          {/* Edit Profile Button */}
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">
            Edit Profile
          </button>

        </div>


        {/* Create Opportunity Section */}
        <div className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center">

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Create Opportunity
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Post new cleanup drives and waste pickup opportunities
            </p>
          </div>

          <button
            disabled
            className="bg-gray-300 text-gray-600 px-5 py-2 rounded-lg cursor-not-allowed"
          >
            Coming in Milestone 2 🚧
          </button>

        </div>


        {/* My Opportunities Section */}
        <div className="bg-white p-6 rounded-xl shadow-md">

          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            My Opportunities
          </h2>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-12 text-center">

            <div className="text-6xl mb-3">♻️</div>

            <h3 className="text-lg font-semibold text-gray-700">
              No Opportunities Created Yet
            </h3>

            <p className="text-gray-500 mt-2">
              Create your first cleanup opportunity in Milestone 2.
            </p>

          </div>

        </div>


        {/* Impact Message */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-md">

          <h2 className="text-xl font-semibold mb-2">
            Make a Bigger Environmental Impact 🌍
          </h2>

          <p className="text-green-100">
            Create opportunities and collaborate with volunteers to keep our planet clean.
          </p>

        </div>

      </div>

    </div>
  );
};

export default NgoDashboard;
