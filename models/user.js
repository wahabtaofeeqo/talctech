'use strict';
const {
  Model
} = require('sequelize');
const moment = require("moment");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Property, {
        foreignKey: "user_id",
        as: "property"
      });
      User.hasOne(models.TenantTerm, {
        foreignKey: 'tenant_id',
        as: 'tenant'
      });
      User.hasOne(models.LandlordTerm, {
        foreignKey: 'landlord_id',
        as: 'landlord'
      });
      User.hasMany(models.Pairing, {
        foreignKey: "tenant_id",
        as: "pairing"
      });
      User.hasMany(models.RentProperty, {
        foreignKey: "user_id",
        as: "rentproperty"
      });
      User.hasMany(models.Request, {
        foreignKey: "user_id",
        as: "user"
      });
      User.hasMany(models.Chat, {
        foreignKey: "sender_id",
        as: "sender"
      });
      User.hasMany(models.Payment, {
        foreignKey: 'user_id',
        as: 'payments'
      })
    }
  };
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
    },
    name: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    email: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    phone: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    password: {
      allowNull: true,
      type: DataTypes.STRING,
    }, 
    role_id: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    upgraded: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    suspended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    paired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    usertype: {
      allowNull: true,
      type: DataTypes.STRING
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      get() {
        return moment(this.getDataValue('createdAt')).format('YYYY-MM-DD HH:mm:ss');
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    timestamps: true,
    paranoid: true,
    tableName: 'users',
  });
  return User;
};