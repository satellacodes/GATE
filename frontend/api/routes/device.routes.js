const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');

router.post('/heartbeat', deviceController.updateDeviceStatus);
router.get('/status', deviceController.getDeviceStatus);

module.exports = router;
