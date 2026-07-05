import { GasPNotImplementedError } from '../../errors.js';

export abstract class GroupsAppStubs {
  getGroupByEmail(...args: unknown[]): never {
    throw new GasPNotImplementedError('GroupsApp', 'getGroupByEmail');
  }
  getGroups(...args: unknown[]): never {
    throw new GasPNotImplementedError('GroupsApp', 'getGroups');
  }
}
