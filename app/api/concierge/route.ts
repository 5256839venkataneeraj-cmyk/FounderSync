import { NextRequest } from 'next/server';
import { POST as contactPost, OPTIONS as contactOptions } from '../contact/route';

export const runtime = 'nodejs';

/**
 * Legacy/Alternative alias for /api/contact.
 * Delegates directly to the comprehensive Gmail API contact route.
 */
export async function POST(req: NextRequest) {
  return contactPost(req);
}

export async function OPTIONS(req: NextRequest) {
  return contactOptions(req);
}
