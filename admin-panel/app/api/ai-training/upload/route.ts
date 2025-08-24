import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'فایل آموزش AI ارسال نشده است' },
        { status: 400 }
      );
    }

    // Validate file type for AI training
    const allowedTypes = [
      'text/csv',
      'application/json',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'فرمت فایل باید CSV, JSON, TXT یا Excel باشد' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'حجم فایل نباید بیشتر از 50 مگابایت باشد' },
        { status: 400 }
      );
    }

    // Mock implementation - در پروژه واقعی فایل را پردازش کنید
    const fileName = `ai_training_${Date.now()}_${file.name}`;
    const uploadResult = {
      success: true,
      filename: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      trainingId: `train_${Date.now()}`,
      status: 'uploaded',
      uploadedAt: new Date().toISOString()
    };

    return NextResponse.json(uploadResult);
  } catch (error) {
    console.error('Error uploading AI training file:', error);
    return NextResponse.json(
      { error: 'خطا در آپلود فایل آموزش AI' },
      { status: 500 }
    );
  }
}
