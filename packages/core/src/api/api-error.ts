import axios from "axios";

/** Error envelope returned by WeddingPlannerServer: `{ success: false, message, details? }`. */
interface ApiErrorBody {
  success: false;
  message: string;
  details?: Record<string, unknown>;
}

export type ApiErrorKind = "http" | "network" | "timeout" | "canceled";

/** One error shape for every failed request, so pages never inspect Axios internals. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** HTTP status for `kind: "http"`, otherwise undefined. */
  readonly status?: number;
  readonly details?: Record<string, unknown>;

  constructor(kind: ApiErrorKind, message: string, status?: number, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.details = details;
  }

  /** A numeric detail sent by the server, e.g. `retryAfterSeconds` or `attemptsRemaining`. */
  numberDetail(key: string): number | undefined {
    const value = this.details?.[key];
    return typeof value === "number" ? value : undefined;
  }

  /** A string-array detail sent by the server, e.g. `missingFields`. */
  stringListDetail(key: string): string[] {
    const value = this.details?.[key];
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
  }
}

function isApiErrorBody(data: unknown): data is ApiErrorBody {
  return typeof data === "object" && data !== null && typeof (data as ApiErrorBody).message === "string";
}

/** First field-level message from a validation error, falling back to the server's message. */
function messageFor(body: ApiErrorBody): string {
  const issues = body.details?.issues;
  if (Array.isArray(issues) && typeof issues[0]?.message === "string") return issues[0].message;
  return body.message;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isCancel(error)) return new ApiError("canceled", "Request was cancelled.");

  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return new ApiError("timeout", "The server took too long to respond. Please try again.");
    }

    const response = error.response;
    if (!response) {
      return new ApiError("network", "Can't reach the server. Check your connection and try again.");
    }

    if (isApiErrorBody(response.data)) {
      return new ApiError("http", messageFor(response.data), response.status, response.data.details);
    }

    return new ApiError("http", "Something went wrong. Please try again.", response.status);
  }

  return new ApiError("network", "Something went wrong. Please try again.");
}

export function isCanceled(error: unknown): boolean {
  return error instanceof ApiError ? error.kind === "canceled" : axios.isCancel(error);
}
