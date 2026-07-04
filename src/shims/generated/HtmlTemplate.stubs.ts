import { GasPNotImplementedError } from '../../errors.js';

export const HtmlTemplateStubs = {
  getCode(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlTemplate', 'getCode');
  },
  getCodeWithComments(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlTemplate', 'getCodeWithComments');
  },
  getRawContent(...args: unknown[]): never {
    throw new GasPNotImplementedError('HtmlTemplate', 'getRawContent');
  },
};
