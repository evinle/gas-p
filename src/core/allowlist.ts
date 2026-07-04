export class GasPResourceNotAllowedError extends Error {
  constructor(service: string, id: string) {
    super(
      `${service} resource "${id}" is not declared in devResourceIds.${service} — add it to gas-p.config.ts to allow Live mode access.`
    );
    this.name = 'GasPResourceNotAllowedError';
  }
}

export function assertResourceAllowed(
  devResourceIds: Record<string, string[]> | undefined,
  service: string,
  id: string
): void {
  const allowed = devResourceIds?.[service] ?? [];
  if (!allowed.includes(id)) {
    throw new GasPResourceNotAllowedError(service, id);
  }
}
