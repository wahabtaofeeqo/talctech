'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Payment.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      })
    }
  };
  Payment.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    tx_ref: {
      type: DataTypes.STRING
    },
    tx_id: {
      type: DataTypes.NUMBER
    },
    amount: {
      type: DataTypes.NUMBER
    },
    user_id: {
      type: DataTypes.UUID
    }
  }, 
  {
    sequelize,
    modelName: 'Payment',
    tableName: 'payments',
  });
  return Payment;
};