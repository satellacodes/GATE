module.exports = (sequelize, DataTypes) => {
  const AccessLog = sequelize.define(
    "AccessLog",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      accessType: {
        type: DataTypes.ENUM("rfid", "button", "web"),
        allowNull: false,
      },
      direction: {
        type: DataTypes.ENUM("in", "out"),
        allowNull: false,
      },
      cardUid: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "access_logs",
      timestamps: true,
    },
  );

  return AccessLog;
};
