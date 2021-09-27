'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Renters', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1
      },
      user_id: {
        allowNull: false,
        type: Sequelize.UUID,
      },
      tenant_income: {
        type: Sequelize.INTEGER
      },
      tenant_employment: {
        type: Sequelize.BOOLEAN,
      },
      drinker: {
        type: Sequelize.INTEGER
      },
      smoker: {
        type: Sequelize.INTEGER
      },
      electricity: {
        type: Sequelize.INTEGER
      },
      professionals: {
        type: Sequelize.BOOLEAN
      },
      preferences: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Renters');
  }
};