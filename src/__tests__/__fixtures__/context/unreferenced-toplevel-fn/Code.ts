import { greetingFor } from './Utils';

function doGet() {
  return 'unused by anything else in this bundle';
}

function getGreeting(name: string) {
  return greetingFor(name);
}
