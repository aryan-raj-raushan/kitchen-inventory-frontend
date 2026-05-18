import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/withAuth';
import { errorResponse } from '@/lib/apiResponse';
import { saveUploadedFile } from '@/lib/upload';

export const POST = withAuth(async (req: NextRequest): Promise<NextResponse> => {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    const imageUrl = await saveUploadedFile(file);
    return NextResponse.json({ imageUrl }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && (err.message.includes('Unsupported') || err.message.includes('too large'))) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return errorResponse(err);
  }
});
