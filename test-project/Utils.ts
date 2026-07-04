export function greetingFor(name: string): string {
  return 'Hello, ' + name + '! The time is ' + new Date().toISOString();
}
