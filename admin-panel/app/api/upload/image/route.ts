import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'فایل تصویر ارسال نشده است' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'فرمت فایل باید تصویر باشد (JPG, PNG, WebP, GIF)' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'حجم فایل نباید بیشتر از 5 مگابایت باشد' },
        { status: 400 }
      );
    }

    // Mock implementation - در پروژه واقعی فایل را ذخیره کنید
    const fileName = `image_${Date.now()}_${file.name}`;
    const uploadResult = {
      success: true,
      filename: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      url: `/uploads/images/${fileName}`, // Mock URL
      uploadedAt: new Date().toISOString()
    };

    return NextResponse.json(uploadResult);
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'خطا در آپلود تصویر' },
      { status: 500 }
    );
  }
}
