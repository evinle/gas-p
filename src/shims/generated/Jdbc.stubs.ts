import { GasPNotImplementedError } from '../../errors.js';

export abstract class JdbcStubs {
  getCloudSqlConnection(...args: unknown[]): never {
    throw new GasPNotImplementedError('Jdbc', 'getCloudSqlConnection');
  }
  getConnection(...args: unknown[]): never {
    throw new GasPNotImplementedError('Jdbc', 'getConnection');
  }
  newDate(...args: unknown[]): never {
    throw new GasPNotImplementedError('Jdbc', 'newDate');
  }
  newTime(...args: unknown[]): never {
    throw new GasPNotImplementedError('Jdbc', 'newTime');
  }
  newTimestamp(...args: unknown[]): never {
    throw new GasPNotImplementedError('Jdbc', 'newTimestamp');
  }
  parseDate(...args: unknown[]): never {
    throw new GasPNotImplementedError('Jdbc', 'parseDate');
  }
  parseTime(...args: unknown[]): never {
    throw new GasPNotImplementedError('Jdbc', 'parseTime');
  }
  parseTimestamp(...args: unknown[]): never {
    throw new GasPNotImplementedError('Jdbc', 'parseTimestamp');
  }
}
