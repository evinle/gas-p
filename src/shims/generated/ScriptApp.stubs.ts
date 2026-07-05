import { GasPNotImplementedError } from '../../errors.js';

export abstract class ScriptAppStubs {
  deleteTrigger(...args: unknown[]): never {
    throw new GasPNotImplementedError('ScriptApp', 'deleteTrigger');
  }
  getAuthorizationInfo(...args: unknown[]): never {
    throw new GasPNotImplementedError('ScriptApp', 'getAuthorizationInfo');
  }
  getIdentityToken(...args: unknown[]): never {
    throw new GasPNotImplementedError('ScriptApp', 'getIdentityToken');
  }
  getInstallationSource(...args: unknown[]): never {
    throw new GasPNotImplementedError('ScriptApp', 'getInstallationSource');
  }
  getOAuthToken(...args: unknown[]): never {
    throw new GasPNotImplementedError('ScriptApp', 'getOAuthToken');
  }
  getProjectTriggers(...args: unknown[]): never {
    throw new GasPNotImplementedError('ScriptApp', 'getProjectTriggers');
  }
  getScriptId(...args: unknown[]): never {
    throw new GasPNotImplementedError('ScriptApp', 'getScriptId');
  }
  getService(...args: unknown[]): never {
    throw new GasPNotImplementedError('ScriptApp', 'getService');
  }
  getUserTriggers(...args: unknown[]): never {
    throw new GasPNotImplementedError('ScriptApp', 'getUserTriggers');
  }
  invalidateAuth(...args: unknown[]): never {
    throw new GasPNotImplementedError('ScriptApp', 'invalidateAuth');
  }
  newStateToken(...args: unknown[]): never {
    throw new GasPNotImplementedError('ScriptApp', 'newStateToken');
  }
  newTrigger(...args: unknown[]): never {
    throw new GasPNotImplementedError('ScriptApp', 'newTrigger');
  }
  requireAllScopes(...args: unknown[]): never {
    throw new GasPNotImplementedError('ScriptApp', 'requireAllScopes');
  }
  requireScopes(...args: unknown[]): never {
    throw new GasPNotImplementedError('ScriptApp', 'requireScopes');
  }
  getProjectKey(...args: unknown[]): never {
    throw new GasPNotImplementedError('ScriptApp', 'getProjectKey');
  }
  getScriptTriggers(...args: unknown[]): never {
    throw new GasPNotImplementedError('ScriptApp', 'getScriptTriggers');
  }
}
