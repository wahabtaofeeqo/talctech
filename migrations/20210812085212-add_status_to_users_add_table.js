'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
     return Promise.all([
       queryInterface.addColumn(
         'Users',
         'status',
         {
           type: Sequelize.BOOLEAN,
           defaultValue: false
         })
      ]
    );
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Users', 'status')])
  }
};
