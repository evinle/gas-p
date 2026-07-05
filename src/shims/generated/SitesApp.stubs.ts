import { GasPNotImplementedError } from '../../errors.js';

export abstract class SitesAppStubs {
  copySite(...args: unknown[]): never {
    throw new GasPNotImplementedError('SitesApp', 'copySite');
  }
  createSite(...args: unknown[]): never {
    throw new GasPNotImplementedError('SitesApp', 'createSite');
  }
  getActivePage(...args: unknown[]): never {
    throw new GasPNotImplementedError('SitesApp', 'getActivePage');
  }
  getActiveSite(...args: unknown[]): never {
    throw new GasPNotImplementedError('SitesApp', 'getActiveSite');
  }
  getAllSites(...args: unknown[]): never {
    throw new GasPNotImplementedError('SitesApp', 'getAllSites');
  }
  getPageByUrl(...args: unknown[]): never {
    throw new GasPNotImplementedError('SitesApp', 'getPageByUrl');
  }
  getSite(...args: unknown[]): never {
    throw new GasPNotImplementedError('SitesApp', 'getSite');
  }
  getSiteByUrl(...args: unknown[]): never {
    throw new GasPNotImplementedError('SitesApp', 'getSiteByUrl');
  }
  getSites(...args: unknown[]): never {
    throw new GasPNotImplementedError('SitesApp', 'getSites');
  }
}
