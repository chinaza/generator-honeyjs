import { DataTypes, createModel, Sequelize } from '@chinaza/honey';
import createProfileModel from './profile';

export default function createCredentialModel() {
  const model = createModel(
    'credentials',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      firebaseId: { type: DataTypes.STRING() },
      profileId: {
        type: DataTypes.UUID,
        references: {
          key: 'id',
          model: createProfileModel()
        }
      },
      platform: DataTypes.TEXT,
      apiKey: DataTypes.STRING(1024),
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
      tableName: 'credentials'
    }
  );

  return model;
}
