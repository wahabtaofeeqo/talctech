'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Property extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Property.hasMany(models.Pairing, {
        foreignKey: "property_id",
        as: "pairing"
      });
      Property.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
      Property.hasMany(models.Request, {
        foreignKey: "property_id",
        as: "request"
      });
      Property.hasMany(models.Chat, {
        foreignKey: "property_id",
        as: "chat"
      });
    }
  };
  Property.init({
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
    modelName: 'Property',
    timestamps: true,
    paranoid: true,
    tableName: 'properties',
  });
  return Property;
};