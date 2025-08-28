module.exports = (sequelize, DataTypes) => {
  const Schedule = sequelize.define('Schedule', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    dayOfWeek: {
      type: DataTypes.ENUM('senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'),
      allowNull: false
    },
    slot: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    isOpen: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    tableName: 'schedules',
    timestamps: true
  });

  return Schedule;
};
