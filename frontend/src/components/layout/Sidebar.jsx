import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Camera } from "lucide-react";
import ProfileUploadModal from "../ui/ProfileUploadModal";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="hidden md:flex w-64 min-h-screen bg-slate-800 text-white flex-col p-6">

      {/* Profile Section */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-2xl font-bold overflow-hidden shadow-lg">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0) || "U"
            )}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute bottom-0 right-0 bg-green-500 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-green-600"
          >
            <Camera size={14} />
          </button>
        </div>

        <h2 className="mt-4 font-semibold text-lg">
          {user?.name || "User"}
        </h2>

        <p className="text-sm text-gray-400 capitalize">
          {user?.role || "role"}
        </p>

        {/* Availability Status */}
        <div className="mt-2 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${user?.isAvailable ? 'bg-green-400' : 'bg-gray-400'}`}></span>
          <span className="text-xs text-gray-400">
            {user?.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition"
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>
      </nav>

      {/* Logout */}
      <div className="mt-auto">
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="flex items-center gap-2 text-red-400 hover:text-red-500 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Profile Upload Modal */}
      <ProfileUploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Sidebar;
