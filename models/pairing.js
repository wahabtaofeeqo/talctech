'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pairing extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Pairing.belongsTo(models.Property, {
        foreignKey: "property_id",
        as: "property",
      });

      Pairing.belongsTo(models.User, {
        foreignKey: "tenant_id",
        as: "tenant",
      });

      Pairing.belongsTo(models.User, {
        foreignKey: "landlord_id",
        as: "landlord",
      });
    }
  };
  
  Pairing.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    tenant_id: {
      allowNull: true,
      type: DataTypes.UUID
    },
    landlord_id: {
      allowNull: true,
      type: DataTypes.UUID
    },
    property_id: {
      allowNull: true,
      type: DataTypes.UUID
    },
  }, {
    sequelize,
    modelName: 'Pairing',
    timestamps: true,
    tableName: 'pairings',
  });
  return Pairing;
};