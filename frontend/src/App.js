import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import History from "./pages/History";
import Schedule from "./pages/Schedule";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AuthProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} toggle={toggleSidebar} />
        <div className="flex flex-col flex-1">
          <Navbar toggleSidebar={toggleSidebar} />
          <main className="p-6 overflow-y-auto">
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/history" element={<History />} />
                <Route path="/schedule" element={<Schedule />} />
              </Route>
            </Routes>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
