require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./models");
const bcrypt = require("bcryptjs");
const app = express();

const corsOptions = {
  origin: [
    "https://ambatukammmmmmBUKBUBKUBK.vercel.app", // Domain frontend Vercel
    "http://localhost:3000", // yor local production
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Authorization"],
  credentials: true,
};

app.use((req, res, next) => {
  console.log("→ Request from origin:", req.headers.origin);
  next();
});

app.use(cors(corsOptions));

app.use(express.json());

db.sequelize
  .authenticate()
  .then(async () => {
    console.log("Database connected");
    await db.sequelize.sync({ force: false });

    const adminCount = await db.Admin.count();
    if (adminCount === 0) {
      const hashedPassword = bcrypt.hashSync("admin123", 10);
      await db.Admin.create({
        username: "admin",
        password: hashedPassword,
      });
      console.log("Default admin created: username=admin, password=admin123");
    }
  })
  .catch((err) => console.error("Database connection error:", err));

const initSchedules = async () => {
  const scheduleCount = await db.Schedule.count();

  if (scheduleCount === 0) {
    const days = [
      "senin",
      "selasa",
      "rabu",
      "kamis",
      "jumat",
      "sabtu",
      "minggu",
    ];
    const defaultSchedules = [];

    days.forEach((day) => {
      defaultSchedules.push({
        dayOfWeek: day,
        slot: 1,
        startTime: "06:00:00",
        endTime: "12:00:00",
        isOpen: true,
      });
      defaultSchedules.push({
        dayOfWeek: day,
        slot: 2,
        startTime: "12:00:00",
        endTime: "14:00:00",
        isOpen: false,
      });
      defaultSchedules.push({
        dayOfWeek: day,
        slot: 3,
        startTime: "14:00:00",
        endTime: "18:00:00",
        isOpen: true,
      });
      defaultSchedules.push({
        dayOfWeek: day,
        slot: 4,
        startTime: "18:00:00",
        endTime: "06:00:00",
        isOpen: false,
      });
    });

    await db.Schedule.bulkCreate(defaultSchedules);
    console.log("Default schedules created");
  }
};

initSchedules();

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/gate", require("./routes/gate.routes"));
app.use("/api/history", require("./routes/history.routes"));
app.use("/api/device", require("./routes/device.routes"));
app.use("/api/schedules", require("./routes/schedule.routes"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
