"use strict";
module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define("Group", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: DataTypes.STRING,
    slug: { type: DataTypes.STRING, unique: true },
    description: DataTypes.TEXT,
    color: DataTypes.STRING,
    icon: DataTypes.STRING,
  });

  Group.associate = (models) => {
    Group.belongsToMany(models.User, {
      through: "UserGroups",
      as: "members",
      foreignKey: "group_id",
      otherKey: "user_id",
    });

    Group.hasMany(models.Task, { foreignKey: "group_id", as: "tasks" });

    Group.hasMany(models.Message, {
      foreignKey: "group_id",
      as: "messages",
    });
  };

  return Group;
};
