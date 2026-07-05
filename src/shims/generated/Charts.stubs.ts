import { GasPNotImplementedError } from '../../errors.js';

export abstract class ChartsStubs {
  newAreaChart(...args: unknown[]): never {
    throw new GasPNotImplementedError('Charts', 'newAreaChart');
  }
  newBarChart(...args: unknown[]): never {
    throw new GasPNotImplementedError('Charts', 'newBarChart');
  }
  newColumnChart(...args: unknown[]): never {
    throw new GasPNotImplementedError('Charts', 'newColumnChart');
  }
  newDataTable(...args: unknown[]): never {
    throw new GasPNotImplementedError('Charts', 'newDataTable');
  }
  newDataViewDefinition(...args: unknown[]): never {
    throw new GasPNotImplementedError('Charts', 'newDataViewDefinition');
  }
  newLineChart(...args: unknown[]): never {
    throw new GasPNotImplementedError('Charts', 'newLineChart');
  }
  newPieChart(...args: unknown[]): never {
    throw new GasPNotImplementedError('Charts', 'newPieChart');
  }
  newScatterChart(...args: unknown[]): never {
    throw new GasPNotImplementedError('Charts', 'newScatterChart');
  }
  newTableChart(...args: unknown[]): never {
    throw new GasPNotImplementedError('Charts', 'newTableChart');
  }
  newTextStyle(...args: unknown[]): never {
    throw new GasPNotImplementedError('Charts', 'newTextStyle');
  }
}
