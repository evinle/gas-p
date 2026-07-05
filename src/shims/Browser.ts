import { BrowserStubs } from './generated/Browser.stubs.js';

class Browser extends BrowserStubs {}

const instance = new Browser();
export { instance as Browser };
