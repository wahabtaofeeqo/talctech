'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RentProperty extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      RentProperty.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    }
  };
  RentProperty.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    user_id: {
      allowNull: true,
      type: DataTypes.UUID
    },
    property_type: {
      allowNull: true,
      type: DataTypes.STRING
    },
    offer_type: {
      allowNull: true,
      type: DataTypes.STRING
    },
    price: {
      allowNull: true,
      type: DataTypes.STRING
    },
    city: {
      allowNull: true,
      type: DataTypes.STRING
    },
    neighbourhood: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    bedrooms: {
      allowNull: true,
      type: DataTypes.STRING
    },
    bathrooms: {
      allowNull: true,
      type: DataTypes.STRING
    },
    image_front: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    image_side: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    image_rear: {
      allowNull: true,
      type: DataTypes.TEXT
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
  }, {
    sequelize,
    modelName: 'RentProperty',
    timestamps: true,
    paranoid: true,
    tableName: 'rentproperties',
  });
  return RentProperty;
};