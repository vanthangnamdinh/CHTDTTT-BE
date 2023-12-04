const sequelize = require("./db");
const DataTypes = require("sequelize");

const monan = sequelize.define(
  "monan",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
    },

    tenMonAn: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    loai: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    kalo: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gia: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      default: new Date(),
    },
    updatedAt: {
      type: DataTypes.DATE,
      default: new Date(),
    },
  },
  {
    // For the sake of clarity we specify our indexes
    indexes: [{ unique: true, fields: ["id"] }],
  }
);

// `sequelize.define` also returns the model
console.log(monan === sequelize.models.monan); // true

module.exports = {
  monan,
  sequelize,
};
