require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./models");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
db.sequelize
  .authenticate()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection error:", err));

// Sync models (remove force:true in production)
db.sequelize
  .sync({ force: false })
  .then(() => console.log("Database synced"))
  .catch((err) => console.error("Database sync error:", err));

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/gate", require("./routes/gate.routes"));
app.use("/api/history", require("./routes/history.routes"));
app.use("/api/schedules", require("./routes/schedule.routes"));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
