import React, { useState, useEffect } from "react";
import GateStatus from "../components/GateStatus";
import RecentAccess from "../components/RecentAccess";
import ControlPanel from "../components/ControlPanel";
import DeviceStatus from "../components/DeviceStatus";
import api from "../services/api";

const Dashboard = () => {
  const [gateStatus, setGateStatus] = useState("closed");
  const [accessCountToday, setAccessCountToday] = useState(0);
  const [todaysHistory, setTodaysHistory] = useState([]);
  const [schedulesToday, setSchedulesToday] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceStatus, setDeviceStatus] = useState(false);

  // Format waktu untuk tampilan
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  // Fungsi untuk mendapatkan nama hari dalam format backend
  const getDayNameForBackend = () => {
    const dayName = new Date()
      .toLocaleDateString("id-ID", { weekday: "long" })
      .toLowerCase();

    return dayName;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Mengambil data secara paralel
        const responses = await Promise.all([
          api.get("/gate/status"),
          api.get("/history"),
          api.get("/schedules"),
          api.get("/device/status"),
        ]);

        const [statusRes, historyRes, schedulesRes, deviceStatusRes] =
          responses;

        setGateStatus(statusRes.data.status);
        setDeviceStatus(deviceStatusRes.data.isOnline);

        // Filter log hari ini dengan benar
        const today = new Date();
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0); // Awal hari ini 00:00:00
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999); // Akhir hari ini 23:59:59.999

        const todayLogs = historyRes.data.filter((entry) => {
          if (!entry.createdAt) return false;
          const entryDate = new Date(entry.createdAt);
          return entryDate >= todayStart && entryDate <= todayEnd;
        });

        setTodaysHistory(todayLogs);
        setAccessCountToday(todayLogs.length);

        // Filter jadwal hari ini
        const dayName = getDayNameForBackend();
        const todaySchedules = schedulesRes.data
          .filter((s) => s.dayOfWeek === dayName)
          .sort((a, b) => a.slot - b.slot);

        setSchedulesToday(todaySchedules);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh setiap 20 detik
    return () => clearInterval(interval);
  }, []);

  const handleControl = async (command) => {
    try {
      await api.post("/gate/control", { command });
      setGateStatus(command === "open" ? "open" : "closed");
    } catch (error) {
      console.error("Error controlling gate:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Tiga Kartu Status: Gerbang, Perangkat, Kontrol */}
      {/* HANYA SATU CONTROL PANEL DI SINI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="min-h-[18px]">
          <GateStatus status={gateStatus} />
        </div>
        <div className="min-h-[18px]">
          <DeviceStatus status={deviceStatus} />
        </div>
        <ControlPanel
          onControl={handleControl}
          status={gateStatus}
          deviceStatus={deviceStatus}
        />
      </div>

      {/* Dua Kartu Bawah: Akses Hari Ini dan Jadwal Hari Ini */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kartu: Akses Hari Ini */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Akses Hari Ini
          </h2>
          <p className="text-gray-700 mb-4">
            Hari ini ada <span className="font-medium">{accessCountToday}</span>{" "}
            total akses.
          </p>

          {todaysHistory.length > 0 ? (
            <RecentAccess data={todaysHistory} />
          ) : (
            <p className="text-gray-500">Belum ada akses hari ini.</p>
          )}
        </div>

        {/* Kartu: Jadwal Gerbang Hari Ini */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Jadwal Gerbang Hari Ini
          </h2>

          {schedulesToday.length === 0 ? (
            <div>
              <p className="text-gray-500 mb-2">
                Tidak ada jadwal untuk hari ini.
              </p>
              <p className="text-sm text-gray-400">
                Silakan tambahkan jadwal di halaman Jadwal.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedulesToday.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between p-3 border-b"
                >
                  <div>
                    <span className="font-medium">
                      {formatTime(schedule.startTime)} -{" "}
                      {formatTime(schedule.endTime)}
                    </span>
                    <span
                      className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        schedule.isOpen
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {schedule.isOpen ? "Buka" : "Tutup"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {schedule.slot === 1
                      ? "Pagi"
                      : schedule.slot === 2
                        ? "Siang"
                        : schedule.slot === 3
                          ? "Sore"
                          : "Malam"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
