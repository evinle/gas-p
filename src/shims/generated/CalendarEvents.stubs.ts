import { GasPNotImplementedError } from '../../errors.js';

export abstract class CalendarEventsStubs {
  get(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarEvents', 'get');
  }
  import(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarEvents', 'import');
  }
  insert(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarEvents', 'insert');
  }
  instances(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarEvents', 'instances');
  }
  list(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarEvents', 'list');
  }
  move(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarEvents', 'move');
  }
  patch(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarEvents', 'patch');
  }
  quickAdd(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarEvents', 'quickAdd');
  }
  remove(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarEvents', 'remove');
  }
  update(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarEvents', 'update');
  }
  watch(...args: unknown[]): never {
    throw new GasPNotImplementedError('CalendarEvents', 'watch');
  }
}
