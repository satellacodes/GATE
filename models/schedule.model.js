module.exports = (sequelize, DataTypes) => {
  const Schedule = sequelize.define(
    "Schedule",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      startTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      endTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      isOpen: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      dayOfWeek: {
        type: DataTypes.ENUM("mon", "tue", "wed", "thu", "fri", "sat", "sun"),
        allowNull: false,
      },
    },
    {
      tableName: "schedules",
      timestamps: true,
    },
  );

  return Schedule;
};
