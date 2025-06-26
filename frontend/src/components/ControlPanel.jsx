import React from "react";

const ControlPanel = ({ onControl, status, deviceStatus }) => {
  const isDisabled = !deviceStatus;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Kontrol Manual
      </h2>

      {!deviceStatus ? (
        <p className="text-red-600 mb-4 font-medium animate-pulse">
          ⚠️ Perangkat sedang offline, tidak bisa mengontrol gerbang
        </p>
      ) : (
        <p className="text-gray-600 mb-4">
          Anda dapat membuka atau menutup gerbang secara manual
        </p>
      )}

      <div className="flex space-x-4">
        <button
          onClick={() => onControl("open")}
          disabled={isDisabled || status === "open"}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-white ${
            status === "open" || isDisabled
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          } transition-colors`}
        >
          Buka Gerbang
        </button>
        <button
          onClick={() => onControl("close")}
          disabled={isDisabled || status === "closed"}
          className={`flex-1 py-3 px-4 rounded-lg font-medium text-white ${
            status === "closed" || isDisabled
              ? "bg-red-300 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          } transition-colors`}
        >
          Tutup Gerbang
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
