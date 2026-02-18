import Sidebar from "../components/layout/Sidebar";
import StatCard from "../components/StatCard";
import ProgressSteps from "../components/ProgressSteps";
import ChartCard from "../components/ChartCard";
import ProgressCircle from "../components/ProgressCircle";

const VolunteerDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8 space-y-8">

        {/* Title */}
        <h1 className="text-3xl font-bold text-green-700">
          🌱 WasteZero Volunteer Dashboard
        </h1>

        {/* Waste Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Waste Pickups Completed"
            value="124"
            color="text-green-600"
          />

          <StatCard
            title="Kg Recycled"
            value="850 kg"
            color="text-emerald-600"
          />

          <StatCard
            title="Pending Pickup Requests"
            value="6"
            color="text-yellow-500"
          />
        </div>

        {/* Progress Steps */}
        <ProgressSteps />

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Recycling Trend */}
          <div className="md:col-span-2">
            <ChartCard />
          </div>

          {/* Sustainability Score */}
          <ProgressCircle />

        </div>

        {/* Upcoming Cleanup Drives */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-green-700">
            🚛 Upcoming Cleanup Drives
          </h3>

          <ul className="space-y-3 text-gray-700">
            <li>📍 Park Street – 18 Feb 2026</li>
            <li>📍 Eco Lake – 22 Feb 2026</li>
            <li>📍 City Market – 1 Mar 2026</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default VolunteerDashboard;
