const steps = ["Start", "Progress", "Review", "Done"];

const ProgressSteps = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
      <div className="flex justify-between">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center w-full">
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
              {step[0]}
            </div>
            <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps;
