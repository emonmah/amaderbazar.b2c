import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const { tag, path, secret } = await request.json();

    // Verify revalidation secret
    if (secret !== (process.env.REVALIDATION_SECRET || 'isr_revalidate_secret')) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({ revalidated: true, tag, now: Date.now() });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path, now: Date.now() });
    }

    return NextResponse.json({ message: 'Missing tag or path' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
