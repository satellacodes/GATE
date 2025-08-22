const deviceStatus = {
  lastHeartbeat: null,
  isOnline: false
};

exports.updateDeviceStatus = (req, res) => {
  deviceStatus.lastHeartbeat = new Date();
  deviceStatus.isOnline = true;
  res.status(200).json({ message: 'Heartbeat received' });
};

exports.getDeviceStatus = (req, res) => {
  const now = new Date();
  if (deviceStatus.lastHeartbeat && (now - deviceStatus.lastHeartbeat) > 60000) {
    deviceStatus.isOnline = false;
  }
  
  res.json({ 
    isOnline: deviceStatus.isOnline,
    lastHeartbeat: deviceStatus.lastHeartbeat
  });
};

setInterval(() => {
  const now = new Date();
  if (deviceStatus.lastHeartbeat && (now - deviceStatus.lastHeartbeat) > 60000) {
    deviceStatus.isOnline = false;
    console.log('Device status changed to offline');
  }
}, 60000);
