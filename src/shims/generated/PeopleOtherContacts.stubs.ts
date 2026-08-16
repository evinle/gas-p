import { GasPNotImplementedError } from '../../errors.js';

export abstract class PeopleOtherContactsStubs {
  copyOtherContactToMyContactsGroup(...args: unknown[]): never {
    throw new GasPNotImplementedError('PeopleOtherContacts', 'copyOtherContactToMyContactsGroup');
  }
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('PeopleOtherContacts', 'list');
  }
  search(...args: unknown[]): never {
    throw new GasPNotImplementedError('PeopleOtherContacts', 'search');
  }
}
