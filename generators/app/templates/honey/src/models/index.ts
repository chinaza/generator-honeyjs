import createCredentialModel from './credentials';
import createFileModel from './file';
import createProfileModel from './profile';

export default function initModels() {
  const credentialModel = createCredentialModel();
  const profileModel = createProfileModel();
  const fileModel = createFileModel();

  credentialModel.belongsTo(profileModel, { foreignKey: 'profileId' });
  fileModel.belongsTo(profileModel, { foreignKey: 'profileId' });
}
