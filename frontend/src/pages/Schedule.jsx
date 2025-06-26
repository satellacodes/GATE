import React, { useState, useEffect } from "react";
import api from "../services/api";

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    dayOfWeek: "senin",
    slot: 1,
    startTime: "08:00",
    endTime: "17:00",
    isOpen: true,
  });
  const [loading, setLoading] = useState(true);
  const [scheduleGroups, setScheduleGroups] = useState([]);

  // Urutan hari yang benar
  const dayOrder = [
    "senin",
    "selasa",
    "rabu",
    "kamis",
    "jumat",
    "sabtu",
    "minggu",
  ];

  // Mapping nama hari
  const dayNames = {
    senin: "Senin",
    selasa: "Selasa",
    rabu: "Rabu",
    kamis: "Kamis",
    jumat: "Jumat",
    sabtu: "Sabtu",
    minggu: "Minggu",
  };

  // Mapping nama slot
  const slotNames = {
    1: "Pagi (06:00-12:00)",
    2: "Siang (12:00-14:00)",
    3: "Sore (14:00-18:00)",
    4: "Malam (18:00-06:00)",
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Fungsi untuk mengambil data jadwal
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await api.get("/schedules");
      setSchedules(response.data);
      groupSchedules(response.data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      alert(
        "Gagal memuat jadwal: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk mengelompokkan jadwal berdasarkan hari
  const groupSchedules = (schedules) => {
    const grouped = dayOrder.map((day) => ({
      day,
      slots: schedules
        .filter((s) => s.dayOfWeek === day)
        .sort((a, b) => a.slot - b.slot),
    }));

    setScheduleGroups(grouped);
  };

  // Handler untuk menyimpan perubahan
  const handleSave = async () => {
    try {
      // Hanya kirim data yang diperlukan
      const payload = schedules.map((s) => ({
        id: s.id,
        startTime: s.startTime,
        endTime: s.endTime,
        isOpen: s.isOpen,
      }));

      // Gunakan PUT request
      await api.put("/schedules", { schedules: payload });

      alert("Jadwal berhasil disimpan!");
      fetchSchedules();
    } catch (error) {
      console.error("Error saving schedules:", error);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message;

      alert(`Gagal menyimpan jadwal: ${errorMessage}`);
    }
  };

  // Handler untuk membuat jadwal baru
  const handleCreate = async () => {
    try {
      await api.post("/schedules", newSchedule);
      alert("Jadwal berhasil ditambahkan!");
      setNewSchedule({
        dayOfWeek: "senin",
        slot: 1,
        startTime: "08:00",
        endTime: "17:00",
        isOpen: true,
      });
      fetchSchedules();
    } catch (error) {
      console.error("Error creating schedule:", error);
      alert(
        "Gagal menambahkan jadwal: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  // Handler untuk menghapus jadwal
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) {
      try {
        await api.delete(`/schedules/${id}`);
        alert("Jadwal berhasil dihapus!");
        fetchSchedules();
      } catch (error) {
        console.error("Error deleting schedule:", error);
        alert(
          "Gagal menghapus jadwal: " +
            (error.response?.data?.message || error.message),
        );
      }
    }
  };

  // Fungsi untuk memperbarui jadwal di state
  const updateSchedule = (id, field, value) => {
    const updatedSchedules = schedules.map((sched) =>
      sched.id === id ? { ...sched, [field]: value } : sched,
    );

    setSchedules(updatedSchedules);
    groupSchedules(updatedSchedules);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Manajemen Jadwal Gerbang
        </h1>
      </div>

      {/* Form Tambah Jadwal Baru */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Tambah Jadwal Baru</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hari
            </label>
            <select
              value={newSchedule.dayOfWeek}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, dayOfWeek: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {dayOrder.map((day) => (
                <option key={day} value={day}>
                  {dayNames[day]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slot Waktu
            </label>
            <select
              value={newSchedule.slot}
              onChange={(e) =>
                setNewSchedule({
                  ...newSchedule,
                  slot: parseInt(e.target.value),
                })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {Object.entries(slotNames).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mulai
            </label>
            <input
              type="time"
              value={newSchedule.startTime}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, startTime: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selesai
            </label>
            <input
              type="time"
              value={newSchedule.endTime}
              onChange={(e) =>
                setNewSchedule({ ...newSchedule, endTime: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={newSchedule.isOpen}
              onChange={(e) =>
                setNewSchedule({
                  ...newSchedule,
                  isOpen: e.target.value === "true",
                })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="true">Buka</option>
              <option value="false">Tutup</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tambah Jadwal
          </button>
        </div>
      </div>

      {/* Daftar Jadwal per Kelompok Hari */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Daftar Jadwal</h2>
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Simpan Perubahan
          </button>
        </div>

        {/* Tampilkan per kelompok hari */}
        {scheduleGroups.map((group) => (
          <div key={group.day} className="mb-8">
            <h3 className="text-lg font-semibold mb-4 pb-2 border-b">
              {dayNames[group.day]}
            </h3>

            {group.slots.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slot
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mulai
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Selesai
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {group.slots.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {slotNames[schedule.slot] || `Slot ${schedule.slot}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) =>
                              updateSchedule(
                                schedule.id,
                                "startTime",
                                e.target.value,
                              )
                            }
                            className="border rounded p-1 w-full max-w-[120px]"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="time"
                            value={schedule.endTime}
                            onChange={(e) =>
                              updateSchedule(
                                schedule.id,
                                "endTime",
                                e.target.value,
                              )
                            }
                            className="border rounded p-1 w-full max-w-[120px]"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={schedule.isOpen}
                            onChange={(e) =>
                              updateSchedule(
                                schedule.id,
                                "isOpen",
                                e.target.value === "true",
                              )
                            }
                            className="border rounded p-1"
                          >
                            <option value="true">Buka</option>
                            <option value="false">Tutup</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">
                Tidak ada jadwal untuk {dayNames[group.day]}.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
