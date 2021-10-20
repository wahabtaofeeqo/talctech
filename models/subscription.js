'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Subscription.belongsTo(models.Plan, {
        foreignKey: 'plan_id',
        as: 'plan'
      });

      Subscription.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      })
    }
  };
  Subscription.init({
    plan_id: DataTypes.STRING,
    user_id: DataTypes.UUID,
    sub_id: DataTypes.STRING,
    email_token: DataTypes.STRING
  }, {
    sequelize,
    timestamps: true,
    modelName: 'Subscription',
  });
  return Subscription;
};