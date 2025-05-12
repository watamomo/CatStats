// models/UserGroups.js
"use strict";
module.exports = (sequelize, DataTypes) => {
  const UserGroups = sequelize.define("UserGroups", {}, {});

  return UserGroups;
};
