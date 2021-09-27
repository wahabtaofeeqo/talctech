'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PropertyVideo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  PropertyVideo.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING
    },
    description: {
      allowNull: true,
      type: DataTypes.STRING
    },
    user_id: {
      allowNull: true,
      type: DataTypes.UUID
    },
    request_id: {
      allowNull: true,
      type: DataTypes.UUID
    },
    filename: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'PropertyVideo',
    tableName: 'propertyvideos',
  });
  return PropertyVideo;
};