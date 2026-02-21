import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import ProfileEditModal from "../components/ui/ProfileEditModal";
import ProfileUploadModal from "../components/ui/ProfileUploadModal";

const NgoDashboard = () => {
  const { user } = useAuth();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-slate-900">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-green-700 dark:text-green-300">
            🌱 WasteZero NGO Dashboard
          </h1>

          <p className="text-gray-500 mt-1 dark:text-slate-300">
            Manage your organization’s waste pickup and recycling opportunities
          </p>
        </div>

        <ProfileEditModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
        <ProfileUploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />


        {/* Profile Summary */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md flex flex-col md:flex-row items-center gap-6">

          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-green-600 text-white flex items-center justify-center text-3xl font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || "N"}
          </div>

          {/* Profile Info */}
          <div className="flex-1">

            <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">
              {user?.name || "WasteZero Partner NGO"}
            </h2>

            <p className="text-gray-500 dark:text-slate-300">
              {user?.email || "ngo@wastezero.org"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 text-sm">

              <p>
                <span className="font-medium text-gray-600 dark:text-slate-300">Role:</span>{" "}
                <span className="text-green-600 font-medium">
                  NGO
                </span>
              </p>

              <p>
                <span className="font-medium text-green-600 dark:text-green-300">Organization:</span>{" "}
                <span className="dark:text-slate-300">WasteZero Partner NGO</span>
              </p>

              <p>
                <span className="font-medium text-green-600 dark:text-green-300">Location:</span>{" "}
                <span className="dark:text-slate-300">Kolkata, India</span>
              </p>

              <p>
                <span className="font-medium text-green-600 dark:text-green-300">Joined:</span>{" "}
                <span className="dark:text-slate-300">Feb 2026</span>
              </p>

            </div>

          </div>

          {/* Edit Profile Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditOpen(true)}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
            >
              Edit Profile
            </button>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            >
              Edit Picture
            </button>
          </div>

        </div>


        {/* Create Opportunity Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md flex justify-between items-center">

          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">
              Create Opportunity
            </h2>

            <p className="text-gray-500 text-sm mt-1 dark:text-slate-300">
              Post new cleanup drives and waste pickup opportunities
            </p>
          </div>

          <button
            disabled
            className="bg-gray-300 text-gray-600 px-5 py-2 rounded-lg cursor-not-allowed dark:bg-slate-700 dark:text-slate-300"
          >
            Coming in Milestone 2 🚧
          </button>

        </div>


        {/* My Opportunities Section */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">

          <h2 className="text-xl font-semibold text-gray-800 mb-4 dark:text-slate-100">
            My Opportunities
          </h2>

          {/* Empty State */}
          <div className="flex flex-col items-center justify-center py-12 text-center">

            <div className="text-6xl mb-3">♻️</div>

            <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-100">
              No Opportunities Created Yet
            </h3>

            <p className="text-gray-500 mt-2 dark:text-slate-300">
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
