---
# ESP32 Firmware
GateKeeper IoT Hardware Controller

This directory contains firmware for the **ESP32** used to control and monitor the gate system.
---

## 🧠 Firmware Responsibilities

- Measure distance using ultrasonic sensor
- Capture image via ESP32-CAM
- Send data to backend via Wi-Fi
- Receive authorization response
- Activate gate motor
- Report gate status

---

## 🔧 Hardware Requirements

- ESP32 (Gen 1)
- ESP32-CAM (optional but recommended)
- Ultrasonic Sensor (HC-SR04)
- Motor Driver (L298N or equivalent)
- DC Motor
- External power supply

---

## 🛠 Flashing Methods

### Option 1️⃣ Arduino IDE (Recommended for beginners)

#### Setup

1. Install **Arduino IDE**
2. Add ESP32 board support:
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
3. Install board via **Boards Manager**
4. Select correct board and COM port

#### Flashing

1. Open firmware `.ino` file
2. Configure:

- WiFi SSID & Password
- Backend API / MQTT Broker

3. Click **Upload**

---

### Option 2️⃣ ESP-IDF (Production)

```bash
idf.py set-target esp32
idf.py menuconfig
idf.py build
idf.py flash monitor
```

### Option 3️⃣ esptool.py (Binary Flash)

```bash
esptool.py --chip esp32 --port /dev/ttyUSB0 write_flash -z 0x1000 firmware.bin
```

### ⚙️ Configuration Example

```bash
#define WIFI_SSID "your_wifi"
#define WIFI_PASSWORD "your_password"
#define BACKEND_URL "http://your-backend-ip/api/esp"
#define DEVICE_ID "gate-esp32-01"
```

### ⚠️ Important Notes

- Do not power motors directly from ESP32
- Use logic level shifter for ultrasonic sensor echo pin
- Secure firmware credentials before production
- OTA update is recommended for future improvements

### 📡 Communication

- Protocol: HTTP / MQTT
- Data Sent:
  - Distance
  - Image
  - Device ID
- Data Received:
  - Authorization result
  - Gate control command
