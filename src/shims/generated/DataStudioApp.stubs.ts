import { GasPNotImplementedError } from '../../errors.js';

export abstract class DataStudioAppStubs {
  createCommunityConnector(...args: unknown[]): never {
    throw new GasPNotImplementedError('DataStudioApp', 'createCommunityConnector');
  }
}
