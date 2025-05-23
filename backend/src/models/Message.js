module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define("Message", {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    group_id: {
      type: DataTypes.UUID,
      allowNull: false,
    }
  }, {
    timestamps: true,
  });

  Message.associate = (models) => {
    Message.belongsTo(models.User, {
      foreignKey: "sender_id",
      as: "sender",
    });

    Message.belongsTo(models.Group, {
      foreignKey: "group_id",
      as: "group",
    });
  };

  return Message;
};
