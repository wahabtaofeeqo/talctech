'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Survey extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Survey.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Survey.belongsTo(models.RentProperty, {
        foreignKey: 'property_id',
        as: 'property'
      })
    }
  };
  Survey.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
    },
    user_id: DataTypes.UUID,
    property_id: DataTypes.UUID,
    answer1: DataTypes.TEXT,
    answer2: DataTypes.TEXT,
    answer3: DataTypes.TEXT,
    answer4: DataTypes.TEXT
  }, 
  {
    sequelize,
    modelName: 'Survey',
    tableName: 'surveys',
  });
  return Survey;
};