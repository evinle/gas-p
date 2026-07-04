import { noop } from './Utils';

function doGet() {
  noop();
  return someUndeclaredService.doThing();
}
