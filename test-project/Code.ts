import { greetingFor } from './Utils';

function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate();
}

function getGreeting(name: string) {
  return greetingFor(name);
}
