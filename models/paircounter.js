'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PairCounter extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      PairCounter.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      })
    }
  };
  PairCounter.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    count: {
      type: DataTypes.NUMBER
    },
    dated: {
      type: DataTypes.DATEONLY
    }
  },
  {
    sequelize,
    tableName: 'paircounters',
    modelName: 'PairCounter',
  });
  return PairCounter;
};