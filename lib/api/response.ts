import { NextResponse } from "next/server";

export type ApiSuccess<T> = T;

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId: string;
  };
};

export function ok<T>(requestId: string, data: T, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(data, {
    status,
    headers: {
      "x-request-id": requestId
    }
  });
}

export function fail(
  requestId: string,
  code: string,
  message: string,
  status = 400,
  details?: unknown
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error: { code, message, details, requestId }
    },
    { status }
  );
}
