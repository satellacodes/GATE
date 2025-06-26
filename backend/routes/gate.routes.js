const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const gateController = require("../controllers/gate.controller");

router.use(authMiddleware);
router.post("/control", gateController.controlGate);
router.get("/status", gateController.getGateStatus);

module.exports = router;
