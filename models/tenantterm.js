'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TenantTerm extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      TenantTerm.belongsTo(models.User, {
        foreignKey: 'tenant_id',
        as: 'user'
      })
    }
  };
  TenantTerm.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    tenant_id: {
      allowNull: true,
      type: DataTypes.UUID,
    },
    pets: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    employed: {
      allowNull: true,
      type: DataTypes.STRING
    },
    income: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    professional: {
      allowNull: true,
      type: DataTypes.STRING
    },
    smoker: {
      allowNull: true,
      type: DataTypes.STRING
    },
    married: {
      allowNull: true,
      type: DataTypes.STRING
    },
    party: {
      allowNull: true,
      type: DataTypes.STRING
    },
    house_party: {
      allowNull: true,
      type: DataTypes.STRING
    },
    religious: {
      allowNull: true,
      type: DataTypes.STRING
    },
    children: {
      allowNull: true,
      type: DataTypes.STRING
    },
    drinker: {
      allowNull: true,
      type: DataTypes.STRING
    },
    music_tv_level: {
      allowNull: true,
      type: DataTypes.STRING
    },
    electricity: {
      allowNull: true,
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    modelName: 'TenantTerm',
    timestamps: true,
    paranoid: true,
    tableName: 'tenantterms',
  });
  return TenantTerm;
};