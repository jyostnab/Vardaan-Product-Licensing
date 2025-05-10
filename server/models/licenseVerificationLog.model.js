
module.exports = (sequelize, DataTypes) => {
  const LicenseVerificationLog = sequelize.define("license_verification_log", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    license_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    is_valid: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mac_address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    device_info: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    verification_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true,
    underscored: true
  });

  return LicenseVerificationLog;
};
