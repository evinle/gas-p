import { GasPNotImplementedError } from '../../errors.js';

export abstract class PeoplePeopleConnectionsStubs {
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('PeoplePeopleConnections', 'list');
  }
}
