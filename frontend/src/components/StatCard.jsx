const StatCard = ({ title, value, color }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
};

export default StatCard;
