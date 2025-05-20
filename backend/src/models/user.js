"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class User extends Model { }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    }

  }, {
    sequelize,
    modelName: "User",
  });


  User.associate = (models) => {
    User.belongsToMany(models.Group, {
      through: "UserGroups",
      as: "groups",
      foreignKey: "user_id",
      otherKey: "group_id",
    });

    User.hasMany(models.Task, { foreignKey: "assigned_to", as: "assignedTasks" });
    User.hasMany(models.Comment, { foreignKey: "user_id", as: "comments" });
    User.hasMany(models.Note, { foreignKey: "user_id", as: "notes" });
    User.hasMany(models.Notification, { foreignKey: "user_id", as: "notifications" });
    User.hasMany(models.Message, { foreignKey: "sender_id", as: "messages" });
  };

  return User;
};
