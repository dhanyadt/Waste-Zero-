import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Users, Building2 } from "lucide-react";

const RoleSelection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    if (role === "volunteer") {
      navigate("/volunteer-dashboard");
    } else if (role === "ngo") {
      navigate("/ngo-dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome{user?.name ? `, ${user.name}` : ""}! 👋
          </h1>
          <p className="text-gray-500">
            Select your dashboard to continue
          </p>
        </div>

        {/* Role Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Volunteer Option */}
          <button
            onClick={() => handleRoleSelect("volunteer")}
            className="group flex flex-col items-center p-8 border-2 border-green-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-300"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <Users className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Volunteer
            </h2>
            
            <p className="text-gray-500 text-center text-sm">
              Join cleanup drives, track your impact, and help make a difference
            </p>

            <div className="mt-4 text-green-600 font-medium group-hover:translate-x-1 transition-transform">
              Continue →
            </div>
          </button>

          {/* NGO Option */}
          <button
            onClick={() => handleRoleSelect("ngo")}
            className="group flex flex-col items-center p-8 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
          >
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Building2 className="w-10 h-10 text-blue-600" />
            </div>
            
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              NGO
            </h2>
            
            <p className="text-gray-500 text-center text-sm">
              Create opportunities, manage volunteers, and coordinate drives
            </p>

            <div className="mt-4 text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
              Continue →
            </div>
          </button>

        </div>

        {/* Skip Option */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/volunteer-dashboard")}
            className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            Skip for now →
          </button>
        </div>

      </div>
    </div>
  );
};

export default RoleSelection;
