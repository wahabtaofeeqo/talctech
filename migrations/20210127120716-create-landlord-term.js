'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('LandlordTerms', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
      },
      landlord_id: {
        allowNull: true,
        type: Sequelize.UUID,
      },
      tenant_employment: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      tenant_income: {
        allowNull: true,
        type: Sequelize.STRING
      },
      professionals: {
        allowNull: true,
        type: Sequelize.STRING
      },
      preference: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      smoker: {
        allowNull: true,
        type: Sequelize.STRING
      },
      drinker: {
        allowNull: true,
        type: Sequelize.STRING
      },
      electricity: {
        allowNull: true,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('LandlordTerms');
  }
};