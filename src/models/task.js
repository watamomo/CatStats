'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Task extends Model {}

  Task.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      assignedUserId: {  // Columna de usuario asignado
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
    },
    {
      sequelize,
      modelName: 'Task',
      tableName: 'Tasks',
      timestamps: true,
    }
  );

  // Relación entre Task y User (asignado a un usuario)
  Task.associate = function (models) {
    Task.belongsTo(models.User, { foreignKey: 'assignedUserId', as: 'assignedUser' });
    Task.belongsTo(models.User, { foreignKey: 'userId', as: 'creator' }); // Relación con el creador de la tarea
  };

  return Task;
};
