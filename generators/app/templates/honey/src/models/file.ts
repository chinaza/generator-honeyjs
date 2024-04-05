import { DataTypes, Sequelize, createModel } from '@chinaza/honey';

export enum FileStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED'
}

export enum FileType {
  PDF = 'PDF',
  IMAGE = 'IMAGE'
}

export default function createFileModel() {
  const model = createModel(
    'file',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true
      },
      name: { type: DataTypes.STRING() },
      profileId: { type: DataTypes.STRING(), allowNull: false },
      provider: {
        type: DataTypes.ENUM('S3'),
        defaultValue: 'S3'
      },
      path: { type: DataTypes.STRING(), allowNull: false },
      status: {
        type: DataTypes.ENUM('PENDING', 'PROCESSED', 'FAILED'),
        defaultValue: FileStatus.PENDING
      },
      type: { type: DataTypes.STRING(), defaultValue: FileType.PDF },
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
      tableName: 'files'
    }
  );

  return model;
}
