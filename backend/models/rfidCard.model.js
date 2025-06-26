module.exports = (sequelize, DataTypes) => {
  const RfidCard = sequelize.define(
    "RfidCard",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      uid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      ownerName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "rfid_cards",
      timestamps: true,
    },
  );

  return RfidCard;
};
