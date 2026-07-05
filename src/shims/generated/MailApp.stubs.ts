import { GasPNotImplementedError } from '../../errors.js';

export abstract class MailAppStubs {
  getRemainingDailyQuota(...args: unknown[]): never {
    throw new GasPNotImplementedError('MailApp', 'getRemainingDailyQuota');
  }
  sendEmail(...args: unknown[]): never {
    throw new GasPNotImplementedError('MailApp', 'sendEmail');
  }
}
