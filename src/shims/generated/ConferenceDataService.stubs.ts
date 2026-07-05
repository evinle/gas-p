import { GasPNotImplementedError } from '../../errors.js';

export abstract class ConferenceDataServiceStubs {
  newConferenceDataBuilder(...args: unknown[]): never {
    throw new GasPNotImplementedError('ConferenceDataService', 'newConferenceDataBuilder');
  }
  newConferenceError(...args: unknown[]): never {
    throw new GasPNotImplementedError('ConferenceDataService', 'newConferenceError');
  }
  newConferenceParameter(...args: unknown[]): never {
    throw new GasPNotImplementedError('ConferenceDataService', 'newConferenceParameter');
  }
  newEntryPoint(...args: unknown[]): never {
    throw new GasPNotImplementedError('ConferenceDataService', 'newEntryPoint');
  }
}
