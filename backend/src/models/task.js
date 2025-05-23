module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define("Task", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    status: {
      type: DataTypes.ENUM("pendiente", "en progreso", "completado"),
      defaultValue: "pendiente",
    },
  });

  Task.associate = (models) => {
    Task.belongsTo(models.User, {
      foreignKey: "assigned_to",
      as: "assignedUser",
    });

    Task.belongsTo(models.Group, {
      foreignKey: "group_id",
      as: "group",
    });

    Task.hasMany(models.Comment, {
      foreignKey: "task_id",
      as: "comments",
    });

    Task.hasMany(models.Note, {
      foreignKey: "task_id",
      as: "notes",
    });
  };

  return Task;
};
