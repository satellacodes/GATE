#include <MFRC522.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <PubSubClient.h>

// ===================== PIN CONFIG =====================
#define TRIG_PIN       12
#define ECHO_PIN       14
#define RFID_SS_PIN     5
#define RFID_RST_PIN   17
#define LED_RED         4
#define LED_GREEN      13
#define LED_BLUE       15
#define BUZZER_PIN     16

// Pin untuk Motor DC Tamiya
#define ENA_PIN        25  // PWM untuk kecepatan motor
#define IN1_PIN        26  // Kontrol arah 1
#define IN2_PIN        27  // Kontrol arah 2

// ===================== CONSTANTS =====================
const unsigned long GATE_OPEN_TIME     = 2000;    // Waktu buka gerbang 2 detik
const unsigned long GATE_CLOSE_TIME    = 2000;    // Waktu tutup gerbang 2 detik
const float CLOSE_DISTANCE             = 15.0;    // cm
const unsigned long PRESENCE_DELAY     = 3000;    // ms
const unsigned long HEARTBEAT_INTERVAL = 30000;   // ms
const unsigned long SENSOR_INTERVAL    = 2000;    // Baca sensor setiap 2 detik

// Kecepatan Motor (0-255)
const int MOTOR_SPEED = 150;  // Kecepatan motor yang lebih terkontrol

// ===================== MQTT & HTTP =====================
// THIS CERTIFICATE FROM MQTT platform
const char* root_ca = R"EOF(
-----BEGIN CERTIFICATE-----
I_LOVE_CHINA_<3
-----END CERTIFICATE-----
)EOF";

const char* mqtt_server   = "YOUR_MQTT_SERVER.s1.eu.hivemq.cloud";
const int   mqtt_port     = YOUR_MQTT_PORT;
const char* mqtt_user     = "YOUR_MQTT_USER";
const char* mqtt_pass     = "YOUR_MQTT_PASSWORD";
const char* status_topic  = "ponpes/gate/status";
const char* command_topic = "ponpes/gate/control";
const char* log_topic     = "ponpes/gate/logs";

// WiFi credentials
const char* ssid          = "bashbashAMBASHINHGGGG";
const char* password      = "prokprokprok";

WiFiClientSecure secureClient;
PubSubClient mqttClient(secureClient);

// ===================== RFID =====================
MFRC522 rfid(RFID_SS_PIN, RFID_RST_PIN);
const String authorizedCards[] = {"4C343A03", "18823595B91AC0", "08957c21"};
const size_t NUM_CARDS = sizeof(authorizedCards) / sizeof(authorizedCards[0]);

// ===================== STATE =====================
enum GateState { CLOSED, OPENING, OPEN, CLOSING };
GateState gateState    = CLOSED;
unsigned long actionStart = 0;
bool objectPresent     = false;
unsigned long lastPresence = 0;
unsigned long lastHeartbeat = 0;
unsigned long lastSensorRead = 0;

// Fungsi untuk mendapatkan deskripsi error MQTT
String getMqttError(int state) {
  switch (state) {
    case -4: return "Connection timeout";
    case -3: return "Connection lost";
    case -2: return "Connect failed";
    case -1: return "Disconnected";
    case 0: return "Connected";
    case 1: return "Bad protocol";
    case 2: return "Bad client ID";
    case 3: return "Unavailable";
    case 4: return "Bad credentials";
    case 5: return "Unauthorized";
    default: return "Unknown error";
  }
}

// Fungsi beep buzzer
void beepBuzzer(int times, int duration = 100) {
  for (int i = 0; i < times; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(duration);
    digitalWrite(BUZZER_PIN, LOW);
    if (i < times - 1) delay(duration); // Jeda antar beep
  }
}

// ===================== SETUP =====================
void setup() {
  Serial.begin(115200);
  Serial.println("Memulai inisialisasi...");
  
  // Nonaktifkan watchdog timer sementara
  disableCore0WDT();
  
  SPI.begin();
  rfid.PCD_Init();

  // Setup pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_BLUE, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Setup motor DC
  pinMode(ENA_PIN, OUTPUT);
  pinMode(IN1_PIN, OUTPUT);
  pinMode(IN2_PIN, OUTPUT);
  
  // Matikan motor saat awal
  digitalWrite(ENA_PIN, LOW);
  digitalWrite(IN1_PIN, LOW);
  digitalWrite(IN2_PIN, LOW);
  
  // Initial state: tutup
  gateState = CLOSED;
  
  // Initial LED state
  digitalWrite(LED_RED, HIGH);
  digitalWrite(LED_GREEN, LOW);

  // WiFi & MQTT
  Serial.println("Menghubungkan WiFi...");
  WiFi.begin(ssid, password);
  
  unsigned long wifiStart = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - wifiStart < 15000) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi terhubung");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    
    // Konfigurasi koneksi secure
    secureClient.setCACert(root_ca);
    secureClient.setTimeout(10000);
    
    mqttClient.setServer(mqtt_server, mqtt_port);
    mqttClient.setCallback(mqttCallback);
    mqttClient.setKeepAlive(60);
    mqttClient.setSocketTimeout(30);
  } else {
    Serial.println("\nGagal menghubungkan WiFi");
    Serial.print("Status WiFi: ");
    Serial.println(WiFi.status());
  }

  // Aktifkan kembali watchdog timer
  enableCore0WDT();
  Serial.println("Inisialisasi selesai");
}

// Fungsi untuk mengirim log
void sendLog(const String& message) {
  Serial.println("LOG: " + message);
  if (mqttClient.connected()) {
    mqttClient.publish(log_topic, message.c_str());
  }
}

// Callback untuk menerima pesan MQTT
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String topicStr = String(topic);
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  sendLog("MQTT diterima [" + topicStr + "]: " + message);

  // Proses perintah kontrol
  if (topicStr == command_topic) {
    if (message == "open") {
      sendLog("Menerima perintah BUKA gerbang");
      openGate();
    } 
    else if (message == "close") {
      sendLog("Menerima perintah TUTUP gerbang");
      closeGate();
    }
    else {
      sendLog("Perintah tidak dikenali: " + message);
    }
  }
}

// Manual ultrasonic distance reading
float readUltrasonicDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration <= 0) return 999.0;
  return duration * 0.034 / 2;
}

// ===================== LOOP =====================
void loop() {
  unsigned long currentMillis = millis();
  
  // Handle WiFi
  if (WiFi.status() != WL_CONNECTED) {
    static unsigned long lastWifiAttempt = 0;
    if (currentMillis - lastWifiAttempt > 10000) {
      Serial.println("Mencoba reconnect WiFi...");
      WiFi.disconnect();
      WiFi.reconnect();
      lastWifiAttempt = currentMillis;
    }
    delay(100);
    return;
  }

  // Handle MQTT
  if (!mqttClient.connected()) {
    static unsigned long lastMqttAttempt = 0;
    if (currentMillis - lastMqttAttempt > 5000) {
      Serial.println("Mencoba reconnect MQTT...");
      
      if (mqttClient.connect("ESP32Gate", mqtt_user, mqtt_pass)) {
        Serial.println("MQTT terhubung");
        mqttClient.subscribe(command_topic);
      } else {
        Serial.print("Gagal MQTT: ");
        Serial.println(getMqttError(mqttClient.state()));
      }
      lastMqttAttempt = currentMillis;
    }
  } else {
    mqttClient.loop();
  }

  // Baca sensor ultrasonik setiap 2 detik
  if (currentMillis - lastSensorRead >= SENSOR_INTERVAL) {
    lastSensorRead = currentMillis;
    checkDistance();
  }

  // Handle RFID
  handleRFID();
  
  // Update gate state dan motor
  updateGate();

  // Send heartbeat
  if (currentMillis - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeat = currentMillis;
  }

  delay(50);
}

// ===================== FUNCTIONS =====================
void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;
  
  HTTPClient http;
  http.begin("http://8.215.100.141:5000/api/device/heartbeat");
  http.addHeader("Content-Type", "application/json");
  
  String status;
  if (gateState == OPEN) status = "open";
  else if (gateState == CLOSED) status = "closed";
  else status = "moving";
  
  String payload = "{\"gate_status\":\"" + status + "\"}";
  
  http.setTimeout(3000);
  int httpCode = http.POST(payload);
  
  String logMsg = "Heartbeat ";
  if (httpCode == HTTP_CODE_OK) {
    logMsg += "berhasil";
  } else {
    logMsg += "gagal (" + String(httpCode) + ")";
  }
  sendLog(logMsg);
  
  http.end();
}

String getUID() {
  String uid;
  for (byte i = 0; i < rfid.uid.size; i++) {
    char buffer[3];
    sprintf(buffer, "%02X", rfid.uid.uidByte[i]);
    uid += buffer;
  }
  return uid;
}

bool isAuthorized(const String &uid) {
  for (size_t i = 0; i < NUM_CARDS; i++) {
    if (uid == authorizedCards[i]) return true;
  }
  return false;
}

void blinkLED(int pin, int times) {
  for(int i = 0; i < times; i++) {
    digitalWrite(pin, HIGH); 
    delay(100);
    digitalWrite(pin, LOW);  
    delay(100);
  }
}

void handleRFID() {
  if (!rfid.PICC_IsNewCardPresent()) return;
  if (!rfid.PICC_ReadCardSerial()) return;
  
  String uid = getUID(); 
  Serial.println("RFID terdeteksi: " + uid);
  
  if (isAuthorized(uid)) {
    Serial.println("Kartu terotorisasi. Membuka gerbang.");
    blinkLED(LED_BLUE, 2);
    openGate(); 
    objectPresent = true; 
    lastPresence = millis();
    if (mqttClient.connected()) {
      mqttClient.publish(status_topic, ("rfid:" + uid).c_str());
    }
  } else {
    Serial.println("Kartu tidak terotorisasi: " + uid);
    beepBuzzer(1); // Bunyikan buzzer 1 kali
    blinkLED(LED_RED, 2);
    if (mqttClient.connected()) {
      mqttClient.publish(status_topic, "denied");
    }
  }
  rfid.PICC_HaltA(); 
  rfid.PCD_StopCrypto1();
}

void openGate() {
  if (gateState != CLOSED && gateState != CLOSING) {
    sendLog("Gagal buka: Gerbang tidak dalam keadaan tertutup");
    return;
  }
  
  Serial.println("Membuka gerbang...");
  beepBuzzer(2, 80); // Bunyikan buzzer 2 kali cepat
  gateState = OPENING; 
  actionStart = millis();
  
  // Gerakkan motor CW untuk membuka gerbang
  digitalWrite(IN1_PIN, HIGH);
  digitalWrite(IN2_PIN, LOW);
  analogWrite(ENA_PIN, MOTOR_SPEED);
  
  if (mqttClient.connected()) {
    mqttClient.publish(status_topic, "opening");
  }
}

void closeGate() {
  if (gateState != OPEN && gateState != OPENING) {
    sendLog("Gagal tutup: Gerbang tidak dalam keadaan terbuka");
    return;
  }
  
  Serial.println("Menutup gerbang...");
  gateState = CLOSING; 
  actionStart = millis();
  
  // Gerakkan motor CCW untuk menutup gerbang
  digitalWrite(IN1_PIN, LOW);
  digitalWrite(IN2_PIN, HIGH);
  analogWrite(ENA_PIN, MOTOR_SPEED);
  
  if (mqttClient.connected()) {
    mqttClient.publish(status_topic, "closing");
  }
}

void checkDistance() {
  float distance = readUltrasonicDistance();
  Serial.print("Jarak: ");
  Serial.print(distance);
  Serial.println(" cm");
  
  unsigned long now = millis();
  
  if (distance > 0 && distance < CLOSE_DISTANCE) { 
    objectPresent = true; 
    lastPresence = now; 
    Serial.println("Objek terdeteksi dekat");
  }
  else if (objectPresent && (now - lastPresence >= PRESENCE_DELAY)) {
    objectPresent = false;
    Serial.println("Objek tidak terdeteksi lagi");
  }
  
  // Tutup gerbang jika tidak ada objek dan gerbang terbuka
  if (gateState == OPEN && !objectPresent) {
    Serial.println("Memulai penutupan gerbang karena tidak ada objek");
    closeGate();
  }
}

void updateGate() {
  unsigned long now = millis();
  
  // Update state setelah motor selesai bergerak
  if (gateState == OPENING && (now - actionStart >= GATE_OPEN_TIME)) { 
    Serial.println("Gerbang terbuka penuh");
    gateState = OPEN; 
    digitalWrite(LED_GREEN, HIGH); 
    digitalWrite(LED_RED, LOW);
    // Matikan motor
    analogWrite(ENA_PIN, 0);
    digitalWrite(IN1_PIN, LOW);
    digitalWrite(IN2_PIN, LOW);
    if (mqttClient.connected()) {
      mqttClient.publish(status_topic, "open");
    }
  }
  else if (gateState == CLOSING && (now - actionStart >= GATE_CLOSE_TIME)) { 
    Serial.println("Gerbang tertutup penuh");
    gateState = CLOSED; 
    digitalWrite(LED_RED, HIGH); 
    digitalWrite(LED_GREEN, LOW);
    // Matikan motor
    analogWrite(ENA_PIN, 0);
    digitalWrite(IN1_PIN, LOW);
    digitalWrite(IN2_PIN, LOW);
    if (mqttClient.connected()) {
      mqttClient.publish(status_topic, "closed");
    }
  }
}
