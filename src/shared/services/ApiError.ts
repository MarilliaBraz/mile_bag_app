/**
 * Espelha o corpo application/problem+json (RFC 7807) devolvido por
 * GlobalExceptionHandler no back-end (mile_bag_api).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly tipo?: string;

  constructor(status: number, detail: string, tipo?: string) {
    super(detail);
    this.status = status;
    this.tipo = tipo;
  }
}
