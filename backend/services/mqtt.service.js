const mqtt = require("mqtt");
const config = require("../config/mqtt.config");

const client = mqtt.connect(config.MQTT_BROKER_URL, {
  port: config.MQTT_PORT,
  username: config.MQTT_USERNAME,
  password: config.MQTT_PASSWORD,
});

client.on("connect", () => {
  console.log("Connected to MQTT Broker");
  client.subscribe(config.MQTT_STATUS_TOPIC);
});

client.on("message", (topic, message) => {
  console.log(`Received message on ${topic}: ${message.toString()}`);
  // Handle incoming messages (e.g., gate status updates)
});

const publishCommand = (command) => {
  return new Promise((resolve, reject) => {
    client.publish(config.MQTT_COMMAND_TOPIC, command, { qos: 1 }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = {
  publishCommand,
};
