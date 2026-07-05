import { GasPNotImplementedError } from '../../errors.js';

export abstract class CalendarStubs {
  createAllDayEvent(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'createAllDayEvent');
  }
  createAllDayEventSeries(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'createAllDayEventSeries');
  }
  createEventFromDescription(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'createEventFromDescription');
  }
  createEventSeries(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'createEventSeries');
  }
  deleteCalendar(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'deleteCalendar');
  }
  getColor(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'getColor');
  }
  getDescription(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'getDescription');
  }
  getEventById(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'getEventById');
  }
  getEventSeriesById(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'getEventSeriesById');
  }
  getEventsForDay(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'getEventsForDay');
  }
  getId(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'getId');
  }
  getName(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'getName');
  }
  getTimeZone(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'getTimeZone');
  }
  isHidden(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'isHidden');
  }
  isMyPrimaryCalendar(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'isMyPrimaryCalendar');
  }
  isOwnedByMe(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'isOwnedByMe');
  }
  isSelected(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'isSelected');
  }
  setColor(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'setColor');
  }
  setDescription(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'setDescription');
  }
  setHidden(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'setHidden');
  }
  setName(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'setName');
  }
  setSelected(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'setSelected');
  }
  setTimeZone(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'setTimeZone');
  }
  unsubscribeFromCalendar(...args: unknown[]): never {
    throw new GasPNotImplementedError('Calendar', 'unsubscribeFromCalendar');
  }
}
