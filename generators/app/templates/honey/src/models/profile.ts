import { DataTypes, createModel, Sequelize } from '@chinaza/honey';

export default function createProfileModel() {
  const model = createModel(
    'profile',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      firebaseId: { type: DataTypes.STRING(), allowNull: false, unique: true },
      name: { type: DataTypes.STRING() },
      email: { type: DataTypes.STRING(), allowNull: true, unique: true },
      hasOnboarded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    },
    {
      tableName: 'profile'
    }
  );

  return model;
}
