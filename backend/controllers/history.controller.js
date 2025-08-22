const db = require('../models');

exports.getAccessHistory = async (req, res) => {
  try {
    const history = await db.AccessLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json(history);
  } catch (error) {
    console.error('Error fetching access history:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
