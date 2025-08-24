import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'فایل ترجمه ارسال نشده است' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.json')) {
      return NextResponse.json(
        { error: 'فرمت فایل باید JSON باشد' },
        { status: 400 }
      );
    }

    // Read file content
    const content = await file.text();
    
    try {
      JSON.parse(content); // Validate JSON format
    } catch (error) {
      return NextResponse.json(
        { error: 'فرمت JSON فایل صحیح نیست' },
        { status: 400 }
      );
    }

    // Mock implementation - در پروژه واقعی فایل را ذخیره کنید
    const uploadResult = {
      success: true,
      filename: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString()
    };

    return NextResponse.json(uploadResult);
  } catch (error) {
    console.error('Error uploading translation file:', error);
    return NextResponse.json(
      { error: 'خطا در آپلود فایل ترجمه' },
      { status: 500 }
    );
  }
}
