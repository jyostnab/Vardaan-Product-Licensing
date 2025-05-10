
module.exports = (sequelize, DataTypes) => {
  const LicenseAllowedCountry = sequelize.define("license_allowed_country", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    license_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    country_code: {
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

  return LicenseAllowedCountry;
};
