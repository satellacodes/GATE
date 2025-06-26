import React from "react";

const GateStatus = ({ status }) => {
  const statusConfig = {
    open: {
      text: "Gerbang Terbuka",
      color: "bg-green-100 text-green-800",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
    closed: {
      text: "Gerbang Tertutup",
      color: "bg-red-100 text-red-800",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
    },
    error: {
      text: "Sistem Error",
      color: "bg-yellow-100 text-yellow-800",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-yellow-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
  };

  const config = statusConfig[status] || statusConfig.error;

  return (
    <div className="card">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">{config.icon}</div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Status Gerbang
          </h2>
          <p
            className={`mt-1 text-2xl font-bold ${config.color} px-3 py-1 rounded-full inline-block`}
          >
            {config.text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GateStatus;
