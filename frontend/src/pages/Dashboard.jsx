import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import ProgressSteps from "../components/ProgressSteps";
import ChartCard from "../components/ChartCard";
import ProgressCircle from "../components/ProgressCircle";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Visitors" value="941" color="text-blue-500" />
          <StatCard title="Average Score" value="56.7" color="text-red-500" />
          <StatCard title="Performance" value="80%" color="text-blue-500" />
        </div>

        {/* Steps */}
        <ProgressSteps />

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <ChartCard />
          </div>
          <ProgressCircle />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
