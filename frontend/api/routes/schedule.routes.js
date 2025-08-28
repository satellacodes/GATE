const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const scheduleController = require('../controllers/schedule.controller');

router.use(authMiddleware);
router.get('/', scheduleController.getSchedules);
router.post('/', scheduleController.createSchedule);
router.put('/', scheduleController.updateSchedules);
router.delete('/:id', scheduleController.deleteSchedule);


module.exports = router;
