import { DriveStubs } from './generated/Drive.stubs.js';
import { DriveAboutStubs } from './generated/DriveAbout.stubs.js';
import { DriveAppsStubs } from './generated/DriveApps.stubs.js';
import { DriveChangesStubs } from './generated/DriveChanges.stubs.js';
import { DriveChannelsStubs } from './generated/DriveChannels.stubs.js';
import { DriveCommentsStubs } from './generated/DriveComments.stubs.js';
import { DriveDrivesStubs } from './generated/DriveDrives.stubs.js';
import { DriveFilesStubs } from './generated/DriveFiles.stubs.js';
import { DriveOperationStubs } from './generated/DriveOperation.stubs.js';
import { DriveOperationsStubs } from './generated/DriveOperations.stubs.js';
import { DrivePermissionsStubs } from './generated/DrivePermissions.stubs.js';
import { DriveRepliesStubs } from './generated/DriveReplies.stubs.js';
import { DriveRevisionsStubs } from './generated/DriveRevisions.stubs.js';
import { DriveTeamdrivesStubs } from './generated/DriveTeamdrives.stubs.js';

// Composes the advanced Drive service's sub-collections onto its own
// (otherwise-empty) method surface — see #45. Stub-only, Local mode only, no
// Live-mode Google API bridging: every method throws GasPNotImplementedError
// until a matching Declared Fixture answers it. Distinct from the basic
// DriveApp — same relationship as CalendarApp/Calendar (see README).
//
// Comments/Permissions/Revisions nest under Files, and Replies nests one
// further under Comments, matching the real Drive REST API's
// files.comments.replies resource shape (see #54) — same two-levels-deep
// composition as People's ContactGroups.Members/People.Connections.
class DriveAbout extends DriveAboutStubs {}
class DriveApps extends DriveAppsStubs {}
class DriveChanges extends DriveChangesStubs {}
class DriveChannels extends DriveChannelsStubs {}
class DriveDrives extends DriveDrivesStubs {}
class DriveOperation extends DriveOperationStubs {}
class DriveOperations extends DriveOperationsStubs {}
class DriveTeamdrives extends DriveTeamdrivesStubs {}

class DriveReplies extends DriveRepliesStubs {}

class DriveComments extends DriveCommentsStubs {
  Replies = new DriveReplies();
}

class DrivePermissions extends DrivePermissionsStubs {}
class DriveRevisions extends DriveRevisionsStubs {}

class DriveFiles extends DriveFilesStubs {
  Comments = new DriveComments();
  Permissions = new DrivePermissions();
  Revisions = new DriveRevisions();
}

class Drive extends DriveStubs {
  About = new DriveAbout();
  Apps = new DriveApps();
  Changes = new DriveChanges();
  Channels = new DriveChannels();
  Drives = new DriveDrives();
  Files = new DriveFiles();
  Operation = new DriveOperation();
  Operations = new DriveOperations();
  Teamdrives = new DriveTeamdrives();
}

const instance = new Drive();
export { instance as Drive };
