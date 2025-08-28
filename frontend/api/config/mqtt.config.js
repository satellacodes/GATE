module.exports = {
  MQTT_BROKER_URL: process.env.MQTT_BROKER_URL,
  MQTT_PORT: parseInt(process.env.MQTT_PORT),
  MQTT_USERNAME: process.env.MQTT_USERNAME,
  MQTT_PASSWORD: process.env.MQTT_PASSWORD,
  MQTT_STATUS_TOPIC: process.env.MQTT_STATUS_TOPIC,
  MQTT_COMMAND_TOPIC: process.env.MQTT_COMMAND_TOPIC,
  MQTT_LOG_TOPIC: process.env.MQTT_LOG_TOPIC,
};
