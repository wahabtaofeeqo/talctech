'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Booking.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });

      Booking.belongsTo(models.RentProperty, {
        foreignKey: 'property_id',
        as: 'property'
      })
    }
  };
  Booking.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    user_id: DataTypes.UUID,
    property_id: DataTypes.UUID
  }, 
  {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
  });
  return Booking;
};