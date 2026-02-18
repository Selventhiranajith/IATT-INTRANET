'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('HRPolicies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      category: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      content: {
        type: Sequelize.TEXT
      },
      doc_no: {
        type: Sequelize.STRING
      },
      version: {
        type: Sequelize.STRING
      },
      effective_date: {
        type: Sequelize.DATE
      },
      prepared_by: {
        type: Sequelize.STRING
      },
      approved_by: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      created_by: {
        type: Sequelize.INTEGER
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('HRPolicies');
  }
};