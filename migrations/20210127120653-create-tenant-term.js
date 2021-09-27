'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TenantTerms', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
      },
      tenant_id: {
        allowNull: true,
        type: Sequelize.UUID,
      },
      pets: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      employed: {
        allowNull: true,
        type: Sequelize.STRING
      },
      income: {
        allowNull: true,
        type: Sequelize.STRING
      },
      professional: {
        allowNull: true,
        type: Sequelize.STRING
      },
      smoker: {
        allowNull: true,
        type: Sequelize.STRING
      },
      married: {
        allowNull: true,
        type: Sequelize.STRING
      },
      party: {
        allowNull: true,
        type: Sequelize.STRING
      },
      house_party: {
        allowNull: true,
        type: Sequelize.STRING
      },
      religious: {
        allowNull: true,
        type: Sequelize.STRING
      },
      children: {
        allowNull: true,
        type: Sequelize.STRING
      },
      drinker: {
        allowNull: true,
        type: Sequelize.STRING
      },
      music_tv_level: {
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
    await queryInterface.dropTable('TenantTerms');
  }
};