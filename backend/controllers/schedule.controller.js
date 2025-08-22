const db = require('../models');
const { Schedule, Sequelize } = db;

const DAY_ORDER = ['senin','selasa','rabu','kamis','jumat','sabtu','minggu'];

exports.getSchedules = async (req, res) => {
  try {
     const schedules = await Schedule.findAll({
      order: [
        [
          Sequelize.literal(`
            array_position(
              ARRAY['${DAY_ORDER.join("','")}']::text[],
              "dayOfWeek"::text
            )
          `),
          'ASC'
        ],
        ['slot', 'ASC']
      ]
    });
       res.json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.updateSchedules = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { schedules } = req.body;
    if (!schedules || !Array.isArray(schedules)) {
      return res.status(400).json({ message: 'Invalid request format' });
    }
    
    
    for (const schedule of schedules) {
      if (!schedule.id) {
        throw new Error("Missing schedule ID");
      }

      await db.Schedule.update(
        {
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isOpen: schedule.isOpen
        },
        {
          where: { id: schedule.id },
          transaction
        }
      );
    }
    
    await transaction.commit();
    res.json({ message: 'Schedules updated successfully' });
  } catch (error) {
    await transaction.rollback();
    console.error('Error updating schedules:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const newSchedule = await db.Schedule.create(req.body);
    res.status(201).json(newSchedule);
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    await db.Schedule.destroy({ where: { id } });
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

