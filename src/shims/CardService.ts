import { CardServiceStubs } from './generated/CardService.stubs.js';

class CardService extends CardServiceStubs {}

const instance = new CardService();
export { instance as CardService };
