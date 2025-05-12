module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define("Notification", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("comment", "team_created", "user_added", "task_created"),
        allowNull: false,
      },
      read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    });
  
    Notification.associate = (models) => {
      Notification.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
    };
  
    return Notification;
  };
  