const ProgressCircle = () => {
  const percentage = 85;
  const radius = 50;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-4 text-green-700 dark:text-green-400">
        Sustainability Score
      </h3>

      <div className="relative">
        <svg height={radius * 2} width={radius * 2}>
          {/* Background Circle */}
          <circle
            stroke="#d1fae5"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="dark:stroke-gray-700"
          />

          {/* Progress Circle */}
          <circle
            stroke="#16a34a"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        </svg>

        {/* Percentage Text */}
        <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-green-700 dark:text-green-400">
          {percentage}%
        </div>
      </div>

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        Based on recycling performance and pickup efficiency
      </p>
    </div>
  );
};

export default ProgressCircle;
