import { GasPNotImplementedError } from '../../errors.js';

export abstract class ContactsAppStubs {
  createContact(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'createContact');
  }
  createContactGroup(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'createContactGroup');
  }
  deleteContact(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'deleteContact');
  }
  deleteContactGroup(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'deleteContactGroup');
  }
  getContact(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'getContact');
  }
  getContactById(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'getContactById');
  }
  getContactGroup(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'getContactGroup');
  }
  getContactGroupById(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'getContactGroupById');
  }
  getContactGroups(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'getContactGroups');
  }
  getContacts(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'getContacts');
  }
  getContactsByAddress(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'getContactsByAddress');
  }
  getContactsByCompany(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'getContactsByCompany');
  }
  getContactsByCustomField(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'getContactsByCustomField');
  }
  getContactsByDate(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'getContactsByDate');
  }
  getContactsByEmailAddress(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'getContactsByEmailAddress');
  }
  getContactsByGroup(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'getContactsByGroup');
  }
  getContactsByIM(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'getContactsByIM');
  }
  getContactsByJobTitle(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'getContactsByJobTitle');
  }
  getContactsByName(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'getContactsByName');
  }
  getContactsByNotes(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'getContactsByNotes');
  }
  getContactsByPhone(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'getContactsByPhone');
  }
  getContactsByUrl(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'getContactsByUrl');
  }
  findByEmailAddress(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'findByEmailAddress');
  }
  findContactGroup(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'findContactGroup');
  }
  getAllContacts(...args: unknown[]): never {
    throw new GasPNotImplementedError('ContactsApp', 'getAllContacts');
  }
}
