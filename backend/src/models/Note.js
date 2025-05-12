module.exports = (sequelize, DataTypes) => {
    const Note = sequelize.define("Note", {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    });
  
    Note.associate = (models) => {
      Note.belongsTo(models.User);
      Note.belongsTo(models.Task);
    };
  
    return Note;
  };

  