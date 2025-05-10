
module.exports = (sequelize, DataTypes) => {
  const LicenseMacAddress = sequelize.define("license_mac_address", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    license_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    mac_address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true,
    underscored: true
  });

  return LicenseMacAddress;
};
