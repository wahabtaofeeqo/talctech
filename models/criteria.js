'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Criteria extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Criteria.init({
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
      type: DataTypes.STRING
    },
    bedrooms: {
      allowNull: true,
      type: DataTypes.STRING
    },
    bathrooms: {
      allowNull: true,
      type: DataTypes.STRING
    },
  }, {
    sequelize,
    modelName: 'Criteria',
    timestamps: true,
    paranoid: true,
    tableName: 'criteria',
  });
  return Criteria;
};