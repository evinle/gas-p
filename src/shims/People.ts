import { AdvancedPeopleStubs } from './generated/AdvancedPeople.stubs.js';
import { PeopleContactGroupsStubs } from './generated/PeopleContactGroups.stubs.js';
import { PeopleContactGroupsMembersStubs } from './generated/PeopleContactGroupsMembers.stubs.js';
import { PeopleOtherContactsStubs } from './generated/PeopleOtherContacts.stubs.js';
import { PeoplePeopleStubs } from './generated/PeoplePeople.stubs.js';
import { PeoplePeopleConnectionsStubs } from './generated/PeoplePeopleConnections.stubs.js';

// Composes the advanced People service's sub-collections onto its own
// (otherwise-empty) method surface — see #45. Stub-only, Local mode only, no
// Live-mode Google API bridging: every method throws GasPNotImplementedError
// until a matching Declared Fixture answers it.
//
// Unlike Calendar, two of People's collections nest one further collection
// of their own (ContactGroups.Members, People.Connections) — see calendar_v3
// vs peopleapi_v1's shape. Composition goes two levels deep here.
//
// Every class stays named after stubTargets.ts's outputName (matching
// findImplementedMethods' name-based lookup) — only the final export is
// aliased to the sandbox-facing name 'People'.
class PeopleContactGroupsMembers extends PeopleContactGroupsMembersStubs {}

class PeopleContactGroups extends PeopleContactGroupsStubs {
  Members = new PeopleContactGroupsMembers();
}

class PeopleOtherContacts extends PeopleOtherContactsStubs {}

class PeoplePeopleConnections extends PeoplePeopleConnectionsStubs {}

class PeoplePeople extends PeoplePeopleStubs {
  Connections = new PeoplePeopleConnections();
}

class AdvancedPeople extends AdvancedPeopleStubs {
  ContactGroups = new PeopleContactGroups();
  OtherContacts = new PeopleOtherContacts();
  People = new PeoplePeople();
}

const instance = new AdvancedPeople();
export { instance as People };
