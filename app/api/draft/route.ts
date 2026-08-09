/* eslint-disable @typescript-eslint/naming-convention -- Next.js route handlers */
import { z } from 'zod';
import { jsonError, jsonOk, zodErrorMessage } from '@/lib/api/http';
import { getGlobalDraft, saveGlobalDraft } from '@/lib/store/draft';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const draftBodySchema = z.object({
  content: z.string(),
});

export async function GET() {
  try {
    const content = await getGlobalDraft();

    return jsonOk({ content });
  } catch {
    return jsonError('Failed to load draft', { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = draftBodySchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(zodErrorMessage(parsed.error), { status: 400 });
    }

    await saveGlobalDraft(parsed.data.content);

    return jsonOk({});
  } catch {
    return jsonError('Failed to save draft', { status: 500 });
  }
}
