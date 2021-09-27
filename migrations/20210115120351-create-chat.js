'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Chats', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
      },
      sender_id: {
        allowNull: true,
        type: Sequelize.UUID,
      },
      receiver_id: {
        allowNull: true,
        type: Sequelize.UUID,
      },
      property_id: {
        allowNull: true,
        type: Sequelize.UUID,
      },
      message: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      read_status: {
        allowNull: true,
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
    await queryInterface.dropTable('Chats');
  }
};