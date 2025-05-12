'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Messages", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID, 
        defaultValue: Sequelize.UUIDV4,  
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      sender_id: {
        type: Sequelize.UUID, 
        allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE",
      },
      group_id: {
        type: Sequelize.UUID, 
        allowNull: false,
        references: { model: "Groups", key: "id" },
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,  
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,  
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Messages");
  },
};
