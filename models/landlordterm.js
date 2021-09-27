'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LandlordTerm extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LandlordTerm.belongsTo(models.User, {
        foreignKey: 'landlord_id',
        as: 'user'
      })
    }
  };
  LandlordTerm.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    landlord_id: {
      allowNull: true,
      type: DataTypes.UUID,
    },
    tenant_employment: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    tenant_income: {
      allowNull: false,
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    professionals: {
      allowNull: true,
      type: DataTypes.STRING
    },
    preference: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    smoker: {
      allowNull: true,
      type: DataTypes.STRING
    },
    drinker: {
      allowNull: true,
      type: DataTypes.STRING
    },
    electricity: {
      allowNull: true,
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    modelName: 'LandlordTerm',
    timestamps: true,
    paranoid: true,
    tableName: 'landlordterms',
  });
  return LandlordTerm;
};