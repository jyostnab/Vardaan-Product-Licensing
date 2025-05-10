
module.exports = (sequelize, DataTypes) => {
  const License = sequelize.define("license", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    product_version_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    license_type: {
      type: DataTypes.ENUM('date_based', 'user_count_based', 'mac_based', 'country_based', 'mixed'),
      allowNull: false
    },
    license_scope: {
      type: DataTypes.ENUM('international', 'local'),
      allowNull: false
    },
    licensing_period: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    renewable_alert_message: {
      type: DataTypes.STRING,
      allowNull: true
    },
    grace_period_days: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    expiry_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    max_users_allowed: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    current_users: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true,
    underscored: true
  });

  return License;
};
