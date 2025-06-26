const mqttService = require("../services/mqtt.service");
const db = require("../models");
const { MQTT_LOG_TOPIC } = require("../config/mqtt.config");

exports.controlGate = async (req, res) => {
  try {
    const { command } = req.body;

    // Send command via MQTT
    await mqttService.publishCommand(command);

    // Log the action
    await db.AccessLog.create({
      accessType: "web",
      direction: command === "open" ? "in" : "out",
      userName: req.user.username,
    });

    res.json({ message: `Gate ${command} command sent` });
  } catch (error) {
    console.error("Gate control error:", error);
    res.status(500).json({ message: "Failed to control gate" });
  }
};

exports.getGateStatus = async (req, res) => {
  try {
    // In real app, this would come from MQTT or DB
    res.json({ status: "closed" });
  } catch (error) {
    console.error("Get status error:", error);
    res.status(500).json({ message: "Failed to get status" });
  }
};
