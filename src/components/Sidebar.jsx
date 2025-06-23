import React from "react";
import { NavLink } from "react-router-dom";
import { HiHome, HiKey, HiClipboardList, HiLogout } from "react-icons/hi";

const Sidebar = ({ onLogout }) => {
  return (
    <div className="w-64 bg-blue-800 text-white flex flex-col">
      <div className="p-4 border-b border-blue-700">
        <h1 className="text-xl font-bold">Admin Gerbang Ponpes</h1>
      </div>

      <nav className="flex-1 py-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 ${
              isActive
                ? "bg-blue-700 border-l-4 border-white"
                : "hover:bg-blue-700"
            }`
          }
        >
          <HiHome className="mr-3 text-xl" />
          Dashboard
        </NavLink>

        <NavLink
          to="/rfid-cards"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 ${
              isActive
                ? "bg-blue-700 border-l-4 border-white"
                : "hover:bg-blue-700"
            }`
          }
        >
          <HiKey className="mr-3 text-xl" />
          Kartu RFID
        </NavLink>

        <NavLink
          to="/access-logs"
          className={({ isActive }) =>
            `flex items-center px-4 py-3 ${
              isActive
                ? "bg-blue-700 border-l-4 border-white"
                : "hover:bg-blue-700"
            }`
          }
        >
          <HiClipboardList className="mr-3 text-xl" />
          Riwayat Akses
        </NavLink>
      </nav>

      <div className="p-4 border-t border-blue-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
        >
          <HiLogout className="mr-2" />
          Keluar
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
