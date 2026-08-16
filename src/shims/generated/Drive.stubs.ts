import { GasPNotImplementedError } from '../../errors.js';

export abstract class DriveStubs {
  newChannel(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newChannel');
  }
  newComment(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newComment');
  }
  newCommentQuotedFileContent(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newCommentQuotedFileContent');
  }
  newContentRestriction(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newContentRestriction');
  }
  newDrive(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newDrive');
  }
  newDriveBackgroundImageFile(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newDriveBackgroundImageFile');
  }
  newDriveCapabilities(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newDriveCapabilities');
  }
  newDriveRestrictions(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newDriveRestrictions');
  }
  newFile(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newFile');
  }
  newFileCapabilities(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newFileCapabilities');
  }
  newFileContentHints(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newFileContentHints');
  }
  newFileContentHintsThumbnail(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newFileContentHintsThumbnail');
  }
  newFileImageMediaMetadata(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newFileImageMediaMetadata');
  }
  newFileImageMediaMetadataLocation(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newFileImageMediaMetadataLocation');
  }
  newFileLabelInfo(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newFileLabelInfo');
  }
  newFileLinkShareMetadata(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newFileLinkShareMetadata');
  }
  newFileShortcutDetails(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newFileShortcutDetails');
  }
  newFileVideoMediaMetadata(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newFileVideoMediaMetadata');
  }
  newLabel(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newLabel');
  }
  newLabelFieldModification(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newLabelFieldModification');
  }
  newLabelModification(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newLabelModification');
  }
  newModifyLabelsRequest(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newModifyLabelsRequest');
  }
  newPermission(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newPermission');
  }
  newPermissionPermissionDetails(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newPermissionPermissionDetails');
  }
  newPermissionTeamDrivePermissionDetails(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newPermissionTeamDrivePermissionDetails');
  }
  newReply(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newReply');
  }
  newRevision(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newRevision');
  }
  newTeamDrive(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newTeamDrive');
  }
  newTeamDriveBackgroundImageFile(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newTeamDriveBackgroundImageFile');
  }
  newTeamDriveCapabilities(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newTeamDriveCapabilities');
  }
  newTeamDriveRestrictions(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newTeamDriveRestrictions');
  }
  newUser(...args: unknown[]): never {
    throw new GasPNotImplementedError('Drive', 'newUser');
  }
}
