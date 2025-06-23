import React from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

const Layout = () => {
  const { logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar onLogout={logout} />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>

        <footer className="bg-white p-4 border-t">
          <p className="text-center text-gray-600 text-sm">
            Sistem Gerbang IoT Pondok Pesantren © {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
