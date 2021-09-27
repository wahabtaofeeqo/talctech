'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Renter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Renter.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      })
    }
  };
  Renter.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    user_id: {
      allowNull: false,
      type: DataTypes.UUID,
    },
    tenant_income: DataTypes.INTEGER,
    drinker: DataTypes.INTEGER,
    smoker: DataTypes.INTEGER,
    electricity: DataTypes.INTEGER,
    tenant_employment: DataTypes.BOOLEAN,
    professionals: DataTypes.BOOLEAN,
    preferences: DataTypes.BOOLEAN
  }, 
  {
    sequelize,
    modelName: 'Renter',
    tableName: 'renters',
  });
  return Renter;
};