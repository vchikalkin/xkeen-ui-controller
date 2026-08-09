import { NextResponse } from 'next/server';
import type { ZodError } from 'zod';

interface InlineInterface { status?: number }
export function jsonOk(
  data: Record<string, unknown>,
  { status = 200 }: InlineInterface = {},
): NextResponse {
  return NextResponse.json({ success: true, ...data }, { status });
}

interface InlineInterface2 { status?: number }
export function jsonError(
  error: string,
  { status = 400 }: InlineInterface2 = {},
): NextResponse {
  return NextResponse.json({ success: false, error }, { status });
}

export function zodErrorMessage(error: ZodError): string {
  return error.issues.map((issue) => issue.message).join('; ') || 'Validation failed';
}
