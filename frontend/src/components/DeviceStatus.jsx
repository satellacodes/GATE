import React from "react";

const DeviceStatus = ({ status }) => {
  const statusConfig = status
    ? {
        text: "Perangkat Online",
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
      }
    : {
        text: "Perangkat Offline",
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
      };

  return (
    <div className="card">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">{statusConfig.icon}</div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Status Perangkat
          </h2>
          <p
            className={`mt-1 text-2xl font-bold ${statusConfig.color} px-3 py-1 rounded-full inline-block`}
          >
            {statusConfig.text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeviceStatus;
